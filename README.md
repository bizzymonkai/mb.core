# mb.core

MonkeyBusiness network primitive core. The specification.

Absorbs the under-the-hood of [notention9](https://github.com/autonull/notention9) as the semantic engine: MatchEngine, Note model, local-first store, ontology. Vendored at [core/vendor/notention](core/vendor/notention) from commit `b0f49fe`. MB does not call Notention as a service. Files in [docs/](docs/) are retired archives.

## MB Network | an open business protocol

- Peer-to-peer commerce that establishes a free market without a platform in the middle, a circular economy of reuse and direct exchange, financial sovereignty, and data sovereignty.
- Twelve interaction primitives are the only verbs. A ride, a repair, a rental, a shared tool, and a direct sale are the same Situation and Offer. No product system, auction system, or media system stands between peers.
- Disintermediation is the design. Any peer publishes. Any peer matches. No sole indexer, no platform score, no fee gate, no account server.
- Identity, keygen, groups, subscriptions, encryption, and transport are Nostr. Content addressing is Kubo. No new cryptography.
- Matching is local. A Situation is a constraint. An Offer is a fact. Relative sort.

---

## Primitives

Twelve verbs. Referent nouns are cited, not executed. One template object: SystemNote.

| # | Primitive | Role |
|---|-----------|------|
| 1 | Situation | Constraint root. Default surface. `target=network` or `target=identity`. |
| 2 | Offer | Fact root. `role=listing` or `role=counter`. |
| 3 | Conversation | Channel. Membership by signed joins. Linked to a Situation. |
| 4 | Message | Channel atom. May attach any primitive. |
| 5 | Agreement | Attestation. Aim of negotiation, not a gate. |
| 6 | Engagement | Phase cache of the reply graph. Not a screen. |
| 7 | Event | Schedule. Meeting, habit-window, deadline. |
| 8 | Invoice | Value request. Estimate is the first instance. |
| 9 | Payment | Settlement reference. Always accepted. |
| 10 | Receipt | Private attestation. |
| 11 | Endorsement | Optional attestation. Not a global score. |
| 12 | Dispute | Governance. Any subject. |

Constructors in [core/src/primitives.ts](core/src/primitives.ts). Class id is a tag `class:<id>` and a property `class is <id>`.

Negotiation is a sequence of Offers and Messages aiming at an Agreement. Parties may skip Agreement and still create Engagement, Invoice, or Payment. A template is a starter, not a class. A Notention scenario is a simulator script, not a Situation.

Do not add: separate engines per domain, required class hierarchies, negotiation as a primitive, deterministic create-list-bid-settle paths.

## Identity and transport

Nostr for identity, keygen, accounts, groups, subscriptions, encryption, transport. Kubo for content addressing.

| Need | Binding |
|------|---------|
| Key | `nsec` / `npub` (NIP-19). Generate, import, export. |
| Encrypt | NIP-44. |
| Wrap key | `ncryptsec` (NIP-49). |
| Profile | Kind 0. |
| Follow | Kind 3. |
| Delete | Kind 5. |
| Relay list | Kind 10002. |
| Groups | NIP-29. Requires a binary relay. |
| Content | Kubo CID. |

No BIP32 tree. No group-key rotation. No custom resolver. A Place is a followable semantic tag, not a key. what3words is one exact tag: `what3words:word1.word2.word3`.

## Situations

The default surface. The detector gathers text, voice, camera, location, mood, and recent activity into one Situation. The peer edits it as a note, a graph, or JSON, then keeps it private or publishes it.

Doing Mode is the "currently doing" filter on the Monitor. Many Situations run at once. A habit is a Situation with a recurrence, or an Event linked to one. Network intent appears only when the peer publishes.

## SystemNotes, Trackers, Triggers

| Object | What | Runs |
|--------|------|------|
| SystemNote | Signed definition: rule, goal, constraint, template. | Never. |
| Tracker | Active monitor. Cites a SystemNote. | Yes, on cadence. |
| Trigger | Action when a condition is met. Cites a Tracker. | Yes, when true. |

A New Rule ("never pay more than 20 for lunch") becomes a SystemNote. Consulted, not executed. Network-received SystemNotes are untrusted until the peer trusts them.

## Matching

Local. Situation constraints against Offer facts. Relative sort. The engine is the vendored Notention MatchEngine. what3words matches exact or not at all.

## Node

One process. Three modules. Account is always available. Data and Relay toggle alone.

| Module | Is |
|--------|----|
| node/account | Nostr keys. Generate, import, export, sign, encrypt. |
| node/data | Kubo. Fetches the pinned binary on install. Init, add, pin, fetch. |
| node/relay | In-process NIP-01 relay. Publish, query. |

Each module diagnoses itself on boot. `npm run status` serves the checklist at `http://127.0.0.1:8787/status`. `npm run diagnose` prints the module reports.

## Assets

A file added to an account becomes a signed media object. Encrypted to the owner key. Pinned on Kubo. Available on every device that holds the key. On update, sync begins.

## Actions

Every thing a peer does. The UI is these verbs. One row per action in [node/checklist.ts](node/checklist.ts). `npm run checklist` runs the covered ones and records the pending ones.

| Module | Actions |
|--------|---------|
| node | boot, read diagnosis |
| node/data | start, stop |
| node/relay | start, stop |
| node/account | session, generate, import, export, switch, profile, relay list |
| situation | detect, edit, private, monitor, Doing Mode, habit |
| network | publish, follow, Place, what3words, groups, view others |
| exchange | offer, counter, agreement, engagement, invoice, payment, receipt, endorsement, dispute |
| conversation | open, join, leave, message |
| rules | SystemNote, tracker, trigger, template |
| assets | list, drop, encrypt, pin, fetch, update |

## UI

Five in the nav: Detector, Monitor, Map, Assets, Profile. Engagement is a phase badge in the top bar, never a screen.

| Screen | Reached from |
|--------|--------------|
| Detector | nav. Home. |
| Monitor | nav. Cards, Doing toggle, Rules. |
| Map | nav. Pins. Tap opens the Situation. |
| Assets | nav. File list. |
| Profile | nav. Keys, Relays, Status, Data, Relay, Settings. |
| Situation | a card or a pin. |
| Thread | a Situation. |
| Group | a Thread. |
| Offer, Agreement, Invoice, Payment | a Situation or an Offer. |
| Rules, Tracker, Trigger | Monitor. |

The PWA is [ui/pwa/index.html](ui/pwa/index.html). No build step.

## TODO

| Open | Why |
|------|-----|
| Situation → NIP-01 filter | A Situation does not yet build the `REQ`. |
| Application kind table | The twelve primitives have no Nostr kinds. |
| Asset index event | No addressable event lists a key's assets. |
| NIP-29 groups | The in-process relay is NIP-01. |
| SystemNotes as addressable events | Not yet kinds 30000–39999. |
| Live follow | Kind 3 is signed. No `REQ` for followed keys. |

Not a gap: no BIP32 tree, no group-key rotation, no custom resolver.
