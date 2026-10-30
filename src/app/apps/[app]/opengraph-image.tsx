import { shareImage, SHARE_SIZE } from '@/components/share-image'
import { appParams, findApp } from '@/lib/routes'
import { heading, SITE_TITLE } from '@/lib/site'

export const alt = SITE_TITLE
export const size = SHARE_SIZE
export const contentType = 'image/png'
export const dynamicParams = false

export const generateStaticParams = appParams

export default async function AppOpengraphImage({ params }: { params: Promise<{ app: string }> }) {
  const target = findApp((await params).app)
  if (!target) throw new Error('[og] unknown app')
  return shareImage({
    ...heading(undefined, target),
    sub: `Nigerian bank statement PDF to the exact file ${target.name} imports. Free. Nothing stored.`,
  })
}
