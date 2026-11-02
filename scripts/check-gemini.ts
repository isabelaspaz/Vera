import { createGemini, ProviderError } from '../apps/api/src/services/gemini/provider';
import { validateNova } from '../apps/api/src/services/nova/validate';
import type { LabelExtraction } from '@vera/shared';

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error('Preencha GEMINI_API_KEY em apps/api/.env antes de testar a IA.');
  process.exitCode = 1;
} else {
  const label: LabelExtraction = {
    productName: 'Arroz branco', ingredientsRaw: 'Arroz', ingredients: ['Arroz'],
    fieldCompleteness: { productName: 'read', ingredientsRaw: 'read' }, extractionWarnings: [],
  };
  try {
    const provider = createGemini(apiKey, process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite');
    const assessment = validateNova(label, await provider.classify(label));
    if (assessment.group !== '1') throw new Error('A IA respondeu, mas o resultado precisa ser revisto.');
    console.info(JSON.stringify({ provider: 'Gemini', connected: true, group: assessment.group, summary: assessment.summary }));
  } catch (error) {
    console.error(error instanceof ProviderError ? `Não foi possível validar a conexão com Gemini: ${error.code}.` : 'Não foi possível validar a classificação da IA.');
    process.exitCode = 1;
  }
}
