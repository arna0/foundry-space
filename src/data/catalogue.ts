import heroObservatoryImg from '../assets/images/space_hero_observatory_1794376910232.jpg';
import printJwstDeepField from '../assets/images/framed_jwst_deep_field_1794387514770.jpg';
import printNasmythLunar from '../assets/images/framed_nasmyth_lunar_relief_1794387514631.jpg';
import printKeplerOrrery from '../assets/images/framed_kepler_orrery_1794387515953.jpg';
import printPulsarWaves from '../assets/images/framed_pulsar_waves_1794387516664.jpg';
import printCelestialPlanisphere from '../assets/images/framed_celestial_planisphere_1794387517435.jpg';
import printSaturnRings from '../assets/images/framed_saturn_rings_1794387538268.jpg';
import printCarinaCliffs from '../assets/images/framed_carina_nebula_1794387520147.jpg';
import printApolloHadley from '../assets/images/framed_apollo_hadley_1794387518273.jpg';
import printSgraBlackhole from '../assets/images/framed_sgra_blackhole_1794387539545.jpg';
import printPleiadesCluster from '../assets/images/framed_pleiades_cluster_1794387539700.jpg';
import printVoyagerPulsar from '../assets/images/framed_voyager_pulsar_1794387518304.jpg';
import printMarsRelief from '../assets/images/framed_mars_relief_1794387540246.jpg';

export const HERO_IMAGE = heroObservatoryImg;

export type CollectionCategory =
  | 'Deep Field'
  | 'Lunar Cartography'
  | 'Orbital Mechanics'
  | 'Radio Astronomy'
  | 'Constellation Folios';

export type PrintSizeId = '12x16' | '18x24' | '24x32' | '30x40';
export type SubstrateId = 'obsidian_rag_340' | 'cotton_rag_310' | 'deep_canvas_420';
export type BorderOptionId = 'archival_15' | 'exhibition_25' | 'full_bleed';

export interface SizeOption {
  id: PrintSizeId;
  label: string;
  widthInches: number;
  heightInches: number;
  priceDeltaCents: number;
  recommendedMoulding: string;
}

export interface SubstrateOption {
  id: SubstrateId;
  name: string;
  shortName: string;
  gsm: number;
  caliperMil: number;
  finish: string;
  priceDeltaCents: number;
  notes: string;
}

export interface BorderOption {
  id: BorderOptionId;
  label: string;
  marginInches: number;
  detail: string;
}

export interface InkSwatch {
  name: string;
  colorCss: string;
}

export interface ArchivalPrint {
  id: string;
  catalogNumber: string;
  title: string;
  category: CollectionCategory;
  year: number;
  originArchive: string;
  originalMedium: string;
  basePriceCents: number;
  featured: boolean;
  image?: string;
  imageAlt: string;
  aspectRatioLabel: string;
  inkSwatches: InkSwatch[];
  description: string;
  conservationNotes: string;
  coordinates?: string;
  soldOutCombinations?: Array<{ sizeId?: PrintSizeId; substrateId?: SubstrateId }>;
}

export const SIZE_OPTIONS: SizeOption[] = [
  {
    id: '12x16',
    label: '12 × 16 in',
    widthInches: 12,
    heightInches: 16,
    priceDeltaCents: 0,
    recommendedMoulding: '0.75 in matte carbon black or brushed titanium profile',
  },
  {
    id: '18x24',
    label: '18 × 24 in',
    widthInches: 18,
    heightInches: 24,
    priceDeltaCents: 4200,
    recommendedMoulding: '0.875 in anodized space titanium with 2.5 in obsidian rag mat',
  },
  {
    id: '24x32',
    label: '24 × 32 in',
    widthInches: 24,
    heightInches: 32,
    priceDeltaCents: 9200,
    recommendedMoulding: '1.125 in brushed blackened bronze with Optium museum UV glazing',
  },
  {
    id: '30x40',
    label: '30 × 40 in',
    widthInches: 30,
    heightInches: 40,
    priceDeltaCents: 15800,
    recommendedMoulding: '1.25 in deep-rabbet observatory steel with concealed wood strainer',
  },
];

