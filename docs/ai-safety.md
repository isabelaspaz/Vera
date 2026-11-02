# IA, segurança e privacidade

A versão atual classifica processamento. Não cadastra pessoas ou restrições e não avalia alergias, segurança para consumo, dietas ou diagnósticos.

O app envia uma foto ao backend e ao Gemini somente após confirmação pelo botão de classificar. Imagem, rótulo e resultado ficam em memória da sessão; não há histórico na Vera. O sistema de câmera/galeria pode manter o original e arquivos temporários no aparelho. O backend não salva fotos nem registra seu conteúdo. O provedor possui [termos próprios](https://ai.google.dev/gemini-api/terms); isso não é promessa de retenção zero pelo Google.

A chave Gemini permanece no servidor. Imagens e texto são tratados como dados não confiáveis, nunca como comandos. Zod valida contratos; o backend rejeita mídia inválida, limita tamanho, concorrência e requisições, e padroniza erros sem revelar detalhes internos. A checagem de assinatura não substitui decodificação completa do arquivo.

A IA estima a classificação. A validação exige evidência literal e ausência de conflitos com regras conhecidas, mas não comprova a precisão do modelo. Informação insuficiente gera abstenção. A explicação é limitada ao processamento, sem promessas clínicas; as recomendações do Guia são fixas.

Antes de uso público: avaliar precisão em imagens reais, revisão científica, HTTPS, proteção contra abuso distribuído, orçamento global e termos de tratamento de imagens. A última auditoria online anterior à simplificação indicava 11 avisos moderados na cadeia Expo/glob/minimatch; não aplicar downgrade incompatível sugerido pelo audit sem avaliação. Não há declaração de validação científica ou conformidade jurídica completa.

Os módulos de perfis foram removidos. Esta alteração não apaga automaticamente dados que uma versão anterior possa ter gravado no Keychain de um aparelho.
