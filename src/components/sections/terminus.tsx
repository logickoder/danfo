import { Danfo } from '@/components/scene/danfo'
import { RoadStrip } from '@/components/scene/street'
import { AUTHOR_URL, BANKSTRACT_URL, COMMIT_DIRTY, COMMIT_SHA, COMMIT_URL, REPO_URL } from '@/lib/links'

export function Terminus() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pt-14 md:pt-16">
        <span className="font-mono text-xs font-bold tracking-wider text-yellow">TERMINUS</span>
        <h2 className="font-display text-[30px] leading-tight md:text-[52px]">
          Last stop: <span className="text-yellow">your budget.</span>
        </h2>
        <a
          href="#convert"
          className="inline-flex min-h-14 items-center self-start rounded-lg border-[3px] border-paper bg-yellow px-6 font-display text-sm text-ink no-underline shadow-hard-paper-5 md:text-base"
        >
          Oya, drop your statement
        </a>
      </div>
      <div className="relative mt-10 h-[150px]">
        <RoadStrip id="terminus" className="absolute inset-x-0 bottom-0 h-[72px] w-full" />
        <div className="absolute right-[8%] bottom-[22px] w-[200px] md:w-[260px]">
          <Danfo load="bundled" className="block w-full" />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <span className="font-display text-sm md:text-base">Danfo: statement to budget app</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={REPO_URL} className="text-paper">GitHub</a>
            <a href={BANKSTRACT_URL} className="text-paper">Built on bankstract</a>
            <span className="text-[#BDBDBD]">MIT licence</span>
            <a href={AUTHOR_URL} className="text-paper">by Jeffery Orazulike</a>
            {COMMIT_SHA && (
              <a href={COMMIT_URL} className="text-paper">
                Running <span className="font-mono">{COMMIT_SHA.slice(0, 7)}</span>
                {COMMIT_DIRTY && ' plus local changes'}
              </a>
            )}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[#9E9E9E]">
          This site is protected by Cloudflare Turnstile and its{' '}
          <a href="https://www.cloudflare.com/privacypolicy/" className="text-paper">Privacy Policy</a> and{' '}
          <a href="https://www.cloudflare.com/website-terms/" className="text-paper">Terms of Service</a> apply.
        </p>
      </div>
    </footer>
  )
}
