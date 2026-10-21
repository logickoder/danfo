import type { Metadata } from 'next'
import { Bungee, DM_Sans, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { SKY_SCRIPT } from '@/lib/sky'

import './globals.css'

// Bungee is street-signage caps, close to hand-painted danfo lettering. Single weight by
// design. DM Sans carries body copy; JetBrains Mono carries every naira amount (law).
const bungee = Bungee({ weight: '400', subsets: ['latin'], variable: '--font-bungee' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

// Lockup rule (PRD section 2): the name never travels alone.
export const metadata: Metadata = {
  title: 'Danfo: statement to budget app',
  description:
    'Turn a Nigerian bank statement PDF into the exact import file your budgeting app accepts. YNAB, Actual Budget, Goodbudget, Toshl. Free, no account.',
}

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
