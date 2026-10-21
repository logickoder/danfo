# Danfo: Agent Operating Charter

You are working inside `danfo`, a public MIT repo. Danfo is a free consumer web tool: it turns
a Nigerian bank statement PDF into the exact import file a budgeting app accepts (YNAB, Actual
Budget, Goodbudget, Toshl). One page, no accounts, no sync, nothing stored.

Owner: Jeffery Orazulike (github.com/logickoder).

Sibling repos: `bankstract` (MIT engine) and `bankstract-cloud` (AGPL hosted API). Danfo calls
bankstract-cloud's `/v1/parse` over HTTP and never reimplements parsing. Product spec lives in
[PRD.md](./PRD.md). Visual rules live in [DESIGN.md](./DESIGN.md). Do not duplicate either here.

At session start, read `_handoff/status.md` (gitignored): it carries what is done, what is
next, and what is blocked on the owner. Update it when state changes; it is the handoff
between sessions.

---

## RULES

The rules live one topic per file in [docs/rules/](./docs/rules/). Read the relevant ones
before working; they are binding, not background.

| Rule | Covers |
|---|---|
| [sample-hard-fail](./docs/rules/sample-hard-fail.md) | never convert bankstract's canned `_sample` response |
| [money](./docs/rules/money.md) | amounts are DecimalStrings, never parsed as numbers |
| [privacy](./docs/rules/privacy.md) | nothing is stored |
| [secrets](./docs/rules/secrets.md) | secrets never commit |
| [writers](./docs/rules/writers.md) | what a writer needs before it enters `TARGETS` |
| [workflow](./docs/rules/workflow.md) | human in the loop, surgical edits, the gate, response format |
| [code-style](./docs/rules/code-style.md) | strict types, comment discipline |
| [voice](./docs/rules/voice.md) | Danfo voice, naira in mono, the name lockup |
| [writing](./docs/rules/writing.md) | no em-dashes, marketing words or emojis |
| [scope](./docs/rules/scope.md) | features that are out of scope |

Claude Code loads the Danfo-specific ones through `.claude/rules/`, whose files are thin
wrappers (frontmatter plus an `@` import) around the same `docs/rules/` sources. `workflow`,
`code-style`, `writing` and `secrets` have no wrapper: the owner's personal Claude rules
already cover them. Edit the source in `docs/rules/`, never the wrapper.

---

## COMMANDS

```bash
pnpm install
cp .env.example .env.local   # fill DANFO_API_KEY
pnpm dev

pnpm typecheck && pnpm lint && pnpm test   # the gate, must pass clean
pnpm build
pnpm preview   # production build on local workerd (Cloudflare runtime)
pnpm run deploy   # owner only (bare `pnpm deploy` is a pnpm built-in): builds and ships to Cloudflare Workers
```

## LAYOUT

```
src/
├── lib/
│   ├── types.ts            ParseResponse mirror of bankstract-cloud's wire contract
│   ├── route-state.ts      the page's state machine (reducer + selectors, busLoad), pure
│   ├── parse-client.ts     client call to /api/parse, error-class mapper
│   ├── error-copy.ts       ERROR_COPY: what the user reads for each failed parse
│   ├── statement.ts        display helpers: BANKS, bank names, summary, checks, 3-row preview, pure
│   ├── targets.ts          picker selectors over TARGETS: featured, more, search, find, pure
│   ├── save-file.ts        hands a browser-built file to the user as a download
│   ├── links.ts            outbound links in one place, plus the build's commit link
│   ├── sky.ts              time of day from the Lagos clock, and the pre-paint script
│   └── turnstile-verify.ts server-side Turnstile siteverify call
├── writers/                the product (docs/rules/writers.md)
│   ├── index.ts            TARGETS registry: the only place the UI learns about apps
│   ├── target.ts           the Target type, MIME types, downloadName
│   ├── shared.ts           money-as-string helpers, movesMoney, the Uncategorised placeholder
│   ├── formats/            generic file formats any app can take: csv plumbing, ofx
│   └── apps/               writers shaped for one app's own import: ynab, cashew, realbyte
├── components/
│   ├── hero/               client island: reducer (hero.tsx), the card and one file per card
│   │                       state, app picker, sun/moon toggle, the Turnstile widget
│   ├── scene/              danfo (the bus and its five loads), street and road art
│   └── sections/           static sections, one file each: nav, route stops, conveyor,
│                           why not link, privacy and FAQ, terminus footer
├── types/turnstile.d.ts    ambient typing for the Turnstile script (window.turnstile)
└── app/
    ├── page.tsx          the single page: nav, hero, sections, terminus footer
    ├── layout.tsx        fonts (Bungee, DM Sans, JetBrains Mono) + the lockup metadata
    ├── globals.css       danfo tokens and base styles (see DESIGN.md)
    ├── motion.css        the in-world animations
    ├── sky.css           the time-of-day scene
    └── api/parse/route.ts proxy: key server-side, Turnstile, the sample and demo hard-fails
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
