import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CATALOGUE,
  HERO_IMAGE,
  SIZE_OPTIONS,
  SUBSTRATE_OPTIONS,
  computeVariantPriceCents,
  type ArchivalPrint,
  type CollectionCategory,
} from './data/catalogue';
import { FREE_SHIPPING_THRESHOLD_CENTS, formatUsd } from './lib/pricing';
import { ArchivalImage, Button, Input, Select, Surface } from './components/ui';
import { ProductDetailView, type SelectedVariantSpec } from './components/ProductDetailView';
import { FramingAndTradeSections } from './components/FramingAndTradeSections';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { CelestialOrrery } from './components/CelestialOrrery';
import {
  CheckoutView,
  OrderConfirmationView,
  TubeDrawer,
  type BagLineItem,
  type ConfirmedOrderData,
} from './components/TubeDrawerAndCheckout';

type ActiveRoute =
  | { kind: 'catalogue' }
  | { kind: 'product'; printId: string }
  | { kind: 'checkout' }
  | { kind: 'confirmation'; order: ConfirmedOrderData };

type SortMode = 'curated' | 'price_asc' | 'price_desc' | 'year_asc';
type CategoryFilter = 'All' | CollectionCategory;
type PolicyTopic = 'shipping' | 'returns' | 'longevity' | 'framing' | null;

const FOUNDRY_NAV_LINKS: { label: string; category: CategoryFilter }[] = [
  { label: 'CARTOGRAPHY', category: 'Lunar Cartography' },
  { label: 'ASTRONOMY', category: 'Deep Field' },
  { label: 'ORBITAL', category: 'Orbital Mechanics' },
  { label: 'RADIO ASTRONOMY', category: 'Radio Astronomy' },
  { label: 'CONSTELLATIONS', category: 'Constellation Folios' },
  { label: 'POPULAR NOW', category: 'All' },
];

const ALL_FILTER_CATEGORIES: CategoryFilter[] = [
  'All',
  'Deep Field',
  'Lunar Cartography',
  'Orbital Mechanics',
  'Radio Astronomy',
  'Constellation Folios',
];

const ANNOUNCEMENT_MESSAGES = [
  'New artwork is added regularly. Join our newsletter for product updates and studio news.',
  'Complimentary heavy-wall tube shipping on qualifying orders over $120.00.',
  'Made-to-order on 340 gsm Starlight Obsidian Rag in Austin, Texas · Quick Dispatch.',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'United States (USD $)' },
  { code: 'CAD', symbol: 'C$', label: 'Canada (CAD $)' },
  { code: 'GBP', symbol: '£', label: 'United Kingdom (GBP £)' },
  { code: 'EUR', symbol: '€', label: 'European Union (EUR €)' },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD $)' },
];

const JOURNAL_ARTICLES = [
  {
    id: 'art-1',
    title: 'Difference Between Starlight Obsidian Rag and Cotton Rag',
    category: 'MATERIALS & PRESS',
    summary:
      'Understanding mineral carbon pigment absorption versus conventional calcium-buffered cotton sheets for astronomical contrast.',
    image: CATALOGUE[0]?.image || HERO_IMAGE,
  },
  {
    id: 'art-2',
    title: 'Custom Framing: Optium Museum Acrylic vs Non-Glare Glass',
    category: 'FRAMING GUIDE',
    summary:
      'Why 99% UV-blocking acrylic prevents micro-glare and tonal shift across wide format celestial cartography.',
    image: CATALOGUE[1]?.image || HERO_IMAGE,
  },
  {
    id: 'art-3',
    title: 'Decoding the Webb SMACS 0723 Gravitational Lensing Spectrogram',
    category: 'ASTRONOMICAL NOTES',
    summary:
      'A deep dive into Einsteinian light curvature, galaxy cluster magnification, and infrared false-color calibrations.',
    image: CATALOGUE[3]?.image || HERO_IMAGE,
  },
  {
    id: 'art-4',
    title: 'Where to Buy Conservation Frames for Your Astronomical Sheets',
    category: 'COLLECTOR TIPS',
    summary:
      'Standardized sheet dimensions (12×16 up to 30×40) engineered for off-the-shelf and bespoke titanium mouldings.',
    image: CATALOGUE[4]?.image || HERO_IMAGE,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The SMACS 0723 gravitational lensing print on 340 gsm Obsidian Rag is breathtaking in person. Zero ambient glare and the light arcs look luminous against our salon walls.',
    author: 'Dr. Evelyn Vance',
    location: 'Boulder, CO',
    verified: 'Verified Collector · Webb Deep Field 24×32',
  },
  {
    quote:
      'We mounted the 1874 Nasmyth lunar relief in our studio conference room. The crater shadow depth looks sculptural. The packaging in the Kraft tube arrived in flawless condition.',
    author: 'Julian Hayes',
    location: 'Chicago, IL',
    verified: 'Verified Trade Partner · Lunar Cartography 30×40',
  },
  {
    quote:
      'The Keplerian planetary orbit folio captures the exact horological precision aesthetic we were searching for. Printing quality and paper weight exceeded all expectations.',
    author: 'Marcus Chen',
    location: 'San Francisco, CA',
    verified: 'Verified Collector · Orbital Mechanics 18×24',
  },
];

