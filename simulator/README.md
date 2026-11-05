# mb.core / simulator

Modification of the Notention simulator, refactored for MonkeyBusiness.

## Purpose

Invent and run hypothetical business interactions using the MB primitive set.

- Spawn agents that publish Requests (situations), Offers, counter-offers, Agreements, Engagements, Invoices, Payments, private Receipts, optional Endorsements, and Disputes.
- Observe matching scores, reply graphs, phase transitions, and settlement references.
- Support both scripted scenarios (plumber, ride-share, grocery) and generative / invented situations.
- Local-only first; optional Nostr later.

## Adaptation notes

- Keep Notention’s multi-agent loop, dashboard, and recording patterns where useful.
- Replace generic Note templates with MB primitive constructors and SystemNotes.
- Focus evaluation on the reply-graph rules and matching behavior defined in the MB Interaction Primitives seed.
- Movie / recording output is optional; the primary value is invented interaction traces and match explanations.

## Planned entry points

- CLI: run a named scenario or generate N random business interactions.
- Simple dashboard: agent state + primitive timeline + match log.
