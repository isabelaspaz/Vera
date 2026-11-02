# vera.

**Entenda o que você come.** Um app mobile que usa IA para classificar o processamento de um alimento e explicar o motivo em uma frase.

O escopo foi simplificado: **foto do rótulo → classificação → explicação curta**. A leitura dos ingredientes acontece internamente, sem tela de transcrição ou revisão. Não há cadastro, perfis familiares, restrições alimentares ou chat.

Resultados: in natura ou minimamente processado (NOVA 1), ingrediente culinário processado (NOVA 2), processado (NOVA 3), ultraprocessado (NOVA 4). Quando os dados não bastam, a Vera informa que não conseguiu classificar.

## Abrir a demonstração

Na raiz, com Node 22.21+:

```powershell
npm.cmd ci
npm.cmd run mobile
```

Abra o projeto no Expo Go compatível com SDK 58. O app começa em modo **DEMO**, com cinco exemplos fictícios, e não exige backend nem chave.

No iPhone, Expo Go e Expo CLI devem usar a mesma conta. Para entrar no computador:

```powershell
npx.cmd expo login
```

Celular e computador devem estar na mesma rede. Se houver timeout na conexão local, em `apps/mobile` execute `npx.cmd expo start --tunnel`. O endereço por túnel vale enquanto esse servidor estiver ativo. Veja a [documentação do Expo](https://docs.expo.dev/get-started/start-developing/).

Se o npm 10 falhar na resolução de peers com `edgesOut`, use `npx.cmd --yes npm@11 ci`.

## Usar IA com uma foto real

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

Preencha `GEMINI_API_KEY` em `apps/api/.env` com uma chave do [Google AI Studio](https://aistudio.google.com/apikey). O adaptador usa o SDK oficial Google GenAI e o modelo configurável `gemini-3.5-flash-lite`; confirme o acesso ao modelo na sua conta. A chave fica exclusivamente no servidor.

Em `apps/mobile/.env`, configure `EXPO_PUBLIC_API_URL` com a URL da API. Para rede local, use o IPv4 do computador, por exemplo `http://192.168.1.13:3333`, nunca `localhost` no iPhone. Para acessar fora da rede local, a API também precisa de uma URL acessível pelo celular: o túnel do Expo encaminha somente o aplicativo, não a API. Em distribuição, use HTTPS.

Em dois terminais na raiz:

```powershell
npm.cmd run api
```

```powershell
npm.cmd run mobile
```

Reinicie o Expo após mudar `.env`. No início, toque em **Usar IA com uma foto real**, fotografe ou escolha a imagem e toque em **Classificar alimento**. O resultado mostra o grupo e uma explicação curta. Se a leitura for insuficiente, tire outra foto.

## Arquitetura

- `apps/mobile`: React Native, Expo Router, câmera/galeria e três telas: início, captura e resultado. Estado somente em memória.
- `apps/api`: Fastify, extração Gemini, classificação Gemini, validação de evidências, limites e erros padronizados.
- `packages/shared`: schemas Zod, NOVA, catálogo fixo do Guia e exemplos demo.

O modo real usa a IA para classificar; regras determinísticas verificam a qualidade da leitura, evidências literais e divergências com formulações conhecidas. Isso não comprova cientificamente cada inferência da IA. O modo demo usa exemplos e regras locais e nunca é apresentado como uma chamada real.

## Verificar

```powershell
npm.cmd run check
npm.cmd exec tsx scripts/smoke.ts
```

O escopo simplificado tem **37 testes**: classificação, leitura interna, evidências, endpoints, falhas do SDK, limites e contraste. Verifique com `npm.cmd run check`. Bundles Android/iOS são exportáveis com `npx.cmd expo export --platform android --platform ios` em `apps/mobile`; isso não gera APK/IPA.

Ainda faltam teste físico completo e avaliação com credencial Gemini/imagens reais. A classificação é uma estimativa, com possibilidade de erro; não é certificação nutricional ou de segurança. A API não armazena fotos nem registra conteúdo, mas o provedor tem [termos próprios](https://ai.google.dev/gemini-api/terms). A última auditoria online anterior à simplificação apontava 11 avisos moderados na cadeia de ferramentas Expo; o resultado de uma instalação offline não substitui nova auditoria.

Para build local Android, configure Android SDK e rode `npx.cmd expo run:android` em `apps/mobile`. Para iOS local, é necessário macOS/Xcode. O perfil EAS `preview` está disponível para APK interno, mas não foi disparado build remoto.

Leia [a visão simplificada](docs/product-vision.md), [arquitetura](docs/architecture.md), [metodologia](docs/nova-methodology.md), [testes](docs/test-plan.md) e [apresentação](docs/portfolio.md).
