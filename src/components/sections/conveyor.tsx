import { Danfo } from '@/components/scene/danfo'

// Illustrative rows for the conveyor. Labelled EXAMPLE on the page: not anyone's statement.
const EXAMPLE_ROWS = [
  { raw: '01-AUG-26 NIP/TRF/ADEBAYO O/AUG RENT  250,000.00           1,402,118.40', date: '2026-08-01', payee: 'NIP/TRF/ADEBAYO O/AUG RENT', out: '250000.00', in: '' },
  { raw: '03-AUG-26 POS PURCHASE SHOPRITE IKEJA 18,450.00            1,383,668.40', date: '2026-08-03', payee: 'POS PURCHASE SHOPRITE IKEJA', out: '18450.00', in: '' },
  { raw: '05-AUG-26 SALARY AUG 2026                         620,000.00 2,003,668.40', date: '2026-08-05', payee: 'SALARY AUG 2026', out: '', in: '620000.00' },
  { raw: '06-AUG-26 USSD CHARGE                 6.98                 2,003,661.42', date: '2026-08-06', payee: 'USSD CHARGE', out: '6.98', in: '' },
] as const

export function Conveyor() {
  return (
    <section aria-labelledby="conv-title" className="bg-ink text-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 md:gap-10 md:py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id="conv-title" className="font-display text-2xl leading-tight md:text-[40px]">
            Rough PDF in. <span className="text-yellow">Clean rows out.</span>
          </h2>
          <p className="max-w-[380px] text-[15px] leading-relaxed text-[#CFCFCF] md:text-base">
            No AI rewriting your money. Every row is a line you can point to on your statement. Same PDF, same file, every time.
          </p>
        </div>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_160px_1fr]">
          <div className="flex -rotate-1 flex-col gap-2 overflow-x-auto rounded-md bg-paper p-4 font-mono text-[9px] leading-relaxed text-ink lg:text-[11px]">
            <span className="text-ink-soft">EXAMPLE · STATEMENT OF ACCOUNT · PAGE 1 OF 6</span>
            {EXAMPLE_ROWS.map((r) => (
              <span key={r.date + r.payee} className="whitespace-pre">
                {r.raw}
              </span>
            ))}
          </div>
          <div className="mx-auto w-[140px]">
            <Danfo load="bundled" className="block w-full" />
          </div>
          <div className="overflow-hidden rounded-[10px] border-[3px] border-yellow bg-card text-ink">
            <div className="flex justify-between bg-yellow px-4 py-3 font-mono text-[13px] font-bold">
              <span>ynab-fbn-2026-08.csv</span>
              <span>EXAMPLE</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[11px] md:text-xs">
                <thead>
                  <tr className="border-b-2 border-ink text-left">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Payee</th>
                    <th className="px-3 py-2 text-right">Outflow</th>
                    <th className="px-3 py-2 text-right">Inflow</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_ROWS.map((r, i) => (
                    <tr key={r.date + r.payee} className={i % 2 ? 'bg-paper' : ''}>
                      <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                      <td className="px-3 py-2">{r.payee}</td>
                      <td className="px-3 py-2 text-right">{r.out}</td>
                      <td className="px-3 py-2 text-right text-success">{r.in}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
