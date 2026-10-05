"""Independent Python reference for the consistency bench (assets/cadence-live.js).

Reads the same shipped sample (assets/cadence-sample.js), recomputes every view with plain
Python (no shared code), and prints canon JSON. The node run of the browser engine must print
the same numbers to 6 decimals before any page quotes one:

    python3 materials/cadence-reference.py > /tmp/py.json
    node materials/cadence-node.js > /tmp/node.json
    diff /tmp/py.json /tmp/node.json
"""
import json, math, os, re, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "..", "assets", "cadence-sample.js")).read()
S = json.loads(re.search(r"window\.CADENCE_SAMPLE = (\{.*\});", src, re.S).group(1))
SURVIVOR_BLOCKS = 6

def mean(a): return sum(a) / len(a) if a else 0.0
def pearson(x, y):
    n = len(x)
    if n < 3: return 0.0
    mx, my = mean(x), mean(y)
    sxy = sxx = syy = 0.0
    for a, b in zip(x, y):
        dx, dy = a - mx, b - my
        sxy += dx * dy; sxx += dx * dx; syy += dy * dy
    return sxy / math.sqrt(sxx * syy) if sxx > 0 and syy > 0 else 0.0
def ranks(v):
    idx = sorted(range(len(v)), key=lambda i: (v[i], i))
    r = [0.0] * len(v); i = 0
    while i < len(idx):
        j = i
        while j + 1 < len(idx) and v[idx[j + 1]] == v[idx[i]]: j += 1
        avg = (i + j) / 2 + 1
        for k in range(i, j + 1): r[idx[k]] = avg
        i = j + 1
    return r
def spearman(x, y): return pearson(ranks(x), ranks(y))

M32 = 0xFFFFFFFF
def to_i32(v):
    v &= M32
    return v - (1 << 32) if v & 0x80000000 else v
def imul(a, b): return to_i32((a & M32) * (b & M32))
def mulberry32(seed):
    st = [to_i32(seed)]
    def rnd():
        a = to_i32(st[0] + 0x6D2B79F5); st[0] = a
        t = imul(a ^ ((a & M32) >> 15), 1 | a)
        t = to_i32(to_i32(t + imul(t ^ ((t & M32) >> 7), 61 | t)) ^ t)
        return ((t ^ ((t & M32) >> 14)) & M32) / 4294967296
    return rnd
def shuffle(arr, rnd):
    for i in range(len(arr) - 1, 0, -1):
        j = math.floor(rnd() * (i + 1)); arr[i], arr[j] = arr[j], arr[i]
    return arr
def bins(x, y, q):
    idx = sorted(range(len(x)), key=lambda i: (x[i], i))
    out = [[0, 0.0, 0.0] for _ in range(q)]
    for k, i in enumerate(idx):
        b = min(q - 1, (k * q) // len(idx))
        out[b][0] += 1; out[b][1] += x[i]; out[b][2] += y[i]
    return [{"n": n, "x": sx / n if n else 0.0, "y": sy / n if n else 0.0} for n, sx, sy in out]

def start_year(b):
    return (datetime.date(2014, 5, 12) + datetime.timedelta(days=b * S["blockDays"])).year

cr = [{"id": c, "blocks": [], "k": [], "s": []} for c in range(S["creators"])]
for c, b, k, s in zip(S["c"], S["b"], S["k"], S["s"]):
    cr[c]["blocks"].append(b); cr[c]["k"].append(k); cr[c]["s"].append(s)
for o in cr:
    o["n"] = sum(o["k"]); o["total"] = sum(o["s"])
    o["first"], o["last"] = o["blocks"][0], o["blocks"][-1]
    sw = (o["last"] - o["first"] + 1) * 4
    o["cad"] = o["n"] / sw; o["weekly"] = o["total"] / sw; o["perAnswer"] = o["total"] / o["n"]

def thirds(lst):
    srt = sorted(lst, key=lambda o: (o["cad"], o["id"])); t = len(srt) // 3
    lo, hi = srt[:t], srt[len(srt) - t:]
    f = lambda arr, key: mean([o[key] for o in arr])
    return {"size": t, "lo": {k: f(lo, k) for k in ("cad", "weekly", "perAnswer")},
            "hi": {k: f(hi, k) for k in ("cad", "weekly", "perAnswer")}}
def cross(lst, key):
    x = [o["cad"] for o in lst]; y = [o[key] for o in lst]
    return {"n": len(lst), "r": pearson(x, y), "rho": spearman(x, y), "thirds": thirds(lst), "bins": bins(x, y, 5)}
def within(kind, seed):
    rnd = mulberry32(seed) if seed else None
    X, Y, groups = [], [], 0
    for o in cr:
        x, y = [], []
        if kind == "total":
            m = {b: j for j, b in enumerate(o["blocks"])}
            for b in range(o["first"], o["last"] + 1):
                j = m.get(b)
                x.append(0.0 if j is None else o["k"][j] / 4); y.append(0 if j is None else o["s"][j])
        elif kind == "per":
            if len(o["blocks"]) < 2: continue
            for a in range(len(o["blocks"])): x.append(o["k"][a] / 4); y.append(o["s"][a] / o["k"][a])
        else:
            for g in range(len(o["blocks"]) - 1):
                if o["blocks"][g + 1] != o["blocks"][g] + 1: continue
                x.append(o["k"][g] / 4); y.append(o["s"][g + 1] / o["k"][g + 1])
            if len(x) < 2: continue
        if rnd: shuffle(x, rnd)
        mx, my = mean(x), mean(y)
        X += [v - mx for v in x]; Y += [v - my for v in y]; groups += 1
    return {"n": len(X), "creators": groups, "r": pearson(X, Y), "rho": spearman(X, Y), "bins": bins(X, Y, 5)}

site = {}
for b in range(S["endBlock"] + 1):
    y = start_year(b); site.setdefault(y, [0, 0]); site[y][0] += S["siteK"][b]; site[y][1] += S["siteS"][b]
surv = [o for o in cr if o["last"] >= S["endBlock"] - SURVIVOR_BLOCKS]
sv = cross(surv, "weekly")
sv.update({"rPer": pearson([o["cad"] for o in surv], [o["perAnswer"] for o in surv]),
           "meanPer": mean([o["perAnswer"] for o in surv]), "meanPerAll": mean([o["perAnswer"] for o in cr]),
           "firstYear": mean([start_year(o["first"]) for o in surv]), "firstYearAll": mean([start_year(o["first"]) for o in cr])})
out = {"creators": len(cr), "answers": S["answers"],
       "site": [{"year": y, "answers": v[0], "perAnswer": v[1] / v[0]} for y, v in sorted(site.items())],
       "cross_total": cross(cr, "weekly"), "cross_per": cross(cr, "perAnswer"), "survivor": sv,
       "within_total": within("total", 0), "within_per": within("per", 0), "within_growth": within("growth", 0)}
SEEDS = [1, 4, 7, 10, 13]
out["shuffled"] = {str(sd): {"within_total": within("total", sd), "within_per": within("per", sd + 1),
                             "within_growth": within("growth", sd + 2)} for sd in SEEDS}

def rnd6(v):
    if isinstance(v, float):
        r = math.floor(v * 1e6 + 0.5) / 1e6
        return int(r) if r == int(r) else r
    if isinstance(v, dict): return {k: rnd6(x) for k, x in v.items()}
    if isinstance(v, list): return [rnd6(x) for x in v]
    return v
print(json.dumps(rnd6(out), indent=1, sort_keys=True))
