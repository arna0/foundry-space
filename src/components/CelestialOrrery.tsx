import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCw } from 'lucide-react';
import { Button } from './ui';

interface PlanetSpec {
  name: string;
  radiusAU: number;
  pixelRadius: number;
  periodDays: number;
  size: number;
  color: string;
  eccentricity: number;
}

const PLANETS: PlanetSpec[] = [
  { name: 'Mercury', radiusAU: 0.387, pixelRadius: 36, periodDays: 88, size: 3, color: 'oklch(0.72 0.08 75)', eccentricity: 0.205 },
  { name: 'Venus', radiusAU: 0.723, pixelRadius: 58, periodDays: 224.7, size: 4.5, color: 'oklch(0.85 0.09 85)', eccentricity: 0.007 },
  { name: 'Earth', radiusAU: 1.0, pixelRadius: 84, periodDays: 365.25, size: 5, color: 'oklch(0.74 0.13 220)', eccentricity: 0.017 },
  { name: 'Mars', radiusAU: 1.524, pixelRadius: 112, periodDays: 687, size: 4, color: 'oklch(0.65 0.16 35)', eccentricity: 0.093 },
  { name: 'Jupiter', radiusAU: 5.204, pixelRadius: 154, periodDays: 4332.6, size: 9, color: 'oklch(0.78 0.12 65)', eccentricity: 0.048 },
  { name: 'Saturn', radiusAU: 9.582, pixelRadius: 198, periodDays: 10759, size: 7.5, color: 'oklch(0.82 0.11 80)', eccentricity: 0.054 },
];

export const CelestialOrrery: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2);
  const [elapsedDays, setElapsedDays] = useState<number>(142);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetSpec | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setElapsedDays((prev) => prev + dt * 15 * speedMultiplier);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speedMultiplier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 12, ry: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const centerX = 260;
  const centerY = 240;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-card border border-border/50 bg-surface/50 p-6 backdrop-blur-sm transition-transform duration-300"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <span className="font-mono text-caption uppercase tracking-wider text-primary">
            KEPLERIAN HELIOCENTRIC ORRERY
          </span>
          <h3 className="font-display text-title text-foreground">
            Planetary orbital mechanics &amp; celestial epicycles
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            tone="quiet"
            onClick={() => setIsPlaying((p) => !p)}
            className="min-h-9 px-3 text-caption font-mono"
            aria-label={isPlaying ? 'Pause orrery animation' : 'Start orrery animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>RESUME</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : s === 2 ? 5 : 1))}
            className="inline-flex min-h-9 items-center gap-1 rounded-control border border-border/50 px-2.5 font-mono text-caption text-foreground hover:border-foreground"
          >
            <RotateCw className="h-3 w-3" aria-hidden="true" />
            <span>{speedMultiplier}× SPEED</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Stage */}
      <div className="relative mx-auto mt-4 max-w-xl">
        <svg
          viewBox="0 0 520 480"
          role="img"
          aria-label="Interactive celestial orrery diagram"
          className="h-auto w-full select-none"
        >
          {/* Subtle background coordinate crosshairs */}
          <line
            x1={centerX}
            y1={20}
            x2={centerX}
            y2={460}
            stroke="oklch(0.24 0.024 250)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={40}
            y1={centerY}
            x2={480}
            y2={centerY}
            stroke="oklch(0.24 0.024 250)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Equinoctial coordinate ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={220}
            fill="none"
            stroke="oklch(0.22 0.02 250)"
            strokeWidth={1}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={230}
            fill="none"
            stroke="oklch(0.20 0.015 250)"
            strokeWidth={0.75}
            strokeDasharray="2 4"
          />

          {/* Central Sun */}
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r={16}
              fill="oklch(0.85 0.16 85 / 0.15)"
              className="animate-pulse"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={10}
              fill="oklch(0.88 0.18 85)"
              stroke="oklch(0.95 0.10 95)"
              strokeWidth={1.5}
            />
            {/* Sun rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = centerX + Math.cos(rad) * 11;
              const y1 = centerY + Math.sin(rad) * 11;
              const x2 = centerX + Math.cos(rad) * 15;
              const y2 = centerY + Math.sin(rad) * 15;
              return (
                <line
                  key={angle}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="oklch(0.88 0.18 85)"
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {/* Planetary orbits & bodies */}
          {PLANETS.map((planet) => {
            const isHovered = hoveredPlanet?.name === planet.name;
            const angleRad = ((elapsedDays / planet.periodDays) * 2 * Math.PI) % (2 * Math.PI);
            const px = centerX + Math.cos(angleRad) * planet.pixelRadius;
            const py = centerY + Math.sin(angleRad) * planet.pixelRadius;

            return (
              <g
                key={planet.name}
                onMouseEnter={() => setHoveredPlanet(planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
                className="cursor-pointer"
              >
                {/* Orbit track */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={planet.pixelRadius}
                  fill="none"
                  stroke={isHovered ? 'oklch(0.74 0.135 218)' : 'oklch(0.24 0.024 250)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={planet.eccentricity > 0.05 ? '4 3' : undefined}
                />

                {/* Subtle orbital path glow on hover */}
                {isHovered ? (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={planet.pixelRadius}
                    fill="none"
                    stroke="oklch(0.74 0.135 218 / 0.25)"
                    strokeWidth={6}
                  />
                ) : null}

                {/* Planet Body */}
                <circle
                  cx={px}
                  cy={py}
                  r={planet.size}
                  fill={planet.color}
                  stroke="oklch(0.12 0.016 255)"
                  strokeWidth={1.25}
                />

                {/* Saturn's rings */}
                {planet.name === 'Saturn' ? (
                  <ellipse
                    cx={px}
                    cy={py}
                    rx={planet.size * 2}
                    ry={planet.size * 0.75}
                    fill="none"
                    stroke={planet.color}
                    strokeWidth={1.2}
                    transform={`rotate(-25 ${px} ${py})`}
                  />
                ) : null}

                {/* Earth's moon */}
                {planet.name === 'Earth' ? (
                  <circle
                    cx={px + Math.cos(angleRad * 12) * 11}
                    cy={py + Math.sin(angleRad * 12) * 11}
                    r={1.8}
                    fill="oklch(0.92 0.01 240)"
                  />
                ) : null}

                {/* Label */}
                <text
                  x={px + planet.size + 4}
                  y={py + 3}
                  fontSize="10"
                  fontFamily="Space Mono, monospace"
                  fill={isHovered ? 'var(--color-primary)' : 'var(--color-muted)'}
                >
                  {planet.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Hover Info Floating Monospace Tag */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-3 font-mono text-caption">
          {hoveredPlanet ? (
            <div>
              <span className="font-semibold text-primary">{hoveredPlanet.name.toUpperCase()}</span>{' '}
              · Distance: <span className="text-foreground">{hoveredPlanet.radiusAU} AU</span> ·
              Period: <span className="text-foreground">{hoveredPlanet.periodDays} days</span> ·
              Eccentricity: <span className="text-foreground">{hoveredPlanet.eccentricity}</span>
            </div>
          ) : (
            <div className="text-muted">
              Hover any orbital track to inspect Keplerian parameters and epicyclic periods.
            </div>
          )}
          <span className="text-muted tabular-nums">
            T + {Math.floor(elapsedDays)} Earth Days
          </span>
        </div>
      </div>
    </div>
  );
};
