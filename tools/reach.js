// 등장 조건 점검(Playwright): python3 -m http.server 8767 -d _site 띄운 뒤 node tools/reach.js
// 무작위 상태 2만 개에서 각 이벤트 c()가 참이 되는 횟수를 세고, 한 번도 참이 안 되는(NEVER)·드문(RARE) 이벤트와 조건 오류(ERRC)를 출력
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
await p.evaluate(()=>document.getElementById('go').click());await p.waitForTimeout(300);
const out=await p.evaluate(()=>{
  const base=JSON.parse(JSON.stringify(S));const offs=Object.keys(OFF);const regs=[...new Set(Object.values(typeof DIST!=='undefined'?DIST:{}).map(d=>d&&d.r).filter(Boolean))];
  const cnt={};EV.forEach(e=>cnt[e.id]=0);const errc={};
  for(let i=0;i<20000;i++){
    S=JSON.parse(JSON.stringify(base));const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
    S.office=pk(offs);S.party=pk(['jj','sm','ind','np']);S.ruling=pk(['jj','sm','ind']);S.age=ri(25,80);S.year=ri(2026,2060);
    for(const k in S.s)S.s[k]=ri(0,100);S.s.money=ri(0,20000);S.bg=pk(['lawyer','activist','biz','creator','civil','aide']);
    S.cases=Math.random()<.4?[{name:'x',sev:ri(1,3),y:S.year-1}]:[];S.trial=Math.random()<.15?{sev:2,stage:0,started:S.year-1}:null;
    S.titles={};if(Math.random()<.15)S.titles.leader=S.year+1;if(Math.random()<.15)S.titles.chair=S.year+1;if(Math.random()<.1)S.titles.whip=S.year;
    S.held={};offs.forEach(k=>{if(Math.random()<.3)S.held[k]=ri(1,3)});if(Math.random()<.2)S.held.min=['법무부'];if(Math.random()<.1)S.held.pm=1;
    S.minister=Math.random()<.1?{d:pk(['law','env','sme','cul','mois','molit']),from:S.year-ri(0,3),party:S.party,ext:0}:null;S.pm=Math.random()<.05?{from:S.year-1,party:S.party,ext:0}:null;
    S.togul=Math.random()<.15?S.year-ri(0,4):0;S.idle=ri(0,6);S.maj={nat:pk(['jj','sm']),local:pk(['jj','sm'])};
    if(S.office==='pres'){S.gov=null;try{presInit();S.gov.ag=[pk(Object.keys(AGENDA))]}catch(e){}}S.presFrom=S.year-ri(0,4);
    if(S.stats)S.stats.wins=ri(0,6);S.everChair=Math.random()<.3;S.everLeader=Math.random()<.2;S.crisis=Math.random()<.1?{k:'x',y:S.year,adj:0}:S.crisis;
    try{if(typeof famInit==='function'&&Math.random()<.5){}}catch(e){}
    for(const e of EV){if(!e.c){cnt[e.id]++;continue}try{if(e.c())cnt[e.id]++}catch(x){errc[e.id]=x.message}}}
  return {cnt,errc}});
const never=Object.entries(out.cnt).filter(([k,v])=>v===0).map(x=>x[0]);
console.log('NEVER',never.length,never.join(' '));console.log('ERRC',JSON.stringify(out.errc));
const rare=Object.entries(out.cnt).filter(([k,v])=>v>0&&v<30).map(x=>x.join(':'));console.log('RARE',rare.join(' '));
console.log('errs',errs.slice(0,3));await br.close()})();
