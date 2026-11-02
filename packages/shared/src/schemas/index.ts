import { z } from 'zod';
export const fieldNames = ['productName', 'ingredientsRaw'] as const;
export const completenessSchema = z.enum(['read', 'missing', 'illegible', 'cropped', 'uncertain']);
export const labelSchema = z.object({
  productName: z.string().max(200).nullable(), ingredientsRaw: z.string().max(6000).nullable(),
  ingredients: z.array(z.string().max(500)).max(120),
  fieldCompleteness: z.object({ productName: completenessSchema, ingredientsRaw: completenessSchema }),
  extractionWarnings: z.array(z.string().max(500)).max(20),
}).refine(label => fieldNames.every(field => label.fieldCompleteness[field] !== 'read' || !!label[field]?.trim()), { message: 'Campo marcado como lido precisa ter texto.' });
export const novaSchema = z.object({
  group: z.enum(['1', '2', '3', '4', 'indeterminate']), status: z.enum(['estimated', 'insufficient']),
  summary: z.string().min(1).max(1000), evidence: z.array(z.string().min(1).max(600)).max(20),
  missingInformation: z.array(z.string().max(500)).max(20), limitations: z.array(z.string().max(500)).max(20),
});
export const analysisSchema = z.object({
  id: z.string(), label: labelSchema, novaAssessment: novaSchema,
  guideRecommendation: z.object({ text: z.string(), source: z.string(), url: z.url() }), createdAt: z.iso.datetime(),
});
export const analyzeRequestSchema = z.object({ label: labelSchema });
export const imageSchema = z.object({ mimeType: z.enum(['image/jpeg', 'image/png']), data: z.string().min(16).max(5600000).regex(/^[A-Za-z0-9+/]+={0,2}$/) });
export const extractRequestSchema = z.object({ images: z.array(imageSchema).length(1) });
export type LabelExtraction = z.infer<typeof labelSchema>;
export type NovaAssessment = z.infer<typeof novaSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type LabelImage = z.infer<typeof imageSchema>;
