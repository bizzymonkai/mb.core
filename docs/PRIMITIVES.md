# MB Interaction Primitives (application ontology seed)

See the canonical seed for full field cards, reply-graph rules, and conformance hints.

Twelve interaction primitives. Three referent objects. One template object (SystemNote).

| # | Primitive | Match role | Notes |
|---|-----------|------------|-------|
| 1 | Request | constraint root | `target=network` (situation) or `target=identity` |
| 2 | Offer | fact root | `role=listing` or `role=counter` (counter only after an Offer) |
| 3 | Conversation | channel | membership via signed joins |
| 4 | Message | channel atom | may attach any primitive; `intent=endorsement_request` reserved |
| 5 | Agreement | attestation | aim of negotiation, not a gate |
| 6 | Engagement | transition | phase is a cache |
| 7 | Event | schedule | `kind=meeting` for point-to-point |
| 8 | Invoice | value request | estimate is first instance; later instances name predecessor |
| 9 | Payment | settlement ref | always accepted; association best-effort |
| 10 | Receipt | private attestation | default private |
| 11 | Endorsement | indexable attestation | optional; not a global score |
| 12 | Dispute | governance | any subject |

Referents: Peer, Profile, Relationship (private by default).

SystemNote = reusable reply-path template. It does not run.
