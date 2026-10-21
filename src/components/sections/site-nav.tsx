import { REPO_URL } from '@/lib/links'

export function SiteNav() {
  return (
    <header className="sky-scene">
      <nav aria-label="Primary" className="mx-auto flex max-w-[1200px] items-center justify-between px-5 pt-5 lg:pt-8">
        <a href="#" className="sky-text flex items-baseline gap-2.5 no-underline">
          <span className="font-display text-xl lg:text-2xl">Danfo</span>
          <span className="sky-text-soft hidden text-sm sm:inline">statement to budget app</span>
        </a>
        <div className="hidden items-center gap-6 text-[15px] font-medium md:flex">
          <a href="#how" className="sky-text no-underline">How it works</a>
          <a href="#faq" className="sky-text no-underline">FAQ</a>
          <a href={REPO_URL} className="inline-flex min-h-11 items-center rounded-lg border-2 border-ink bg-paper px-4 text-ink no-underline">
            GitHub
          </a>
        </div>
        <details className="relative md:hidden">
          <summary aria-label="Open menu" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border-2 border-ink bg-paper">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 z-20 mt-2 flex w-48 flex-col rounded-lg border-2 border-ink bg-card p-2 text-ink shadow-hard-4">
            <a href="#how" className="rounded px-3 py-2.5 no-underline">How it works</a>
            <a href="#faq" className="rounded px-3 py-2.5 no-underline">FAQ</a>
            <a href={REPO_URL} className="rounded px-3 py-2.5 no-underline">GitHub</a>
          </div>
        </details>
      </nav>
    </header>
  )
}
