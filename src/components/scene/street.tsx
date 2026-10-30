// The Lagos street (DESIGN.md, Illustration): two-tone buildings on a sky band, asphalt, the
// yellow and ink kerb blocks, paper lane dashes. Stripes are SVG patterns of solid blocks,
// never gradients. Decorative only.

interface Building {
  x: number
  w: number
  h: number
  tone: 'light' | 'dark'
}

const BUILDINGS: readonly Building[] = [
  { x: 40, w: 120, h: 100, tone: 'light' },
  { x: 190, w: 90, h: 125, tone: 'dark' },
  { x: 310, w: 140, h: 85, tone: 'light' },
  { x: 480, w: 100, h: 115, tone: 'dark' },
  { x: 760, w: 130, h: 80, tone: 'light' },
  { x: 940, w: 110, h: 118, tone: 'dark' },
  { x: 1080, w: 90, h: 95, tone: 'light' },
  { x: 1300, w: 120, h: 110, tone: 'dark' },
]

// Fills come from CSS classes (globals.css) so the night scene can recolor them.
const FACE = { light: 'bld-face-light', dark: 'bld-face-dark' } as const
const SIDE = { light: 'bld-side-light', dark: 'bld-side-dark' } as const
const GROUND = 140
const STREET_HEIGHT = 300
/** The skyline's own width; it repeats past it on wider screens. */
const SKYLINE_WIDTH = 1440
const LAMPS = [300, 740, 1220] as const

/** Kerb and lane-dash patterns, defined once per SVG. `id` keeps several SVGs apart. */
function RoadPatterns({ id, vertical = false }: { id: string; vertical?: boolean }) {
  return (
    <defs>
      {vertical ? (
        <pattern id={`${id}-kerb`} width="12" height="60" patternUnits="userSpaceOnUse">
          <rect width="12" height="60" fill="#F2B705" />
          <rect width="12" height="30" fill="#111111" />
        </pattern>
      ) : (
        <pattern id={`${id}-kerb`} width="80" height="16" patternUnits="userSpaceOnUse">
          <rect width="80" height="16" fill="#F2B705" />
          <rect x="40" width="40" height="16" fill="#111111" />
        </pattern>
      )}
      {vertical ? (
        <pattern id={`${id}-dash`} width="60" height="100" patternUnits="userSpaceOnUse">
          <rect x="28" y="20" width="4" height="40" fill="#FAF7F0" opacity="0.8" />
        </pattern>
      ) : (
        <pattern id={`${id}-dash`} width="120" height="6" patternUnits="userSpaceOnUse">
          <rect x="20" width="64" height="6" fill="#FAF7F0" opacity="0.8" />
        </pattern>
      )}
    </defs>
  )
}

/** One 1440px-wide stretch of buildings and street lamps, in pixels. */
function Skyline() {
  return (
    <>
      <g stroke="#111111" strokeWidth="2" strokeLinejoin="round">
        {BUILDINGS.map(({ x, w, h, tone }) => {
          const top = GROUND - h
          return (
            <g key={x}>
              <polygon points={`${x},${top} ${x + 22},${top - 12} ${x + w + 22},${top - 12} ${x + w},${top}`} className="bld-roof" />
              <rect x={x} y={top} width={w} height={h} className={FACE[tone]} />
              <polygon points={`${x + w},${top} ${x + w + 22},${top - 12} ${x + w + 22},${GROUND} ${x + w},${GROUND}`} className={SIDE[tone]} />
            </g>
          )
        })}
      </g>
      <g className="bld-windows">
        {BUILDINGS.flatMap(({ x, w, h }) => {
          const top = GROUND - h
          const cols = Math.max(2, Math.floor((w - 20) / 34))
          const rows = Math.max(2, Math.floor((h - 30) / 32))
          return Array.from({ length: rows * cols }, (_, i) => (
            <rect
              key={`${x}-${i}`}
              x={x + 16 + (i % cols) * 34}
              y={top + 18 + Math.floor(i / cols) * 32}
              width="18"
              height="14"
            />
          ))
        })}
      </g>
      <g className="sky-night-only">
        {LAMPS.map((x) => (
          <g key={x}>
            <polygon points={`${x - 6},${GROUND - 80} ${x + 6},${GROUND - 80} ${x + 60},${GROUND} ${x - 60},${GROUND}`} fill="#FFD54A" opacity="0.14" />
            <rect x={x - 3} y={GROUND - 80} width="6" height="80" fill="#111111" />
            <rect x={x - 12} y={GROUND - 86} width="24" height="8" rx="3" fill="#111111" />
            <circle cx={x} cy={GROUND - 76} r="5" fill="#FFF4C2" />
          </g>
        ))}
      </g>
    </>
  )
}

// Copies of the skyline either side of centre: covers screens up to about 4300px wide.
const SKYLINE_OFFSETS = [-SKYLINE_WIDTH, 0, SKYLINE_WIDTH] as const

/**
 * Skyline plus road, 300px tall, any width. Drawn at real pixel size, never scaled: wider
 * screens show more street, not a zoomed one, so no rooftop is ever cropped. The skyline is
 * centred and repeats; the road and kerb run the full width.
 */
export function Street({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <RoadPatterns id="street" />
      <rect className="sky-night-only" x="0" y={GROUND - 100} width="100%" height="100" fill="#3A2A1A" />
      <svg x="50%" overflow="visible">
        <g transform={`translate(${-SKYLINE_WIDTH / 2} 0)`}>
          {SKYLINE_OFFSETS.map((offset) => (
            <g key={offset} transform={`translate(${offset} 0)`}>
              <Skyline />
            </g>
          ))}
        </g>
      </svg>
      <rect x="0" y={GROUND} width="100%" height={STREET_HEIGHT - GROUND} fill="#2E2E2E" />
      <rect x="0" y={GROUND} width="100%" height="16" fill="url(#street-kerb)" />
      <rect x="0" y={GROUND - 2} width="100%" height="2" fill="#111111" />
      <rect x="0" y="250" width="100%" height="6" fill="url(#street-dash)" />
    </svg>
  )
}

/** A plain horizontal stretch of road with kerb on top, for section scenes. */
export function RoadStrip({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <RoadPatterns id={id} />
      <rect x="0" y="12" width="1440" height="108" fill="#2E2E2E" />
      <rect x="0" y="0" width="1440" height="12" fill={`url(#${id}-kerb)`} />
      <rect x="0" y="62" width="1440" height="6" fill={`url(#${id}-dash)`} />
    </svg>
  )
}

/** The same road running down the left edge, kerb on its right. Used on narrow screens. */
export function VerticalRoad({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <RoadPatterns id={id} vertical />
      <rect x="0" y="0" width="60" height="100%" fill="#2E2E2E" />
      <rect x="0" y="0" width="60" height="100%" fill={`url(#${id}-dash)`} />
      <rect x="60" y="0" width="12" height="100%" fill={`url(#${id}-kerb)`} />
    </svg>
  )
}
