# Appear Meta ads: rebrand set (green, friendly)

Three static ads (in 1:1, 4:5 and 9:16) and two 15 second Reels. Everything is about outcomes: more customers, more calls, less work. No tech talk.

Every ad pushes the free AI audit. Copy is included for both destinations:

* **Landing page**: CTA button **Learn more**, or test **Get offer**.
* **Instant Form**: CTA button **Sign up**. Ask for name, email and website, then send the audit link by email.

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

**Primary text:** Your customers are asking ChatGPT, Claude and Perplexity who to buy from. Appear makes sure your name comes up. Get your free AI audit and see where you stand.
**Headline:** Make sure AI says your name
**Description:** Free AI audit

### Static 2. "Phone a little quiet lately?" (home services)
Files: `static/appear_r2_phone_quiet_*.png`

**Primary text:** Homeowners now ask ChatGPT who to call. If it doesn't name you, the job goes to someone else. Find out if AI recommends your business with a free audit.
**Headline:** Get found when homeowners ask AI
**Description:** Free AI audit for home service pros

### Static 3. "Get recommended by AI. Then relax." (all verticals)
Files: `static/appear_r3_then_relax_*.png`

**Primary text:** More customers find you through ChatGPT, Claude and Perplexity, and you don't lift a finger. Start with a free AI audit.
**Headline:** Get recommended by AI. Then relax.
**Description:** Free AI audit

---

## Before launch

* **Logo:** the mark in these files is my redraw of your new logo from the screenshot. Send the real SVG and I'll swap it in everywhere in one go.
* **Example names:** Peak Roofing Co., Rapid Flow Plumbing and the others are made up. The job notifications are illustrations, not real customer data.
* **Placements:** use the 4:5 static for Feed and the 9:16 files for Stories and Reels. The 9:16 layouts keep the top and bottom clear for Instagram's buttons.

## Editing

Source is in `source/`. Edit the text in `statics.js` or `reels.js`, then run from `source/`:

```bash
NODE_PATH=$(npm root -g) node statics.js ../static
```

```bash
NODE_PATH=$(npm root -g) node reels.js ../reels
```
