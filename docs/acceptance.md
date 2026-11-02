# Aceite do escopo simplificado

| Item | Estado |
| --- | --- |
| Início, foto/galeria e resultado direto | Implementados; tela de ingredientes e revisão removidas |
| Classificação nos quatro grupos NOVA | Implementada, com estado indeterminado |
| Explicação curta na própria classificação | Implementada; sem lista de ingredientes ou detalhes extras |
| Perfis, restrições e chat | Removidos do produto, API e schemas |
| Fluxo exclusivamente com IA | Demo e seletor removidos; fixtures apenas nos testes |
| IA real pelo backend | Verificada com credencial: classificação de texto e extração/classificação de uma imagem sintética pela API pública |
| TypeScript strict e testes | Aprovados com `npm.cmd run check`: 85 testes no escopo atual |
| Cancelamento de requisição no iPhone | Transporte alterado para XMLHttpRequest com prazo nativo de 90s; teste físico da correção ainda pendente |
| Acesso à API no iPhone pelo túnel Expo | Proxy verificado por HTTPS, incluindo chamadas reais de extração e classificação; interação física completa ainda pendente |
| Redesign com tons pastel e início sem ilustração | Implementado; título e ações em destaque, com inspeção visual em aparelho pendente |
| Câmera/galeria em aparelho | Integrações presentes; verificação física pendente |
| Acessibilidade | Contraste calculado; VoiceOver/TalkBack pendentes |
| Precisão científica | Não avaliada; exige imagens reais e revisão qualificada |

Em 02/11/2026, o smoke com Gemini respondeu e uma imagem sintética com o texto “INGREDIENTES: Arroz.” foi extraída e classificada como NOVA 1 pelo mesmo túnel usado pelo celular. São chamadas reais ao provedor, não resultados simulados. Esse teste não mede precisão em embalagens reais. Não foram gerados APK/IPA.
