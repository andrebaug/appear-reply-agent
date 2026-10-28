# Appear Meta ads: rebrand set (green, friendly)

Eight static ads (1:1 and 9:16, plus 4:5 for the first three) and two 15 second Reels, all in 4K. Everything is about outcomes: more customers, more calls, less work. No tech talk.

Every ad pushes the free AI audit. Copy is included for both destinations:

* **Landing page** (https://audits.joinappear.com/): CTA button **Learn more**, or test **Get offer**.
* **Instant Form** (Appear - Qualified - v1): CTA button **Sign up**.

---

## Reels

### Reel 1. "Your customers have a new habit" (all verticals)
File: `reels/appear_reel1_says_your_name_9x16.mp4`

What happens: grass swaying in the sun. "Your customers have a new habit." Someone types "Who's the best roofer near me?" into ChatGPT. Three competitors show up. "Is your name on that list?" Then "Your Business" slides into the top spot. The end card reads "Get recommended by AI. Then relax."

**Primary text (landing page)**
> Your customers stopped scrolling through Google. Now they just ask ChatGPT who to pick.
>
> Appear makes sure the answer is you. Find out where you stand today with a free AI audit.

**Primary text (Instant Form)**
> Your customers now ask AI who to pick. Is your name on the list?
>
> Leave your website and we'll send you a free AI audit. It takes you 30 seconds.

**Headline:** Get recommended by AI. Then relax.
**Description:** Free AI audit

### Reel 2. "Phone a little quiet lately?" (home services)
File: `reels/appear_reel2_phone_quiet_9x16.mp4`

What happens: "Phone a little quiet lately?" A homeowner asks ChatGPT for a plumber, and AI names two competitors. "If it doesn't know you, they call someone else." Then job requests start popping in. The end card reads "More calls. Less chasing."

**Primary text (landing page)**
> Homeowners don't search "plumber near me" anymore. They ask ChatGPT who to call.
>
> If AI doesn't know your business, that job goes to someone else. Appear makes sure it's you they call.
>
> See if AI recommends you. The audit is free.

**Primary text (Instant Form)**
> Phone a little quiet lately? Homeowners now ask ChatGPT who to call.
>
> Tell us your website and we'll send you a free audit showing whether AI recommends you, and who it sends people to instead.

**Headline:** More calls. Less chasing.
**Description:** Free AI audit for home service pros

**Music tip:** add a light, upbeat track from Meta's free music library when you upload (something acoustic or lofi works). The Reels are silent on purpose, so all the text stays readable with the sound off.

---

## Static ads

### Static 1. "Make sure it says your name" (all verticals)
Files: `static/appear_r1_says_your_name_*.png`

**Primary text (landing page):** Your customers are asking ChatGPT, Claude and Perplexity who to buy from. Appear makes sure your name comes up. Get your free AI audit and see where you stand.
**Primary text (Instant Form):** Your customers are asking ChatGPT, Claude and Perplexity who to buy from. Is your name coming up? Leave your website and we'll send you a free AI audit showing exactly where you stand.
**Headline:** Make sure AI says your name
**Description:** Free AI audit

### Static 2. "Phone a little quiet lately?" (home services)
Files: `static/appear_r2_phone_quiet_*.png`

**Primary text (landing page):** Homeowners now ask ChatGPT who to call. If it doesn't name you, the job goes to someone else. Find out if AI recommends your business with a free audit.
**Primary text (Instant Form):** Phone a little quiet lately? Homeowners now ask ChatGPT who to call. Tell us your website and we'll send you a free audit showing whether AI recommends you, and who it sends people to instead.
**Headline:** Get found when homeowners ask AI
**Description:** Free AI audit for home service pros

### Static 3. "Get recommended by AI. Then relax." (all verticals)
Files: `static/appear_r3_then_relax_*.png`

**Primary text (landing page):** More customers find you through ChatGPT, Claude and Perplexity, and you don't lift a finger. Start with a free AI audit.
**Primary text (Instant Form):** Get recommended by ChatGPT, Claude and Perplexity, and let more customers find you without lifting a finger. Leave your website and we'll send your free AI audit.
**Headline:** Get recommended by AI. Then relax.
**Description:** Free AI audit

---

## Before launch

* **Logo:** all files use the current glass A logo for now. When the new logo is final, send the file and I'll swap it in everywhere in one go.
* **Example names:** Peak Roofing Co., Rapid Flow Plumbing and the others are made up. The job notifications are illustrations, not real customer data.
* **Placements:** use the 1:1 static for Feed and the 9:16 files for Stories and Reels. The 9:16 layouts keep the top and bottom clear for Instagram's buttons.

## Editing

Source is in `source/`. Edit the text in `statics.js` or `reels.js`, then run from `source/`:

```bash
NODE_PATH=$(npm root -g) node statics.js ../static
```

```bash
NODE_PATH=$(npm root -g) node reels.js ../reels
```

---

## Minimal ads (low copy, built to convert)

Five quick hits: one hook, one visual, one button. Files: `minimal/appear_m*_1x1.png` and `minimal/appear_m*_9x16.png`. Keep the primary text short too, so the image does the work.

### M1. "Does ChatGPT recommend you?"
**Primary text (landing page):** Ask ChatGPT who the best is in your field. If it's not you, you're losing customers every day. Check for free.
**Primary text (Instant Form):** Does ChatGPT recommend your business? Leave your website and we'll send you a free AI audit.
**Headline:** Does ChatGPT recommend you?
**Description:** Free AI audit

### M2. "AI is sending your customers somewhere else"
**Primary text (landing page):** When people ask AI for a recommendation, it names your competitors. Find out why, for free.
**Primary text (Instant Form):** AI is recommending your competitors. Leave your website and we'll show you why, free.
**Headline:** Find out who AI recommends instead
**Description:** Free AI audit

### M3. "Free AI audit."
**Primary text (landing page):** See if ChatGPT, Claude, Perplexity and Gemini recommend your business. 100% free.
**Primary text (Instant Form):** Want to know if AI recommends your business? Leave your website and we'll send your free AI audit.
**Headline:** Get your free AI audit
**Description:** ChatGPT, Claude, Perplexity & Gemini

### M4. "Be the one AI recommends."
**Primary text (landing page):** Your customers ask AI who to choose. Appear makes sure it's you. Start with a free audit.
**Primary text (Instant Form):** Your customers ask AI who to choose. Leave your website and we'll show you how to be the answer, free.
**Headline:** Be the one AI recommends
**Description:** Free AI audit

### M5. "6x more traffic from AI"
**Primary text (landing page):** A luxury watch retailer got 6x more AI referrals with Appear, with zero extra work on their side. See what's possible for you.
**Primary text (Instant Form):** 6x more AI referrals, zero extra work. Leave your website and we'll send you a free AI audit.
**Headline:** 6x more traffic from AI
**Description:** Free AI audit

**My bet for the winners:** M1 and M2. Questions and loss aversion stop the scroll best, and both send people straight to "check for free."

## File specs

Every static is exported in **4K** (2x): 2160x2160 for 1:1 and 2160x3840 for 9:16. Meta accepts these and scales them down cleanly, so they stay sharp on every screen. The Reels are 2160x3840, 30fps, H.264.
