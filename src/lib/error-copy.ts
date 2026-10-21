import { MAX_FILE_MB } from './parse-client'
import type { ParseErrorCode } from './route-state'

// What the user reads for each failed parse. Every entry follows the voice rule: what
// happened, why, what to do.

/** What the error card offers as its one action. */
type ErrorAction = 'pick_file' | 'tell_us' | 'retry' | 'reload'

interface ErrorCopy {
  label: string
  title: string
  body: string
  action: ErrorAction
}

export const ERROR_COPY: Record<ParseErrorCode, ErrorCopy> = {
  not_pdf: {
    label: 'NOT A PDF',
    title: 'That one no be PDF.',
    body: 'Danfo reads PDF statements only, and this file never left your device. Pick the PDF from your bank app or downloads.',
    action: 'pick_file',
  },
  too_large: {
    label: 'TOO BIG',
    title: 'That file is too big.',
    body: `A bank statement PDF is well under ${MAX_FILE_MB}MB, so this is probably not one. Pick the statement PDF from your bank app.`,
    action: 'pick_file',
  },
  reconciliation_failed: {
    label: "DOESN'T ADD UP",
    title: "This statement doesn't add up.",
    body: "The rows don't match the statement's own totals, so nothing was converted. Download a fresh copy from your bank app and try again.",
    action: 'pick_file',
  },
  encrypted: {
    label: 'PASSWORD',
    title: 'This PDF has a password.',
    body: "Locked files can't be read, and Danfo never asks for your password. Download it again without one, or remove the password first.",
    action: 'pick_file',
  },
  empty_statement: {
    label: 'EMPTY',
    title: 'No transactions on this statement.',
    body: 'The period on this statement has no rows to move. Download a longer period from your bank app.',
    action: 'pick_file',
  },
  layout_drift: {
    label: 'LAYOUT CHANGED',
    title: 'Your bank changed its statement layout.',
    body: "We know this bank, but this layout is new to us, so nothing was converted. Tell us and we'll update the route.",
    action: 'tell_us',
  },
  unsupported: {
    label: 'UNKNOWN BANK',
    title: "We can't read this one yet.",
    body: "It doesn't look like a statement from a bank on our route. Check the file, or tell us which bank it is.",
    action: 'tell_us',
  },
  parse_failed: {
    label: "COULDN'T READ",
    title: "We couldn't read this statement.",
    body: 'Something in this file stopped the read, so nothing was converted. Try a fresh copy from your bank app.',
    action: 'pick_file',
  },
  over_capacity: {
    label: 'BUS FULL',
    title: 'Danfo is full for now.',
    body: 'We hit our free parsing cap, so nothing was converted. Your file was not kept. Try again in a while.',
    action: 'retry',
  },
  busy: {
    label: 'GO-SLOW',
    title: 'Too many statements from your network.',
    body: 'We read a lot from your connection in a short time, so nothing was converted. Wait a minute and try again.',
    action: 'retry',
  },
  unavailable: {
    label: 'ROAD BLOCKED',
    title: "We couldn't reach the statement reader.",
    body: 'That is on our side, not your file, and nothing was converted. Try again in a few minutes.',
    action: 'retry',
  },
  server_not_configured: {
    label: 'OUR PROBLEM',
    title: 'Danfo is missing its parse key.',
    body: "That is a Danfo problem, not yours, and nothing was converted. Try again later while we fix it.",
    action: 'retry',
  },
  turnstile_failed: {
    label: 'BOT CHECK',
    title: "The bot check didn't pass.",
    body: "Cloudflare couldn't confirm a person is sending this file. Reload the page and try again.",
    action: 'reload',
  },
  network: {
    label: 'NO NETWORK',
    title: "Your file didn't reach us.",
    body: 'The connection dropped before the upload finished. Check your network and try again.',
    action: 'retry',
  },
}
