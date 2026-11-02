# vera.

**Entenda o que você come.** Aplicativo mobile que usa Gemini para classificar o processamento de um alimento e explicar o motivo em uma frase.

Fluxo: **foto do rótulo → classificação → explicação curta**. A leitura dos ingredientes acontece internamente. O aplicativo não tem modo demo, dados fictícios, cadastro, perfis, chat ou tela de revisão.

Resultados: in natura/minimamente processado (NOVA 1), ingrediente culinário processado (NOVA 2), processado (NOVA 3), ultraprocessado (NOVA 4) ou informação insuficiente. Não há fallback para uma classificação simulada.

## Configurar a IA

Ambiente: Node 22.21+, Expo SDK 58, React Native 0.88.1. Na raiz:

```powershell
npm.cmd ci
if (-not (Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
```

Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e preencha **somente no arquivo local `apps/api/.env`**:

```dotenv
GEMINI_API_KEY=sua_chave
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3333
HOST=0.0.0.0
```

Não coloque a chave no aplicativo, em variáveis `EXPO_PUBLIC_*` ou no GitHub. `.env` está ignorado pelo Git. O modelo é configurável; confirme o acesso na sua conta. A autenticação segue a [documentação oficial Gemini](https://ai.google.dev/gemini-api/docs/api-key).

## Executar no iPhone ou Android

Em dois terminais na raiz:

```powershell
npm.cmd run api
```

```powershell
npm.cmd run mobile
```

Abra o QR code no Expo Go compatível com SDK 58. No iPhone, entre na mesma conta no Expo Go e no computador (`npx.cmd expo login`). O computador e o backend precisam permanecer ligados.

Se a rede local falhar, execute em `apps/mobile`:

```powershell
npx.cmd expo start --tunnel --port 8082
```

O aplicativo detecta o endereço do Expo e usa `/vera-api`, um proxy de desenvolvimento para a API local na porta 3333. Isso permite acessar app e API pelo mesmo túnel HTTPS, inclusive no iPhone usando rede móvel. Não é necessário definir `EXPO_PUBLIC_API_URL` no Expo Go. Se houver uma URL antiga em `apps/mobile/.env`, remova-a ou deixe-a vazia para usar esse caminho automático.

Se alterar a porta da API, configure `VERA_API_PORT` no ambiente do Expo e reinicie o Metro. O proxy encaminha somente health, catálogo NOVA, extração e análise. A configuração fica em `apps/mobile/metro.config.js`.

No app, escolha **Fotografar rótulo** ou **Escolher da galeria**. A foto só é enviada ao confirmar **Classificar alimento**. Se faltar chave, cota, acesso ao modelo ou conexão, o app exibe o erro. Reinicie a API após alterar `apps/api/.env`.

## Verificar

```powershell
npm.cmd run check
npm.cmd exec tsx scripts/smoke.ts
```

TypeScript strict e **85 testes** em seis arquivos: NOVA, leitura interna, contratos de API/SDK, falhas do provedor, conexão pelo proxy, transporte XMLHttpRequest do iPhone e 38 combinações de contraste. As fixtures existem apenas em `tests/fixtures` e não são exportadas para o aplicativo.

Com a chave configurada, é possível fazer uma chamada real de classificação de texto para verificar a conexão:

```powershell
npm.cmd run check:ai
```

Esse comando consulta o Gemini e pode consumir cota. Ele valida o acesso ao modelo e uma classificação simples; não mede OCR ou precisão científica em imagens reais. Não imprime a chave.

## Arquitetura e distribuição

- `apps/mobile`: componentes nativos, Expo Router, câmera/galeria e quatro telas. Estado em memória.
- `apps/api`: Fastify, Google GenAI, extração, classificação e validação de evidências.
- `packages/shared`: schemas Zod, regras NOVA e catálogo fixo do Guia.
- `tests`: fixtures isoladas, testes de domínio, integração, conexão e contraste.

O Gemini estima a classificação; regras verificam qualidade, evidências literais e divergências com formulações conhecidas. Isso não comprova cientificamente a inferência. A classificação é uma estimativa, não uma certificação de segurança ou adequação nutricional.

Para um APK/IPA distribuído, configure `EXPO_PUBLIC_API_URL` com a URL HTTPS do backend publicado. O proxy do Metro é só para desenvolvimento e não acompanha o aplicativo instalado. A chave continua exclusivamente no backend. Há perfil EAS `preview` para APK interno; nenhum build remoto foi disparado.

Exporte os bundles com `npx.cmd expo export --platform android --platform ios` em `apps/mobile`. Para Android local, use Android SDK e `npx.cmd expo run:android`; para iOS local, macOS/Xcode e `npx expo run:ios`.

Ainda faltam avaliação com imagens reais, revisão científica e testes físicos completos/acessibilidade. A API não armazena fotos nem registra seu conteúdo, mas o provedor tem [termos próprios](https://ai.google.dev/gemini-api/terms). A última auditoria online apontava 11 avisos moderados na cadeia de ferramentas Expo.

Se npm 10 falhar com `edgesOut`, use `npx.cmd --yes npm@11 ci`.

Documentação: [produto](docs/product-vision.md), [design](docs/design.md), [arquitetura](docs/architecture.md), [metodologia](docs/nova-methodology.md), [testes](docs/test-plan.md) e [portfólio](docs/portfolio.md).
