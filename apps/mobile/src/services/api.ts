import { z } from 'zod';
import { analysisSchema, labelSchema, type LabelExtraction, type LabelImage } from '@vera/shared';
const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
async function post<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  if (!baseUrl) throw new Error('Configure o endereço da API para usar o modo real.');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 35000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    const value = await response.json();
    if (!response.ok) throw new Error(value?.error?.message ?? 'Não consegui concluir. Tente novamente.');
    return schema.parse(value);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('A leitura demorou mais que o esperado. Tente novamente.');
    if (error instanceof TypeError) throw new Error('Não consegui conectar à Vera. Confira a conexão e o endereço do servidor.');
    if (error instanceof z.ZodError) throw new Error('Recebi uma resposta inesperada. Tente novamente.');
    throw error;
  } finally { clearTimeout(timer); }
}
export const api = {
  extract: (images: LabelImage[]) => post('/api/extract', { images }, labelSchema),
  analyze: (label: LabelExtraction) => post('/api/analyze', { label }, analysisSchema),
};
