import type { ParseResponse, Transaction } from '@/lib/types'

import { signedAmount, statementLegs, type Leg } from '../shared'

// OFX 2.2 (XML) bank statement. One file reaches most targets with no column mapping: the
// currency rides in CURDEF, dates have one unambiguous form, and FITID lets importers skip
// rows they already have. Sources and per-app quirks: docs/research/import-targets.md.
//
// Written one element per line with every element closed, because Money Manager Ex converts
// line by line, and as XML because Wallet accepts OFX 2.2 only. Money stays a string: an
// outflow is the DecimalString with a "-" prefix.

const HEADER = [
  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
  '<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>',
]

/** NAME holds 32 characters in the spec; the full narration goes in MEMO. */
const NAME_MAX = 32
const MEMO_MAX = 255

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** "2026-09-03T14:21:09" -> "20260903". Date only: a bare OFX date means midnight, read as GMT. */
function ofxDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

/** FNV-1a, 32 bit, as 8 hex digits. Pure and stable across runs, for FITIDs. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/**
 * The fields that identify a leg. Stable across overlapping statements of the same account; the
 * direction keeps the two legs of a two-sided row apart.
 */
function legKey({ t, inflow }: Leg): string {
  return [t.date, t.debit, t.credit, t.narration, t.reference ?? '', t.balance ?? '', inflow ? 'in' : 'out'].join('|')
}

/**
 * A FITID that is the same every time the same row is exported, so re-imports dedupe.
 * `occurrence` separates genuinely identical rows (same day, amount, narration, no balance).
 */
function fitid(t: Transaction, key: string, occurrence: number): string {
  return `${ofxDate(t.date)}${fnv1a(key)}${occurrence > 0 ? `-${occurrence}` : ''}`
}

export function writeOfx(data: ParseResponse): string {
  // Callers hand over a statement with money moving (parse-client maps one without to
  // empty_statement); without rows and without period dates the date elements would be empty.
  const rows = statementLegs(data.transactions)
  const first = rows[0]?.t
  const last = rows[rows.length - 1]?.t
  const meta = data.metadata
  const currency = first?.currency ?? 'NGN'
  const start = ofxDate(meta?.statement_period_start ?? first?.date ?? '')
  const end = ofxDate(meta?.statement_period_end ?? last?.date ?? '')
  const closing = meta?.closing_balance ?? last?.balance ?? null

  const seen = new Map<string, number>()
  const transactions = rows.flatMap((leg) => {
    const { t } = leg
    const key = legKey(leg)
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)
    return [
      '<STMTTRN>',
      `<TRNTYPE>${leg.inflow ? 'CREDIT' : 'DEBIT'}</TRNTYPE>`,
      `<DTPOSTED>${ofxDate(t.date)}</DTPOSTED>`,
      `<TRNAMT>${signedAmount(leg)}</TRNAMT>`,
      `<FITID>${fitid(t, key, occurrence)}</FITID>`,
      `<NAME>${escapeXml(t.narration.slice(0, NAME_MAX))}</NAME>`,
      `<MEMO>${escapeXml(t.narration.slice(0, MEMO_MAX))}</MEMO>`,
      '</STMTTRN>',
    ]
  })

  const lines = [
    ...HEADER,
    '<OFX>',
    '<SIGNONMSGSRSV1>',
    '<SONRS>',
    '<STATUS>',
    '<CODE>0</CODE>',
    '<SEVERITY>INFO</SEVERITY>',
    '</STATUS>',
    // The statement's own end date, not the time of export, so the file is deterministic.
    `<DTSERVER>${end}</DTSERVER>`,
    '<LANGUAGE>ENG</LANGUAGE>',
    '</SONRS>',
    '</SIGNONMSGSRSV1>',
    '<BANKMSGSRSV1>',
    '<STMTTRNRS>',
    '<TRNUID>1</TRNUID>',
    '<STATUS>',
    '<CODE>0</CODE>',
    '<SEVERITY>INFO</SEVERITY>',
    '</STATUS>',
    '<STMTRS>',
    `<CURDEF>${currency}</CURDEF>`,
    '<BANKACCTFROM>',
    `<BANKID>${escapeXml(meta?.bank ?? 'unknown')}</BANKID>`,
    `<ACCTID>${escapeXml(meta?.account_number_masked ?? 'statement')}</ACCTID>`,
    '<ACCTTYPE>CHECKING</ACCTTYPE>',
    '</BANKACCTFROM>',
    '<BANKTRANLIST>',
    `<DTSTART>${start}</DTSTART>`,
    `<DTEND>${end}</DTEND>`,
    ...transactions,
    '</BANKTRANLIST>',
    // LEDGERBAL is required by the spec. Only the statement's own closing balance goes here;
    // without one the element is left out rather than filled with an invented figure.
    ...(closing === null ? [] : ['<LEDGERBAL>', `<BALAMT>${closing}</BALAMT>`, `<DTASOF>${end}</DTASOF>`, '</LEDGERBAL>']),
    '</STMTRS>',
    '</STMTTRNRS>',
    '</BANKMSGSRSV1>',
    '</OFX>',
  ]
  return lines.join('\n') + '\n'
}
