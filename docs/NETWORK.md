# Network bases

No account server. No sole indexer. Nostr-shaped relay is the default transport. Mesh, direct, and other bindings come later.

Identity, publish, replication, retract, and fetch are specified here. Crypto, hashing, and the relay protocol are not. Those are the substrate.

## 1. Identity and namespace

| Term | Meaning |
|------|---------|
| Peer | Network endpoint. Address can change. |
| Seed | BIP39 mnemonic plus optional passphrase. Stays on the point of contact. |
| Identity | BIP32 master key of the tree grown from that seed. Root. |
| Account | Child key derived from the identity. Its own identity. Signs for itself. |
| Username | Display name bound 1:1 to one pubkey, like a DNS record. |
| Person | Child of identity. A human peer. |
| Company | Child of identity. A peer that can act. |
| Place | Derived network object. Shared ontological white pages index. Not a child key. |
| Group | Associated identity. Own key. Rotates on membership change. |

The main identity key is the BIP32 master key of the tree grown from the seed. The same mnemonic and the same passphrase restore the same main key on any point of contact.

Accounts are derived from identities as child keys. A child key signs for itself. Person and company are children in the same tree. A group is associated and has its own key.

Place is not a key. It is a derived network object: a shared ontological white pages index of loci. Peers cite a Place. No one owns it as a child key. An identity may associate with a Place; the Place itself stays in the index.

No roles are granted. A username is an attestation a key signs with its private key: this key claims this name.

Company, person, and group use the same username rules. A group name is a username on the group identity. A Place has a name in the index, not a username on a key.

### Follow

Any key can be followed. A follow subscribes to a pubkey. A username resolves to a key first (via known or the resolver); the subscription is to that key. Following the identity key does not automatically follow its child accounts. Each key is followed on its own. A Place is not followed; it is cited.

### Known

Known is not a set of identities. It is namespace entries for already established real-world names, and the shared Place index.

Places, persons, and companies that already exist in the world already have names. Those names are namespace entries. MB cites them. It does not invent them and it does not require an identity to exist first.

| Kind | What it is |
|------|------------|
| Namespace entry | An established real-world name (a place, a person, a company) already on record. No signing key required. |
| Place index | Shared ontological white pages of loci. Derived network object. Cited by peers. |
| Association | An identity later signs that it is, acts for, or is at that name or Place. Until then the entry is a public referent, not a child of any identity. |

White pages hold these entries for a local area. A client resolves a name or a Place from known before crawling. Linking an entry to an identity is a later signed association.

### Resolver

A network service, not a central authority, disambiguates.

- Crawls for the same username on mismatched pubkeys, and for UUID collisions.
- Examines evidence. Informs both pubkeys that a collision is a network Situation.
- Suggests the newer claimant pick a different name after a diligent search.
- Only disputed names need resolution. Undisputed claims stand.

Anyone can claim a username. The resolver makes collisions inconvenient. It does not prevent them by fiat.

Spoofing is assumed. The defense is the private key: signing requires the key bound to the pubkey bound to the name. A spoofed record that cannot sign as that key fails. A namespace entry with no key cannot be spoofed as an identity; it can only be claimed later by association.

### Newer claim on an existing name

Locked. Revise if a better rule appears.

A newer claim is allowed only against a public-person namespace entry that has no living association, and only as a visible challenge.

| Case | Result |
|------|--------|
| Known real-world entry, no living association | Newer key may claim. Claim is a signed association. Resolver records it. |
| Public person, already associated | Newer key may open a challenge. Both keys are informed. Name stays until the challenge resolves. |
| Private person, company, or group with a living key | Refused by convention. Resolver flags it and suggests a different name. |
| Associated, key dead or retracted | Newer key may claim. Old association is a tombstone. |

Public person means a namespace entry published as a real-world name and not bound to a still-signing key. An actively signed private username is not open. A Place is not claimed as a key; it is cited from the index.

Challenge, not seizure:

1. Newer key signs a claim citing the existing name and the current pubkey.
2. Resolver informs both keys. The claim is a network Situation.
3. Current holder has 14 days to re-assert with their key.
4. If they re-assert, the newer claim fails. Newer is told to pick another name.
5. If they do not, the association moves. Old association becomes a tombstone. Changelog records the handoff.

No one seizes a name by being newer. Silence after the window is assent.

### Restore and rotation

- Same mnemonic and passphrase restore the same main key on any point of contact.
- Same key, new address: username stands. No re-registration.
- New key: namespace records must be rotated. The old key signs the handoff, or the name is re-claimed and may collide.
- Child keys (account, company, person) are re-derived from the restored master.
- A real-world namespace entry is not rotated. Only the association to a key is.
- The Place index is not rotated. It is shared.

## 2. Publish and subscribe

Default transport is a Nostr-shaped relay. One filter language. Mesh and direct bind to the same pipe once the protocol is mature.

| Target | What it gathers |
|--------|-----------------|
| identity | All accounts, groups, companies, and persons associated with this identity, plus Places it has cited. |
| account | That child key only. |
| company | That company child only. |
| person | That person child only. |
| place | The shared Place index entry. Not a key. |
| network | class, locus, topic, author — any subset. Loose. |

`target=identity` is the wide gather. The child targets are narrow. A Place target reads the index. A known namespace entry with no association is reachable as a referent, not as a target identity.

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
