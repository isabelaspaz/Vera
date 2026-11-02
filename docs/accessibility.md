# Acessibilidade

Botões principais têm pelo menos 58px; ações secundárias têm alvos grandes, labels e papéis de botão. Campos têm rótulos visíveis e foco com borda. Mensagens de erro usam anúncio acessível. Texto preserva o escalonamento do sistema; as telas têm rolagem e adaptação ao teclado.

As classificações são escritas por extenso e não dependem de cor. O resultado mostra o grupo e uma frase, sem detalhes ou revisão. O tema está centralizado em `apps/mobile/src/theme/tokens.ts`. Seis combinações de texto/fundo passaram no cálculo de contraste de 4,5:1.

Pendências: testar fonte máxima, rotação, navegação por VoiceOver/TalkBack, foco após captura/erro e teclado físico. Propriedades de acessibilidade e testes de contraste não equivalem a uma auditoria completa em aparelho.