const BAG_STORAGE_KEY = 'foundry_co_space_bag_v2';

function loadInitialBag(): BagLineItem[] {
  try {
    const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const hydrated: BagLineItem[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const print = CATALOGUE.find((p) => p.id === entry.printId);
      if (!print) continue;
      const sizeValid = SIZE_OPTIONS.some((s) => s.id === entry.sizeId);
      const subValid = SUBSTRATE_OPTIONS.some((s) => s.id === entry.substrateId);
      if (!sizeValid || !subValid) continue;
      const qty =
        typeof entry.quantity === 'number' && Number.isFinite(entry.quantity)
          ? Math.max(1, Math.min(99, Math.floor(entry.quantity)))
          : 1;
      const unitPriceCents = computeVariantPriceCents(print, entry.sizeId, entry.substrateId);
      hydrated.push({
        lineId: `${print.id}__${entry.sizeId}__${entry.substrateId}__${entry.borderId || 'archival_15'}`,
        print,
        sizeId: entry.sizeId,
        substrateId: entry.substrateId,
        borderId: entry.borderId || 'archival_15',
        unitPriceCents,
        quantity: qty,
      });
    }
    return hydrated;
  } catch {
    return [];
  }
}

function persistBag(items: BagLineItem[]) {
  try {
    const compact = items.map((item) => ({
      printId: item.print.id,
      sizeId: item.sizeId,
      substrateId: item.substrateId,
      borderId: item.borderId,
      quantity: item.quantity,
    }));
    window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(compact));
  } catch {
    // Graceful fallback
  }
}

