/**
 * Exact integer minor-unit (USD cents) pricing, shipping, and tax calculations.
 *
 * Hand-worked verification case:
 * - Item A: unitPriceCents = 8500 ($85.00), quantity = 2 -> lineTotal = 17000 ($170.00)
 * - Subtotal = 17000 (< 18000 free-shipping threshold)
 * - Standard shipping = 1400 ($14.00)
 * - Taxable amount = 17000 + 1400 = 18400
 * - Tax at 8.25% (825 bps): Math.round(18400 * 825 / 10000) = Math.round(1518) = 1518 ($15.18)
 * - Total = 17000 + 1400 + 1518 = 19918 ($199.18)
 *
 * Invariant: subtotalCents - discountCents + shippingCents + taxCents === totalCents
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 18000; // $180.00
export const STANDARD_TUBE_SHIPPING_CENTS = 1400; // $14.00
export const FLAT_CRATE_SHIPPING_CENTS = 3400; // $34.00
export const TEXAS_SALES_TAX_BPS = 825; // 8.25% = 825 basis points

export type ShippingMethod = 'standard_tube' | 'flat_crate';

export interface PricedLineInput {
  unitPriceCents: number;
  quantity: number;
}

export interface OrderTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  remainingForFreeShippingCents: number;
  qualifiesForFreeStandardShipping: boolean;
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.round(cents) : 0;
  return usdFormatter.format(safeCents / 100);
}

export function computeLineTotalCents(unitPriceCents: number, quantity: number): number {
  const safePrice = Number.isFinite(unitPriceCents) ? Math.max(0, Math.round(unitPriceCents)) : 0;
  const safeQty = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
  return safePrice * safeQty;
}

export function computeOrderTotals(
  lines: PricedLineInput[],
  shippingMethod: ShippingMethod = 'standard_tube',
  discountCentsInput = 0
): OrderTotals {
  const subtotalCents = lines.reduce(
    (sum, item) => sum + computeLineTotalCents(item.unitPriceCents, item.quantity),
    0
  );

  const discountCents = Math.min(
    subtotalCents,
    Number.isFinite(discountCentsInput) ? Math.max(0, Math.round(discountCentsInput)) : 0
  );

  const netMerchandiseCents = subtotalCents - discountCents;
  const qualifiesForFreeStandardShipping = netMerchandiseCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const remainingForFreeShippingCents = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - netMerchandiseCents
  );

  let shippingCents = 0;
  if (lines.length > 0 && netMerchandiseCents > 0) {
    if (shippingMethod === 'flat_crate') {
      shippingCents = FLAT_CRATE_SHIPPING_CENTS;
    } else {
      shippingCents = qualifiesForFreeStandardShipping ? 0 : STANDARD_TUBE_SHIPPING_CENTS;
    }
  }

  const taxableBaseCents = netMerchandiseCents + shippingCents;
  const taxCents = Math.round((taxableBaseCents * TEXAS_SALES_TAX_BPS) / 10000);
  const totalCents = netMerchandiseCents + shippingCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    remainingForFreeShippingCents,
    qualifiesForFreeStandardShipping,
  };
}

export function computeTradeEstimate(quantity: number, unitPriceCents: number): {
  grossCents: number;
  tierRatePercent: number;
  discountCents: number;
  netCents: number;
} {
  const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.min(500, Math.floor(quantity))) : 1;
  const safeUnit = Number.isFinite(unitPriceCents) ? Math.max(0, Math.round(unitPriceCents)) : 0;
  const grossCents = safeQty * safeUnit;
  const tierRatePercent = safeQty >= 25 ? 25 : safeQty >= 10 ? 20 : safeQty >= 4 ? 15 : 0;
  const discountCents = Math.round((grossCents * tierRatePercent) / 100);
  const netCents = grossCents - discountCents;
  return { grossCents, tierRatePercent, discountCents, netCents };
}

// Self-check against the documented hand-worked case & exact-sum invariant
(function verifyPricingModule() {
  const known = computeOrderTotals([{ unitPriceCents: 8500, quantity: 2 }], 'standard_tube', 0);
  if (
    known.subtotalCents !== 17000 ||
    known.shippingCents !== 1400 ||
    known.taxCents !== 1518 ||
    known.totalCents !== 19918
  ) {
    console.error('Pricing known-case check mismatch', known);
  }
  if (known.subtotalCents - known.discountCents + known.shippingCents + known.taxCents !== known.totalCents) {
    console.error('Pricing exact-sum invariant failed', known);
  }
})();
