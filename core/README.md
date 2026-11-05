# mb.core / core

Thin application layer that maps MonkeyBusiness interaction primitives onto Notention Notes.

## Planned surface

- Primitive constructors / validators for the 12 interaction objects + referents.
- SystemNote templates (ride, plumber, grocery, etc.).
- Reply-graph helpers (`inReplyTo`, predecessor replacement, phase cache inference).
- Matching entry point that only treats `Request target=network` as a network match root.

Depends on `@notention/core`. Do not modify the kernel.
