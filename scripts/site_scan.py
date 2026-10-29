#!/usr/bin/env python3
"""Scan a lead's website and print verifiable facts as JSON.

The call brief agent writes sales intelligence ONLY from this output, so every
claim it makes can be traced to a page we actually fetched.

Usage: python3 scripts/site_scan.py <url> [--max-pages 6]
Stdlib only, so it runs in any session without installs.
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
TIMEOUT = 15
MAX_TEXT = 6000  # chars of visible text kept per page
AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User",
           "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended",
           "anthropic-ai", "Claude-Web", "Meta-ExternalAgent", "Bytespider", "CCBot"]
# Pages that usually carry the facts an AE wants, best first.
KEY_PAGE_HINTS = ["about", "service", "pricing", "price", "location", "team",
                  "review", "testimonial", "case", "faq", "contact", "product", "menu"]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            body = r.read(3_000_000)
            charset = r.headers.get_content_charset() or "utf-8"
            return r.status, r.geturl(), body.decode(charset, errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, url, ""
    except Exception as e:  # DNS, TLS, timeout
        return None, url, f"__error__ {type(e).__name__}: {e}"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.meta, self.links, self.jsonld = "", {}, [], []
        self.headings, self.text = [], []
        self._skip = 0
        self._in = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style", "noscript", "svg"):
            self._skip += 1
            if tag == "script" and a.get("type") == "application/ld+json":
                self._in, self._buf = "jsonld", []
        elif tag == "title":
            self._in, self._buf = "title", []
        elif tag in ("h1", "h2", "h3"):
            self._in, self._buf = tag, []
        elif tag == "meta":
            key = a.get("name") or a.get("property")
            if key and a.get("content"):
                self.meta[key.lower()] = a["content"].strip()
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self._skip = max(0, self._skip - 1)
            if tag == "script" and self._in == "jsonld":
                self.jsonld.append("".join(self._buf))
                self._in = None
        elif tag == "title" and self._in == "title":
            self.title = " ".join("".join(self._buf).split())
            self._in = None
        elif tag in ("h1", "h2", "h3") and self._in == tag:
            h = " ".join("".join(self._buf).split())
            if h:
                self.headings.append(f"{tag}: {h}")
            self._in = None

    def handle_data(self, data):
        if self._in:
            self._buf.append(data)
        if not self._skip:
            t = data.strip()
            if t:
                self.text.append(t)


def schema_types(blocks):
    types, facts = set(), {}
    def walk(node):
        if isinstance(node, dict):
            t = node.get("@type")
            for x in (t if isinstance(t, list) else [t]):
                if isinstance(x, str):
                    types.add(x)
            for k in ("name", "telephone", "priceRange", "foundingDate", "areaServed",
                      "address", "aggregateRating", "sameAs", "numberOfEmployees"):
                if k in node and k not in facts:
                    facts[k] = node[k]
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    for b in blocks:
        try:
            walk(json.loads(b))
        except Exception:
            continue
    return sorted(types), facts


def robots_ai_rules(robots_txt):
    """Return which AI crawlers are fully blocked (Disallow: /)."""
    blocked, agents, group = [], [], []
    for raw in robots_txt.splitlines() + ["user-agent: __end__"]:
        line = raw.split("#")[0].strip()
        if not line or ":" not in line:
            continue
        k, v = [s.strip() for s in line.split(":", 1)]
        k = k.lower()
        if k == "user-agent":
            if group:
                agents, group = [], []
            agents.append(v)
        elif k == "disallow":
            group.append(v)
            if v == "/":
                for a in agents:
                    if a == "*" or any(a.lower() == b.lower() for b in AI_BOTS):
                        blocked.append(a)
    return sorted(set(blocked))


def parse(html):
    p = PageParser()
    try:
        p.feed(html)
    except Exception:
        pass
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--max-pages", type=int, default=6)
    args = ap.parse_args()

    url = args.url.strip()
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    out = {"input_url": args.url, "readable": False, "pages": [], "ai_readiness": {}, "notes": []}

    status, final, html = fetch(url)
    if (status != 200 or not html or html.startswith("__error__")) and url.startswith("https://"):
        status, final, html = fetch("http://" + url[len("https://"):])
    out["final_url"], out["status"] = final, status
    if status != 200 or not html or html.startswith("__error__"):
        out["notes"].append(f"Homepage not readable (status {status}). {html[:200] if html.startswith('__error__') else ''}".strip())
        print(json.dumps(out, indent=2, ensure_ascii=False))
        return

    # Follow one JavaScript or meta refresh redirect (common on parked domains).
    m = re.search(r"""(?:window\.location(?:\.href)?\s*=\s*|http-equiv=["']refresh["'][^>]*url=)["']?([^"'>\s;]+)""", html, re.I)
    if m and len(html) < 5000:
        target = urllib.parse.urljoin(final, m.group(1))
        out["notes"].append(f"Homepage redirects to {target}")
        s2, f2, h2 = fetch(target)
        if s2 == 200 and h2 and not h2.startswith("__error__"):
            final, html = f2, h2
            out["final_url"] = final

    if "/lander" in final or re.search(r"domain (?:is|may be) for sale|buy this domain|parked free|parkingcrew|sedoparking", html, re.I):
        out["parked_domain"] = True
        out["notes"].append("Looks like a parked or for sale domain, not a live business site.")

    base = urllib.parse.urlparse(final)
    origin = f"{base.scheme}://{base.netloc}"
    home = parse(html)

    # Pick internal key pages from homepage links.
    seen, candidates = {final.rstrip("/")}, []
    for href in home.links:
        u = urllib.parse.urljoin(final, href.split("#")[0])
        pu = urllib.parse.urlparse(u)
        if pu.netloc != base.netloc or not pu.path or pu.path == "/":
            continue
        if re.search(r"\.(pdf|jpg|jpeg|png|gif|webp|zip|mp4)$", pu.path, re.I):
            continue
        key = u.rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        score = next((i for i, h in enumerate(KEY_PAGE_HINTS) if h in pu.path.lower()), None)
        if score is not None:
            candidates.append((score, u))
    candidates.sort()

    pages_html = [(final, home)]
    for _, u in candidates[: max(0, args.max_pages - 1)]:
        s, f, h = fetch(u)
        if s == 200 and h and not h.startswith("__error__"):
            pages_html.append((f, parse(h)))

    all_jsonld = []
    for page_url, p in pages_html:
        text = " ".join(" ".join(p.text).split())
        all_jsonld += p.jsonld
        out["pages"].append({
            "url": page_url,
            "title": p.title,
            "meta_description": p.meta.get("description") or p.meta.get("og:description", ""),
            "headings": p.headings[:25],
            "text": text[:MAX_TEXT],
            "text_truncated": len(text) > MAX_TEXT,
        })
    out["readable"] = any(len(pg["text"]) > 200 for pg in out["pages"])
    if not out["readable"]:
        out["notes"].append("Very little visible text. Site is probably rendered by JavaScript; facts may be incomplete.")

    types, facts = schema_types(all_jsonld)
    rs, _, robots = fetch(origin + "/robots.txt")
    ls, _, llms = fetch(origin + "/llms.txt")
    ss, _, sitemap = fetch(origin + "/sitemap.xml")
    full_text = " ".join(pg["text"] for pg in out["pages"]).lower()
    out["ai_readiness"] = {
        "schema_types_found": types,
        "schema_facts": facts,
        "has_localbusiness_or_org_schema": any(t in types for t in (
            "LocalBusiness", "Organization", "Dentist", "MedicalBusiness", "HomeAndConstructionBusiness",
            "ProfessionalService", "Store", "Restaurant", "LegalService", "MedicalClinic")),
        "has_faq_schema": "FAQPage" in types,
        "has_faq_section_on_scanned_pages": "faq" in full_text or "frequently asked" in full_text,
        "robots_txt_found": rs == 200 and not robots.startswith("__error__"),
        "ai_crawlers_fully_blocked": robots_ai_rules(robots) if rs == 200 else [],
        "llms_txt_found": ls == 200 and bool(llms.strip()) and "<html" not in llms[:500].lower(),
        "sitemap_found": ss == 200 and ("<urlset" in sitemap[:2000].lower() or "<sitemapindex" in sitemap[:2000].lower()),
        "sitemap_url_count": sitemap.count("<loc>") if ss == 200 else 0,
        "pages_scanned": len(out["pages"]),
    }
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
