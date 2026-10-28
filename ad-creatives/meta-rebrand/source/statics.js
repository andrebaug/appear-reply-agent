// Static Meta ads for the rebrand: node statics.js <outdir> [concept]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { CSS, mark, icons } = require('./common');

const OUT = process.argv[2] || path.join(__dirname, 'out');
const ONLY = process.argv[3];
const A = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const SIZES = {
  square: { w: 1080, h: 1080, k: 0.82, pad: '56px 60px 60px', tag: '1x1' },
  feed: { w: 1080, h: 1350, k: 1, pad: '60px 64px 76px', tag: '4x5' },
  story: { w: 1080, h: 1920, k: 1.05, pad: '220px 70px 330px', tag: '9x16' },
};
const gap = (px) => `<div style="height:calc(var(--k)*${px}px);flex:none"></div>`;
const nav = (right = 'Free AI audit') => `<div class="navpill"><div class="logo">${mark()}Appear</div><span class="btn">${right}</span></div>`;

const CONCEPTS = {
  r1_says_your_name: {
    bg: 'grass_feed.jpg', bgStory: 'grass_feed.jpg',
    html: (s) => `
      ${nav()}
      ${gap(s === 'square' ? 50 : s === 'story' ? 90 : 80)}
      <div style="text-align:center">
        <div class="h" style="--hs:${s === 'square' ? 78 : 88}px">${s === 'story' ? 'Your customers<br>are asking AI.<br>Make sure it says<br><em>your name.</em>' : 'Your customers are asking AI.<br>Make sure it says <em>your name.</em>'}</div>
        ${s === 'square' ? '' : `${gap(34)}<span class="chip">${icons.burst} ChatGPT, Claude, Perplexity &amp; Gemini</span>`}
      </div>
      <div style="flex:1"></div>
      <div class="card" style="padding:calc(var(--k)*32px)">
        <div class="hd">${icons.gpt} ChatGPT <span class="chev">⌄</span></div>
        ${gap(20)}
        <div class="q">Who's the best roofer near me?<span class="send">${icons.up}</span></div>
        ${gap(24)}
        <div class="ans">I'd go with <span class="you">Your Business</span>. Locals love their fast replies and fair prices${s === 'square' ? '.' : ', and they\'re one of the highest rated roofers in your area.'}</div>
      </div>
      ${gap(s === 'square' ? 36 : 50)}
      <div style="text-align:center"><span class="btn big">Get your free AI audit ${icons.arrow}</span></div>
    `,
  },
  r2_phone_quiet: {
    bg: 'grass_feed.jpg', bgpos: 'center 30%',
    html: (s) => `
      ${nav()}
      ${gap(s === 'square' ? 50 : s === 'story' ? 90 : 76)}
      <div class="tag" style="opacity:.9">[ for home service pros ]</div>
      ${gap(18)}
      <div class="h" style="--hs:${s === 'square' ? 100 : 118}px">Phone a little<br>quiet lately?</div>
      ${gap(s === 'square' ? 22 : 30)}
      <div class="lead" style="max-width:22em">Homeowners now ask ChatGPT who to call. Appear makes sure it's you.</div>
      <div style="flex:1"></div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--k)*14px)">
        <div class="notif"><div class="app green">${icons.phone}</div><div><div class="t">New job request</div><div class="b">Leaking kitchen faucet · Found you on ChatGPT</div></div><span class="tm">now</span></div>
        <div class="notif"><div class="app">${mark('#fff')}</div><div><div class="t">Recommended by AI</div><div class="b">Perplexity named you the top plumber nearby</div></div><span class="tm">4m</span></div>
        ${s === 'square' ? '' : `<div class="notif"><div class="app green">${icons.phone}</div><div><div class="t">New job request</div><div class="b">Water heater install · Found you on Gemini</div></div><span class="tm">12m</span></div>`}
      </div>
      ${gap(s === 'square' ? 36 : 50)}
      <div><span class="btn big">See if AI recommends you ${icons.arrow}</span></div>
    `,
  },
  r3_then_relax: {
    light: true,
    html: (s) => `
      <div class="navpill" style="border:1.5px solid var(--line);box-shadow:none">${`<div class="logo">${mark()}Appear</div><span class="btn">Free AI audit</span>`}</div>
      ${gap(s === 'square' ? 46 : s === 'story' ? 80 : 70)}
      <div class="h" style="--hs:${s === 'square' ? 88 : s === 'story' ? 84 : 92}px;color:var(--ink);text-shadow:none">Get recommended by AI.<br><span style="color:var(--green)">Then relax.</span></div>
      ${`${gap(26)}<div class="lead" style="text-shadow:none;color:#3d3d3a;max-width:22em">More customers find you through ChatGPT, Claude and Perplexity. You don't lift a finger.</div>`}
      <div style="flex:1"></div>
      <div style="flex:none;position:relative;border-radius:calc(var(--k)*36px);overflow:hidden;padding:calc(var(--k)*30px);background:url(${A}/grass_sq4k.jpg) center/cover">
        <div style="display:flex;flex-direction:column;gap:calc(var(--k)*14px);position:relative">
          ${[
            [icons.gpt, 'ChatGPT', `My top pick is <span class="you">Your Business</span>.`],
            [icons.burst, 'Claude', `I'd recommend <span class="you">Your Business</span> for this.`],
            [icons.star, 'Perplexity', `<span class="you">Your Business</span> is the most trusted option.`],
          ].slice(0, s === 'square' ? 2 : 3).map(([ic, n, t]) => `
            <div class="card" style="padding:calc(var(--k)*24px) calc(var(--k)*28px);box-shadow:0 14px 40px rgba(0,50,0,.22)">
              <div class="hd" style="font-size:calc(var(--k)*22px);color:var(--muted)">${ic} ${n}</div>
              <div class="ans" style="margin-top:8px">${t}</div>
            </div>`).join('')}
        </div>
      </div>
      ${gap(s === 'square' ? 34 : 46)}
      <div><span class="btn big">Get your free AI audit ${icons.arrow}</span></div>
    `,
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [id, c] of Object.entries(CONCEPTS)) {
    if (ONLY && !id.startsWith(ONLY)) continue;
    for (const [sk, sz] of Object.entries(SIZES)) {
      const bg = c.light
        ? `<div class="grid-bg"></div>`
        : `<div style="position:absolute;inset:0;background:url(${A}/${sk === 'square' ? 'grass_sq4k.jpg' : 'grass_story4k.jpg'}) ${c.bgpos || 'center'}/cover"></div><div class="shade-top"></div>`;
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
      <body style="--w:${sz.w}px;--h:${sz.h}px;--k:${sz.k}"><div style="position:relative;width:${sz.w}px;height:${sz.h}px;overflow:hidden">${bg}
      <div style="position:absolute;inset:0;padding:${sz.pad};display:flex;flex-direction:column">${c.html(sk)}</div></div></body></html>`;
      const file = path.join(__dirname, `_${id}_${sk}.html`);
      fs.writeFileSync(file, html);
      const page = await browser.newPage({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 2 });
      await page.goto('file://' + file);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT, `appear_${id}_${sz.tag}.png`) });
      await page.close();
      fs.unlinkSync(file);
    }
    console.log('done', id);
  }
  await browser.close();
})();
