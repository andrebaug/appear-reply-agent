// Animated Reels: node reels.js <outdir> [reel]
// Renders a transparent overlay frame by frame, then composites it over a looping grass video.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { CSS, mark, icons } = require('./common');

const OUT = process.argv[2] || path.join(__dirname, 'out');
const ONLY = process.argv[3];
const A = path.join(__dirname, '..', 'assets');
const FPS = 30, W = 1080, H = 1920;
fs.mkdirSync(OUT, { recursive: true });

const RCSS = `
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,30,6,.55) 0%,rgba(4,30,6,.18) 45%,rgba(4,30,6,.18) 60%,rgba(4,30,6,.5) 100%)}
.abs{position:absolute;left:70px;right:70px}
.center{text-align:center}
.word{display:inline-block;will-change:transform}
.typing{display:inline-flex;gap:8px;padding:6px 0}
.typing i{width:14px;height:14px;border-radius:50%;background:#b9b9b2;display:block}
.row{display:flex;align-items:center;gap:18px;padding:20px 22px;border-radius:20px;background:#f5f5f1;font-size:30px;letter-spacing:-.012em}
.row .n{font-family:'Geist Mono',monospace;color:#9a9a94;font-size:24px;width:30px}
.row.you{background:#e9fcc4;box-shadow:inset 0 0 0 2px #b5e86a;font-weight:600}
.row .ok{margin-left:auto;color:#2f9e2f;font-size:30px;display:grid}
.cursor{display:inline-block;width:3px;height:1.05em;background:#0a0a0a;vertical-align:-.15em;margin-left:2px}
`;

// Shared runtime helpers injected into every reel page.
const RUNTIME = `
const cl=x=>Math.max(0,Math.min(1,x));
const span=(t,a,b)=>cl((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const back=x=>{const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const $=s=>document.querySelector(s);
// show element between [a,b] with fade/slide in and out
function vis(el,t,a,b,{dy=40,fin=.5,fout=.4,blur=8,scale=0}={}){
  if(typeof el==='string')el=$(el);
  const i=eo(span(t,a,a+fin)), o=1-eo(span(t,b-fout,b));
  const v=Math.min(i,o);
  el.style.opacity=v;
  el.style.transform='translateY('+((1-i)*dy-(1-o)*dy*.5)+'px) scale('+(1-(1-v)*scale)+')';
  el.style.filter=blur?'blur('+((1-v)*blur)+'px)':'';
  el.style.visibility=v<=0.001?'hidden':'visible';
  return v;
}
// staggered word reveal for headlines (words wrapped in .word)
function words(sel,t,a,b,stagger=.07){
  document.querySelectorAll(sel+' .word').forEach((w,i)=>{
    const s=a+i*stagger, iv=eo(span(t,s,s+.55)), ov=1-eo(span(t,b-.35,b));
    const v=Math.min(iv,ov);
    w.style.opacity=v;w.style.transform='translateY('+((1-iv)*50)+'px)';w.style.filter='blur('+((1-v)*10)+'px)';
  });
}
function type(sel,text,t,a,b,cursor=true){
  const n=Math.round(text.length*span(t,a,b));
  $(sel).innerHTML=text.slice(0,n)+(cursor&&t<b+.4&&Math.floor(t*2.4)%2===0?'<span class="cursor"></span>':'');
}
`;
const W_ = (txt) => txt.split(' ').map((w) => `<span class="word">${w}</span>`).join(' ');

