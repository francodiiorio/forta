# QA

Validation strategy for Forta. Authority: **QA Engineer**, with independent
review from **Internal Critic** on the areas listed below.

## What must be tested, and where

- **Domain rules** (`src/domain/**`) — pure Vitest, no DOM. Direct/indirect
  muscle classification, set-type semantics, tracking-type-specific
  behavior (e.g. `ASSISTED_BODYWEIGHT` sign handling) are correctness bugs
  if wrong, not style issues — they need explicit test cases per rule
  stated in [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md).
- **Analytics** (`src/analytics/**`) — pure Vitest. Every metric in
  [ANALYTICS.md](ANALYTICS.md) needs tests that check it against
  hand-computed expected values, plus at least one test guarding the
  workload/frequency/performance/progression separation (e.g. a test that
  fails if "progress" ever collapses to a bare volume delta).
- **Persistence** (`src/persistence/**`) — Vitest with `fake-indexeddb`.
  Repository CRUD, schema creation, and each migration path (old data →
  new schema) need a test. A migration without a test is not done.
- **Import/export** — round-trip tests (export then import reproduces the
  original data) and forward-compatibility tests (importing an older
  backup format version still works or fails with a clear, typed error —
  never silently drops data).
- **Critical flows** — logging a workout, creating and reusing a routine,
  viewing history, recording body weight. Component/integration tests
  (`@testing-library/react`) once those features exist.
- **Edge cases** — empty states (no workouts yet, no exercises in catalog),
  an exercise with no secondary muscles, a `BODYWEIGHT_REPS` or `TIME` set
  with no `weight`, a workout with zero completed sets, importing an empty
  or malformed backup file.

## QA vs. Internal Critic

QA verifies the implementation matches what was specified: "does this
function return the documented value for this input." QA must judge
whether existing tests actually cover the spec, not just whether the
existing tests pass — a green suite that never exercises the direct/
indirect distinction has not verified [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md).

Internal Critic questions the specification and implementation together:
whether a "progress" metric can mislead the way [ANALYTICS.md](ANALYTICS.md)
warns against, whether a rule contradicts another doc, whether a test
suite gives false confidence. Critic is not required for trivial changes,
but is required for anything touching domain, analytics, persistence,
migrations, import/export, or a core flow (see
`.claude/agents/orchestrator.md`).

## Stage 0 baseline

At the end of Stage 0, the only tests that exist are a smoke test for the
`App` shell and a unit test for `generateId`. This is intentionally
minimal — there is no domain, analytics, or persistence code yet to test.
Stage 1 must not proceed without domain tests per rule stated above.

## Commands

- `npm run test` — run the full Vitest suite once.
- `npm run test:watch` — watch mode.
- `npm run typecheck` — `tsc -b --noEmit`, no build output.
- `npm run build` — production build (also type-checks via `tsc -b`).
