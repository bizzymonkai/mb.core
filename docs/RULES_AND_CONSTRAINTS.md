# Rules, Self-Monitoring, and Constraint Mapping

## New Rule (self-monitoring constraint)

A **New Rule** is a self-directed constraint that the Situation detector (or a dedicated capture) turns into a durable, always-on SystemNote or Profile fact.

Casual input → formal output:

| Casual input | Formal output | Effect |
|--------------|---------------|--------|
| “I’m never going there again” | Blacklist directive for that locus | Future Situations / Offers matching that location are flagged or suppressed |
| “I’ll never pay more than $XX for YYY” | Price constraint on category YYY | Matching Offers above the ceiling are deprioritized or blocked |
| “I walk outside every day” | Recurring Situation / habit goal | Doing Mode and Monitor track progress against the rule |
| “No negative self-talk on fitness” | Tone / language constraint on fitness Situations | Detector or editor surfaces a soft prompt when phrasing drifts |

New Rules are first-class. They live as SystemNotes (templates that do not run but are consulted) or as Profile properties. They apply to every relevant Situation without being re-stated.

## Always-on SystemNotes for self-monitoring

SystemNotes can run as always-on background constraints for every Situation the person creates or is in.

Best self-interaction patterns:

- **Baseline goals** — walking outside, distance, treadmill time, weight, reps. Each day’s Doing Situation is measured against yesterday or a rolling average. The SystemNote holds the metric, the target, and the comparison rule.
- **Negative-self-talk reduction** — a SystemNote that watches language in fitness, work, or mood Situations and offers a rewrite or a pause. Not a block; a mirror.
- **Never-again / never-more** — the blacklist and price-ceiling examples above. Consulted at match time and at compose time.
- **Habit windows** — “walk before 9 am”, “gym Mon/Wed/Fri”. The SystemNote proposes or auto-instantiates the Situation when the window opens.

These SystemNotes are local by default. They do not need to be published to affect the person’s own matching and editing. They can be published later if the person wants others to see the commitment.

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
| SystemNote (always-on) | never-again locus, max price, daily walk, tone | Consulted at compose time and match time for the author |
| Profile | standing capabilities, preferred rails, habit windows | Used as default facts or soft constraints |

A New Rule is simply a constraint that the person wants applied automatically. The detector or the editor can promote a spoken or typed sentence into a SystemNote or Profile property so it persists across Situations.

## Prototype implications

- Situation detector and editor should recognize New Rule phrasing and offer to save it as a SystemNote.
- Multi-Situation Monitor and Doing Mode should show progress against active baseline-goal SystemNotes.
- Matching should respect author-side SystemNotes (blacklist, price ceiling) before scoring Offers.
- Agreement editor should make conditions visible as properties that can be negotiated via counter-offers.
