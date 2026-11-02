export const GUIDE_URL = 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf';
export const GUIDE_SOURCE = 'Ministério da Saúde • Guia Alimentar, 2ª edição, 2014 • capítulo 2';
export const novaNames = {
  '1': 'In natura ou minimamente processado', '2': 'Ingrediente culinário processado',
  '3': 'Processado', '4': 'Ultraprocessado', indeterminate: 'Ainda não foi possível classificar',
} as const;
// Fixed editorial paraphrases. Provider output never replaces this catalog.
export const guideCatalog = Object.freeze({
  '1': 'Faça de alimentos in natura ou minimamente processados a base da alimentação.',
  '2': 'Use ingredientes culinários processados em pequenas quantidades no preparo das refeições.',
  '3': 'Limite o consumo de alimentos processados.',
  '4': 'Evite o consumo de alimentos ultraprocessados.',
  indeterminate: 'É necessário entender melhor a composição e o processamento antes de relacionar este alimento a um grupo.',
});
