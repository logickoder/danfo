import { FEEDBACK_URL } from '@/lib/links'
import { BANKS } from '@/lib/statement'
import { TARGETS } from '@/writers'

const FAQ = [
  { q: 'Is it free?', a: 'Yes. No sign-up, no card.' },
  {
    q: 'Which banks and apps work?',
    a: `Banks: ${BANKS.map((b) => b.name).join(', ')}. Apps: ${TARGETS.map((t) => t.name).join(', ')}.`,
  },
  { q: 'My bank is not listed. What now?', a: 'Tell us which bank. New banks need a real statement layout to read against.' },
  { q: 'My PDF has a password.', a: 'Download it again without one from your bank app, or remove the password first.' },
  {
    q: 'Does it pick categories?',
    a: 'No. Your budget app learns your categories better than we can guess them. A few apps refuse a transaction without one: for those, every row comes in as Uncategorised for you to sort.',
  },
] as const

export function PrivacyAndFaq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto grid max-w-[1200px] items-start gap-8 px-5 pt-6 pb-14 md:grid-cols-[480px_1fr] md:gap-12 md:pb-20">
      <div className="flex flex-col gap-3.5 rounded-xl border-[3px] border-ink bg-yellow p-6 shadow-hard-6 md:p-9 md:shadow-hard-8">
        <h2 className="font-display text-[22px] leading-tight md:text-[32px]">No account. Nothing stored.</h2>
        <p className="text-[15px] leading-relaxed md:text-[17px]">
          Your statement is read in memory and dropped. The file for your app is built in your own browser. We count
          conversions per app, never what was in them.
        </p>
      </div>
      <div className="flex flex-col">
        <h2 id="faq-title" className="mb-3 font-display text-xl md:text-2xl">
          Questions
        </h2>
        {FAQ.map((item, i) => (
          <details key={item.q} open={i === 0} className={`border-t-2 border-ink py-4 ${i === FAQ.length - 1 ? 'border-b-2' : ''}`}>
            <summary className="cursor-pointer text-base font-semibold md:text-lg">{item.q}</summary>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft md:text-base">{item.a}</p>
          </details>
        ))}
        <a href={FEEDBACK_URL} className="mt-4 text-sm font-semibold">
          Ask something else
        </a>
      </div>
    </section>
  )
}
