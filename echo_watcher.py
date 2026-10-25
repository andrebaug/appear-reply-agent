#!/usr/bin/env python3
"""Echo approval watcher.

Polls #outbound-agent every POLL seconds. When a human answers under a
"[reply-agent]" post (thread reply, or a thumbs up on the post), Echo confirms
in the thread right away and the script exits with code 0 so the agent wakes
up and sends. Stateless: a post is pending when it has no white_check_mark or
track_next reaction and the newest human message in its thread is newer than
Echo's newest message there.

It also watches Instantly for new POSITIVE replies (Instantly's interest label,
any campaign) every INBOX_POLL seconds. On a hit Echo posts a heads up in Slack
right away and the script exits with {"action": "new_positive", ...} so the
agent drafts the reply. Negative and auto replies are ignored. This needs the
Instantly API to answer: an API key in INSTANTLY_API_KEY or a network secret
for api.instantly.ai. Without it, the script falls back to exiting every
INBOX_TICK seconds (7am to 9pm Central, every day) with "tick" so the agent checks the
inbox itself.

Exit codes: 0 = something to act on (JSON on stdout), 3 = tick or ran out of
time: check the inbox if "tick", then re-arm.
"""
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from zoneinfo import ZoneInfo

CHANNEL = "C0CB71LLLS0"
ECHO_USER = "U0CB7334HT6"
POLL = 15
MAX_RUNTIME = 105 * 60
INBOX_TICK = 5 * 60
INBOX_POLL = 30
INBOX_WINDOW = 6 * 3600
INSTANTLY = "https://api.instantly.ai/api/v2/emails"
LOOKBACK = 3 * 24 * 3600
DONE_REACTIONS = {"white_check_mark", "track_next", "black_right_pointing_double_triangle_with_vertical_bar"}
APPROVE = re.compile(r"\b(send|sent it|yes|yep|ok|okay|go|approved?|ship it)\b|:\+1:|:thumbsup:|👍", re.I)
SKIP = re.compile(r"\bskip\b", re.I)


def slack(method, params=None, body=None):
    if body is not None:
        cmd = ["curl", "-s", "-X", "POST", f"https://slack.com/api/{method}",
               "-H", "Content-type: application/json; charset=utf-8", "-d", json.dumps(body)]
    else:
        query = "&".join(f"{k}={v}" for k, v in (params or {}).items())
        cmd = ["curl", "-s", f"https://slack.com/api/{method}?{query}"]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=30).stdout
    try:
        return json.loads(out)
    except ValueError:
        return {"ok": False, "error": "bad_json"}


def is_human(m):
    return not m.get("bot_id") and m.get("user") != ECHO_USER and "Sent using" not in m.get("text", "")


def is_echo(m):
    return m.get("user") == ECHO_USER or bool(m.get("bot_id"))


def classify(text):
    if SKIP.search(text):
        return "skip"
    if len(text) < 80 and APPROVE.search(text):
        return "send"
    return "edit"


def say(thread_ts, text):
    slack("chat.postMessage", body={"channel": CHANNEL, "thread_ts": thread_ts, "text": text})


def check_post(post):
    reactions = post.get("reactions", [])
    if any(r["name"] in DONE_REACTIONS for r in reactions):
        return None
    ts = post["ts"]
    email_id = re.search(r"\[reply-agent\] #([0-9a-f-]+)", post.get("text", "")).group(1)
    thread = slack("conversations.replies", {"channel": CHANNEL, "ts": ts, "limit": 200}).get("messages", [])[1:]
    last_echo = max([float(m["ts"]) for m in thread if is_echo(m)] or [0.0])
    fresh = [m for m in thread if is_human(m) and float(m["ts"]) > last_echo]
    if fresh:
        m = fresh[-1]
        action = classify(m.get("text", ""))
        ack = {"send": "Got it :eyes: sending now, confirmation in a sec",
               "skip": "Got it, skipping this one :black_right_pointing_double_triangle_with_vertical_bar:",
               "edit": "Got it :eyes: on it, applying your version now"}[action]
        say(ts, ack)
        return {"post_ts": ts, "email_id": email_id, "action": action,
                "by": m.get("user"), "text": m.get("text", "")}
    acked = any(is_echo(m) and ("Got it" in m.get("text", "") or "Sent" in m.get("text", "")) for m in thread)
    for r in reactions:
        if r["name"] in ("+1", "thumbsup") and any(u != ECHO_USER for u in r.get("users", [])):
            if not acked:
                say(ts, "Got it :eyes: sending now, confirmation in a sec")
                return {"post_ts": ts, "email_id": email_id, "action": "send",
                        "by": r["users"][0], "text": ":+1: reaction"}
    return None


