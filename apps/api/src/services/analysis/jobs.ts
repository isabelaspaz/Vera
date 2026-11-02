import { randomUUID } from 'node:crypto';
import { analyzeLabel, labelSchema, novaSchema, type AnalysisJob, type AnalysisPhase, type LabelImage } from '@vera/shared';
import { ProviderError, type AiProvider } from '../gemini/provider';
import { validateNova } from '../nova/validate';

type Entry = { value: AnalysisJob; expiresAt: number; timer: ReturnType<typeof setTimeout> };
type Options = {
  reserve: () => () => void;
  describeError: (error: unknown) => { code: string; message: string };
  onPhase?: (phase: string) => void;
  ttlMs?: number;
};
export class AnalysisJobs {
  private entries = new Map<string, Entry>();
  constructor(private options: Options) {}
  create(provider: AiProvider, images: LabelImage[]): AnalysisJob {
    if (this.entries.size >= 128) throw new ProviderError('BUSY', 503);
    const release = this.options.reserve();
    const id = randomUUID(), ttl = this.options.ttlMs ?? 10 * 60 * 1000;
    const value: AnalysisJob = { id, status: 'processing', phase: 'reading' };
    const timer = setTimeout(() => this.entries.delete(id), ttl); timer.unref();
    this.entries.set(id, { value, timer, expiresAt: Date.now() + ttl });
    // Return the ID immediately; the long AI request must not hold the tunnel open.
    void this.run(id, provider, images).finally(release);
    return value;
  }
  get(id: string): AnalysisJob {
    const entry = this.entries.get(id);
    if (!entry || entry.expiresAt <= Date.now()) {
      if (entry) { clearTimeout(entry.timer); this.entries.delete(id); }
      throw new ProviderError('JOB_NOT_FOUND', 404);
    }
    return entry.value;
  }
  close() { for (const entry of this.entries.values()) clearTimeout(entry.timer); this.entries.clear(); }
  private async run(id: string, provider: AiProvider, images: LabelImage[]) {
    try {
      this.options.onPhase?.('reading');
      const label = labelSchema.parse(await provider.extract(images));
      images = [];
      if (!this.entries.has(id)) return;
      const phase: AnalysisPhase = 'classifying';
      this.entries.get(id)!.value = { id, status: 'processing', phase };
      this.options.onPhase?.(phase);
      const candidate = novaSchema.parse(await provider.classify(label));
      const analysis = analyzeLabel(label, id, validateNova(label, candidate));
      const entry = this.entries.get(id);
      if (entry) entry.value = { id, status: 'completed', analysis };
      this.options.onPhase?.('completed');
    } catch (error) {
      const entry = this.entries.get(id);
      if (entry) entry.value = { id, status: 'failed', error: this.options.describeError(error) };
      this.options.onPhase?.('failed');
    }
  }
}
