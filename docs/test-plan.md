# Verificação do escopo simplificado

`npm.cmd run check` verifica TypeScript strict dos dois apps e **37 testes** em três arquivos. Testes da correção manual foram removidos junto com essa função.

| Arquivo | Cobertura |
| --- | --- |
| domain.test.ts | Grupos 1–4/indeterminado, aditivos, leitura interna incompleta e contrato simplificado |
| api.test.ts | Extração/análise, uma foto, limites, rate limit, ausência de chave, falhas de SDK, evidências, conflitos, abstenção e fórmulas novas classificadas pela IA |
| accessibility.test.ts | Seis pares de contraste do tema |

Os testes usam um provedor simulado e não fazem chamadas pagas. O smoke HTTP está em `scripts/smoke.ts`. A exportação Expo verifica os bundles Android/iOS, não instala um aplicativo em aparelho nem prova que a câmera foi testada.

Roteiro manual: abrir demo e experimentar os quatro grupos; testar exemplo ilegível; conferir que o resultado mostra somente grupo e explicação, sem tela de ingredientes; analisar outro alimento; testar modo real com câmera/galeria, permissões negadas, cancelamento, erro de rede e chave ausente. Nenhuma falha pode trocar silenciosamente para resultado fictício. Testar leitor de tela e fonte máxima.

Avaliação real pendente: imagens consentidas com reflexo/cortes/iluminação variada, transcrição e NOVA de referência revisadas por pessoas qualificadas. Medir erro de leitura, acerto por grupo, abstenção, evidência inventada, latência e custo observado. Não há percentuais de precisão apresentados.
