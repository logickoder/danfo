import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Hero } from '@/components/hero/hero'
import { ExampleFile } from '@/components/sections/example-file'
import { AppHub } from '@/components/sections/hubs'
import { SiteNav } from '@/components/sections/site-nav'
import { Terminus } from '@/components/sections/terminus'
import { appParams, appPath, findApp } from '@/lib/routes'
import { appCrumbs, appDescription, appTitle, heading, pageMetadata } from '@/lib/site'
import { BANK_NAMES, BANKS } from '@/lib/statement'
import type { Target } from '@/writers/target'

// An app's hub: the file it gets, how to import it, what to know, and every bank that feeds it.

interface Props {
  params: Promise<{ app: string }>
}

export const dynamicParams = false

export const generateStaticParams = appParams

async function appFor(params: Props['params']): Promise<Target> {
  const target = findApp((await params).app)
  if (!target) notFound()
  return target
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const target = await appFor(params)
  return pageMetadata(appPath(target), appTitle(target), appDescription(target))
}

export default async function AppPage({ params }: Props) {
  const target = await appFor(params)
  const [firstBank] = BANKS
  return (
    <>
      <SiteNav crumbs={appCrumbs(target)} />
      <main>
        <Hero
          heading={heading(undefined, target)}
          intro={`Drop your ${BANK_NAMES} statement PDF. Get the exact file ${target.name} imports, checked against the statement first.`}
          targetId={target.id}
        />
        <AppHub target={target} />
        {firstBank && <ExampleFile bank={firstBank} target={target} />}
      </main>
      <Terminus />
    </>
  )
}
