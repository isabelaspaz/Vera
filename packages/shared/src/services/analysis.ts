import type { Analysis, LabelExtraction, NovaAssessment } from '../schemas/index';
import { classifyNova } from './nova';
import { splitIngredients } from './label';
import { guideCatalog, GUIDE_SOURCE, GUIDE_URL } from '../constants/guide';
export function analyzeLabel(label: LabelExtraction, id = `analysis-${Date.now()}`, assessment: NovaAssessment = classifyNova(label)): Analysis {
  return { id, label: { ...label, ingredients: splitIngredients(label.ingredientsRaw) }, novaAssessment: assessment,
    guideRecommendation: { text: guideCatalog[assessment.group], source: GUIDE_SOURCE, url: GUIDE_URL }, createdAt: new Date().toISOString() };
}
