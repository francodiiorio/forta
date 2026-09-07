# Project

Local-first fitness and workout tracking web application.

## Stack

* React
* TypeScript
* Vite
* IndexedDB
* Vitest

No backend.

## Architecture

UI must not contain business or analytics logic.

* product behavior → docs/PRODUCT.md
* architecture → docs/ARCHITECTURE.md
* data model → docs/DATA_MODEL.md
* fitness rules → docs/FITNESS_DOMAIN.md
* statistics → docs/ANALYTICS.md
* planned work → docs/ROADMAP.md
* technical decisions → docs/DECISIONS.md
* testing → docs/QA.md

## Rules

* Keep domain logic framework-independent.
* Keep analytics framework-independent.
* Persist through the repository layer only.
* All exported data must be versioned.
* Domain and analytics behavior require tests.
* Do not silently change documented behavior.
* Update relevant documentation when behavior changes.

## Environment

* Use the Node version pinned in `.nvmrc` (see docs/DECISIONS.md D-006).
