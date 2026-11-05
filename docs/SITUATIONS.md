# Common Human Situations

Basic, universal, sometimes boring situations are first-class. They are the raw material the Situation detector turns into network intent.

## Elemental states → Situations

The detector gathers fragments and assembles them:

| Felt / stated element | Typical Situation shape | Possible network intent |
|-----------------------|-------------------------|-------------------------|
| am hungry | need food now or soon; locus; constraints (cuisine, budget, time) | Offer: nearby food, delivery, grocery run, shared meal |
| am pensive / thoughtful | open thinking space; low urgency; optional company or quiet | Offer: quiet place, walking companion, no-match (private) |
| am anxious | need regulation; locus; intensity; preferred rails (walk, talk, distraction) | Offer: nearby walk, known person, low-stimulation place |
| frustrated | stuck on a task or object; need help, alternative, or break | Offer: expertise, tool, ride, or simply a different context |
| want to walk / drive / go somewhere | movement intent; destination or open; duration; company preference | Offer: companion, vehicle, route, destination suggestion |
| need to get stuff | acquisition; list or open category; locus; urgency | Offer: shopping run, delivery, shared errand |

These are not special cases. They are ordinary Situation instances. Properties capture the detail (locus, needBy, budget, mood, constraints). The semantic layer does the matching.

## Doing Mode

**Current situation = currently doing.**

- A person can have multiple concurrent Situations (hungry + walking + listening to something).
- Doing Mode surfaces the active set: what is being done right now.
- Each active Situation can be:
  - private (just tracking)
  - published for matching (looking for company, help, or complementary Offers)
  - linked to a Conversation

Doing Mode is a filter/view on the Multi-Situation Monitor: “active now.”

## Scheduled situations and habits

Situations are not only spontaneous.

| Kind | Examples | How it lives |
|------|----------|--------------|
| **Scheduled Event** | meet at 3, appointment, class | Event primitive (`kind=meeting` or gathering) linked to a Situation |
| **Recurring habit** | gym, cardio, daily walk, grocery run, commute | Standing Situation or Offer with recurrence; or a SystemNote template that is instantiated on a cadence |
| **Consistent behavior** | “I walk in the evening”, “I go to the gym Mon/Wed/Fri” | Profile facts + optional published Situation windows that matchers can see |

A habit can be:
- purely local (tracker)
- a published Situation window (“walking 6–7 pm near park”)
- a standing Offer (“I can join walks in this area”)

The same primitive set covers all of them. Recurrence and windows are properties. No new root types required.

## Fitting the boring and universal

The paradigm does not require drama.

- “I need milk” is a Situation.
- “I’m going for a walk” is a Situation (or an Engagement of a habit).
- “I’m at the gym” is a current Doing Situation.
- “I walk every morning” is a recurring Situation or Profile fact that can match companions or routes.

Network intent appears only when the person chooses to publish. Most Situations can stay private. The detector still assembles them so the local model (and any future matching) has a clean object.

## Detector role

The Situation detector’s job is to turn the fragments above into a proper Situation:

1. Gather (text, audio, camera, location, mood, recent activity).
2. Propose a structured Situation (summary + properties).
3. Let the person edit via Note / Semantic Graph / JSON views.
4. Publish (or keep private) as the semantic Note the matching engine understands.

Doing Mode, scheduled Events, and habits are just different lifetimes and visibility settings on the same Situation object.
