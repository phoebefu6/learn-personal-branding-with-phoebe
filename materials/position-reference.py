"""Independent Python reference for the positioning-line heuristic (assets/position-scorer.js).
The word lists are read from the JS file (they are data); the matching logic is re-implemented
here. Prints counts for the three constructed example drafts plus extra test lines; node must agree:
    python3 materials/position-reference.py ; node -e "<see bottom of this file>"
"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(HERE, "..", "assets", "position-scorer.js")).read()
def lst(name): return json.loads(re.search(r"var " + name + r" = (\[.*?\]);", js, re.S).group(1))
VP, V, P, O, A = (lst(n) for n in ("VAGUE_PHRASES", "VAGUE", "PROOF", "OUTCOME", "AUDIENCE"))
def tokens(t):
    out = [re.sub(r"[.\-']+$", "", x) for x in re.findall(r"[a-z0-9][a-z0-9'%+.\-]*", t.lower())]
    return [x for x in out if x]
def score(text):
    tk = tokens(text); used = [None] * len(tk); c = dict(audience=0, outcome=0, proof=0, vague=0)
    for ph in VP:
        p = tokens(ph); L = len(p); i = 0
        for i in range(0, len(tk) - L + 1):
            if all(used[i + j] is None and tk[i + j] == p[j] for j in range(L)):
                for j in range(L): used[i + j] = "vague"
                c["vague"] += 1
    for i, t in enumerate(tk):
        if used[i]: continue
        cls = "vague" if t in V else "proof" if (re.search(r"[0-9]", t) or t in P) else "outcome" if t in O else "audience" if t in A else None
        if cls: used[i] = cls; c[cls] += 1
    con = c["audience"] + c["outcome"] + c["proof"]
    return {"words": len(tk), **c, "specificity": round(con / (con + c["vague"]), 6) if con + c["vague"] else 0}
EX = [e for e in re.findall(r'text: "([^"]+)"', js)]
TESTS = EX + ["Seasoned, strategic thought leader and lifelong learner.", "", "Helping 3 warehouse teams find late orders before 9am."]
print(json.dumps([score(t) for t in TESTS], indent=0))
