export const normalize = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const splitIngredients = (raw: string | null) => (raw ?? '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean).slice(0, 120);
