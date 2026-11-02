import type { LabelExtraction } from '../schemas/index';
export function fixture(productName: string, ingredientsRaw: string | null): LabelExtraction {
  return { productName, ingredientsRaw, ingredients: (ingredientsRaw ?? '').split(',').map(s => s.trim()).filter(Boolean),
    fieldCompleteness: { productName: 'read', ingredientsRaw: ingredientsRaw ? 'read' : 'illegible' }, extractionWarnings: ['Exemplo fictício de demonstração.'] };
}
export const demoLabels = [
  fixture('Aveia em flocos', 'Aveia em flocos'), fixture('Azeite de oliva', 'Azeite de oliva'),
  fixture('Milho em conserva', 'Milho, água, sal'),
  fixture('Biscoito de cacau', 'Farinha de trigo, açúcar, óleo de soja, cacau, emulsificante lecitina de soja, aromatizante'),
  fixture('Rótulo ilegível', null),
];
