# Appear Meta ads: free AI visibility audit

Six concepts, each in 1:1, 4:5 and 9:16. Files are named `appear_<concept>_<ratio>.png`.

Every concept has copy for two destinations:

* **Landing page**: sends people to the free audit link. CTA button: **Learn more** (or **Get offer** to test).
* **Instant Form**: the lead fills a Meta form with name, email and website. Then they get the audit link by email. CTA button: **Sign up**.

The Instant Form copy says "we'll send it to you" because the person doesn't land on the audit straight away.

---

## Home services

### HS1. "It named your competitors"
Files: `appear_hs1_ai_picked_competitor_*.png`

**Primary text (landing page)**
> Homeowners don't scroll through Google anymore. They ask ChatGPT "who's the best HVAC company near me?" and call whoever it names.
>
> If AI doesn't know your business, that call goes to your competitor.
>
> Get a free AI visibility audit and see exactly where you show up in ChatGPT, Perplexity and Gemini.

**Primary text (Instant Form)**
> Homeowners now ask ChatGPT who to call. If it doesn't name you, the job goes to someone else.
>
> Tell us your website and we'll send you a free AI visibility audit showing where you show up and who AI recommends instead.

**Headline:** Is AI sending your jobs to competitors?
**Description:** Free AI visibility audit for home service businesses

### HS2. "Would ChatGPT recommend you?"
Files: `appear_hs2_visibility_score_*.png`

**Primary text (landing page)**
> Quick question: if a homeowner asked ChatGPT for the best roofer, plumber or electrician in your area, would it say your name?
>
> Most local businesses score under 30 out of 100 on AI visibility. Get your free score and see who AI recommends instead of you.

**Primary text (Instant Form)**
> Would ChatGPT recommend your business? Most local service companies have no idea.
>
> Drop your website below and we'll send your free AI visibility score, plus the competitors AI is recommending instead.

**Headline:** Get your free AI visibility score
**Description:** See if ChatGPT recommends your business

> Note: "most local businesses score under 30" is a placeholder claim. Only run it if your audit data backs it up. Otherwise cut that sentence.

### HS3. "Your next customer won't Google you"
Files: `appear_hs3_wont_google_you_*.png`

**Primary text (landing page)**
> "Plumber near me" is moving from Google to ChatGPT.
>
> More homeowners now ask AI who to call, and AI only recommends businesses it can actually read and trust. Plumbing, HVAC, roofing, electrical, landscaping, cleaning: it's happening in every trade.
>
> See if AI recommends you. The audit is free.

**Primary text (Instant Form)**
> Your next customer won't Google you. They'll ask AI.
>
> Leave your website and we'll send a free audit showing whether ChatGPT, Perplexity and Gemini recommend your business.

**Headline:** Your next customer will ask AI
**Description:** Free AI visibility audit

---

## General (all verticals)

### G1. "To AI, it's almost empty"
Files: `appear_g1_what_ai_sees_*.png`

**Primary text (landing page)**
> Your website was built for people. AI crawlers see something very different: often a blank page with no readable content.
>
> That's why ChatGPT and Perplexity recommend your competitors instead of you.
>
> Get a free audit and see your site the way AI sees it.

**Primary text (Instant Form)**
> Your site looks great to people. To ChatGPT, it might be almost empty.
>
> Share your website and we'll send you a free audit showing what AI can read on your site and what to fix first.

**Headline:** See your site the way AI sees it
**Description:** Free AI visibility audit

### G2. "Same question. Different winner."
Files: `appear_g2_same_question_*.png`

**Primary text (landing page)**
> Your buyers are asking ChatGPT, Perplexity and Gemini for recommendations. AI picks a winner and lists a few names.
>
> Appear makes your business readable to AI, with no code changes and no redesign, so your name is the one it recommends.
>
> Start with a free AI visibility audit.

**Primary text (Instant Form)**
> Same question, different answer. Appear helps AI understand your business, so it gets recommended first.
>
> Leave your website and we'll send you a free audit of where you stand today.

**Headline:** Be the answer AI gives
**Description:** Free AI visibility audit. No code changes.

### G3. "6x more AI referrals" (best for retargeting)
Files: `appear_g3_results_*.png`

**Primary text (landing page)**
> 6x more AI referrals for a luxury watch retailer. 4x for a consumer app. Zero code changes on either site.
>
> Appear makes your website readable to ChatGPT, Perplexity, Claude and Gemini, so they recommend you.
>
> See what's possible for your business with a free AI visibility audit.

**Primary text (Instant Form)**
> 6x more AI referrals. Zero code changes.
>
> Want to know what Appear could do for your business? Leave your website and we'll send a free AI visibility audit.

**Headline:** 6x more AI referrals. Zero code.
**Description:** Free AI visibility audit

---

## Test setup

1. **Campaign 1, Home services (cold).** HS1, HS2 and HS3. Target home service owners: interests like ServiceTitan, Jobber, Housecall Pro, contractor, HVAC, plumbing, roofing and small business owner. Also test broad targeting with the creative doing the filtering.
2. **Campaign 2, General (cold).** G1 and G2. Broad targeting plus interests like small business owner, marketing and ecommerce.
3. **Campaign 3, Retargeting.** G3 plus your best cold winner. Target site visitors and video viewers from the last 30 days, and leave out people who already did the audit.
4. **Destination test.** In each cold campaign, run two ad sets with the same creatives: one goes to the landing page and one uses an Instant Form. Compare **cost per completed audit**, not cost per click. Instant Forms almost always look cheaper per lead, so the real comparison is how many of those leads open the audit and book a call.
5. Use the **4:5 file for Feed** and the **9:16 file for Stories and Reels** through placement asset customization. Use the 1:1 file only if you need one image for every placement.
6. Give each ad set about 50 conversions' worth of budget before judging it, then kill the bottom third and make new versions of the winning angle.

## Editing the creatives

The source is in `source/`. Change the copy in `source/build.js`, then run:

```bash
NODE_PATH=$(npm root -g) node source/build.js png
```

Backgrounds were made with GPT Image 2 through treg and are saved in `source/assets/`.
