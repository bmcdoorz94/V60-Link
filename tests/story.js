const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
const path=require('path'),fs=require('fs');const ROOT=path.resolve(__dirname,'..');const SH=path.join(ROOT,'tests','shots')+'/';fs.mkdirSync(SH,{recursive:true});
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
for (const [nm,vp,sch] of [['phone',{width:390,height:844},'light'],['dark',{width:390,height:844},'dark'],['desk',{width:1366,height:900},'light']]){
const ctx=await b.newContext({viewport:vp,colorScheme:sch});await ctx.addInitScript(()=>{window.__V60_TEST=true;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(500);
const t1=await p.textContent('#tdCards'); console.log(nm,'today prologue card', /Watch the prologue/.test(t1));
await p.click('[data-jump="story:pro"]'); await p.waitForTimeout(200);
console.log(' cinema open', await p.evaluate(()=>!document.getElementById('cinema').hidden));
await p.click('.cin-skip'); await p.waitForTimeout(100);
await p.evaluate(()=>__v60.go('story'));
console.log(' next', (await p.textContent('#stNext')).slice(0,90));
await p.screenshot({path:SH+'story-'+nm+'.png',fullPage:true});
// complete Safe to touch via academy data
await p.evaluate(()=>{const A=V60.acad();['m-sys','m-safe','m-hood','m-five'].forEach(id=>A.done[id]={date:'2026-10-10',outcome:'good'});V60.save();__v60.go('story');});
console.log(' safe', await p.evaluate(()=>JSON.stringify(V60.mod('story').closed.safe&&V60.mod('story').closed.safe.how)), 'pending', await p.evaluate(()=>V60.mod('story').pending));
// reason close the belt
await p.click('[data-case="belt"]').catch(()=>{}); 
const open=await p.evaluate(()=>!!document.querySelector('#rs-belt')); if(!open) await p.click('[data-case="belt"]');
await p.evaluate(()=>document.querySelector('.case.open details.reason').open=true);
await p.fill('#rt-belt','quote was $900'); await p.click('[data-reason="belt"]');
console.log(' belt', await p.evaluate(()=>JSON.stringify(V60.mod('story').closed.belt)));
// manual step and today card
await p.evaluate(()=>__v60.go('today')); console.log(' today card', (await p.textContent('.tcard.story')).slice(0,80));
await p.click('.tcard.story button'); await p.waitForTimeout(200); await p.click('.cin-skip');
await p.evaluate(()=>__v60.go('story'));
await p.click('[data-case="light"]'); 
await p.click('[data-man="lightoff"]');
console.log(' light', await p.evaluate(()=>V60.mod('story').closed.light ? V60.mod('story').closed.light.lines[0][1] : 'open'));
// jump to mission from a step
await p.click('[data-case="thirst"]'); await p.click('.case.open [data-jump="mission:m-oil"]');
console.log(' mission view', await p.evaluate(()=>[...document.querySelectorAll('main > .panel')].filter(x=>!x.hidden).map(x=>x.id)), (await p.textContent('#p-academy')).slice(0,60).replace(/\s+/g,' '));
await p.evaluate(()=>__v60.go('story')); await p.screenshot({path:SH+'story2-'+nm+'.png',fullPage:true});
console.log(' ov', await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth),'errs',errs);
await ctx.close();}
await b.close();})();
