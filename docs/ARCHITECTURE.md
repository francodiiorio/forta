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

## Current state (through Stage 6)

`domain` (Stage 1), `persistence` (Stage 2), the workout-logging flow in
`features/workout` and `features/exercises` (Stage 3), routines in
`features/routines` (Stage 4), history in `features/history` (Stage 5),
and `analytics` (Stage 6: volume, muscle workload/frequency, PRs,
estimated 1RM, period rollups) have real code; see `docs/DATA_MODEL.md`,
`docs/FITNESS_DOMAIN.md`, and `docs/ANALYTICS.md` for what's implemented.
`analytics` has no UI consumer yet — see D-027 — so it isn't reachable
from `App.tsx`, though its code is built and fully tested. The exercise
catalog (`ExercisesApi`, from `useExercises`) and the workout draft
(`useWorkoutForm`) are both owned by `App.tsx` and passed down as props
rather than each feature holding its own copy — see `docs/DECISIONS.md`
D-018, D-021.

`app/App.tsx` switches between three sections (`workout` / `routines` /
`history`) via a plain `tab` state, not a router — see
`docs/DECISIONS.md` D-021. `app/routes.tsx` still doesn't exist; a real
router is added only when something needs an actual URL (deep links,
browser back/forward), per D-007/D-017.

`analytics`, the remaining `features/*` folders (progress, body),
`components`, `hooks`, and `app/providers` are still empty directory
skeletons (see `ROADMAP.md`).
