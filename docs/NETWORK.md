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
