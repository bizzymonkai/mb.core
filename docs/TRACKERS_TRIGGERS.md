# MB Trackers and Triggers

Trackers observe. Triggers act. Both can be self-directed or external. Both use templates for dedicated input UXs (not the default Situation detector).

## Trackers

A Tracker is an active monitor. It is not a SystemNote. It is created from a SystemNote, a template, or an explicit definition, and it watches something.

### What a Tracker can monitor

| Scope | Examples |
|-------|----------|
| **Internal** | Own Situations, Doing Mode, metrics (walk distance, weight, reps), language in notes |
| **External — websites** | Page content, price on a product page, availability, status |
| **External — people** | Public Situations or Offers from a Peer, activity in a Conversation |
| **External — weather** | Temperature, precipitation, wind at a locus |
| **External — prices** | Market price, listing price, fare |
| **External — words** | Keywords or phrases in newswire headlines, RSS, or a watched feed |

The Tracker holds the watch definition (what, where, how often, threshold). It produces observations that can be stored as Notes or used by Triggers.

### Tracker templates (absorbed from Notention)

Notention templates are starter objects with pre-filled properties. The same pattern applies to Trackers. Templates are not the default input screen; they are selectable starting points with a dedicated UX.

Example Tracker templates:

- Price ceiling on a product page
- Keyword in headlines (newswire / RSS)
- Weather at a locus (rain, temp threshold)
- Peer activity (new Offer or Situation from a known identity)
- Daily walk duration vs yesterday
- Never-again locus (internal + match-time)

Dedicated Tracker UX:

- Template picker or blank Tracker form
- Fields: source (internal / URL / feed / peer / weather), selector or query, threshold, cadence, linked SystemNote (optional)
- Live preview of what will be watched
- Save as active Tracker

## Triggers

A Trigger is an action or event that fires when a Tracker (or another condition) meets a rule. It is not a SystemNote. It can be attached to a Tracker or defined independently.

### What a Trigger can do

| Action | Examples |
|--------|----------|
| Create Situation | “No walk by 6 pm → propose walk Situation” |
| Send Message | Notify self or a Peer |
| Open Conversation | Start or resume a channel linked to a Situation |
| Publish Offer or update | Auto-list or adjust an Offer |
| Local reminder / notification | Device-level alert |
| Suppress or flag | Block a match, mark a Situation |
| Chain | Fire another Tracker or Trigger |

### Trigger templates

Same template idea. Dedicated UX, not the default detector.

Example Trigger templates:

- Propose Situation when Tracker threshold crossed
- Notify when keyword appears in headlines
- Flag Offers above price ceiling
- Remind when habit window is open and no Doing Situation exists
- Blacklist locus on “never again” confirmation

Dedicated Trigger UX:

- Template picker or blank form
- Fields: condition (linked Tracker or expression), action type, payload (Situation draft, Message text, etc.), confirmation required (yes/no)
- Preview of what will happen
- Save as active Trigger

## UX / UI updates

| Surface | Change |
|---------|--------|
| **Default** | Still Situation Detector. Trackers and Triggers are not the home input. |
| **Monitor** | Multi-Situation Monitor gains a Trackers section (active watches + last observation) and a Triggers section (armed actions). |
| **Single Situation** | Can show linked Trackers (e.g. price watch on an item in the Situation) and any Triggers that reference it. |
| **Dedicated Tracker screen** | Template-based or blank. Source, selector, threshold, cadence. |
| **Dedicated Trigger screen** | Template-based or blank. Condition, action, payload, confirmation. |
| **Templates library** | Shared library of Tracker templates and Trigger templates (plus Situation and Agreement templates). Copied, then edited. |

Bottom nav or gesture remains Detector | Monitor | Discover | Profile. Tracker and Trigger creation are reachable from Monitor or from a “+” that offers Situation / Tracker / Trigger.

## Primitive mapping

Trackers and Triggers are application objects. They sit on top of the existing primitives:

| Object | Maps to |
|--------|---------|
| Tracker definition | SystemNote (or local object citing a SystemNote) + properties for source, selector, threshold |
| Tracker observation | Note (or Engagement) recording the reading; can be private |
| Trigger definition | SystemNote or local object with condition + action properties |
| Trigger firing | New Situation, Message, Offer, or local notification (ordinary primitives) |

No new root primitive is required. Tracker and Trigger are roles or types of SystemNote / local objects that the UI and the local runtime treat specially.

## External monitoring notes

- External Trackers (websites, prices, weather, newswire) require a fetcher or subscription. Local-first: observations are cached; the Tracker definition stays local unless published.
- People Trackers watch public Situations, Offers, or Conversation activity from known Peers. They do not require the Peer to cooperate beyond ordinary publication.
- Templates make common external watches one-tap to start, then editable.

This keeps the Situation detector as the default human input while giving Trackers and Triggers their own clear, template-driven surfaces.
