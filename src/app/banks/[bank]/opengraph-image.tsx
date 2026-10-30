import { shareImage, SHARE_SIZE } from '@/components/share-image'
import { bankParams, findBank } from '@/lib/routes'
import { heading, SITE_TITLE } from '@/lib/site'

export const alt = SITE_TITLE
export const size = SHARE_SIZE
export const contentType = 'image/png'
export const dynamicParams = false

export const generateStaticParams = bankParams

export default async function BankOpengraphImage({ params }: { params: Promise<{ bank: string }> }) {
  const bank = findBank((await params).bank)
  if (!bank) throw new Error('[og] unknown bank')
  return shareImage({
    ...heading(bank),
    sub: `${bank.name} statement PDF to the exact file your budget app imports. Free. Nothing stored.`,
  })
}
