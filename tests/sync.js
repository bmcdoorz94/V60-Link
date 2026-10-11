/* Sync across devices against a mocked GitHub contents API: connect, push, pull on a second device, conflict choice. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
const path=require('path');const ROOT=path.resolve(__dirname,'..');
function ok(c,m){ if(!c){ console.log('FAIL',m); process.exitCode=1; } else console.log(' ok',m); }
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const store={}; let n=0;
async function device(){ const ctx=await b.newContext({viewport:{width:390,height:844}}); await ctx.addInitScript(()=>{window.__V60_TEST=true;});
  await ctx.route('https://api.github.com/**', async route=>{ const req=route.request(); const u=new URL(req.url()); const p=decodeURIComponent(u.pathname.split('/contents/')[1]);
    if(req.headers()['authorization']!=='Bearer good') return route.fulfill({status:401,body:'{}'});
    if(req.method()==='GET'){ const f=store[p]; if(!f) return route.fulfill({status:404,body:'{}'}); return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({sha:f.sha,encoding:'base64',content:f.content})}); }
    if(req.method()==='PUT'){ const body=JSON.parse(req.postData()); const f=store[p]; if(f && body.sha!==f.sha) return route.fulfill({status:409,body:'{}'}); const sha='s'+(++n); store[p]={sha,content:body.content}; return route.fulfill({status:f?200:201,contentType:'application/json',body:JSON.stringify({content:{sha}})}); }
    route.fulfill({status:405,body:'{}'}); });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('file://'+ROOT+'/index.html'); await p.waitForTimeout(400); p.errs=errs; return p; }
async function connect(p,tok){ await p.evaluate(()=>{__v60.go('story');}); await p.evaluate(()=>{ window.V60.jump('opts:sync'); }); await p.fill('#syncRepo','bmcdoorz94/v60-garage-data'); await p.fill('#syncTok',tok); await p.click('#syncGo'); await p.waitForTimeout(800); }
const A=await device(), B=await device();
await connect(A,'bad'); ok(/rejected/.test(await A.textContent('#syncStatus')),'bad token explained');
await A.evaluate(()=>{V60.state.odo=95210; V60.save();});
await connect(A,'good'); ok(!!store['garage.json'],'device A pushed its progress');
await connect(B,'good'); ok(await B.evaluate(()=>V60.state.odo)===95210,'device B pulled A\'s progress');
await B.evaluate(()=>{V60.state.oil.push({id:'o1',date:'2026-10-11',miles:95300,qts:0}); V60.save();}); await B.waitForTimeout(3600);
await A.evaluate(()=>window.V60_SYNC.pull()); await A.waitForTimeout(600);
ok(await A.evaluate(()=>V60.state.oil.length)===1,'change on B reaches A');
// conflict: both change
await A.evaluate(()=>{V60.state.odo=95400; V60.save();}); await A.waitForTimeout(3600);
await B.evaluate(()=>{ const m=JSON.parse(localStorage.getItem('v60-sync')); m.dirty=true; localStorage.setItem('v60-sync',JSON.stringify(m)); V60.state.odo=95350; }); 
await B.evaluate(()=>window.V60_SYNC.pull()); await B.waitForTimeout(600);
ok(await B.isVisible('#syncConflict'),'conflict asks which copy to keep');
await B.click('[data-keep="there"]'); await B.waitForTimeout(400);
ok(await B.evaluate(()=>V60.state.odo)===95400,'keeping the other device applies it');
ok(!A.errs.length && !B.errs.length,'no page errors '+A.errs.concat(B.errs).join('|'));
await b.close();})();
