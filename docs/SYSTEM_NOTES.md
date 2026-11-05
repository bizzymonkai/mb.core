# SystemNotes

A SystemNote is a signed, reusable description of a rule, goal, constraint, reply path, or template.

It is the definition. It is consulted. It does not itself execute actions.

## When does it run?

It does not run.

What runs are the objects that cite it:

| Object | What it does | When it runs |
|--------|--------------|--------------|
| **SystemNote** | Holds the definition (properties, template, constraint, reply path). Indexes the Notes that fall under it. | Never. It is data. |
| **Tracker** | Observes (internal metrics, websites, people, weather, prices, headlines). | Continuously or on cadence, while active. |
| **Trigger** | Acts when a condition is met (create Situation, send Message, flag, remind, etc.). | When its condition evaluates true. |

The earlier phrase “it does not run” meant: a SystemNote is not an executable skill or script. Adding or receiving a SystemNote does not start a process. Trackers and Triggers are the things that observe and act; they cite SystemNotes for their definitions and thresholds.

## What a SystemNote is used for

- Situation skeletons and templates
- Agreement term templates
- New Rules (never-again locus, price ceiling, tone constraint)
- Habit and goal definitions (the target a Tracker measures against)
- Tracker and Trigger templates (starter definitions)

## Comparison with Notention

Checked notention9 (core/src/skills, core/src/templates, README2 §2.4).

| Mechanism | What it is | Runs? |
|-----------|------------|-------|
| **Templates** | UI starter content with pre-filled properties. | No. Copied into the editor. |
| **Skills** | Code-based translators. Match property patterns, then export to browser/API actions or import data as Notes. | Yes. They execute. |
| **Spec claim** | Skills described as signed, versioned ontology modules. | Implementation is still code, not signed Notes. |

Notention has no SystemNote type.

### Compatible and worth adopting

- Template pattern — starter objects are a good seed for SystemNotes and for Tracker/Trigger templates.
- PropertyPattern matching — useful for deciding when a Tracker or Trigger applies.
- Untrusted-until-trusted — network-received SystemNotes require explicit trust. Local ones are trusted by default.

### Incompatible

- Executable skills vs SystemNotes. Do not fold skill execution into SystemNote. Trackers and Triggers are the execution layer; SystemNotes remain definitions.
- Code-based vs Note-based. SystemNotes must be ordinary signed Notes so they can be published, replaced, and cited without a code deployment.

## Recommendation

1. SystemNote = non-executing, copyable, signed definition.
2. Tracker = observation that cites a SystemNote.
3. Trigger = action that cites a SystemNote or a Tracker.
4. Borrow Notention’s template style for Situation, Tracker, and Trigger starter libraries.
5. Treat network-received SystemNotes as untrusted until explicitly trusted.
