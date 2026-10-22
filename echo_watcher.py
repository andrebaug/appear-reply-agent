#!/usr/bin/env python3
"""Echo approval watcher.

Polls #outbound-agent every POLL seconds. When a human answers under a
"[reply-agent]" post (thread reply, or a thumbs up on the post), Echo confirms
in the thread right away and the script exits with code 0 so the agent wakes
up and sends. Stateless: a post is pending when it has no white_check_mark or
track_next reaction and the newest human message in its thread is newer than
Echo's newest message there.

During business hours (Mon to Fri, 8am to 6pm Central) it also exits every
INBOX_TICK seconds with "tick" so the agent checks Instantly for new replies.

Exit codes: 0 = approval found (details on stdout), 3 = tick or ran out of
time: check the inbox if "tick", then re-arm.
"""
import json
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
    """A send typed in the main channel instead of a thread: ask once where it belongs."""
    now = time.time()
    for m in messages:
        if not is_human(m) or "[reply-agent]" in m.get("text", "") or m.get("reply_count"):
            continue
        if now - float(m["ts"]) > 1800 or classify(m.get("text", "")) == "edit":
            continue
        say(m["ts"], "Got it :eyes: which draft do you mean? Reply *send* inside that draft's thread "
                     "and I'll fire it off right away.")
    return None


def business_hours():
    now = datetime.now(ZoneInfo("America/Chicago"))
    return now.weekday() < 5 and 8 <= now.hour < 18


def main():
    start = time.time()
    while time.time() - start < MAX_RUNTIME:
        if business_hours() and time.time() - start >= INBOX_TICK:
            print("tick")
            return 3
        hist = slack("conversations.history", {"channel": CHANNEL, "limit": 100,
                                               "oldest": f"{time.time() - LOOKBACK:.0f}"})
        messages = hist.get("messages", [])
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
