# Notention vs MB SystemNotes

Checked notention9 (core/src/skills, core/src/templates, README2 §2.4).

## What Notention actually has

| Mechanism | What it is | Runs? |
|-----------|------------|-------|
| **Templates** (`core/src/templates/templates.ts`) | UI starter content: Job Request, Freelance Offer, Marketplace Listing, Daily Journal, Bug Report. Pre-filled properties and tags. | No. Copied into the editor. |
| **Skills** (`core/src/skills/`) | Code-based translators. Match property patterns (`PropertyPattern`), then export a Note to browser/API actions or import external data as Notes. Examples: Indeed, Craigslist, GitHub, Reminder. | Yes. They execute. |
| **Spec claim (README2 §2.4)** | Skills described as signed, versioned ontology modules (classes, property schemas, UI hints, transition rules, matching heuristics). | Implementation is still code, not signed Notes. |

There is no Notention type called SystemNote.

## MB SystemNote (as defined in the seed and mb.core)

- Signed, reusable description of a reply path or constraint set.
- Peers (or the local user) copy from it.
- **It does not run.**
- Used for: Situation skeletons, Agreement term templates, New Rules, always-on self-monitoring constraints, habit windows.

## What is compatible and worth adopting

- **Template pattern** — Notention’s simple starter objects (label + pre-filled properties) are a good seed for MB SystemNotes. Adopt the idea of a small library of copyable skeletons.
- **PropertyPattern matching** — Skills decide whether they apply by checking required/optional property keys. The same idea works for always-on SystemNotes: a New Rule or habit SystemNote matches against a Situation’s properties at compose time and match time.
- **Untrusted-until-trusted** — Spec says skills must be treated as untrusted data unless explicitly trusted. Same rule fits SystemNotes that arrive from the network. Local New Rules are trusted by default; received ones require explicit trust.

## What is incompatible

- **Executable skills vs non-running SystemNotes.** Notention skills export actions and import data; they are translators that run. MB SystemNotes are explicitly non-executing templates and constraints. Do not fold skill execution into SystemNote. Keep any future external-action layer separate (and optional).
- **Code-based vs Note-based.** Current Notention skills are TypeScript classes. MB SystemNotes must be ordinary signed Notes so they can be published, replaced, and cited. Do not require a code deployment to add a New Rule or a habit template.
- **No always-on self-monitoring in Notention.** Baseline goals, negative-self-talk mirrors, never-again blacklists, and price ceilings are MB additions. Notention has no equivalent background constraint that applies to every Situation the author creates.

## Recommendation for mb.core

1. Keep SystemNote as a non-running, copyable, signed Note (or local Profile-level object).
2. Borrow Notention’s template style for the initial library (ride, plumber, grocery, daily walk, price ceiling, never-again locus).
3. Borrow PropertyPattern-style matching so always-on SystemNotes can be consulted automatically.
4. Do not adopt Notention skill execution into the SystemNote path.
5. Treat network-received SystemNotes as untrusted until the user explicitly trusts them.
