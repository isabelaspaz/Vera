# Verificação do escopo simplificado

`npm.cmd run check` verifica TypeScript strict dos dois apps e **85 testes** em seis arquivos. O fluxo demo foi removido do aplicativo; fixtures foram isoladas em `tests/fixtures`.

| Arquivo | Cobertura |
| --- | --- |
| domain.test.ts | Grupos 1–4/indeterminado, aditivos, leitura interna incompleta e contrato simplificado |
| api.test.ts | Extração/análise, uma foto, limites, rate limit, ausência de chave, falhas de SDK, evidências, conflitos, abstenção e fórmulas novas classificadas pela IA |
| accessibility.test.ts | Contraste do tema e das cinco classificações: 38 combinações |
| connection.test.ts | Endereço da API no iPhone/túnel/LAN, configuração de distribuição e proxy HTTP entre Expo e backend |
| http.test.ts | XMLHttpRequest sem fetch do Expo, prazo de 90s, erros/cancelamento/timeout nativos, validação de JSON e ausência de retries automáticos |
| jobs.test.ts | Resposta imediata, progresso, resultado, erros, expiração, concorrência, rate limit e espera longa sem reenviar a foto |

Os testes usam um provedor simulado e não fazem chamadas pagas. O smoke HTTP está em `scripts/smoke.ts`. A exportação Expo verifica os bundles Android/iOS, não instala um aplicativo em aparelho nem prova que a câmera foi testada.

Roteiro manual: configurar a chave, abrir o app, fotografar ou escolher um rótulo, confirmar envio e conferir grupo e explicação. Testar os quatro grupos, leitura ilegível, analisar outro alimento, câmera/galeria, permissões negadas, cancelamento, erro de rede, chave ausente/inválida e cota esgotada. Não deve existir seletor demo ou resultado fictício. Testar leitor de tela e fonte máxima.

`npm.cmd run check:ai` faz uma chamada real de classificação de texto e exige credencial; pode consumir cota. É um smoke de integração, não avaliação de OCR ou precisão. O `/health` informa presença de configuração, sem validar a chave remotamente.

Em 02/11/2026, o smoke de texto foi executado com sucesso. Também foram realizadas duas chamadas reais pelo túnel HTTPS do Expo: extração de um rótulo sintético com “INGREDIENTES: Arroz.” e classificação do texto extraído. A resposta foi NOVA 1. O arquivo sintético e o runner temporário ficaram em `.expo`, fora do Git. Esse resultado confirma o caminho de integração, não a precisão em embalagens reais ou a captura física no iPhone.

Avaliação real pendente: imagens consentidas com reflexo/cortes/iluminação variada, transcrição e NOVA de referência revisadas por pessoas qualificadas. Medir erro de leitura, acerto por grupo, abstenção, evidência inventada, latência e custo observado. Não há percentuais de precisão apresentados.

Após a correção de timeout em 02/11/2026, um rótulo sintético mais extenso percorreu o fluxo assíncrono pelo túnel público do Expo. O início foi aceito em cerca de 1s, a leitura terminou em cerca de 49s e o resultado chegou em 67s, com NOVA 4 esperado. Houve apenas um envio da imagem e duas chamadas de IA (leitura e classificação). Isso verifica a integração durante uma análise superior ao prazo do túnel; a repetição no iPhone com uma embalagem real continua pendente.
