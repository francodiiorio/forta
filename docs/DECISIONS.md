# Decisions

Durable architectural and product decisions, in order. Superseding a
decision should add a new entry that references the old one, not edit
history away.

## D-001 — Local-first, no backend

Forta has no backend, no accounts, no network dependency for core
functionality. IndexedDB is the source of truth. Rationale: the product
spec requires this explicitly, and a single-user gym log has no inherent
need for a server. Sync/backend is a possible future stage, not assumed
by any current code.

## D-002 — Persist facts, not derived statistics; two independent version numbers

Only source facts (`workouts`, `exercises`, `sets`, `routines`,
`bodyMeasurements`) are persisted. Derived numbers (volume, progress, PRs)
are always recomputed from facts, never stored. See
[DATA_MODEL.md](DATA_MODEL.md).

IndexedDB's `schemaVersion` (how data is shaped on disk) and the
import/export format's version (how a backup file is shaped) are tracked
independently. A schema migration doesn't necessarily require a backup
format change and vice versa, so conflating them into one number would
force unrelated changes to bump together.

## D-003 — Direct vs. indirect muscle involvement are separate, unweighted concepts

A working set is a direct set for an exercise's primary muscles and
indirect involvement for its secondary muscles. Forta does not assign
indirect involvement a fractional weight (e.g. "50% of a set") because no
general, defensible per-exercise percentage exists. See
[FITNESS_DOMAIN.md](FITNESS_DOMAIN.md). If a future analytics feature wants
a single weighted score, it must be a new, explicitly-named, separately
documented metric — it cannot silently redefine "sets per muscle."

## D-004 — Workload, frequency, performance, and progression are kept distinct

Analytics must not present a raw period-over-period workload delta (e.g.
volume up 50%) as "progress," because it conflates workload with
frequency. See [ANALYTICS.md](ANALYTICS.md). This is a standing constraint
on every future analytics feature, not a one-time note.

## D-005 — Multi-agent orchestration with a coordinating orchestrator

Work on this codebase is organized through `.claude/agents/`: an
`orchestrator` that classifies each request and selects only the relevant
specialist agents (not all of them, every time), plus domain-authoritative
agents (`fitness-domain`, `data-architect`, `analytics-engineer`,
`product-designer`, `frontend-engineer`, `qa-engineer`) and an
`internal-critic` that reviews independently rather than validating the
implementer's own reasoning. Rationale: keeps fitness/analytics/persistence
rules from being reinvented ad hoc inside UI code.

## D-006 — Toolchain: Vite 8 / React 19 / Node 24, pinned via `.nvmrc`

Stage 0 was scaffolded with the current `create-vite` React+TypeScript
template (Vite 8, React 19, `oxlint` for linting). Vite 8's bundler
(Rolldown) ships platform-specific native bindings that require Node
`^20.19.0 || >=22.12.0`; the environment's active Node (22.11.0, via nvm)
was just below that floor, which surfaced as an unrelated-looking
"cannot find native binding" error from `vitest`/`vite`, not a code
problem. Rather than downgrade the whole toolchain to dodge a one-minor-
version gap, Node 24.20.0 (latest LTS at setup time) was installed
alongside the existing version via `nvm` and pinned for this project via
`.nvmrc`, without changing the user's global default Node version. Anyone
opening this project should `nvm use` (or let an nvm-integrated shell do
it automatically) before running `npm install`.

## D-007 — No routing library, and no `routes.tsx`, yet

No router package is installed, `App.tsx` renders a static shell, and
`src/app/routes.tsx` is not created. An earlier draft of Stage 0 added it
with a hardcoded path-per-feature map; that was reverted (see
`docs/QA.md` / internal-critic Stage 0 review) because it committed to a
URL scheme before any feature had navigation, and — unlike every other
not-yet-built layer in this codebase, which is an empty directory — it was
the one place with invented content standing in for a decision nobody had
made yet. Both the router and `routes.tsx` are added together when a stage
actually needs navigation between features (Stage 3+), as a
`product-designer`/`frontend-engineer` decision at that time.

## D-008 — Domain vocabulary as string-literal unions, not TS enums

