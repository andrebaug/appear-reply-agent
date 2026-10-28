// Minimal, low copy Meta ads (1:1 and 9:16): node minimal.js <outdir> [concept]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { CSS, mark, icons } = require('./common');

const OUT = process.argv[2] || path.join(__dirname, 'out_min');
const ONLY = process.argv[3];
const A = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const SIZES = {
  square: { w: 1080, h: 1080, k: 0.9, pad: '60px 64px 64px', tag: '1x1' },
  story: { w: 1080, h: 1920, k: 1.08, pad: '230px 72px 340px', tag: '9x16' },
};
const gap = (px) => `<div style="height:calc(var(--k)*${px}px);flex:none"></div>`;
const logo = `<div style="display:flex"><div class="navpill" style="padding:calc(var(--k)*12px) calc(var(--k)*30px) calc(var(--k)*12px) calc(var(--k)*20px)"><div class="logo">${mark()}Appear</div></div></div>`;
const cta = (t) => `<div><span class="btn big" style="font-size:calc(var(--k)*34px);padding:calc(var(--k)*32px) calc(var(--k)*50px)">${t} ${icons.arrow}</span></div>`;
const MCSS = `
.mh{font-weight:400;letter-spacing:-.045em;line-height:.98;font-size:calc(var(--k)*var(--hs));text-shadow:0 2px 40px rgba(0,40,0,.25)}
.mh em{font-style:normal;font-weight:500}
.searchbar{display:flex;align-items:center;gap:calc(var(--k)*16px);background:#fff;color:var(--ink);border-radius:999px;padding:calc(var(--k)*20px) calc(var(--k)*20px) calc(var(--k)*20px) calc(var(--k)*34px);font-size:calc(var(--k)*36px);letter-spacing:-.02em;box-shadow:0 24px 70px rgba(0,50,0,.3)}
.searchbar .send{margin-left:auto;width:calc(var(--k)*68px);height:calc(var(--k)*68px);border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:calc(var(--k)*32px);flex:none}
.searchbar .ic{font-size:calc(var(--k)*34px);display:grid;color:#555}
.mrow{display:flex;align-items:center;gap:calc(var(--k)*16px);background:#fff;color:var(--ink);border-radius:calc(var(--k)*22px);padding:calc(var(--k)*22px) calc(var(--k)*28px);font-size:calc(var(--k)*32px);letter-spacing:-.015em;box-shadow:0 16px 50px rgba(0,50,0,.22)}
.mrow .r{margin-left:auto;display:grid;font-size:calc(var(--k)*30px)}
.mrow.no{background:#fff1ee;color:#2a2a28;box-shadow:0 0 0 3px rgba(255,120,90,.55),0 16px 50px rgba(0,50,0,.22)}
.mrow.no .r{color:#c2410c}
.mrow .ok{color:#2f8f2a}
.pick{background:#fff;color:var(--ink);border-radius:calc(var(--k)*32px);padding:calc(var(--k)*34px) calc(var(--k)*38px);box-shadow:0 24px 70px rgba(0,50,0,.3)}
.pick .lbl{display:flex;align-items:center;gap:10px;font-size:calc(var(--k)*24px);color:var(--muted)}
.pick .txt{margin-top:calc(var(--k)*12px);font-size:calc(var(--k)*44px);letter-spacing:-.03em;line-height:1.15}
.engines{display:flex;flex-wrap:wrap;gap:calc(var(--k)*12px)}
.engines .chip{font-size:calc(var(--k)*26px);padding:calc(var(--k)*14px) calc(var(--k)*26px)}
.src{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*24px);opacity:.92}
`;

