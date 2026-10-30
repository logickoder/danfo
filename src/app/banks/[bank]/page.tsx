import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Hero } from '@/components/hero/hero'
import { BankHub } from '@/components/sections/hubs'
import { SiteNav } from '@/components/sections/site-nav'
import { Terminus } from '@/components/sections/terminus'
import { bankParams, bankPath, findBank } from '@/lib/routes'
import { bankCrumbs, bankDescription, bankTitle, heading, pageMetadata } from '@/lib/site'
import type { Bank } from '@/lib/statement'

// A bank's hub: what its statements carry, what gets checked, and every app they can go to.

interface Props {
  params: Promise<{ bank: string }>
}

export const dynamicParams = false

export const generateStaticParams = bankParams

async function bankFor(params: Props['params']): Promise<Bank> {
  const bank = findBank((await params).bank)
  if (!bank) notFound()
  return bank
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bank = await bankFor(params)
  return pageMetadata(bankPath(bank), bankTitle(bank), bankDescription(bank))
}

export default async function BankPage({ params }: Props) {
  const bank = await bankFor(params)
  return (
    <>
      <SiteNav crumbs={bankCrumbs(bank)} />
      <main>
        <Hero
          heading={heading(bank)}
          intro={`Drop your ${bank.name} statement PDF. Get the exact file your budgeting app imports, checked against the statement first.`}
        />
        <BankHub bank={bank} />
      </main>
      <Terminus />
    </>
  )
}
