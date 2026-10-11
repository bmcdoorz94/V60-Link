/* Story-driven progression: hidden tabs, case closures, reveals, decoding, known risks, The File, Show everything. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
const path=require('path'),fs=require('fs');const ROOT=path.resolve(__dirname,'..');const SH=path.join(ROOT,'tests','shots')+'/';fs.mkdirSync(SH,{recursive:true});
function ok(c,m){ if(!c){ console.log('FAIL',m); process.exitCode=1; } else console.log(' ok',m); }
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
for (const [nm,vp,sch] of [['phone',{width:390,height:844},'light'],['dark',{width:390,height:844},'dark'],['desk',{width:1366,height:900},'light']]){
console.log(nm);
const ctx=await b.newContext({viewport:vp,colorScheme:sch});await ctx.addInitScript(()=>{window.__V60_TEST=true;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(500);
const rail=()=>p.evaluate(()=>[...document.querySelectorAll('#rail button span')].map(x=>x.textContent));
ok(JSON.stringify(await rail())==='["Today","Learn","Car"]','start shows Today, Learn, Car only: '+await rail());
ok(/Watch the prologue/.test(await p.textContent('#tdCards')),'prologue card on Today');
ok(await p.isVisible('#tdSos'),'Something\'s wrong button on Today');
ok(!(await p.isVisible('.cockpit .gauge')),'health gauge hidden at start');
await p.screenshot({path:SH+'s-today-'+nm+'.png',fullPage:true});
await p.click('[data-jump="story:pro"]'); await p.waitForTimeout(150); await p.click('.cin-skip');
await p.evaluate(()=>__v60.go('story'));
ok(await p.evaluate(()=>document.getElementById('subnav').hidden),'Learn shows only the Story (Training opens from cases)');
await p.click('#stV-cases .nextc [data-from]'); ok(/Back to the case: Safe to Touch/.test(await p.textContent('#p-academy')),'lesson opened from a case links back to it');
await p.click('#p-academy [data-jump="case:safe"]'); ok(await p.evaluate(()=>!document.getElementById('p-story').hidden),'back to the case returns to Story');
await p.screenshot({path:SH+'s-start-'+nm+'.png',fullPage:true});
// close Safe to Touch
await p.evaluate(()=>{const A=V60.acad();['m-sys','m-safe','m-hood','m-five'].forEach(id=>A.done[id]={date:'2026-10-10',outcome:'good'});V60.save();__v60.go('story');});
const st=await p.evaluate(()=>V60.mod('story'));
ok(st.closed.safe && st.closed.safe.how==='evidence','safe closed');
ok(!!st.revealed.live,'Live link revealed by The Signal');
ok(st.pending.length>=1,'beat queued: '+st.pending.join(','));
// sim scan + decode 5
await p.evaluate(()=>__v60.go('live'));
await p.click('#lk-btnDemo'); await p.waitForFunction(()=>/Connected/.test(document.getElementById('lk-connText').textContent),null,{timeout:15000});
ok(await p.locator('#p-live .decode').count()>3,'raw labels with Decode chips');
for(let i=0;i<5;i++){ await p.locator('#p-live #lk-picks .decode').first().click(); await p.waitForTimeout(700); await p.click('#decodeSheet .dsclose'); await p.waitForTimeout(100);} 
ok(await p.evaluate(()=>window.V60_CB.count())===5,'5 decoded');
await p.click('#lk-btnScan'); await p.waitForFunction(()=>/Done/.test(document.getElementById('lk-scanStatus').textContent),null,{timeout:20000});
await p.click('#lk-btnReport');
ok(!(await p.evaluate(()=>V60.mod('story').closed.signal)),'simulated scan does not close The Signal');
await p.locator('#p-live #lk-codes .decode').first().click(); await p.waitForTimeout(900);
ok(/lean/i.test(await p.textContent('#dsName')),'code decode shows meaning: '+await p.textContent('#dsName'));
await p.screenshot({path:SH+'s-decode-'+nm+'.png'});
await p.click('#decodeSheet .dsclose');
ok(!(await p.locator('#p-live #lk-codes .decode').count()),'codes readable after learning anatomy');
await p.screenshot({path:SH+'s-live-'+nm+'.png',fullPage:true});
// a real report closes it
await p.evaluate(()=>{V60.importLinkReport({date:'2026-10-01',mil:false,codes:[],monitors:[{n:'Misfire',ready:true}]});__v60.go('story');});
const st2=await p.evaluate(()=>V60.mod('story'));
ok(st2.closed.signal,'real report closes The Signal');
ok(st2.revealed.health && st2.revealed.bay && st2.revealed.cards,'Act 1 reward: health, bay, cards');
ok(st2.revealed.records && st2.revealed.glove,'The Belt reveals records and glove');
ok(!st2.revealed.fuel,'The Thirst not yet available');
ok(await p.isVisible('.cockpit .gauge'),'health gauge shows after Act 1');
ok(await p.evaluate(()=>window.V60_KNOW.article('a-belt') && !window.V60_KNOW.article('a-polestar')),'knowledge unlocks follow the story');
// known risk on belt
await p.evaluate(()=>{window.__x=1}); await p.click('[data-case="belt"]').catch(()=>{});
if(!(await p.$('#rs-belt'))) await p.click('[data-case="belt"]');
await p.evaluate(()=>document.querySelector('.case.open details.reason').open=true);
await p.click('[data-reason="belt"]');
ok(await p.evaluate(()=>!!V60.mod('story').revealed.fuel),'next case (The Thirst) opens after belt logged as known risk');
// briefing + depth + quiz
await p.click('[data-case="thirst"]');
ok(await p.isVisible('.case.open details.brief'),'briefing visible');
await p.evaluate(()=>{document.getElementById('stOpts').open=true});
ok(await p.isDisabled('[data-depth="mech"]'),'Mechanic detail locked until the Scholar skill');
await p.evaluate(()=>{const c=V60.mod('cards')||{b:{},rev:{},newDay:{}}; window.V60_FACTS.slice(0,25).forEach(f=>c.b[f.id]=[4,'2099-01-01']); V60.setMod('cards',c); V60.save(); __v60.go('story'); document.getElementById('stOpts').open=true;});
await p.click('[data-depth="mech"]'); ok(await p.locator('.case.open .mech').count()>0,'Scholar perk unlocks mechanic detail');
await p.click('[data-depth="det"]');
await p.click('[data-view="timeline"]'); ok(/Locked|Case closed/.test(await p.textContent('#stV-timeline')),'timeline view renders (locked or filled)');
await p.click('[data-view="cases"]');
ok(await p.evaluate(()=>!!V60.mod('story').revealed.skills),'skill tree revealed after Act 1');
await p.evaluate(()=>__v60.go('skills')); ok(/skills earned/.test(await p.textContent('#skSum')),'skill tree renders: '+await p.textContent('#skSum'));
await p.screenshot({path:SH+'s-skills-'+nm+'.png',fullPage:true});
await p.evaluate(()=>__v60.go('story'));
await p.click('[data-case="safe"]'); await p.locator('.case.open [data-qz]').first().click();
ok(Object.keys((await p.evaluate(()=>V60.mod('story').quiz)).safe||{}).length===1,'debrief quiz answer saved');
await p.screenshot({path:SH+'s-mid-'+nm+'.png',fullPage:true});
await p.click('[data-view="file"]'); ok(/Findings/.test(await p.textContent('#stV-file')),'The File renders'); await p.screenshot({path:SH+'s-file-'+nm+'.png',fullPage:true});
await p.click('[data-view="codebook"]'); ok((await p.locator('.cbl li.dec').count())>=9,'Codebook lists decoded entries'); await p.screenshot({path:SH+'s-codebook-'+nm+'.png',fullPage:true});
await p.click('[data-view="cases"]');
// show me where
await p.evaluate(()=>V60.jump('bay:oilcap')); ok(await p.evaluate(()=>!document.getElementById('p-engine').hidden && !!document.querySelector('[data-bi="oilcap"].sel')),'Show me where opens engine bay with part selected');
// show everything
await p.evaluate(()=>__v60.go('story')); await p.evaluate(()=>{document.getElementById('stOpts').open=true});
await p.check('#stAll'); ok((await rail()).length===5,'Show everything reveals all sections');
await p.uncheck('#stAll');
console.log(' ov',await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth),'errs',errs); if(errs.length) process.exitCode=1;
await ctx.close();}
await b.close();})();
