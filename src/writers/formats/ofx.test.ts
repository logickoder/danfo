import { describe, expect, it } from 'vitest'

import type { ParseResponse } from '@/lib/types'

import { SAMPLE, tx } from '../test-fixtures'

import { writeOfx } from './ofx'

describe('ofx writer', () => {
  it('locks the exact OFX 2.2 document', () => {
    // FITIDs are hashes; their shape is locked here and their stability in the tests below.
    const lines = writeOfx(SAMPLE).split('\n')
    const fitids = lines.filter((l) => l.startsWith('<FITID>'))
    expect(fitids).toHaveLength(2)
    expect(fitids[0]).toMatch(/^<FITID>20260801[0-9a-f]{8}<\/FITID>$/)
    expect(fitids[1]).toMatch(/^<FITID>20260802[0-9a-f]{8}<\/FITID>$/)
    expect(lines.map((l) => (l.startsWith('<FITID>') ? '<FITID>*</FITID>' : l))).toEqual([
      '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
      '<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>',
      '<OFX>',
      '<SIGNONMSGSRSV1>',
      '<SONRS>',
      '<STATUS>',
      '<CODE>0</CODE>',
      '<SEVERITY>INFO</SEVERITY>',
      '</STATUS>',
      '<DTSERVER>20260830</DTSERVER>',
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
      '<CURDEF>NGN</CURDEF>',
      '<BANKACCTFROM>',
      '<BANKID>gtb</BANKID>',
      '<ACCTID>****1234</ACCTID>',
      '<ACCTTYPE>CHECKING</ACCTTYPE>',
      '</BANKACCTFROM>',
      '<BANKTRANLIST>',
      '<DTSTART>20260801</DTSTART>',
      '<DTEND>20260830</DTEND>',
      '<STMTTRN>',
      '<TRNTYPE>CREDIT</TRNTYPE>',
      '<DTPOSTED>20260801</DTPOSTED>',
      '<TRNAMT>250.00</TRNAMT>',
      '<FITID>*</FITID>',
      '<NAME>Salary, "August"</NAME>',
      '<MEMO>Salary, "August"</MEMO>',
      '</STMTTRN>',
      '<STMTTRN>',
      '<TRNTYPE>DEBIT</TRNTYPE>',
      '<DTPOSTED>20260802</DTPOSTED>',
      '<TRNAMT>-40.00</TRNAMT>',
      '<FITID>*</FITID>',
      '<NAME>POS FOO STORES</NAME>',
      '<MEMO>POS FOO STORES</MEMO>',
      '</STMTTRN>',
      '</BANKTRANLIST>',
      '<LEDGERBAL>',
      '<BALAMT>1210.00</BALAMT>',
      '<DTASOF>20260830</DTASOF>',
      '</LEDGERBAL>',
      '</STMTRS>',
      '</STMTTRNRS>',
      '</BANKMSGSRSV1>',
      '</OFX>',
      '',
    ])
  })

  it('is byte-identical across runs (deterministic FITIDs, no export timestamp)', () => {
    expect(writeOfx(SAMPLE)).toBe(writeOfx(SAMPLE))
  })

  it('gives identical rows distinct FITIDs and the same rows the same FITIDs', () => {
    const twice = { ...SAMPLE, transactions: [tx({ debit: '100.00' }), tx({ debit: '100.00' })] }
    const ids = writeOfx(twice).split('\n').filter((l) => l.startsWith('<FITID>'))
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
    expect(ids[1]).toMatch(/-1<\/FITID>$/)
    expect(writeOfx(twice).split('\n').filter((l) => l.startsWith('<FITID>'))).toEqual(ids)
  })

  it('caps NAME at 32 characters, keeps the full narration in MEMO, escapes markup', () => {
    const long = 'NIP/TRF/ADEBAYO & SONS <LTD>/AUGUST RENT AND SERVICE CHARGE'
    const out = writeOfx({ ...SAMPLE, transactions: [tx({ narration: long, debit: '5.00' })] })
    expect(out).toContain('<NAME>NIP/TRF/ADEBAYO &amp; SONS &lt;LTD&gt;/AUG</NAME>')
    expect(out).toContain('<MEMO>NIP/TRF/ADEBAYO &amp; SONS &lt;LTD&gt;/AUGUST RENT AND SERVICE CHARGE</MEMO>')
  })

  it('leaves out LEDGERBAL rather than inventing a balance', () => {
    const noBalance: ParseResponse = {
      ...SAMPLE,
      metadata: SAMPLE.metadata && { ...SAMPLE.metadata, closing_balance: null },
      transactions: [tx({ debit: '5.00', balance: null })],
    }
    expect(writeOfx(noBalance)).not.toContain('<LEDGERBAL>')
  })

  it('writes a two-sided row as a DEBIT and a CREDIT with distinct FITIDs', () => {
    const out = writeOfx({ ...SAMPLE, transactions: [tx({ debit: '50.00', credit: '10.00' })] })
    const lines = out.split('\n')
    expect(lines.filter((l) => l.startsWith('<TRNAMT>'))).toEqual(['<TRNAMT>-50.00</TRNAMT>', '<TRNAMT>10.00</TRNAMT>'])
    const ids = lines.filter((l) => l.startsWith('<FITID>'))
    expect(new Set(ids).size).toBe(2)
  })
})
