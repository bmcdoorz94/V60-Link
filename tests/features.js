const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
const path=require('path'),fs=require('fs');const ROOT=path.resolve(__dirname,'..');const SH=path.join(ROOT,'tests','shots')+'/';fs.mkdirSync(SH,{recursive:true});
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{window.__V60_TEST=true;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>__v60.go('live'));
console.log('note',await p.textContent('#lk-noBt'));
await p.click('#lk-btnDemo');await p.waitForFunction(()=>document.getElementById('lk-connText').textContent.includes('Connected'),null,{timeout:15000});
await p.click('#lk-btnScan');await p.waitForFunction(()=>/Done/.test(document.getElementById('lk-scanStatus').textContent),null,{timeout:20000});
await p.click('#lk-btnReport');
console.log('report',await p.textContent('#lk-reportStatus'));
console.log('codes in garage',await p.evaluate(()=>V60.state.codes.map(c=>c.code+':'+c.status)));
console.log('coach',(await p.textContent('#lk-coach')).slice(0,160));
// record with dash channels
await p.evaluate(()=>{document.querySelectorAll('#lk-picks input').forEach(i=>{const pid=+i.dataset.pid; if([0x33,0x5C].includes(pid)&&!i.checked){i.click();}})});
await p.click('#lk-btnLive');await p.waitForTimeout(4000);
console.log('dials',await p.evaluate(()=>[...document.querySelectorAll('#lk-cluster .dv')].map(e=>e.textContent)));
await p.screenshot({path:SH+'live-rec.png',fullPage:true});
// fake trip length to test finish
await p.evaluate(()=>{__link.trip.s.lastT=120;});
await p.click('#lk-btnLive');await p.waitForTimeout(300);
console.log('trips',await p.evaluate(()=>V60.mod('live').trips.length), (await p.textContent('#lk-trips')).slice(0,120));
await p.click('#lk-btnCsv');await p.waitForTimeout(300);
console.log('visible',await p.evaluate(()=>[...document.querySelectorAll('main > .panel')].filter(x=>!x.hidden).map(x=>x.id)));
// zero60 unit test using onValue
await p.evaluate(()=>__v60.go('live'));
const z=await p.evaluate(async()=>{const L=__link; L.zero.armed=true; const sp=[0,0,5,20,40,60,80,95,100]; for(const s of sp){L.onValue(0x0D,s); await new Promise(r=>setTimeout(r,250));} return [document.getElementById('lk-zt').textContent, V60.mod('live').runs.length, document.getElementById('lk-zs').textContent];});
console.log('zero',z);
// bulletins
await p.evaluate(()=>__v60.go('bulletins'));
await p.fill('#tbBuild','2015-10'); await p.dispatchEvent('#tbBuild','change');
console.log('tsb sum',await p.textContent('#tbSum'));
await p.click('[data-tbopen="TJ29818"]'); await p.click('[data-tbmark="TJ29818:have"]');
console.log('sheet',await p.textContent('#tbSheet'));
await p.evaluate(()=>__v60.go('upgrades'));
await p.screenshot({path:SH+'upg-phone.png',fullPage:true});
console.log('upg first',await p.textContent('.upg li h3'));
await p.evaluate(()=>{document.querySelector('.upg details').open=true}); await p.click('[data-upq="tires:0"]');
console.log('upg verdict',await p.textContent('.upg li .verdict'));
console.log('health actions',await p.evaluate(()=>V60.computeHealth().actions.map(a=>a.text.slice(0,60))));
console.log('errs',errs); if(errs.length){console.log('FAIL page errors');process.exitCode=1;}
await b.close();})();
