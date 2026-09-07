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

## Coverage so far (through Stage 3)

Domain (Stage 1): tracking-type field rules, set-type classification,
and the direct/indirect muscle involvement rule against the Bench Press
example from `docs/FITNESS_DOMAIN.md`.

Persistence (Stage 2): schema/migration creation and the missing-
migration failure path, generic repository CRUD, and backup export/
import (round-trip, replace-not-merge, malformed input, unsupported
future format version).

Workout logging (Stage 3): an integration test drives the real flow —
create an exercise inline, add a set, save — and asserts against the
persisted `Workout`, not just the UI. Manually verified in a real browser
(golden path, data surviving a reload, no console errors) since component
tests alone don't confirm a feature works end-to-end.

Not yet covered because the feature doesn't exist yet: analytics
(Stage 6), routines (Stage 4), history (Stage 5). Each of those must not
proceed without tests per the rules stated above.

## Commands

- `npm run test` — run the full Vitest suite once.
- `npm run test:watch` — watch mode.
- `npm run typecheck` — `tsc -b --noEmit`, no build output.
- `npm run build` — production build (also type-checks via `tsc -b`).
