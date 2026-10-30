import type { Metadata } from 'next'

import { Hero } from '@/components/hero/hero'
import { Conveyor } from '@/components/sections/conveyor'
import { PrivacyAndFaq } from '@/components/sections/privacy-faq'
import { RouteIndex } from '@/components/sections/route-index'
import { RouteStops } from '@/components/sections/route-stops'
import { SiteNav } from '@/components/sections/site-nav'
import { Terminus } from '@/components/sections/terminus'
import { WhyNotLink } from '@/components/sections/why-not-link'
import { OPEN_GRAPH_BASE, SITE_DESCRIPTION, SITE_TITLE, structuredDataScript } from '@/lib/site'

// The single page (DESIGN.md, Page structure). Client islands: the hero (the converter and the
// bus whose load shows the user where they are) and the destination boards that flip names.

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...OPEN_GRAPH_BASE, url: '/', title: SITE_TITLE, description: SITE_DESCRIPTION },
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <RouteStops />
        <Conveyor />
        <WhyNotLink />
        <PrivacyAndFaq />
        <RouteIndex />
      </main>
      <Terminus />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript() }} />
    </>
  )
}
