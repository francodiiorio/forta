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

## Stage 6 — Analytics (done)

Daily, weekly, monthly stats; muscle stats; frequency; volume; PRs; est.
1RM — per [ANALYTICS.md](ANALYTICS.md). Pure TypeScript, no UI yet (see
D-027) — Stage 7 builds the screen that surfaces these numbers.

## Stage 7 — Progress (done)

Progress dashboard: general, per-exercise, per-muscle, using the
progression metrics defined in ANALYTICS.md (not raw workload deltas —
see D-030). Added as a fourth tab; workouts are loaded per-feature, not
lifted to App like the exercise catalog (D-029).

## Stage 8 — Polish (done)

Responsive layout, UX refinement, accessibility, charts, visual polish.
A real CSS design system (light/dark, spacing scale, reusable classes —
D-031), hand-rolled inline SVG charts for the progress views (D-032, no
new dependency), and display-number rounding (D-034). Fixed a real CSS
specificity bug found while testing: hovering the active tab made its
label invisible (D-033).

## Post-roadmap — Information architecture overhaul

Not one of the original 8 stages; done afterward in response to explicit
product feedback that the UI was too bare. Reworked navigation into five
bottom tabs with a new Home dashboard as the default screen (D-035), and
built the first UI for two capabilities that existed underneath since
earlier stages but were never exposed: body-weight logging
(`BodyMeasurement`, Stage 1) and data export/import
(`persistence/backup`, Stage 2) — both now live under a new Ajustes tab.
See `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` D-035–D-038.

A follow-up pass (D-039–D-041) matched the visual design to a specific
reference (monochrome palette, soft shadows, pill shapes) and added a
real desktop layout — a sidebar nav and a two-column Home grid above a
900px breakpoint — since the app had only ever been designed for a
mobile-width viewport up to that point.

A further product-feedback pass (D-042) added `Perfil` as a sixth nav
tab, holding static profile info (a new `UserProfile` entity — height,
for now) and the body-weight logging UI moved out of Ajustes. Ajustes
keeps only data export/import.

## Explicitly deferred beyond this roadmap

Live/active workout tracking, rest timer, notifications, backend,
authentication, cloud sync, non-strength sports (see
[PRODUCT.md](PRODUCT.md)). These are not "Stage 9+" placeholders on this
roadmap; they require a product decision before they get a stage at all.
