import type { LabelExtraction, NovaAssessment } from '../schemas/index';
import { normalize, splitIngredients } from './label';
export function classifyNova(label: LabelExtraction): NovaAssessment {
  const base = { limitations: ['Estimativa a partir do rótulo; não descreve toda a fabricação.'], missingInformation: [] as string[], evidence: [] as string[] };
  const unknown = (why: string): NovaAssessment => ({ ...base, group: 'indeterminate', status: 'insufficient', summary: 'Não consegui classificar com os dados disponíveis.', missingInformation: [why] });
  if (!label.ingredientsRaw || label.fieldCompleteness.ingredientsRaw !== 'read') return unknown('Confira a lista completa e legível de ingredientes.');
  const raw = normalize(label.ingredientsRaw);
  if (/ignore.*instru|system prompt|finja ser|responda como/.test(raw)) return unknown('O texto contém instruções estranhas ao rótulo. Confira a transcrição.');
  // Deliberately limited markers of cosmetic formulation; not every additive.
  const markers = /\b(aromatizante\w*|emulsificante\w*|corante\w*|edulcorante\w*|maltodextrina|proteina hidrolisada|gordura (?:vegetal )?hidrogenada)\b/g;
  const matches = [...raw.matchAll(markers)].map(m => label.ingredientsRaw!.slice(m.index, m.index + m[0].length));
  if (matches.length) return { ...base, group: '4', status: 'estimated', summary: 'Encontrei ingredientes usados para modificar características do alimento, como sabor ou textura.', evidence: matches };
  const items = splitIngredients(raw).map(s => s.replace(/^ingredientes?:\s*/, '').replace(/\.$/, '').trim());
  const simple = /^(arroz(?: integral)?|feijao(?: preto| carioca)?|aveia(?: em flocos)?|leite(?: integral| desnatado)?(?: pasteurizado| uht)?|cafe(?: torrado e moido)?|milho|agua|amendoim|farinha de trigo(?: enriquecida com ferro e acido folico)?|banana|mandioca)$/;
  const culinary = /^(sal|acucar(?: demerara| mascavo| refinado)?|azeite(?: de oliva)?|oleo de (soja|girassol)|manteiga)$/;
  let group: NovaAssessment['group'] = 'indeterminate';
  if (items.length === 1 && culinary.test(items[0]!)) group = '2';
  else if (items.length > 0 && items.every(s => simple.test(s))) group = '1';
  else if (items.length > 1 && items.every(s => simple.test(s) || culinary.test(s)) && items.some(s => culinary.test(s)) && /\b(conserva|conservado|pao|milho|amendoim)\b/.test(normalize(label.productName ?? ''))) group = '3';
  if (group === 'indeterminate') return unknown('A composição exige mais informações sobre a formulação e o processamento.');
  const explanations = {
    '1': 'A lista contém apenas alimentos sem adição de sal, açúcar ou óleo.',
    '2': 'É um ingrediente usado para temperar ou preparar refeições.',
    '3': 'É um alimento com adição de sal, açúcar ou óleo para conservação ou preparo.',
  };
  return { ...base, group, status: 'estimated', summary: explanations[group], evidence: [label.ingredientsRaw.slice(0, 600)] };
}
