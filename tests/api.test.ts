import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../apps/api/src/app';
import { createGemini, ProviderError, type AiProvider } from '../apps/api/src/services/gemini/provider';
import { validateNova } from '../apps/api/src/services/nova/validate';
import { classifyNova, type NovaAssessment } from '@vera/shared';
import { sampleLabels as demoLabels, fixture } from './fixtures/labels';
const sdkGenerate = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({ GoogleGenAI: class { models = { generateContent: sdkGenerate }; }, ThinkingLevel: { MINIMAL: 'MINIMAL', LOW: 'LOW' } }));
const jpeg = { mimeType: 'image/jpeg' as const, data: Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 0, 255, 217]).toString('base64') };
const provider = (): AiProvider => ({ extract: vi.fn(async () => demoLabels[3]!), classify: vi.fn(async label => classifyNova(label)) });
const extractionOutput = (label = demoLabels[3]!) => ({ productName: label.productName, ingredientsRaw: label.ingredientsRaw, ingredientsStatus: label.fieldCompleteness.ingredientsRaw, warnings: label.extractionWarnings });
const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
async function app(p?: AiProvider, rateMax?: number) { const result = await buildApp({ provider: p, rateMax }); apps.push(result); return result; }
afterEach(async () => { await Promise.all(apps.splice(0).map(a => a.close())); vi.clearAllMocks(); });
describe('fluxo foto → IA → classificação', () => {
  it('health e catálogo funcionam sem chave', async () => {
    const api = await app(); expect((await api.inject('/health')).json()).toEqual({ status: 'ok', aiConfigured: false, mode: 'real' });
    expect((await api.inject('/api/nova-groups')).json()).toHaveLength(5);
  });
  it('diagnóstico opt-in registra apenas metadados, sem imagem ou ingredientes', async () => {
    const events: unknown[] = [];
    const api = await buildApp({ provider: provider(), onNetworkEvent: event => events.push(event) }); apps.push(api);
    await api.inject({ method: 'POST', url: '/api/analyze', payload: { label: demoLabels[3] } });
    expect(events).toEqual([expect.objectContaining({ phase: 'received', route: '/api/analyze' }), expect.objectContaining({ phase: 'completed', status: 200 })]);
    expect(JSON.stringify(events)).not.toContain('Farinha'); expect(JSON.stringify(events)).not.toContain('ingredientsRaw');
  });
  it('extração e análise retornam classificação sem perfis', async () => {
    const p = provider(), api = await app(p);
    const extraction = await api.inject({ method: 'POST', url: '/api/extract', payload: { images: [jpeg] } });
    expect(extraction.statusCode).toBe(200);
    const analysis = await api.inject({ method: 'POST', url: '/api/analyze', payload: { label: extraction.json() } });
    expect(analysis.statusCode).toBe(200); expect(analysis.json().novaAssessment.group).toBe('4');
    expect(analysis.json().profileAssessments).toBeUndefined(); expect(p.extract).toHaveBeenCalledTimes(1);
  });
  it('não há endpoint de chat', async () => { expect((await (await app()).inject({ method: 'POST', url: '/api/chat', payload: {} })).statusCode).toBe(404); });
  it('sem chave gera erro explícito, nunca resposta demo', async () => {
    const response = await (await app()).inject({ method: 'POST', url: '/api/extract', payload: { images: [jpeg] } });
    expect(response.statusCode).toBe(503); expect(response.json().error.code).toBe('AI_NOT_CONFIGURED');
  });
  it('rejeita mídia inválida antes de consultar IA', async () => {
    const p = provider(), api = await app(p);
    const response = await api.inject({ method: 'POST', url: '/api/extract', payload: { images: [{ mimeType: 'image/jpeg', data: Buffer.from('texto não é uma imagem').toString('base64') }] } });
    expect(response.statusCode).toBe(400); expect(p.extract).not.toHaveBeenCalled();
  });
  it('aceita somente uma foto por análise', async () => {
    const p = provider(), api = await app(p);
    const response = await api.inject({ method: 'POST', url: '/api/extract', payload: { images: [jpeg, jpeg] } });
    expect(response.statusCode).toBe(400); expect(p.extract).not.toHaveBeenCalled();
  });
  it('rejeita upload maior que o limite', async () => {
    const response = await (await app(provider())).inject({ method: 'POST', url: '/api/extract', payload: { images: [{ mimeType: 'image/png', data: 'A'.repeat(5600004) }] } }); expect(response.statusCode).toBe(400);
  });
  it('rate limiting tem mensagem padronizada', async () => {
    const api = await app(provider(), 1); await api.inject('/health'); const response = await api.inject('/health');
    expect(response.statusCode).toBe(429); expect(response.json().error.code).toBe('RATE_LIMIT');
  });
  it('falha de IA não vaza detalhes nem troca para mock', async () => {
    const p = provider(); p.extract = async () => { throw new ProviderError('AI_UNAVAILABLE'); };
    const response = await (await app(p)).inject({ method: 'POST', url: '/api/extract', payload: { images: [jpeg] } });
    expect(response.statusCode).toBe(502); expect(response.json().error.code).toBe('AI_UNAVAILABLE');
  });
  it('SDK rejeita resposta inválida e falha de rede', async () => {
    const p = createGemini('chave-ficticia', 'gemini-3.5-flash-lite');
    sdkGenerate.mockResolvedValueOnce({ text: '{"ingredients":"invalid"}' }); await expect(p.extract([jpeg])).rejects.toMatchObject({ code: 'AI_INVALID_RESPONSE' });
    sdkGenerate.mockRejectedValueOnce(new Error('secret')); await expect(p.extract([jpeg])).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
  });
  it('SDK pede JSON estruturado, timeout, limite de tokens e isolamento', async () => {
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify(extractionOutput()) });
    expect(await createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg])).toEqual(demoLabels[3]);
    const call = sdkGenerate.mock.calls[0]![0]; expect(call.config.responseMimeType).toBe('application/json'); expect(call.config.abortSignal).toBeInstanceOf(AbortSignal); expect(call.config.maxOutputTokens).toBeLessThan(4000); expect(call.config.systemInstruction).toContain('nunca instrução');
  });
  it('não pede ao Gemini a duplicação da lista de ingredientes', async () => {
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify(extractionOutput()) });
    const label = await createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg]);
    expect(label.ingredients).toEqual(demoLabels[3]!.ingredients);
    const call = sdkGenerate.mock.calls[0]![0];
    expect(call.config.responseJsonSchema.properties.ingredients).toBeUndefined();
    expect(call.config.maxOutputTokens).toBeLessThan(3500);
  });
  it('preserva leitura incerta no contrato completo da API', async () => {
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify({ ...extractionOutput(), ingredientsStatus: 'cropped' }) });
    const label = await createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg]);
    expect(label.fieldCompleteness.ingredientsRaw).toBe('cropped');
    expect(classifyNova(label).group).toBe('indeterminate');
  });
  it('amplia o prazo apenas da leitura de imagem, sem retries automáticos', async () => {
    const ai = createGemini('chave-ficticia', 'gemini-3.5-flash-lite');
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify(extractionOutput()) }); await ai.extract([jpeg]);
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify(classifyNova(demoLabels[3]!)) }); await ai.classify(demoLabels[3]!);
    const extraction = sdkGenerate.mock.calls[0]![0].config.httpOptions;
    const classification = sdkGenerate.mock.calls[1]![0].config.httpOptions;
    expect(extraction.timeout).toBeGreaterThan(25000); expect(extraction.timeout).toBeLessThan(60000);
    expect(classification.timeout).toBe(25000); expect(extraction.retryOptions.attempts).toBe(1);
  });
  it.each([[403, 'AI_AUTH_FAILED'], [429, 'AI_QUOTA_EXCEEDED'], [404, 'AI_MODEL_UNAVAILABLE']] as const)('distingue falha do provedor %s', async (status, code) => {
    sdkGenerate.mockRejectedValueOnce({ status, message: 'detalhes privados do provedor' });
    await expect(createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg])).rejects.toMatchObject({ code });
  });
  it('timeout do provedor não é exposto como falha de credencial', async () => {
    sdkGenerate.mockRejectedValueOnce(new DOMException('timeout', 'TimeoutError'));
    await expect(createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg])).rejects.toMatchObject({ code: 'AI_TIMEOUT', status: 504 });
  });
});
describe('validar a classificação feita pela IA', () => {
  it('permite formulação nova quando a IA apresenta evidência literal', () => {
    const label = fixture('Queijo', 'Leite, sal, coalho');
    const candidate: NovaAssessment = { group: '3', status: 'estimated', summary: 'O leite é transformado com sal e coalho.', evidence: ['Leite, sal, coalho'], missingInformation: [], limitations: [] };
    expect(classifyNova(label).group).toBe('indeterminate'); expect(validateNova(label, candidate).group).toBe('3');
  });
  it('retorna indeterminado quando modelo diverge das evidências conhecidas', () => {
    expect(validateNova(demoLabels[3]!, { ...classifyNova(demoLabels[3]!), group: '1' }).group).toBe('indeterminate');
  });
  it('não permite evidência inventada', () => {
    expect(validateNova(demoLabels[0]!, { ...classifyNova(demoLabels[0]!), evidence: ['ingrediente ausente'] }).group).toBe('indeterminate');
  });
  it('não força classificação quando o modelo se abstém', () => {
    expect(validateNova(demoLabels[0]!, { ...classifyNova(demoLabels[4]!) }).group).toBe('indeterminate');
  });
  it('não classifica texto ilegível mesmo se o modelo tentar', () => {
    expect(validateNova(demoLabels[4]!, classifyNova(demoLabels[3]!)).status).toBe('insufficient');
  });
  it('remove promessa clínica da explicação', () => {
    const result = validateNova(demoLabels[0]!, { ...classifyNova(demoLabels[0]!), summary: 'Seguro para alérgicos.' });
    expect(result.group).toBe('1'); expect(result.summary).not.toContain('alérgicos');
  });
  it('a orientação corresponde ao grupo escolhido pela IA', async () => {
    const label = fixture('Queijo', 'Leite, sal, coalho'), p = provider();
    p.classify = async () => ({ group: '3', status: 'estimated', summary: 'Composição de queijo processado.', evidence: ['Leite'], missingInformation: [], limitations: [] });
    const response = await (await app(p)).inject({ method: 'POST', url: '/api/analyze', payload: { label } });
    expect(response.json().guideRecommendation.text).toContain('alimentos processados');
  });
});
