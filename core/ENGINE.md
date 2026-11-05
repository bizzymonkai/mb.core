# Wrapping the Notention engine

`core/src/` currently holds the MB ontology overlay only. The engine is `@notention/core`. Do not reimplement it.

## Already present

- `src/ontology/mb.domains.ts` — 12 primitives as `OntologyNode`s
- `src/ontology/index.ts` — `composeOntology(host)`
- `package.json` — `notention9` from GitHub

## Link the package (blocker)

notention9 is a monorepo. The import name is `@notention/core` (`core/`). A root GitHub dependency does not expose that name.

Practical options:

1. Clone notention9 beside mb.core and add a file dependency or workspace entry pointing at `notention9/core`.
2. Or publish/link `@notention/core` and depend on that.

Until this is done, `import { … } from '@notention/core'` will not resolve.

## What the wrapper must call (do not rewrite)

| Concern | Notention export | MB use |
|---------|------------------|--------|
| Classes | `OntologyService`, `DEFAULT_ONTOLOGY` | `createCustom(composeOntology(DEFAULT_ONTOLOGY))` |
| Notes | `Note`, `Property`, notes helpers | Situation/Offer/etc. are Notes with a class id |
| Extraction | extraction pipeline / property extractor | Situation detector text → properties |
| Matching | `MatchEngine`, `MatchingService`, `PropertyIndex` | Situation constraints vs Offer facts |
| Storage | storage adapters | local-first Note store |
| Signing / id | protocol helpers (CBOR, NoteID, sign/verify) | publish and cite |

## Thin MB files still needed

```
src/engine.ts            construct OntologyService + MatchEngine once
src/primitives.ts        Situation/Offer/Agreement constructors → Note
src/systemNote.ts        SystemNote as a Note that does not run
src/tracker.ts           Tracker cites a SystemNote; observes
src/trigger.ts           Trigger cites a Tracker; acts via ordinary primitives
```

Each constructor sets `types` / class id from `mb.domains.ts` and properties in Notention’s `Property` shape. Matching and storage stay in Notention.

## Not in the wrapper

- MatchEngine internals
- Property parser / operators
- CBOR / signing
- Transport
- Simulator scenarios (those stay in `simulator/` and call the engine)

## Order

1. Link `@notention/core`.
2. `engine.ts` — one OntologyService, one MatchEngine.
3. Primitive constructors.
4. SystemNote, then Tracker and Trigger on top.
5. Point the Situation detector and Monitor at those constructors.
