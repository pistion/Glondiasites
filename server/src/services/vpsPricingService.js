import * as vultr from './vultrApiService.js';

const MARKUP_PERCENT = Number(process.env.PLATFORM_MARKUP_PERCENT ?? 30);

export function calcPricing(planMonthlyCost) {
  const baseCents = Math.round(planMonthlyCost * 100);
  const mkupCents = Math.round(baseCents * (MARKUP_PERCENT / 100));
  return { baseCents, mkupCents, totalCents: baseCents + mkupCents, markup: MARKUP_PERCENT };
}

export async function getQuote(planId, region, osId) {
  const plans = await vultr.listPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) throw Object.assign(new Error(`Plan "${planId}" not found.`), { status: 404 });
  const { baseCents, mkupCents, totalCents, markup } = calcPricing(plan.monthly_cost);
  return {
    plan: planId, region, osId,
    baseMonthlyCostCents:  baseCents,
    markupPercent:         markup,
    markupAmountCents:     mkupCents,
    totalMonthlyCostCents: totalCents,
    currency: 'USD',
    breakdown: {
      vpsPrice:    `$${(baseCents  / 100).toFixed(2)}`,
      platformFee: `$${(mkupCents  / 100).toFixed(2)}`,
      total:       `$${(totalCents / 100).toFixed(2)}`,
    },
  };
}
