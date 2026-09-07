# Product

Forta is a local-first strength training tracker. Version 1 covers gym-based
strength training exclusively. It is not a general fitness or multi-sport app.

## Who it's for

Someone who trains in a gym and wants to log what they actually did, after
they did it, and later understand their history, workload, and progress
without manual spreadsheets.

## Logging model

Training is logged **after the fact**, not tracked live. There is no active
session, no rest timer, and no in-workout state. A user opens the app, picks
or confirms a date, and records what happened: exercises, sets, weight, reps,
and optional effort metrics (RIR/RPE).

## Core capabilities (v1)

- Log a completed workout: exercises performed, sets, weight, reps.
- Create routines (templates) and reuse them when logging a workout.
- Browse workout history and view the detail of any past session.
- View statistics for a period (daily, weekly, monthly, custom).
- View statistics for a specific exercise.
- View statistics for a specific muscle group.
- View general training progress.
- View progress for a specific exercise.
- View progress for a specific muscle group.
- Record body weight over time.
- Optionally record body measurements (waist, chest, limbs, etc.).
- Import and export all data as a portable, versioned file. Importing a
  backup **restores** it — it replaces the data currently on the device,
  it does not merge the two. Exporting regularly is the way to move data
  between devices or recover from a lost/reset one, since there's no
  cloud sync.

## Explicitly out of scope for v1

- Live/active workout tracking or a rest timer.
- Notifications or reminders.
- Any backend, account system, or authentication.
- Cloud sync across devices.
- Sports or training modalities other than gym strength training (e.g.
  running, cycling, sport-specific tracking).

These may become future stages, but no part of v1 should assume they exist.

## Product vs. domain vs. analytics

This document describes *what the product does and lets the user do*. It
does not define fitness formulas or calculations (see
[FITNESS_DOMAIN.md](FITNESS_DOMAIN.md) and [ANALYTICS.md](ANALYTICS.md)), and
it does not define how data is stored (see [DATA_MODEL.md](DATA_MODEL.md)).
