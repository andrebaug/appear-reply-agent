# The Rank Collective: Ad Pack

Six angles. Each comes as a 1:1 and 9:16 static (4K master plus 1080 export) and a 12 second reel in both sizes (4K master plus 1080 export).

Destination for every ad: **therankcollective.com/audit** (the free AI readiness check).
Brand: pure black, white, electric blue #00AAFF, Inter Display. Matches the live site.

## Why these angles

Every ad does three jobs:
1. **Name the pain** they already feel (customers ask AI now, and they aren't in the answer).
2. **Sell the outcome** (being the business AI can confidently recommend), not the service.
3. **Give a free, zero risk next step** (the readiness check, no sales call).

All claims stay inside what TRC says publicly: no ranking guarantees, no invented stats. Mockups that show fictional businesses carry a small "Illustrative example" label. Angle 04 turns that honesty into the selling point.

## The six angles

### 01 Chat: "Your firm wasn't mentioned"
Pain: a buyer asks AI who to hire and gets three competitors.
- **Primary text:** Your next client didn't Google you. They asked AI who to hire, and it gave them three names. If yours wasn't one of them, that client is gone before you ever knew they existed. Run our free AI readiness check and see what AI can and can't read on your site.
- **Headline:** Is AI recommending your competitors?
- **Description:** Free check. No sales call.
- **Best for:** law firms, dental, med spa, home services. Swap the query and names per niche (the template makes this a 1 line change).

### 02 X ray: "People see a great website. AI sees a blur."
Pain: they paid for a beautiful site that AI can't actually parse.
- **Primary text:** Your website looks great to people. To AI, it's missing structured data, clear answers and the signals it needs to trust you. AI can't recommend what it can't read. Our free check shows exactly what's blocking you and what to fix first.
- **Headline:** See your website the way AI sees it
- **Description:** Free AI readiness check

### 03 No page 2: "There's no page 2 in AI."
Pain: Google gave ten chances, AI gives one answer.
- **Primary text:** Google showed ten results. AI gives one answer. When someone asks for the best in your field, there's one spot, and it goes to the business AI understands and trusts most. We make that business you. Start with a free readiness check.
- **Headline:** AI gives one answer. Be it.
- **Description:** Free AI readiness check

### 04 Honest: "Anyone who guarantees you'll be #1 in ChatGPT is lying."
Pain: they've been burned by agencies promising rankings. This is our sharpest differentiator.
- **Primary text:** Nobody controls what ChatGPT recommends. Not us, not anyone selling you a "guaranteed #1". What we do control: making your site readable to AI, turning your pages into clear answers, and building the signals AI trusts. Then we track what changes, honestly. Start with a free readiness check.
- **Headline:** The honest way to get recommended by AI
- **Description:** No guarantees. Just the work that matters.
- **Best for:** cold audiences of marketing leads and founders who've been pitched by every agency.

### 05 SEO vs GEO: "You rank on Google. So why doesn't AI know you?"
Pain: they already pay for SEO and assume it covers AI.
- **Primary text:** You're #1 on Google. Ask ChatGPT the same question and you're nowhere. SEO gets you ranked. GEO gets you recommended. They work together, and most businesses only have one of them. See how AI reads your site, free.
- **Headline:** SEO isn't enough anymore
- **Description:** Free AI readiness check
- **Best for:** businesses with an existing SEO agency, retargeting site visitors.

### 06 Score: "Is your website ready for AI?"
Pain: curiosity and the fear of a bad grade. This is the most direct audit push.
- **Primary text:** One click tells you how ready your website is for AI search: crawler access, structured data, metadata and content signals. You get a score plus the exact fixes in plain English. Free, automated, no sales call.
- **Headline:** Get your AI readiness score
- **Description:** Takes one click

## How I'd launch it

1. **Test the hook first.** Run all six as reels in one campaign, broad targeting, equal budget, for 5 to 7 days. Judge on cost per completed readiness check, not clicks.
2. **Expected winners:** 01 (most visceral) and 04 (most differentiated). 06 should have the cheapest audit completions because the ad *is* the audit.
3. **Then scale and vary.** Take the winning angle and make niche versions (the chat query and names are one line each in the template).
4. **Retarget** everyone who ran the check but didn't book: use angle 05 or 04 pointing to the $3,500 audit and strategy call.
5. **Add sound in platform.** The reels are silent by design so you can pick a trending track in Meta or TikTok. Add captions as on screen text is already built in.

## Safe zones

9:16 versions keep the logo, headline and CTA between 250px from the top and 330px from the bottom (at 1080 wide), clear of Reels and Stories UI.

## Editing

Source template: `src/ad.html` (one file, all six concepts). Render statics with `node render_static.js` and reels with `node render_video.js <c1..c6> <sq|st> 2 30`.
