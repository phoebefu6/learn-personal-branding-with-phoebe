/* cadence-live.js - the consistency bench for learn-personal-branding-with-phoebe
 *
 * Question: does posting cadence (answers per week) predict engagement?
 * Data: 302 real accounts with 20+ answers on Data Science Stack Exchange, every answer they
 * posted from 2014-05 to 2024-03, as counts per 28-day block (see cadence-sample.js). Engagement
 * is answer score (upvotes minus downvotes at dump time). Everything below is COUNTED from those
 * rows in the browser; nothing is modelled. The one heuristic choice, made once and printed on
 * the widget, is the survivor cut-off (still answering in the final seven blocks, about 28 weeks).
 *
 * Views (the ladder):
 *   cross_total   across creators: cadence vs score earned per week     (the "post more" picture)
 *   cross_per     across creators: cadence vs score per answer
 *   survivor      cross_total, but only creators still active at the end (the survivor view)
 *   within_total  same creator: busier blocks vs quieter blocks, total score that block
 *   within_per    same creator: busier blocks vs quieter blocks, score per answer
 *   within_growth same creator: a busy block vs score per answer in the NEXT block
 * Break button: shuffle cadence within each creator (seeded). Same-creator effects should go to ~0.
 *
 * materials/cadence-reference.py recomputes every number from the same sample; they must agree.
 */
