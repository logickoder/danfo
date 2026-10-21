const WHY = [
  {
    title: 'Bank sync stops at the border',
    body: 'YNAB, Actual Budget and Goodbudget sync banks in the US, UK and Europe. None of them reach a Nigerian bank.',
  },
  {
    title: 'Your PDF has everything',
    body: 'Full history, every row, free to download from your bank app. No link to break when your bank asks for a new OTP.',
  },
  {
    title: 'Nothing to link, nothing to leak',
    body: 'No login, no account, no saved data. Close the tab and it is gone.',
  },
] as const

export function WhyNotLink() {
  return (
    <section aria-labelledby="why-title" className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-10 md:py-16">
      <h2 id="why-title" className="font-display text-2xl leading-tight md:text-[40px]">
        Why not just link your bank?
      </h2>
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {WHY.map((w) => (
          <div key={w.title} className="flex flex-col gap-2.5 rounded-[10px] border-2 border-ink bg-card p-5 md:p-7">
            <h3 className="font-display text-base leading-snug md:text-xl">{w.title}</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft md:text-base">{w.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
