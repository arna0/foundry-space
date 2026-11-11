import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import {
  SIZE_OPTIONS,
  SUBSTRATE_OPTIONS,
  type PrintSizeId,
  type SubstrateId,
} from '../data/catalogue';
import { computeTradeEstimate, formatUsd } from '../lib/pricing';
import { Button, Field, Input, Select, Surface, Textarea } from './ui';
import { ConservationCrossSectionDiagram } from './FramingDiagrams';

interface TradeSubmissionRecord {
  referenceId: string;
  firmName: string;
  contactEmail: string;
  projectType: string;
  quantity: number;
  sizeLabel: string;
  substrateName: string;
  estimatedNetCents: number;
  submittedAtLabel: string;
}

const TRADE_STORAGE_KEY = 'barrow_plate_trade_inquiries_v1';

function saveTradeInquiry(record: TradeSubmissionRecord) {
  try {
    const raw = window.localStorage.getItem(TRADE_STORAGE_KEY);
    const parsed: TradeSubmissionRecord[] = raw ? JSON.parse(raw) : [];
    const safeList = Array.isArray(parsed) ? parsed : [];
    window.localStorage.setItem(
      TRADE_STORAGE_KEY,
      JSON.stringify([record, ...safeList].slice(0, 20))
    );
  } catch {
    // Graceful fallback if storage is restricted in iframe sandbox
  }
}

