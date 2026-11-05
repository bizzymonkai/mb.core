# Class extensions without systems

No product system, auction system, event system, or media system.
Those are ontology nodes and properties on the existing primitives.

## Two layers

| Layer | What it is | Examples |
|-------|------------|----------|
| Interaction primitives | Verbs. The only things that match, sign, settle. | Situation, Offer, Conversation, Message, Agreement, Engagement, Event, Invoice, Payment, Receipt, Endorsement, Dispute |
| Referents | Nouns. Notes with a class. Pointed at by primitives. | Peer, Place, Thing |

Referents do not run. They are cited.

## Referent kinds

One Peer class. Kind is a property.

| Kind | Meaning | Membership |
|------|---------|------------|
| person | A human peer | none |
| company | A peer that can act and be acted on | Relationships to persons |
| group | A peer whose membership is the set of signed joins | Relationships or Conversation joins |

Person and Company are not different data models. A Company is a Peer with `kind=company` and member Relationships. A Group is a Peer with `kind=group` and membership.

| Referent | Kinds (property, not enforced) |
|----------|-------------------------------|
| Place | store, restaurant, gym, park, address |
| Thing | product, service, media, listing-subject |

A store is a Place. A restaurant is a Place. A gym is a Place. The company that runs it is a Peer of kind company, linked by a property.

## Offer kinds, not Offer systems

Auction and rental are Offers with extra properties. They are not subclasses that force a workflow.

| Offer kind | Extra properties | Still an Offer |
|------------|------------------|----------------|
| listing | price, locus | yes |
| auction | endsAt, minBid, increment | yes |
| rental | availableDuring, deposit | yes |
| service | rate, duration | yes |

Matching stays the same: Situation constraints against Offer facts. An auction Offer simply has more facts.

## Groups across primitives

Same primitives. Membership is a property or a set of signed joins.

| Use | Primitive | How group appears |
|-----|-----------|-------------------|
| Group chat | Conversation | membership via signed joins; may cite a Group peer |
| Group payment | Payment | cites multiple Peers, or one Group peer |
| Group contract | Agreement | cites multiple Peers, or one Group peer |
| Group situation | Situation | target=identity pointing at a Group, or a Conversation of members |

No group-chat system. No group-payment system.

## Negotiation is not a primitive

Negotiation is a sequence of Offers (`role=counter`) and Messages, aiming at an Agreement.
The state is the reply graph. Engagement.phase is a cache of that graph, not a workflow step.

Agreement is the attestation. It is the aim, not a gate the engine enforces.

## Workflows

A workflow is a SystemNote template that suggests properties and a reply path.
It does not run. It does not sequence the network.
Creating an auction is: start from an Offer template that includes `kind=auction`, `endsAt`, `minBid`.
The user can drop any of those. The engine does not refuse.

## What not to add

- Separate engines per domain.
- Required class hierarchies.
- Negotiation as its own primitive.
- Deterministic system sequences (create product → list → bid → settle) as code paths.

## What to add when needed

- Ontology nodes under Peer, Place, Thing with optional attributes.
- Offer/Situation attributes for a kind (`kind`, `endsAt`, `availableDuring`).
- SystemNote templates that prefill those attributes.
- Aliases so `store`, `shop`, `restaurant` resolve to Place.
