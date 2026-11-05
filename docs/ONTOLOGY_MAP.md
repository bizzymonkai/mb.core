# Situations, Templates, Classes, Scenarios

## Situations are not Notention scenarios

| | Notention **Scenario** | MB **Situation** |
|--|------------------------|------------------|
| What it is | A simulator script: agents, timed events, duration | A live object a peer creates or is in |
| Where it lives | `simulator/src/scenarios/` (Gig Economy, Golden Path, Regression, domain scenarios) | Signed Note (constraint root). Private or published |
| Who uses it | The lab / Movie Studio / CI | The person, in Detector, Monitor, Doing Mode |
| Contains | Agent configs (roles, counts, properties, interests) + EventConfigs | Summary, properties, locus, needBy, mood, reply graph |
| Purpose | Test matching and invent hypothetical interactions | The human unit of work |

A Scenario can *generate* or *exercise* Situations. It is not a Situation.

The MB simulator should consume or emit Situations. A Notention-style Scenario is one way to script a multi-agent run that produces Situation/Offer/Agreement traces. The Situation remains the user-facing object.

## Templates are not the same as ontology classes

Notention (spec §6.1) defines an OntologyModule with:

- `classes` — Note types (`dsn:Offer`, `dsn:Task`, …) with property schemas and value constraints
- Notes carry `types: string[]` (class IRIs)

Notention (implementation) also has simple UI templates: pre-filled starter content (Job Request, Freelance Offer, …).

| Concept | Better home in MB |
|---------|-------------------|
| Situation, Offer, Agreement, Engagement, Invoice, … | **Classes** (the 12 primitives). Fixed application ontology. |
| Pre-filled starter (“daily walk”, “price ceiling”, “never-again locus”) | **Template** — a copyable instance or class-constrained starter. Not a class. |
| Tracker, Trigger | Application roles that cite classes / SystemNotes. Not classes themselves. |
| SystemNote | Definition object. Can cite a class and hold a template payload. Does not run. |

What we have been calling “templates” are starters, not classes. The classes are the primitives.

## Recommended mapping

```
Class (ontology)     Situation | Offer | Conversation | Message | Agreement |
                     Engagement | Event | Invoice | Payment | Receipt |
                     Endorsement | Dispute

Template             pre-filled starter for a class (or for a Tracker/Trigger form)
SystemNote           durable definition; may embed or cite a template; indexes Notes
Tracker              active monitor; cites a SystemNote or class
Trigger              action; cites a Tracker or SystemNote
Scenario (simulator) script of agents + events that produces Situation traces
Situation (live)     the object the person detects, edits, publishes, and monitors
```

## Implication for the UI

- Detector and Monitor speak **Situation** (the class).
- The Templates library offers starters that instantiate a class (or a Tracker/Trigger form).
- The simulator runs **Scenarios** that invent Situation interactions; those are not shown as user Situations unless a peer adopts them.
- Do not rename Situation to Scenario. Do not treat templates as classes.
