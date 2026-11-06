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
| Place | Child of identity. A locus the identity claims. |
| Group | Associated identity. Own key. Rotates on membership change. |

The main identity key is the BIP32 master key of the tree grown from the seed. The same mnemonic and the same passphrase restore the same main key on any point of contact.

Accounts are derived from identities as child keys. A child key signs for itself. Person, company, and place are children in the same tree. A group is associated and has its own key.

No roles are granted. A username is an attestation a key signs with its private key: this key claims this name.

Company, person, group, and place use the same username rules. A group name is a username on the group identity.

### Follow

Any key can be followed. A follow subscribes to a pubkey. A username resolves to a key first (via known or the resolver); the subscription is to that key. Following the identity key does not automatically follow its child accounts. Each key is followed on its own.