export default function App() {
  const [route, setRoute] = useState<ActiveRoute>({ kind: 'catalogue' });
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('curated');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [currency, setCurrency] = useState('USD');

  const [bagItems, setBagItems] = useState<BagLineItem[]>(() => loadInitialBag());
  const [tubeOpen, setTubeOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyTopic>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const popularNowRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    persistBag(bagItems);
  }, [bagItems]);

  // Rotate announcement bar every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activePolicy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePolicy(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePolicy]);

  const totalBagQuantity = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.quantity, 0),
    [bagItems]
  );

  const filteredCatalogue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = CATALOGUE.filter((item) => {
      const catOk = selectedCategory === 'All' || item.category === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.catalogNumber.toLowerCase().includes(q) ||
        item.originalMedium.toLowerCase().includes(q) ||
        String(item.year).includes(q)
      );
    });

    const sorted = [...matches];
    if (sortMode === 'price_asc') {
      sorted.sort((a, b) => a.basePriceCents - b.basePriceCents);
    } else if (sortMode === 'price_desc') {
      sorted.sort((a, b) => b.basePriceCents - a.basePriceCents);
    } else if (sortMode === 'year_asc') {
      sorted.sort((a, b) => a.year - b.year);
    }
    return sorted;
  }, [selectedCategory, searchQuery, sortMode]);

  const handleAddVariantToBag = (spec: SelectedVariantSpec) => {
    const lineId = `${spec.print.id}__${spec.sizeId}__${spec.substrateId}__${spec.borderId}`;
    setBagItems((prev) => {
      const existing = prev.find((item) => item.lineId === lineId);
      if (existing) {
        return prev.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: Math.min(99, item.quantity + 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          lineId,
          print: spec.print,
          sizeId: spec.sizeId,
          substrateId: spec.substrateId,
          borderId: spec.borderId,
          unitPriceCents: spec.unitPriceCents,
          quantity: 1,
        },
      ];
    });
    setTubeOpen(true);
  };

  const handleQuickAddPrint = (print: ArchivalPrint) => {
    const defaultSizeId = '12x16';
    const defaultSubstrateId = 'obsidian_rag_340';
    const unitPriceCents = computeVariantPriceCents(print, defaultSizeId, defaultSubstrateId);
    handleAddVariantToBag({
      print,
      sizeId: defaultSizeId,
      substrateId: defaultSubstrateId,
      borderId: 'archival_15',
      unitPriceCents,
    });
  };

  const handleUpdateBagQuantity = (lineId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      handleRemoveBagItem(lineId);
      return;
    }
    setBagItems((prev) =>
      prev.map((item) =>
        item.lineId === lineId ? { ...item, quantity: Math.min(99, nextQuantity) } : item
      )
    );
  };

  const handleRemoveBagItem = (lineId: string) => {
    setBagItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const navigateToCategory = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setMobileMenuOpen(false);
    if (route.kind !== 'catalogue') {
      setRoute({ kind: 'catalogue' });
      window.setTimeout(() => {
        popularNowRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      popularNowRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openProductDetail = (printId: string) => {
    setRoute({ kind: 'product', printId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (route.kind !== 'catalogue') {
      setRoute({ kind: 'catalogue' });
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  const activeProduct =
    route.kind === 'product'
      ? CATALOGUE.find((p) => p.id === route.printId) ?? null
      : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
        {/* Ambient GPU starfield canvas with constellation connecting lines */}
        <StarfieldCanvas />

        {/* 1. Foundry's Signature Announcement Bar (Rotates messages smoothly) */}
        <div className="relative z-30 border-b border-border/40 bg-surface/90 py-2.5 px-4 text-center">
          <div className="mx-auto flex max-w-7xl items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={announcementIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="text-caption font-medium tracking-wide text-muted"
              >
                {ANNOUNCEMENT_MESSAGES[announcementIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Main Header: Foundry Co Wordmark, Primary Nav, Search, Currency & Cart */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-3.5 sm:px-8 lg:px-12">
            {/* Left: Mobile hamburger & Logo */}
            <div className="flex items-center gap-4 lg:gap-8">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 md:hidden focus-visible:outline-2 focus-visible:outline-primary"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              {/* Exact Foundry Co luxury brand wordmark */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setRoute({ kind: 'catalogue' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex flex-col text-left focus-visible:outline-2 focus-visible:outline-primary"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-xl sm:text-2xl font-bold tracking-[0.18em] uppercase text-foreground group-hover:text-primary transition-colors">
                    FOUNDRY CO.
                  </span>
                  <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-muted -mt-0.5 font-medium">
                  LUXURY FINE ART · OBSERVATORY EDITIONS
                </span>
              </button>
            </div>

            {/* Center: Desktop Navigation Bar with Foundry categories */}
            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
              {FOUNDRY_NAV_LINKS.map((link) => {
                const isActive =
                  route.kind === 'catalogue' && selectedCategory === link.category;
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => navigateToCategory(link.category)}
                    className={`relative py-1 text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="foundryNavUnderline"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Right: Search, Currency & Foundry Pill Cart Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search toggle or inline bar */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  if (!searchOpen) {
                    window.setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }}
                aria-expanded={searchOpen}
                aria-label="Search artwork"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/50 bg-surface/60 px-3.5 text-caption font-medium text-muted hover:text-foreground hover:border-foreground/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xl:inline">Search</span>
              </button>

              {/* Currency Selector */}
              <div className="hidden lg:block">
                <label htmlFor="currency-select" className="sr-only">
                  Currency selector
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="min-h-10 rounded-full border border-border/50 bg-surface/60 px-3 text-caption font-medium text-foreground focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-surface text-foreground">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exact Foundry Pill Cart Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setTubeOpen(true)}
                aria-label={`Open cart with ${totalBagQuantity} products`}
                className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-border/60 bg-surface px-4 text-caption font-semibold uppercase tracking-wider text-foreground hover:border-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ShoppingBag className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <span>Cart</span>
                <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[11px] font-mono font-bold text-cyan-300">
                  {totalBagQuantity}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Search Dropdown Drawer */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-border/40 bg-surface/95 px-4 py-3 sm:px-8 lg:px-12"
              >
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                  <Search className="h-5 w-5 text-muted shrink-0" aria-hidden="true" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search by title, medium, year, or catalog number (e.g. Webb, Kepler, Nasmyth)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (route.kind !== 'catalogue') setRoute({ kind: 'catalogue' });
                    }}
                    className="flex-1 rounded-full border-border/60 bg-background text-body"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-caption text-muted hover:text-foreground"
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/5 text-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Mobile Drawer Menu */}
          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.nav
                aria-label="Mobile navigation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-border/40 bg-surface px-4 py-4 md:hidden"
              >
                <ul className="space-y-1">
                  {FOUNDRY_NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => navigateToCategory(link.category)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-control px-3 text-left text-body font-medium uppercase tracking-wider ${
                          selectedCategory === link.category
                            ? 'text-primary font-bold'
                            : 'text-foreground'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-4 w-4 text-muted" />
                      </button>
                    </li>
                  ))}
                  <li className="border-t border-border/30 pt-3 mt-3">
                    <button
                      type="button"
                      onClick={() => scrollToSection('celestial-orrery')}
                      className="flex min-h-11 w-full items-center px-3 text-left text-label text-cyan-300 font-medium"
                    >
                      Keplerian Planetary Orrery
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('framing-guide')}
                      className="flex min-h-11 w-full items-center px-3 text-left text-label text-muted"
                    >
                      Sizing &amp; Custom Framing Guide
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('hospitality-trade')}
                      className="flex min-h-11 w-full items-center px-3 text-left text-label text-muted"
                    >
                      Observatory &amp; Trade Program
                    </button>
                  </li>
                </ul>
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </header>

        {/* Main Content Router */}
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {route.kind === 'product' && activeProduct ? (
              <motion.div
                key={`product_${route.printId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductDetailView
                  print={activeProduct}
                  onBack={() => setRoute({ kind: 'catalogue' })}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  onAddToBag={handleAddVariantToBag}
                />
              </motion.div>
            ) : route.kind === 'checkout' ? (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <CheckoutView
                  items={bagItems}
                  onBackToShop={() => setRoute({ kind: 'catalogue' })}
                  onOrderConfirmed={(order) => {
                    setBagItems([]);
                    setRoute({ kind: 'confirmation', order });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            ) : route.kind === 'confirmation' ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <OrderConfirmationView
                  order={route.order}
                  onContinueShopping={() => {
                    setRoute({ kind: 'catalogue' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="catalogue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 3. Foundry's Signature Category Mosaic Tiles (6 Hero Blocks) */}
                <section aria-label="Collection categories" className="w-full border-b border-border/40 bg-background">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40 border-b border-border/40">
                    {/* Tile 1: Just Arrived Fine Art / Deep Field */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[360px] bg-surface/30 hover:bg-surface/60 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-55 transition-opacity overflow-hidden">
                        <img
                          src={CATALOGUE[0]?.image || HERO_IMAGE}
                          alt="Webb SMACS 0723 Deep Field"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          JUST ARRIVED
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                          Deep Field Spectrograms
                        </h2>
                        <p className="mt-2 text-label text-muted max-w-xs">
                          Stunning deep-space wall decor calibrated for any contemporary space.
                        </p>
                      </div>
                      <div className="relative z-10 pt-6">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('Deep Field')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          Explore all <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tile 2: Historic Cartography / Lunar Relifs */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[360px] bg-surface/30 hover:bg-surface/60 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-55 transition-opacity overflow-hidden">
                        <img
                          src={CATALOGUE[1]?.image || HERO_IMAGE}
                          alt="1874 Nasmyth Lunar Reliefs"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          1874 RELIEFS
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                          Lunar Cartography
                        </h2>
                        <p className="mt-2 text-label text-muted max-w-xs">
                          Deck the walls with historic relief shadows and lunar crater topography.
                        </p>
                      </div>
                      <div className="relative z-10 pt-6">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('Lunar Cartography')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          See More <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tile 3: Orbital Mechanics & Keplerian Ellipses */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[360px] bg-surface/30 hover:bg-surface/60 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-55 transition-opacity overflow-hidden">
                        <img
                          src={CATALOGUE[2]?.image || HERO_IMAGE}
                          alt="Keplerian Planetary Orbits"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          CELESTIAL EPHEMERIS
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                          Orbital Mechanics
                        </h2>
                        <p className="mt-2 text-label text-muted max-w-xs">
                          Celebrating 1609 Keplerian ellipses and interplanetary geometry.
                        </p>
                      </div>
                      <div className="relative z-10 pt-6">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('Orbital Mechanics')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          Branch Out <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Secondary 3 Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
                    {/* Tile 4: Radio Astronomy & Waveforms */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[320px] bg-surface/20 hover:bg-surface/50 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-35 group-hover:opacity-50 transition-opacity overflow-hidden">
                        <img
                          src={CATALOGUE[3]?.image || HERO_IMAGE}
                          alt="Radio Pulsar CP 1919"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          RADIO ASTRONOMY
                        </span>
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">
                          Pulsar Waveforms
                        </h2>
                        <p className="mt-1 text-label text-muted max-w-xs">
                          CP 1919 radio signals &amp; cosmological radiation profiles.
                        </p>
                      </div>
                      <div className="relative z-10 pt-5">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('Radio Astronomy')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          Explore <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tile 5: Constellation Folios */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[320px] bg-surface/20 hover:bg-surface/50 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-35 group-hover:opacity-50 transition-opacity overflow-hidden">
                        <img
                          src={CATALOGUE[4]?.image || HERO_IMAGE}
                          alt="Celestial Planisphere"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          1705 PLANISPHERE
                        </span>
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">
                          Constellation Folios
                        </h2>
                        <p className="mt-1 text-label text-muted max-w-xs">
                          Celestial hemispheres and antique star chart folios.
                        </p>
                      </div>
                      <div className="relative z-10 pt-5">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('Constellation Folios')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          Explore <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tile 6: Shop It All */}
                    <div className="group relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[320px] bg-surface/20 hover:bg-surface/50 transition-colors">
                      <div className="absolute inset-0 z-0 opacity-35 group-hover:opacity-50 transition-opacity overflow-hidden">
                        <img
                          src={HERO_IMAGE}
                          alt="All Products Exhibition"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      </div>
                      <div className="relative z-10">
                        <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                          COMPLETE ARCHIVE
                        </span>
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">
                          All Our Products
                        </h2>
                        <p className="mt-1 text-label text-muted max-w-xs">
                          Every archival edition printed to order on 340 gsm rag.
                        </p>
                      </div>
                      <div className="relative z-10 pt-5">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('All')}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/60 bg-background/80 backdrop-blur-sm px-5 text-caption font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          Explore <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Foundry's Signature "Popular Now" Bordered Product Grid */}
                <section
                  ref={popularNowRef}
                  id="popular-now"
                  className="w-full border-b border-border/40 bg-background py-14 sm:py-20"
                >
                  <div className="mx-auto max-w-[92rem] px-4 sm:px-8 lg:px-12">
                    {/* Header: Title, Shop Now link, and Category Pills */}
                    <div className="flex flex-col gap-6 border-b border-border/40 pb-6 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                            Popular Now
                          </h2>
                          <span className="rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 font-mono text-[11px] text-cyan-300">
                            {filteredCatalogue.length} EDITIONS
                          </span>
                        </div>
                        <p className="mt-1.5 text-label text-muted">
                          Restored historic astronomical plates and deep-space spectrophotometry printed to order
                        </p>
                      </div>

                      {/* Filter pill tabs with 30px pill radius */}
                      <div className="flex flex-wrap items-center gap-2">
                        {ALL_FILTER_CATEGORIES.map((cat) => {
                          const active = selectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSelectedCategory(cat)}
                              className={`relative min-h-9 rounded-full px-4 text-caption font-semibold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                                active
                                  ? 'bg-foreground text-background font-bold'
                                  : 'border border-border/60 bg-surface/60 text-muted hover:text-foreground hover:border-foreground/40'
                              }`}
                            >
                              <span>{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seamless Bordered Grid (`product-grid-border-fix`) */}
                    {filteredCatalogue.length === 0 ? (
                      <div className="py-20 text-center">
                        <p className="text-xl font-medium text-foreground">
                          No editions match “{searchQuery}”.
                        </p>
                        <p className="mt-2 text-label text-muted">
                          Clear your search query or switch categories to view every available plate.
                        </p>
                        <div className="mt-6">
                          <Button
                            tone="quiet"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('All');
                            }}
                            className="rounded-full px-6"
                          >
                            Reset filters
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border/40">
                        {filteredCatalogue.map((print, index) => {
                          const badgeText =
                            index === 0
                              ? 'POPULAR NOW'
                              : index === 1
                              ? 'FRESH OFF THE PRESS'
                              : index === 2
                              ? "COLLECTOR'S PICK"
                              : 'LIMITED EDITION';

                          return (
                            <div
                              key={print.id}
                              className="group relative flex flex-col border-r border-b border-border/40 bg-surface/20 p-5 sm:p-6 transition-colors hover:bg-surface/50"
                            >
                              {/* Foundry Product Badge */}
                              <div className="absolute top-4 left-4 z-20">
                                <span className="inline-block rounded-full bg-background/90 backdrop-blur-sm border border-border/60 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                                  {badgeText}
                                </span>
                              </div>

                              {/* Product Image Container */}
                              <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface/30 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => openProductDetail(print.id)}
                                  className="relative h-full w-full overflow-hidden block focus-visible:outline-2 focus-visible:outline-primary"
                                >
                                  <ArchivalImage
                                    src={print.image}
                                    alt={print.imageAlt}
                                    fallbackTitle={print.title}
                                    fallbackMeta={`${print.catalogNumber} · ${print.year}`}
                                    aspectClass="h-full w-full"
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                  />
                                </button>

                                {/* Foundry Slide-Up Hover Actions */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddPrint(print)}
                                    className="flex-1 min-h-9 rounded-full bg-foreground text-background text-[11px] font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors shadow-float"
                                  >
                                    Add to cart
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openProductDetail(print.id)}
                                    className="min-h-9 rounded-full border border-border/80 bg-background/90 px-3 text-[11px] font-medium text-foreground hover:border-foreground transition-colors backdrop-blur-sm shadow-float"
                                  >
                                    Quick View
                                  </button>
                                </div>
                              </div>

                              {/* Product Info: Title & Price */}
                              <div className="mt-4 flex flex-1 flex-col justify-between">
                                <div>
                                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
                                    {print.category} · {print.year}
                                  </p>
                                  <h3 className="mt-1 text-label font-medium text-foreground">
                                    <button
                                      type="button"
                                      onClick={() => openProductDetail(print.id)}
                                      className="text-left hover:underline underline-offset-4 decoration-1 decoration-foreground/60 transition-colors"
                                    >
                                      {print.title}
                                    </button>
                                  </h3>
                                </div>

                                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-border/20">
                                  <span className="text-body font-semibold tabular-nums text-foreground">
                                    From {formatUsd(print.basePriceCents)}
                                  </span>
                                  <span className="text-caption text-muted">4 sizes</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* 5. Interactive Keplerian Planetary Orrery (Astronomical Mechanics Section) */}
                <section
                  id="celestial-orrery"
                  className="relative border-b border-border/40 bg-surface/30 py-16 sm:py-24"
                >
                  <div className="mx-auto max-w-[92rem] px-4 sm:px-8 lg:px-12">
                    <CelestialOrrery />
                  </div>
                </section>

                {/* 6. Foundry's Featured Collection Split Room Scene Showcase */}
                <section aria-label="Featured collection showcase" className="w-full border-b border-border/40 bg-background">
                  <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                    {/* Left: High-res room shot */}
                    <div className="relative lg:col-span-7 overflow-hidden border-b lg:border-b-0 lg:border-r border-border/40 min-h-[380px]">
                      <img
                        src={HERO_IMAGE}
                        alt="Observatory exhibition salon showcasing framed deep-space spectrograms overlooking night sky"
                        className="h-full w-full object-cover object-center filter brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent lg:hidden" />
                    </div>

                    {/* Right: Editorial copy & button */}
                    <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-surface/20">
                      <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400 font-semibold mb-3">
                        FEATURED COLLECTION
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground">
                        Observatory Editions
                      </h2>
                      <p className="mt-4 text-body text-muted leading-relaxed">
                        Restored historic astronomical plates, Webb infrared spectrograms, and lunar relief maps printed on 340 gsm Starlight Obsidian Rag. Formulated for fine-art collectors, laboratories, and modern architectural spaces.
                      </p>
                      <div className="mt-8 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            popularNowRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground text-background px-7 text-label font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Shop the collection
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection('framing-guide')}
                          className="inline-flex min-h-12 items-center justify-center rounded-full border border-border/70 bg-surface/50 px-6 text-label font-medium text-foreground hover:border-foreground transition-colors"
                        >
                          Framing guide
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. Foundry's 3-Pillar Studio Trust Banner */}
                <section aria-label="Studio commitments" className="w-full border-b border-border/40 bg-surface/40 py-12 sm:py-16">
                  <div className="mx-auto max-w-[92rem] px-4 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40 text-center">
                      {/* Pillar 1 */}
                      <div className="flex flex-col items-center p-6 sm:p-8">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-surface text-cyan-400">
                          <Truck className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-label font-bold uppercase tracking-wider text-foreground">
                          Free Standard Shipping*
                        </h3>
                        <p className="mt-2 text-caption text-muted max-w-xs leading-relaxed">
                          Complimentary heavy-wall Kraft tube shipping on orders over $120. Flat conservation crates available.
                        </p>
                      </div>

                      {/* Pillar 2 */}
                      <div className="flex flex-col items-center p-6 sm:p-8">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-surface text-cyan-400">
                          <Sparkles className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-label font-bold uppercase tracking-wider text-foreground">
                          Quick Dispatch
                        </h3>
                        <p className="mt-2 text-caption text-muted max-w-xs leading-relaxed">
                          Individually printed &amp; spectrophotometrically verified within 3–5 business days in Austin, Texas.
                        </p>
                      </div>

                      {/* Pillar 3 */}
                      <div className="flex flex-col items-center p-6 sm:p-8">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-surface text-cyan-400">
                          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-label font-bold uppercase tracking-wider text-foreground">
                          Texas-Based Independent Shop
                        </h3>
                        <p className="mt-2 text-caption text-muted max-w-xs leading-relaxed">
                          Handcrafted on 340 gsm Starlight Obsidian Rag with 12-channel archival mineral pigment inks.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. Collector Testimonials ("What our collectors say") */}
                <section aria-label="Customer reviews" className="w-full border-b border-border/40 bg-background py-16 sm:py-20">
                  <div className="mx-auto max-w-[92rem] px-4 sm:px-8 lg:px-12">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                        VERIFIED REVIEWS
                      </span>
                      <h2 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                        What Our Collectors Say
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                      {TESTIMONIALS.map((t, idx) => (
                        <div
                          key={idx}
                          className="rounded-card border border-border/50 bg-surface/30 p-6 sm:p-8 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400" />
                              ))}
                            </div>
                            <p className="text-label text-foreground/90 italic leading-relaxed">
                              “{t.quote}”
                            </p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-border/30">
                            <p className="text-label font-bold text-foreground">{t.author}</p>
                            <p className="text-caption text-muted">{t.location}</p>
                            <p className="mt-1 text-[11px] font-mono text-cyan-300">{t.verified}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 9. "Extra! Extra!" / Studio News & Framing Journal */}
                <section aria-label="Studio news and articles" className="w-full border-b border-border/40 bg-surface/20 py-16 sm:py-20">
                  <div className="mx-auto max-w-[92rem] px-4 sm:px-8 lg:px-12">
                    <div className="flex items-end justify-between border-b border-border/40 pb-5 mb-8">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                          ARCHIVE JOURNAL
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mt-1">
                          Extra! Extra! News
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToSection('framing-guide')}
                        className="text-caption font-semibold uppercase tracking-wider text-muted hover:text-foreground inline-flex items-center gap-1.5"
                      >
                        All articles <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {JOURNAL_ARTICLES.map((article) => (
                        <div
                          key={article.id}
                          className="group flex flex-col overflow-hidden border border-border/40 bg-surface/40 hover:bg-surface/70 transition-colors"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden bg-background">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-5 flex flex-1 flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-medium">
                                {article.category}
                              </span>
                              <h3 className="mt-1.5 text-label font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                              <p className="mt-2 text-caption text-muted line-clamp-2">
                                {article.summary}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/30">
                              <span className="text-caption font-semibold uppercase tracking-wider text-foreground inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Read article <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 10. Foundry's Sizing & Custom Framing Guide & Trade Sourcing */}
                <FramingAndTradeSections />

                {/* 11. Foundry's Newsletter Subscription Section */}
                <section aria-label="Newsletter subscription" className="w-full border-t border-border/40 bg-surface/50 py-16 sm:py-20 text-center">
                  <div className="mx-auto max-w-xl px-4 sm:px-8">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                      JOIN OUR STUDIO
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                      Subscribe to our newsletter
                    </h2>
                    <p className="mt-3 text-label text-muted">
                      New artwork is added regularly. Join our newsletter for product updates, limited observatory releases, and studio news.
                    </p>

                    {newsletterSubmitted ? (
                      <div className="mt-6 rounded-full bg-cyan-950/60 border border-cyan-500/40 p-4 text-caption font-mono text-cyan-300">
                        Thank you for subscribing to Foundry Space. Your collector code has been dispatched.
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <Input
                          type="email"
                          required
                          placeholder="Your email address"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="flex-1 rounded-full border-border/70 bg-background text-label px-5"
                        />
                        <button
                          type="submit"
                          className="min-h-11 rounded-full bg-foreground text-background px-7 text-caption font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Subscribe
                        </button>
                      </form>
                    )}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 12. Foundry's Signature 4-Column Footer */}
        <footer className="relative z-10 border-t border-border/45 bg-surface text-foreground">
          <div className="mx-auto max-w-[92rem] px-4 py-14 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {/* Col 1: About Foundry Space */}
              <div>
                <p className="text-xl font-bold uppercase tracking-[0.16em] text-foreground">
                  FOUNDRY CO.
                </p>
                <p className="mt-2 text-caption text-cyan-400 font-mono tracking-widest uppercase">
                  Luxury Fine Art · Space Edition
                </p>
                <p className="mt-3 max-w-[34ch] text-label text-muted leading-relaxed">
                  Independent fine-art print studio producing made-to-order deep-space spectrograms, historic cartography, and Keplerian orbital folios in Austin, Texas.
                </p>
                <p className="mt-4 text-caption text-muted font-mono">
                  West 6th Pressroom · Austin, TX
                  <br />
                  Mon–Fri, 9:00 a.m. – 5:30 p.m. CT ·{' '}
                  <a
                    href="mailto:curator@foundry.co"
                    className="underline text-cyan-400 hover:text-cyan-300"
                  >
                    curator@foundry.co
                  </a>
                </p>
              </div>

              {/* Col 2: Quick Links */}
              <div>
                <h2 className="text-label font-bold uppercase tracking-wider text-foreground">
                  Quick links
                </h2>
                <ul className="mt-3 space-y-2 text-label text-muted">
                  <li>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="hover:text-foreground transition-colors"
                    >
                      Search
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('framing-guide')}
                      className="hover:text-foreground transition-colors"
                    >
                      Custom framing specifications
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('hospitality-trade')}
                      className="hover:text-foreground transition-colors"
                    >
                      Hospitality &amp; interior trade program
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('celestial-orrery')}
                      className="hover:text-foreground transition-colors"
                    >
                      Keplerian planetary orrery
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActivePolicy('shipping')}
                      className="hover:text-foreground transition-colors"
                    >
                      Dispatch &amp; heavy-wall packaging
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Shop Links */}
              <div>
                <h2 className="text-label font-bold uppercase tracking-wider text-foreground">
                  Shop Links
                </h2>
                <ul className="mt-3 space-y-2 text-label text-muted">
                  {ALL_FILTER_CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => navigateToCategory(cat)}
                        className="hover:text-foreground transition-colors"
                      >
                        {cat === 'All' ? 'All products' : cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Newsletter & Follow Us */}
              <div>
                <h2 className="text-label font-bold uppercase tracking-wider text-foreground">
                  Follow us &amp; Newsletter
                </h2>
                <p className="mt-2 text-caption text-muted leading-relaxed">
                  Subscribe to receive studio updates, new release alerts, and framing guides.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setTubeOpen(true)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-background px-4 text-caption font-semibold uppercase tracking-wider text-foreground hover:border-foreground transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-cyan-400" />
                    <span>View cart ({totalBagQuantity})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Country Selector & Copyright */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6 text-caption text-muted">
              <div className="flex items-center gap-3">
                <span className="font-mono">Country / Region:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1 text-caption text-foreground cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <span>
                © {new Date().getFullYear()} Foundry Co - Luxury Fine Art. Powered by Foundry Space.
              </span>
            </div>
          </div>
        </footer>

        {/* Foundry Slide-out Side Cart Drawer */}
        <TubeDrawer
          isOpen={tubeOpen}
          items={bagItems}
          onClose={() => setTubeOpen(false)}
          onUpdateQuantity={handleUpdateBagQuantity}
          onRemoveItem={handleRemoveBagItem}
          onProceedToCheckout={() => {
            setTubeOpen(false);
            setRoute({ kind: 'checkout' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Studio Policy Modal Dialog */}
        <AnimatePresence>
          {activePolicy ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setActivePolicy(null)}
                aria-hidden="true"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="policy-dialog-title"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg rounded-card border border-border/50 bg-surface p-6 sm:p-8 text-foreground shadow-float"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 id="policy-dialog-title" className="text-xl font-bold uppercase tracking-tight text-foreground">
                    {activePolicy === 'shipping'
                      ? 'Dispatch & Heavy-Wall Packaging'
                      : activePolicy === 'returns'
                      ? '30-Day Studio Return Policy'
                      : 'Archival Pigment & Starlight Obsidian Rag'}
                  </h2>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setActivePolicy(null)}
                    aria-label="Close dialog"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-label text-muted leading-relaxed">
                  {activePolicy === 'shipping' ? (
                    <>
                      <p>
                        Every deep-space sheet is cured individually under cleanroom nitrogen atmosphere in Austin, Texas. Please allow
                        3–5 business days for pigment cross-linking and spectrophotometric verification prior to dispatch.
                      </p>
                      <p>
                        Standard orders ship rolled in acid-free antistatic glassine inside a 4-inch heavy-wall
                        Kraft archival tube ({formatUsd(1400)}, or complimentary from{' '}
                        {formatUsd(FREE_SHIPPING_THRESHOLD_CENTS)}). Flat conservation board crates
                        are available at checkout.
                      </p>
                    </>
                  ) : activePolicy === 'returns' ? (
                    <>
                      <p>
                        Unmounted folios in original condition may be returned in their original heavy-wall
                        archival tube within 30 days of delivery for a full refund of the print price.
                      </p>
                      <p>
                        If an outer tube arrives creased in transit, notify us with photographs of the seal and sheet edge so we can immediately schedule an expedited replacement run.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Our flagship 340 gsm Starlight Obsidian Rag is 100% cotton, mould-made with deep mineral carbon pigments,
                        calcium carbonate buffering, and zero optical brightening agents (OBAs).
                      </p>
                      <p>
                        When paired with 12-channel encapsulated pigment inks and glazed behind 99% UV-blocking Optium acrylic,
                        prints maintain spectral fidelity for 150+ years under laboratory and museum illumination conditions.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button tone="quiet" onClick={() => setActivePolicy(null)} className="rounded-full px-6">
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