`TrackingType`, `Laterality`, `Equipment`, `ExerciseCategory`, `SetType`,
and `Muscle` are each a `const [...] as const` array plus a derived
`typeof arr[number]` type, not a TypeScript `enum`. Two reasons: (1)
`tsconfig.app.json` sets `erasableSyntaxOnly`, which rejects real
(non-erasable) enums outright; (2) the array is usable at runtime (e.g. to
populate a `<select>` later) for free, without a separate values list to
keep in sync.

## D-009 — Equipment includes an `OTHER` fallback; category stays binary

`Equipment` is a closed list for the common cases but keeps `OTHER` as an
escape hatch, since gym equipment can't be fully enumerated before real
exercise data exists. `ExerciseCategory` is only `COMPOUND` / `ISOLATION`
for now — the simplest distinction that's actually used anywhere in this
stage; a finer movement-pattern taxonomy (push/pull/legs, etc.) is added
only when a feature needs it.

## D-010 — `RoutineExercise` stays minimal in Stage 1

`RoutineExercise` is `{ id, exerciseId }` only. Target sets/reps/weight
for a routine are a product decision (does a routine prescribe a target,
or just a list of exercises?) that belongs to Stage 4, not something to
guess while only defining domain types.

## D-011 — IndexedDB's own version number is the schema version

There is no separate `schemaVersion` field stored anywhere; IndexedDB's
native database version (the integer passed to `indexedDB.open`) *is* the
schema version referenced throughout these docs. Migrations are plain
functions keyed by the version they upgrade to, run inside
`onupgradeneeded`; `runMigrations` walks every version between the
connection's old version and the target version and throws if any of them
has no defined migration, rather than silently skipping it. A second,
parallel version number would only be able to drift from the one
IndexedDB already tracks for free.

## D-012 — One cached `IDBDatabase` connection per process

`openDatabase()` opens the connection once and caches the promise;
subsequent calls reuse it. `closeDatabase()` exists to drop that cache
(used by tests to get a clean database between cases). This is the
standard pattern for a browser-local database used by a single tab and
keeps repositories from each managing their own connection lifecycle.

## D-013 — Backup import restores (replaces), it does not merge