const CONCEPTS = {
  m1_does_chatgpt_recommend_you: {
    bgpos: 'center 20%',
    html: (s) => `
      ${logo}
      <div style="flex:1"></div>
      <div class="mh" style="--hs:${s === 'square' ? 126 : 128}px">Does ChatGPT<br>recommend <em>you?</em></div>
      ${gap(s === 'square' ? 50 : 70)}
      <div class="searchbar"><span class="ic">${icons.gpt}</span>Who's the best one near me?<span class="send">${icons.up}</span></div>
      <div style="flex:1"></div>
      ${cta('Check for free')}
    `,
  },
  m2_sending_customers_away: {
    bgpos: 'center 50%',
    html: (s) => `
      ${logo}
      ${gap(s === 'square' ? 46 : 90)}
      <div class="mh" style="--hs:${s === 'square' ? 92 : 112}px">AI is sending<br>your customers<br><em>somewhere else.</em></div>
      <div style="flex:1"></div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--k)*12px)">
        <div class="mrow"><b>Competitor A</b><span class="r ok">${icons.check}</span></div>
        <div class="mrow"><b>Competitor B</b><span class="r ok">${icons.check}</span></div>
        <div class="mrow no"><b>You</b><span class="r" style="font-size:calc(var(--k)*28px);font-weight:600">Not mentioned</span></div>
      </div>
      ${gap(s === 'square' ? 40 : 60)}
      ${cta('Find out free')}
    `,
  },
  m3_free_ai_audit: {
    bgpos: 'center 80%',
    html: (s) => `
      ${logo}
      <div style="flex:1"></div>
      <div class="mh" style="--hs:${s === 'square' ? 190 : 230}px;line-height:.9">Free<br><em>AI audit.</em></div>
      ${gap(s === 'square' ? 34 : 50)}
      <div class="lead" style="font-size:calc(var(--k)*40px);max-width:18em">See if AI recommends your business.</div>
      ${gap(s === 'square' ? 34 : 50)}
      <div class="engines"><span class="chip">ChatGPT</span><span class="chip">Claude</span><span class="chip">Perplexity</span><span class="chip">Gemini</span></div>
      <div style="flex:1"></div>
      ${cta('Get yours')}
    `,
  },
  m4_be_the_one: {
    bgpos: 'center 35%',
    html: (s) => `
      ${logo}
      ${gap(s === 'square' ? 46 : 90)}
      <div class="mh" style="--hs:${s === 'square' ? 112 : 118}px">Be the one<br>AI <em>recommends.</em></div>
      <div style="flex:1"></div>
      <div class="pick">
        <div class="lbl">${icons.gpt} ChatGPT</div>
        <div class="txt">My top pick is <span class="you">Your Business</span>.</div>
      </div>
      ${gap(s === 'square' ? 40 : 60)}
      ${cta('Get your free AI audit')}
    `,
  },
  m5_six_x: {
    bgpos: 'center 60%',
    html: (s) => `
      ${logo}
      <div style="flex:1"></div>
      <div class="mh" style="--hs:${s === 'square' ? 330 : 420}px;line-height:.8;letter-spacing:-.07em">6x</div>
      ${gap(s === 'square' ? 26 : 40)}
      <div class="mh" style="--hs:${s === 'square' ? 70 : 84}px">more traffic from AI.<br><em>Zero extra work.</em></div>
      ${gap(s === 'square' ? 24 : 34)}
      <div><span class="chip" style="font-size:calc(var(--k)*24px)">AI referrals · luxury watch retailer · Q1 2026</span></div>
      <div style="flex:1"></div>
      ${cta('Get your free AI audit')}
    `,
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [id, c] of Object.entries(CONCEPTS)) {
    if (ONLY && !id.startsWith(ONLY)) continue;
    for (const [sk, sz] of Object.entries(SIZES)) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${MCSS}</style></head>
      <body style="--w:${sz.w}px;--h:${sz.h}px;--k:${sz.k}"><div style="position:relative;width:${sz.w}px;height:${sz.h}px;overflow:hidden">
      <div style="position:absolute;inset:0;background:url(${A}/${sk === 'square' ? 'grass_sq4k.jpg' : 'grass_story4k.jpg'}) ${c.bgpos}/cover"></div><div class="shade-top"></div>
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
