# mb.core

MonkeyBusiness network primitive core engine prototype.

Absorbs the sophisticated under-the-hood of [notention9](https://github.com/autonull/notention9) (semantic matching, Note model, local-first store, NetworkGate/Nostr, ontology engine) while exposing a thin, fixed application ontology of **MonkeyBusiness interaction primitives** for a viable MonkeyPanel UX.

## Strategy

- Do not rewrite Notention’s matching physics, property system, or transport layers.
- Map the 12 MB primitives (Request, Offer, Conversation, Message, Agreement, Engagement, Event, Invoice, Payment, Receipt, Endorsement, Dispute) + referents (Peer, Profile, Relationship) + SystemNote templates onto Notention Notes.
- Local-first first; Nostr path second.
- Agreement is an aim, not a gate. Payments are always accepted. Reputation is optional Endorsements, not a score.

## Layout

```
core/          thin MB primitive layer + SystemNote templates on top of @notention/core
simulator/     MB-adapted multi-agent simulator that invents hypothetical business interactions
ui/            future MonkeyPanel shell (progressive disclosure, business surfaces)
```

## Status

Baseline established. Next: vendor or depend on current notention9 `@notention/core`, implement primitive constructors, seed SystemNotes, and stand up a local matching demo.
