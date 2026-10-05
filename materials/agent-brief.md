# Agent brief - shared by every fan-out page of learn-personal-branding-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   how many options each question has (4):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-personal-branding-with-phoebe/courses/01-a-reputation-is-a-search-result.html`
   For rhythm on a numbers-heavy page you may also skim
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-personal-branding-with-phoebe/courses/04-the-consistency-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-personal-branding-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens (first 30 lines):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-personal-branding-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-personal-branding-with-phoebe</a> / Session N of 6`,
#toggle-all, #zoom-toggle) · masthead (eyebrow "Learn Personal Branding with Phoebe · Session N of 6",
h1 with one `<span class="accent">`, .sub, .chip-row with the level chip (🟡 Core for sessions 2-3,
🟠 Deeper for sessions 5-6), two `.chip.audience`, `.chip.time` "45 min", .agenda a1-a4 with flex weights)
· main.wrap · section#intro (Part 0: kicker, .lede, .legend pills as in the template, .callout.win
"★ What you walk out with tonight.") · 3 Parts, each `section.section#part-N` with section-kicker
(klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card`
accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one
`.callout.example` with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker
`.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure, `.steps > .step`, each with a `p` and a
`.prompt-box.good` carrying a `span.label` "★ Step N · ..." BELOW the p; build-alongs are worksheets
and templates, not code) · section#exercise Homework (ol, 4 items) · section#quiz (3 x
`.quiz-q data-answer="0-based"`, `p.qtext`, 4 x `button.qopt` "A · ...", `p.qwhy`; one
`p.quiz-score` after the last; vary the correct letter) · section#official, h2 EXACTLY "What this
session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ + name +
note), then the `.mono` line EXACTLY "Every fact on this page, and its verification tier, is recorded
in the course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin
this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" ·
footer.pagefoot · `<script src="../assets/app.js?v=1">`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn personal branding with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data print "your
  numbers will differ", never invented outputs as if run.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked R or U is "reported" or
  "unverified" on the page, never quoted in quotation marks as the author's words.
- NEVER "lottery" or "lotteries"; say the mechanism. A verbatim quoted title is the only exception.
- Default to the English word. Any Chinese term carries its English in brackets, every occurrence.
- Titles, widget ids and class names must not collide with siblings. Do NOT use these headings or
  phrases as titles: "Proof, not promises", "Your voice, captured", "The house voice, written
  down", "Consistency is a pipeline", "Your platform roadmap", "One idea, many formats",
  "Trust is a cadence". Never use "Cadence" as a name (it is a sibling's fictional brand). Ids
  `cadence-bench` and `position-scorer` are reserved; only session 2 mounts `position-scorer`.
- **FICTIONAL CASE ONLY (Phoebe, 2026-10-05).** The running case is Ines Calloway, a CONSTRUCTED
  mid-career data analyst (demand forecasting, regional grocery chain). Label her "constructed" at
  least once on the page (first mention). NEVER use Phoebe's own journey, LinkedIn, courses,
  gallery, employers or clients as a case or example, never write in a way that implies Ines is
  Phoebe, and never mention Phoebe in body text at all. Real-world callouts may describe generic,
  unnamed professional situations or the real sources in the map; never a named private person.
- Seams: link, never teach. Company brand strategy/naming/identity ->
  https://phoebefu6.github.io/learn-ai-branding-with-phoebe/ ; content production and AI writing
  -> https://phoebefu6.github.io/learn-ai-content-with-phoebe/ ; marketing fundamentals ->
  https://phoebefu6.github.io/learn-marketing-with-phoebe/ ; spoken/written communication ->
  https://phoebefu6.github.io/learn-communication-with-phoebe/ ; interview storytelling: "a planned
  interview course", no link.
- Never invent creator-economy statistics (follower counts, "posts per week that work", reach
  percentages, salary uplift). The map lists which are unverified; say so if you mention them.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): `#AF4B5D` (primary) `#74283A` (deep) `#9A3F51`
(mid) `#F0C8D0` (soft) `#FCEFF2` (tint) `#2B1A21` (ink) `#6B5560` (muted) `#DCC6CD` (faint)
`#EFE1E5` (hairline) `#9A5800` (ochre contrast) `#6B3D00` (ochre ink) `#FDF2E2` (ochre tint)
`#FFFCFC` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `s<session><letter>` (s2a, s2b, s2c, s2d;
  s3a...; s5a...; s6a...).
- `<defs>` holds with prefix P: a wobble filter `id="PSk"` (`feTurbulence type="fractalNoise"
  baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap scale="2.4"
  xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%" height="106%"`), a
  hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one `#AF4B5D` line, opacity .5), an
  open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, stroke `#2B1A21` 1.6). ALL shapes
  sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#2B1A21" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-1 to 1 degrees
  for items, under 1 for panels). Fills: white, `#FCEFF2`, the hachure for "the pile" or "the
  data", and the ochre `#9A5800` ONLY for the one thing the figure is about. One doodle anchor per
  figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px
  ink label · `.PS` 400 11px muted · `.PB` 800 11px `#6B3D00` · `.PV` 800 16-20px `#74283A` value ·
  `.PW` 800 11-12px white on a fill (only on `#AF4B5D`, `#74283A`, `#9A3F51`, `#9A5800` or `#6B5560`)
  · `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects.
- ALL `<text>` outside the filtered group, sans stack `Inter, sans-serif`, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 8px. No line, arrow or curve may cross any label (the gate flags it). When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM (what
  moves where, what is compared with what, what a test catches), never a metaphor literally, never
  decoration.

## Voice and honesty

Every Part gets a real-world angle: a source from the map, or a generic unnamed professional
situation, or Ines (constructed). Ines's artefacts are fixed in the map (search audit counts, the
three drafts and their scores); reuse them exactly. Anything else about her you invent must be
labelled constructed and must not contradict the map.

## Footer chain and session titles

Footer left: `Session N of 6 · learn-personal-branding-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>`
Footer right: `<a href="PREV.html">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT.html">Next: <title> →</a>`
(session 6: `← Prev: ...` and `<a href="../index.html">Course home →</a>`).

Session titles (exact; h1 carries one accent span as shown):
1. `01-a-reputation-is-a-search-result.html` · A reputation is a search result · h1 `A reputation is <span class="accent">a search result</span>`
2. `02-the-onliness-test.html` · Your niche: the onliness test · h1 `Your niche: <span class="accent">the onliness test</span>`
3. `03-show-the-work.html` · Voice and proof: show the work · h1 `Voice and proof: <span class="accent">show the work</span>`
4. `04-the-consistency-bench.html` · The consistency bench · h1 `The consistency <span class="accent">bench</span>`
5. `05-owned-and-rented-ground.html` · Platforms and formats: owned and rented ground · h1 `Platforms and formats: <span class="accent">owned and rented ground</span>`
6. `06-a-system-you-keep.html` · A system you keep · h1 `A system <span class="accent">you keep</span>`
