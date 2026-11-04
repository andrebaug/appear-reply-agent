#!/usr/bin/env python3
"""Pull the brief-worthy facts out of an Appear discovery audit.

Competitors here are the businesses ChatGPT and Claude actually recommended in
the audit answers, so the brief never has to guess who the rivals are.

Usage: python3 scripts/audit_facts.py <audit link or report id>
"""
import json
import re
import sys
import urllib.request

API = "https://audit.joinappear.com/api/report/{}"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    m = re.search(r"([a-z0-9]{8,})/?$", sys.argv[1].strip())
    if not m:
        sys.exit("Could not find a report id in " + sys.argv[1])
    req = urllib.request.Request(API.format(m.group(1)), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        report = json.load(r)["report"]

    disc = report.get("discovery", {}).get("headline", {})
    rec = report.get("recognition", {}).get("headline", {})
    buyer = report.get("buyerOptions", {})
    brand = buyer.get("brand", {})

    # Discovery answers that left the brand out, and who got named instead.
    misses = []
    for c in report.get("cells", []):
        if c.get("set") != "discovery" or c.get("mentioned"):
            continue
        named = [b["name"] for b in (c.get("transcription") or {}).get("businesses", [])][:3]
        if named:
            misses.append({"question": c.get("question"), "engine": c.get("engine"), "named_instead": named})

    site = report.get("siteMetrics", {})
    def scores(side):
        return {x["label"]: x.get("score") for x in (site.get(side) or {}).get("metrics", [])}

    brand_name = report.get("brandName") or ""
    top = report.get("topCompetitor") or ""
    # The audit marks brands it could not confirm; their questions and rivals are guesses.
    verified = "unverified" not in brand_name.lower() and bool(disc.get("measured"))

    out = {
        "verified": verified,
        "brand": brand_name,
        "domain": report.get("domain"),
        "ran_at": report.get("ranAt"),
        "engines": report.get("engines"),
        "discovery_questions": sorted({c["question"] for c in report.get("cells", []) if c.get("set") == "discovery"}),
        "mentioned_without_name": f'{disc.get("mentioned")} of {disc.get("measured")}' if disc.get("measured") else None,
        "recognised_by_name": f'{rec.get("identified")} of {rec.get("measured")}' if rec.get("measured") else None,
        "confused_with_other_business": (rec.get("verdicts") or {}).get("confused"),
        "brand_listed_as_option": f'{brand.get("appearances")} of {buyer.get("measured")}' if buyer.get("measured") else None,
        "brand_average_position": brand.get("averagePosition"),
        "top_competitor": top if top.isascii() else None,
        "competitors": [
            {"name": c["name"], "domain": c.get("domain"), "listed": f'{c["appearances"]} of {buyer.get("measured")}',
             "average_position": c.get("averagePosition")}
            for c in buyer.get("competitors", [])[:5]
        ],
        "example_misses": misses[:3],
        "site_scores_vs_top_competitor": {
            "competitor": site.get("competitorName"),
            "lead": scores("target"),
            "competitor_scores": scores("competitor"),
        },
    }
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
