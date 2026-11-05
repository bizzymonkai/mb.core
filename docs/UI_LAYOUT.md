# MonkeyPanel PWA UI Layout

Default input paradigm is a **Situation detector**, not a rich-text editor.

The detector gathers multimodal context and converts it into a fully instantiated semantic Situation Note for under-the-hood matching. Conversations/channels are linked to Situations.

Everything created is editable. Own Situations open in an editor that can toggle between view and edit, or remain in a live-editable state.

## Primary modes

1. **Situation Detector** (default home)
2. **Multi-Situation Monitor** (fundamental overview)
3. **Single Situation** (focused view + editor)
4. **Other Situations** (discovery / network view)

## 1. Situation Detector (default)

Full-screen or large card that continuously or on-demand assembles a Situation.

### Inputs gathered
- Text (freeform or structured prompts)
- Audio (voice memo / live transcription)
- Camera (photo or short video, with on-device or cloud vision tags)
- Location (current + recent trajectory, place names)
- Inferred mood / urgency (from tone, recency, explicit tags)
- Relevance from recent activity (open Situations, recent Offers, calendar, location history)
- Optional: contacts, media attachments, budget/time constraints

### Output
- Live preview of the assembling Situation (summary + key properties)
- One-tap “Publish as Situation” → creates the semantic Note (constraint root) with all extracted properties
- Option to keep private / circle / network
- Immediate local match suggestions appear as the Situation firms up

### UX notes
- Progressive disclosure: start with text/voice; surface camera/location/mood chips as confidence grows
- No blank editor. The detector is the compose surface.
- Can be invoked from any other mode as a floating action or voice trigger.

## 2. Multi-Situation Monitor

Fundamental home or secondary tab. Timeline / card stack of the user’s active Situations.

- Each card shows: summary, phase cache, match count, linked Conversation indicator, urgency
- Swipe or tap to open Single Situation
- Filter by active / waiting / completed / disputed
- Quick actions: add evidence, publish update, open linked Conversation

## 3. Single Situation + Situation Editor

Focused view of one Situation and its reply graph. For own Situations this is also the editor.

### Representation views (switchable)
Own Situations support three simultaneous or toggleable representations of the same object:

| View | What it shows | Edit behavior |
|------|---------------|---------------|
| **As Note** | Human summary + structured property chips + freeform notes + evidence | Direct edit of summary, chips, and attachments |
| **Semantic Graph** | Taxonomy / tag cloud + editable language map of the Situation (keys, operators, values, inferred aliases) | Add/remove/reweight tags and properties; see what the matcher will treat as constraints |
| **JSON Object** | Canonical structured object (or pretty-printed Note body) | Raw edit with validation; advanced / developer path |

The semantic graph / tag cloud is the bridge: matching stays under the hood, but the language the Situation is written in is visible and editable. Changes in any view update the others.

### Editor mode behavior
Two viable patterns (choose one or offer as preference):

- **Toggle**: Single Situation opens in view mode; explicit “Edit” enters edit mode across all three representations. Publish / Cancel exits.
- **Always editable**: Own Situations are live. Inline edits to chips, tags, or summary autosave as a replacement Note (predecessor linked). No separate mode switch. Best for rapid refinement while matching is running.

Recommendation for prototype: **always editable** for own Situations, with a clear “Published / Draft” state and an undo stack. Other people’s Situations remain read-only.

### Rest of the Single Situation surface
- Header: summary, properties, locus, needBy, budget
- Match rail: ranked Offers (score + explanation) — updates as the Situation is edited
- Linked Conversation thread (Messages, with primitive attachments inline)
- Phase timeline: Offer → counter → Agreement (optional) → Engagement → Invoice → Payment → Receipt
- Actions: counter-offer (only after Offer exists), create Invoice, record Payment, request Endorsement, open Dispute
- Evidence tray: photos, audio, location pins attached to the Situation or Engagement

## 4. Other Situations

Network / discovery surface.

- Feed or map of public / circle Situations that match the user’s Profile facts or standing Offers
- Tap to view read-only or to respond with an Offer
- Filters: locus radius, category, urgency, rails accepted

## Cross-cutting

- Conversations are always linked to a Situation (or created from one). They are not a top-level free-floating inbox.
- Bottom nav or gesture: Detector | Monitor | Discover | Profile
- Local-first: all modes work offline; network sync is progressive.
- Everything created is editable. Own Situations expose the three views (Note / Semantic Graph / JSON).
- Progressive disclosure: advanced property editing and raw JSON live behind the view switcher, not a separate developer mode.

## Mapping to primitives

| UI surface | Primary primitives |
|------------|--------------------|
| Situation Detector | Situation (create) |
| Multi Monitor | Situation (list), Engagement (phase) |
| Single Situation + Editor | Situation (view/edit) + Offer chain + Conversation/Message + Engagement + Invoice/Payment/Receipt |
| Other Situations | Situation (network) ↔ Offer (listing) matching |

This layout keeps the semantic engine under the hood while making the human unit of work the Situation, and making the language of that Situation visible and editable.
