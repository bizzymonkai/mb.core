/**
 * mb-nav.js — builds the left sidebar from MONKEYPANEL_TREE
 * and switches the main panel.
 */
(function (root) {
  "use strict";

  var raw = root.MONKEYPANEL_TREE;
  if (!raw || !raw.groups) {
    console.error("mb-nav.js requires monkeypanel_tree.js first.");
    return;
  }

  function rowId(row) { return row && row.length ? String(row[0]) : ""; }
  function rowTitle(row) { return row && row.length > 1 ? String(row[1]) : rowId(row); }
  function rowTagline(row) {
    return row && row.length > 2 && typeof row[2] === "string" ? row[2] : "";
  }
  function rowChildren(row) {
    var out = [];
    if (!row) return out;
    for (var i = 0; i < row.length; i++) {
      if (Object.prototype.toString.call(row[i]) === "[object Array]") out.push(row[i]);
    }
    return out;
  }

  function buildSidebar() {
    var nav = document.getElementById("mb-system-nav");
    if (!nav) return;
    nav.innerHTML = "";

    raw.groups.forEach(function (group) {
      var gId = rowId(group);
      var gTitle = rowTitle(group);
      var systems = rowChildren(group);

      var details = document.createElement("details");
      details.className = "mb-group";
      details.open = gId === "situations";

      var summary = document.createElement("summary");
      summary.className = "mb-group-title";
      summary.textContent = gTitle;
      details.appendChild(summary);

      var list = document.createElement("div");
      list.className = "mb-systems";

      systems.forEach(function (sys) {
        var sId = rowId(sys);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mb-system";
        btn.dataset.id = sId;
        btn.innerHTML = "<span class=\"mb-system-title\">" + rowTitle(sys) + "</span>" +
                        "<span class=\"mb-system-tag\">" + rowTagline(sys) + "</span>";
        btn.addEventListener("click", function () {
          select(sId);
        });
        list.appendChild(btn);
      });

      details.appendChild(list);
      nav.appendChild(details);
    });

    select("monitor");
  }

  function select(id) {
    var buttons = document.querySelectorAll(".mb-system");
    buttons.forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.id === id);
    });
    var panels = document.querySelectorAll(".mb-panel");
    var found = false;
    panels.forEach(function (p) {
      var on = p.dataset.panel === id;
      p.hidden = !on;
      if (on) found = true;
    });
    var hint = document.getElementById("mb-main-hint");
    if (hint) hint.hidden = found;
  }

  root.MBNav = { buildSidebar: buildSidebar, select: select };
})(typeof window !== "undefined" ? window : this);
