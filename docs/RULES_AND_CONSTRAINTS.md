# Rules, Self-Monitoring, and Constraint Mapping

## New Rule (self-monitoring constraint)

A **New Rule** is a self-directed constraint that the Situation detector (or a dedicated capture) turns into a durable SystemNote.

Casual input → formal output:

| Casual input | Formal output | Effect |
|--------------|---------------|--------|
| “I’m never going there again” | Blacklist directive for that locus | Future Situations / Offers matching that location are flagged or suppressed |
| “I’ll never pay more than $XX for YYY” | Price constraint on category YYY | Matching Offers above the ceiling are deprioritized or blocked |
| “I walk outside every day” | Recurring Situation / habit goal | Active Tracker measures progress; can Trigger a reminder or Situation |
| “No negative self-talk on fitness” | Tone / language constraint on fitness Situations | Detector or editor surfaces a soft prompt when phrasing drifts |

New Rules live as SystemNotes. They do not run. They are consulted.

## SystemNotes, Trackers, and Triggers

Three distinct things:

| Object | What it is | Runs? | Role |
|--------|------------|-------|------|
| **SystemNote** | Signed, reusable description of a rule, goal, constraint, or reply path. Holds the definition. | No | Definition. Tracks (indexes) the internal Notes that fall under it. |
| **Tracker** | Active monitor created from a SystemNote (or from a goal/rule). Watches Situations, Doing Mode, metrics. | Yes (observation) | Measurement. Reports progress against the SystemNote’s target. |
| **Trigger** | Action or event that a Tracker can fire when a condition is met. | Yes (action) | Consequence. Can create a Situation, send a Message, propose a reminder, open a Conversation, etc. |

Relationship:

- Goals and rules are set as SystemNotes.
- Each relevant SystemNote can have one or more active Trackers.
- Each Tracker can also be a Trigger for another action or event.
- Trackers are not SystemNotes.
- SystemNotes track all internal Notes that match their scope (they hold the index or the citation set).

Example:

1. SystemNote: “Walk outside every day, ≥ 30 min, compare to yesterday.”
2. Tracker: watches Doing Mode Situations tagged walk/outdoor; records duration; compares to prior day.
3. Trigger (optional): if no walk Situation by 6 pm, propose a Situation or send a local reminder.

The SystemNote remains the durable, non-running definition. The Tracker is the live measurement. The Trigger is the optional consequence.

## Always-on self-monitoring

Best self-interaction patterns:

- **Baseline goals** — walking outside, distance, treadmill time, weight, reps. Tracker measures each day’s Doing Situation against yesterday or a rolling average held in the SystemNote.
- **Negative-self-talk reduction** — SystemNote holds the language constraint; Tracker watches fitness/mood Situations; Trigger offers a rewrite or pause (mirror, not a block).
- **Never-again / never-more** — SystemNote holds the blacklist or price ceiling; Tracker (or matcher) consults it at compose time and match time; Trigger can flag or suppress.
- **Habit windows** — SystemNote holds “walk before 9 am” or “gym Mon/Wed/Fri”; Tracker watches the window; Trigger proposes or auto-instantiates the Situation.

These SystemNotes are local by default. They do not need to be published to affect the person’s own matching, tracking, and editing.

## Agreement primitive — conditions and negotiation

An Agreement is the terms two or more peers sign. It is the aim of Offers and counter-offers, not a gate.

How conditions and negotiations map:

| Negotiation step | Maps to |
|------------------|---------|
| Listing Offer | Offer `role=listing` with facts |
| Counter | Offer `role=counter` (`inReplyTo` prior Offer) |
| Conditional acceptance | Message or Offer property: “accept if price ≤ X and locus within Y” |
| Final terms | Agreement (parties, terms as properties, signatures) |
| Reusable terms | Agreement that cites a SystemNote template; later Engagements cite the Agreement |

Conditions live as properties on the Offer or as explicit clauses in the Agreement terms. A counter-offer that changes a condition is just another Offer in the chain. The Agreement records the version that was signed.

Parties may skip the Agreement entirely and still create Engagement, Invoice, or Payment. The Agreement is evidence of shared terms, not a prerequisite.

## How constraints map into interactions

Constraints are not only on Situations. They appear at every layer:

| Layer | Constraint examples | How it acts |
|-------|---------------------|-------------|
| Situation (own) | budget, locus, needBy, mood, New Rules | Matcher treats them as constraints against Offers |
| Situation (network) | same, published | Other peers’ Offers are scored against them |
| Offer | price ceiling, availability window, rails accepted | Facts that Situations constrain against |
| Agreement | signed terms, validDuring, conditions | Cited by later Engagements; optional |
| SystemNote | never-again locus, max price, daily walk, tone | Definition. Tracked by SystemNote; measured by Tracker; may fire Trigger |
| Profile | standing capabilities, preferred rails, habit windows | Used as default facts or soft constraints |

A New Rule is a constraint the person wants applied automatically. The detector or the editor promotes a spoken or typed sentence into a SystemNote. Trackers and Triggers are then attached as needed.

## Prototype implications

- Situation detector and editor should recognize New Rule phrasing and offer to save it as a SystemNote.
- Multi-Situation Monitor and Doing Mode should show active Trackers and their progress against SystemNotes.
- Matching should respect author-side SystemNotes (blacklist, price ceiling) before scoring Offers.
- Triggers should be explicit and optional; the SystemNote itself never executes.
- Agreement editor should make conditions visible as properties that can be negotiated via counter-offers.