`importBackup` clears every store and writes the backup's data, all in
one multi-store IndexedDB transaction, so a failure partway through cannot
leave some entity types cleared and others intact. Merging two data sets
(e.g. reconciling two devices' histories) is a materially harder problem
— id collisions, duplicate workouts — that this app does not attempt to
solve without cloud sync in the picture; see `docs/PRODUCT.md`.

## D-014 — Backup validation is structural, not a domain re-check

`validateBackupFile` checks the backup's shape (required top-level fields,
four data arrays, every entry has an `id`) and rejects a `formatVersion`
newer than the app supports. It does not re-validate individual domain
fields (e.g. that a `Set`'s `weight` is a sane number) — that validation
belongs where data first enters the system (forms in Stage 3), not
duplicated here where it could quietly drift out of sync with the real
rules.

## D-015 — Workout logging captures a date, not separate start/end times

The "log a workout" form asks for one date, not a start time and an end
time. `startedAt` and `completedAt` are both set to that date at
midnight. This matches the product's after-the-fact, non-live logging
model (see `docs/PRODUCT.md`) — nothing in v1 needs session duration, so
asking the user to enter times they'd have to guess or reconstruct
would add friction with no payoff. If a future stage needs duration,
that's a product decision to revisit, not something to guess now.

## D-016 — Minimal exercise-catalog creation lives inside Stage 3

The roadmap never dedicated a stage to building the exercise catalog, but
logging a workout requires picking an exercise that has to exist first.
Stage 3 therefore includes the minimum needed to unblock that: an
exercise picker backed by a create form covering every required
`Exercise` field. A fuller exercise-management screen (edit, delete,
browse/filter the catalog) stays deferred to `features/exercises` work
in a later stage — this is create-and-pick only, not catalog management.

## D-017 — `App.tsx` renders the workout flow directly, still no router

Stage 3 adds exactly one feature screen (logging a workout), so
`app/App.tsx` renders `LogWorkoutForm` directly rather than introducing
routing for a single destination. This extends D-007's reasoning: a
router (and `app/routes.tsx`) gets added when a second screen (e.g.
Stage 5's history view) actually needs to be navigated to, not before.
Stage 4 adds the routines section to the same page rather than a second
route, for the same reason.

## D-018 — Exercise catalog state is lifted to App, not fetched per-feature

`useExercises()` is called once in `App.tsx` and passed down as props
(`ExercisesApi`) to both the workout and routines features. An earlier
version had each feature call the hook independently; that would let two
mounted-at-once features (both visible on the same page — see D-017) hold
divergent copies of the catalog within one session, e.g. an exercise
created from the routine builder not appearing in the workout form's
picker without an unrelated reload. `ExercisePicker` is shared,
props-driven UI, not a data-fetching component itself.

## D-019 — `ExercisePicker`'s host must not itself be a `<form>`

`ExercisePicker` can render `ExerciseForm` (a `<form>`) when creating an
exercise inline. Nested `<form>` elements are invalid HTML and silently
break submission (found while building the routine screen: `RoutineForm`
originally wrapped itself in a `<form>`, which broke its own "Guardar
rutina" click once `ExerciseForm` was open — no error, the outer submit
handler just never ran). `RoutineForm` and `LogWorkoutForm` both use a
plain container with `type="button"` actions instead. Any future feature
that embeds `ExercisePicker` must do the same.

## D-020 — Starting a workout from a routine replaces the current draft

Clicking "Usar esta rutina" replaces whatever exercises/sets were already
in the workout-logging draft, rather than merging. There's no
confirmation step. This matches the expected usage (pick a routine
*before* adding anything manually) and avoids building draft-merge or
unsaved-changes-confirmation logic that Stage 4's scope doesn't call for;
revisit only if real usage shows people losing work this way.

## D-021 — In-app tabs instead of a router, for Stage 5's third section

Stage 5 adds history as a third section (alongside workout logging and
routines). Rather than stacking three potentially-long sections on one
page, or finally adding a router, `App.tsx` now holds a `tab` state
(`'workout' | 'routines' | 'history'`) and renders exactly one section at
a time — no URL involved, no new dependency. Starting a workout from a
routine also switches the tab to `'workout'` so the pre-populated form is
immediately visible. `useExercises()` and `useWorkoutForm()` stay lifted
in `App` (D-018) partly for the reason already given there, and now also
so switching tabs doesn't re-fetch the catalog or lose the in-progress
workout draft. This is still not "routing" in the D-007/D-017 sense — no
deep links, no browser history entries — and gets replaced by a real
router only when something actually needs those (e.g. sharing a link to
one workout).

## D-022 — `Set.durationSeconds` for TIME-tracked exercises

Found while building the read-only history detail view: `Set` had no
field to record a duration, so a `TIME`-tracked exercise (e.g. a plank)
could not actually be logged — `SetRow` showed neither a weight nor a
reps input for it, silently. Added `durationSeconds` to `Set` and
`requiresDuration(trackingType)` to `domain/exercise/trackingType.ts`,
symmetric with `requiresWeight`/`requiresReps`. This was a gap from Stage
1/3, not a Stage 5 decision, but it's fixed here rather than left
known-broken now that it's been found — see `docs/QA.md`.

## D-023 — Volume is `WEIGHT_REPS`-only

`calculateSetVolume` returns 0 for anything but a `WEIGHT_REPS` working
set. `BODYWEIGHT_REPS`/`REPS_ONLY`/`TIME` have no weight value at all.
`ASSISTED_BODYWEIGHT` does have a `weight`, but it represents assistance
— less assistance means *more* effective load, the opposite of a normal
weight value — so multiplying it directly into "volume" would make
harder sets look like they did less work. Rather than build a
bodyweight-estimation model (which would need body-weight data matched
to a date, with its own ambiguity about which measurement to use), Stage
6 leaves these tracking types out of "volume" specifically. Direct/
indirect set counts (which don't need a weight value) still cover them.

## D-024 — Estimated 1RM formula: Epley

`weight × (1 + reps / 30)`. Chosen over Brzycki, Lombardi, etc. for being
the most commonly cited and simplest to state — there's no formula that's
correct in any rigorous sense (all are curve-fit heuristics that degrade
at higher rep counts), so the choice is about being a defensible,
well-known default, not "the right one." `WEIGHT_REPS` only.

## D-025 — PR definition varies by tracking type; `ASSISTED_BODYWEIGHT` has none

`WEIGHT_REPS`: heaviest completed working-set weight, and — tracked
separately, since the heaviest single isn't always the best-estimated
1RM — the best estimated 1RM. `BODYWEIGHT_REPS`/`REPS_ONLY`: most reps in
a completed working set. `TIME`: longest completed working-set duration.
`ASSISTED_BODYWEIGHT` has no PR computed: "best" would mean *least*
assistance, which a simple `max()` over the stored value gets backwards,
and there's no bodyweight data to normalize against to make the
comparison meaningful. Only `completed` sets count for any PR — an
aborted set isn't a record.

## D-026 — Date ranges compare date substrings, not `Date` objects; weeks are ISO (Monday–Sunday)

`DateRange` is `{ start, end }` as inclusive `"YYYY-MM-DD"` strings, and
membership is a plain string comparison against `workout.startedAt`'s
first 10 characters — not `Date` object arithmetic. This sidesteps
timezone-conversion bugs entirely rather than being careful around them.
Weekly ranges follow ISO 8601 (Monday start) since it's an unambiguous,
documented standard, avoiding the classic undocumented Sunday-vs-Monday
inconsistency. This decision only holds if the dates being compared were
stored consistently in the first place — see D-028.

## D-027 — Analytics has no UI in Stage 6

`src/analytics/` is pure, tested TypeScript with no consumer yet — same
shape as Stage 1 (domain) and Stage 2 (persistence) before their
features landed. Stage 7 ("Progress") builds the dashboard that surfaces
these numbers; wiring analytics into a screen before then would be
building UI ahead of the product decisions (layout, which numbers matter
most) that belong to that stage.

## D-028 — Fixed a timezone bug in `dateInputToISODateTime` (Stage 3)

Found while trusting D-026's "compare date substrings" premise: it only
holds if the stored date substring actually matches the date the user
picked. `dateInputToISODateTime` parsed `"${date}T00:00:00"` with no
timezone marker, which JS parses as the *runtime's local* midnight. For
a positive UTC offset (e.g. UTC+5), local midnight for a given date is
still the *previous* day in UTC — so the date the user picked could be
silently stored, and later range-filtered, as one day earlier than what
they entered. Fixed by anchoring to `"T00:00:00Z"` (explicit UTC), so
the stored instant's first 10 characters always equal the picked date
regardless of the runtime's timezone. This didn't surface in manual
testing so far because the runtime timezone used has a negative UTC
offset, where the bug doesn't trigger — a reminder that "worked when I
tried it" doesn't cover timezones the tester isn't in. `utils/date.ts`
had no dedicated test before this either; added one.

## D-029 — `useWorkouts` is not lifted to `App`, unlike `useExercises`

Both `HistorySection` and `ProgressSection` (Stage 7) need the full
workout list, so the loading hook (`src/hooks/useWorkouts.ts`) is shared
code — but each feature calls it independently rather than App calling
it once and passing it down, unlike `exercisesApi` (D-018). Reasoning:
`exercisesApi` and the workout draft (`useWorkoutForm`) are lifted
because they need to survive a tab switch (a draft in progress, or
avoiding a refetch flicker for data shown on the currently-active tab).
Workout history has no draft to preserve, and each of these two tabs is
unmounted whenever it isn't the active one — so calling the hook
per-feature means it refetches fresh on every mount, i.e. every time the
user opens that tab. Lifting it would have introduced a real staleness
bug instead: a workout saved while on another tab would never appear
until a full page reload, since nothing would trigger the lifted
instance to reload. Don't lift shared data by default — lift it only
when there's a concrete reason two simultaneously-relevant consumers
need one live copy.

## D-030 — Progress dashboard: three separate trend views, never one score

`ProgressSection` shows general (session count + volume per week),
per-exercise (a performance series), and per-muscle (direct/indirect
sets + sessions per week) as three independent views — there is no
combined "progress score," percentage, or verdict anywhere. Exercise
progress uses performance (best 1RM/reps/duration per session) rather
than volume, specifically because performance isn't confounded by
frequency the way volume is (D-004) — a heavier single is a heavier
single regardless of how many sessions happened, so it's actually safe
to read as a trend on its own. General and muscle progress *are*
workload-based, which is exactly why they always render session count
next to volume/sets rather than either number alone — the reader needs
both to tell "trained harder" apart from "trained more often."

## D-031 — Design system: CSS custom properties, no CSS framework

Stage 8 added a real visual design (`src/index.css`): color tokens as CSS
custom properties, a light palette on `:root` with a dark override under
`@media (prefers-color-scheme: dark)`, a small spacing scale, and a
handful of reusable classes (`.card`, `.field`, `.button-group`,
`.table-wrapper`, `.exercise-card`, `.set-row`, `.tab-bar`/`.tab-button`).
No CSS framework or component library was added — the stack list
doesn't call for one, and the app's surface area (a handful of forms,
tables, and a few sections) doesn't need one either.

## D-032 — Charts are hand-rolled inline SVG, not a charting library

`src/components/BarChart.tsx` and `LineChart.tsx` are small, dependency-
free SVG components used by the progress views. They are decorative
(`aria-hidden="true"`): the accessible source of the same numbers is
always the table or list rendered alongside them, which is also what the
existing tests assert against. A charting library was deliberately not
added — the three chart shapes Stage 8 needed (grouped bars, a single
line) don't justify a new dependency, and keeping charts decorative
sidesteps having to give hand-rolled SVG proper keyboard/screen-reader
interaction semantics.

## D-033 — Fixed a CSS specificity bug: the active tab's label vanished on hover

Found while manually testing Stage 8's styling: hovering the *active* tab
made its label invisible. Cause: the generic `button:hover:not(:disabled)`
rule (specificity: 1 class + 2 pseudo-classes) has higher specificity than
both `.tab-button:hover` and `.tab-button[aria-current='true']` (each 1
class + 1 pseudo-class/attribute), so it won over the active tab's
intended text color — which happened to equal the tab's own background
color, making the text disappear entirely rather than just looking
slightly off. Fixed by excluding `.tab-button` from the generic hover
rule (`:not(.tab-button)`) and adding an explicit
`.tab-button[aria-current='true']:hover` rule as a second line of
defense. A reminder that CSS specificity conflicts can produce total
invisibility, not just a minor color mismatch, and are easy to miss
without actually hovering the element being tested.

## D-034 — Display numbers are rounded separately from the value analytics returns

`src/utils/format.ts`'s `formatNumber` rounds to one decimal place (and
drops a trailing `.0`) for on-screen display only — e.g. estimated 1RM
(`80 × (1 + 8/30)`) is `101.3` on screen, not
`101.33333333333333`. Analytics functions themselves keep returning
full-precision numbers; rounding happens once, at the UI boundary, so a
future consumer that needs more precision (e.g. comparing two estimates)
isn't silently working with an already-rounded value.

## D-035 — Information architecture reworked: 5-tab bottom nav, Home as default

Prompted by explicit product feedback that the UI was too bare and needed
a real home screen, dedicated pages, and a settings page. `app/App.tsx`
now has five tabs — `Inicio`, `Entrenar`, `Historial`, `Progreso`,
`Ajustes` — shown via a bottom icon+label nav (mobile-app convention)
instead of the earlier top text-tab bar. `Registrar` and `Rutinas` are
merged under `Entrenar` behind a segmented control
(`features/workout/TrainSection.tsx`) rather than getting a tab each,
keeping the nav at five items instead of six; starting a workout from a
routine switches that internal segment back to `Registrar`, same
behavior as before, just one level deeper. `Inicio` is a new dashboard
(`features/home/HomeSection.tsx`) that composes only *existing* analytics
functions (today's workout, lifetime totals, a 30-day activity grid,
volume trend, this week's sets, body weight) — it introduces no new
formulas, only a new arrangement of ones already decided and tested.

## D-036 — `Home`'s workouts must not be lifted either (same reasoning as D-029)

While building `HomeSection`, `useWorkouts()` was initially called once
in `App.tsx` and passed down as a prop — the same mistake D-029
explicitly named as the wrong call for a tab that unmounts when
inactive. It shipped with exactly the staleness bug D-029 predicted: a
workout saved in `Entrenar` didn't appear on `Inicio` until a full page
reload, because nothing told the lifted instance to refetch. Fixed by
having `HomeSection` call `useWorkouts()` itself, consistent with
`HistorySection` and `ProgressSection`. Recorded separately from D-029
because it's the same mistake recurring, not a new one — worth noting
that having written the rule down once didn't stop it from being missed
in the very next feature that needed it.

## D-037 — Fixed a bottom-nav layout bug: fixed-position elements ignore a centered max-width

Found while testing the new layout: `.bottom-nav` used
`position: fixed; left: 0; right: 0`, which pins it to the *viewport*
edges regardless of how the page content is laid out. Meanwhile the
content column (`.app-content`) is `max-width: 640px; margin: 0 auto`.
On any viewport wider than 640px this produced a nav bar spanning the
full window width while the content above it was a narrower, centered
column — nav and content visually misaligned. Fixed by giving
`.bottom-nav` the same `max-width: 640px; margin: 0 auto`. General
lesson: a fixed/sticky element's positioning is relative to the
viewport, not to a max-width ancestor, so it needs its own explicit
width constraint to stay visually aligned with constrained content.

## D-038 — jsdom's `Blob`/`File` has no `.text()`; polyfilled in test setup, not app code

Found writing a test for the data-import flow: `File.prototype.text()`
— a real, long-standing, Baseline browser API — throws
`TypeError: file.text is not a function` under jsdom 27, because jsdom's
own `Blob`/`File` implementation only has `slice`, `size`, and `type`;
not `text()`, `arrayBuffer()`, or `stream()` either. The app code
(`DataBackupSection.tsx`) is correct as written — this is a jsdom gap,
not a bug to work around in production code. Polyfilled in
`src/test/setup.ts` using `FileReader` (the one async Blob-reading API
jsdom does implement), the same category of fix as `fake-indexeddb`
patching jsdom's missing IndexedDB support.

## D-039 — Visual language: monochrome + one accent, shadows over borders

Prompted by explicit product feedback with a reference screenshot: the
UI still didn't look "designed." Reworked `src/index.css`'s tokens to a
monochrome primary palette (near-black in light mode / near-white in
dark mode drives buttons, active nav state, chart lines and bars) with
green reserved as the *only* accent, used solely for success/positive
states (`Completado` badge, checkmarks) — not a decorative brand color.
Cards, stat tiles, and the bottom nav use `box-shadow` for elevation in
light mode instead of a visible border, matching the reference's soft,
"floating" look; dark mode keeps a thin border instead, since shadows
don't read against a near-black background. Radii increased across the
board (`--radius-lg: 26px`, pill-shaped buttons/chips/badges/segmented
control) for the same reason.

The reference showed small "+6%" / "+3%" deltas next to its lifetime
stat tiles. Deliberately not copied: that's a period-over-period
workload delta shown with no frequency context — precisely what D-004
says not to present as unqualified progress. The visual language (icon,
big number, label, soft card) was adopted; that one element wasn't.

## D-040 — Desktop layout: same nav markup, repositioned by media query

Added a `@media (min-width: 900px)` breakpoint that turns the bottom nav
into a left sidebar (same `<nav>` element and buttons — no separate
desktop/mobile components — just `position`, `flex-direction`, and
sizing overrides) and widens `.app-content` accordingly. `HomeSection`
gets a `.home-grid` two-column split at that width (activity/stats on
the left, trend cards and body weight on the right); every other page
keeps its existing single-column card stack, which already reads fine
wider since cards have a natural max content width. Chose one shared
nav element over duplicate mobile/desktop nav components specifically
to avoid two places that could drift out of sync (same reasoning as
avoiding duplicated logic elsewhere in this codebase).

## D-041 — `LineChart` gained an optional filled-area mode, used only on Home

`components/LineChart.tsx` now takes a `filled` prop that adds a soft
gradient area beneath the line and drops the per-point dots, matching
the reference's trend-card look. Used only for Home's compact "Volumen"
card. The Progress tab's per-exercise line chart and its general/muscle
bar-chart-plus-table views are unchanged — those pair a chart with an
exact-values table on purpose (D-030), where individual bars/points
read better than a smoothed area. Two visual treatments for the same
underlying data, chosen deliberately per how precisely each view needs
to be read, not an inconsistency.

## D-042 — `Perfil` is a sixth nav tab, separate from `Ajustes`; new `UserProfile` entity

Product feedback: body-weight logging didn't belong buried under a
generic "Ajustes" page, and the app needed somewhere to put static
personal data like height (as opposed to `BodyMeasurement`, which is a
time series). Rather than nest this behind a segmented control inside
the existing Ajustes tab (the pattern `TrainSection` uses for
Registrar/Rutinas — see D-035), added `Perfil` as its own sixth
bottom-nav tab / sidebar entry, explicitly chosen over the
segmented-control option: body weight and profile info are things a
user checks independently of data export/import, not two views of the
same task the way logging and routines are.

New `UserProfile` domain type (`domain/profile/userProfile.ts`): a
single record keyed by the fixed id `USER_PROFILE_ID` rather than a
generated one, since the app has exactly one user. Currently just
`height`; other static fields (if any) get added to this type when
there's a concrete product decision to add them, not speculatively.
Persisted in its own `userProfile` IndexedDB store (schema version 2).

`BodyWeightSection` moved from `features/settings` (nested under
`features/body`) to `features/profile`; `useBodyMeasurements` and
`BodyWeightCard` stay in `features/body` since `BodyWeightCard` is a
Home dashboard widget, not a Perfil concern, and both features already
depend on it.

Backup format: `BackupData` gained `userProfile: UserProfile[]` — an
array like every other entity list (holding 0 or 1 records) rather than
a special-cased singleton field, so `exportBackup`/`importBackup` don't
need a second code path. `validateBackupFile` treats a missing
`userProfile` key as `[]` rather than a validation error, since backups
taken before this change don't have it — an additive, backward-
compatible change to the same `BACKUP_FORMAT_VERSION` (no bump needed;
consistent with D-002's independence between schema and backup
versioning).

## D-043 — All `LineChart`s use the filled-gradient style; `BarChart` gained value labels

Supersedes the part of D-041 that kept the Progress tab's per-exercise
line chart in the plain dots-and-line style: explicit product feedback
with a reference image asked for the filled-gradient look (used until
now only on Home's Volumen card) everywhere a line chart appears.
`LineChart`'s `filled` prop is gone — there's only one rendering mode
now, since no caller wants the other one anymore. The exact-values list
`ExerciseProgressView` renders next to its chart (the reason D-041 gave
for keeping dots there) still does the same job; dropping the dots
doesn't remove a reader's ability to see precise numbers, since that
list was always the accessible source of them, not the (`aria-hidden`)
chart.

Also addressed: `GeneralProgressView`'s bar charts (sessions/volume per
week) had no visible numbers at all — reading them meant looking away
to the table underneath. `BarChart` now draws each bar's value above
it (small muted text, `k`-abbreviated above 1000 to stay legible over a
narrow bar), with headroom reserved in the viewBox so the tallest bar's
label doesn't clip. Still `aria-hidden`, per the component's existing
contract: the paired table/list stays the real accessible source, this
is a visual aid layered on top of it, not a replacement. This also
improves `MuscleProgressView`'s and Home's "Esta semana" bar charts for
free, since they share the same component.

## D-044 — `BarChart` rebuilt as CSS flexbox columns, not an SVG viewBox

D-043's value labels looked visibly warped ("se ve muy mal" — product
feedback with a screenshot) on `GeneralProgressView`'s full-width
desktop cards: the SVG used `viewBox="0 0 300 100"` with
`preserveAspectRatio="none"` to fill the card, which stretches
*everything* inside non-uniformly whenever the rendered aspect ratio
isn't 3:1 — bars included, but it's the text glyphs where uneven
horizontal stretch actually reads as broken. A narrow card (close to
3:1) hid this; a full-width desktop card (much wider than tall) didn't.

Rather than special-case the label to counter-scale inside the SVG,
replaced the whole component with plain flexbox columns — each bar a
`div` with `height` as a percentage of a fixed-height container, the
label a normal sibling `<span>` above it. Regular HTML text under
normal CSS layout can't suffer this distortion at any width, and it
gets rounded top corners on the bars for free (matching the rest of the
app's soft, rounded visual language — D-039 — better than a hard SVG
rect did). `LineChart` keeps its SVG viewBox: a single stretched
polyline reads as "a line," not as broken the way stretched text does,
so it wasn't showing the same problem.
