import { Hero } from '@/components/hero/hero'
import { Conveyor } from '@/components/sections/conveyor'
import { PrivacyAndFaq } from '@/components/sections/privacy-faq'
import { RouteStops } from '@/components/sections/route-stops'
import { SiteNav } from '@/components/sections/site-nav'
import { Terminus } from '@/components/sections/terminus'
import { WhyNotLink } from '@/components/sections/why-not-link'

// The single page (DESIGN.md, Page structure). Client islands: the hero (the converter and the
// bus whose load shows the user where they are) and the destination boards that flip names.

export default function Home() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  return (
    <>
      <SiteNav />
      <main>
        <Hero turnstileSiteKey={turnstileSiteKey} />
        <RouteStops />
        <Conveyor />
        <WhyNotLink />
        <PrivacyAndFaq />
      </main>
      <Terminus />
    </>
  )
}
