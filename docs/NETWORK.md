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

Public person means a namespace entry published as a real-world name and not bound to a still-signing key. An actively signed private username is not open.

Challenge, not seizure:

1. Newer key signs a claim citing the existing name and the current pubkey.
2. Resolver informs both keys. The claim is a network Situation.
3. Current holder has 14 days to re-assert with their key.
4. If they re-assert, the newer claim fails. Newer is told to pick another name.
5. If they do not, the association moves. Old association becomes a tombstone. Changelog records the handoff.

No one seizes a name by being newer. Silence after the window is assent.

### Restore and rotation
