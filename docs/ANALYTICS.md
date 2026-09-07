# Analytics

Analytics computes derived numbers from persisted facts (see
[DATA_MODEL.md](DATA_MODEL.md)). It is pure TypeScript with no React and no
direct IndexedDB access — it receives domain data and returns numbers.
Authority: **Analytics Engineer**, constrained by definitions in
[FITNESS_DOMAIN.md](FITNESS_DOMAIN.md). Workload, frequency, and
performance (`src/analytics/`) are implemented as of Stage 6 — see
"Implemented formulas" below for the exact conventions chosen. Progression
(Stage 7) is not implemented yet.

## Four distinct concepts

Forta's analytics deliberately separates four things that are easy to
conflate. A single number from one category must never be presented as
evidence for another without saying so explicitly.

1. **Workload** — how much was done. Volume (weight × reps, summed),
   direct sets, indirect involvement, sets-per-muscle. A pure count of
   work performed in a period.
2. **Frequency** — how often something was trained. Sessions per period,
   or sessions touching a given muscle/exercise per period.
3. **Performance** — how well a specific effort went. Weight × reps on a
   given exercise on a given day, estimated 1RM on a given day, RIR/RPE at
   a given load.
4. **Progression** — whether performance is trending up over time, at
   comparable frequency/effort. This is the only one of the four that
   answers "is this person getting stronger," and it is derived by
   comparing performance across time, not by diffing workload totals.

### Why raw workload deltas are not "progress"

Example from the product spec: August volume 10,000 kg, September volume
15,000 kg. This is **not** reported as "+50% progress." September could
simply have had more sessions. A volume delta mixes workload and frequency;
neither alone nor together do they establish progression. Progression
statistics must control for what changed (more sessions vs. heavier/harder
sessions) or, at minimum, must display frequency and performance alongside
workload so the user isn't shown a misleading single number.

## Planned metrics (by category)

**Workload**
- Volume (total, per exercise, per muscle — direct and indirect kept
  separate per [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md#muscles-primary-secondary-direct-indirect)).
- Direct sets per muscle.
- Indirect involvement per muscle (reported as involvement across N sets,
  never as a fractional set count or invented percentage).

**Frequency**
- Training frequency (sessions per period).
- Per-muscle frequency (sessions in which a muscle received at least one
  direct set, reported separately from sessions with only indirect
  involvement).

**Performance**
- Personal records (PR), per exercise, per metric (see
  [FITNESS_DOMAIN.md](FITNESS_DOMAIN.md#personal-records-pr-and-estimated-1rm)).
- Estimated 1RM, `WEIGHT_REPS` exercises only.

**Progression**
- Exercise progress: performance trend for one exercise over time.
- Muscle progress: performance/workload trend for one muscle over time,
  read alongside frequency, not as a bare volume delta.
- General progress: a dashboard-level summary composed from the above,
  never a single derived "score" invented for the purpose.

**Period rollups** (composed from the categories above, not a fifth
category): daily, weekly, monthly, and custom-range stats.

## Implemented formulas (Stage 6)

- **Volume** (`analytics/volume/calculateVolume.ts`) is `weight × reps`,
  computed only for `WEIGHT_REPS` working sets. `BODYWEIGHT_REPS` /
  `REPS_ONLY` / `TIME` have no weight to multiply. `ASSISTED_BODYWEIGHT`'s
  recorded weight is assistance — less assistance is *harder* — so
  multiplying it directly would invert what "more volume" means; it's
  excluded rather than computed wrong. See D-023.
- **Direct sets / indirect involvement per muscle**
  (`analytics/muscles/muscleWorkload.ts`) reuses
  `domain/muscle/muscleInvolvement.classifySetInvolvement` and counts
  sets — direct and indirect always kept as separate numbers, never
  merged or weighted.
- **Training frequency** (`analytics/frequency/trainingFrequency.ts`) is
  a session count. **Per-muscle frequency** counts sessions, not sets: a
  muscle direct-set five times in one session is one `directSessions`.
  A session where a muscle got indirect involvement but no direct set
  counts under `indirectOnlySessions`; if it got both, it only counts as
  direct.
- **Estimated 1RM** (`analytics/records/estimatedOneRepMax.ts`) uses the
  Epley formula, `weight × (1 + reps / 30)`, `WEIGHT_REPS` only. See
  D-024 for why Epley over alternatives.
- **Personal records** (`analytics/records/personalRecords.ts`): heaviest
  completed working-set weight for `WEIGHT_REPS` (plus the best estimated
  1RM, tracked separately since they aren't always the same set); most
  reps for `BODYWEIGHT_REPS`/`REPS_ONLY`; longest duration for `TIME`.
  Not computed for `ASSISTED_BODYWEIGHT` — see D-025.
- **Period rollups** (`analytics/stats.ts`, `analytics/dateRange.ts`):
  daily/weekly/monthly/custom ranges are inclusive `"YYYY-MM-DD"` bounds,
  compared as date substrings of `startedAt` (not timezone-aware `Date`
  arithmetic). Weekly is the ISO 8601 week (Monday–Sunday). See D-026.

## Rules

- No persisted derived values — every metric above is computed on demand
  from `workouts` / `sets` / `bodyMeasurements` at query time.
- No invented weighting — indirect muscle involvement is never converted
  to a fixed fraction of a set (see FITNESS_DOMAIN.md). If a future
  version wants a weighted "effective volume" score, that is a new,
  explicitly-named metric with a documented formula, not a silent change
  to how direct/indirect sets are counted.
- Warm-up sets are excluded from every metric above unless a metric says
  otherwise explicitly.
- Any formula with more than one reasonable convention (e.g. which 1RM
  estimation formula, how a "week" boundary is defined) is decided and
  written down here, with its rationale, before or alongside
  implementation — not left implicit in code.
