import type { LabelExtraction } from '@vera/shared';
export function fixture(productName: string, ingredientsRaw: string | null): LabelExtraction {
  return { productName, ingredientsRaw, ingredients: (ingredientsRaw ?? '').split(',').map(s => s.trim()).filter(Boolean),
    fieldCompleteness: { productName: 'read', ingredientsRaw: ingredientsRaw ? 'read' : 'illegible' }, extractionWarnings: ['Fixture de teste.'] };
}
export const sampleLabels = [
  fixture('Aveia em flocos', 'Aveia em flocos'), fixture('Azeite de oliva', 'Azeite de oliva'),
  fixture('Milho em conserva', 'Milho, água, sal'),
  fixture('Biscoito de cacau', 'Farinha de trigo, açúcar, óleo de soja, cacau, emulsificante lecitina de soja, aromatizante'),
  fixture('Rótulo ilegível', null),
];
