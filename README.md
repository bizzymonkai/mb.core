# mb.core

MonkeyBusiness network primitive core. Autonomous engine for MonkeyPanel.

Absorbs the under-the-hood of [notention9](https://github.com/autonull/notention9) (semantic matching, Note model, local-first store, NetworkGate/Nostr, ontology engine). Exposes a thin, fixed application ontology of interaction primitives. Does not call Notention as a service, API, or runtime package.

This file is the specification. Files in [docs/](docs/) are retired archives. Do not update them.

## Strategy

- Do not rewrite Notention’s matching physics, property system, or transport.
- Map MB primitives onto Notention Notes. Class id is a tag `class:<id>` and a property `class is <id>`.
- Local-first first. Nostr-shaped relay second. Mesh and direct bind later.
- Agreement is an aim, not a gate. Payments are always accepted. Reputation is optional Endorsements, not a score.
- No product system, auction system, event system, media system, or social system. Those are properties and views.
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
| [ui/](ui/) | Static MonkeyPanel prototypes. HTML/CSS/JS. No npm build. |
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

## Identity and namespace

No account server.

| Term | Meaning |
|------|---------|
| Peer | Network endpoint. Address can change. |
| Seed | BIP39 mnemonic plus optional passphrase. Stays on the point of contact. |
| Identity | BIP32 master key of the tree grown from that seed. Root. |
| Account | Child key derived from the identity. Signs for itself. |
| Username | Display name bound 1:1 to one pubkey. Like a DNS record. Signed claim. No roles granted. |
| Person | Child of identity. |
| Company | Child of identity. Same username rules as a person. |
| Place | Derived network object. Shared ontological white pages index of loci. Not a child key. Not followed. Cited. |
| Group | Associated identity. Own key. Rotates on every membership change. |

Same mnemonic and passphrase restore the same main key on any point of contact. Person and company are children in that tree. A group name is a username on the group key. A Place has a name in the index, not a username on a key.

### Follow

Any key can be followed. A follow subscribes to a pubkey. A username resolves to a key first (known, then resolver). Following the identity does not follow its child accounts. A Place is not followed.

### Known

Known is not a set of identities. It is namespace entries for already established real-world names, plus the shared Place index.

| Kind | What it is |
|------|------------|
| Namespace entry | A real-world name (place, person, company) already on record. No signing key required. MB cites it. Does not invent it. |
| Place index | Shared white pages of loci. |
| Association | An identity later signs that it is, acts for, or is at that name or Place. Until then the entry is a public referent, not a child of any identity. |

White pages are local-area. Resolve from known before crawling. A real-world name is not rotated when a key changes. Only the association is. The Place index is not rotated.

### Resolver

A network service, not a central authority.

- Crawls for the same username on mismatched pubkeys, and for UUID collisions.
- Informs both pubkeys. A collision is a network Situation.
- Suggests the newer claimant pick a different name.
- Only disputed names need resolution. Undisputed claims stand.
- Anyone may claim a name. The resolver makes collisions inconvenient. It does not forbid them.
- Spoofing is assumed. Signing requires the private key bound to that pubkey. A keyless namespace entry cannot be spoofed as an identity; it can only be claimed later by association.

### Newer claim on an existing name

Locked. Revise if a better rule appears. Allowed only as a visible challenge, and only against a public-person entry that has no living association.

| Case | Result |
|------|--------|
| Known real-world entry, no living association | Newer key may claim. Signed association. Resolver records it. |
| Public person, already associated | Challenge. Both keys informed. Name stays until resolved. |
| Private person, company, or group with a living key | Refused by convention. Flag and suggest another name. |
| Associated, key dead or retracted | Newer key may claim. Old association is a tombstone. |

Public person: a namespace entry published as a real-world name and not bound to a still-signing key. An actively signed private username is not open. A Place is cited from the index, not claimed as a key.

Challenge, not seizure:

1. Newer key signs a claim citing the name and the current pubkey.
2. Resolver informs both. The claim is a network Situation.
3. Current holder has 14 days to re-assert.
4. Re-assert: newer claim fails. Pick another name.
5. Silence: association moves. Old association is a tombstone. Changelog records the handoff.

### Restore and rotation

- Same key, new address: username stands. No re-registration.
- New key: namespace records rotate. Old key signs the handoff, or the name is re-claimed and may collide.
- Child keys (account, company, person) are re-derived from the restored master.

### Publish and subscribe

Nostr-shaped relay is the default. One filter language.

| Target | Gathers |
|--------|---------|
| identity | All accounts, groups, companies, and persons associated with this identity, plus Places it has cited. Wide. |
| account / company / person | That child key only. |
| place | The shared Place index entry. Not a key. |
| network | class, locus, topic, author — any subset. Loose. |

A known entry with no association is a referent, not a target identity.

Matching is loose. High confidence means many semantic parts. Low means one or a few. Conceptual adjacency: `bar` also considers `pub` and `saloon` (ontology aliases and neighbors, not a hardcoded list). Ranking is a relative sort, not a cardinal score.

### Replication, expiry, retract

Any peer may keep any Note. No dedicated indexer. Persistence is incentivized, not guaranteed.

| Record | Keep |
|--------|------|
| Settlement / monetary | Content-addressable, 2 years. |
| Other | Default 120 days. Author may set shorter or longer. |
| Disappearing | TTL on publish. Minimum 31 seconds. Revokes itself. |

Expiry is a property. Honest peers honor it. Relays may ignore it. Each peer sets its own politeness. Throttled floods may be banned by the peer who chooses to. Spoofed messages get flagged. Spam lists may be shared.

A newer Note replaces an older one, references it if still alive, absorbs it, and carries a changelog so reversion is possible.

Retract: a signed Note citing the target id, from the same key. Display hides it. The ledger keeps it as metadata. Tombstones live in a graveyard so content can be matched to a resurrected object. Peers may ask anyone still relaying it to retire it.

### Groups

Own identity. New configuration of member ids → new keypair, encrypted to current members. First member who accepts a new member triggers rotation.

- Default: every member has full privilege.
- Optional single admin. Admin may only add, remove, rename, or purge group messages.
- Those permissions exist only at the group. They do not extend to other Notes.

### Fetch then match

1. Build a filter from the Situation (class, locus, topic, author, window). Feed filters and Tracker filters are separate.
2. Ask relays or peers.
3. Run MatchEngine locally.
4. Sort relatively.

Every filter is a reason to run the matcher under that filter’s rules. A broad Situation is a game: it can match; blank spam is ignored. Empty is valid. Keep listening. The Note persists. The user widens; the client does not auto-widen.

Not specified here: signature algorithm, hash, relay wire format.

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
| string | exact, contains, Levenshtein |
| geo | `near`, haversine, default 50 km, score `1 - distance/max` |
| date | `before`, `after` |
| enum | normalized exact, else conflict |

Aliases expand keys (`locus` ↔ `location`). The engine does not search the network. The class property scores only if the other Note carries it; filter it out before scoring if it should not count.

`class is situation` on a Situation will be “missing” against an Offer that only has `class is offer`. That is expected.

Tests: [core/src/matching.test.ts](core/src/matching.test.ts). `npm test`.

---

## UI

Default input is a Situation detector, not a rich-text editor. Bottom nav: Detector | Monitor | Discover | Profile. “+” offers Situation, Tracker, Trigger (optionally Agreement or New Rule).

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

Social is concurrent with the protocol (same signed Notes), orthogonal to matching (a feed does not require MatchEngine), and on top of the primitives (a post is a Message or a Situation with `target=network`; a discussion is a Conversation; a reaction is a Message or an Endorsement; a follow is a subscription to a key).

“Current” in MB is a Situation or Message that nearby peers recently signed, replied to, or matched. The protocol does not rank it.

---

## Still thin

Object model and the five network bases are specified. Still unspecified as code: the Situation→filter builder, the retract Note constructor, the 14-day claim window, replication policy beyond the table above, and group key rotation. Crypto, hash, and relay wire format stay on the Nostr-shaped substrate already in the vendor tree.
