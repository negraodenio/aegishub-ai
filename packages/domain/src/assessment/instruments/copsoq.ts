import { z } from "zod";

export const COPSOQDimensionSchema = z.object({
  code: z.string(),
  name: z.string(),
  category: z.string(), // 'demandas', 'apoio', 'relacoes', 'resultados'
  isPositive: z.boolean().default(false) // If true, higher score is better
});

export const COPSOQResponseSchema = z.object({
  itemCode: z.string(),
  value: z.number().min(1).max(5), // Likert 1-5
  isReversed: z.boolean().default(false)
});

export type COPSOQDimension = z.infer<typeof COPSOQDimensionSchema>;
export type COPSOQResponse = z.infer<typeof COPSOQResponseSchema>;

export const COPSOQ_DIMENSIONS: Record<string, COPSOQDimension> = {
  QD: { code: "QD", name: "Exigências Quantitativas", category: "demandas" },
  ED: { code: "ED", name: "Exigências Emocionais", category: "demandas" },
  IW: { code: "IW", name: "Influência no Trabalho", category: "apoio", isPositive: true },
  SC: { code: "SC", name: "Apoio Social (Colegas)", category: "apoio", isPositive: true },
  SLP: { code: "SLP", name: "Sintomas de Burnout", category: "resultados" },
  JS: { code: "JS", name: "Satisfação no Trabalho", category: "resultados", isPositive: true },
  OB: { code: "OB", name: "Comportamentos Ofensivos", category: "relacoes" }
};
