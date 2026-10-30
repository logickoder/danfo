import { shareImage, SHARE_SIZE } from '@/components/share-image'
import { heading, SITE_TITLE } from '@/lib/site'
import { FEATURED_NAMES } from '@/lib/targets'

export const alt = `${SITE_TITLE}. Statement in, budget out.`
export const size = SHARE_SIZE
export const contentType = 'image/png'

export default function OpengraphImage() {
  return shareImage({
    ...heading(),
    sub: `Nigerian bank statement PDF to ${FEATURED_NAMES}. Free. Nothing stored.`,
  })
}
