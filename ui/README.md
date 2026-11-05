# ui/

MonkeyPanel PWA shell.

Default input is the Situation detector. Trackers and Triggers have dedicated screens. The Multi-Situation Monitor is the fundamental overview.

## Proposed layout

```
ui/
  dashboard/          Multi-Situation Monitor (Doing Mode + Trackers + Triggers)
  detector/           Situation detector (multimodal compose)
  situation/          Single Situation + editor (Note / Semantic Graph / JSON)
  discover/           Other Situations (network / map / feed)
  tracker/            Dedicated Tracker screen (template or blank)
  trigger/            Dedicated Trigger screen (template or blank)
  templates/          Shared template library
  profile/            Profile, New Rules, SystemNotes
  components/         Shared cards, chips, match rail, phase timeline
  styles/             Shared CSS
```

## What is implemented

- `dashboard/` — static HTML prototype of the Multi-Situation Monitor

## Suggested next surfaces (in order)

1. **detector/** — Situation detector with text/voice/camera/location chips and New Rule detection
2. **situation/** — Single Situation with the three representation views and linked Trackers/Triggers
3. **tracker/** and **trigger/** — dedicated template-driven screens
4. **templates/** — library of Situation, Tracker, Trigger, Agreement, and New Rule starters
5. **discover/** — Other Situations feed or map

The dashboard is the first concrete surface. The others can be added as static prototypes or as components that consume the same local store.
