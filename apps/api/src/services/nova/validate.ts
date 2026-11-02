import { classifyNova, normalize, novaNames, type LabelExtraction, type NovaAssessment } from '@vera/shared';
// The AI estimates the group; incomplete labels, invented evidence and conflicts abstain.
export function validateNova(label: LabelExtraction, candidate: NovaAssessment): NovaAssessment {
  const deterministic = classifyNova(label);
  const unknown = (why: string): NovaAssessment => ({
    group: 'indeterminate', status: 'insufficient', summary: 'Não consegui classificar com os dados disponíveis.',
    evidence: [], missingInformation: [why], limitations: deterministic.limitations,
  });
  if (!label.ingredientsRaw || label.fieldCompleteness.ingredientsRaw !== 'read') return unknown('Preciso de uma lista completa e legível de ingredientes.');
  if (/ignore.*instru|system prompt|finja ser|responda como/.test(normalize(label.ingredientsRaw))) return unknown('Confira a leitura: há texto estranho à lista de ingredientes.');
  if (candidate.group === 'indeterminate' || candidate.status !== 'estimated') return unknown('A IA não encontrou informação suficiente sobre a formulação e o processamento.');
  const literalEvidence = candidate.evidence.filter(e => e.trim().length >= 3 && label.ingredientsRaw!.includes(e));
  if (!literalEvidence.length || literalEvidence.length !== candidate.evidence.length) return unknown('Não consegui confirmar a evidência da classificação no rótulo.');
  if (deterministic.group !== 'indeterminate' && candidate.group !== deterministic.group) return unknown('Há divergência na interpretação da composição. Confira os ingredientes.');
  // Keep explanations about processing, never clinical advice or safety guarantees.
  const unsafeSummary = /segur|liberad|alerg|dieta|diagnost|prescrev|por semana/.test(normalize(candidate.summary));
  return {
    ...candidate, evidence: literalEvidence,
    summary: unsafeSummary ? `A composição lida é compatível com ${novaNames[candidate.group].toLowerCase()}.` : candidate.summary,
    limitations: deterministic.limitations,
  };
}
