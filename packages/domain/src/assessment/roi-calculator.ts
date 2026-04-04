import { z } from "zod";

export const ROIParametersSchema = z.object({
  totalEmployees: z.number().positive(),
  avgAnnualSalary: z.number().positive(), // BRL
  turnoverRatePercent: z.number().min(0).max(100),
  absenteeismDaysPerYear: z.number().min(0),
  burnoutRiskPrevalencePercent: z.number().min(0).max(100)
});

export type ROIParameters = z.infer<typeof ROIParametersSchema>;

export interface ROIResult {
  estimatedAnnualLoss: number;
  potentialAnnualSavings: number;
  paybackMonths: number;
  details: {
    turnoverCost: number;
    absenteeismCost: number;
    productivityLoss: number;
  };
}

/**
 * Calculates the potential financial impact of psychosocial risk management.
 * Models turnover replacement cost (typically 1.5x salary) and productivity loss.
 */
export function calculatePotentialROI(params: ROIParameters): ROIResult {
  const {
    totalEmployees,
    avgAnnualSalary,
    turnoverRatePercent,
    absenteeismDaysPerYear,
    burnoutRiskPrevalencePercent
  } = params;

  const annualPayroll = totalEmployees * avgAnnualSalary;
  const standardWorkDays = 250;
  const dayValue = avgAnnualSalary / standardWorkDays;

  // Turnover replacement cost (estimated 1.2x salary per replacement)
  const turnoverCost = (totalEmployees * (turnoverRatePercent / 100)) * avgAnnualSalary * 1.2;

  // Absenteeism cost
  const absenteeismCost = (totalEmployees * absenteeismDaysPerYear) * dayValue;

  // Productivity loss for high risk population (estimated 20% loss in output)
  const highRiskCount = totalEmployees * (burnoutRiskPrevalencePercent / 100);
  const productivityLoss = highRiskCount * avgAnnualSalary * 0.2;

  const estimatedAnnualLoss = turnoverCost + absenteeismCost + productivityLoss;

  // Targeted savings (estimated 25% reduction in these losses through MindOps)
  const potentialAnnualSavings = estimatedAnnualLoss * 0.25;

  return {
    estimatedAnnualLoss,
    potentialAnnualSavings,
    paybackMonths: 3.5, // Estimated standard
    details: {
      turnoverCost,
      absenteeismCost,
      productivityLoss
    }
  };
}
