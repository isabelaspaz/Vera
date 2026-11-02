import type { Analysis, AnalysisJob, AnalysisPhase } from '@vera/shared';
type Dependencies = {
  start: () => Promise<AnalysisJob>;
  poll: (id: string) => Promise<AnalysisJob>;
  wait?: () => Promise<void>;
  now?: () => number;
};
export async function runAnalysisJob(deps: Dependencies, onPhase: (phase: AnalysisPhase) => void): Promise<Analysis> {
  const now = deps.now ?? Date.now;
  const deadline = now() + 150000;
  const wait = deps.wait ?? (() => new Promise<void>(resolve => setTimeout(resolve, 2000)));
  let job = await deps.start();
  while (true) {
    if (job.status === 'completed') return job.analysis;
    if (job.status === 'failed') throw new Error(job.error.message);
    onPhase(job.phase);
    if (now() >= deadline) throw new Error('A análise está demorando mais que o esperado. Tente novamente mais tarde.');
    await wait();
    job = await deps.poll(job.id);
  }
}
