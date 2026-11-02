import { ProviderError } from '../services/gemini/provider';
import type { LabelImage } from '@vera/shared';
export function validateImages(images: LabelImage[]) {
  let total = 0;
  for (const img of images) {
    const buffer = Buffer.from(img.data, 'base64'); total += buffer.length;
    const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (buffer.toString('base64') !== img.data || (img.mimeType === 'image/jpeg' ? !jpeg : !png)) throw new ProviderError('INVALID_IMAGE', 400);
    if (buffer.length > 4 * 1024 * 1024) throw new ProviderError('IMAGE_TOO_LARGE', 413);
  }
  if (total > 10 * 1024 * 1024) throw new ProviderError('IMAGE_TOO_LARGE', 413);
}
