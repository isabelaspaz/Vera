import { afterEach, describe, expect, it, vi } from 'vitest';
import { setImmediate as tick } from 'node:timers/promises';
import { buildApp } from '../apps/api/src/app';
import { AnalysisJobs } from '../apps/api/src/services/analysis/jobs';
import { ProviderError, type AiProvider } from '../apps/api/src/services/gemini/provider';
import { analyzeLabel, classifyNova, type AnalysisJob, type LabelExtraction, type NovaAssessment } from '@vera/shared';
import { fixture } from './fixtures/labels';
import { runAnalysisJob } from '../apps/mobile/src/services/analysis-job';
const image = { mimeType: 'image/jpeg', data: Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 0, 255, 217]).toString('base64') };
const label = fixture('Arroz', 'Arroz');
const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(apps.splice(0).map(app => app.close())); });
const deferred = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; };
async function createApp(provider: AiProvider) { const app = await buildApp({ provider }); apps.push(app); return app; }
const start = (app: Awaited<ReturnType<typeof buildApp>>) => app.inject({ method: 'POST', url: '/api/classify', payload: { images: [image] } });

describe('análise sem manter o túnel HTTP aguardando a IA', () => {
  it('responde 202 antes da extração terminar e permite acompanhar as duas fases', async () => {
    const extraction = deferred<LabelExtraction>(), classification = deferred<NovaAssessment>();
    const provider = { extract: vi.fn(() => extraction.promise), classify: vi.fn(() => classification.promise) };
    const app = await createApp(provider), response = await start(app);
    expect(response.statusCode).toBe(202); const id = response.json().id;
    expect((await app.inject(`/api/jobs/${id}`)).json()).toEqual({ id, status: 'processing', phase: 'reading' });
    extraction.resolve(label); await tick();
    expect((await app.inject(`/api/jobs/${id}`)).json().phase).toBe('classifying');
    classification.resolve(classifyNova(label)); await tick();
    const result = await app.inject(`/api/jobs/${id}`);
    expect(result.json().status).toBe('completed'); expect(result.json().analysis.novaAssessment.group).toBe('1');
    expect(provider.extract).toHaveBeenCalledTimes(1); expect(provider.classify).toHaveBeenCalledTimes(1);
    expect(result.headers['cache-control']).toBe('no-store');
  });
  it('publica falha da IA no job sem expor detalhes internos', async () => {
    const app = await createApp({ extract: async () => { throw new ProviderError('AI_TIMEOUT', 504); }, classify: vi.fn() });
    const response = await start(app); await tick();
    const state = (await app.inject(`/api/jobs/${response.json().id}`)).json();
    expect(state.status).toBe('failed'); expect(state.error.code).toBe('AI_TIMEOUT'); expect(state.error.message).toContain('IA demorou');
  });
  it('mantém um limite compartilhado de quatro operações', async () => {
    const extraction = deferred<LabelExtraction>();
    const app = await createApp({ extract: () => extraction.promise, classify: async () => classifyNova(label) });
    for (let i = 0; i < 4; i++) expect((await start(app)).statusCode).toBe(202);
    expect((await start(app)).statusCode).toBe(503);
    const legacy = await app.inject({ method: 'POST', url: '/api/analyze', payload: { label } });
    expect(legacy.json().error.code).toBe('BUSY');
    extraction.resolve(label); await tick();
  });
  it('consultas de progresso não estouram o limite de início de análise', async () => {
    const extraction = deferred<LabelExtraction>();
    const app = await createApp({ extract: () => extraction.promise, classify: async () => classifyNova(label) });
    const response = await start(app), id = response.json().id;
    for (let i = 0; i < 30; i++) expect((await app.inject(`/api/jobs/${id}`)).statusCode).toBe(200);
    extraction.resolve(label); await tick();
  });
  it('identificador desconhecido não retorna informações de outra análise', async () => {
    const app = await createApp({ extract: async () => label, classify: async () => classifyNova(label) });
    expect((await app.inject('/api/jobs/00000000-0000-4000-8000-000000000000')).statusCode).toBe(404);
  });
  it('expira resultados transitórios e libera o registro', async () => {
    const extraction = deferred<LabelExtraction>(), now = Date.now();
    const jobs = new AnalysisJobs({ reserve: () => () => {}, describeError: () => ({ code: 'AI_UNAVAILABLE', message: 'Indisponível' }), ttlMs: 1000 });
    const job = jobs.create({ extract: () => extraction.promise, classify: async () => classifyNova(label) }, []);
    vi.spyOn(Date, 'now').mockReturnValue(now + 2000);
    expect(() => jobs.get(job.id)).toThrow('JOB_NOT_FOUND'); jobs.close(); extraction.resolve(label); await tick();
  });
});
describe('acompanhamento da análise no aplicativo', () => {
  const id = '00000000-0000-4000-8000-000000000001';
  it('aguarda uma IA demorada usando consultas curtas, sem reenviar a imagem', async () => {
    let time = 0;
    const phases: string[] = [];
    const begin = vi.fn(async (): Promise<AnalysisJob> => ({ id, status: 'processing', phase: 'reading' }));
    const poll = vi.fn(async (): Promise<AnalysisJob> => time < 60000 ? { id, status: 'processing', phase: time < 40000 ? 'reading' : 'classifying' } : { id, status: 'completed', analysis: analyzeLabel(label, id) });
    const result = await runAnalysisJob({ start: begin, poll, now: () => time, wait: async () => { time += 2000; } }, phase => phases.push(phase));
    expect(result.novaAssessment.group).toBe('1'); expect(begin).toHaveBeenCalledTimes(1); expect(phases).toContain('classifying');
  });
  it('mostra falha do servidor sem criar uma segunda consulta paga', async () => {
    const begin = vi.fn(async (): Promise<AnalysisJob> => ({ id, status: 'failed', error: { code: 'AI_TIMEOUT', message: 'A IA demorou mais que o esperado.' } }));
    await expect(runAnalysisJob({ start: begin, poll: vi.fn() }, () => {})).rejects.toThrow('IA demorou');
    expect(begin).toHaveBeenCalledTimes(1);
  });
});
