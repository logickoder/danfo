import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/links'
import { appPath, bankPath, routePath, ROUTES } from '@/lib/routes'
import { BANKS } from '@/lib/statement'
import { TARGETS } from '@/writers'

// The home page, the bank and app hubs, and every (bank, app) route page (PRD.md, Distribution).
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' as const, priority })
  return [
    page('', 1),
    ...BANKS.map((b) => page(bankPath(b), 0.8)),
    ...TARGETS.map((t) => page(appPath(t), 0.8)),
    ...ROUTES.map((r) => page(routePath(r), 0.6)),
  ]
}
