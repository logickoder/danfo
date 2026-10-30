import type { Metadata, Viewport } from 'next'
import { Bungee, DM_Sans, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { AUTHOR_URL, SITE_URL } from '@/lib/links'
import { OPEN_GRAPH_BASE, SITE_DESCRIPTION, SITE_TITLE, THEME_COLOR, TWITTER_BASE, withLockup } from '@/lib/site'
import { SKY_SCRIPT } from '@/lib/sky'

import './globals.css'

// Bungee is street-signage caps, close to hand-painted danfo lettering. Single weight by
// design. DM Sans carries body copy; JetBrains Mono carries every naira amount (law).
const bungee = Bungee({ weight: '400', subsets: ['latin'], variable: '--font-bungee' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

// Lockup rule (docs/rules/voice.md): the name never travels alone. The icons and the share
// image come from the file conventions beside this layout (icon.svg, apple-icon.png,
// opengraph-image.tsx); Next links them here. Canonical and og:url are per page (pageMetadata,
// and the home page's own metadata): set here, every page without its own would claim the home URL.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Route pages set their own title; the template keeps the lockup on every one.
  title: { default: SITE_TITLE, template: withLockup('%s') },
  description: SITE_DESCRIPTION,
  applicationName: 'Danfo',
  authors: [{ name: 'Jeffery Orazulike', url: AUTHOR_URL }],
  openGraph: { ...OPEN_GRAPH_BASE, title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { ...TWITTER_BASE, title: SITE_TITLE, description: SITE_DESCRIPTION },
}

export const viewport: Viewport = { themeColor: THEME_COLOR }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bungee.variable} ${dmSans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Sets the Lagos time-of-day scene before first paint, so night visitors never see a day flash. */}
        <script dangerouslySetInnerHTML={{ __html: SKY_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
