# Appear Call Brief Agent: Playbook

For every booked sales call, Echo posts a sales intelligence brief to Slack **10 minutes before the call starts**, tagging the AE who runs it. The brief has the lead's details, their audit, their instant form answers, and a short, fact checked scan of their website so the AE walks in sounding sharp.

HARD RULE: accuracy beats looking smart. Every fact about the lead's business must come from a page we fetched in this run, from GHL, or from the instant form. If we did not see it, it does not go in the brief. "Not found on site" is a perfectly good answer.

## 1. Which calls get a brief
All GoHighLevel calendars in location Gihw7C7iJh0DwYBDGDtd that are **active** (`isActive: true`), currently:

| Calendar | id |
|---|---|
| Appear Intro | oHrxmHKnqtotBqoJCMoY |
| Free AI Visibility Session | 0MQ4uSLNjaI5QSmGFzTB |
| Appear Intro ES | KPlicB2vvMOvL1qkgRfe |
| Appear Intro FR | ozSyEOB4H45WPSWs5ToT |
| Call with Alykhan Kara | LioWk6iKJ98iMAFJii8X |
| The Rank Collective Intro US | VhtjBKWDTW2dc7Uw1W70 |
| The Rank Collective Intro UK | Mt3OIf3z8H5nPoDQ8YqX |
| The Rank Collective Intro | 3gCsme1IkEfWsbB28Isr |
| Follow-Up: AI Visibility | uZX5zPZnDX3BFL2YEwFf |

At the start of each run, re-list calendars (GHL `get-calendars`) and include any new active sales calendar, so a new calendar never gets missed. Skip personal calendars that are not sales calls (for example "Bob Revsync's Personal Calendar").

Only appointments with `appointmentStatus: confirmed` and `deleted: false` get a brief.

## 2. Timing: how "10 minutes before" works
Scheduled tasks run once an hour, so the agent never waits for the exact minute. Instead it uses Slack's own scheduler:

1. Every run, pull events from all calendars in section 1 for the window **now to now + 80 minutes** (`calendars_get-calendar-events`, times in milliseconds). GHL returns every event on the overlapping days, not just the window, so always filter on each event's own `startTime` yourself.
2. For each confirmed call in that window, build the brief now and hand it to Slack with `chat.scheduleMessage`, `post_at` = call start minus 10 minutes (Unix seconds).
3. If call start minus 10 minutes is less than 2 minutes away (or already passed, for example a last minute booking), post right away with `chat.postMessage` and add "⚡ late booking" to the header.
4. Never brief a call that already started.
5. **Overlapping calls**: every call always gets its own brief at its own start minus 10 minutes, no matter how many calls overlap. Say nothing about overlaps when the calls have different AEs. Only if the **same AE** has two overlapping calls, add "⚠️ Clash: <AE> also has <Name> at <time>" and tag <@U0AL3P0D3CK>.

The 80 minute window overlaps the next run on purpose, so nothing falls through the gap. Duplicates are prevented in section 3.

## 3. No duplicates, and cleaning up cancellations
Every brief ends with a hidden marker line: `brief:<appointmentId>:<startTime ISO>`.

Before scheduling, check both:
- `chat.scheduledMessages.list` for the brief channel (any pending message whose text contains `brief:<appointmentId>:`), and
- `conversations.history` for the last 24 hours (already posted).

Then:
- Same appointment id AND same start time already scheduled or posted → do nothing.
- Same appointment id but a **different start time** (rescheduled) → `chat.deleteScheduledMessage` the old one, schedule a fresh brief.
- A pending scheduled brief whose AE or Meet link changed since it was written (reassigning a call in GHL creates a new Meet link) → delete it and schedule a fresh one with the current AE and link.
- A pending scheduled brief whose appointment is now cancelled, deleted, or no longer confirmed → `chat.deleteScheduledMessage` it and post nothing.

## 4. Where the data comes from

| What | Where |
|---|---|
| Call time, meeting link, booking notes | Appointment: `startTime`, `address` (Google Meet link), `notes` / `appointmentMeta.defaultFormDetails.additionalInfo` |
| Name, mobile, email | Contact (`contacts_get-contact`): `firstName`, `lastName`, `phone`, `email`. Fall back to `appointmentMeta.defaultFormDetails` |
| Company, website | Contact `companyName`, `website`, or custom field `contact.website_url` (gjCHfEdlt4BGFPn6K53o). If still empty, use the email domain only if it is not a free mail domain (gmail, yahoo, hotmail, outlook, icloud, aol, proton) and say "(from email domain)" |
| Audit link | Custom field `contact.audit_link` (W3xqe2sXkl7I1vrV8NIi) |
| AI visibility score | Custom field `contact.geo_score` (D0qf20OmY1u9gXOiw8EI), with `contact.discovery_audit_status` (T2YmZY9RuZxpRlEhLq4N) |
| Audit summary | Custom field `contact.business_info` (77DgTua7K1Xa7OrmB0FS) |
| Instant form answers | GHL `get-forms-submissions` with `q` = the lead's email. Use `others.facebookLeadSubmissionDetails.field_data` for Facebook instant forms, and all filled `customFields` for GHL booking forms |
| Qualifying answers saved on the contact | Any filled custom field among: Current Biggest Goal, How do you currently acquire most of your customers?, Are you currently running paid ads?, How are you currently investing in growth?, Marketing Budget, Average Revenue per Customer, Familiar with AI search?, Anything we should know before the session?, Job title, LinkedIn URL, Stack |
| How they found us | Contact `lastAttributionSource` (`campaign` / `utmCampaign`, `utmContent`, `formName`) and tags |
| Earlier conversation | Custom field `contact.email_chain_summary` (e3nMWMKfSZQ3YyaKRAVI) and `contact.reply_source` |
| AE on the call | Appointment `assignedUserId` → table in section 7 |

