const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
const path=require('path'),fs=require('fs');const ROOT=path.resolve(__dirname,'..');const SH=path.join(ROOT,'tests','shots')+'/';fs.mkdirSync(SH,{recursive:true});
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
for (const [nm,vp,scheme] of [['phone',{width:390,height:844},'light'],['desk',{width:1366,height:900},'light'],['dark',{width:390,height:844},'dark']]){
const ctx=await b.newContext({viewport:vp,colorScheme:scheme});
await ctx.addInitScript(()=>{window.__V60_TEST=true;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(700);
const tabs=await p.evaluate(()=>[...document.querySelectorAll('main > .panel')].map(x=>x.id.slice(2)));
const ovs={};
for (const t of tabs){await p.evaluate(t=>__v60.go(t),t);await p.waitForTimeout(60);
 const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(o>0) ovs[t]=o;
 // find wide elements
 if(o>0) ovs[t+'_el']=await p.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && e.offsetParent).slice(0,4).map(e=>e.tagName+'.'+e.className+'#'+e.id));
 if(['today','bulletins','upgrades','live','kb'].includes(t)) await p.screenshot({path:SH+t+'-'+nm+'.png',fullPage:true});
}
// data-jump targets
const bad=await p.evaluate((tabs)=>{const s=new Set();document.querySelectorAll('[data-jump^="tab:"]').forEach(e=>{const t=e.getAttribute('data-jump').slice(4); if(!tabs.includes(t)) s.add(t)}); return [...s];},tabs);
console.log(nm,'tabs',tabs.length,tabs.join(','),'\n errs',errs,'\n overflow',JSON.stringify(ovs),'\n badjump',bad);
if(errs.length||Object.keys(ovs).length||bad.length){console.log('FAIL',nm);process.exitCode=1;}
await ctx.close();}
await b.close();})();
