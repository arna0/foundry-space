import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Trash2, X } from 'lucide-react';
import {
  BORDER_OPTIONS,
  SIZE_OPTIONS,
  SUBSTRATE_OPTIONS,
  type ArchivalPrint,
  type BorderOptionId,
  type PrintSizeId,
  type SubstrateId,
} from '../data/catalogue';
import {
  FLAT_CRATE_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_TUBE_SHIPPING_CENTS,
  computeLineTotalCents,
  computeOrderTotals,
  formatUsd,
  type ShippingMethod,
} from '../lib/pricing';
import { Button, Field, Input, Select, Surface } from './ui';

export interface BagLineItem {
  lineId: string;
  print: ArchivalPrint;
  sizeId: PrintSizeId;
  substrateId: SubstrateId;
  borderId: BorderOptionId;
  unitPriceCents: number;
  quantity: number;
}

interface TubeDrawerProps {
  isOpen: boolean;
  items: BagLineItem[];
  onClose: () => void;
  onUpdateQuantity: (lineId: string, nextQuantity: number) => void;
  onRemoveItem: (lineId: string) => void;
  onProceedToCheckout: () => void;
}

export const TubeDrawer: React.FC<TubeDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const totals = computeOrderTotals(items, 'standard_tube', 0);
  const progressRatio = Math.min(1, totals.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-foreground/35"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tube-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
            className="relative z-10 flex h-dvh w-full max-w-lg flex-col border-l border-border/50 bg-surface text-foreground shadow-float"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-border/35 px-6 py-4">
              <h2 id="tube-drawer-title" className="font-display text-heading font-medium tracking-wide text-foreground">
                Cart · {items.reduce((sum, item) => sum + item.quantity, 0)} {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'} in your cart
              </h2>
              <motion.button
                ref={closeButtonRef}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                aria-label="Close archival tube"
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control text-foreground hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </div>

            {/* Free shipping threshold bar */}
            <div className="border-b border-border/35 px-6 py-3.5">
              <p className="text-caption text-muted">
                {totals.qualifiesForFreeStandardShipping ? (
                  <span className="font-medium text-foreground">
                    Qualifies for complimentary heavy-wall Kraft tube shipping.
                  </span>
                ) : (
                  <>
                    Add{' '}
                    <span className="font-medium tabular-nums text-foreground">
                      {formatUsd(totals.remainingForFreeShippingCents)}
                    </span>{' '}
                    more for complimentary standard archival tube shipping (from{' '}
                    {formatUsd(FREE_SHIPPING_THRESHOLD_CENTS)}).
                  </>
                )}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border/25">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${Math.round(progressRatio * 100)}%` }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            {/* Scrollable line items inside full-viewport drawer */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="py-12"
                >
                  <p className="font-display text-heading text-foreground">
                    Your archival tube is empty.
                  </p>
                  <p className="mt-2 text-label text-muted">
                    Choose any plate from the catalogue to configure sheet dimensions and cotton rag
                    media.
                  </p>
                  <div className="mt-6">
                    <Button tone="quiet" onClick={onClose}>
                      Browse print catalogue
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <ul className="divide-y divide-border/35">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const size = SIZE_OPTIONS.find((s) => s.id === item.sizeId);
                      const sub = SUBSTRATE_OPTIONS.find((s) => s.id === item.substrateId);
                      const border = BORDER_OPTIONS.find((b) => b.id === item.borderId);
                      const lineTotalCents = computeLineTotalCents(
                        item.unitPriceCents,
                        item.quantity
                      );

                      return (
                        <motion.li
                          key={item.lineId}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, x: 28, height: 0 }}
                          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                          className="py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-caption text-muted">
                                {item.print.catalogNumber} · {item.print.category}
                              </p>
                              <p className="mt-0.5 font-medium text-foreground">
                                {item.print.title}
                              </p>
                              <p className="mt-1 text-caption text-muted">
                                {size?.label} · {sub?.shortName} · {border?.label}
                              </p>
                            </div>
                            <span className="shrink-0 font-semibold tabular-nums text-foreground">
                              {formatUsd(lineTotalCents)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-1.5">
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.lineId, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.print.title}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-border/55 text-label font-medium hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                              >
                                −
                              </motion.button>
                              <span className="min-w-8 text-center text-label font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.lineId, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.print.title}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-border/55 text-label font-medium hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                              >
                                +
                              </motion.button>
                            </div>

                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onRemoveItem(item.lineId)}
                              className="inline-flex min-h-9 items-center gap-1.5 px-2 text-caption text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Remove
                            </motion.button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 ? (
              <div className="border-t border-border/45 px-6 py-5 space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-label text-muted">Print subtotal (unframed)</span>
                  <span className="text-heading font-semibold tabular-nums text-foreground">
                    {formatUsd(totals.subtotalCents)}
                  </span>
                </div>
                <p className="text-caption text-muted">
                  Shipping, framing specifications, and sales tax calculated at checkout.
                </p>
                <Button tone="primary" onClick={onProceedToCheckout} className="w-full py-3.5 rounded-full uppercase tracking-wider font-semibold text-label">
                  Checkout · {formatUsd(totals.subtotalCents)}
                </Button>
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export interface ConfirmedOrderData {
  orderNumber: string;
  placedDateLabel: string;
  customerName: string;
  email: string;
  addressSummary: string;
  shippingMethod: ShippingMethod;
  paymentMethodLabel: string;
  items: BagLineItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

interface CheckoutViewProps {
  items: BagLineItem[];
  onBackToShop: () => void;
  onOrderConfirmed: (order: ConfirmedOrderData) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  onBackToShop,
  onOrderConfirmed,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('TX');
  const [postalCode, setPostalCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard_tube');
  const [paymentOption, setPaymentOption] = useState('Express invoice dispatch');
  const [framerNote, setFramerNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totals = computeOrderTotals(items, shippingMethod, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter the recipient full name for archival tube delivery.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address so we can send tracking and framing notes.';
    }
    if (street.trim().length < 4) {
      nextErrors.street = 'Enter a street address where tubes or flat crates can be signed for.';
    }
    if (city.trim().length < 2) {
      nextErrors.city = 'Enter your city.';
    }
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(postalCode.trim())) {
      nextErrors.postalCode = 'Enter a valid 5-digit ZIP or postal code.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const now = new Date();
    const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderNumber = `BP-${now.getFullYear()}-${String(4210 + (now.getSeconds() % 570))}`;

    onOrderConfirmed({
      orderNumber,
      placedDateLabel: localDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      customerName: fullName.trim(),
      email: email.trim(),
      addressSummary: `${street.trim()}, ${city.trim()}, ${region.trim()} ${postalCode.trim()}`,
      shippingMethod,
      paymentMethodLabel: paymentOption,
      items: [...items],
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
    });
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <h1 className="font-display text-title text-foreground">Your archival tube is empty</h1>
        <p className="mt-2 text-body text-muted">
          Select at least one edition from the print catalogue before opening checkout.
        </p>
        <div className="mt-6">
          <Button tone="primary" onClick={onBackToShop}>
            Return to print catalogue
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 pb-20">
      <button
        type="button"
        onClick={onBackToShop}
        className="inline-flex items-center gap-1.5 text-label font-medium text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to catalogue
      </button>

      <h1 className="mt-6 font-display text-title text-foreground">
        Made-to-order print checkout
      </h1>
      <p className="mt-1 text-label text-muted">
        Each sheet is printed upon confirmation in our Austin conservation pressroom and dispatched
        within 3–5 business days.
      </p>

      {/* Single-column form per 1_ecommerce_retail.md Section 2 */}
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
        {/* Order line summary */}
        <Surface className="border border-border/45 p-6">
          <h2 className="text-heading font-medium text-foreground">Edition summary</h2>
          <ul className="mt-4 divide-y divide-border/35 border-t border-b border-border/35">
            {items.map((item) => {
              const size = SIZE_OPTIONS.find((s) => s.id === item.sizeId);
              const sub = SUBSTRATE_OPTIONS.find((s) => s.id === item.substrateId);
              const border = BORDER_OPTIONS.find((b) => b.id === item.borderId);
              return (
                <li key={item.lineId} className="flex items-start justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-label font-medium text-foreground">
                      {item.quantity} × {item.print.title}
                    </p>
                    <p className="text-caption text-muted">
                      {item.print.catalogNumber} · {size?.label} · {sub?.shortName} ·{' '}
                      {border?.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-label font-semibold tabular-nums text-foreground">
                    {formatUsd(computeLineTotalCents(item.unitPriceCents, item.quantity))}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 space-y-2 text-label">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Print subtotal</dt>
              <dd className="tabular-nums text-foreground">{formatUsd(totals.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {shippingMethod === 'flat_crate'
                  ? 'Flat conservation wood crate'
                  : '4-in heavy-wall Kraft archival tube'}
              </dt>
              <dd className="tabular-nums text-foreground">
                {totals.shippingCents === 0 ? 'Complimentary ($0.00)' : formatUsd(totals.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Texas sales tax (8.25%)</dt>
              <dd className="tabular-nums text-foreground">{formatUsd(totals.taxCents)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border/35 pt-3 text-heading font-semibold text-foreground">
              <dt>Total due (USD)</dt>
              <dd className="tabular-nums">{formatUsd(totals.totalCents)}</dd>
            </div>
          </dl>
        </Surface>

        {/* Recipient & shipping address */}
        <Surface className="border border-border/45 p-6 space-y-5">
          <h2 className="text-heading font-medium text-foreground">
            Recipient &amp; delivery address
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="checkout-name" label="Full name" error={errors.fullName}>
              <Input
                id="checkout-name"
                name="name"
                autoComplete="name"
                placeholder="Clara Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>

            <Field id="checkout-email" label="Email for tracking & framing guide" error={errors.email}>
              <Input
                id="checkout-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="clara@vancearchitects.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          <Field
            id="checkout-street"
            label="Street address (home, studio, or direct to framer)"
            error={errors.street}
          >
            <Input
              id="checkout-street"
              name="street-address"
              autoComplete="street-address"
              placeholder="1408 West 6th Street, Suite 2B"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field id="checkout-city" label="City" error={errors.city}>
              <Input
                id="checkout-city"
                name="address-level2"
                autoComplete="address-level2"
                placeholder="Austin"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Field>

            <Field id="checkout-region" label="State / Province">
              <Input
                id="checkout-region"
                name="address-level1"
                autoComplete="address-level1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </Field>

            <Field id="checkout-postal" label="ZIP / Postal code" error={errors.postalCode}>
              <Input
                id="checkout-postal"
                name="postal-code"
                autoComplete="postal-code"
                placeholder="78703"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </Field>
          </div>
        </Surface>

        {/* Packaging & Billing Method (collects no raw card numbers per 1_ecommerce_retail.md) */}
        <Surface className="border border-border/45 p-6 space-y-6">
          <div>
            <h2 className="text-heading font-medium text-foreground">Archival packaging</h2>
            <div
              className="mt-3 divide-y divide-border/35 border-t border-b border-border/35"
              role="radiogroup"
              aria-label="Archival packaging"
            >
              <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'standard_tube'}
                    onChange={() => setShippingMethod('standard_tube')}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-label font-medium text-foreground">
                      4-inch heavy-wall Kraft archival tube
                    </span>
                    <span className="block text-caption text-muted">
                      Rolled in acid-free glassine tissue · Complimentary from{' '}
                      {formatUsd(FREE_SHIPPING_THRESHOLD_CENTS)}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-label font-medium tabular-nums text-foreground">
                  {totals.qualifiesForFreeStandardShipping
                    ? '$0.00'
                    : formatUsd(STANDARD_TUBE_SHIPPING_CENTS)}
                </span>
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'flat_crate'}
                    onChange={() => setShippingMethod('flat_crate')}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-label font-medium text-foreground">
                      Flat conservation board portfolio crate
                    </span>
                    <span className="block text-caption text-muted">
                      Recommended when delivering directly to a commercial frame shop for immediate
                      mounting
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-label font-medium tabular-nums text-foreground">
                  {formatUsd(FLAT_CRATE_SHIPPING_CENTS)}
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-border/35 pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="checkout-payment" label="Settlement method">
              <Select
                id="checkout-payment"
                value={paymentOption}
                onChange={(e) => setPaymentOption(e.target.value)}
              >
                <option value="Express invoice dispatch">Express invoice dispatch</option>
                <option value="Digital wallet authorization">Digital wallet authorization</option>
                <option value="Trade studio purchase order (Net 15)">
                  Trade studio purchase order (Net 15)
                </option>
              </Select>
            </Field>

            <Field id="checkout-framer-note" label="Framer or receiving note (optional)">
              <Input
                id="checkout-framer-note"
                placeholder="Attn: Frame shop receiving desk"
                value={framerNote}
                onChange={(e) => setFramerNote(e.target.value)}
              />
            </Field>
          </div>
        </Surface>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-caption text-muted">
            30-day return policy on undamaged archival prints.
          </p>
          <Button type="submit" tone="primary" disabled={submitting} className="px-8 py-3">
            {submitting
              ? 'Placing print order…'
              : `Confirm order · ${formatUsd(totals.totalCents)}`}
          </Button>
        </div>
      </form>
    </section>
  );
};

interface OrderConfirmationViewProps {
  order: ConfirmedOrderData;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onContinueShopping,
}) => {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8 pb-24">
      <Surface className="border border-border/45 p-6 sm:p-10 space-y-6">
        <div className="inline-flex items-center gap-2 text-label font-medium text-primary">
          <Check className="h-4 w-4" aria-hidden="true" />
          Order confirmed · {order.orderNumber}
        </div>

        <div>
          <h1 className="font-display text-title text-foreground">
            Your sheets are queued for printing in Austin
          </h1>
          <p className="mt-2 max-w-[62ch] text-body text-muted">
            Confirmation and custom framing dimensions have been sent to{' '}
            <span className="font-medium text-foreground">{order.email}</span>. Allow 3–5 business
            days for pigment curing before your package ships to{' '}
            <span className="font-medium text-foreground">{order.addressSummary}</span>.
          </p>
        </div>

        <div className="border-t border-b border-border/35 py-5">
          <h2 className="text-heading font-medium text-foreground">Ordered plates</h2>
          <ul className="mt-3 divide-y divide-border/30">
            {order.items.map((item) => {
              const size = SIZE_OPTIONS.find((s) => s.id === item.sizeId);
              const sub = SUBSTRATE_OPTIONS.find((s) => s.id === item.substrateId);
              const border = BORDER_OPTIONS.find((b) => b.id === item.borderId);
              return (
                <li key={item.lineId} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-label font-medium text-foreground">
                      {item.quantity} × {item.print.title} ({item.print.catalogNumber})
                    </p>
                    <p className="text-caption text-muted">
                      {size?.label} · {sub?.shortName} · {border?.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-label font-medium tabular-nums text-foreground">
                    {formatUsd(computeLineTotalCents(item.unitPriceCents, item.quantity))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <dl className="space-y-2 text-label">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Order date</dt>
            <dd className="text-foreground">{order.placedDateLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Settlement</dt>
            <dd className="text-foreground">{order.paymentMethodLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Print subtotal</dt>
            <dd className="tabular-nums text-foreground">{formatUsd(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Archival packaging &amp; freight</dt>
            <dd className="tabular-nums text-foreground">{formatUsd(order.shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Texas sales tax (8.25%)</dt>
            <dd className="tabular-nums text-foreground">{formatUsd(order.taxCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border/35 pt-3 text-heading font-semibold text-foreground">
            <dt>Total confirmed (USD)</dt>
            <dd className="tabular-nums">{formatUsd(order.totalCents)}</dd>
          </div>
        </dl>

        <div className="pt-2">
          <Button tone="primary" onClick={onContinueShopping}>
            Continue browsing print archive
          </Button>
        </div>
      </Surface>
    </section>
  );
};