export const SUBSTRATE_OPTIONS: SubstrateOption[] = [
  {
    id: 'obsidian_rag_340',
    name: '340 gsm Starlight Obsidian Velvet Rag',
    shortName: '340 gsm Obsidian Rag',
    gsm: 340,
    caliperMil: 21.0,
    finish: 'Deep optical black, 100% cotton mould-made with carbon pigment bath',
    priceDeltaCents: 1200,
    notes: 'Engineered for maximal Dmax density in deep field cosmic surveys and pulsar profiles.',
  },
  {
    id: 'cotton_rag_310',
    name: '310 gsm Museum Cotton Rag (Natural)',
    shortName: '310 gsm Museum Rag',
    gsm: 310,
    caliperMil: 19.5,
    finish: 'Smooth matte, OBA-free archival cotton with warm starlight tone',
    priceDeltaCents: 0,
    notes: 'Acid- and lignin-free mould-made sheet rated 150+ years under UV conservation glazing.',
  },
  {
    id: 'deep_canvas_420',
    name: '420 gsm Deep-Space Archival Canvas',
    shortName: '420 gsm Space Canvas',
    gsm: 420,
    caliperMil: 24.5,
    finish: 'Heavy 2-over-1 Oxford weave, sealed with museum matte anti-reflective varnish',
    priceDeltaCents: 3800,
    notes: 'Supplied unmounted with 2.5 in gallery border for custom float framing.',
  },
];

export const BORDER_OPTIONS: BorderOption[] = [
  {
    id: 'archival_15',
    label: '1.5 in archival border',
    marginInches: 1.5,
    detail: 'Included within outer sheet dimensions for T-hinging under an 8-ply window mat.',
  },
  {
    id: 'exhibition_25',
    label: '2.5 in observatory border',
    marginInches: 2.5,
    detail: 'Wide margin featuring subtle debossed plate coordinates for float-mounting.',
  },
  {
    id: 'full_bleed',
    label: 'Cosmic full-bleed',
    marginInches: 0,
    detail: 'Printed edge-to-edge across the entire sheet without border margins.',
  },
];

