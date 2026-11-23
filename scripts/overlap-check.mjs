import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';
const BASE = 'http://127.0.0.1:4173/byulgyeol/';
const b = await chromium.launch({ executablePath: '/workspace/.scratch/pw/browsers/chromium-1140/chrome-linux/chrome', args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'] });
async function check(theme, w, h, mobile, stepName, actions) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, isMobile:mobile, hasTouch:mobile, locale:'ko-KR' });
  const p = await ctx.newPage();
  await p.goto(`${BASE}?theme=${theme}`, { waitUntil:'networkidle' });
  await p.waitForTimeout(600);
  await actions(p);
  await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const skip = new Set();
    document.querySelectorAll('.wizard-bar, .theme-toggle, header, .sticky').forEach(e=>skip.add(e));
    const els=[];
    document.querySelectorAll('p,span,li,dd,dt,h1,h2,h3,button,a,label,figcaption').forEach(el=>{
      if ([...skip].some(s=>s.contains(el))) return;
      const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
      if(!own) return;
      const st=getComputedStyle(el);
      if(st.display==='none'||st.visibility==='hidden'||Number(st.opacity)===0) return;
      const r=el.getBoundingClientRect();
      if(r.width<4||r.height<4) return;
      els.push({el,txt:(el.textContent||'').trim().slice(0,26),r});
    });
    const out=[];
    for(let i=0;i<els.length;i++) for(let j=i+1;j<els.length;j++){
      const a=els[i],c=els[j];
      if(a.el.contains(c.el)||c.el.contains(a.el)) continue;
      const ox=Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left);
      const oy=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
      if(ox>3&&oy>3) out.push(`${a.txt} ↔ ${c.txt} (${Math.round(ox)}×${Math.round(oy)})`);
    }
    return out.slice(0,15);
  });
  console.log(`${theme}/${w}/${stepName}:`, res.length? JSON.stringify(res,null,1):'none');
  await ctx.close();
}
const toResult = async (p) => {
  await p.locator('.wizard-bar__next').click();
  await p.selectOption('#birth-year','1990'); await p.selectOption('select[aria-label="월"]','5'); await p.selectOption('select[aria-label="일"]','17');
  await p.locator('.wizard-bar__next').click();
  await p.waitForTimeout(2200);
};
for (const theme of ['character','mystic']) {
  for (const [w,h,m] of [[390,844,true],[1280,900,false]]) {
    await check(theme,w,h,m,'intro', async()=>{});
    await check(theme,w,h,m,'soul', toResult);
    for (let i=2;i<=5;i++) await check(theme,w,h,m,`step${i}`, async(p)=>{ await toResult(p); for(let k=2;k<=i;k++){ await p.locator('.wizard-bar__next').click(); await p.waitForTimeout(700);} });
  }
}
await b.close();
