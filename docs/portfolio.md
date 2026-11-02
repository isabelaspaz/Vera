# VERA — versão simplificada para portfólio

**Entenda o que você come.** A Vera usa uma foto da lista de ingredientes para estimar o grupo NOVA e explicar o motivo em uma frase.

O problema é interpretar informações técnicas da embalagem. A hipótese de valor é reduzir o esforço para entender o grau de processamento, com uma experiência de foto → classificação → explicação. Cadastro, perfis, restrições e chat foram retirados do escopo por aumentarem a complexidade da proposta.

A solução usa React Native/Expo no celular e Fastify no backend. O Gemini extrai e interpreta a composição internamente; regras validam qualidade, evidências e divergências. Quando faltam dados, o app se abstém. O resultado mostra apenas o grupo e uma frase, sem tela de ingredientes ou correção manual. O modo demo é identificado e usa exemplos fictícios.

Há 37 testes automatizados e verificação TypeScript. Ainda faltam execução física completa, chamadas reais, revisão científica e pesquisa com usuários. Não há alegação de precisão, superioridade competitiva ou segurança clínica. O briefing citava Desrotulando como referência; não foi concluído benchmark atual do concorrente.

Custos incluem duas operações de IA por foto e infraestrutura. Não há custo por análise medido. Avaliar tokens, latência, qualidade e preço vigente do modelo antes de escolher limites de uso. Não há pagamentos, publicidade ou modelo comercial validado.

Próximos passos: testar no iPhone/Android, avaliar imagens reais, revisar os grupos com referência humana e medir se a pessoa entende a explicação sem ajuda.

Roteiro de vídeo: apresentar uma embalagem difícil de interpretar; abrir a Vera; fotografar o rótulo; mostrar diretamente o grupo e a explicação; demonstrar uma leitura incerta; encerrar com arquitetura, testes e limitações. Se usar demo, anunciar que os dados são fictícios.
