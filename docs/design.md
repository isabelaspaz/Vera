# Direção visual da Vera

O redesign usa as referências compartilhadas pela usuária como direção de atmosfera: tons pastel, formas arredondadas, sombras leves e tipografia de leitura confortável. A tela inicial foi simplificada novamente a pedido da usuária: sem ilustração, sol decorativo, card grande ou frases adicionais. O fluxo continua com início, captura, análise e resultado, sem dashboards, métricas ou navegação adicional.

Creme é a base e o verde profundo identifica ações. No resultado, cada classificação tem um fundo suave e uma cor escura para o número e o marcador: verde-sálvia para grupo 1, amarelo manteiga para grupo 2, coral claro para grupo 3 e vermelho rosado para grupo 4. Informação insuficiente usa cinza neutro. Texto escuro preserva contraste; cores não substituem o nome do grupo NOVA. O número no resultado é explicitamente o grupo NOVA, não uma pontuação. O grupo 2 aparece como “Ingrediente culinário”, acompanhado de “Usado para cozinhar ou temperar, como óleo, sal e açúcar.”

- Início: título direto sobre fundo creme, conteúdo central com altura flexível e duas ações: fotografar ou escolher da galeria. Sem seletor demo. A informação de envio de fotos permanece visível.
- Captura: prévia com moldura leve, dica de iluminação e botões com ícones.
- Resultado: grupo em destaque, explicação curta em um card branco e ação para analisar outro alimento. A transcrição continua interna.

Os tokens ficam em `apps/mobile/src/theme/tokens.ts`. Ícones Feather são servidos localmente por `@expo/vector-icons`, na versão compatível com o SDK 58. A interface usa componentes React Native, fonte do sistema, escalonamento de texto, alvos de toque grandes e estados de foco. Não foram adicionadas fontes ou imagens carregadas remotamente durante o uso.

## Ilustração e procedência

Arte anterior, retirada da interface: `apps/mobile/assets/illustrations/food-still-life.png` (1536 × 1024, PNG com transparência). Criada com a skill imagegen e a ferramenta integrada de geração de imagens, em modo de geração original. O arquivo foi preservado, sem referência no código ou inclusão no bundle. As imagens fornecidas pela usuária orientaram a atmosfera do design; não foram incorporadas ao aplicativo.

Prompt final usado:

> Use case: illustration-story. Asset type: transparent decorative illustration for the home screen of Vera, a calm Brazilian mobile food-label classification app. Create one original premium editorial food still life: a sage-green pear with a small leaf, a halved avocado, a small cream ceramic bowl of oats and a few oat sprigs, a soft yellow lemon. Hand-painted gouache meets softly shaded dimensional paper-cut illustration; sophisticated wellness editorial art, subtle natural texture, rounded organic shapes, soft ambient light, restrained muted sage, olive, buttery yellow, ivory with tiny lavender accents. Balanced compact cluster, viewed slightly from above, whole composition fully inside generous margins; clean clear silhouettes readable at 180px. Delicate contact shadows only beneath objects. Background must be genuinely transparent. No text, no letters, no numerals, no logos, no UI, no frames, no photorealism, no human characters. This is an app illustration asset, not a screen mockup. Keep the artwork quiet, warm and uncluttered.

## Verificação

TypeScript strict e 85 testes aprovados, incluindo 38 combinações de contraste de texto de pelo menos 4,5:1. Expo Doctor anterior: 20/20. A arte foi inspecionada, mas está fora da interface atual. Ainda é necessária inspeção visual no iPhone/Android, especialmente com fonte máxima e VoiceOver/TalkBack; a exportação de bundles não substitui essa verificação.