export const FramingAndTradeSections: React.FC = () => {
  // Trade estimator & inquiry state
  const [tradeSizeId, setTradeSizeId] = useState<PrintSizeId>('18x24');
  const [tradeSubstrateId, setTradeSubstrateId] = useState<SubstrateId>('obsidian_rag_340');
  const [tradeQuantity, setTradeQuantity] = useState<number>(12);

  const [firmName, setFirmName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [projectType, setProjectType] = useState('Observatory & planetarium installations');
  const [installSchedule, setInstallSchedule] = useState('Q2 2027');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ firmName?: string; contactEmail?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedInquiry, setConfirmedInquiry] = useState<TradeSubmissionRecord | null>(null);

  const selectedSize = SIZE_OPTIONS.find((s) => s.id === tradeSizeId) ?? SIZE_OPTIONS[1];
  const selectedSubstrate =
    SUBSTRATE_OPTIONS.find((s) => s.id === tradeSubstrateId) ?? SUBSTRATE_OPTIONS[0];

  // Base reference edition price $68.00 + size + substrate delta
  const unitPriceCents = Math.max(
    2400,
    6800 + selectedSize.priceDeltaCents + selectedSubstrate.priceDeltaCents
  );
  const estimate = computeTradeEstimate(tradeQuantity, unitPriceCents);

  const handleQuantityChange = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setTradeQuantity(1);
      return;
    }
    setTradeQuantity(Math.max(1, Math.min(500, parsed)));
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { firmName?: string; contactEmail?: string } = {};
    if (firmName.trim().length < 2) {
      nextErrors.firmName = 'Enter your studio, firm, or property name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      nextErrors.contactEmail = 'Enter a valid studio email address (for example, sourcing@studio.com).';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const now = new Date();
    const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const refNumber = `TR-${now.getFullYear()}-${String(1040 + (now.getSeconds() % 890))}`;
    const record: TradeSubmissionRecord = {
      referenceId: refNumber,
      firmName: firmName.trim(),
      contactEmail: contactEmail.trim(),
      projectType,
      quantity: tradeQuantity,
      sizeLabel: selectedSize.label,
      substrateName: selectedSubstrate.shortName,
      estimatedNetCents: estimate.netCents,
      submittedAtLabel: localDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    saveTradeInquiry(record);
    setConfirmedInquiry(record);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Archival Substrates & Custom Framing Guide */}
      <section
        id="framing-guide"
        className="border-t border-border/35 bg-surface py-16 sm:py-24"
      >
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <h2 className="font-display text-title text-foreground">
              Printed unframed on astronomical rag so your gallery controls titanium or timber framing
            </h2>
            <p className="mt-3 max-w-[65ch] text-body text-muted">
              Every deep-space sheet is produced individually to order with archival 12-channel aqueous pigment
              inks. Because shipping glazed frames across climates risks miter stress and
              acrylic static, our plates arrive unmounted in heavy-wall tubes ready for Optium museum framing.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left: Conservation framing stack SVG + substrate comparison table */}
            <div className="min-w-0 lg:col-span-7">
              <h3 className="text-heading font-medium text-foreground">
                Observatory conservation framing stack
              </h3>
              <p className="mt-1 text-label text-muted">
                Engineered for sunlit planetarium atriums, aerospace campuses, and private research salons
              </p>
              <div className="mt-5 border-t border-b border-border/35 py-6">
                <ConservationCrossSectionDiagram />
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/45">
                      <th className="py-3 pr-4 text-caption font-semibold uppercase tracking-[0.06em] text-muted">
                        Substrate
                      </th>
                      <th className="py-3 px-4 text-caption font-semibold uppercase tracking-[0.06em] text-muted">
                        Weight (GSM)
                      </th>
                      <th className="py-3 px-4 text-caption font-semibold uppercase tracking-[0.06em] text-muted">
                        Caliper
                      </th>
                      <th className="py-3 pl-4 text-caption font-semibold uppercase tracking-[0.06em] text-muted">
                        Surface &amp; OBA content
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-label">
                    {SUBSTRATE_OPTIONS.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-3.5 pr-4 font-medium text-foreground">{sub.name}</td>
                        <td className="py-3.5 px-4 tabular-nums text-foreground">{sub.gsm} gsm</td>
                        <td className="py-3.5 px-4 tabular-nums text-foreground">
                          {sub.caliperMil} mil
                        </td>
                        <td className="py-3.5 pl-4 text-muted">{sub.finish}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Moulding & mat pairing guide */}
            <div className="min-w-0 lg:col-span-5">
              <h3 className="text-heading font-medium text-foreground">
                Titanium, bronze &amp; mat board schedule
              </h3>
              <p className="mt-1 text-label text-muted">
                Specify 8-ply acid-free Starlight Obsidian rag board with a 0.25-inch window overlap over our printed
                calibrated border.
              </p>

              <div className="mt-5 divide-y divide-border/35 border-t border-b border-border/35">
                {SIZE_OPTIONS.map((sz) => (
                  <div key={sz.id} className="py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-label font-semibold tabular-nums text-foreground">
                        {sz.label} sheet
                      </span>
                      <span className="text-caption tabular-nums text-muted">
                        Outer frame approx. {sz.widthInches + 4} × {sz.heightInches + 4} in
                      </span>
                    </div>
                    <p className="mt-1 text-label text-muted">{sz.recommendedMoulding}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-label text-muted">
                <p className="font-medium text-foreground">Handling upon arrival</p>
                <p>
                  Allow rolled obsidian rag sheets to relax flat on a clean table under acid-free
                  interleaving glassine for 24 hours before hinging, or pass the sealed tube directly to your
                  framer unopened.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade & Hospitality Sourcing Section */}
      <section id="hospitality-trade" className="border-t border-border/35 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left column: Hospitality & Interior Trade Program */}
            <div className="min-w-0 lg:col-span-5">
              <h2 className="font-display text-title text-foreground">
                Observatory, aerospace &amp; institutional trade sourcing
              </h2>
              <p className="mt-3 max-w-[60ch] text-body text-muted">
                We partner directly with observatory curators, planetarium architects, aerospace design labs,
                and corporate research salons to install cohesive deep-space cartography and gravitational lensing folios.
              </p>

              {/* Live volume tier estimator */}
              <div className="mt-8 border-t border-b border-border/35 py-6">
                <h3 className="text-heading font-medium text-foreground">
                  Room-set trade tier estimator
                </h3>
                <p className="mt-1 text-caption text-muted">
                  Computed from standard edition pricing in USD; trade discount applies automatically
                  at 4+, 10+, and 25+ sheets per project schedule.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field id="trade-size" label="Target sheet size">
                    <Select
                      id="trade-size"
                      value={tradeSizeId}
                      onChange={(e) => setTradeSizeId(e.target.value as PrintSizeId)}
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field id="trade-substrate" label="Substrate">
                    <Select
                      id="trade-substrate"
                      value={tradeSubstrateId}
                      onChange={(e) => setTradeSubstrateId(e.target.value as SubstrateId)}
                    >
                      {SUBSTRATE_OPTIONS.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.shortName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="mt-4">
                  <Field
                    id="trade-qty"
                    label="Estimated print count (sheets)"
                    hint="15% trade tier from 4 sheets · 20% from 10 sheets · 25% hospitality tier from 25 sheets"
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        tone="quiet"
                        onClick={() => setTradeQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease sheet count"
                      >
                        −
                      </Button>
                      <Input
                        id="trade-qty"
                        type="number"
                        min={1}
                        max={500}
                        step={1}
                        value={tradeQuantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="tabular-nums text-center max-w-[120px]"
                      />
                      <Button
                        tone="quiet"
                        onClick={() => setTradeQuantity((q) => Math.min(500, q + 1))}
                        aria-label="Increase sheet count"
                      >
                        +
                      </Button>
                    </div>
                  </Field>
                </div>

                <dl className="mt-6 space-y-2 border-t border-border/35 pt-4 text-label">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Retail schedule ({tradeQuantity} sheets)</dt>
                    <dd className="tabular-nums text-foreground">
                      {formatUsd(estimate.grossCents)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">
                      Trade tier reduction ({estimate.tierRatePercent}% rate)
                    </dt>
                    <dd className="tabular-nums text-foreground">
                      −{formatUsd(estimate.discountCents)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-1 font-semibold text-foreground">
                    <dt>Estimated net trade schedule (pre-tax)</dt>
                    <dd className="tabular-nums">{formatUsd(estimate.netCents)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right column: Working Trade Specification Form */}
            <div className="min-w-0 lg:col-span-7">
              <Surface className="border border-border/45 p-6 sm:p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  {confirmedInquiry ? (
                    <motion.div
                      key="confirmed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      role="status"
                      className="space-y-4"
                    >
                      <div className="inline-flex items-center gap-2 text-label font-medium text-primary">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Trade schedule recorded · Reference {confirmedInquiry.referenceId}
                      </div>
                      <h3 className="font-display text-title text-foreground">
                        Specification brief logged for {confirmedInquiry.firmName}
                      </h3>
                      <p className="max-w-[60ch] text-body text-muted">
                        Our Austin print room has logged your request for{' '}
                        <span className="font-medium text-foreground">
                          {confirmedInquiry.quantity} × {confirmedInquiry.sizeLabel}
                        </span>{' '}
                        sheets on {confirmedInquiry.substrateName} (estimated trade schedule{' '}
                        <span className="font-medium tabular-nums text-foreground">
                          {formatUsd(confirmedInquiry.estimatedNetCents)}
                        </span>
                        ). Tear sheets and paper swatch strike-offs will be dispatched to{' '}
                        <span className="font-medium text-foreground">
                          {confirmedInquiry.contactEmail}
                        </span>
                        .
                      </p>
                      <div className="pt-2">
                        <Button
                          tone="quiet"
                          onClick={() => {
                            setConfirmedInquiry(null);
                            setNotes('');
                          }}
                        >
                          Prepare another project schedule
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={handleTradeSubmit}
                      noValidate
                      className="space-y-5"
                    >
                    <div>
                      <h3 className="text-heading font-medium text-foreground">
                        Request trade tear sheets &amp; paper swatches
                      </h3>
                      <p className="mt-1 text-label text-muted">
                        Carries the active estimator selection ({tradeQuantity} ×{' '}
                        {selectedSize.label} on {selectedSubstrate.shortName}) into your project
                        brief.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field id="trade-firm" label="Observatory, institution, or studio name" error={errors.firmName}>
                        <Input
                          id="trade-firm"
                          name="organization"
                          autoComplete="organization"
                          placeholder="Kitt Peak Observatory Visitor Center"
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                        />
                      </Field>

                      <Field id="trade-email" label="Institutional email" error={errors.contactEmail}>
                        <Input
                          id="trade-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="curator@observatory.org"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field id="trade-project-type" label="Sector / Installation type">
                        <Select
                          id="trade-project-type"
                          value={projectType}
                          onChange={(e) => setProjectType(e.target.value)}
                        >
                          <option value="Observatory & planetarium installations">
                            Observatory &amp; planetarium installations
                          </option>
                          <option value="Aerospace & research campuses">
                            Aerospace &amp; research campuses
                          </option>
                          <option value="Executive gallery & private collection">
                            Executive gallery &amp; private collection
                          </option>
                          <option value="Architectural & institutional interior">
                            Architectural &amp; institutional interior
                          </option>
                        </Select>
                      </Field>

                      <Field id="trade-schedule" label="Target installation window">
                        <Input
                          id="trade-schedule"
                          placeholder="Q2 2027"
                          value={installSchedule}
                          onChange={(e) => setInstallSchedule(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field
                      id="trade-notes"
                      label="Plate numbers, custom dimensions, or telemetry palette notes (optional)"
                    >
                      <Textarea
                        id="trade-notes"
                        placeholder="Specify catalog numbers (e.g. FS-01, FS-02) or custom aspect ratios required for observatory wall niches."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </Field>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/35 pt-4">
                      <span className="text-caption text-muted">
                        Includes complimentary 340 gsm Starlight Obsidian &amp; 310 gsm Cotton Rag physical swatch kit
                      </span>
                      <Button type="submit" tone="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Recording schedule…' : 'Submit trade schedule'}
                      </Button>
                    </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </Surface>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
