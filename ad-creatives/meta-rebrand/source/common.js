// Shared brand pieces for the 2026 rebrand creatives (green, friendly).
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const fontCss = fs.readFileSync(path.join(ASSETS, 'fonts-v2.css'), 'utf8').replace(/assets\//g, ASSETS + '/');

// Approximation of the new stacked mark; swap for the real SVG when available.
const mark = () => `<img class="mark" src="${ASSETS}/logo.png" alt="">`;

const icons = {
  check: `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" width="0.95em" height="0.95em"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  up: `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" fill="currentColor"/></svg>`,
  // generic engine glyphs (not official logos)
  gpt: `<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 6.5v11M6.5 12h11M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  burst: `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 006.5 6.5l1.4-2 4 1.4v2.6a2 2 0 01-2.2 2A16.5 16.5 0 014.6 5.7a2 2 0 012-2.2z" fill="currentColor"/></svg>`,
};

const CSS = `
${fontCss}
:root{--green:#2f9e2f;--deep:#0e3b12;--ink:#0a0a0a;--paper:#ffffff;--line:#e7e7e3;--muted:#6b6b66;--hl:#d9f99d}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--w);height:var(--h);overflow:hidden;background:transparent}
body{font-family:'Inter Tight',sans-serif;-webkit-font-smoothing:antialiased;color:#fff}
.mono{font-family:'Geist Mono',monospace}
.mark{width:calc(var(--k)*58px);height:calc(var(--k)*58px);object-fit:contain;display:block;margin:calc(var(--k)*-6px) 0}
.navpill{display:flex;align-items:center;justify-content:space-between;background:#fff;border-radius:999px;padding:calc(var(--k)*14px) calc(var(--k)*14px) calc(var(--k)*14px) calc(var(--k)*30px);box-shadow:0 10px 40px rgba(0,40,0,.18)}
.logo{display:flex;align-items:center;gap:calc(var(--k)*10px);color:var(--ink);font-size:calc(var(--k)*38px);font-weight:400;letter-spacing:-.03em}
.btn{display:inline-flex;align-items:center;gap:calc(var(--k)*14px);background:var(--ink);color:#fff;font-family:'Geist Mono',monospace;font-weight:500;font-size:calc(var(--k)*26px);padding:calc(var(--k)*22px) calc(var(--k)*34px);border-radius:999px;letter-spacing:-.01em;white-space:nowrap}
.btn.big{font-size:calc(var(--k)*31px);padding:calc(var(--k)*30px) calc(var(--k)*46px)}
.btn.white{background:#fff;color:var(--ink)}
.h{font-weight:400;letter-spacing:-.042em;text-shadow:0 2px 40px rgba(0,40,0,.25);line-height:1.02;font-size:calc(var(--k)*var(--hs,96px))}
.h em{font-style:normal;font-weight:500}
.lead{text-shadow:0 1px 20px rgba(0,40,0,.45);font-size:calc(var(--k)*33px);line-height:1.35;letter-spacing:-.015em;font-weight:400}
.tag{font-family:'Geist Mono',monospace;font-size:calc(var(--k)*23px);letter-spacing:-.01em}
.chip{display:inline-flex;align-items:center;gap:.5em;padding:calc(var(--k)*12px) calc(var(--k)*24px);border-radius:999px;border:1.5px solid rgba(255,255,255,.55);background:rgba(255,255,255,.14);backdrop-filter:blur(8px);font-family:'Geist Mono',monospace;font-size:calc(var(--k)*23px)}
.card{background:#fff;color:var(--ink);border-radius:calc(var(--k)*30px);box-shadow:0 30px 80px rgba(0,50,0,.28),0 2px 0 rgba(255,255,255,.6) inset}
.card .hd{display:flex;align-items:center;gap:calc(var(--k)*10px);font-size:calc(var(--k)*26px);font-weight:500;letter-spacing:-.01em}
.card .hd .chev{color:#9a9a94;font-size:.8em}
.q{display:flex;align-items:center;gap:12px;border:1.5px solid var(--line);background:#f6f6f3;border-radius:999px;padding:calc(var(--k)*16px) calc(var(--k)*16px) calc(var(--k)*16px) calc(var(--k)*26px);font-size:calc(var(--k)*27px);letter-spacing:-.01em}
.q .send{margin-left:auto;width:calc(var(--k)*46px);height:calc(var(--k)*46px);border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:calc(var(--k)*24px);flex:none}
.ans{font-size:calc(var(--k)*29px);line-height:1.45;letter-spacing:-.012em;color:#262624}
.you{background:linear-gradient(transparent 8%,var(--hl) 8%,var(--hl) 92%,transparent 92%);padding:0 .18em;border-radius:6px;font-weight:600;color:var(--ink)}
.src{display:inline-flex;align-items:center;gap:10px;font-size:calc(var(--k)*22px);color:var(--muted)}
.src i{width:calc(var(--k)*30px);height:calc(var(--k)*30px);border-radius:50%;background:var(--ink);display:grid;place-items:center}
.src i svg{width:62%}
.notif{display:flex;gap:calc(var(--k)*20px);align-items:center;background:rgba(255,255,255,.94);color:var(--ink);border-radius:calc(var(--k)*30px);padding:calc(var(--k)*24px) calc(var(--k)*26px);box-shadow:0 20px 60px rgba(0,50,0,.25);backdrop-filter:blur(20px)}
.notif .app{width:calc(var(--k)*76px);height:calc(var(--k)*76px);border-radius:calc(var(--k)*20px);background:#fff;border:1.5px solid var(--line);display:grid;place-items:center;flex:none}
.notif .app .mark{width:78%;height:78%;margin:0}
.notif .app.green{background:#34c759;color:#fff;font-size:calc(var(--k)*38px)}
.notif .t{font-weight:600;font-size:calc(var(--k)*27px);letter-spacing:-.015em}
.notif .b{font-size:calc(var(--k)*25px);color:#3d3d3a;margin-top:2px;letter-spacing:-.01em;line-height:1.3}
.notif .tm{margin-left:auto;align-self:flex-start;font-size:calc(var(--k)*21px);color:#8a8a85}
.shade-top{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,40,8,.45) 0%,rgba(6,40,8,.12) 50%,rgba(6,40,8,0) 60%,rgba(6,40,8,.35) 100%)}
.grid-bg{position:absolute;inset:0;background-color:#fff;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:calc(var(--w)/4) calc(var(--w)/4);background-position:-1px -1px}
`;

module.exports = { CSS, mark, icons };