const REELS = {
  reel1_says_your_name: {
    video: 'vid_topdown.mp4', dur: 15,
    html: `
    <div class="abs center h" id="h1" style="--hs:112px;top:620px">${W_('Your customers')}<br>${W_('have a new habit.')}</div>
    <div class="abs h" id="h2" style="--hs:92px;top:250px">${W_('They ask AI')}<br>${W_('who to pick.')}</div>
    <div class="abs h" id="h3" style="--hs:92px;top:250px">${W_('Is your name')}<br>${W_('on that list?')}</div>
    <div class="abs h" id="h4" style="--hs:92px;top:250px">${W_('Appear makes')}<br>${W_('sure it is.')}</div>
    <div class="abs card" id="chat" style="top:620px;padding:34px">
      <div class="hd" style="font-size:28px">${icons.gpt} ChatGPT <span class="chev">⌄</span></div>
      <div style="height:22px"></div>
      <div class="q" style="font-size:31px;min-height:84px"><span id="qt"></span><span class="send" id="send" style="width:52px;height:52px">${icons.up}</span></div>
      <div id="ansWrap" style="margin-top:26px;min-height:360px;position:relative">
        <div class="typing" id="dots"><i></i><i></i><i></i></div>
        <div id="ans" style="position:absolute;inset:0">
          <div class="ans" id="intro" style="font-size:31px">Here are a few popular options near you:</div>
          <div id="list" style="position:relative;margin-top:20px;height:330px"></div>
        </div>
      </div>
    </div>
    <div class="abs center" id="end" style="top:560px">
      <div style="display:inline-flex" id="endlogo"><div class="navpill" style="padding:22px 46px;--k:1.35"><div class="logo" style="font-size:58px">${mark()}Appear</div></div></div>
      <div style="height:70px"></div>
      <div class="h" id="endh" style="--hs:112px">${W_('Get recommended')}<br>${W_('by AI.')} <em>${W_('Then relax.')}</em></div>
      <div style="height:70px"></div>
      <span class="btn big" id="endbtn" style="font-size:34px">Get your free AI audit ${icons.arrow}</span>
      <div style="height:30px"></div>
      <div class="tag" id="endnote" style="font-size:30px;text-shadow:0 1px 16px rgba(0,30,0,.6)">100% free · see where you stand</div>
    </div>`,
    script: `
    const CHECK=${JSON.stringify(icons.check)};
    const rows=[['Your Business',1],['Peak Roofing Co.',0],['Summit Roof Pros',0],['BlueSky Roofing',0]];
    $('#list').innerHTML=rows.map(([n,y],i)=>'<div class="row'+(y?' you':'')+'" data-y="'+y+'" style="position:absolute;left:0;right:0"><span class="n"></span><span class="nm">'+n+'</span>'+(y?'<span class="ok">'+CHECK+'</span>':'')+'</div>').join('');
    window.render=t=>{
      words('#h1',t,.3,3.1); vis('#h1',t,0,3.1,{dy:0,blur:0,fin:.01});
      words('#h2',t,3.2,8.5); vis('#h2',t,3.1,8.5,{dy:0,blur:0,fin:.01});
      words('#h3',t,8.6,10.2); vis('#h3',t,8.5,10.2,{dy:0,blur:0,fin:.01});
      words('#h4',t,10.3,12.2); vis('#h4',t,10.2,12.2,{dy:0,blur:0,fin:.01});
      vis('#chat',t,3.5,12.2,{dy:120,fin:.7,blur:0});
      type('#qt',"Who's the best roofer near me?",t,4.1,5.7);
      $('#send').style.transform='scale('+(1+.18*Math.sin(Math.PI*span(t,5.75,6.05)))+')';
      const dots=t>6.0&&t<6.7; $('#dots').style.display=dots?'inline-flex':'none';
      document.querySelectorAll('#dots i').forEach((d,i)=>d.style.opacity=.35+.65*Math.abs(Math.sin(t*6-i*.7)));
      vis('#ans',t,6.7,99,{dy:16,blur:0,fin:.4});
      // before Appear: three competitors. after (t>10.4): Your Business slides in at #1
      const sw=eio(span(t,10.4,11.2));
      document.querySelectorAll('#list .row').forEach((r,i)=>{
        const you=r.dataset.y==='1';
        const appear=eo(span(t,6.9+i*.22,7.4+i*.22));
        let slot, op;
        if(you){ slot=0; op=sw; r.style.transform='translateX('+((1-sw)*-80)+'px) scale('+(.96+.04*back(sw))+')'; }
        else { slot=(i-1)+sw; op=appear*(1-.45*sw); r.style.transform='translateY(0)'; }
        r.style.top=(slot*84)+'px'; r.style.opacity=you?op:op*(slot>2.9?1-span(slot,2.9,3):1);
        r.querySelector('.n').textContent='0'+(Math.round(slot)+1);
      });
      $('#intro').innerHTML=t<10.4?'Here are a few popular options near you:':'My top pick near you:';
      vis('#end',t,12.4,99,{dy:0,blur:0,fin:.01});
      vis('#endlogo',t,12.4,99,{dy:30,fin:.5,blur:6});
      words('#endh',t,12.6,99,.06);
      vis('#endbtn',t,13.4,99,{dy:30,fin:.5,blur:0,scale:.1});
      vis('#endnote',t,13.7,99,{dy:20,fin:.5,blur:0});
    };`,
  },
  reel2_phone_quiet: {
    video: 'vid_closeup.mp4', dur: 15, shade: 'linear-gradient(180deg,rgba(4,30,6,.62) 0%,rgba(4,30,6,.35) 50%,rgba(4,30,6,.6) 100%)',
    html: `
    <div class="abs" id="p1" style="top:600px">
      <div class="tag" id="p1tag" style="font-size:28px">[ for home service pros ]</div>
      <div style="height:26px"></div>
      <div class="h" id="p1h" style="--hs:138px">${W_('Phone a little')}<br>${W_('quiet lately?')}</div>
    </div>
    <div class="abs h" id="h2" style="--hs:84px;top:250px">${W_('Homeowners now ask')}<br>${W_('ChatGPT who to call.')}</div>
    <div class="abs h" id="h3" style="--hs:84px;top:250px">${W_("If it doesn't know you,")}<br>${W_("they call someone else.")}</div>
    <div class="abs h" id="h4" style="--hs:84px;top:250px">${W_("Appear makes sure")}<br>${W_("it's you they call.")}</div>
    <div class="abs card" id="chat" style="top:640px;padding:34px">
      <div class="hd" style="font-size:28px">${icons.gpt} ChatGPT <span class="chev">⌄</span></div>
      <div style="height:22px"></div>
      <div class="q" style="font-size:31px;min-height:84px"><span id="qt"></span><span class="send" id="send" style="width:52px;height:52px">${icons.up}</span></div>
      <div style="height:26px"></div>
      <div class="ans" id="ans" style="font-size:31px">Try <b>Rapid Flow Plumbing</b> or <b>Northside Pipe Co.</b> Both have great reviews and same day service.</div>
      <div id="miss" style="margin-top:22px;display:inline-flex;align-items:center;gap:12px;padding:12px 20px;border-radius:999px;background:#fff1f0;color:#c2410c;font-size:26px;font-weight:500">Your business wasn't mentioned</div>
    </div>
    <div class="abs" id="notifs" style="top:640px;display:flex;flex-direction:column;gap:18px">
      <div class="notif" style="--k:1.12"><div class="app green">${icons.phone}</div><div><div class="t">New job request</div><div class="b">Leaking kitchen faucet · Found you on ChatGPT</div></div><span class="tm">now</span></div>
      <div class="notif" style="--k:1.12"><div class="app">${mark('#fff')}</div><div><div class="t">Recommended by AI</div><div class="b">Perplexity named you the top plumber nearby</div></div><span class="tm">2m</span></div>
      <div class="notif" style="--k:1.12"><div class="app green">${icons.phone}</div><div><div class="t">New job request</div><div class="b">Water heater install · Found you on Gemini</div></div><span class="tm">9m</span></div>
      <div class="notif" style="--k:1.12"><div class="app green">${icons.phone}</div><div><div class="t">Incoming call</div><div class="b">Asked Claude for the best plumber in town</div></div><span class="tm">15m</span></div>
    </div>
    <div class="abs center" id="end" style="top:600px">
      <div style="display:inline-flex" id="endlogo"><div class="navpill" style="padding:22px 46px;--k:1.35"><div class="logo" style="font-size:58px">${mark()}Appear</div></div></div>
      <div style="height:70px"></div>
      <div class="h" id="endh" style="--hs:118px">${W_('More calls.')}<br><em>${W_('Less chasing.')}</em></div>
      <div style="height:70px"></div>
      <span class="btn big" id="endbtn" style="font-size:34px">See if AI recommends you ${icons.arrow}</span>
      <div style="height:30px"></div>
      <div class="tag" id="endnote" style="font-size:30px;text-shadow:0 1px 16px rgba(0,30,0,.6)">Free AI audit for home service pros</div>
    </div>`,
    script: `
    window.render=t=>{
      vis('#p1',t,0,3.2,{dy:0,blur:0,fin:.01}); vis('#p1tag',t,.2,3.2,{dy:20,blur:0});
      words('#p1h',t,.35,3.2,.09);
      words('#h2',t,3.3,6.6); vis('#h2',t,3.2,6.6,{dy:0,blur:0,fin:.01});
      words('#h3',t,6.7,9.0); vis('#h3',t,6.6,9.0,{dy:0,blur:0,fin:.01});
      words('#h4',t,9.1,12.2); vis('#h4',t,9.0,12.2,{dy:0,blur:0,fin:.01});
      vis('#chat',t,3.6,9.1,{dy:120,fin:.7,blur:0});
      type('#qt',"Need a plumber today. Who's good near me?",t,4.2,6.2);
      $('#send').style.transform='scale('+(1+.18*Math.sin(Math.PI*span(t,6.25,6.55)))+')';
      vis('#ans',t,6.8,99,{dy:16,blur:0});
      vis('#miss',t,7.6,99,{dy:10,blur:0,scale:.15});
      document.querySelectorAll('#notifs .notif').forEach((n,i)=>{
        const a=9.3+i*.55, v=back(span(t,a,a+.5)), o=1-eo(span(t,12,12.35));
        n.style.opacity=Math.min(cl(span(t,a,a+.25)),o);
        n.style.transform='translateY('+((1-v)*-60)+'px) scale('+(.92+.08*v)+')';
      });
      vis('#end',t,12.4,99,{dy:0,blur:0,fin:.01});
      vis('#endlogo',t,12.4,99,{dy:30,fin:.5,blur:6});
      words('#endh',t,12.6,99,.08);
      vis('#endbtn',t,13.3,99,{dy:30,fin:.5,blur:0,scale:.1});
      vis('#endnote',t,13.6,99,{dy:20,fin:.5,blur:0});
    };`,
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [id, r] of Object.entries(REELS)) {
    if (ONLY && !id.startsWith(ONLY)) continue;
    const dir = path.join(__dirname, '_frames_' + id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${RCSS}</style></head>
    <body style="--w:${W}px;--h:${H}px;--k:1"><div class="stage"><div class="shade" style="${r.shade ? 'background:' + r.shade : ''}"></div>${r.html}</div>
    <script>${RUNTIME}${r.script}</script></body></html>`;
    const file = path.join(__dirname, `_${id}.html`);
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    const n = r.dur * FPS;
    for (let f = 0; f < n; f++) {
      await page.evaluate((t) => window.render(t), f / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
    }
    await page.close();
    // background: the 8s clip played forward then backward, looped, slightly slowed for calm
    const out = path.join(OUT, `appear_${id}_9x16.mp4`);
    execFileSync('ffmpeg', ['-v', 'error', '-y',
      '-i', path.join(A, r.video), '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
      '-filter_complex',
      `[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[bb];[bb]setpts=1.15*PTS,fps=${FPS},scale=${W}:${H},trim=duration=${r.dur},eq=saturation=1.08[bg];[bg][1:v]overlay=0:0:format=auto,format=yuv420p[v]`,
      '-map', '[v]', '-t', String(r.dur), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', out]);
    // poster frames for review
    for (const s of [1.5, 5.2, 8, 11.2, 14.5]) {
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(s), '-i', out, '-frames:v', '1', '-vf', 'scale=360:-1', path.join(__dirname, `_poster_${id}_${s}.jpg`)]);
    }
    fs.unlinkSync(file);
    console.log('done', id, out);
  }
  await browser.close();
})();
