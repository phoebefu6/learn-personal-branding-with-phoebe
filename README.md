# Learn Personal Branding with Phoebe

Six 45-minute sessions on building a professional reputation that people can find and check:
what a stranger meets when they search your name, a niche only you can claim, proof instead of
adjectives, what posting cadence actually buys, owned and rented ground, and a system you can
keep. The running case is a constructed data analyst; every build-along runs on your own name.

**Live site:** https://phoebefu6.github.io/learn-personal-branding-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | A reputation is a search result | The ten-result audit: four kinds of result, two honest counts |
| 2 | Your niche: the onliness test | The competitor swap, 1,000 True Fans read at source, a measured line checker |
| 3 | Voice and proof: show the work | The proof ladder and one piece of real work made public |
| 4 | The consistency bench | "Post more" tested on 302 real accounts, computed in the browser |
| 5 | Platforms and formats: owned and rented ground | Digital sharecropping and a one-page platform map |
| 6 | A system you keep | A cadence you can keep, the idea bank, the quarterly re-audit |

The bench in session 4 (`assets/cadence-live.js`, data in `assets/cadence-sample.js`) holds
every answer posted by the 302 accounts with 20 or more answers on Data Science Stack Exchange,
May 2014 to March 2024, as counts per 28-day block. Across creators, the busiest third earn about
nine times the score a week of the quietest third (r 0.584); per answer the relationship is
slightly negative (r -0.070). Filtering to the 51 accounts still active at the end raises the
cross-creator correlation to 0.876. Holding each creator fixed, busier blocks earn more total score
(r 0.660) but not more per answer (r -0.005) and do not lift the next block (r 0.004). A break
button shuffles cadence within each creator and the same-creator effect falls to about zero.

Data: Stack Exchange data dump, April 2024 (archive.org/details/stackexchange), CC BY-SA. Only
derived counts are shipped; accounts are renumbered and carry no names, ids or text. The derived
sample is shared under CC BY-SA 4.0. Everything on the bench is computed from those rows, and an
independent Python run agrees with the browser on every number.

The positioning-line checker in session 2 (`assets/position-scorer.js`) is a word-list heuristic,
not a model, and says so on the widget.

Free, by Phoebe Fu.
