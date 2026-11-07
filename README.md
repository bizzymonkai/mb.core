# mb.core

MonkeyBusiness network primitive core. Autonomous engine for MonkeyPanel.

Absorbs the under-the-hood of [notention9](https://github.com/autonull/notention9) (semantic matching, Note model, local-first store, NetworkGate/Nostr, ontology engine). Exposes a thin, fixed application ontology of interaction primitives. Does not call Notention as a service, API, or runtime package.

This file is the specification. Files in [docs/](docs/) are retired archives. Do not update them.


## MB Network | an open business protocol

- A protocol for a global free-market order. Twelve interaction primitives (Situation, Offer, Conversation, Message, Agreement, Engagement, Event, Invoice, Payment, Receipt, Endorsement, Dispute) are the only verbs. A ride, a repair, a rental, a shared tool, and a direct sale are the same Situation and Offer. No product system, auction system, or media system stands between peers
- Peer-to-peer commerce that establishes a free market without a platform in the middle, a circular economy of reuse and direct exchange, financial sovereignty, and data sovereignty
- Disintermediation is the design. Any peer publishes. Any peer matches. No sole indexer, no platform score, no fee gate, no account server, no central ban. Payment is a signed event, always accepted. Agreement is an aim, not a gate
- Identity, keygen, groups, subscriptions, encryption, and transport are Nostr (NIP-01, NIP-19, NIP-29, NIP-44). Content addressing is Kubo. A node creates a Nostr relay and an IPFS node; each toggles alone. Generate, import, and export of `nsec` are first-class. No new cryptography
- Matching is local. A Situation is a constraint; an Offer is a fact. Relative sort. The engine absorbs Notention's MatchEngine. Primitive constructors, match tests, and the MonkeyPanel surface are in place
- Financial sovereignty: no custody, no platform balance, Payment cites the rail the peers choose. Data sovereignty: the `nsec` is the account, the device holds the files, Kubo holds the blobs, the graph is not owned

---

## Strategy

- Do not rewrite Notention’s matching physics, property system, or transport.
- Map MB primitives onto Notention Notes. Class id is a tag `class:<id>` and a property `class is <id>`.
- Local-first first. A Nostr relay and an IPFS node are bound services of the MB node. Mesh later.
- No new cryptography. Identity, keygen, accounts, groups, subscriptions, encryption, and transport are Nostr. Content addressing is IPFS. MB does not define a key scheme.
- Agreement is an aim, not a gate. Payments are always accepted. Reputation is optional Endorsements, not a score.
- No product system, auction system, event system, media system, or social system. Those are properties and views. Assets are signed objects and a file view, not a media system.
- No account server. No sole indexer. No global trending rank. No central ban policy.
- Workflows are SystemNote templates. They suggest properties. They do not run and do not sequence the network.

## /dir/

| Path | What it is |
|------|------------|
| [core/](core/) | Engine. Vendored Notention source plus MB ontology, constructors, and match tests. |
| [core/src/](core/src/) | MB layer: `engine.ts`, `primitives.ts`, `ontology/mb.domains.ts`. |
| [core/vendor/notention/](core/vendor/notention/) | Owned copy of notention9 `core/src`. Runtime resolves here. |
| [core/scripts/import-notention.sh](core/scripts/import-notention.sh) | Updater. Re-imports upstream when chosen. Not a build step. |
| [core/vendor/IMPORTED.md](core/vendor/IMPORTED.md) | Pinned upstream commit. |
| [docs/](docs/) | Retired archives of the notes this README absorbed. Do not update. |
| [simulator/](simulator/) | Hypothetical business interactions. Notention multi-agent loop, MB primitives. |
| [node/](node/) | MB node. Three modules: Data (Kubo), Account (Nostr keys), Relay (Nostr relay). |
| [ui/](ui/) | Static MonkeyPanel prototypes. HTML/CSS/JS. No npm build. Assets surface is a package-manager file list. |
| [ui/DEPLOY.md](ui/DEPLOY.md) | Droplet deploy notes. |

---

## Primitives

Twelve interaction primitives (verbs). Referent nouns are cited, not executed. One template object: SystemNote.

| # | Primitive | Match role | Rule |
|---|-----------|------------|------|
| 1 | Situation | constraint root | Default surface. `target=network` discoverable; `target=identity` directed. Formerly Request. |
| 2 | Offer | fact root | `role=listing` or `role=counter`. Counter only after an Offer. |
| 3 | Conversation | channel | Membership via signed joins. Linked to Situations. Not a free-floating inbox. |
| 4 | Message | channel atom | May attach any primitive. `intent=endorsement_request` reserved. |
| 5 | Agreement | attestation | Aim of negotiation, not a gate. |
| 6 | Engagement | transition | Phase is a cache of the reply graph. |
| 7 | Event | schedule | `kind=meeting` for point-to-point. Also habit-window, deadline. |
| 8 | Invoice | value request | Estimate is the first instance. Later instances name the predecessor. |
| 9 | Payment | settlement ref | Always accepted. Association is best-effort. |
| 10 | Receipt | private attestation | Default private. |
| 11 | Endorsement | indexable attestation | Optional. Not a global score. |
| 12 | Dispute | governance | Any subject. |

Early referent names (Peer, Profile, Relationship) still apply. Profile facts and Relationships are private by default. Later identity work refines Peer into the key tree below. Place is not a key.

Constructors live in [core/src/primitives.ts](core/src/primitives.ts). `classOf(note)` reads the class back off a Note.

### Two layers

| Layer | Role | Examples |
|-------|------|----------|
| Primitives | Verbs. The only things that match, sign, settle. | The twelve above |
| Referents | Nouns. Notes with a class, cited by primitives. | Peer, Place, Thing |

### Offer kinds, not systems

Auction, rental, listing, and service are Offers with extra properties. The engine does not refuse a Note that drops any of them.

| Kind | Extra properties |
|------|------------------|
| listing | price, locus |
| auction | endsAt, minBid, increment |
| rental | availableDuring, deposit |
| service | rate, duration |

Matching is unchanged: Situation constraints against Offer facts.

### Groups across primitives

Same primitives. Membership is a property or a set of signed joins.

| Use | How |
|-----|-----|
| Group chat | Conversation with signed joins; may cite a Group |
| Group payment | Payment citing several Peers, or one Group |
| Group contract | Agreement citing several Peers, or one Group |
| Group situation | `target=identity` at a Group, or a Conversation of members |

### Negotiation is not a primitive

Negotiation is a sequence of Offers (`role=counter`) and Messages, aiming at an Agreement. State is the reply graph. `Engagement.phase` is a cache, not a workflow step.

| Step | Maps to |
|------|---------|
| Listing | Offer `role=listing` |
| Counter | Offer `role=counter`, `inReplyTo` prior Offer |
| Conditional acceptance | Message or Offer property (“accept if price ≤ X”) |
| Final terms | Agreement (parties, terms, signatures) |
| Reusable terms | Agreement citing a SystemNote; later Engagements cite the Agreement |

Parties may skip Agreement and still create Engagement, Invoice, or Payment.

### Classes, templates, scenarios

| Concept | What it is | Is a class? |
|---------|------------|-------------|
| Situation, Offer, Agreement, … | OntologyNodes. Fixed application ontology. | Yes |
| Template (“daily walk”, “price ceiling”) | Copyable starter. Notention `templates.ts` pattern. | No |
| SystemNote | Durable definition. May cite a class and hold a template. | No (definition object) |
| Tracker, Trigger | Application roles that cite SystemNotes. | No |
| Notention scenario | Simulator script: agents, timed events. | No |
| MB Situation | Live object a peer creates. Signed Note. | Yes, the class |

A scenario can generate Situations. It is not a Situation. Do not rename Situation to Scenario. Do not treat templates as classes.

Notention ontology files (vendored): `ontology/domains.ts` (definition), `ontology.default.ts`, `ontologyCore.ts` (lookup), `schema.ts` (JSON Schema for extraction), `domains.facets.ts`. MB classes live in `core/src/ontology/mb.domains.ts` and merge via `composeOntology`.

### What not to add

Separate engines per domain. Required class hierarchies. Negotiation as its own primitive. Deterministic create → list → bid → settle code paths.

Add, when needed: optional attributes on Peer, Place, Thing; `kind` on Offer/Situation; SystemNote starters; aliases so `store`, `shop`, `restaurant` resolve to Place.

---

## Identity, keys, and transport

No new cryptography. One developer does not ship a key scheme.

Identity, keygen, accounts, groups, subscriptions, encryption, and event transport are [Nostr](https://github.com/nostr-protocol/nips). Content addressing is IPFS (Kubo). MB maps primitives onto Nostr events. It does not define a signature, a curve, a KDF, or a group key.

### Bindings

| Piece | Binding |
|-------|---------|
| Identity | One secp256k1 keypair. Public key `npub`. Secret `nsec`. NIP-01, NIP-19. |
| Keygen | A Nostr library (`nostr-tools` or equivalent) `generateSecretKey`. Not a seed tree. |
| Account | Another keypair the person holds, or a NIP-46 remote signer. Not a child key. |
| Follow | NIP-02 kind 3 contact list, plus a live NIP-01 `REQ`. |
| Subscription | A NIP-01 filter: `authors`, `kinds`, `#e`, `#p`, `#t`, `since`, `until`. |
| Group | NIP-29 relay-based group. The bound relay enforces it. |
| Encryption | NIP-44. Not NIP-04. |
| Username | Kind 0 `name`, optionally NIP-05 `name@domain`. |
| Delete | NIP-09. Display hides. Relays may keep the event. |
| Expiry | NIP-40 `expiration` tag. |
| Wire format | NIP-01 event. `id` is sha256 of the serialized event. `sig` is BIP-340 Schnorr. |

NIP-06 (mnemonic derivation) is listed unrecommended by the NIPs index. Do not use it. Restore is paste the `nsec`, or a NIP-46 bunker that already holds it.

### Dropped

Earlier drafts specified these. They are out. Each one was a cryptographic system this project will not write.

| Dropped | Replaced by |
|---------|-------------|
| BIP39 seed and BIP32 master key | One `nsec` from a Nostr library |
| Account, person, company as child keys | A separate keypair, or a NIP-46 signer. Person and company are kind 0 labels. |
| Group key that rotates on every membership change | NIP-29 membership list on the relay |
| Custom namespace resolver and 14-day name claim | Kind 0 name, optional NIP-05. A collision is a display problem. |
| Custom signature, hash, and relay wire format | NIP-01 |
| Custom asset key wrap | NIP-44 to the owner pubkey |

### Identity

An identity is an `npub`. The `nsec` signs events and decrypts NIP-44 payloads. Whoever holds the `nsec` is that identity.

Keygen, import, and export are library calls. MB does not implement the key math.

| Action | Does |
|--------|------|
| Generate | Call the Nostr library. New `nsec` and `npub`. Shown once. Person confirms they stored it. |
| Import | Paste an `nsec` or `ncryptsec` (NIP-49). Library validates. Replaces nothing until the person confirms. |
| Export | Show the `nsec`, or write an `ncryptsec` encrypted with a passphrase they type. Explicit. Never automatic. |

The `nsec` is shown once on generate and once on export. It is not logged. It is not sent to a relay.

Multi-device: the same `nsec` on each device (export, then import), or one device holds it and the others request signatures over NIP-46. There is no seed that restores a tree.

### Accounts

An account is a second keypair, created with the same library call, or a NIP-46 bunker the person already has. MB stores the `nsec` locally or stores the bunker connection. It does not derive the account from the identity.

Following an identity does not follow its accounts. The person adds those pubkeys to the kind 3 list if they want that.

Person and company are labels on a keypair (kind 0 `name`, `about`). They are not derived keys. A Place is not a key. It is a `t` tag.

### Follow and subscribe

| Follow | Filter |
|--------|--------|
| Key | `authors: [pubkey]` |
| Topic, Place, class | `#t: [tag]` |
| what3words | one `#t`: `what3words:word1.word2.word3` |
| Group | NIP-29 `h` tag, on the relay that hosts the group |

A follow is a kind 3 entry. A subscription is the `REQ` that filter opens. They are not platform edges.

### what3words

[what3words](https://what3words.com/) is a proprietary geocode. The earth is split into about 57 trillion squares of about 3 metres. Each square has one three-word address, written `///word.word.word`. English uses a list of about 40,000 words. Other languages use their own lists of about 25,000. The same square is a different, unrelated triple in each language. Neighboring squares do not share words. MB does not reimplement the mapping and does not turn a triple into coordinates.

All three words have to be present. They are one tag, not three.

`what3words=word1.word2.word3`

| Rule | Why |
|------|-----|
| One property, one follow tag `what3words:word1.word2.word3` | A single word is reused on many squares. It is not a place. |
| Normalize: strip `///`, lowercase, dots or spaces, exactly three words | `///Filled.Count.Soap` and `filled count soap` are the same square. |
| Exact equality of the whole string. Order matters. | `filled.count.soap` is not `filled.count.shark`. |
| Do not use the string matcher | Fuzzy and substring would score a typo or one shared word. Those are different squares, often far apart. |
| No conceptual adjacency inside the triple | `bar` / `pub` does not apply to these words. |
| No cross-language alias | Another language's words for the same square are a different address. |
| `near` stays on `locus` | Radius needs coordinates. Word similarity cannot find the next square. |

A what3words tag is a topic filter, same as any other `t` tag. Following it is a `REQ` for events that carry that one tag. It may sit on a Situation or an Offer. Invalid input (not exactly three words) is not stored.

### Known

Known is not a set of derived identities. It is kind 0 names and NIP-05 identifiers the client has already seen, plus Place tags.

| Kind | What it is |
|------|------------|
| Kind 0 | `name`, `about`, `picture` for an `npub`. Replaceable. |
| NIP-05 | Optional `name@domain` checked against that domain. DNS, not an MB resolver. |
| Place tag | A `t` tag. Shared by use, not by a key. |

White pages are the client's cache of kind 0 and Place tags. There is no MB resolver service.

### Groups

NIP-29. A group is an id string plus the relay that enforces rules for that id. The bound relay is that relay for groups created on this node.

- Metadata, admins, and members are addressable events signed by the relay (kinds 39000–39003).
- User events carry an `h` tag with the group id.
- Private means the relay requires AUTH to read. Closed means join is approved. MB does not add a group encryption key.
- A group does not move to another relay unless that relay also hosts the id. That limit is the NIP. Accept it.
- Permissions are the relay's NIP-29 policy. Do not add a second permission system, and do not extend group roles to other events.

Group chat is a Conversation whose events carry `h`. Group payment and group contract cite the member pubkeys from the relay's member list. They do not cite a group key.

### Publish

An MB primitive is a Nostr event signed by the author's `nsec`. Class is a tag `class:<id>` and a field in the content JSON.

| Primitive | Kind | Notes |
|-----------|------|-------|
| Situation, Offer, Message, Agreement, Engagement, Event, Invoice, Payment, Receipt, Endorsement, Dispute | An application kind, or kind 1 with a `class` tag | A kind is a label. It is not new crypto. Pick existing NIP kinds when one fits. |
| Conversation in a group | Any content kind plus `h` | NIP-29 |
| Direct message | NIP-17 if the library has it, else a NIP-44 payload | Not NIP-04 |
| Asset index | Addressable event citing the IPFS CID | Ciphertext is NIP-44 to the owner pubkey |

Exact kind numbers can wait. One table, once, when the first event is sent.

### Fetch then match

1. Build a NIP-01 filter from the Situation (`authors`, `kinds`, `#t` for class, locus, topic, `since`). Feed filters and Tracker filters are separate.
2. `REQ` the bound relay, and any other relay the person listed.
3. Run MatchEngine locally on the events that came back.
4. Sort relatively.

Every filter is a reason to run the matcher under that filter's rules. A broad Situation is a game: it can match; blank spam is ignored. Empty is valid. Keep listening. The event persists. The user widens; the client does not auto-widen.

Replication is whatever relays the person publishes to. No sole indexer. NIP-40 for expiry. NIP-09 for retract.

---

## Situations

The human unit of work. Ordinary and boring cases are first-class.

| Felt state | Shape | Possible intent |
|------------|-------|-----------------|
| hungry | food, locus, cuisine, budget, time | nearby food, delivery, grocery, shared meal |
| pensive | low urgency, optional company | quiet place, companion, or private no-match |
| anxious | regulation, locus, rails (walk, talk) | nearby walk, known person, low stimulation |
| frustrated | stuck task or object | expertise, tool, ride, or a different context |
| want to move | destination or open, duration, company | companion, vehicle, route |
| need stuff | list or category, locus, urgency | shopping run, delivery, shared errand |

### Doing Mode

Current situation = currently doing. Many concurrent Situations are normal (hungry + walking). Doing Mode is the “active now” filter on the monitor. Each may be private, published, or linked to a Conversation.

### Habits

| Kind | Lives as |
|------|----------|
| Scheduled | Event (`kind=meeting` or gathering) linked to a Situation |
| Recurring | Standing Situation or Offer with recurrence, or a SystemNote instantiated on a cadence |
| Consistent behavior | Profile fact plus optional published windows |

A habit can be local-only, a published window (“walking 6–7 pm near park”), or a standing Offer. Recurrence is a property. No new root type.

Network intent appears only when the person publishes. The detector still assembles private Situations so matching has a clean object.

Detector: gather text, audio, camera, location, mood, recent activity → propose summary + properties → edit as Note, semantic graph, or JSON → publish or keep private.

---

## SystemNotes, rules, Trackers, Triggers

| Object | What it is | Runs? |
|--------|------------|-------|
| SystemNote | Signed definition: rule, goal, constraint, reply path, or template. Indexes Notes in scope. | Never |
| Tracker | Active monitor. Cites a SystemNote, a template, or an explicit definition. | Yes, observation, on cadence or continuously |
| Trigger | Action when a condition is met. Cites a Tracker or a SystemNote. | Yes, when the condition is true |

Notention has templates (starters, do not run) and skills (code that executes). It has no SystemNote. Adopt the template pattern and property-pattern matching. Do not fold skill execution into SystemNote. SystemNotes are ordinary signed Notes. Network-received ones are untrusted until explicitly trusted. Local ones are trusted by default.

Friction counts (`getFrictionCounts`, `recordFriction`) are available for SystemNote UX: repeated corrections or abandoned captures can suggest a template change. They do not affect matching. The journal is opt-in and stores aggregates only.

### New Rules

Casual input becomes a SystemNote. Consulted, not executed.

| Input | Output | Effect |
|-------|--------|--------|
| “I’m never going there again” | Blacklist for that locus | Future matches flagged or suppressed |
| “I’ll never pay more than $XX for YYY” | Price ceiling on YYY | Offers above it deprioritized or blocked |
| “I walk outside every day” | Habit goal | Tracker measures; Trigger may remind |
| “No negative self-talk on fitness” | Tone constraint | Soft prompt when phrasing drifts. Mirror, not a block |

Always-on patterns: baseline vs yesterday or rolling average; never-again / never-more at compose time and match time; habit windows that propose a Situation if none exists. Local by default.

### Where constraints act

| Layer | Examples |
|-------|----------|
| Own Situation | budget, locus, needBy, mood, New Rules |
| Published Situation | same, scored against other peers’ Offers |
| Offer | price, window, rails — facts |
| Agreement | signed terms, validDuring — optional, cited later |
| SystemNote | blacklist, ceiling, habit, tone — definition |
| Profile | capabilities, preferred rails, habit windows — defaults |

### Tracker scope

Internal: own Situations, Doing Mode, walk distance, weight, reps, language in notes.

External: page content, product price, availability; public Situations or Offers from a Peer; weather at a locus; market or fare prices; keywords in headlines, RSS, or a feed.

A Tracker holds source, selector, threshold, cadence, optional linked SystemNote. Observations are Notes (often private). External fetches are cached. The definition stays local unless published. People-trackers need no cooperation beyond ordinary publication.

### Trigger actions

Create a Situation. Send a Message. Open a Conversation. Publish or adjust an Offer. Local reminder. Suppress or flag a match. Chain another Tracker or Trigger.

Example: SystemNote “walk ≥ 30 min, compare to yesterday” → Tracker on Doing Mode walk Situations → Trigger “no walk by 6 pm → propose a Situation.”

No new root primitive. A firing is an ordinary Situation, Message, Offer, or local notification.

---

## Matching

`MatchEngine.calculateMatchScore(situation, offer)` is directional and local. Situation properties are constraints. Offer properties are facts.

Per property: satisfied `1` (or `0–1` for geo/fuzzy), conflict `-1` (geo far `-0.5`), missing or unknown `0`. Score is `max(0, sum) / request property count`. Offer priority multiplies in `MatchingService`.

| Type | Behavior |
|------|----------|
| number | `< > <= >=`, `is` within 5%, `between` |
| string | exact, contains, Levenshtein, then substring |
| what3words | exact triple only, via `matchNotes`. Not the string matcher |
| geo | `near`, haversine, default 50 km, score `1 - distance/max` |
| date | `before`, `after` |
| enum | normalized exact, else conflict |

Aliases expand keys (`locus` ↔ `location`). The engine does not search the network. The class property scores only if the other Note carries it; filter it out before scoring if it should not count.

`class is situation` on a Situation will be “missing” against an Offer that only has `class is offer`. That is expected.

Tests: [core/src/matching.test.ts](core/src/matching.test.ts). `npm test`.

---

## UI

Default input is a Situation detector, not a rich-text editor. Bottom nav: Detector | Monitor | Discover | Assets | Profile. “+” offers Situation, Tracker, Trigger (optionally Agreement or New Rule). Assets is a file surface, not an input.

| Mode | Role |
|------|------|
| Situation Detector | Home. Text, audio, camera, location, mood, recent activity. Live preview. Publish private / circle / network. New Rule phrasing offers a SystemNote. |
| Multi-Situation Monitor | Cards: summary, phase, match count, conversation, urgency. Doing Mode filter. Tracker and Trigger sections. |
| Single Situation | Own: editor. Others: read-only. |
| Other Situations | Feed or map. Respond with an Offer. Filters: radius, category, urgency, rails. |
| Tracker screen | Dedicated. Template or blank. Not the home input. |
| Trigger screen | Dedicated. Template or blank. |
| Templates library | Starters for Situation, Tracker, Trigger, Agreement, New Rule. Copy, then edit. |

Own Situations have three views of the same object. Edits in one update the others.

| View | Edit |
|------|------|
| As Note | Summary, property chips, notes, evidence |
| Semantic graph | Tag cloud and language map: keys, operators, values, aliases. This is what the matcher will constrain on. |
| JSON | Canonical object. Validated raw edit. |

Prototype choice: always editable for own Situations, with Published/Draft and an undo stack. Replacement Notes link the predecessor. Other people’s Situations stay read-only.

Single Situation also has a match rail (ranked Offers, score + explanation), linked Conversation, phase timeline (Offer → counter → Agreement optional → Engagement → Invoice → Payment → Receipt), linked Trackers and Triggers, and an evidence tray. Actions: counter-offer (only after an Offer), invoice, payment, endorsement request, dispute.

Local-first. External Tracker observations cache. Progressive disclosure: advanced properties and JSON live behind the view switcher, not a developer mode.

Implemented: `ui/dashboard/` static Multi-Situation Monitor. Next surfaces, in order: detector, situation editor, tracker, trigger, templates, discover.

---

## Engine

Fork-by-import. Callers use mb.core. There is no Notention process.

```
UI / simulator
  → core/src (engine.ts, primitives.ts, ontology)
    → MatchEngine, OntologyService, Note
      (source in core/vendor/notention/, owned here)
```

Imported commit: `be510c4888da3470c811ef20f0da633d37fd6675` (2026-11-05). Recorded in [core/vendor/IMPORTED.md](core/vendor/IMPORTED.md). Re-run `core/scripts/import-notention.sh` to absorb a later commit. The importer copies upstream `core/src` into `core/vendor/notention/` and does not overwrite `core/src/`.

Public exports include `createEngine`, primitive constructors, and friction helpers (`getFrictionCounts`, `getFrictionSignals`, `recordFriction`, `generateFrictionDigest`).

Loading the matcher pulls `constants/seams.ts` → `ui/strategy.ts`, which needs `zod` and `react` as devDependencies. The algorithm does not use them.

Early notes described a temporary `notention9` GitHub package dependency. That link was dropped once the vendor import was verified. Do not reintroduce it as the architecture.

---


## MB node

One process. Three modules. Data and Relay are bound services. Account has no process.

| Module | Label | Binds |
|--------|-------|-------|
| [node/data](node/data/) | MB Data | Kubo. Fetches the pinned official binary on install, checks SHA512, extracts. |
| [node/account](node/account/) | MB Account | Nostr identity and keys. `nostr-tools`. Generate, import, export `nsec`. |
| [node/relay](node/relay/) | MB Relay | In-process NIP-01 relay so the node runs. A binary replaces it for NIP-29. |

A new install creates Data and Relay. Each toggles alone. Account is always available. Neither service is written by MB.

Each module diagnoses itself on boot. `node.diagnose()` runs the same checks the unit tests run. `npm run diagnose` prints the report. A failed check is recorded, not thrown.


| Service | What is bound | On install |
|---------|---------------|------------|
| Nostr relay | A Nostr relay implementation. strfry, nostr-rs-relay, khatru, or equivalent. Speaks NIP-01. Hosts NIP-29 groups for this node. | Created, running, loopback |
| IPFS node | Kubo. The official binary from the IPFS distribution, imported into the node payload. Not a reimplementation. | `ipfs init` into the node path, daemon running, loopback API |

### Install

1. Install the MB node.
2. Import the relay binary or package into the node. Start it. Its data dir is the node's.
3. Download the Kubo payload for this OS from the IPFS distribution. Import it. `ipfs init`. Start the daemon.
4. Keys are separate and lazy. First launch offers generate, import, or skip. Generate calls the Nostr library. Import takes an `nsec` or `ncryptsec`. The node does not derive a key.


### Keys on the node

| Action | Does |
|--------|------|
| Generate nsec | Library call. New identity or new account. |
| Import nsec | Paste `nsec` or `ncryptsec`. Validates before it is stored. |
| Export nsec | Reveal `nsec`, or export `ncryptsec` under a passphrase. Person confirms. |
| Switch | Which stored key signs. Does not stop the relay or IPFS. |

### Reuse, not invent

These NIPs already exist. Use them when the feature is needed. Do not write a parallel version.

| NIP | Reuse for |
|-----|-----------|
| NIP-11 | Relay info document. Node status for the bound relay. |
| NIP-42 | AUTH. Required for NIP-29 private groups. |
| NIP-46 | Remote signing. Other devices without copying the `nsec`. |
| NIP-49 | `ncryptsec`. Encrypted export of an `nsec`. |
| NIP-65 | Kind 10002 relay list. Devices learn where this key reads and writes. |
| NIP-51 | Lists. Mute list is a New Rule blacklist. Pin list is pinned Situations. |
| NIP-38 | User status. Doing Mode and mood, without a new object. |
| NIP-40 | Expiry tag. Already the retention rule. |
| NIP-09 | Deletion. Already the retract rule. |
| NIP-45 | COUNT. "How many events match" for unmatched and adoption counts, without pulling bodies. |
| NIP-77 | Negentropy. Sync the bound relay with another device's relay. |
| Ephemeral kinds (20000–29999) | Presence. "Currently doing" that is not stored. |
| Addressable kinds (30000–39999) | SystemNotes, Asset index, Tracker definitions. Latest replaces. |
| NIP-47 | Nostr Wallet Connect. A Payment cites a wallet. MB does not hold Lightning keys. |
| NIP-89 | Application handlers. Other Nostr clients can open an MB event. |

Not in the prototype unless asked: NIP-50 search (relay-dependent), Blossom or NIP-96 media servers (Kubo is the blob store), zaps as a required rail (Payment stays rail-agnostic; NIP-47 is the optional Lightning path).

### Toggles

| Action | Relay | IPFS |
|--------|-------|------|
| Stop relay | Publish and subscribe pause. Matching still runs on events already stored. | Unaffected |
| Stop IPFS | Unaffected | Add, pin, and fetch pause. Local files remain. |
| Start either | That service only | That service only |
| Configure | Port, NIP-29 on or off, extra relays to query | API port, gateway port, pinning |

The UI shows two switches. They are independent. Stopping one does not stop the other, and does not stop the MB process.

### What the node is not

Not an account server. Not the only relay a client may use. A person may add public relays. The bound relay is the default, and the NIP-29 host for groups created here. The IPFS node is this device's node. MB does not run a cluster.

---

## Assets

Signed media objects. Local-first files that become network-available when an identity or an account key encrypts, signs, and indexes them. Like iCloud with no account server and no storage bill to MB. The peer pays in disk and in the IPFS node they choose to run.

Not a media system. An Asset is a referent, not a thirteenth primitive. It does not match or settle. Situations, Offers, and Messages cite it.

### Plan

1. Local package-manager list. Drag and drop. No network.
2. Sign and encrypt to an identity key or an account key. Publish an index Note.
3. Local IPFS node: start, stop, pin the encrypted blob, announce the CID.
4. On any update, sync. Other devices that hold the same seed pull the new index Note, fetch the CID, decrypt.
5. Share and attach. Re-encrypt to another peer, or cite the Asset from a primitive.

Persistence is incentivized, not guaranteed. Same rule as Notes. MB does not operate an IPFS cluster.

### Object

| Field | Meaning |
|-------|---------|
| id | Asset id. Stable across versions. |
| owner | Identity pubkey or account pubkey. Either key may encrypt. |
| name | Display name. Package-manager label. |
| version | Monotonic. Each update is a new version. |
| cid | IPFS CID of the encrypted blob. Empty while local-only. |
| prev | Prior version id, if any. Changelog. |
| mime | Type. |
| size | Bytes of the plaintext. |
| encrypted | True once indexed. |
| local | True if this device has the plaintext. |

The blob on IPFS is ciphertext. The index Note is signed by the owner key and carries the CID, the wrapped content key, and the version. Devices that can derive that key decrypt. Devices that cannot see a CID they cannot open.

A local-only file is not an Asset yet. Adding it to account assets is the act that signs, encrypts, and indexes it.

### Keys

Encryption is NIP-44 to the owner pubkey. No custom wrap.

| Owner | Who can decrypt |
|-------|-----------------|
| Identity `nsec` | Any device that holds that `nsec`, or a NIP-46 bunker that holds it. |
| Account `nsec` | Devices that hold that account key, or its bunker. |

Moving an Asset to another key re-encrypts with NIP-44 to the new pubkey and publishes a new index event. A new CID is pinned. Sync starts.

### IPFS node

Each device may run a local IPFS node (Kubo or equivalent). MB starts it, stops it, and reports it. It does not require a remote gateway.

| State | Meaning |
|-------|---------|
| stopped | No node. Local files still list. Index and fetch wait. |
| starting | Process up, not yet listening. |
| running | Listening. Can add, pin, fetch. |
| error | Failed. Local files remain. Retry is a user action. |

Indexed Assets are pinned on the device that indexed them. Other devices of the same key fetch by CID and pin locally after decrypt. Unpin is local. Retract hides the index Note; it does not un-publish a CID already on the network.

### Sync

An update is a new version: new ciphertext or new metadata, new index Note citing `prev`, new or same CID.

1. Device writes the new version locally.
2. If indexed, encrypt, add to IPFS, pin, sign the index Note, publish.
3. Other devices subscribed to that owner key see the Note.
4. They fetch the CID, decrypt, replace the local plaintext, keep the prior version.
5. Two offline updates: both versions kept. Newer signed Note is current. The person picks. No silent merge of bytes.

Sync status on a row: local, indexed, syncing, synced, conflict.

### UI

Package-manager filesystem. One list. Not a feed.

| Column | Shows |
|--------|-------|
| name | Label. Drag target. |
| version | Current. |
| size | Plaintext bytes. |
| owner | Identity or account. |
| status | local / indexed / syncing / synced / conflict |
| cid | Short CID once indexed. |

Drag a file onto the list to add it. Drop onto a folder row to place it. Folders are names, not a second object type. Multi-select. Sort by name, version, size, status.

### User actions

| Action | Does |
|--------|------|
| Open Assets | Show the list for the current identity and its accounts. |
| Filter | By owner key, status, name, mime. |
| Search | By name. Local first. |
| Drag-drop add | File lands local-only. Not yet signed. |
| Add from picker or camera | Same as drop. |
| Choose owner | Identity or one account. Default: current account. |
| Add to account assets | Sign, encrypt to the chosen key, IPFS add, pin, publish index Note. Sync starts. |
| Keep local only | Leave unsigned. This device only. |
| Open | Decrypt if needed. Preview or hand to the OS. |
| Rename | New version Note. Same CID if bytes unchanged. |
| Replace file | New ciphertext, new CID, new version, sync starts. |
| Show versions | List prior index Notes. |
| Revert | Current points at an older version. Sync starts. Bytes of the old version stay. |
| Delete local copy | Remove plaintext and pin on this device. Index Note stays. |
| Retract | Signed tombstone on the index Note. Display hides it. Ledger keeps it. CID may remain on IPFS. |
| Pin | This device keeps the CID. |
| Unpin | This device may drop the CID. |
| Start IPFS node | Spin up the local node. |
| Stop IPFS node | Stop it. Local files remain. Fetch and add wait. |
| Node status | Running or not, peer count, repo size. |
| Sync now | Pull index Notes for owned keys, fetch missing CIDs. |
| Resolve conflict | Pick a version. Other becomes prev. |
| Move owner | Re-wrap to the other key. New index Note. Sync starts. |
| Share | Re-encrypt to another peer’s key, or publish a public unencrypted CID. Explicit. |
| Attach | Cite the Asset from a Situation, Offer, or Message. |
| Export | Write plaintext to a path the person picks. |
| Set retention | Expiry on the index Note. Same rules as other Notes. |

Invalid: auto-share, a global media rank, an MB-hosted bucket, treating a CID as a match score.

### What this is not

Not iCloud’s server. Not a media feed. Not a thirteenth primitive. Not a guarantee that a CID is fetchable after every peer unpins it. Free means no middleman fee. It does not mean unlimited hosted storage.

---

## Simulator

Invent hypothetical business interactions with the MB primitive set.

- Agents publish Situations, Offers, counters, Agreements, Engagements, Invoices, Payments, private Receipts, optional Endorsements, Disputes.
- Observe scores, reply graphs, phase caches, settlement refs.
- Scripted scenarios (plumber, ride-share, grocery) and generative situations.
- Local-only first. Optional Nostr later.
- Keep Notention’s multi-agent loop, dashboard, and recording where useful. Replace generic Note templates with MB constructors and SystemNotes.
- Movie output is optional. The value is traces and match explanations.

Planned: CLI for a named scenario or N random interactions; a small dashboard of agent state, primitive timeline, and match log.

Scenarios are scripts. They are not Situations.

---

## Deploy

`ui/` is plain HTML/CSS/JS. No npm. No build. GitHub is the source of truth.

Target: `https://monkeypanel.com/prototype/`.

On the droplet, clone or pull the repo where Nginx can read it (for example `/var/www/mb.core` or `/var/www/monkeypanel.com`). Alias `/prototype/` at the `ui/` tree, or at `ui/prototype/` if that is where `index.html` lives. `nginx -t` then reload. Update with `git pull`. Alternative: `rsync` the `ui/` tree and alias that directory.

Static prototypes only. Do not run `npm run dev` on the droplet for these surfaces.

---

## Social, without a social system

There is no global “current thing.” A client ranks what its relays and follows delivered. Many local views can converge without a platform.

Social is concurrent with the protocol (same signed Notes), orthogonal to matching (a feed does not require MatchEngine), and on top of the primitives (a post is a Message or a Situation with `target=network`; a discussion is a Conversation; a reaction is a Message or an Endorsement; a follow is a subscription to a key or to a semantic tag, including a Place).

“Current” in MB is a Situation or Message that nearby peers recently signed, replied to, or matched. The protocol does not rank it.

---

## TODO

Done and not repeated here: Account (nsec, ncryptsec, sign, NIP-44, kind 0/3/5/10002), Data (Kubo fetch, SHA512, init, add, pin, fetch), Relay (in-process NIP-01, publish, query), boot diagnostics.

| Open | Why it is next |
|------|----------------|
| Situation → NIP-01 filter | Matching still runs on events already in hand. A Situation does not yet build the `REQ` that asks the relay for more. |
| Application kind table | The twelve primitives are not yet assigned Nostr kinds. Until they are, a Situation and a note look the same on the wire. |
| Asset index event | Files can be pinned. There is no addressable event that lists a key's assets so another device can find them. |
| NIP-29 groups | The in-process relay is NIP-01. Groups need a binary relay that enforces membership. No official binary is published to fetch. |
| SystemNotes as addressable events | Rules, trackers, and triggers are specified. They are not yet kind 30000–39999 events that replace on update. |
| Live follow | Kind 3 is signed. The node does not yet open a `REQ` for the followed keys and tags. |

Not a gap: no BIP32 tree, no group-key rotation, no custom resolver. Those were dropped on purpose.
