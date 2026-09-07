# Architecture

Forta is a local-first, client-only web application. There is no backend and
no network dependency for core functionality.

## Layers

```
UI (React)  →  Domain + Analytics (pure TypeScript)  →  Persistence (IndexedDB)
```

### React (`src/app`, `src/features`, `src/components`, `src/hooks`)

Owns screens, navigation, forms, and UI state. React reads data through
repositories and analytics functions and renders it. It must not:

- implement fitness rules (what counts as a direct set, how 1RM is
  estimated, what a PR is), or
- implement statistical formulas (volume, progress, frequency).

If a component needs a calculation, that calculation lives in `domain/` or
`analytics/` and the component calls it.

### Domain (`src/domain`)

Framework-independent TypeScript. Defines the fitness entities and the rules
that are true regardless of how they're displayed or stored: what an
exercise is, what a set is, what "direct" vs. "indirect" muscle involvement
means, what a working set vs. a warm-up set is. See
[FITNESS_DOMAIN.md](FITNESS_DOMAIN.md).

Domain code has no dependency on React or IndexedDB. It is plain functions
and types over plain data.

### Analytics (`src/analytics`)

Framework-independent TypeScript. Computes derived numbers from domain data:
volume, frequency, PRs, estimated 1RM, progress. Analytics depends on
domain (it consumes domain types and domain-defined concepts like direct
sets) but not the other way around, and not on React or persistence
internals. See [ANALYTICS.md](ANALYTICS.md).

Analytics functions are pure: given the same stored facts, they return the
same derived numbers. Nothing analytics computes is itself persisted (see
below).

### Persistence (`src/persistence`)

Owns IndexedDB access, schema, repositories, migrations, and backup
(import/export). This is the only layer allowed to talk to IndexedDB
directly. Domain, analytics, and UI access data exclusively through
repositories. See [DATA_MODEL.md](DATA_MODEL.md).

### Backup (`src/persistence/backup`)

Serializes all persisted data to a portable, versioned export format, and
restores from one. Backup format versioning is independent from (but
related to) the IndexedDB `schemaVersion` — see
[DECISIONS.md](DECISIONS.md).

## Dependency rule

```
components/features/app  →  analytics  →  domain
                          ↘             ↗
                            persistence
```

- `domain` depends on nothing else in `src/`.
- `analytics` depends only on `domain`.
- `persistence` depends only on `domain` (to type what it stores).
- `features`/`components`/`app` may depend on `domain`, `analytics`, and
  `persistence` (through repositories), never the reverse.

## What gets persisted

Only source facts are persisted: workouts, sets, exercises, routines, body
measurements. Derived numbers (volume, progress, PRs) are never persisted —
they are computed on demand by analytics from source facts. See
[DATA_MODEL.md](DATA_MODEL.md) for the rationale.

## Current state (through the post-Stage-8 UI overhaul)

`domain` (Stage 1), `persistence` (Stage 2), workout logging in
`features/workout` and `features/exercises` (Stage 3), routines in
`features/routines` (Stage 4), history in `features/history` (Stage 5),
`analytics` (Stage 6: volume, muscle workload/frequency, PRs, estimated
1RM, period rollups; Stage 7: progression) and `features/progress`
(Stage 7) all have real code; see `docs/DATA_MODEL.md`,
`docs/FITNESS_DOMAIN.md`, and `docs/ANALYTICS.md` for what's implemented.

After Stage 8's initial visual pass (design tokens in `src/index.css`,
D-031; dependency-free chart components, D-032), the information
architecture itself was reworked (D-035–D-037): a five-tab bottom nav
(`Inicio` / `Entrenar` / `Historial` / `Progreso` / `Ajustes`) replaces
the earlier top text-tab bar, with a new `features/home` dashboard as the
default screen and `Registrar`/`Rutinas` merged under `Entrenar` behind a
segmented control. `features/settings` and `features/body` are new:
body-weight logging (the `BodyMeasurement` entity has existed since
Stage 1, but never had UI — see `docs/PRODUCT.md`) and the export/import
UI for the backup functions built in Stage 2 (`persistence/backup`) both
live there. `src/components/icons.tsx` and `ActivityHeatmap.tsx` extend
the dependency-free approach from D-032 to navigation icons and the
30-day activity grid.

State-sharing across `app/App.tsx`'s tabs follows one rule: lift a hook
only when a consumer needs to survive a tab switch (a draft, or avoiding
a refetch flicker on data the active tab is already showing) — otherwise
each feature loads its own. The exercise catalog (`ExercisesApi`, from
`useExercises`) and the workout draft (`useWorkoutForm`) are lifted for
that reason (D-018, D-021); `useWorkouts` (home, history, progress) is
not — each of those tabs unmounts when inactive, so loading fresh on
every mount is both simpler and avoids the staleness that lifting would
cause (D-029). `Home` originally lifted `useWorkouts` by mistake when it
was introduced and shipped with exactly that staleness bug; see D-036.

`app/App.tsx` switches between its five sections via a plain `tab` state,
not a router — see `docs/DECISIONS.md` D-021. `app/routes.tsx` still
doesn't exist; a real router is added only when something needs an
actual URL (deep links, browser back/forward), per D-007/D-017.

`features/body` (body measurement logging — see `docs/PRODUCT.md`, never
scheduled a stage) and `app/providers` (no cross-cutting React context
has been needed yet) remain empty directory skeletons.