Show instant form questions with the question text cleaned up (for example `how_did_you_hear_about_us` → "How did you hear about us?") and the answer **word for word**. Skip fields already shown in the header (name, email, phone, company, website).

## 5. Website intelligence (the anti hallucination part)
1. Run `python3 scripts/site_scan.py <website>` from the repo root. It fetches the homepage plus up to 5 key pages (about, services, pricing, locations, reviews, FAQ, contact) and checks robots.txt, llms.txt, sitemap and schema markup. Its JSON output is the **only** source for website facts.
2. If `parked_domain` is true, say so plainly in the brief ("Their domain is parked, there's no live site"). That is a strong talking point by itself: AI tools have nothing to read. Skip the rest of the website section.
3. If `readable` is false because the site is built with JavaScript, render the homepage once with the preinstalled Playwright Chromium (`require('playwright')`, `chromium.launch()`, `page.goto(url, {waitUntil: 'domcontentloaded'})`, `page.innerText('body')`) and use that text. If it still fails, write "Couldn't read the site, confirm the basics live on the call" and skip the website section.
4. Run `python3 scripts/audit_facts.py <audit_link>` when the contact has an audit link. It reads the audit report and returns the questions buyers ask, how often AI mentions the lead, and the **competitors ChatGPT and Claude actually recommended**. This is the only source for competitors. If `verified` is false, or there is no audit, leave out the industry line and competitors and write "Audit couldn't verify the business, ask what they do". Never name competitors from memory or from a web search.
5. **Industry line** (one line, max 12 words): what they sell, to whom, where. Build it only from the site's title, meta description and headings, plus the audit's `discovery_questions`. Example: "Spirits tasting glassware, sold direct and to the trade, US based". If the sources don't say it, drop the line.
6. **Smart bullets** (max 3): the 3 strongest facts from the site, with proof they show (years, patents, awards, review counts, named press, pricing). Each ends with the page path in brackets, for example `[/about]`. Quote numbers exactly.
7. **Revenue per customer** (one line, 💰). Use the first source that has it, and say which source:
   1. GHL custom field `contact.average_revenue_per_customer` (FAzXYGzuX7CZVlDPivEc) or an instant form answer about it → "💰 Revenue per customer: <value> (they told us)".
   2. Prices published on their site in the scan JSON → "💰 Published prices: <lowest> to <highest> [/page]". Quote prices exactly, and only for what they sell to their own customers.
   3. Neither → "💰 Revenue per customer: not published, ask what a typical customer is worth to them".
   Never estimate from industry averages, company size or guesswork. A wrong number makes the AE look bad.
8. **AI gap** (max 2 bullets): the sharpest objective facts. Pick from the audit numbers first (for example "Not in 8 of 12 buyer answers; Glencairn shows up in 9 of 12") and then from `ai_readiness` (AI crawlers blocked in robots.txt, no business schema, no FAQ, no llms.txt).
9. **Opener**: one sentence the AE can say in the first minute, using one fact from above.
10. Self check before sending: every word must trace back to the scan JSON, the audit JSON, GHL or the form. Delete anything that doesn't. Never guess revenue, headcount, owner names, ad spend or tech stack.

Never invent proof points about Appear either. Allowed Appear numbers: 40% more AI referred traffic within 90 days; AI search clicks convert about 14x higher than a normal Google click; most customers are live the same day.

## 6. Slack message format
Post as Echo (Slack Web API with curl, token injected automatically, never print it). Slack formatting: *bold*, `<url|label>` links. **Short: the whole brief must read in under 60 seconds on a phone.** One line per bullet, no paragraphs.

```
📞 *Call in 10 min* · *<First Last>*, <Company> · <AE time> (<lead time> for them)
<@AE_SLACK_ID> you're up 👊
<Industry line>

📇 <phone> · <email> · <url|website> · <audit_link|Audit> · <meet link|Join>
Came from: <campaign / form name>
💰 <revenue per customer line>

*They told us*
• <Question>: <answer word for word>
• Notes: "<booking notes>"

*Who they are*
• <fact> [/page]
• <fact> [/page]

*Who AI recommends instead*
<Competitor 1> (<x of y> answers) · <Competitor 2> (<x of y>) · <Competitor 3> (<x of y>)
They show up in <brand_listed_as_option> buyer answers.

*AI gap*
• <gap>
• <gap>

💬 *Opener:* "<one sentence>"
_brief:<appointmentId>:<startTime ISO>_
```

