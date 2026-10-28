// Builds Appear Meta ad creatives as HTML and renders them to PNG.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT = process.argv[2] || path.join(ROOT, 'out');
const ONLY = process.argv[3]; // optional concept id filter
fs.mkdirSync(OUT, { recursive: true });

const SIZES = {
  square: { w: 1080, h: 1080, k: 0.84, pad: '64px 68px 64px', tag: '1x1' },
  feed: { w: 1080, h: 1350, k: 1, pad: '78px 80px 80px', tag: '4x5' },
  story: { w: 1080, h: 1920, k: 1.06, pad: '230px 80px 330px', tag: '9x16' },
};

const x = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const check = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bang = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 6v8M12 18.2v.1" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`;
const arrow = `<svg viewBox="0 0 24 24" width="0.9em" height="0.9em"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const star = `<svg viewBox="0 0 24 24" width="0.85em" height="0.85em"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" fill="currentColor"/></svg>`;
const spark = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2c.6 4.8 2.9 7.3 8 8-5.1.7-7.4 3.2-8 8-.6-4.8-2.9-7.3-8-8 5.1-.7 7.4-3.2 8-8z" fill="currentColor"/></svg>`;

const CSS = `
${fs.readFileSync(path.join(ROOT, 'assets/fonts-local.css'), 'utf8')}
:root{--ink:#fff;--muted:rgba(255,255,255,.62);--faint:rgba(255,255,255,.4);--blue:#bfe0ff;--blue2:#8cc8ff;--red:#ff8a8a;--amber:#ffd27a;--green:#8ff0c0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--w);height:var(--h);background:#0b0f12;overflow:hidden}
body{font-family:'Geist',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;font-size:calc(var(--k)*28px)}
.canvas{position:relative;width:var(--w);height:var(--h);overflow:hidden}
.bg{position:absolute;inset:0;background-size:cover;background-position:var(--bgpos,center);filter:saturate(.9)}
.shade{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(8,12,14,.78) 0%,rgba(8,12,14,.35) 30%,rgba(8,12,14,.2) 52%,rgba(8,12,14,.7) 78%,rgba(8,12,14,.94) 100%)}
.grain{position:absolute;inset:0;opacity:.09;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.frame{position:absolute;inset:0;padding:var(--pad);display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:calc(var(--k)*12px);font-weight:600;font-size:calc(var(--k)*38px);letter-spacing:-.02em}
.brand img{width:calc(var(--k)*62px);height:calc(var(--k)*62px);object-fit:contain;filter:drop-shadow(0 6px 18px rgba(80,170,255,.35))}
.eyebrow{font-family:'Geist Mono',monospace;font-weight:500;font-size:calc(var(--k)*21px);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.pill-tag{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*19px);letter-spacing:.12em;text-transform:uppercase;color:#dff0ff;padding:calc(var(--k)*10px) calc(var(--k)*18px);border-radius:999px;border:1px solid rgba(191,224,255,.35);background:rgba(140,200,255,.12);backdrop-filter:blur(12px)}
h1{font-weight:700;letter-spacing:-.045em;line-height:.98;font-size:calc(var(--k)*var(--hs,92px))}
h1 .g{background:linear-gradient(100deg,#ffffff 0%,#d6ebff 35%,#a9d6ff 75%,#8cc8ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:rgba(255,255,255,.78);font-size:calc(var(--k)*31px);line-height:1.38;letter-spacing:-.01em;max-width:24em}
.glass{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.18);border-radius:calc(var(--k)*30px);backdrop-filter:blur(28px) saturate(1.2);-webkit-backdrop-filter:blur(28px) saturate(1.2);box-shadow:0 30px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.22)}
.cta-row{display:flex;align-items:center;gap:calc(var(--k)*26px)}
.cta{display:inline-flex;align-items:center;gap:calc(var(--k)*14px);background:#fff;color:#0a0a0a;font-weight:600;font-size:calc(var(--k)*32px);letter-spacing:-.015em;padding:calc(var(--k)*26px) calc(var(--k)*42px);border-radius:999px;box-shadow:0 14px 40px rgba(0,0,0,.35),0 0 0 6px rgba(255,255,255,.08)}
.cta-note{color:var(--muted);font-size:calc(var(--k)*24px);line-height:1.35}
.cta-note b{color:#fff;font-weight:600}
.engines{display:flex;flex-wrap:wrap;gap:calc(var(--k)*10px)}
.chip{font-size:calc(var(--k)*21px);font-weight:500;color:rgba(255,255,255,.85);padding:calc(var(--k)*9px) calc(var(--k)*18px);border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);backdrop-filter:blur(10px)}
.spacer{flex:1}
.mono{font-family:'Geist Mono',monospace}
/* chat */
.chat{padding:calc(var(--k)*30px) calc(var(--k)*34px)}
.chat-head{display:flex;align-items:center;gap:calc(var(--k)*12px);color:var(--muted);font-size:calc(var(--k)*21px);font-weight:500;padding-bottom:calc(var(--k)*20px);border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:calc(var(--k)*24px)}
.chat-head .dot{width:calc(var(--k)*30px);height:calc(var(--k)*30px);border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#9fd2ff 60%,#4d8fd6);display:grid;place-items:center;color:#0b1a2a;font-size:calc(var(--k)*16px)}
.bubble{margin-left:auto;width:fit-content;max-width:82%;background:rgba(255,255,255,.92);color:#111;border-radius:calc(var(--k)*26px) calc(var(--k)*26px) calc(var(--k)*8px) calc(var(--k)*26px);padding:calc(var(--k)*18px) calc(var(--k)*26px);font-size:calc(var(--k)*27px);line-height:1.35;font-weight:500;letter-spacing:-.01em}
.answer{margin-top:calc(var(--k)*24px);font-size:calc(var(--k)*25px);line-height:1.45;color:rgba(255,255,255,.88)}
.rlist{list-style:none;margin-top:calc(var(--k)*14px);display:flex;flex-direction:column;gap:calc(var(--k)*10px)}
.rlist li{display:flex;align-items:center;gap:calc(var(--k)*16px);padding:calc(var(--k)*15px) calc(var(--k)*18px);border-radius:calc(var(--k)*18px);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}
.rlist .n{font-family:'Geist Mono',monospace;color:var(--faint);font-size:calc(var(--k)*22px);width:1.4em}
.rlist .nm{font-weight:600;color:#fff;font-size:calc(var(--k)*26px);letter-spacing:-.01em}
.rlist .meta{margin-left:auto;color:var(--muted);font-size:calc(var(--k)*21px);display:flex;align-items:center;gap:.35em}
.rlist .meta svg{color:var(--amber)}
.missing{display:flex;align-items:center;gap:calc(var(--k)*14px);margin-top:calc(var(--k)*18px);padding:calc(var(--k)*16px) calc(var(--k)*20px);border-radius:calc(var(--k)*18px);border:1px dashed rgba(255,138,138,.55);background:rgba(255,90,90,.1);color:#ffd0d0;font-weight:500;font-size:calc(var(--k)*24px)}
.missing .ic{width:calc(var(--k)*34px);height:calc(var(--k)*34px);border-radius:50%;background:rgba(255,120,120,.22);color:var(--red);display:grid;place-items:center;font-size:calc(var(--k)*20px);flex:none}
/* score */
.score{padding:calc(var(--k)*34px)}
.score-top{display:flex;align-items:center;gap:calc(var(--k)*30px);padding-bottom:calc(var(--k)*26px);border-bottom:1px solid rgba(255,255,255,.1)}
.ring{--p:23;width:calc(var(--k)*170px);height:calc(var(--k)*170px);border-radius:50%;flex:none;display:grid;place-items:center;
  background:conic-gradient(from -90deg,#ff9b8a 0,#ffb27a calc(var(--p)*1%),rgba(255,255,255,.1) 0)}
.ring>div{width:82%;height:82%;border-radius:50%;background:rgba(14,20,24,.92);display:grid;place-items:center;text-align:center}
.ring b{display:block;font-size:calc(var(--k)*62px);font-weight:700;letter-spacing:-.04em;line-height:1}
.ring span{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*17px);color:var(--faint)}
.score-meta .eyebrow{font-size:calc(var(--k)*18px)}
.score-meta .site{font-size:calc(var(--k)*34px);font-weight:600;letter-spacing:-.02em;margin:calc(var(--k)*6px) 0 calc(var(--k)*10px)}
.badge{display:inline-flex;align-items:center;gap:.4em;font-size:calc(var(--k)*20px);font-weight:600;color:#ffcfc4;background:rgba(255,120,100,.16);border:1px solid rgba(255,140,120,.35);padding:calc(var(--k)*6px) calc(var(--k)*14px);border-radius:999px}
.rows{display:flex;flex-direction:column;margin-top:calc(var(--k)*10px)}
.row{display:flex;align-items:center;padding:calc(var(--k)*17px) 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:calc(var(--k)*26px)}
.row:last-child{border-bottom:0}
.row .l{color:rgba(255,255,255,.9);font-weight:500}
.row .r{margin-left:auto;display:flex;align-items:center;gap:calc(var(--k)*12px);color:var(--muted);font-size:calc(var(--k)*23px)}
.st{width:calc(var(--k)*32px);height:calc(var(--k)*32px);border-radius:50%;display:grid;place-items:center;font-size:calc(var(--k)*19px)}
.st.bad{background:rgba(255,120,120,.18);color:var(--red)}
.st.warn{background:rgba(255,210,122,.18);color:var(--amber)}
.st.ok{background:rgba(143,240,192,.18);color:var(--green)}
/* trades */
.trades{display:flex;flex-wrap:wrap;gap:calc(var(--k)*12px)}
.trades .chip{font-size:calc(var(--k)*24px);padding:calc(var(--k)*12px) calc(var(--k)*22px)}
/* split */
.split{display:grid;grid-template-columns:1fr 1fr;gap:0;overflow:hidden}
.split>div{padding:calc(var(--k)*28px)}
.split>div+div{border-left:1px solid rgba(255,255,255,.12);background:rgba(4,8,10,.55)}
.split .lab{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*18px);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:calc(var(--k)*18px);display:flex;align-items:center;gap:.6em}
.split .lab i{width:.6em;height:.6em;border-radius:50%;background:var(--green);display:inline-block}
.split>div+div .lab i{background:var(--red)}
.site-mock{border-radius:calc(var(--k)*16px);overflow:hidden;background:#f4f2ee;color:#1b1b1b;height:calc(var(--k)*var(--mockh,400px));display:flex;flex-direction:column}
.site-mock .nav{display:flex;align-items:center;gap:8px;padding:calc(var(--k)*14px) calc(var(--k)*16px)}
.site-mock .nav .lg{width:calc(var(--k)*70px);height:calc(var(--k)*12px);border-radius:6px;background:#1b1b1b}
.site-mock .nav .ln{width:calc(var(--k)*34px);height:calc(var(--k)*8px);border-radius:4px;background:#c9c5bd;margin-left:auto}
.site-mock .nav .ln+.ln{margin-left:6px}
.site-mock .hero{margin:0 calc(var(--k)*14px);flex:1;border-radius:calc(var(--k)*12px);background:linear-gradient(160deg,#cfd9d6 0%,#9fb3ae 45%,#5d7470 100%);position:relative;overflow:hidden}
.site-mock .hero:after{content:'';position:absolute;left:-10%;right:-10%;bottom:-30%;height:70%;background:radial-gradient(ellipse at 50% 100%,#2f4441 0,#3f5753 40%,transparent 70%)}
.site-mock .ht{position:absolute;left:12%;top:16%;z-index:1;display:flex;flex-direction:column;gap:8px}
.site-mock .ht b{display:block;height:calc(var(--k)*16px);border-radius:6px;background:#fff}
.site-mock .ht .btn{width:calc(var(--k)*90px);height:calc(var(--k)*26px);border-radius:99px;background:#1b1b1b;margin-top:8px}
.site-mock .cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:calc(var(--k)*14px)}
.site-mock .cards i{height:calc(var(--k)*56px);border-radius:8px;background:#e2ded6}
.code{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*20px);line-height:1.75;color:rgba(255,255,255,.42);height:calc(var(--k)*var(--mockh,400px));display:flex;flex-direction:column}
.code .t{color:#8cc8ff}.code .a{color:#ffd27a}
.code .result{margin-top:auto;padding:calc(var(--k)*14px) calc(var(--k)*16px);border-radius:calc(var(--k)*14px);background:rgba(255,100,100,.12);border:1px dashed rgba(255,138,138,.5);color:#ffd0d0;font-family:'Geist',sans-serif;font-size:calc(var(--k)*22px);line-height:1.35}
.code .result b{display:block;font-size:calc(var(--k)*32px);color:#fff;letter-spacing:-.02em}
/* before after */
.ba{padding:calc(var(--k)*28px) calc(var(--k)*30px)}
.q{display:flex;gap:calc(var(--k)*14px);align-items:center;font-size:calc(var(--k)*26px);font-weight:500;padding-bottom:calc(var(--k)*22px);border-bottom:1px solid rgba(255,255,255,.1)}
.q .dot{flex:none}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--k)*18px);margin-top:calc(var(--k)*22px)}
.col{border-radius:calc(var(--k)*20px);padding:calc(var(--k)*20px);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.col.after{background:linear-gradient(180deg,rgba(140,200,255,.16),rgba(140,200,255,.05));border-color:rgba(160,210,255,.4);box-shadow:0 0 60px rgba(120,190,255,.18)}
.col h4{font-family:'Geist Mono',monospace;font-weight:500;font-size:calc(var(--k)*18px);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:calc(var(--k)*14px)}
.col.after h4{color:#cfe8ff}
.col ol{list-style:none;display:flex;flex-direction:column;gap:calc(var(--k)*9px)}
.col li{display:flex;align-items:center;gap:calc(var(--k)*10px);font-size:calc(var(--k)*23px);color:rgba(255,255,255,.75);padding:calc(var(--k)*11px) calc(var(--k)*12px);border-radius:calc(var(--k)*12px);background:rgba(255,255,255,.04)}
.col li .n{font-family:'Geist Mono',monospace;color:var(--faint);font-size:calc(var(--k)*19px)}
.col li.you{background:#fff;color:#0a0a0a;font-weight:600}
.col li.you .n{color:#5a7a99}
.col li.you .tick{margin-left:auto;color:#1f8f5f;display:grid}
.col .none{margin-top:calc(var(--k)*12px);font-size:calc(var(--k)*21px);color:#ffc4c4;display:flex;align-items:center;gap:.4em}
/* stats */
.big{font-weight:700;letter-spacing:-.06em;line-height:.82;font-size:calc(var(--k)*var(--bs,330px))}
.biglab{font-size:calc(var(--k)*40px);font-weight:600;letter-spacing:-.02em;margin-top:calc(var(--k)*18px)}
.bigsrc{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*19px);color:var(--faint);letter-spacing:.06em;margin-top:calc(var(--k)*10px);text-transform:uppercase}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--k)*16px)}
.tile{padding:calc(var(--k)*24px) calc(var(--k)*26px)}
.tile b{display:block;font-size:calc(var(--k)*68px);letter-spacing:-.045em;line-height:1}
.tile span{display:block;font-size:calc(var(--k)*24px);font-weight:500;margin-top:calc(var(--k)*8px)}
.tile em{display:block;font-style:normal;font-family:'Geist Mono',monospace;font-size:calc(var(--k)*17px);color:var(--faint);letter-spacing:.05em;margin-top:calc(var(--k)*6px);text-transform:uppercase}
`;