export const CATALOGUE: ArchivalPrint[] = [
  {
    id: 'webb-first-deep-field-smacs0723',
    catalogNumber: 'FS-01',
    title: 'SMACS 0723 Cosmic Gravitational Lens Field',
    category: 'Deep Field',
    year: 2022,
    originArchive: 'James Webb Space Telescope NIRCam Science Archive',
    originalMedium: 'Infrared composite & 12-channel encapsulated mineral pigment',
    basePriceCents: 8800,
    featured: true,
    image: printJwstDeepField,
    imageAlt:
      'Direct museum scan of SMACS 0723 Webb Deep Field fine-art print showing thousands of distant galaxies and gravitational lensing arcs',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'RA 07h 23m 19.5s · DEC -73° 27\' 15"',
    inkSwatches: [
      { name: 'Cosmic Void Black', colorCss: 'oklch(0.12 0.015 255)' },
      { name: 'Stellar Cyan Phosphor', colorCss: 'oklch(0.74 0.135 218)' },
      { name: 'Redshifted Ember', colorCss: 'oklch(0.65 0.18 42)' },
    ],
    description:
      'The deepest and sharpest infrared survey of the distant universe ever captured, detailing thousands of galaxies across a patch of sky the size of a grain of sand held at arm’s length. Gravitationally lensed arclets reveal early starburst clusters from over 13.1 billion years ago.',
    conservationNotes:
      'Printed with deep-spectrum black and 12 calibrated pigment inks to render gravitational lens distortion arcs with microscopic fidelity.',
  },
  {
    id: 'lunar-orbiter-topography-1874',
    catalogNumber: 'FS-02',
    title: 'Lunar Quadrant IV — Mare Tranquillitatis & Terminator',
    category: 'Lunar Cartography',
    year: 1874,
    originArchive: 'Nasmyth & Carpenter High-Altitude Royal Observatory Plates',
    originalMedium: 'Photogravure from plaster relief models & copper burin',
    basePriceCents: 7800,
    featured: true,
    image: printNasmythLunar,
    imageAlt:
      'Direct museum scan of 1874 James Nasmyth lunar cartography print with Copernicus crater relief shadows and Latin typography',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: '0.6740° N · 23.4720° E (Apollo 11 Datum)',
    inkSwatches: [
      { name: 'Basaltic Mare Umber', colorCss: 'oklch(0.24 0.02 225)' },
      { name: 'Crater Rim Chalk', colorCss: 'oklch(0.92 0.008 240)' },
      { name: 'Volcanic Obsidian', colorCss: 'oklch(0.14 0.012 250)' },
    ],
    description:
      'Masterwork lunar cartography based on James Nasmyth’s thirty-year telescopic observations through a 20-inch Newtonian reflector. Illustrates crater ejecta rays from Copernicus and Tycho, wrinkle ridges across Mare Serenitatis, and the exact basalt plains where humanity first set foot.',
    conservationNotes:
      'Scanned directly from an original 1874 folio, de-foxed without loss of surface lunar micro-crater detail.',
  },
  {
    id: 'kepler-planetary-orrery-1609',
    catalogNumber: 'FS-03',
    title: 'Astronomia Nova — Keplerian Elliptical Orbits',
    category: 'Orbital Mechanics',
    year: 1609,
    originArchive: 'Prague Imperial Observatory & Keplerian Folios',
    originalMedium: 'Copperplate intaglio, burnished brass & Prussian ink wash',
    basePriceCents: 8200,
    featured: true,
    image: printKeplerOrrery,
    imageAlt:
      'Direct museum scan of 1609 Johannes Kepler Astronomia Nova planetary orbit chart on laid paper with concentric ellipses',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'Heliocentric Ecliptic J2000.0 Plane',
    inkSwatches: [
      { name: 'Prussian Night', colorCss: 'oklch(0.28 0.065 235)' },
      { name: 'Burnished Orrery Gold', colorCss: 'oklch(0.78 0.145 76)' },
      { name: 'Laid Rag Ground', colorCss: 'oklch(0.95 0.01 90)' },
    ],
    description:
      'Johannes Kepler’s landmark geometric formulation overturning two thousand years of circular epicycles to prove the first law of planetary motion: planets move in ellipses with the Sun at one focus. Features equal-area orbital velocity vectors and heliocentric latitude subdivisions.',
    conservationNotes:
      'Line sharpness verified down to 0.15mm line weights; dual-tone gold and Prussian ink channels.',
  },
  {
    id: 'cp1919-radio-pulsar-profile-1967',
    catalogNumber: 'FS-04',
    title: 'CP 1919 Neutron Star Stacked Radio Pulses',
    category: 'Radio Astronomy',
    year: 1967,
    originArchive: 'Mullard Radio Astronomy Observatory & Arecibo Survey',
    originalMedium: 'Plotted radio receiver pen-oscilloscope chart on black rag',
    basePriceCents: 7400,
    featured: true,
    image: printPulsarWaves,
    imageAlt:
      'Direct museum scan of CP 1919 stacked pulsar radio frequency waves on deep obsidian velvet black paper',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'RA 19h 21m 44.8s · DEC +21° 53\' 02"',
    inkSwatches: [
      { name: 'Pulsar Phosphor Cyan', colorCss: 'oklch(0.78 0.14 215)' },
      { name: 'Space Void Black', colorCss: 'oklch(0.10 0.012 255)' },
      { name: 'Signal Peak White', colorCss: 'oklch(0.98 0.002 240)' },
    ],
    description:
      'Eighty consecutive periods from the first discovered radio pulsar PSR B1919+21, pulsing with a period of 1.337 seconds from a magnetized rotating neutron star 2,283 light-years away in the constellation Vulpecula. Rendered on deep starlight obsidian paper.',
    conservationNotes:
      'White and phosphor cyan line drafting printed with opaque pigment ink for absolute contrast on 340 gsm obsidian velvet rag.',
  },
  {
    id: 'northern-celestial-hemisphere-1822',
    catalogNumber: 'FS-05',
    title: 'Northern Celestial Hemisphere — Boreal Constellations',
    category: 'Constellation Folios',
    year: 1822,
    originArchive: 'Royal Greenwich Observatory Astronomical Atlas',
    originalMedium: 'Copperplate intaglio with Prussian cyan ground',
    basePriceCents: 7200,
    featured: true,
    image: printCelestialPlanisphere,
    imageAlt:
      'Direct museum scan of 1822 antique celestial star chart hemisphere in Prussian blue and sepia line on cotton rag paper',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'Boreal Polar Colure 90° N',
    inkSwatches: [
      { name: 'Observatory Prussian', colorCss: 'oklch(0.28 0.065 235)' },
      { name: 'Sepia Colure', colorCss: 'oklch(0.50 0.08 68)' },
      { name: 'Natural Cotton Rag', colorCss: 'oklch(0.96 0.008 95)' },
    ],
    description:
      'Restored copperplate celestial projection plotting right-ascension hours, ecliptic obliquity, and magnitude rankings for 3,000 northern stars from Ursa Major to Cassiopeia.',
    conservationNotes:
      'Burin line depths preserved from high-resolution drum scans of an intact library folio.',
  },
  {
    id: 'cassini-saturn-rings-mechanics-1859',
    catalogNumber: 'FS-06',
    title: 'Saturnian Ring System & Maxwell Stability Proof',
    category: 'Orbital Mechanics',
    year: 1859,
    originArchive: 'Cambridge Adams Prize Mathematical Monograph',
    originalMedium: 'Lithographic engraving on slate paper',
    basePriceCents: 7600,
    featured: true,
    image: printSaturnRings,
    imageAlt:
      'Direct museum scan of 1859 Saturn and ring system architectural monograph print with Cassini division diagrams',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'Ring Inclination 26.73°',
    inkSwatches: [
      { name: 'Ring Particle Slate', colorCss: 'oklch(0.38 0.02 245)' },
      { name: 'Cassini Division Black', colorCss: 'oklch(0.12 0.015 255)' },
    ],
    description:
      'James Clerk Maxwell’s breakthrough demonstration that Saturn’s rings cannot be solid or liquid sheets without tearing apart, but must consist of millions of independent particulate moonlets orbiting in resonance.',
    conservationNotes: 'Printed with high tonal separation across the subtle ring density transitions.',
  },
  {
    id: 'carina-nebula-cosmic-cliffs-2022',
    catalogNumber: 'FS-07',
    title: 'Carina Nebula (NGC 3324) Stellar Nursery Spectrogram',
    category: 'Deep Field',
    year: 2022,
    originArchive: 'Hubble & Webb Combined Infrared Archive',
    originalMedium: '12-channel multispectral narrow-band pigment',
    basePriceCents: 8600,
    featured: true,
    image: printCarinaCliffs,
    imageAlt:
      'Direct museum scan of Carina Nebula Cosmic Cliffs NGC 3324 fine-art print with glowing amber dust peaks and cyan stars',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'RA 10h 37m 23s · DEC -58° 38\' 03"',
    inkSwatches: [
      { name: 'Ionized Gas Gold', colorCss: 'oklch(0.72 0.15 75)' },
      { name: 'Hydrogen Alpha Cyan', colorCss: 'oklch(0.68 0.14 210)' },
      { name: 'Interstellar Dust', colorCss: 'oklch(0.18 0.02 240)' },
    ],
    description:
      'Towering seven-light-year-tall peaks of interstellar gas and dust sculpted by intense ultraviolet radiation from hot, massive nascent stars. Reveals previously invisible areas of star birth.',
    conservationNotes: 'Archival pigment reproduction with expanded Dmax for velvet dark nebulae.',
  },
  {
    id: 'apollo-11-hadley-rille-traverses-1971',
    catalogNumber: 'FS-08',
    title: 'Hadley-Apennine Landing Site & Lunar Rover Traverse Map',
    category: 'Lunar Cartography',
    year: 1971,
    originArchive: 'Defense Mapping Agency Topographic Center for NASA',
    originalMedium: 'Offset topographic lithograph with contour relief',
    basePriceCents: 7400,
    featured: true,
    image: printApolloHadley,
    imageAlt:
      'Direct museum scan of official 1971 NASA Apollo 15 Hadley Rille lunar topographic contour survey map',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: '26.1322° N · 3.6339° E (Hadley Datum)',
    inkSwatches: [
      { name: 'Rille Shadow Iron', colorCss: 'oklch(0.20 0.02 230)' },
      { name: 'Survey Contour Gray', colorCss: 'oklch(0.65 0.02 240)' },
      { name: 'Lunar Traverse Cyan', colorCss: 'oklch(0.74 0.13 220)' },
    ],
    description:
      'Official lunar topographic map used in mission planning for Apollo 15, illustrating five-meter contour intervals along the canyon depths of Hadley Rille and the steep massif of Mons Hadley Delta.',
    conservationNotes: 'Topographic contour text remains crisp down to 0.25mm height.',
  },
  {
    id: 'event-horizon-sgra-blackhole-2022',
    catalogNumber: 'FS-09',
    title: 'Sagittarius A* Galactic Center Supermassive Horizon',
    category: 'Radio Astronomy',
    year: 2022,
    originArchive: 'Event Horizon Telescope Very Long Baseline Array',
    originalMedium: 'Interferometric radio millimeter synthesis on black rag',
    basePriceCents: 8400,
    featured: true,
    image: printSgraBlackhole,
    imageAlt:
      'Direct museum scan of Event Horizon Telescope Sagittarius A* black hole photon accretion ring print',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'RA 17h 45m 40.04s · DEC -29° 00\' 28.1"',
    inkSwatches: [
      { name: 'Accretion Ember Glow', colorCss: 'oklch(0.72 0.18 55)' },
      { name: 'Photon Ring Gold', colorCss: 'oklch(0.82 0.16 85)' },
      { name: 'Horizon Singularity Black', colorCss: 'oklch(0.08 0.01 255)' },
    ],
    description:
      'The direct silhouette of the supermassive black hole at the center of the Milky Way galaxy, four million times the mass of the Sun. Light bent by extreme general relativistic spacetime curvature reveals the bright plasma accretion ring.',
    conservationNotes: 'Printed on 340 gsm Obsidian Velvet Rag with zero sheen reflection.',
  },
  {
    id: 'tycho-brahe-uranometria-pleiades-1603',
    catalogNumber: 'FS-10',
    title: 'The Pleiades & Seven Sisters Star Cluster Folio',
    category: 'Constellation Folios',
    year: 1603,
    originArchive: 'Bayer Uranometria & Hven Island Observations',
    originalMedium: 'Alexander Mair burin copperplate engraving',
    basePriceCents: 7000,
    featured: true,
    image: printPleiadesCluster,
    imageAlt:
      'Direct museum scan of 1603 Johann Bayer Uranometria star atlas chart of Pleiades Seven Sisters open cluster',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'RA 03h 47m 24s · DEC +24° 07\' 00" (M45)',
    inkSwatches: [
      { name: 'Laid Paper Starlight', colorCss: 'oklch(0.96 0.008 240)' },
      { name: 'Burin Ink Charcoal', colorCss: 'oklch(0.20 0.02 230)' },
    ],
    description:
      'Chart 32 from Johann Bayer’s Uranometria, the foundational star atlas introducing Greek-letter stellar designations. Captures the open cluster M45 embedded in delicate reflection nebulosity.',
    conservationNotes: 'True laid paper watermark and copperplate emboss margins preserved.',
  },
  {
    id: 'voyager-golden-record-pulsar-map-1977',
    catalogNumber: 'FS-11',
    title: 'Voyager Interstellar Pulsar Coordinate Map',
    category: 'Radio Astronomy',
    year: 1977,
    originArchive: 'NASA Jet Propulsion Laboratory & Carl Sagan Archive',
    originalMedium: 'Electro-etched gold-anodized copperplate drafting',
    basePriceCents: 8000,
    featured: true,
    image: printVoyagerPulsar,
    imageAlt:
      'Direct museum scan of 1977 NASA Voyager Golden Record interstellar pulsar coordinate map with gold metallic line on black rag',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: 'Sol Barycentric Baseline to 14 Pulsars',
    inkSwatches: [
      { name: 'Voyager Gold Ink', colorCss: 'oklch(0.78 0.145 76)' },
      { name: 'Deep Space Void', colorCss: 'oklch(0.10 0.012 255)' },
    ],
    description:
      'The iconic interstellar map etched onto the cover of the Golden Record aboard Voyager 1 and 2, pinpointing Earth’s location relative to fourteen galactic pulsars with binary frequency periods.',
    conservationNotes: 'Printed in metallic gold pigment over jet obsidian cotton rag.',
  },
  {
    id: 'mars-valles-marineris-relief-1976',
    catalogNumber: 'FS-12',
    title: 'Valles Marineris Grand Canyon of Mars Relief Survey',
    category: 'Lunar Cartography',
    year: 1976,
    originArchive: 'Viking Orbiter 1 Topographic Shaded Relief Series',
    originalMedium: 'Airbrush shaded relief & orthophoto mosaic',
    basePriceCents: 7600,
    featured: true,
    image: printMarsRelief,
    imageAlt:
      'Direct museum scan of 1976 NASA Viking Orbiter Valles Marineris Mars topographic shaded relief map in rust ochre',
    aspectRatioLabel: '3:4 vertical sheet',
    coordinates: '13.9° S · 59.2° W (Mars Datum)',
    inkSwatches: [
      { name: 'Martian Rust Ochre', colorCss: 'oklch(0.55 0.16 45)' },
      { name: 'Chasma Shadow Umber', colorCss: 'oklch(0.22 0.03 240)' },
      { name: 'Plateau Dust Tint', colorCss: 'oklch(0.85 0.08 65)' },
    ],
    description:
      'Detailed four-thousand-kilometer-long rift system spanning a quarter of the circumference of Mars, plunging to depths of seven kilometers with landslide scarps and tectonic grabens.',
    conservationNotes: 'Calibrated directly to Viking Orbiter photogrammetry standards.',
  },
];

export function computeVariantPriceCents(
  print: ArchivalPrint,
  sizeId: PrintSizeId,
  substrateId: SubstrateId
): number {
  const size = SIZE_OPTIONS.find((s) => s.id === sizeId) ?? SIZE_OPTIONS[0];
  const substrate = SUBSTRATE_OPTIONS.find((s) => s.id === substrateId) ?? SUBSTRATE_OPTIONS[0];
  return Math.max(2800, print.basePriceCents + size.priceDeltaCents + substrate.priceDeltaCents);
}

export function isVariantSoldOut(
  print: ArchivalPrint,
  sizeId: PrintSizeId,
  substrateId: SubstrateId
): boolean {
  if (!print.soldOutCombinations) return false;
  return print.soldOutCombinations.some(
    (combo) =>
      (combo.sizeId === undefined || combo.sizeId === sizeId) &&
      (combo.substrateId === undefined || combo.substrateId === substrateId)
  );
}
