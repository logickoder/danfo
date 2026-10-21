# Contributing to Danfo

PRs welcome. The most valuable contribution to this repo is a new writer.

## Adding a budgeting-app writer

This is the designed extension point. The bar:

1. **Confirm the real format first.** From the target app's own documentation or a real
   export/import round-trip, never guessed from blog posts. Link your source in the PR.
2. One pure function in `src/writers/<app>.ts` consuming `ParseResponse` from
   `src/lib/types.ts`.
3. Tests in `src/writers/` locking the exact output, including CSV escaping and a
   zero-amount edge case.
4. A registry entry in `src/writers/index.ts` with a one-line import instruction written the
   way the target app actually words it.
5. Money stays a string end to end. No `Number()`, `parseFloat()` or `toFixed()` on amounts.
   PRs that coerce money to floats are declined regardless of anything else.

Apps without a manual import path (sync-only apps) cannot get a writer; there is nothing to
write to.

## Everything else

- Bug fixes and copy fixes: yes.
- UI changes: read [DESIGN.md](./DESIGN.md) first; PRs that fight it are declined.
- Parsing logic: no. That belongs in [bankstract](https://github.com/logickoder/bankstract).
- OAuth/sync, accounts, billing: no. See PRD.md out of scope.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`...).
- TypeScript strict, single quotes, no semicolons, no prettier: match the surrounding code.
- No em-dashes in any copy or comments.
- Gate before pushing: `pnpm typecheck && pnpm lint && pnpm test`.
