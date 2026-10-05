/* position-scorer.js - a measured positioning-line checker for learn-personal-branding-with-phoebe
 *
 * A HEURISTIC, not a model and not a judge of quality. It counts words in four fixed lists and
 * prints the counts. It cannot tell whether a line is true, kind, or right for you; it can only
 * show how much of the line names WHO it is for, WHAT changes for them, and WHAT proves it,
 * against how much is the vocabulary every profile shares. The lists are printed on the widget.
 *
 * Matching rules (mirrored in materials/position-reference.py):
 *   text is lowercased; tokens are runs of [a-z0-9] plus internal ' % + . - characters
 *   multi-word vague phrases are matched first and consume their tokens
 *   then each remaining token is classed once, first match wins:
 *     vague list > proof (any digit, or the proof list) > outcome list > audience list
 *   specificity = concrete / (concrete + vague), concrete = audience + outcome + proof
 */
(function (root) {
  "use strict";

  var VAGUE_PHRASES = ["thought leader", "team player", "self-starter", "self starter", "lifelong learner",
    "best-in-class", "best in class", "world-class", "world class", "cutting-edge", "cutting edge",
    "game changer", "game-changer", "drive growth", "add value", "make an impact", "helping businesses", "next level"];
  var VAGUE = ["passionate", "results-driven", "driven", "innovative", "dynamic", "synergy", "visionary", "guru",
    "ninja", "rockstar", "wizard", "strategic", "leverage", "leveraging", "solutions", "expert", "enthusiast",
    "unlock", "unlocking", "empower", "empowering", "transform", "transforming", "transformation", "storyteller",
    "creative", "curious", "motivated", "hardworking", "detail-oriented", "insights", "journey", "mission",
    "excellence", "seasoned", "holistic", "disruptive", "data-driven", "impactful", "value", "growth", "synergies"];
  var PROOF = ["case", "study", "studies", "notebook", "notebooks", "repo", "repos", "github", "talk", "talks",
    "published", "wrote", "written", "built", "open-source", "teardown", "teardowns", "benchmark", "benchmarks",
    "newsletter", "essay", "essays", "portfolio", "demo", "demos", "paper", "papers", "write-up", "write-ups", "shipped"];
  var OUTCOME = ["cut", "cuts", "reduce", "reduces", "reduced", "save", "saves", "saved", "halve", "halves", "halved",
    "fewer", "faster", "prevent", "prevents", "avoid", "avoids", "catch", "catches", "find", "finds", "fix", "fixes",
    "forecast", "forecasts", "stop", "stops", "lower", "lowers", "spot", "spots", "check", "trust", "stockouts",
    "waste", "errors", "overtime", "churn", "delays", "late", "missed"];
  var AUDIENCE = ["analyst", "analysts", "engineer", "engineers", "manager", "managers", "founder", "founders",
    "clinic", "clinics", "hospital", "hospitals", "nurse", "nurses", "teacher", "teachers", "school", "schools",
    "retailer", "retailers", "grocer", "grocers", "grocery", "warehouse", "warehouses", "planner", "planners",
    "buyer", "buyers", "recruiter", "recruiters", "marketer", "marketers", "accountant", "accountants",
    "designer", "designers", "developer", "developers", "startup", "startups", "nonprofit", "nonprofits",
    "charity", "charities", "cfo", "cfos", "ops", "logistics", "fleet", "fleets", "store", "stores", "shop", "shops",
    "restaurant", "restaurants", "farmer", "farmers", "researcher", "researchers", "pharmacist", "pharmacists",
    "council", "councils", "dispatcher", "dispatchers", "scheduler", "schedulers", "controller", "controllers"];

  function tokens(text) {
    var m = String(text).toLowerCase().match(/[a-z0-9][a-z0-9'%+.\-]*/g) || [];
    return m.map(function (t) { return t.replace(/[.\-']+$/, ""); }).filter(function (t) { return t.length; });
  }

  function score(text) {
    var tk = tokens(text), used = new Array(tk.length), hits = [];
    var counts = { audience: 0, outcome: 0, proof: 0, vague: 0 };
    VAGUE_PHRASES.forEach(function (ph) {
      var p = tokens(ph), L = p.length;
      for (var i = 0; i + L <= tk.length; i++) {
        var ok = true;
        for (var j = 0; j < L; j++) if (used[i + j] || tk[i + j] !== p[j]) { ok = false; break; }
        if (ok) { for (var q = 0; q < L; q++) used[i + q] = "vague"; counts.vague++; hits.push({ cls: "vague", text: p.join(" ") }); }
      }
    });
    for (var i = 0; i < tk.length; i++) {
      if (used[i]) continue;
      var t = tk[i], cls = null;
      if (VAGUE.indexOf(t) >= 0) cls = "vague";
      else if (/[0-9]/.test(t) || PROOF.indexOf(t) >= 0) cls = "proof";
      else if (OUTCOME.indexOf(t) >= 0) cls = "outcome";
      else if (AUDIENCE.indexOf(t) >= 0) cls = "audience";
      if (cls) { used[i] = cls; counts[cls]++; hits.push({ cls: cls, text: t }); }
    }
    var concrete = counts.audience + counts.outcome + counts.proof;
    var spec = (concrete + counts.vague) ? concrete / (concrete + counts.vague) : 0;
    return { words: tk.length, counts: counts, concrete: concrete, specificity: spec, hits: hits,
      missing: ["audience", "outcome", "proof"].filter(function (k) { return counts[k] === 0; }) };
  }

  /* ---------- UI ---------- */
  var EXAMPLES = [
    { label: "Draft 1 (constructed)", text: "Passionate, results-driven data enthusiast helping businesses unlock insights and drive growth." },
    { label: "Draft 2 (constructed)", text: "Data analyst who builds forecasting dashboards for retail teams." },
    { label: "Draft 3 (constructed)", text: "I help grocery planners cut stockouts with forecasts they can check, one public teardown at a time." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function mount(el) {
    el.innerHTML = '<div class="ps-ex"></div><textarea class="ps-in" rows="3" aria-label="Your positioning line"></textarea>' +
      '<div class="ps-out mb-readout"></div><p class="mb-hint ps-lists"></p>';
    var ex = el.querySelector(".ps-ex"), ta = el.querySelector(".ps-in"), out = el.querySelector(".ps-out");
    EXAMPLES.forEach(function (e, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = e.label;
      b.addEventListener("click", function () { ta.value = e.text; run(); });
      ex.appendChild(b);
    });
    function run() {
      var r = score(ta.value), c = r.counts;
      function cell(lab, v, note) { return '<div class="mb-metric"><span class="mb-mlabel">' + lab + '</span><span class="mb-mvalue">' + v + '</span><span class="mb-munit">' + note + '</span><span class="mb-mkind is-heuristic">heuristic</span></div>'; }
      var miss = r.missing.length ? "Missing: " + r.missing.join(", ") + "." : "Names an audience, an outcome and a proof.";
      out.innerHTML = '<div class="mb-verdict is-' + (r.missing.length === 0 && c.vague === 0 ? "good" : (r.concrete > c.vague ? "ok" : "bad")) + '">' +
        esc(miss) + " " + r.words + " words. Specificity " + Math.round(r.specificity * 100) + '%. <span class="mb-mkind is-heuristic">heuristic</span></div>' +
        '<div class="mb-metrics">' + cell("Audience words", c.audience, "who it is for") + cell("Outcome words", c.outcome, "what changes for them") +
        cell("Proof", c.proof, "numbers and things you can open") + cell("Vague words", c.vague, "words every profile shares") + "</div>" +
        '<p class="ps-hits">' + (r.hits.length ? r.hits.map(function (h) { return '<span class="ps-hit is-' + h.cls + '">' + esc(h.text) + " · " + h.cls + "</span>"; }).join(" ") : "No listed words matched.") + "</p>";
    }
    el.querySelector(".ps-lists").textContent = "A word-list heuristic, not a model: it counts, it does not judge. Vague list: " + VAGUE.concat(VAGUE_PHRASES).join(", ") +
      ". Proof: any number, or " + PROOF.join(", ") + ". Outcome: " + OUTCOME.join(", ") + ". Audience: " + AUDIENCE.join(", ") +
      ". A word missing from a list scores nothing, so a sharp line in a field the lists do not know can score low. Read the counts, not the percentage.";
    ta.addEventListener("input", run);
    ta.value = EXAMPLES[0].text; run();
    return { run: run, input: ta };
  }

  function init() {
    var el = document.getElementById("position-scorer");
    if (el) root.POSITION_SCORER = { score: score, ui: mount(el), examples: EXAMPLES };
  }
  var api = { score: score, tokens: tokens, EXAMPLES: EXAMPLES, lists: { VAGUE: VAGUE, VAGUE_PHRASES: VAGUE_PHRASES, PROOF: PROOF, OUTCOME: OUTCOME, AUDIENCE: AUDIENCE } };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  }
})(typeof window !== "undefined" ? window : globalThis);
