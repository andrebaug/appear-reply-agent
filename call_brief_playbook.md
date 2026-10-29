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

1. Every run, pull events from all calendars in section 1 for the window **now to now + 80 minutes** (`calendars_get-calendar-events`, times in milliseconds).
2. For each confirmed call in that window, build the brief now and hand it to Slack with `chat.scheduleMessage`, `post_at` = call start minus 10 minutes (Unix seconds).
3. If call start minus 10 minutes is less than 2 minutes away (or already passed, for example a last minute booking), post right away with `chat.postMessage` and add "⚡ late booking" to the header.
4. Never brief a call that already started.

The 80 minute window overlaps the next run on purpose, so nothing falls through the gap. Duplicates are prevented in section 3.

## 3. No duplicates, and cleaning up cancellations
Every brief ends with a hidden marker line: `brief:<appointmentId>:<startTime ISO>`.

Before scheduling, check both:
- `chat.scheduledMessages.list` for the brief channel (any pending message whose text contains `brief:<appointmentId>:`), and
- `conversations.history` for the last 24 hours (already posted).

Then:
- Same appointment id AND same start time already scheduled or posted → do nothing.
- Same appointment id but a **different start time** (rescheduled) → `chat.deleteScheduledMessage` the old one, schedule a fresh brief.
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
4. Write the intelligence in two clearly separated parts:
   - **What the site says** (3 to 5 bullets): what they sell, who they serve, where, any proof they show (years in business, review counts, awards, named clients), pricing if published. Each bullet ends with the page path in brackets, for example `[/about]`. Quote numbers exactly as the site shows them.
   - **AI visibility angles** (2 to 3 bullets): built only from the `ai_readiness` block. These are Appear's best openers because they are objective and checkable. Examples:
     - `ai_crawlers_fully_blocked` lists GPTBot or ClaudeBot → "Their robots.txt blocks ChatGPT's crawler (GPTBot). ChatGPT literally can't read their site today."
     - no LocalBusiness / Organization schema → "No business schema on the site, so AI tools have to guess their name, location and services."
     - no FAQ section or FAQ schema → "No FAQ content, which is what AI answers pull from most."
     - `llms_txt_found` false → "No llms.txt."
5. Then **one** suggested opener (a single sentence the AE can say in the first 2 minutes) that uses one fact from above.
6. Self check before sending: reread every bullet and confirm the fact is in the scan JSON, GHL, or the form answers. Delete anything that is not. Never guess revenue, headcount, owner names, ad spend or tech stack. Never say what ChatGPT says about them unless the audit field says it.

Never invent proof points about Appear either. Allowed Appear numbers: 40% more AI referred traffic within 90 days; AI search clicks convert about 14x higher than a normal Google click; most customers are live the same day.

## 6. Slack message format
Post as Echo (Slack Web API with curl, token injected automatically, never print it). Slack formatting: *bold*, `<url|label>` links. Keep it scannable on a phone.

```
📞 *Call in 10 min* with *<First Last>* from *<Company>* · <time in AE's time zone> (<time in lead's time zone> for them)
<@AE_SLACK_ID> you're up 👊

*Lead*
• Name: <First Last><, Job title if known>
• Mobile: <phone>   • Email: <email>
• Website: <url|domain>
• Audit: <audit_link|Open audit>   • AI visibility score: <geo_score or "not run yet">
• Meet: <meet link|Join call>
• Came from: <campaign / form name / source>

*What they told us (instant form)*
• <Question>: <answer word for word>
• Booking notes: "<notes, if any>"

*Website intel* (scanned <n> pages just now)
• <fact> [/page]
• <fact> [/page]

*AI visibility angles*
• <angle>
• <angle>

*Opener*
"<one sentence>"

<If the earlier email chain summary exists> *Earlier conversation*: <one line>
_brief:<appointmentId>:<startTime ISO>_
```

If a field is empty, drop the line rather than writing "N/A", except Audit (write "no audit on file, run one before the call" so the AE knows).

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

## 8. Where it posts
Channel: **#sales-inbound (C0ALN8Q7CRL)**. Change it here to move all briefs (for example to a dedicated #call-briefs channel). Echo must be a member of the channel.

Optional, off by default: also DM the brief to the tagged AE (`conversations.open` with their Slack id, then schedule the same text there).

## 9. Privacy
Briefs contain personal data (mobile, email). Only post to the channel in section 8 or to the AE's DM. Never post briefs to public or shared external channels, and never paste them anywhere outside Slack.

## 10. Schedule and quiet runs
Runs every hour, every day (calls happen early US mornings and UK afternoons). If there is nothing in the window, post nothing.

## 11. Echo's voice
Same as the reply agent: casual and upbeat only in the header line ("you're up 👊", "⚡ late booking"). Facts, form answers and website intel stay plain and neutral. Zero hyphens in Echo's own lines.
