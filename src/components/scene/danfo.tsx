import type { BusLoad } from '@/lib/route-state'

// The danfo, drawn 2.5D (DESIGN.md, Illustration): lit side, shaded front, lighter roof, ink
// outlines. Authored facing right. Its load is the state signal: messy notes in, clean bundles
// out. Animation classes live in globals.css and switch off under reduced motion.

const NOTE_TINTS = ['#A8D5A2', '#E9C38E', '#B9C7E8'] as const

function Note({ x, y, tint, rotate = 0, className }: { x: number; y: number; tint: string; rotate?: number; className?: string }) {
  return (
    <g className={className} transform={rotate ? `rotate(${rotate} ${x + 17} ${y + 9})` : undefined}>
      <rect x={x} y={y} width="34" height="18" rx="2" fill={tint} stroke="#111111" strokeWidth="2" />
      <text x={x + 17} y={y + 13} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#111111">
        ₦
      </text>
    </g>
  )
}

function Bundle({ x, y, tint, w = 38, h = 20 }: { x: number; y: number; tint: string; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={tint} stroke="#111111" strokeWidth="2" />
      <rect x={x + w / 2 - 4} y={y - 1} width="8" height={h + 2} fill="#8B5E34" stroke="#111111" strokeWidth="1.5" />
    </g>
  )
}

function Load({ load }: { load: BusLoad }) {
  switch (load) {
    case 'waiting':
      return (
        <>
          <Note x={96} y={44} tint={NOTE_TINTS[0]} rotate={-18} />
          <Note x={196} y={54} tint={NOTE_TINTS[1]} className="dn-note" />
        </>
      )
    case 'stuffed':
      return (
        <>
          <Note x={32} y={44} tint={NOTE_TINTS[0]} rotate={-24} />
          <Note x={90} y={56} tint={NOTE_TINTS[2]} rotate={14} />
          <Note x={142} y={42} tint={NOTE_TINTS[1]} rotate={-30} />
          <Note x={194} y={54} tint={NOTE_TINTS[0]} rotate={20} />
          <Note x={70} y={30} tint={NOTE_TINTS[2]} className="dn-note" />
          <Note x={150} y={26} tint={NOTE_TINTS[0]} className="dn-note dn-delay-1" />
          <Note x={220} y={30} tint={NOTE_TINTS[1]} className="dn-note dn-delay-2" />
        </>
      )
    case 'sorting':
      return (
        <>
          <Bundle x={37} y={64} tint={NOTE_TINTS[0]} />
          <Bundle x={89} y={64} tint={NOTE_TINTS[2]} />
          <Bundle x={141} y={64} tint={NOTE_TINTS[1]} />
          <Note x={196} y={58} tint={NOTE_TINTS[1]} className="dn-note" />
        </>
      )
    case 'bundled':
      return (
        <>
          <rect x="44" y="12" width="290" height="6" fill="#111111" />
          <Bundle x={56} y={-14} w={52} h={26} tint={NOTE_TINTS[0]} />
          <Bundle x={116} y={-14} w={52} h={26} tint={NOTE_TINTS[2]} />
          <Bundle x={176} y={-14} w={52} h={26} tint={NOTE_TINTS[1]} />
          <Bundle x={236} y={-14} w={52} h={26} tint={NOTE_TINTS[0]} />
          <Bundle x={116} y={-40} w={52} h={26} tint={NOTE_TINTS[1]} />
          <Bundle x={176} y={-40} w={52} h={26} tint={NOTE_TINTS[0]} />
        </>
      )
    case 'stalled':
      return (
        <>
          <g className="dn-blink">
            <circle cx="356" cy="116" r="9" fill="#FF9F1C" stroke="#111111" strokeWidth="2" />
            <circle cx="28" cy="94" r="9" fill="#FF9F1C" stroke="#111111" strokeWidth="2" />
          </g>
          <Note x={40} y={50} tint={NOTE_TINTS[0]} className="dn-back" />
          <Note x={96} y={54} tint={NOTE_TINTS[1]} className="dn-back dn-delay-1" />
        </>
      )
  }
}

export interface DanfoProps {
  load: BusLoad
  className?: string
}

export function Danfo({ load, className }: DanfoProps) {
  const bounce = load === 'stuffed' ? 'dn-heavy' : load === 'stalled' ? undefined : 'dn-bounce'
  return (
    <svg viewBox="-24 -56 410 240" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="195" cy="180" rx="172" ry="9" fill="#000000" opacity="0.35" />
      <g className={bounce}>
        <g stroke="#111111" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="20,40 50,20 360,20 330,40" fill="#FFD54A" />
          <rect x="20" y="40" width="310" height="112" rx="10" fill="#F2B705" />
          <polygon points="330,40 360,20 372,30 372,138 330,152" fill="#D9A404" />
          <rect x="34" y="52" width="44" height="36" rx="4" className="bus-window" />
          <rect x="86" y="52" width="44" height="36" rx="4" className="bus-window" />
          <rect x="138" y="52" width="44" height="36" rx="4" className="bus-window" />
          <rect x="190" y="52" width="44" height="36" rx="4" className="bus-window" />
          <rect x="248" y="50" width="54" height="94" rx="3" fill="#1A1A1A" />
          <polygon points="336,42 366,26 368,74 336,88" className="bus-window" />
        </g>
        <g className="bus-glint">
          <polygon points="40,84 62,56 72,56 50,84" />
          <polygon points="92,84 114,56 124,56 102,84" />
          <polygon points="144,84 166,56 176,56 154,84" />
          <polygon points="196,84 218,56 228,56 206,84" />
        </g>
        <rect x="20" y="104" width="310" height="9" fill="#111111" />
        <rect x="20" y="120" width="310" height="5" fill="#111111" />
        <circle cx="275" cy="72" r="13" fill="#5A3A22" stroke="#111111" strokeWidth="2" />
        <rect x="262" y="84" width="26" height="40" rx="6" fill="#2F7D4F" stroke="#111111" strokeWidth="2" />
        {load === 'waiting' && <path d="M288 92 L304 44" stroke="#5A3A22" strokeWidth="7" strokeLinecap="round" />}
        {load !== 'stalled' && (
          <>
            {/* Headlight beam, drawn only in the night scene. */}
            <polygon className="sky-night-only" points="362,110 640,84 640,176 362,124" fill="#FFF4C2" opacity="0.28" />
            <circle cx="356" cy="116" r="7" fill="#FFF4C2" stroke="#111111" strokeWidth="2" />
          </>
        )}
        <rect x="328" y="140" width="46" height="10" rx="3" fill="#111111" />
        <rect x="12" y="140" width="24" height="10" rx="3" fill="#111111" />
        <Load load={load} />
      </g>
      {[82, 276].map((cx) => (
        <g key={cx} className="dn-wheel">
          <circle cx={cx} cy="152" r="26" fill="#111111" />
          <circle cx={cx} cy="152" r="10" fill="#9E9E9E" />
          <rect x={cx - 2} y="130" width="4" height="12" fill="#9E9E9E" />
        </g>
      ))}
    </svg>
  )
}