const brand = `<div class="brand"><img src="assets/logo.png"><span>Appear</span></div>`;
const engines = `<div class="engines"><span class="chip">ChatGPT</span><span class="chip">Perplexity</span><span class="chip">Claude</span><span class="chip">Gemini</span><span class="chip">AI Overviews</span></div>`;
const cta = (label, note) => `<div class="cta-row"><span class="cta">${label} ${arrow}</span>${note ? `<span class="cta-note">${note}</span>` : ''}</div>`;
const gap = (px) => `<div style="height:calc(var(--k)*${px}px)"></div>`;

// Each concept returns inner frame HTML for a given size key.
const CONCEPTS = {
  hs1_ai_picked_competitor: {
    bg: 'bg_house.jpg', bgpos: 'center 70%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Home services</span></div>
      ${gap(s === 'square' ? 34 : 56)}
      <h1 style="--hs:${s === 'square' ? 74 : 88}px">Homeowners ask AI who to call.<br><span class="g">It named your competitors.</span></h1>
      ${gap(40)}<div class="spacer"></div>
      <div class="glass chat">
        <div class="chat-head"><span class="dot">${spark}</span>ChatGPT</div>
        <div class="bubble">Who's the best HVAC company near me? My AC just stopped working.</div>
        <div class="answer">Here are the top rated options in your area:
          <ul class="rlist">
            <li><span class="n">01</span><span class="nm">Northside Heating &amp; Air</span><span class="meta">${star} 4.9</span></li>
            <li><span class="n">02</span><span class="nm">Summit Comfort Pros</span><span class="meta">${star} 4.8</span></li>
            ${s !== 'story' ? '' : `<li><span class="n">03</span><span class="nm">BlueLine Mechanical</span><span class="meta">${star} 4.8</span></li>`}
          </ul>
        </div>
        <div class="missing"><span class="ic">${x}</span>Your business: not mentioned</div>
      </div>
      ${gap(s === 'square' ? 30 : 46)}
      ${cta('Get your free AI audit', s === 'square' ? '' : 'See exactly where<br>you show up. <b>Free.</b>')}
    `,
  },
  hs2_visibility_score: {
    bg: 'bg_roof.jpg', bgpos: 'center 60%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Free audit</span></div>
      ${gap(s === 'square' ? 34 : 56)}
      <h1 style="--hs:${s === 'square' ? 86 : 98}px">Would ChatGPT<br><span class="g">recommend you?</span></h1>
      ${s === 'square' ? '' : `${gap(24)}<p class="sub">Get your AI visibility score and see who AI sends your customers to instead.</p>`}
      <div class="spacer"></div>
      <div class="glass score">
        <div class="score-top">
          <div class="ring" style="--p:23"><div><div><b>23</b><span>/ 100</span></div></div></div>
          <div class="score-meta">
            <div class="eyebrow">AI visibility report</div>
            <div class="site">summitroofing.com</div>
            <span class="badge">${bang} Low visibility</span>
          </div>
        </div>
        <div class="rows">
          <div class="row"><span class="l">ChatGPT</span><span class="r">Not recommended <span class="st bad">${x}</span></span></div>
          <div class="row"><span class="l">Perplexity</span><span class="r">Not recommended <span class="st bad">${x}</span></span></div>
          ${s === 'square' ? '' : `<div class="row"><span class="l">Gemini</span><span class="r">Not recommended <span class="st bad">${x}</span></span></div>`}
          <div class="row"><span class="l">Google AI Overviews</span><span class="r">Mentioned once <span class="st warn">${bang}</span></span></div>
          <div class="row"><span class="l">Competitors recommended</span><span class="r"><b style="color:#fff;font-size:1.15em">4</b> <span class="st bad">${x}</span></span></div>
        </div>
      </div>
      ${gap(s === 'square' ? 30 : 46)}
      ${cta('Get your free score', s === 'square' ? '' : 'Free for home service<br>businesses.')}
    `,
  },
  hs3_wont_google_you: {
    bg: 'bg_van.jpg', bgpos: 'center 65%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Home services</span></div>
      ${gap(s === 'story' ? 120 : s === 'square' ? 50 : 90)}
      <div class="eyebrow">[ The new “near me” ]</div>
      ${gap(22)}
      <h1 style="--hs:${s === 'square' ? 104 : 122}px">Your next customer won't Google you.<br><span class="g">They'll ask AI.</span></h1>
      ${gap(s === 'square' ? 26 : 36)}
      <p class="sub">When homeowners ask ChatGPT who to call, make sure your name is the answer.</p>
      <div class="spacer"></div>
      ${s === 'square' ? '' : `<div class="trades"><span class="chip">Plumbing</span><span class="chip">HVAC</span><span class="chip">Roofing</span><span class="chip">Electrical</span><span class="chip">Landscaping</span><span class="chip">Cleaning</span></div>${gap(40)}`}
      ${cta('Get your free AI audit', s === 'square' ? '' : 'See if AI recommends<br>your business. <b>Free.</b>')}
    `,
  },
  g1_what_ai_sees: {
    bg: 'bg_lake.jpg', bgpos: 'center 50%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Free audit</span></div>
      ${gap(s === 'square' ? 34 : 56)}
      <h1 style="--hs:${s === 'square' ? 84 : s === 'story' ? 88 : 96}px">Your site looks great.<br><span class="g">To AI, it's almost empty.</span></h1>
      ${s === 'square' ? '' : `${gap(24)}<p class="sub">Most websites are built for people. AI crawlers can't read them, so they never recommend you.</p>`}
      <div class="spacer"></div>
      <div class="glass split" style="--mockh:${s === 'square' ? 330 : 400}px">
        <div>
          <div class="lab"><i></i>What people see</div>
          <div class="site-mock">
            <div class="nav"><span class="lg"></span><span class="ln"></span><span class="ln"></span><span class="ln"></span></div>
            <div class="hero"><div class="ht"><b style="width:calc(var(--k)*170px)"></b><b style="width:calc(var(--k)*120px)"></b><span class="btn"></span></div></div>
            <div class="cards"><i></i><i></i><i></i></div>
          </div>
        </div>
        <div>
          <div class="lab"><i></i>What ChatGPT reads</div>
          <div class="code">
            <div><span class="t">&lt;html&gt;</span></div>
            <div>&nbsp;<span class="t">&lt;body&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="t">&lt;div</span> <span class="a">id</span>="root"<span class="t">&gt;&lt;/div&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="t">&lt;script</span> <span class="a">src</span>="app.js"<span class="t">&gt;</span></div>
            <div>&nbsp;<span class="t">&lt;/body&gt;</span></div>
            <div class="result"><b>0 words</b>of readable content found</div>
          </div>
        </div>
      </div>
      ${gap(s === 'square' ? 30 : 46)}
      ${cta('Get your free AI audit', s === 'square' ? '' : 'See what AI sees<br>on your site. <b>Free.</b>')}
    `,
  },
  g2_same_question: {
    bg: 'bg_prism.jpg', bgpos: 'center 50%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Free audit</span></div>
      ${gap(s === 'square' ? 34 : 56)}
      <h1 style="--hs:${s === 'square' ? 92 : 108}px">Same question.<br><span class="g">Different winner.</span></h1>
      ${s === 'square' ? '' : `${gap(24)}<p class="sub">Appear makes your business readable to AI, so it's the one ChatGPT recommends.</p>`}
      <div class="spacer"></div>
      <div class="glass ba">
        <div class="q"><span class="chat-head" style="all:unset;display:contents"><span class="dot" style="width:calc(var(--k)*34px);height:calc(var(--k)*34px);border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#9fd2ff 60%,#4d8fd6);display:grid;place-items:center;color:#0b1a2a;font-size:calc(var(--k)*18px)">${spark}</span></span>“Who's the best option for a small business like mine?”</div>
        <div class="cols">
          <div class="col">
            <h4>Before Appear</h4>
            <ol><li><span class="n">1</span>Competitor A</li><li><span class="n">2</span>Competitor B</li><li><span class="n">3</span>Competitor C</li></ol>
            <div class="none">${x} You're not listed</div>
          </div>
          <div class="col after">
            <h4>After Appear</h4>
            <ol><li class="you"><span class="n">1</span>Your business<span class="tick">${check}</span></li><li><span class="n">2</span>Competitor A</li><li><span class="n">3</span>Competitor B</li></ol>
            <div class="none" style="color:#cfe8ff">${check} Recommended first</div>
          </div>
        </div>
      </div>
      ${gap(s === 'square' ? 30 : 46)}
      ${cta('Get your free AI audit', s === 'square' ? '' : 'Find out where you<br>stand today. <b>Free.</b>')}
    `,
  },
  g3_results: {
    bg: 'bg_mountains.jpg', bgpos: 'center 40%',
    html: (s) => `
      <div class="top">${brand}<span class="pill-tag">Real results</span></div>
      ${gap(s === 'square' ? 34 : 56)}
      <h1 style="--hs:${s === 'square' ? 80 : 92}px">More AI traffic.<br><span class="g">Zero code changes.</span></h1>
      <div class="spacer"></div>
      <div class="big" style="--bs:${s === 'square' ? 250 : 330}px"><span class="g" style="background:linear-gradient(180deg,#ffffff 10%,#bfe0ff 60%,#8cc8ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent">6x</span></div>
      <div class="biglab">more AI referrals</div>
      <div class="bigsrc">Luxury watch ecommerce · Q1 2026</div>
      ${gap(s === 'square' ? 30 : 44)}
      <div class="tiles">
        <div class="glass tile"><b>4x</b><span>AI referrals</span><em>Consumer app</em></div>
        <div class="glass tile"><b>82%</b><span>Citation accuracy</span><em>Personal brand</em></div>
      </div>
      ${gap(s === 'square' ? 30 : 46)}
      ${cta('Get your free AI audit', s === 'square' ? '' : 'See what Appear<br>can do for you.')}
    `,
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [id, c] of Object.entries(CONCEPTS)) {
    if (ONLY && !id.startsWith(ONLY)) continue;
    for (const [sk, sz] of Object.entries(SIZES)) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
      <body style="--w:${sz.w}px;--h:${sz.h}px;--k:${sz.k};--pad:${sz.pad}">
      <div class="canvas"><div class="bg" style="background-image:url(assets/${c.bg});--bgpos:${c.bgpos}"></div><div class="shade"></div><div class="grain"></div>
      <div class="frame">${c.html(sk)}</div></div></body></html>`;
      const file = path.join(ROOT, `_${id}_${sk}.html`);
      fs.writeFileSync(file, html);
      const page = await browser.newPage({ viewport: { width: sz.w, height: sz.h } });
      await page.goto('file://' + file);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      // flag overflow so layout problems are caught
      const over = await page.evaluate(() => { const f = document.querySelector('.frame'); return f.scrollHeight - f.clientHeight; });
      if (over > 0) console.log(`OVERFLOW ${id} ${sk}: ${over}px`);
      await page.screenshot({ path: path.join(OUT, `appear_${id}_${sz.tag}.png`) });
      await page.close();
    }
    console.log('done', id);
  }
  await browser.close();
})();
