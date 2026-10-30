import { ImageResponse } from 'next/og'

import { THEME_COLOR, type Heading } from '@/lib/site'

// The share preview drawn once per page at build (link unfurls, search): the hero's street with
// sky, the yellow plate and the bus at the kerb (DESIGN.md). Each opengraph-image.tsx passes its
// own words; everything else is shared so every page's preview matches.

export const SHARE_SIZE = { width: 1200, height: 630 }

const INK = '#111111'
const SKY = '#F6E9C9'
const YELLOW = THEME_COLOR

// The danfo from scene/danfo.tsx, flattened to fixed fills: the image renderer has no CSS classes.
const BUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 10 390 172">
<g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
<polygon points="20,40 50,20 360,20 330,40" fill="#FFD54A"/>
<rect x="20" y="40" width="310" height="112" rx="10" fill="${YELLOW}"/>
<polygon points="330,40 360,20 372,30 372,138 330,152" fill="#D9A404"/>
<rect x="34" y="52" width="44" height="36" rx="4" fill="#263238"/>
<rect x="86" y="52" width="44" height="36" rx="4" fill="#263238"/>
<rect x="138" y="52" width="44" height="36" rx="4" fill="#263238"/>
<rect x="190" y="52" width="44" height="36" rx="4" fill="#263238"/>
<rect x="248" y="50" width="54" height="94" rx="3" fill="#1A1A1A"/>
<polygon points="336,42 366,26 368,74 336,88" fill="#263238"/>
</g>
<rect x="20" y="104" width="310" height="9" fill="${INK}"/>
<rect x="20" y="120" width="310" height="5" fill="${INK}"/>
<circle cx="275" cy="72" r="13" fill="#5A3A22" stroke="${INK}" stroke-width="2"/>
<rect x="262" y="84" width="26" height="40" rx="6" fill="#2F7D4F" stroke="${INK}" stroke-width="2"/>
<circle cx="356" cy="116" r="7" fill="#FFF4C2" stroke="${INK}" stroke-width="2"/>
<rect x="328" y="140" width="46" height="10" rx="3" fill="${INK}"/>
<rect x="12" y="140" width="24" height="10" rx="3" fill="${INK}"/>
<circle cx="82" cy="152" r="26" fill="${INK}"/><circle cx="82" cy="152" r="10" fill="#9E9E9E"/>
<circle cx="276" cy="152" r="26" fill="${INK}"/><circle cx="276" cy="152" r="10" fill="#9E9E9E"/>
</svg>`

const KERB_BLOCKS = 15

// The image renderer needs raw font files (TTF, not the woff2 next/font serves). Fetched at
// build from Fontsource, pinned to an exact version so the image is the same on every build.
const FONTS = {
  bungee: 'https://cdn.jsdelivr.net/fontsource/fonts/bungee@5.2.5/latin-400-normal.ttf',
  dmSans: 'https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@5.2.5/latin-500-normal.ttf',
} as const

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`[og] font fetch failed: ${res.status} ${url}`)
  return res.arrayBuffer()
}

// One download per build worker, however many pages it renders a preview for. A failed fetch is
// dropped so the next page tries again.
let fontsOnce: Promise<[ArrayBuffer, ArrayBuffer]> | null = null

function shareFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  fontsOnce ??= Promise.all([fetchFont(FONTS.bungee), fetchFont(FONTS.dmSans)]).catch((error: unknown) => {
    fontsOnce = null
    throw error
  })
  return fontsOnce
}

// Bungee runs wide (about 0.78em a character). The headline shrinks until both lines fit the text
// column (the image less its 72px side margins); the home headline stays at full size. The plate
// gives up its padding, border and shadow (44 + 8 + 8px) on top.
const HEADLINE_MAX = 84
const COLUMN_WIDTH = SHARE_SIZE.width - 2 * 72
const PLATE_CHROME = 60
const BUNGEE_EM = 0.78

function headlineSize(line: string, plate: string): number {
  const fit = (text: string, width: number) => Math.floor(width / (text.length * BUNGEE_EM))
  return Math.min(HEADLINE_MAX, fit(line, COLUMN_WIDTH), fit(plate, COLUMN_WIDTH - PLATE_CHROME))
}

interface ShareImageText extends Heading {
  /** One sentence under the headline. */
  sub: string
}

export async function shareImage({ line, plate, sub }: ShareImageText): Promise<ImageResponse> {
  const [bungee, dmSans] = await shareFonts()
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: SKY, color: INK, fontFamily: 'DM Sans' }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '56px 72px 0', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontFamily: 'Bungee', fontSize: 40 }}>Danfo</span>
          <span style={{ fontSize: 28, color: '#4A4A4A' }}>statement to budget app</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, fontFamily: 'Bungee', fontSize: headlineSize(line, plate), lineHeight: 1.1 }}>
          <span>{line}</span>
          <span
            style={{
              alignSelf: 'flex-start',
              marginTop: 14,
              padding: '4px 22px 14px',
              background: YELLOW,
              border: `4px solid ${INK}`,
              borderRadius: 12,
              boxShadow: `8px 8px 0 0 ${INK}`,
            }}
          >
            {plate}
          </span>
        </div>
        <span style={{ marginTop: 34, fontSize: 28, lineHeight: 1.35, maxWidth: 640 }}>
          {sub}
        </span>
      </div>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(BUS)}`}
        width={420}
        height={185}
        alt=""
        style={{ position: 'absolute', right: 64, bottom: 58 }}
      />
      <div style={{ display: 'flex', height: 14 }}>
        {Array.from({ length: KERB_BLOCKS }, (_, i) => (
          <div key={i} style={{ flex: 1, background: i % 2 ? INK : YELLOW }} />
        ))}
      </div>
      <div style={{ display: 'flex', height: 58, background: '#2E2E2E' }} />
    </div>,
    {
      ...SHARE_SIZE,
      fonts: [
        { name: 'Bungee', data: bungee, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: dmSans, weight: 500, style: 'normal' },
      ],
    },
  )
}
