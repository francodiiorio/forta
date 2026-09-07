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

## Coverage so far (through Stage 7)

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

Routines (Stage 4): an integration test creates an exercise from the
routine builder, saves a routine, starts a workout from it, and asserts
the saved workout carries `routineId` and the routine's exercise with a
freshly-added set. Also manually verified in a real browser. This stage
also caught a real bug that a passing test suite alone hadn't yet — a
nested `<form>` (see `docs/DECISIONS.md` D-019) that silently no-opped a
button click; worth remembering that "renders without errors" isn't the
same as "the interaction actually does something."

History (Stage 5): an App-level integration test navigates the tabs,
creates a routine, starts a workout from it, saves, then switches to the
history tab and asserts the workout appears and its detail shows the
logged set. This stage also surfaced a real domain gap, not a Stage 5
bug: `Set` had no field for `TIME`-tracked exercises, so they were
unloggable since Stage 1/3 without anyone noticing — see
`docs/DECISIONS.md` D-022. A regression test for TIME-tracked logging
was added specifically because the original gap had no test that would
have caught it.

Analytics (Stage 6): every formula has direct unit tests, including
edge cases the spec explicitly cares about — warm-up sets excluded,
non-`WEIGHT_REPS` tracking types contributing zero volume,
`ASSISTED_BODYWEIGHT` producing no PR, a muscle that's both direct and
indirect in the same session counting only as direct, and ISO week
ranges crossing a month boundary. This stage also caught two real bugs
that weren't Stage 6 bugs: `Set` had no `durationSeconds` field for
`TIME`-tracked exercises (already fixed in Stage 5, D-022), and
`dateInputToISODateTime` (Stage 3) parsed a picked date in the runtime's
local timezone instead of UTC, which can silently shift the stored date
by a day depending on the runtime's UTC offset — found while relying on
date-substring comparisons for period stats. `utils/date.ts` had no
dedicated test before this; it does now (D-028).

Progress (Stage 7): unit tests per progression function (best-per-session
performance picking, `ASSISTED_BODYWEIGHT` producing no series, workload+
frequency reported together per range) plus an App-level integration
test that logs a real workout and checks it shows up correctly in all
three progress views (general table, exercise series, muscle table) —
not just that the analytics functions return the right numbers in
isolation, but that the dashboard actually wires them up. Manually
verified in a real browser, including the estimated-1RM arithmetic.

Not yet covered because the feature doesn't exist yet: body measurement
logging (the domain entity exists since Stage 1, but no UI was scheduled
for it — see `docs/PRODUCT.md`) must not proceed without tests per the
rules stated above, whenever it's built.

## Commands

- `npm run test` — run the full Vitest suite once.
- `npm run test:watch` — watch mode.
- `npm run typecheck` — `tsc -b --noEmit`, no build output.
- `npm run build` — production build (also type-checks via `tsc -b`).
