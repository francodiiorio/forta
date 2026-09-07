# Data Model

This describes the entities Forta persists, their relationships, and who
owns each one. Domain types (Stage 1) and persistence (Stage 2) both
implement this shape; see `src/domain/` and `src/persistence/`.

Ownership: **Data Architect** owns storage shape, IDs, and schema version.
**Fitness Domain** owns the meaning of each field. Neither may change the
other's concern unilaterally (see `.claude/agents/`).

## Guiding rule: store facts, not derived statistics

Persist what happened. Never persist a computed aggregate.

Persisted (facts):

- `workouts`, `exercises`, `sets`, `routines`, `bodyMeasurements`

Never persisted (derived — recomputed by analytics on demand):

- monthly/weekly volume, exercise/muscle progress, computed PRs, estimated
  1RM, frequency counts

Rationale: derived numbers depend on how they were computed and over what
period. Persisting them lets stored data silently disagree with the formula
that produced it after any analytics change. Recomputation is cheap given
IndexedDB is local and datasets are personal-scale.

## Entities

### Exercise

Catalog entry describing a movement, independent of any workout.

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `name` | `string` | |
| `primaryMuscles` | `Muscle[]` | see [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md) |
| `secondaryMuscles` | `Muscle[]` | |
| `equipment` | `Equipment` | |
| `trackingType` | `TrackingType` | `WEIGHT_REPS`, `BODYWEIGHT_REPS`, `ASSISTED_BODYWEIGHT`, `REPS_ONLY`, `TIME` |
| `laterality` | `Laterality` | `BILATERAL`, `UNILATERAL` |
| `category` | `ExerciseCategory` | e.g. compound/isolation grouping — exact taxonomy defined in Stage 1 |

### Workout

A completed, historical training session. Not a live/active session.

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `routineId` | `Id \| undefined` | present if started from a routine |
| `startedAt` | `ISODateTimeString` | |
| `completedAt` | `ISODateTimeString` | |
| `exercises` | `WorkoutExercise[]` | ordered, each referencing an `Exercise` and its `sets` |
| `notes` | `string \| undefined` | |

### WorkoutExercise

An exercise as performed within one workout (join between `Workout` and
`Exercise`, carrying the sets).

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `exerciseId` | `Id` | references `Exercise` |
| `sets` | `Set[]` | |

### Set

One set within a `WorkoutExercise`.

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `weight` | `number \| undefined` | present when `trackingType` uses weight |
| `reps` | `number \| undefined` | present when `trackingType` uses reps |
| `durationSeconds` | `number \| undefined` | present when `trackingType` is `TIME`, instead of reps |
| `rir` | `number \| undefined` | Reps In Reserve, optional |
| `rpe` | `number \| undefined` | Rate of Perceived Exertion, optional |
| `type` | `SetType` | see below |
| `completed` | `boolean` | |

`SetType` distinguishes **working**, **warm-up**, **dropset**, and
**failure** sets (see [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md)). As of
Stage 6, analytics treats warm-up sets as excluded from every metric
(`domain/workout/set.ts`'s `isWorkingSet`) while dropset/failure count
the same as working sets — no metric currently needs to tell dropsets
and failure sets apart from plain working sets, so that distinction
isn't built speculatively.

### Routine

A reusable template of exercises (and optionally target sets) a user can
start a workout from.

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `name` | `string` | |
| `exercises` | `RoutineExercise[]` | template exercises, no performed values |

`RoutineExercise` is `{ id, exerciseId }` — it references `Exercise` the
same way `WorkoutExercise` does, but carries no target sets/reps. Kept
deliberately minimal; see `docs/DECISIONS.md` D-010.

### BodyMeasurement

A point-in-time body measurement entry. `bodyWeight` is the only field the
v1 UI is required to expose; the rest are modeled now so the entity doesn't
need a breaking shape change later.

| Field | Type | Notes |
|---|---|---|
| `id` | `Id` | |
| `date` | `ISODateTimeString` | |
| `bodyWeight` | `number` | |
| `bodyFatPercentage` | `number \| undefined` | |
| `waist` | `number \| undefined` | |
| `chest` | `number \| undefined` | |
| `armLeft` / `armRight` | `number \| undefined` | |
| `thighLeft` / `thighRight` | `number \| undefined` | |
| `calfLeft` / `calfRight` | `number \| undefined` | |
| `notes` | `string \| undefined` | |

## Relationships

```
Routine 1──* RoutineExercise ──* Exercise
Workout 1──* WorkoutExercise ──* Exercise
Workout *──1 Routine            (optional)
WorkoutExercise 1──* Set
BodyMeasurement                 (standalone, keyed by date)
```

## IDs and schema versioning

IDs are generated once, client-side, via `utils/generateId` (currently
`crypto.randomUUID()`) — the only place ID generation happens. This is a
Data Architect concern; domain and UI never construct IDs themselves.

IndexedDB schema carries a `schemaVersion`. Migrations are additive scripts
keyed off that version. The portable export/import format carries its own
version, independent of `schemaVersion`, so a backup taken under one schema
version can still be validated and migrated on import into a later one. See
[DECISIONS.md](DECISIONS.md) D-002.
