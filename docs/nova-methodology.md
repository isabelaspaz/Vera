# Classificação NOVA

A referência principal é o [Guia Alimentar para a População Brasileira, 2ª edição, Ministério da Saúde, 2014](https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf), capítulo 2. Referência complementar: [Monteiro et al., 2019, Ultra-processed foods: what they are and how to identify them](https://doi.org/10.1017/S1368980018003762).

| Grupo | Resultado mostrado |
| --- | --- |
| NOVA 1 | In natura ou minimamente processado |
| NOVA 2 | Ingrediente culinário processado |
| NOVA 3 | Processado |
| NOVA 4 | Ultraprocessado |
| Indeterminado | Ainda não foi possível classificar |

O Gemini considera identidade, formulação, função de ingredientes e informações disponíveis de processamento. Não deve decidir pela contagem de ingredientes nem considerar qualquer aditivo como marcador de ultraprocessamento. A resposta tem schema, explicação curta e trechos literais.

Regras locais reconhecem um vocabulário pequeno de ingredientes básicos, ingredientes culinários, formulações simples e marcadores de formulação. Servem ao demo e à identificação de divergências com a IA. No modo real, formulações novas podem receber uma estimativa do Gemini; o backend exige ingredientes legíveis e evidências presentes no texto. Não força um grupo quando o modelo se abstém.

A ligação literal entre evidência e rótulo não demonstra que a inferência NOVA está correta. A transcrição pode conter erro e o rótulo pode omitir o processamento. A estimativa exige avaliação futura com imagens reais e referência revisada por pessoas qualificadas.

O catálogo do Guia é fixo e permanece como referência interna, sem seção extra na tela de resultado. Não há notas nutricionais nem frequências semanais inventadas. NOVA descreve processamento, não segurança para consumo ou adequação clínica individual.
