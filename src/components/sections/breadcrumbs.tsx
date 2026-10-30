import Link from 'next/link'

import { breadcrumbScript, type Crumb } from '@/lib/site'

// Where this page sits, as a pill in the nav next to the logo (the logo is the first crumb, so
// the pill starts after it). Phones show only the parent, a link up one level; the current page
// is the headline right below. Same list feeds the BreadcrumbList JSON-LD for search.

export function CrumbPill({ crumbs }: { crumbs: readonly Crumb[] }) {
  const trail = crumbs.slice(1)
  // With no parent past the logo, there is nothing to show on a phone.
  const display = trail.length > 1 ? 'flex' : 'hidden sm:flex'
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className={`${display} min-w-0 items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 font-mono text-[11px] font-medium text-ink sm:text-[13px]`}>
        {trail.map((c, i) => (
          <li key={c.path} className={`${i === trail.length - 1 && i > 0 ? 'hidden sm:flex' : 'flex'} min-w-0 items-center gap-1.5`}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === trail.length - 1 ? (
              <span aria-current="page" className="truncate font-bold">
                {c.name}
              </span>
            ) : (
              <Link href={c.path} className="truncate text-ink no-underline hover:underline">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbScript(crumbs) }} />
    </nav>
  )
}