def nudge_top_level(messages, posts):
    """A human message in the main channel. A bare send/skip gets a nudge to use the draft's
    thread (never applied on a guess). Anything else is a question or request for Echo: confirm
    right away and wake the agent to handle it."""
    now = time.time()
    for m in messages:
        if not is_human(m) or "[reply-agent]" in m.get("text", "") or m.get("reply_count"):
            continue
        if now - float(m["ts"]) > 1800:
            continue
        if classify(m.get("text", "")) != "edit":
            say(m["ts"], "Got it :eyes: which draft do you mean? Reply *send* or *skip* inside that draft's "
                         "thread and I'll act on it right away.")
            continue
        say(m["ts"], "Got it :eyes: on it, give me a minute.")
        return {"action": "question", "post_ts": m["ts"], "by": m.get("user"), "text": m.get("text", "")}
    return None


def instantly_received():
    """Newest received emails, or None when the API is not authorized."""
    cmd = ["curl", "-s", "-w", "\n%{http_code}", f"{INSTANTLY}?email_type=received&limit=50"]
    if os.environ.get("INSTANTLY_API_KEY"):
        cmd += ["-H", f"Authorization: Bearer {os.environ['INSTANTLY_API_KEY']}"]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=30).stdout
    body, _, code = out.rpartition("\n")
    if code != "200":
        return None
    try:
        return json.loads(body).get("items", [])
    except ValueError:
        return []


def is_positive(e):
    if e.get("is_auto_reply") or re.match(r"(Accepted|Declined|Tentative|Invitation|Updated invitation):", e.get("subject", "")):
        return False
    return (e.get("ai_interest_value") or 0) >= 1 or e.get("i_status") in (1, 2)


def check_inbox(channel_text, seen):
    emails = instantly_received()
    if emails is None:
        return None, False
    cutoff = time.time() - INBOX_WINDOW
    for e in emails:
        eid = e.get("id", "")
        created = datetime.fromisoformat(e.get("timestamp_created", "1970-01-01T00:00:00Z").replace("Z", "+00:00"))
        if eid in seen or eid in channel_text or created.timestamp() < cutoff or not is_positive(e):
            continue
        seen.add(eid)
        sender = (e.get("from_address_json") or [{}])[0]
        who = sender.get("name") or e.get("from_address_email")
        rank = "rankcollective" in e.get("eaccount", "")
        note = ":rotating_light: *needs you*, came into a TRC inbox, I won't reply from it" if rank \
            else "drafting the reply now :pencil2:"
        slack("chat.postMessage", body={"channel": CHANNEL, "text":
              f":fire: *Positive reply just landed* from {who} <mailto:{e.get('from_address_email')}|"
              f"{e.get('from_address_email')}>: \"{e.get('content_preview', '')[:120].strip()}\" ({note})\n"
              f"[incoming] #{eid}"})
        return {"action": "new_positive", "email_id": eid, "eaccount": e.get("eaccount"),
                "from": e.get("from_address_email"), "campaign_id": e.get("campaign_id"),
                "subject": e.get("subject"), "rankcollective": rank}, True
    return None, True


def business_hours():
    """7 days a week, 7am to 9pm Central: replies come in on weekends too."""
    now = datetime.now(ZoneInfo("America/Chicago"))
    return 7 <= now.hour < 21


def main():
    start = time.time()
    api_ok = True
    last_inbox = 0.0
    seen = set()
    while time.time() - start < MAX_RUNTIME:
        if not api_ok and business_hours() and time.time() - start >= INBOX_TICK:
            print("tick")
            return 3
        hist = slack("conversations.history", {"channel": CHANNEL, "limit": 200,
                                               "oldest": f"{time.time() - LOOKBACK:.0f}"})
        messages = hist.get("messages", [])
        if api_ok and time.time() - last_inbox >= INBOX_POLL:
            last_inbox = time.time()
            channel_text = " ".join(m.get("text", "") for m in messages)
            hit, api_ok = check_inbox(channel_text, seen)
            if hit:
                print(json.dumps(hit))
                return 0
        posts = [m for m in messages if "[reply-agent] #" in m.get("text", "")]
        for post in posts:
            hit = check_post(post)
            if hit:
                print(json.dumps(hit))
                return 0
        hit = nudge_top_level(messages, posts)
        if hit:
            print(json.dumps(hit))
            return 0
        time.sleep(POLL)
    print("timeout")
    return 3


if __name__ == "__main__":
    sys.exit(main())