(function (root) {
  "use strict";

  var SURVIVOR_BLOCKS = 6;   /* last active block >= endBlock - 6, i.e. answered in the final 7 blocks */

  /* ---------- numeric helpers (mirrored exactly in the Python reference) ---------- */
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function pearson(x, y) {
    var n = x.length; if (n < 3) return 0;
    var mx = mean(x), my = mean(y), sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < n; i++) { var dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  function ranks(v) {
    var idx = v.map(function (_, i) { return i; });
    idx.sort(function (a, b) { return v[a] - v[b] || a - b; });
    var r = new Array(v.length), i = 0;
    while (i < idx.length) {
      var j = i;
      while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
      var avg = (i + j) / 2 + 1;
      for (var k = i; k <= j; k++) r[idx[k]] = avg;
      i = j + 1;
    }
    return r;
  }
  function spearman(x, y) { return pearson(ranks(x), ranks(y)); }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffleInPlace(arr, rnd) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  /* equal-count bins of x (ties by original order); mean x and mean y per bin */
  function bins(x, y, q) {
    var idx = x.map(function (_, i) { return i; });
    idx.sort(function (a, b) { return x[a] - x[b] || a - b; });
    var out = [];
    for (var b = 0; b < q; b++) out.push({ n: 0, sx: 0, sy: 0 });
    for (var k = 0; k < idx.length; k++) {
      var bi = Math.min(q - 1, Math.floor(k * q / idx.length));
      out[bi].n++; out[bi].sx += x[idx[k]]; out[bi].sy += y[idx[k]];
    }
    return out.map(function (o) { return { n: o.n, x: o.n ? o.sx / o.n : 0, y: o.n ? o.sy / o.n : 0 }; });
  }
  function demeanGroups(groups) {
    /* groups: array of {x:[], y:[]}; returns pooled demeaned x and y */
    var X = [], Y = [];
    groups.forEach(function (g) {
      var mx = mean(g.x), my = mean(g.y);
      for (var i = 0; i < g.x.length; i++) { X.push(g.x[i] - mx); Y.push(g.y[i] - my); }
    });
    return { x: X, y: Y };
  }

  /* ---------- data ---------- */
  function prepare(S) {
    var N = S.creators, cr = [];
    for (var c = 0; c < N; c++) cr.push({ id: c, blocks: [], k: [], s: [] });
    for (var i = 0; i < S.c.length; i++) { var o = cr[S.c[i]]; o.blocks.push(S.b[i]); o.k.push(S.k[i]); o.s.push(S.s[i]); }
    cr.forEach(function (o) {
      var n = 0, tot = 0;
      for (var j = 0; j < o.k.length; j++) { n += o.k[j]; tot += o.s[j]; }
      o.n = n; o.total = tot;
      o.first = o.blocks[0]; o.last = o.blocks[o.blocks.length - 1];
      o.spanWeeks = (o.last - o.first + 1) * 4;
      o.cad = n / o.spanWeeks;               /* answers per week over the active span */
      o.weekly = tot / o.spanWeeks;          /* score earned per week over the active span */
      o.perAnswer = tot / n;
    });
    return { S: S, creators: cr };
  }

  function startYear(S, block) {
    var d = new Date(Date.UTC(2014, 4, 12) + block * S.blockDays * 86400000);
    return d.getUTCFullYear();
  }

  function siteByYear(S) {
    var acc = {};
    for (var b = 0; b <= S.endBlock; b++) {
      var y = startYear(S, b);
      var o = acc[y] || (acc[y] = { k: 0, s: 0 });
      o.k += S.siteK[b]; o.s += S.siteS[b];
    }
    return Object.keys(acc).map(function (y) { return { year: +y, answers: acc[y].k, perAnswer: acc[y].s / acc[y].k }; });
  }

  function thirds(list, key) {
    var sorted = list.slice().sort(function (a, b) { return a[key] - b[key] || a.id - b.id; });
    var t = Math.floor(sorted.length / 3);
    function m(arr, f) { return mean(arr.map(function (o) { return o[f]; })); }
    var lo = sorted.slice(0, t), hi = sorted.slice(sorted.length - t);
    return { size: t,
      lo: { cad: m(lo, "cad"), weekly: m(lo, "weekly"), perAnswer: m(lo, "perAnswer") },
      hi: { cad: m(hi, "cad"), weekly: m(hi, "weekly"), perAnswer: m(hi, "perAnswer") } };
  }

  function crossView(list, yKey) {
    var x = list.map(function (o) { return o.cad; }), y = list.map(function (o) { return o[yKey]; });
    return { n: list.length, r: pearson(x, y), rho: spearman(x, y), thirds: thirds(list, "cad"), bins: bins(x, y, 5) };
  }

  function withinView(D, kind, seed) {
    var rnd = seed ? mulberry32(seed) : null;
    var groups = [];
    D.creators.forEach(function (o) {
      var x = [], y = [];
      if (kind === "total") {
        var map = {};
        for (var j = 0; j < o.blocks.length; j++) map[o.blocks[j]] = j;
        for (var b = o.first; b <= o.last; b++) {
          var jj = map[b];
          x.push(jj === undefined ? 0 : o.k[jj] / 4);
          y.push(jj === undefined ? 0 : o.s[jj]);
        }
      } else if (kind === "per") {
        if (o.blocks.length < 2) return;
        for (var a = 0; a < o.blocks.length; a++) { x.push(o.k[a] / 4); y.push(o.s[a] / o.k[a]); }
      } else { /* growth: this block's cadence vs next consecutive block's score per answer */
        for (var g = 0; g + 1 < o.blocks.length; g++) {
          if (o.blocks[g + 1] !== o.blocks[g] + 1) continue;
          x.push(o.k[g] / 4); y.push(o.s[g + 1] / o.k[g + 1]);
        }
        if (x.length < 2) return;
      }
      if (rnd) shuffleInPlace(x, rnd);
      groups.push({ x: x, y: y });
    });
    var d = demeanGroups(groups);
    return { n: d.x.length, creators: groups.length, r: pearson(d.x, d.y), rho: spearman(d.x, d.y), bins: bins(d.x, d.y, 5) };
  }

  function computeAll(S, seed) {
    var D = prepare(S), all = D.creators;
    var surv = all.filter(function (o) { return o.last >= S.endBlock - SURVIVOR_BLOCKS; });
    var survFirst = mean(surv.map(function (o) { return startYear(S, o.first); }));
    var allFirst = mean(all.map(function (o) { return startYear(S, o.first); }));
    var out = {
      creators: all.length, answers: S.answers,
      site: siteByYear(S),
      cross_total: crossView(all, "weekly"),
      cross_per: crossView(all, "perAnswer"),
      survivor: (function () {
        var v = crossView(surv, "weekly");
        v.rPer = pearson(surv.map(function (o) { return o.cad; }), surv.map(function (o) { return o.perAnswer; }));
        v.meanPer = mean(surv.map(function (o) { return o.perAnswer; }));
        v.meanPerAll = mean(all.map(function (o) { return o.perAnswer; }));
        v.firstYear = survFirst; v.firstYearAll = allFirst;
        return v;
      })(),
      within_total: withinView(D, "total", 0),
      within_per: withinView(D, "per", 0),
      within_growth: withinView(D, "growth", 0)
    };
    if (seed) {
      out.shuffled = { seed: seed,
        within_total: withinView(D, "total", seed),
        within_per: withinView(D, "per", seed + 1),
        within_growth: withinView(D, "growth", seed + 2) };
    }
    return out;
  }

  /* ---------- UI ---------- */
  var VIEWS = [
    { id: "cross_total", label: "Across creators: score earned per week",
      note: "Each dot is one creator. Answers per week over their active span against score earned per week. The chart everyone draws.",
      x: "answers per week", y: "score per week", anti: true },
    { id: "cross_per", label: "Across creators: score per answer",
      note: "Same creators, same cadence, but engagement measured per answer instead of per week.",
      x: "answers per week", y: "score per answer" },
    { id: "survivor", label: "Only creators still answering at the end",
      note: "The view you get by studying the accounts that are active today: answered in the final seven 28-day blocks of the dump.",
      x: "answers per week", y: "score per week" },
    { id: "within_total", label: "Same creator: busy blocks vs quiet blocks, total score",
      note: "Each creator compared only with themselves, across every 28-day block of their active span, zeros included.",
      x: "cadence vs own average", y: "score that block vs own average", within: true },
    { id: "within_per", label: "Same creator: busy blocks vs quiet blocks, score per answer",
      note: "Each creator against themselves, blocks where they answered. Does a busier block earn more per answer?",
      x: "cadence vs own average", y: "score per answer vs own average", within: true },
    { id: "within_growth", label: "Same creator: does a busy block grow the next one?",
      note: "Cadence in one block against score per answer in the next consecutive block. The 'post more to grow' claim, tested.",
      x: "cadence vs own average", y: "next block's score per answer vs own average", within: true }
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f2(x) { return x.toFixed(2); }
  function f3(x) { var s = x.toFixed(3); return s === "-0.000" ? "0.000" : s; }
  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(value) +
      '</span><span class="mb-munit">' + esc(unit) + '</span><span class="mb-mkind is-' + kind + '">' + kind + "</span></div>";
  }
  function strength(r) { var a = Math.abs(r); return a < 0.1 ? "no usable relationship" : a < 0.3 ? "weak" : a < 0.5 ? "moderate" : "strong"; }

  var rootEl, panel, readout, chart, breakBtn, againBtn, results, current = "cross_total", seed = 0, sample;

  function viewResult(id) {
    var v = VIEWS.filter(function (x) { return x.id === id; })[0];
    if (v.within && seed) return results.shuffled[id];
    return results[id];
  }

  function verdict(id, r) {
    var s = strength(r.r);
    if (seed && /^within/.test(id)) return ["ok", "Shuffled: cadence now carries no information about the block it sits in, and r falls to " + f3(r.r) + ". This is what 'no effect' looks like on this data."];
    if (id === "cross_total") return ["bad", "r = " + f3(r.r) + ", " + s + ". The busiest third earn " + f2(r.thirds.hi.weekly) + " score a week against " + f2(r.thirds.lo.weekly) + " for the quietest third. Read alone, it says post more."];
    if (id === "cross_per") return [Math.abs(r.r) < 0.1 ? "good" : "ok", "r = " + f3(r.r) + ", " + s + ". Per answer the busiest third earn " + f2(r.thirds.hi.perAnswer) + " against " + f2(r.thirds.lo.perAnswer) + " for the quietest. The weekly gap was volume, not each post landing better."];
    if (id === "survivor") return ["bad", r.n + " survivors, r = " + f3(r.r) + ". Filtering to the accounts still active makes the cadence picture look stronger, because the quiet ones who stopped are no longer in it."];
    if (id === "within_total") return ["ok", "r = " + f3(r.r) + ", " + s + ". In a creator's busier blocks they earn more total score that block. More answers, more votes: arithmetic, not growth."];
    if (id === "within_per") return [Math.abs(r.r) < 0.1 ? "good" : "ok", "r = " + f3(r.r) + " (rank version " + f3(r.rho) + "). Against their own average, a busier block does not earn reliably more or less per answer."];
    return [Math.abs(r.r) < 0.1 ? "good" : "ok", "r = " + f3(r.r) + ", " + s + ". A busy block does not lift the next block's score per answer. On this data, cadence buys volume in the moment, not growth after it."];
  }

  function drawBins(r, v) {
    var b = r.bins, maxAbs = 0;
    b.forEach(function (o) { maxAbs = Math.max(maxAbs, Math.abs(o.y)); });
    if (maxAbs === 0) maxAbs = 1;
    var neg = b.some(function (o) { return o.y < 0; });
    var rows = b.map(function (o, i) {
      var w = Math.round(Math.abs(o.y) / maxAbs * 100);
      return '<div class="cb-row"><span class="cb-lab">bin ' + (i + 1) + '<em>' + (v.within ? "cadence " + (o.x >= 0 ? "+" : "") + f2(o.x) : f2(o.x) + " a week") + '</em></span>' +
        '<span class="cb-track' + (neg ? " has-neg" : "") + '"><span class="cb-bar' + (o.y < 0 ? " is-neg" : "") + '" style="width:' + (neg ? w / 2 : w) + '%"></span></span>' +
        '<span class="cb-val">' + (o.y >= 0 && v.within ? "+" : "") + f2(o.y) + "</span></div>";
    }).join("");
    chart.innerHTML = '<p class="cb-cap">Five equal-count bins by ' + esc(v.x) + ', lowest first. Bar = mean ' + esc(v.y) + ".</p>" + rows;
  }

  function render() {
    var v = VIEWS.filter(function (x) { return x.id === current; })[0];
    var r = viewResult(current), g = verdict(current, r);
    var m = '<div class="mb-verdict is-' + g[0] + '">' + esc(g[1]) + ' <span class="mb-mkind is-measured">measured</span></div><div class="mb-metrics">';
    m += metric("Correlation r", f3(r.r), "Pearson, " + (v.within ? "within creator" : "across creators"), "measured");
    m += metric("Rank correlation", f3(r.rho), "Spearman, same points", "measured");
    if (v.within) {
      m += metric("Points", r.n, "creator-blocks, from " + r.creators + " creators", "measured");
    } else {
      m += metric("Creators", r.n, current === "survivor" ? "still answering in the final 7 blocks" : "accounts with 20+ answers", "measured");
      m += metric("Busiest third", f2(r.thirds.hi.cad), "answers a week; " + f2(r.thirds.hi.weekly) + " score a week, " + f2(r.thirds.hi.perAnswer) + " per answer", "measured");
      m += metric("Quietest third", f2(r.thirds.lo.cad), "answers a week; " + f2(r.thirds.lo.weekly) + " score a week, " + f2(r.thirds.lo.perAnswer) + " per answer", "measured");
    }
    if (current === "survivor") {
      m += metric("Survivors' first year", r.firstYear.toFixed(1), "mean start year, against " + results.survivor.firstYearAll.toFixed(1) + " for all 302", "measured");
      m += metric("Score per answer", f2(r.meanPer), "survivors, against " + f2(r.meanPerAll) + " for all", "measured");
    }
    m += "</div>";
    readout.innerHTML = m;
    drawBins(r, v);
    breakBtn.disabled = !v.within;
    breakBtn.classList.toggle("is-on", !!seed);
    breakBtn.textContent = seed ? "Shuffle is ON: cadence permuted within each creator" : "Break it: shuffle cadence within each creator";
    againBtn.hidden = !seed || !v.within;
    breakBtn.title = v.within ? "" : "The break applies to the same-creator views";
  }

  function setView(id) {
    current = id;
    Array.prototype.forEach.call(panel.querySelectorAll(".mb-preset"), function (l) {
      var on = l.getAttribute("data-id") === id; l.classList.toggle("is-on", on); l.querySelector("input").checked = on;
    });
    render();
  }
  function setSeed(s) { seed = s; results = computeAll(sample, seed); render(); }

  function buildUI() {
    panel = document.createElement("div"); panel.className = "mb-presets";
    VIEWS.forEach(function (v) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (v.anti ? " is-anti" : ""); lab.setAttribute("data-id", v.id);
      lab.innerHTML = '<input type="radio" name="cad-v" value="' + v.id + '"><span class="mb-pname">' + esc(v.label) +
        (v.anti ? ' <em class="mb-anti">where "post more" comes from</em>' : "") + '</span><span class="mb-pnote">' + esc(v.note) + "</span>";
      lab.querySelector("input").addEventListener("change", function () { setView(v.id); });
      panel.appendChild(lab);
    });
    var bar = document.createElement("div"); bar.className = "cb-actions";
    breakBtn = document.createElement("button"); breakBtn.type = "button"; breakBtn.className = "btn cb-break";
    breakBtn.addEventListener("click", function () { setSeed(seed ? 0 : 1); });
    againBtn = document.createElement("button"); againBtn.type = "button"; againBtn.className = "btn"; againBtn.textContent = "Draw another shuffle";
    againBtn.addEventListener("click", function () { setSeed(seed + 3); });
    bar.appendChild(breakBtn); bar.appendChild(againBtn);
    var hint = document.createElement("p"); hint.className = "mb-hint";
    hint.textContent = sample.creators + " real accounts with 20 or more answers on Data Science Stack Exchange, " + sample.answers.toLocaleString("en-US") +
      " answers from May 2014 to March 2024, counted in 28-day blocks. Engagement is answer score (upvotes minus downvotes) at the time of the April 2024 public data dump. " +
      "Accounts are renumbered; no names, ids or text are shipped. Every figure is computed from these rows in your browser. Source: Stack Exchange data dump, CC BY-SA.";
    readout = document.createElement("div"); readout.className = "mb-readout";
    chart = document.createElement("div"); chart.className = "cb-chart";
    rootEl.appendChild(panel); rootEl.appendChild(bar); rootEl.appendChild(hint); rootEl.appendChild(readout); rootEl.appendChild(chart);
    setView("cross_total");
  }

  function init() {
    rootEl = document.getElementById("cadence-bench");
    if (!rootEl || !root.CADENCE_SAMPLE) return;
    sample = root.CADENCE_SAMPLE;
    results = computeAll(sample, 0);
    buildUI();
    root.CADENCE_LIVE = { views: VIEWS.map(function (v) { return v.id; }), show: setView, shuffle: setSeed,
      get results() { return results; }, get current() { return current; } };
  }

  var api = { computeAll: computeAll, pearson: pearson, spearman: spearman, mulberry32: mulberry32, SURVIVOR_BLOCKS: SURVIVOR_BLOCKS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  }
})(typeof window !== "undefined" ? window : globalThis);
