# mb.core / core

Thin application layer on top of `@notention/core`.

## Import

`package.json` depends on `notention9` from GitHub. The package name inside that repo is `@notention/core` (`core/`).

Once linked:

```ts
import {
  DEFAULT_ONTOLOGY,
  OntologyService,
  findNode,
  buildAttributeIndex,
  collectOntologyKeys,
} from '@notention/core';

import { composeOntology } from './ontology/index.js';

const nodes = composeOntology(DEFAULT_ONTOLOGY);
const svc = OntologyService.createCustom(nodes);
```

## Class pattern

Same as `notention9/core/src/ontology/domains.ts`:

- `OntologyNode` with `id`, `label`, `attributes`, `requiredAttributes`, `extends`, `children`
- `OntologyAttribute` with `type`, `operators.real` / `operators.imaginary`, optional `options` and `aliases`
- Consumed by `OntologyService` (`createStandard` / `createCustom`, `getNode`, `getAttribute`, `getValidOperators`)

MB classes live in `src/ontology/mb.domains.ts`. They are the 12 primitives. Templates and scenarios are not classes.

## Layout

```
src/ontology/mb.domains.ts   Situation, Offer, Conversation, ... as OntologyNodes
src/ontology/index.ts        composeOntology(host) for merging with DEFAULT_ONTOLOGY
src/index.ts                 public exports
```
