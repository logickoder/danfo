import { shareImage, SHARE_SIZE } from '@/components/share-image'
import { findRoute, routeParams } from '@/lib/routes'
import { heading, SITE_TITLE } from '@/lib/site'

export const alt = SITE_TITLE
export const size = SHARE_SIZE
export const contentType = 'image/png'
export const dynamicParams = false

export const generateStaticParams = routeParams

export default async function RouteOpengraphImage({ params }: { params: Promise<{ route: string }> }) {
  const route = findRoute((await params).route)
  if (!route) throw new Error('[og] unknown route')
  return shareImage({
    ...heading(route.bank, route.target),
    sub: `${route.bank.name} statement PDF to the exact file ${route.target.name} imports. Free. Nothing stored.`,
  })
}
