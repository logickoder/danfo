import type { MetadataRoute } from 'next'

import { PAPER_COLOR, SITE_DESCRIPTION, SITE_TITLE, THEME_COLOR } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: 'Danfo',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'browser',
    background_color: PAPER_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  }
}
