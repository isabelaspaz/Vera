type ApiEnvironment = { configuredUrl?: string; hostUri?: string | null; development: boolean };
export function resolveApiUrl({ configuredUrl, hostUri, development }: ApiEnvironment): string {
  if (configuredUrl?.trim()) {
    let url: URL;
    try { url = new URL(configuredUrl.trim()); } catch { throw new Error('Confira o endereço do servidor da Vera.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use um endereço HTTP ou HTTPS válido para o servidor da Vera.');
    return url.toString().replace(/\/$/, '');
  }
  if (development && hostUri) {
    const address = hostUri.replace(/^(?:https?|exps?):\/\//, '').replace(/\/$/, '');
    // The development proxy shares the Expo server/tunnel, including on a physical iPhone.
    const local = /^(?:localhost|127(?:\.\d+){3}|10(?:\.\d+){3}|192\.168(?:\.\d+){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d+){2}|\[[0-9a-fA-F:]+\])(?::\d+)?$/.test(address);
    return `${local ? 'http' : 'https'}://${address}/vera-api`;
  }
  throw new Error('O servidor da Vera ainda não foi configurado.');
}
