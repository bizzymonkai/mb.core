# MB core is the engine

MB.core is a modified Notention core. It is autonomous. It does not call Notention as a service, an API, or a remote package at runtime.

Linking `@notention/core` is only a temporary way to interlink source while testing. It is not the architecture.

## What this is not

- Not a wrapper that imports `@notention/core` and forwards calls.
- Not a parasite that requires Notention to be installed or running.
- Not a webservice client.
- MatchEngine, OntologyService, Note constructors, storage, and signing live here. Callers use MB.core.

## What this is

A fork-by-import:

1. Copy the Notention core source into this repo once.
2. MB modifications (Situation class, constructors, SystemNote, Tracker, Trigger) live beside and on top of that source.
3. An updater can re-import upstream files when we choose, so we can absorb later Notention work without living on their package.

## Layout

```
core/
  vendor/notention/          imported source from notention9/core/src
  src/
    ontology/mb.domains.ts   MB classes (Situation, Offer, …)
    engine.ts                constructs OntologyService + MatchEngine from local source
    primitives.ts            Situation/Offer/Agreement → Note
    systemNote.ts
    tracker.ts
    trigger.ts
  scripts/
    import-notention.ts      one-shot / updater: pull core/src from upstream into vendor/
```

At runtime everything resolves inside this repo. No `import from '@notention/core'`.

## Updater

`scripts/import-notention.ts` (or a shell equivalent):

- Reads a pinned commit or the default branch of autonull/notention9.
- Copies `core/src/**` into `core/vendor/notention/`.
- Does not overwrite `core/src/` (MB modifications).
- Records the imported commit in `core/vendor/IMPORTED.md`.

Run it when we want to absorb upstream changes. Not on every build. Not as a dependency.

## Call path

```
UI / simulator
    → mb.core (engine.ts, primitives)
        → local MatchEngine, OntologyService, Note, storage
            (source that originated in Notention, now owned here)
```

There is no Notention process to call.

## Order

1. Run the importer once; commit `vendor/notention/`.
2. Point `engine.ts` at the local vendor source.
3. Add primitive constructors that emit Notes using the local types.
4. Drop the GitHub package dependency once the import is verified.
