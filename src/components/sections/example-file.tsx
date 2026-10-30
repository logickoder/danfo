import { exampleStatement } from '@/lib/example-statement'
import { withArticle, type Bank } from '@/lib/statement'
import { downloadName, type Target } from '@/writers/target'

// The exact file this app gets from this bank, made from a made-up statement in the bank's
// shape and run through the same writer the converter uses. What makes each route page its
// own: the format, the columns, whether times and balances come through, all real output.

/**
 * The part worth reading. A CSV is short, so all of it. An OFX file wraps its transactions in a
 * header and account block that is the same for every app, so only the transaction list shows.
 */
function excerpt(file: string, extension: Target['fileExtension']): { text: string; partial: boolean } {
  if (extension !== 'ofx') return { text: file, partial: false }
  const start = file.indexOf('<BANKTRANLIST>')
  const end = file.indexOf('</BANKTRANLIST>')
  if (start < 0 || end < 0) return { text: file, partial: false }
  return { text: file.slice(start, end + '</BANKTRANLIST>'.length), partial: true }
}

export function ExampleFile({ bank, target }: { bank: Bank; target: Target }) {
  const example = exampleStatement(bank)
  const { text, partial } = excerpt(target.write(example), target.fileExtension)

  return (
    <section aria-labelledby="example-title" className="bg-ink text-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-12 md:py-16">
        <div className="flex flex-col gap-3">
          <h2 id="example-title" className="font-display text-2xl leading-tight md:text-[34px]">
            What <span className="text-yellow">{target.name}</span> gets
          </h2>
          <p className="max-w-[640px] text-[15px] leading-relaxed text-[#CFCFCF] md:text-base">
            Made-up rows in the shape of {withArticle(bank.name)} statement, through the same code your file goes through. Your
            file has your rows; everything else is exactly this.
            {partial && ' Shown: the transaction list. The full file wraps it in the standard OFX header and account block.'}
          </p>
        </div>
        <div className="overflow-hidden rounded-[10px] border-[3px] border-yellow bg-card text-ink">
          <div className="flex justify-between gap-4 bg-yellow px-4 py-3 font-mono text-[13px] font-bold">
            <span className="truncate">{downloadName(target, example)}</span>
            <span>{partial ? 'EXAMPLE · EXCERPT' : 'EXAMPLE'}</span>
          </div>
          <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-relaxed md:text-[13px]">{text}</pre>
        </div>
      </div>
    </section>
  )
}
