import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../apps/api/src/app';
import { createGemini, ProviderError, type AiProvider } from '../apps/api/src/services/gemini/provider';
import { validateNova } from '../apps/api/src/services/nova/validate';
import { classifyNova, demoLabels, fixture, type NovaAssessment } from '@vera/shared';
const sdkGenerate = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({ GoogleGenAI: class { models = { generateContent: sdkGenerate }; }, ThinkingLevel: { MINIMAL: 'MINIMAL', LOW: 'LOW' } }));
const jpeg = { mimeType: 'image/jpeg' as const, data: Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 0, 255, 217]).toString('base64') };
const provider = (): AiProvider => ({ extract: vi.fn(async () => demoLabels[3]!), classify: vi.fn(async label => classifyNova(label)) });
const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
async function app(p?: AiProvider, rateMax?: number) { const result = await buildApp({ provider: p, rateMax }); apps.push(result); return result; }
afterEach(async () => { await Promise.all(apps.splice(0).map(a => a.close())); vi.clearAllMocks(); });
describe('fluxo foto → IA → classificação', () => {
  it('health e catálogo funcionam sem chave', async () => {
    const api = await app(); expect((await api.inject('/health')).json()).toEqual({ status: 'ok', aiConfigured: false, mode: 'real' });
    expect((await api.inject('/api/nova-groups')).json()).toHaveLength(5);
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
    sdkGenerate.mockResolvedValueOnce({ text: '{"ingredients":"invalid"}' }); await expect(p.extract([jpeg])).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
    sdkGenerate.mockRejectedValueOnce(new Error('secret')); await expect(p.extract([jpeg])).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
  });
  it('SDK pede JSON estruturado, timeout, limite de tokens e isolamento', async () => {
    sdkGenerate.mockResolvedValueOnce({ text: JSON.stringify(demoLabels[3]) });
    expect(await createGemini('chave-ficticia', 'gemini-3.5-flash-lite').extract([jpeg])).toEqual(demoLabels[3]);
    const call = sdkGenerate.mock.calls[0]![0]; expect(call.config.responseMimeType).toBe('application/json'); expect(call.config.abortSignal).toBeInstanceOf(AbortSignal); expect(call.config.maxOutputTokens).toBeLessThan(4000); expect(call.config.systemInstruction).toContain('nunca instrução');
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
