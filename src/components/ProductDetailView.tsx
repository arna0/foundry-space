import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Layers, Ruler } from 'lucide-react';
import {
  BORDER_OPTIONS,
  SIZE_OPTIONS,
  SUBSTRATE_OPTIONS,
  computeVariantPriceCents,
  isVariantSoldOut,
  type ArchivalPrint,
  type BorderOptionId,
  type PrintSizeId,
  type SubstrateId,
} from '../data/catalogue';
import { formatUsd } from '../lib/pricing';
import { ArchivalImage, Button, Surface } from './ui';
import { SheetProportionDiagram } from './FramingDiagrams';

export interface SelectedVariantSpec {
  print: ArchivalPrint;
  sizeId: PrintSizeId;
  substrateId: SubstrateId;
  borderId: BorderOptionId;
  unitPriceCents: number;
}

interface ProductDetailViewProps {
  print: ArchivalPrint;
  onBack: () => void;
  onSelectCategory: (category: ArchivalPrint['category']) => void;
  onAddToBag: (spec: SelectedVariantSpec) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  print,
  onBack,
  onSelectCategory,
  onAddToBag,
}) => {
  const [sizeId, setSizeId] = useState<PrintSizeId>('18x24');
  const [substrateId, setSubstrateId] = useState<SubstrateId>('obsidian_rag_340');
  const [borderId, setBorderId] = useState<BorderOptionId>('archival_15');
  const [visualMode, setVisualMode] = useState<'photo' | 'diagram'>(
    print.image ? 'photo' : 'diagram'
  );
  const [showFramePreview, setShowFramePreview] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setVisualMode(print.image ? 'photo' : 'diagram');
    setJustAdded(false);
  }, [print]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const activeSize = SIZE_OPTIONS.find((s) => s.id === sizeId) ?? SIZE_OPTIONS[0];
  const activeSubstrate =
    SUBSTRATE_OPTIONS.find((s) => s.id === substrateId) ?? SUBSTRATE_OPTIONS[0];
  const activeBorder =
    BORDER_OPTIONS.find((b) => b.id === borderId) ?? BORDER_OPTIONS[0];

  const unitPriceCents = computeVariantPriceCents(print, sizeId, substrateId);
  const soldOut = isVariantSoldOut(print, sizeId, substrateId);

  const handleAdd = () => {
    if (soldOut) return;
    onAddToBag({
      print,
      sizeId,
      substrateId,
      borderId,
      unitPriceCents,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-8 lg:px-12 pb-28 lg:pb-16">
      {/* Breadcrumb bar */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/35 pb-4"
      >
        <div className="flex flex-wrap items-center gap-2 text-label text-muted">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All prints
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              onSelectCategory(print.category);
              onBack();
            }}
            className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {print.category}
          </button>
          <span aria-hidden="true">·</span>
          <span className="text-foreground">{print.catalogNumber}</span>
        </div>
        <span className="text-caption text-muted">
          Unframed archival edition · Made to order in Austin, TX
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left column: Visual gallery & archival specifications */}
        <div className="min-w-0 lg:col-span-7">
          {/* Stage mode segmented control */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="View mode">
              {print.image ? (
                <button
                  type="button"
                  aria-pressed={visualMode === 'photo'}
                  onClick={() => setVisualMode('photo')}
                  className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-control border px-3.5 text-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    visualMode === 'photo'
                      ? 'border-foreground bg-foreground text-surface'
                      : 'border-border/50 bg-surface text-foreground hover:border-foreground'
                  }`}
                >
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  Sheet photograph
                </button>
              ) : null}
              <button
                type="button"
                aria-pressed={visualMode === 'diagram'}
                onClick={() => setVisualMode('diagram')}
                className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-control border px-3.5 text-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  visualMode === 'diagram'
                    ? 'border-foreground bg-foreground text-surface'
                    : 'border-border/50 bg-surface text-foreground hover:border-foreground'
                }`}
              >
                <Ruler className="h-4 w-4" aria-hidden="true" />
                Sheet &amp; margin scale
              </button>
            </div>

            {visualMode === 'diagram' ? (
              <button
                type="button"
                aria-pressed={showFramePreview}
                onClick={() => setShowFramePreview((v) => !v)}
                className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-control border px-3.5 text-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  showFramePreview
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/50 bg-surface text-foreground hover:border-foreground'
                }`}
              >
                {showFramePreview ? 'Showing 2 in mat + oak frame' : 'Preview custom framing'}
              </button>
            ) : null}
          </div>

          {/* Primary visual stage (one border level) */}
          <Surface className="border border-border/40 p-4 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              {visualMode === 'photo' && print.image ? (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto max-w-xl"
                >
                  <ArchivalImage
                    src={print.image}
                    alt={print.imageAlt}
                    fallbackTitle={print.title}
                    fallbackMeta={`${print.catalogNumber} · ${print.year}`}
                    aspectClass="aspect-[3/4]"
                    eager
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="diagram"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="py-2"
                >
                  {!print.image ? (
                    <div className="mb-6 border-b border-border/35 pb-5">
                      <p className="text-caption text-muted">
                        {print.catalogNumber} · {print.originArchive} · {print.year}
                      </p>
                      <p className="mt-1 font-display text-heading text-foreground">
                        {print.title}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {print.inkSwatches.map((swatch) => (
                          <span
                            key={swatch.name}
                            className="inline-flex items-center gap-2 text-caption text-muted"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-control border border-border/60"
                              style={{ backgroundColor: swatch.colorCss }}
                              aria-hidden="true"
                            />
                            {swatch.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <SheetProportionDiagram
                    print={print}
                    size={activeSize}
                    border={activeBorder}
                    substrate={activeSubstrate}
                    showFramePreview={showFramePreview}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Surface>

          {/* Conservation & framing specifications parted cleanly by 1px rules */}
          <div className="mt-10 divide-y divide-border/35 border-t border-b border-border/35">
            <div className="py-6">
              <h2 className="text-heading font-medium text-foreground">
                Plate provenance &amp; restoration
              </h2>
              <p className="mt-2 max-w-[65ch] text-body text-muted">{print.description}</p>
              <p className="mt-3 max-w-[65ch] text-label text-foreground/90">
                {print.conservationNotes}
              </p>
              <dl className="mt-5 grid grid-cols-1 gap-y-3 sm:grid-cols-3 sm:gap-x-6 text-label">
                <div>
                  <dt className="text-muted">Archive source</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{print.originArchive}</dd>
                </div>
                <div>
                  <dt className="text-muted">Original plate medium</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{print.originalMedium}</dd>
                </div>
                <div>
                  <dt className="text-muted">Plate year</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-foreground">{print.year}</dd>
                </div>
              </dl>
            </div>

            <div className="py-6">
              <h2 className="text-heading font-medium text-foreground">
                Selected media specification ({activeSubstrate.shortName})
              </h2>
              <p className="mt-2 max-w-[65ch] text-label text-muted">{activeSubstrate.notes}</p>
              <dl className="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-3 sm:gap-x-6 text-label">
                <div>
                  <dt className="text-muted">Basis weight</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                    {activeSubstrate.gsm} <span className="text-caption uppercase tracking-wider">GSM</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Sheet caliper</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                    {activeSubstrate.caliperMil} mil
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Surface finish</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{activeSubstrate.finish}</dd>
                </div>
              </dl>
            </div>

            <div className="py-6">
              <h2 className="text-heading font-medium text-foreground">
                Custom framing &amp; dispatch notes
              </h2>
              <p className="mt-2 max-w-[65ch] text-label text-muted">
                All editions are sold unframed, unmatted, and unmounted so you or your local frame
                shop can match moulding timber to the room. For the{' '}
                <span className="font-medium text-foreground">{activeSize.label}</span> sheet, we
                recommend a{' '}
                <span className="font-medium text-foreground">{activeSize.recommendedMoulding}</span>
                , hinged with reversible Japanese kozo strips behind UV-filtering acrylic.
              </p>
              <p className="mt-2 text-label text-muted">
                Printed to order within 3–5 business days in Austin, Texas and shipped rolled in
                acid-free glassine inside a 4-inch heavy-wall Kraft tube. Eligible for return within
                30 days of delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Sticky Purchase Module */}
        <div className="min-w-0 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <Surface className="border border-border/45 p-6 sm:p-8">
            <p className="text-caption font-medium uppercase tracking-[0.06em] text-muted">
              {print.category} · {print.catalogNumber}
            </p>
            <h1 className="mt-2 font-display text-title text-foreground">{print.title}</h1>
            <p className="mt-1 text-label text-muted">
              Circa {print.year} · {print.aspectRatioLabel}
            </p>

            {/* Price & availability row */}
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-b border-border/35 py-4">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {formatUsd(unitPriceCents)}
              </span>
              <span
                className={`text-label font-medium ${
                  soldOut ? 'text-danger' : 'text-foreground'
                }`}
              >
                {soldOut
                  ? 'Sold out in selected media'
                  : 'Made to order · Ships in 3–5 days'}
              </span>
            </div>

            {/* Size selector */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-label font-medium text-foreground">Sheet dimensions</span>
                <span className="text-caption text-muted">Unframed outer trim</span>
              </div>
              <div
                role="group"
                aria-label="Sheet dimensions"
                className="mt-2.5 grid grid-cols-2 gap-2.5"
              >
                {SIZE_OPTIONS.map((opt) => {
                  const optSoldOut = isVariantSoldOut(print, opt.id, substrateId);
                  const selected = sizeId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSizeId(opt.id)}
                      className={`flex min-h-11 items-center justify-between gap-2 rounded-control border px-3.5 py-2 text-left text-label transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/55 bg-surface text-foreground hover:border-foreground'
                      }`}
                    >
                      <span className="font-medium tabular-nums whitespace-nowrap">{opt.label}</span>
                      {optSoldOut ? (
                        <span
                          className={`text-caption ${
                            selected ? 'text-primary-foreground/90' : 'text-danger'
                          }`}
                        >
                          Sold out
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Substrate selector */}
            <div className="mt-6">
              <span className="text-label font-medium text-foreground">Archival substrate</span>
              <div
                role="group"
                aria-label="Archival substrate"
                className="mt-2.5 flex flex-col gap-2"
              >
                {SUBSTRATE_OPTIONS.map((sub) => {
                  const subSoldOut = isVariantSoldOut(print, sizeId, sub.id);
                  const selected = substrateId === sub.id;
                  const deltaLabel =
                    sub.priceDeltaCents === 0
                      ? 'Included'
                      : sub.priceDeltaCents > 0
                      ? `+${formatUsd(sub.priceDeltaCents)}`
                      : `−${formatUsd(Math.abs(sub.priceDeltaCents))}`;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSubstrateId(sub.id)}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-control border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/55 bg-surface text-foreground hover:border-foreground'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-label font-medium">{sub.name}</span>
                        <span
                          className={`block text-caption ${
                            selected ? 'text-primary-foreground/85' : 'text-muted'
                          }`}
                        >
                          {sub.finish}
                        </span>
                      </span>
                      <span className="shrink-0 text-caption font-medium tabular-nums">
                        {subSoldOut ? 'Sold out' : deltaLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Border margin selector */}
            <div className="mt-6">
              <span className="text-label font-medium text-foreground">Paper border treatment</span>
              <div
                role="group"
                aria-label="Paper border treatment"
                className="mt-2.5 flex flex-wrap gap-2"
              >
                {BORDER_OPTIONS.map((b) => {
                  const selected = borderId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBorderId(b.id)}
                      className={`min-h-10 rounded-control border px-3 py-1.5 text-label transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected
                          ? 'border-foreground bg-foreground text-surface font-medium'
                          : 'border-border/55 bg-surface text-foreground hover:border-foreground'
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-caption text-muted">{activeBorder.detail}</p>
            </div>

            {/* Ink swatches */}
            <div className="mt-6 border-t border-border/35 pt-4">
              <span className="text-caption text-muted">Calibrated pigment channels:</span>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {print.inkSwatches.map((swatch) => (
                  <span
                    key={swatch.name}
                    className="inline-flex items-center gap-1.5 text-caption text-foreground"
                  >
                    <span
                      className="h-3 w-3 rounded-control border border-border/60"
                      style={{ backgroundColor: swatch.colorCss }}
                      aria-hidden="true"
                    />
                    {swatch.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Add action */}
            <div className="mt-6">
              <Button
                tone="primary"
                disabled={soldOut}
                onClick={handleAdd}
                className="w-full py-3"
              >
                <AnimatePresence mode="wait">
                  {soldOut ? (
                    <motion.span
                      key="soldout"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sold out in selected media
                    </motion.span>
                  ) : justAdded ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="inline-flex items-center gap-2"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </motion.span>
                      <span>Added to cart · {formatUsd(unitPriceCents)}</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      Add to cart · {formatUsd(unitPriceCents)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </Surface>
        </div>
      </div>

      {/* Sticky mobile buy bar on phones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-surface px-4 py-3 shadow-float lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-label font-medium text-foreground" title={print.title}>
              {print.title}
            </p>
            <p className="text-caption tabular-nums text-muted">
              {activeSize.label} · {activeSubstrate.shortName} · {formatUsd(unitPriceCents)}
            </p>
          </div>
          <Button tone="primary" disabled={soldOut} onClick={handleAdd} className="shrink-0 rounded-full">
            {soldOut ? 'Sold out' : justAdded ? 'Added' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </section>
  );
};
