/**
 * monkeypanel_tree.js — Situation-first navigation for MonkeyPanel prototype
 * Format kept compatible with the v1 row style so existing parsers can adapt.
 *
 * [ id, title, tagline, ...children ]
 */
(function (root) {
  "use strict";

  root.MONKEYPANEL_TREE = {
    version: "prototype",
    ecosystem: {
      id: "mb",
      title: "MonkeyBusiness",
      tagline: "Situations, Trackers, Triggers."
    },
    groups: [
      ["situations", "Situations", "The human unit of work.",
        ["detector", "Detector", "Assemble a Situation from text, audio, camera, location, mood."],
        ["monitor", "Monitor", "Active Situations, Doing Mode, phase filters."],
        ["discover", "Discover", "Other Situations on the network."],
        ["situation", "Single Situation", "Focused view and editor."]
      ],
      ["watch", "Watch & Act", "Trackers observe. Triggers act.",
        ["trackers", "Trackers", "Internal and external watches."],
        ["triggers", "Triggers", "Armed actions."],
        ["templates", "Templates", "Starters for Situations, Trackers, Triggers, Rules."]
      ],
      ["self", "Self", "Profile, rules, and identity.",
        ["profile", "Profile", "Public and private profile."],
        ["rules", "New Rules", "Always-on constraints and goals."],
        ["systemnotes", "System Notes", "Definitions that Trackers and Triggers cite."]
      ]
    ]
  };
})(typeof window !== "undefined" ? window : this);