Drop any line whose data is missing instead of writing "N/A". Exceptions: no audit → write "No audit on file, run one before the call".

## 7. Who gets tagged
Map the appointment's `assignedUserId` (GHL user) to Slack:

| GHL user id | Person | Slack id |
|---|---|---|
| CX1Z3npm8biVG1CP165m | Kien Huynh (team@therankcollective.com, owner of most calendars) | U0ALA513WHY |
| gxVba6GeX0zUCTgQkMt6 | Alykhan Kara | U0AL3P0QPQT |
| 0bFkrXKTUrGztT212msu | Jordon Bediako | U0C614DJSMA |
| hP9ECKuV0f8mqQ6oIjS8 | Jordon Bediako (therankcollective) | U0C614DJSMA |
| ww75WtVZeIe4qVoAnTWi | Rocky Keller | U0C6T00MQ4A |
| 6B25exAKrXeB24Oopegi | Rocky Keller (therankcollective) | U0C6T00MQ4A |
| QuPZLU8SiiZDjH8zfkaD | Brian da Silva Santos | U0CC4BZMPUJ |
| 2tWZU1pELAOf6ekoIP9x | Daniel Hasan | U0C3DA473C1 |
| aFACd6kMOqDrALHH0Gso | Grischa Bauguitte | U0AL3P0D3CK |

Unknown user id → tag nobody and add "(AE not mapped, update section 7)".
No `assignedUserId` on the appointment → tag <@U0AL3P0D3CK> and write "⚠️ No AE assigned, who's taking this?" as the second line.

## 8. Where it posts
Channel: **#call-briefs (C0CEUDXRJJV)**, private. Change it here to move all briefs. Echo must be a member of the channel.

Optional, off by default: also DM the brief to the tagged AE (`conversations.open` with their Slack id, then schedule the same text there).

## 9. Privacy
Briefs contain personal data (mobile, email). Only post to the channel in section 8 or to the AE's DM. Never post briefs to public or shared external channels, and never paste them anywhere outside Slack.

## 10. Schedule and quiet runs
Runs every hour, every day (calls happen early US mornings and UK afternoons). If there is nothing in the window, post nothing.

## 11. Echo's voice
Same as the reply agent: casual and upbeat only in the header line ("you're up 👊", "⚡ late booking"). Facts, form answers and website intel stay plain and neutral. Zero hyphens in Echo's own lines.

## 12. Keep opportunities in sync (every run)
TRC Pipeline 0leNrBHlVsTLOqdF7aCy stage ids: New Lead 7e076653-49c7-40a0-96b6-e16f730d6749 · Meeting booked aa6b35ad-a2a2-411f-bf9d-0dc96cf8d3ec · No Show / Reschedule ef3d822f-17f9-4c50-b118-f856f9756756 · SQL ea616dbb-f1c7-4b4c-9efe-c50d426c1e52 · Proposal Sent 133b15fd-1ebb-48b3-b296-be28a9ddc767 · Contract Sent 8756febd-71cc-4dc1-82f6-6d8a27d82bd0 · Closed Won Subscription 87a9ae32-e4dc-4d92-9334-d30cb7c2afab · Closed Won One time 5dca7c98-ee53-4a88-9694-713cf494b79a · Closed Lost 3e1c4cfe-9802-49f4-bcae-90d96b49dcc3 · Nurture 36d7c40c-be59-4259-a8a2-816b77a8c9b5.

Each run, pull events from every active sales calendar for **the last 3 days to 30 days ahead**, and act on every appointment whose `dateAdded` or `dateUpdated` is within the last 2 hours (new bookings, reschedules, no shows, cancellations). Group by contact and use the contact's newest appointment. Find the contact's open TRC opportunity (`opportunities_search-opportunity` with `query_contact_id`).

**Stages (automatic only up to No Show; SQL and later are always set by the AE by hand):**
- Appointment `confirmed` (new or rescheduled) and the opportunity is in New Lead, Nurture or No Show / Reschedule → **Meeting booked**.
- Appointment `noshow` and the opportunity is in Meeting booked → **No Show / Reschedule**.
- Appointment `cancelled`, the contact has no other upcoming confirmed appointment, and the opportunity is in Meeting booked → **No Show / Reschedule**.
- Appointment `showed` → no stage change (the AE moves it to SQL or Closed Lost).
- Never move an opportunity that is in SQL, Proposal Sent, Contract Sent, Closed Won or Closed Lost. Never change status, value or name.

**Owner:** if the opportunity has no owner, or a deleted one (CX1Z3npm8biVG1CP165m Kien, Kwa8t37lSPfSFTVSFKuB), set it to the appointment's `assignedUserId`.

**New leads with no booking** (opportunities created in the last 2 hours with no owner): assign by location from the contact phone. +1 or +5x (Americas) → Rocky 6B25exAKrXeB24Oopegi. Any other country code → Jordon hP9ECKuV0f8mqQ6oIjS8. No phone → alternate. Leave them in New Lead.

No opportunity for a contact with a booking → mention it in the run summary only.
