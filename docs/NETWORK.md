# Network bases

No account server. No sole indexer. Nostr-shaped relay is the default transport. Mesh, direct, and other bindings come later.

Identity, publish, replication, retract, and fetch are specified here. Crypto, hashing, and the relay protocol are not. Those are the substrate.

## 1. Identity and namespace

| Term | Meaning |
|------|---------|
| Peer | Network endpoint. Address can change. |
| Identity | Root signing key. Parent of the children below. |
| Username | Display name bound 1:1 to one pubkey, like a DNS record. |
| Account | Child of identity. Its own key. Signs for itself. |
| Person | Child of identity. A human peer. |
| Company | Child of identity. A peer that can act. |
| Place | Child of identity. A locus the identity claims. |
| Group | Associated identity. Own key. Rotates on membership change. |

Identity is the root. Account, person, company, and place are child elements. A group is associated and has its own key.

No roles are granted. A username is an attestation the identity signs with its private key: this key claims this name.

Company, person, group, and place use the same username rules. A group name is a username on the group identity.

### Known

White pages hold known identities in a local area. Known means: this identity, and the accounts, companies, persons, places, and groups it has signed as associated. A client uses known to resolve a name without a network crawl.

### Resolver

A network service, not a central authority, disambiguates.

- Crawls for the same username on mismatched pubkeys, and for UUID collisions.
- Examines evidence. Informs both pubkeys that a collision is a network Situation.
- Suggests the newer claimant pick a different name after a diligent search.
- A newer participant may still claim an existing name. Method TBD.
- Only disputed names need resolution. Undisputed claims stand.

Anyone can claim a username. The resolver makes collisions inconvenient. It does not prevent them by fiat.

Spoofing is assumed. The defense is the private key: signing requires the key bound to the pubkey bound to the name. A spoofed record that cannot sign as that key fails.

### Restore and rotation

- Same key, new address: username stands. No re-registration.
- New key: namespace records must be rotated. The old key signs the handoff, or the name is re-claimed and may collide.
- Child keys (account, company, person, place) are re-derived or re-attested under the new identity key.

### Open

- Exact procedure when a newer participant claims an existing name.
- Whether a follow subscribes to a username (resolved via known or resolver) or only to a key.

## 2. Publish and subscribe

Default transport is a Nostr-shaped relay. One filter language. Mesh and direct bind to the same pipe once the protocol is mature.

| Target | What it gathers |
|--------|-----------------|
| identity | All accounts, groups, companies, persons, and places associated with this identity. |
| account | That child key only. |
| company | That company child only. |
| person | That person child only. |
| place | That place child only. |
| network | class, locus, topic, author — any subset. Loose. |

`target=identity` is the wide gather. The child targets are narrow.

Matching is loose.

- High confidence: many semantic parts match.
- Low confidence: one or a few parts match.
- Conceptual adjacency: searching for `bar` also considers `pub` and `saloon`. Ontology aliases and relational neighbors, not a hardcoded list.
- Ranking is a relative sort, not a cardinal score. Order the candidates. Do not pretend the number is absolute.

## 3. Replication and expiry

Any relay peer may keep any Note. No dedicated indexer. No one is the sole indexer. Persistence is incentivized, not guaranteed.

| Record | Keep |
|--------|------|
| Settlement / monetary | Content-addressable, 2 years. Network service keeps transaction records. |
| Other | Default 120 days. Author may set shorter or longer on publish. |
| Disappearing | Author sets TTL. Minimum 31 seconds. Revokes itself. |

Expiry is a property. Honest peers in a trust network honor it. Relays may ignore it. The network service may alert that a Note expired. No central politeness rule. Each peer sets its own.

Throttled floods get banned by peers who choose to. Spoofed messages get flagged. Spam lists may be shared.

### Versions

A newer Note replaces an older one. It references the older id if that Note is still alive, absorbs it, and carries a changelog so reversion is possible.

### Graveyard

Tombstones live in a network graveyard. They help match content to a resurrected object. They are not displayed as live.

## 4. Retract

A retract is a signed Note that cites the target id, from the same key that signed the target. Peers honor it. The target belongs in the graveyard. Peers may encourage anyone still relaying it to retire it.

The original stays in the ledger as metadata. It is not shown in display.

### Groups

A group has its own identity. Membership change rotates the key.

- New configuration of peer ids → new keypair.
- New key is encrypted to current members.
- First member who accepts a new member triggers rotation.
- Default: every member has full privilege.
- Optional: a single admin. Admin may only add, remove, rename, or purge group messages.
- These permissions exist only at the group level. They do not extend to other Notes.

Group retract of a join or a post is signed by the current group key after rotation, or by a member key if the group allows it. Display hides the retracted item. The ledger keeps it as metadata.

## 5. Fetch then match

The client builds a filter from the Situation’s properties. Feed and Tracker filters are separate. Every filter is a reason to run MatchEngine under that filter’s rules.

1. Build filter (class, locus, topic, author, window).
2. Ask relays or peers.
3. Run MatchEngine locally on what returns.
4. Sort relatively. Do not treat the score as cardinal.

A broad or vague Situation is a game. It can match. Excessively blank messages are ignored. Spam filters may be shared across peers.

Empty is valid. Keep crawling and listening. The Note persists. If impatient, widen, modify, or adapt the filter. Do not auto-widen without the user.

## What this does not specify

- Signature algorithm, hash, or relay wire format.
- A global trending rank.
- A sole indexer or account server.
- Central ban policy.
