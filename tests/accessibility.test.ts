import { expect, it } from 'vitest';
import { theme } from '../apps/mobile/src/theme/tokens';
const luminance = (hex: string) => {
  const values = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
};
it.each([
  ['ink', 'cream'], ['muted', 'cream'], ['green', 'white'], ['green', 'pale'], ['warning', 'warningBg'], ['error', 'white'],
  ['ink', 'pale'], ['ink', 'lavender'], ['ink', 'butter'], ['ink', 'peach'],
  ['muted', 'pale'], ['muted', 'lavender'], ['muted', 'butter'], ['muted', 'peach'],
  ['green', 'lavender'], ['green', 'butter'], ['green', 'peach'], ['warning', 'butter'],
] as const)('contraste de texto %s sobre %s atende 4.5:1', (fg, bg) => {
  const a = luminance(theme.colors[fg]), b = luminance(theme.colors[bg]); expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
});

it.each(Object.entries(theme.classification))('contraste da classificação %s atende 4.5:1', (_group, tone) => {
  for (const [foreground, background] of [
    [tone.accent, tone.background], [theme.colors.ink, tone.background],
    [theme.colors.muted, tone.background], [tone.accent, theme.colors.white],
  ]) {
    const a = luminance(foreground!), b = luminance(background!);
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
  }
});
