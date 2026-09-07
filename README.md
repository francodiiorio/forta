# Forta

Local-first strength training tracker. React + TypeScript + Vite +
IndexedDB + Vitest. No backend.

See `CLAUDE.md` for the rules that govern this codebase, and `docs/` for
product, architecture, data model, fitness domain, analytics, roadmap,
decisions, and QA strategy.

## Requirements

Node version pinned in `.nvmrc` (see `docs/DECISIONS.md` D-006).

## Scripts

```
npm run dev         # start dev server
npm run test         # run tests once
npm run test:watch   # run tests in watch mode
npm run typecheck    # type-check without emitting
npm run build         # production build
npm run lint          # oxlint
```
