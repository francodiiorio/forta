# Roadmap

Stages are executed in order. Each stage should ship with the tests and
documentation updates it requires — a stage is not "done" just because it
compiles.

## Stage 0 — Foundation (done)

React + TypeScript + Vite + Vitest project setup, directory structure,
subagent definitions, initial documentation. No fitness entities, no
persistence, no analytics.

## Stage 1 — Domain (done)

`Exercise`, `Muscle`, `Set`, `Workout`, `Routine`, `BodyMeasurement` as
framework-independent TypeScript types plus the domain rules that operate
purely on in-memory data (e.g. direct/indirect set classification). Domain
tests.

## Stage 2 — Persistence (done)

IndexedDB schema, repositories, `schemaVersion`, migrations, import,
export, validation. No UI beyond what's needed to exercise repositories in
tests.

## Stage 3 — Workout logging (done)

Flow: add workout → date → exercises → sets → weight/reps → save. Includes
a minimal inline exercise-catalog creation form (see
`docs/DECISIONS.md` D-016) — logging a workout needs exercises to pick
from, and there was no earlier stage to create them in.

## Stage 4 — Routines (done)

Create and reuse routines when starting a workout. Starting a workout
from a routine replaces the current draft rather than merging (see
`docs/DECISIONS.md` D-020).

## Stage 5 — History (done)

Workout history list and session detail view. Added simple in-app tabs
(no router — see `docs/DECISIONS.md` D-021) since the app now has three
sections. Also closed a Stage 1/3 gap found while building this: `Set`
had no field for `TIME`-tracked exercises (D-022).

## Stage 6 — Analytics

Daily, weekly, monthly stats; exercise stats; muscle stats; frequency;
volume; PRs — per [ANALYTICS.md](ANALYTICS.md).

## Stage 7 — Progress

Progress dashboard: general, per-exercise, per-muscle, using the
progression metrics defined in ANALYTICS.md (not raw workload deltas).

## Stage 8 — Polish

Responsive layout, UX refinement, accessibility, charts, visual polish.

## Explicitly deferred beyond this roadmap

Live/active workout tracking, rest timer, notifications, backend,
authentication, cloud sync, non-strength sports (see
[PRODUCT.md](PRODUCT.md)). These are not "Stage 9+" placeholders on this
roadmap; they require a product decision before they get a stage at all.
