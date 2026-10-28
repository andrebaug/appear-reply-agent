const { chromium } = require('playwright');
const path=require('path');
const SRC='file://'+path.resolve(__dirname,'ad.html');
const concepts=(process.argv[2]||'a,b,c,d,e,f').split(',');
const scale=+(process.argv[3]||2);
(async()=>{
  const b=await chromium.launch();
  for(const f of ['sq','st']){
    const H=f==='sq'?1080:1920;
    const pg=await b.newPage({viewport:{width:1080,height:H},deviceScaleFactor:scale});
    for(const c of concepts){
      await pg.goto(`${SRC}?c=${c}&f=${f}`); await pg.evaluate(()=>document.fonts.ready);
      await pg.evaluate(()=>render(window.STATIC_T));
      const issues=await pg.evaluate(([f,H])=>{
        const out=[];const safeT=f==='st'?240:40, safeB=f==='st'?H-320:H-20;
        for(const el of document.querySelectorAll('.stage *')){
          const cs=getComputedStyle(el); if(cs.display==='none'||+cs.opacity===0) continue;
          const r=el.getBoundingClientRect(); if(!r.width||el.matches('.big1,.fine,.ln,.ln>span')) continue;
          if(r.left<30||r.right>1050) out.push('X '+el.className+' '+Math.round(r.left)+'-'+Math.round(r.right));
          if(el.matches('h1,.sub,.foot,.btn,.top,.bub') && (r.top<safeT||r.bottom>safeB)) out.push('Y '+el.className+' '+Math.round(r.top)+'-'+Math.round(r.bottom));
          if(el.scrollWidth>el.clientWidth+2 && cs.overflow!=='hidden' && el.children.length===0) out.push('OVF '+el.className+' '+el.textContent.slice(0,30));
        }
        const body=document.querySelector('.mid'); if(body.scrollHeight>body.clientHeight+2) out.push('BODY overflow '+body.scrollHeight+'>'+body.clientHeight);
        return out;},[f,H]);
      console.log(c,f,issues.length?issues.join(' | '):'OK');
      await pg.screenshot({path:`out/${c}_${f}_${scale}x.png`});
    }
  }
  await b.close();
})();
