# VERA — versão simplificada para portfólio

**Entenda o que você come.** A Vera usa uma foto da lista de ingredientes para estimar o grupo NOVA e explicar o motivo em uma frase.

O problema é interpretar informações técnicas da embalagem. A hipótese de valor é reduzir o esforço para entender o grau de processamento, com uma experiência de foto → classificação → explicação. Cadastro, perfis, restrições e chat foram retirados do escopo por aumentarem a complexidade da proposta.

A solução usa React Native/Expo no celular e Fastify no backend. O Gemini extrai e interpreta a composição internamente; regras validam qualidade, evidências e divergências. Quando faltam dados, o app se abstém. O resultado mostra apenas o grupo e uma frase, sem tela de ingredientes ou correção manual. O fluxo usa exclusivamente IA pelo backend; não há modo demo ou resultados fictícios no aplicativo.

Há 85 testes automatizados e verificação TypeScript. A interface usa cores pastel, cards arredondados e uma tela inicial direta, sem ilustração, mantendo as quatro telas do fluxo. A conexão real com Gemini foi verificada com texto e extração/classificação de uma imagem sintética pelo túnel do Expo. Ainda faltam execução física completa, avaliação de embalagens reais, revisão científica e pesquisa com usuários. Não há alegação de precisão, superioridade competitiva ou segurança clínica. O briefing citava Desrotulando como referência; não foi concluído benchmark atual do concorrente.

Custos incluem duas operações de IA por foto e infraestrutura. Não há custo por análise medido. Avaliar tokens, latência, qualidade e preço vigente do modelo antes de escolher limites de uso. Não há pagamentos, publicidade ou modelo comercial validado.

Próximos passos: testar no iPhone/Android, avaliar imagens reais, revisar os grupos com referência humana e medir se a pessoa entende a explicação sem ajuda.

Roteiro de vídeo: configurar e testar a credencial antes da gravação; apresentar uma embalagem difícil de interpretar; abrir a Vera; fotografar o rótulo; mostrar diretamente o grupo e a explicação; demonstrar uma leitura incerta; encerrar com arquitetura, testes e limitações. Não apresentar fixtures de testes como resultados reais.
