> **Retired archive.** Do not update this file.
> Specifications for this repository live in the top-level [README.md](../README.md).
> This copy is kept so nothing is lost. It is not the spec.

# Situations, Templates, Classes, Scenarios

Dependency: `notention9` from `github:autonull/notention9` (see package.json).

## Where the ontology lives in Notention core

| File | Role |
|------|------|
| `core/src/ontology/domains.ts` | The definition. Tree of `OntologyNode`s across domains: entity, communication, event, work, commerce. |
| `core/src/ontology/ontology.default.ts` | Re-exports `DEFAULT_ONTOLOGY` from domains. |
| `core/src/ontology/ontologyCore.ts` | Lookup, keys, attribute resolution. |
| `core/src/ontology/schema.ts` | JSON Schema generation from the ontology for extraction. |
| `core/src/ontology/domains.facets.ts` | Facets. |
| `core/src/templates/templates.ts` | Simple UI starter content (Job Request, Freelance Offer, …). Not the ontology. |
| `simulator/src/scenarios/` | Simulator scripts (Gig Economy, Golden Path, Regression, domain scenarios). Not the ontology. |

An `OntologyNode` has `id`, `label`, `description`, `attributes` (typed keys with operators), `requiredAttributes`, optional `extends`, optional `children`, optional `actionLabel`.

Examples of nodes that function as classes: `person`, `place`, `message`, `meeting`, `job-request` (extends job + request), `freelance-offer` (extends freelance + offer).

## Situations are not Notention scenarios

| | Notention **Scenario** | MB **Situation** |
|--|------------------------|------------------|
| What it is | A simulator script: agents, timed events, duration | A live object a peer creates or is in |
| Where it lives | `simulator/src/scenarios/` | Signed Note (constraint root). Private or published |
| Who uses it | The lab / Movie Studio / CI | The person, in Detector, Monitor, Doing Mode |
| Contains | Agent configs + EventConfigs | Summary, properties, locus, needBy, mood, reply graph |
| Purpose | Test matching and invent hypothetical interactions | The human unit of work |

A Scenario can *generate* or *exercise* Situations. It is not a Situation. Do not rename Situation to Scenario.

## Templates are not the same as ontology classes

Reconsidered against the actual definition files:

- **Classes** in Notention are the `OntologyNode`s in `domains.ts` (and the `classes` map in the spec’s OntologyModule). They declare allowed properties, types, operators, and inheritance (`extends`).
- **Templates** in Notention (`templates.ts`) are pre-filled starter strings for the editor. They are not classes.
- **Scenarios** are simulator scripts. They are not classes.

What we have been calling “templates” in MB (daily walk, price ceiling, never-again locus) are starters, not classes. The classes are the primitives (and any domain nodes we add).

| Concept | Better home in MB |
|---------|-------------------|
| Situation, Offer, Agreement, Engagement, Invoice, … | **Classes** — fixed application ontology, expressed as OntologyNodes (or a thin overlay on Notention’s). |
| Pre-filled starter (“daily walk”, “price ceiling”) | **Template** — copyable instance or class-constrained starter. Not a class. |
| Tracker, Trigger | Application roles that cite classes / SystemNotes. Not classes. |
| SystemNote | Definition object. May cite a class and hold a template payload. Does not run. |

Some starters could later be promoted to classes if they represent a real type (e.g. a Habit node with recurrence and metric attributes). That is an ontology change, not a template rename.

## Recommended mapping

```
Class (OntologyNode)  Situation | Offer | Conversation | Message | Agreement |
                      Engagement | Event | Invoice | Payment | Receipt |
                      Endorsement | Dispute
                      (+ domain nodes we choose to add)

Template              pre-filled starter for a class (or for a Tracker/Trigger form)
SystemNote            durable definition; may embed or cite a template; indexes Notes
Tracker               active monitor; cites a SystemNote or class
Trigger               action; cites a Tracker or SystemNote
Scenario (simulator)  script of agents + events that produces Situation traces
Situation (live)      the object the person detects, edits, publishes, and monitors
```

## Implication

- Detector and Monitor speak **Situation** (the class).
- The Templates library offers starters that instantiate a class.
- The simulator runs **Scenarios** that invent Situation interactions.
- Ontology definition work happens in (or beside) `domains.ts`-style nodes, not in the template list.
- Do not treat templates as classes. Do not treat scenarios as situations.
