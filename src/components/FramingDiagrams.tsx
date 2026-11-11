import React from 'react';
import type { ArchivalPrint, BorderOption, SizeOption, SubstrateOption } from '../data/catalogue';

interface SheetProportionDiagramProps {
  print: ArchivalPrint;
  size: SizeOption;
  border: BorderOption;
  substrate: SubstrateOption;
  showFramePreview: boolean;
}

/**
 * Pure coordinate-computed SVG diagram illustrating true sheet dimensions,
 * unframed archival paper margin, plate area, and optional white-oak frame moulding.
 * All <text> labels carry explicit numeric x/y coordinates in dedicated outer bands
 * >= 14px clear of every stroke, with cartographic paint-order stroke halos.
 */
export const SheetProportionDiagram: React.FC<SheetProportionDiagramProps> = ({
  print,
  size,
  border,
  substrate,
  showFramePreview,
}) => {
  // Fixed viewBox 520 x 440; drawing area centered in [110..410, 56..356] leaving wide reserved label bands
  const maxDrawHeight = 268;
  const aspect = size.widthInches / size.heightInches; // 0.75 for 3:4
  const sheetH = maxDrawHeight;
  const sheetW = Math.round(sheetH * aspect);
  const centerX = 260;
  const centerY = 204;

  const sheetX = Math.round(centerX - sheetW / 2);
  const sheetY = Math.round(centerY - sheetH / 2);

  const pxPerInch = sheetH / size.heightInches;
  const borderPx = Math.round(border.marginInches * pxPerInch);
  const matPx = showFramePreview ? Math.round(2.0 * pxPerInch) : 0;
  const mouldingPx = showFramePreview ? 10 : 0;

  const imageX = sheetX + borderPx;
  const imageY = sheetY + borderPx;
  const imageW = Math.max(24, sheetW - borderPx * 2);
  const imageH = Math.max(32, sheetH - borderPx * 2);

  const outerX = sheetX - matPx - mouldingPx;
  const outerY = sheetY - matPx - mouldingPx;
  const outerW = sheetW + (matPx + mouldingPx) * 2;
  const outerH = sheetH + (matPx + mouldingPx) * 2;

  const outerWidthInches = showFramePreview ? size.widthInches + 5.5 : size.widthInches;
  const outerHeightInches = showFramePreview ? size.heightInches + 5.5 : size.heightInches;

  const primarySwatch = print.inkSwatches[0]?.colorCss ?? 'oklch(0.29 0.062 228)';
  const secondarySwatch = print.inkSwatches[1]?.colorCss ?? 'oklch(0.45 0.092 68)';

  const haloStyle: React.CSSProperties = {
    paintOrder: 'stroke',
    stroke: 'var(--color-surface)',
    strokeWidth: '4px',
    strokeLinejoin: 'round',
  };

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 520 420"
        role="img"
        aria-label={`Scale proportion diagram for ${size.label} sheet with ${border.label}`}
        className="h-auto w-full max-w-[520px] mx-auto select-none"
      >
        <style>{`
          rect, line, circle, text, g {
            transition: all 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
        {/* Optional white oak frame & 8-ply window mat */}
        {showFramePreview ? (
          <g>
            <rect
              x={outerX}
              y={outerY}
              width={outerW}
              height={outerH}
              fill="oklch(0.68 0.065 75)"
              stroke="oklch(0.42 0.05 68)"
              strokeWidth={1.5}
            />
            <rect
              x={outerX + mouldingPx}
              y={outerY + mouldingPx}
              width={outerW - mouldingPx * 2}
              height={outerH - mouldingPx * 2}
              fill="oklch(0.975 0.006 95)"
              stroke="oklch(0.75 0.015 195)"
              strokeWidth={1}
            />
          </g>
        ) : null}

        {/* Archival paper/canvas sheet */}
        <rect
          x={sheetX}
          y={sheetY}
          width={sheetW}
          height={sheetH}
          fill="oklch(0.988 0.004 195)"
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1.25}
        />

        {/* Printed plate area */}
        <rect
          x={imageX}
          y={imageY}
          width={imageW}
          height={imageH}
          fill="oklch(0.955 0.009 195)"
          stroke={primarySwatch}
          strokeWidth={1.25}
        />

        {/* Subtle geometric motif inside the plate representing archival engraving geometry */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.max(12, Math.round(Math.min(imageW, imageH) * 0.34))}
          fill="none"
          stroke={primarySwatch}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.max(6, Math.round(Math.min(imageW, imageH) * 0.18))}
          fill="none"
          stroke={secondarySwatch}
          strokeWidth={1}
        />

        {/* Top horizontal dimension tick line (16px clear above outer edge) */}
        <line
          x1={outerX}
          y1={outerY - 14}
          x2={outerX + outerW}
          y2={outerY - 14}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />
        <line
          x1={outerX}
          y1={outerY - 19}
          x2={outerX}
          y2={outerY - 9}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />
        <line
          x1={outerX + outerW}
          y1={outerY - 19}
          x2={outerX + outerW}
          y2={outerY - 9}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />

        {/* Top width label >= 14px clear above the dimension line */}
        <text
          x={260}
          y={Math.max(20, outerY - 28)}
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fill="var(--color-foreground)"
          style={haloStyle}
        >
          {showFramePreview
            ? `${outerWidthInches.toFixed(1)} in framed width`
            : `${size.widthInches} in sheet width`}
        </text>

        {/* Right vertical dimension tick line (16px clear right of outer edge) */}
        <line
          x1={outerX + outerW + 16}
          y1={outerY}
          x2={outerX + outerW + 16}
          y2={outerY + outerH}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />
        <line
          x1={outerX + outerW + 11}
          y1={outerY}
          x2={outerX + outerW + 21}
          y2={outerY}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />
        <line
          x1={outerX + outerW + 11}
          y1={outerY + outerH}
          x2={outerX + outerW + 21}
          y2={outerY + outerH}
          stroke="oklch(0.42 0.022 225)"
          strokeWidth={1}
        />

        {/* Right height label placed in dedicated open right band >= 14px clear of vertical line */}
        <text
          x={outerX + outerW + 30}
          y={200}
          textAnchor="start"
          fontSize="12"
          fontWeight="500"
          fill="var(--color-foreground)"
          style={haloStyle}
        >
          {showFramePreview ? `${outerHeightInches.toFixed(1)} in` : `${size.heightInches} in`}
        </text>
        <text
          x={outerX + outerW + 30}
          y={216}
          textAnchor="start"
          fontSize="11"
          fill="var(--color-muted)"
          style={haloStyle}
        >
          {showFramePreview ? 'framed height' : 'sheet height'}
        </text>

        {/* Bottom specification caption in reserved footer band (y = 394..410) */}
        <text
          x={260}
          y={398}
          textAnchor="middle"
          fontSize="12"
          fill="var(--color-muted)"
          style={haloStyle}
        >
          {`${substrate.shortName} · ${
            border.marginInches > 0
              ? `Image ${size.widthInches - border.marginInches * 2} × ${
                  size.heightInches - border.marginInches * 2
                } in inside ${border.marginInches} in border`
              : `Full-bleed ${size.widthInches} × ${size.heightInches} in`
          }`}
        </text>
      </svg>
    </div>
  );
};

/**
 * Conservation framing layer diagram for the Archival & Framing Guide section.
 * Uses pure fixed coordinates in a 640x280 viewBox with non-overlapping right-hand labels.
 */
export const ConservationCrossSectionDiagram: React.FC = () => {
  const layers = [
    {
      index: 0,
      y: 44,
      height: 14,
      fill: 'oklch(0.88 0.03 215)',
      stroke: 'oklch(0.45 0.05 222)',
      title: 'UV-filtering acrylic glazing (99% UV block)',
    },
    {
      index: 1,
      y: 96,
      height: 20,
      fill: 'oklch(0.985 0.005 195)',
      stroke: 'oklch(0.45 0.02 220)',
      title: '8-ply acid-free cotton rag window mat',
    },
    {
      index: 2,
      y: 154,
      height: 14,
      fill: 'oklch(0.955 0.012 90)',
      stroke: 'oklch(0.29 0.062 228)',
      title: '310 gsm Barrow & Plate print (Japanese kozo T-hinges)',
    },
    {
      index: 3,
      y: 206,
      height: 22,
      fill: 'oklch(0.91 0.014 195)',
      stroke: 'oklch(0.45 0.02 220)',
      title: '4-ply buffered conservation backing board & dust seal',
    },
  ];

  const haloStyle: React.CSSProperties = {
    paintOrder: 'stroke',
    stroke: 'var(--color-surface)',
    strokeWidth: '4px',
    strokeLinejoin: 'round',
  };

  return (
    <svg
      viewBox="0 0 640 264"
      role="img"
      aria-label="Conservation framing assembly cross-section showing glazing, 8-ply cotton rag window mat, T-hinged print, and archival backing board"
      className="h-auto w-full max-w-[640px]"
    >
      {/* Left hardwood moulding rabbet profile */}
      <path
        d="M 24 26 L 68 26 L 68 42 L 46 42 L 46 234 L 24 234 Z"
        fill="oklch(0.66 0.065 74)"
        stroke="oklch(0.38 0.048 68)"
        strokeWidth={1.5}
      />

      {layers.map((layer) => {
        const midY = layer.y + layer.height / 2;
        return (
          <g key={layer.index}>
            {layer.index === 1 ? (
              <>
                {/* Split window mat bevel opening */}
                <rect
                  x={54}
                  y={layer.y}
                  width={68}
                  height={layer.height}
                  fill={layer.fill}
                  stroke={layer.stroke}
                  strokeWidth={1.25}
                />
                <rect
                  x={186}
                  y={layer.y}
                  width={68}
                  height={layer.height}
                  fill={layer.fill}
                  stroke={layer.stroke}
                  strokeWidth={1.25}
                />
              </>
            ) : (
              <rect
                x={54}
                y={layer.y}
                width={200}
                height={layer.height}
                fill={layer.fill}
                stroke={layer.stroke}
                strokeWidth={1.25}
              />
            )}

            {/* Leader line stopping at x=284, label starting >= 14px clear at x=300 */}
            <line
              x1={262}
              y1={midY}
              x2={286}
              y2={midY}
              stroke="oklch(0.55 0.020 218)"
              strokeWidth={1}
            />
            <circle cx={286} cy={midY} r={2.2} fill="oklch(0.29 0.062 228)" />
            <text
              x={302}
              y={midY + 4}
              textAnchor="start"
              fontSize="13"
              fontWeight="500"
              fill="var(--color-foreground)"
              style={haloStyle}
            >
              {layer.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
