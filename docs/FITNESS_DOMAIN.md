# Fitness Domain

This defines fitness terms exactly, so analytics and UI use them
consistently. Authority: **Fitness Domain** agent. Analytics and Frontend
consume these definitions; they do not redefine them.

## Exercise

A catalog entry for a movement. See [DATA_MODEL.md](DATA_MODEL.md) for its
fields. Two properties drive how sets are recorded and interpreted:

- **`trackingType`** — what a set of this exercise records:
  - `WEIGHT_REPS` — external weight + reps (e.g. barbell bench press).
  - `BODYWEIGHT_REPS` — bodyweight + reps, no added load (e.g. pull-up).
  - `ASSISTED_BODYWEIGHT` — bodyweight reduced by assistance + reps (e.g.
    assisted dip machine).
  - `REPS_ONLY` — reps with no weight concept at all.
  - `TIME` — duration-based (e.g. plank), no reps.
- **`laterality`** — `BILATERAL` (both sides move together) or `UNILATERAL`
  (one side at a time, e.g. single-arm row). This matters for how volume
  and progress are read per side later; it is not collapsed into a single
  number implicitly.

## Set

One performed (or planned, in a routine) unit of an exercise. A set has a
`type`, distinguishing:

- **working set** — counts toward volume, PRs, and progress.
- **warm-up set** — does not count toward volume, PRs, or progress.
- **dropset** — a working set performed immediately after another with
  reduced weight and no rest; counted as its own set.
- **failure set** — a working set taken to muscular failure.

Stage 1 models these four as a `SetType` enum on `Set`. Analytics is not
required to treat all four differently until a stage actually needs that
distinction (e.g. excluding warm-ups from volume is needed from the start;
treating dropsets specially in PR calculation is not, until specified).

**RIR** (Reps In Reserve) and **RPE** (Rate of Perceived Exertion) are
optional, user-entered effort indicators on a set. Forta does not derive one
from the other and does not require either.

## Muscles: primary, secondary, direct, indirect

An exercise declares `primaryMuscles[]` and `secondaryMuscles[]`. This is a
property of the *exercise*, fixed in the catalog — not something computed
per set.

When a set of that exercise is logged as a working set:

- it counts as a **direct set** for every muscle in `primaryMuscles`.
- it counts as **indirect involvement** for every muscle in
  `secondaryMuscles`.

These two concepts are tracked **separately** and are never merged into one
number, and Forta does **not** assign an arbitrary fractional credit (e.g.
"secondary muscles get 50% of a set") to indirect involvement. There is no
validated, exercise-general way to say a fixed percentage of a bench press
set trains the triceps, so Forta does not claim one.

**Example** — Bench Press, primary: chest; secondary: triceps, anterior
deltoid. 3 working sets logged:

- Chest: 3 direct sets.
- Triceps: indirect involvement across 3 sets (not "1.5 sets", not "50%").
- Anterior deltoid: indirect involvement across 3 sets.

Any statistic that wants a single "sets per muscle" number must say
explicitly whether it means direct sets, indirect involvement, or both
shown side by side — see [ANALYTICS.md](ANALYTICS.md).

## Muscle catalog

`Muscle` is defined as a string-literal union in
`src/domain/muscle/muscle.ts` (the `MUSCLES` array), covering the major
muscle groups relevant to gym strength training: chest, upper back, lats,
traps, anterior/lateral/posterior deltoid, biceps, triceps, forearms, abs,
obliques, lower back, glutes, quadriceps, hamstrings, adductors,
abductors, calves.

The deltoid is split into anterior/lateral/posterior because exercises
routinely load only one head as a secondary muscle (e.g. bench press →
anterior deltoid only) and collapsing them would lose that distinction.
Other muscles are *not* further subdivided (e.g. chest is not split into
upper/mid/lower) because nothing in this app's scope needs that
granularity yet. The list is additive — code is the source of truth;
this section explains the *shape* of the decision, not a duplicate list
to keep in sync by hand.

## Personal Records (PR) and estimated 1RM

A **PR** for an exercise is the best observed completed working-set
result — heaviest weight for `WEIGHT_REPS`, most reps for
`BODYWEIGHT_REPS`/`REPS_ONLY`, longest duration for `TIME`; none for
`ASSISTED_BODYWEIGHT` (see `docs/DECISIONS.md` D-025 for why). This
document fixes that PRs are computed from working sets only, never from
warm-ups; the exact per-tracking-type metric is D-025's call, not
repeated here to avoid the two drifting apart.

**Estimated 1RM** is a formula-based estimate from a weight+reps set,
applicable only to `WEIGHT_REPS` exercises. It is an estimate, not a
measured value, and must be presented as such. Forta uses the Epley
formula (`docs/ANALYTICS.md`, `docs/DECISIONS.md` D-024) — chosen for
being simple and commonly cited, not because it's uniquely "correct";
every such formula is a heuristic that degrades at higher rep counts.

## Progressive overload

Progressive overload is the principle that performance on an exercise
(load, reps, or estimated 1RM at comparable effort) should trend upward
over time for continued adaptation. Forta treats it as something analytics
*surfaces as a trend*, not something it declares as achieved from two data
points. See [ANALYTICS.md](ANALYTICS.md) for why raw period-over-period
deltas (e.g. total volume) are not read as progress on their own.

## Bodyweight and assisted exercises

For `BODYWEIGHT_REPS`, volume (Stage 6, `docs/ANALYTICS.md` D-023) does
not attempt to factor in bodyweight — there's no reliable body-weight
value to attach to a given session, and guessing one (nearest
`BodyMeasurement`, an assumed constant, etc.) would be exactly the kind
of invented formula this project avoids. `BODYWEIGHT_REPS` sets
contribute to direct/indirect set counts and frequency, just not to the
weight-based volume number. For `ASSISTED_BODYWEIGHT`, the recorded
`weight` represents assistance (which reduces effective load), not added
load; domain and analytics code must not treat it as interchangeable
with `WEIGHT_REPS` weight without accounting for that sign difference —
which is also why it has no volume, no PR, and no estimated 1RM (see
`docs/DECISIONS.md` D-023, D-025).
