const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path=require('path');
const [c,f,scale='2',fps='30']=process.argv.slice(2);
const SRC='file://'+path.resolve(__dirname,'ad.html');
(async()=>{
  const b=await chromium.launch();
  const H=f==='sq'?1080:1920;
  const pg=await b.newPage({viewport:{width:1080,height:H},deviceScaleFactor:+scale});
  await pg.goto(`${SRC}?c=${c}&f=${f}`); await pg.evaluate(()=>document.fonts.ready);
  const dur=await pg.evaluate(()=>window.DUR);
  const out=`out/${c}_${f}_reel_${scale==='2'?'4k':'1080'}.mp4`;
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',fps,'-i','-','-c:v','libx264','-preset','slow','-crf','15','-pix_fmt','yuv420p','-profile:v','high','-movflags','+faststart','-r',fps,out],{stdio:['pipe','inherit','inherit']});
  const N=Math.round(dur*+fps); const t0=Date.now();
  for(let i=0;i<N;i++){
    await pg.evaluate(t=>render(t),i/+fps);
    const buf=await pg.screenshot({type:'png'});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  console.log(out,N,'frames',((Date.now()-t0)/1000).toFixed(0)+'s');
  await b.close();
})();
