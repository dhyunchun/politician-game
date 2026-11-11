// 시뮬레이션 봇: node --max-old-space-size=3000 tools/sim.js <판 수(≤60)> <rand|smart|mod>
// 출력: 엔딩 분포, 로그 키워드 집계, 최고 직위, 출신·정당별 성과, errs(런타임 오류). SEENOUT=파일 지정 시 이벤트별 등장한 판 수, EVNOUT=파일 지정 시 이벤트별 총 등장 횟수(S.evn 합)를 JSON으로 저장
// FORCEPRES=1 이면 국회의원 3선 상태로 시작(대선 구간 점검용). HTML=경로 로 다른 빌드 검사
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.env.HTML||require('path').join(__dirname,'../src/game.html'),'utf8');
const BGR={},PTR={};const N=+process.argv[2]||60,STRAT=process.argv[3]||'rand';
const KW={};const AGES=[];const RIV=[];var PRESPOOR=0;const res={},errs=[],bestC={};let yearsTot=0,trials=0,paints=0,presAge=[];
for(let g=0;g<N;g++){console.error("G",g,Math.round(process.memoryUsage().heapUsed/1e6));
  const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/getContext|Not implemented/.test(e.message))errs.push('jsdom:'+e.message)});
  const dom=new JSDOM(`<!doctype html><body>${html}</body>`,{virtualConsole:vc,runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,
    beforeParse(w){w.__NOSUSP=1;w.HTMLCanvasElement.prototype.getContext=function(){paints++;const g={addColorStop(){}};const base={fillRect(x,y,a,b){if([x,y,a,b].some(Number.isNaN))errs.push('NaN rect')}};return new Proxy(base,{get(o,k){if(k in o)return o[k];if(k==='createLinearGradient'||k==='createRadialGradient'||k==='createPattern')return ()=>g;if(k==='getImageData')return ()=>{throw 1};if(k==='measureText')return ()=>({width:10});return ()=>{}},set(o,k,v){if(k==='fillStyle'&&(!v||v==='undefined'))errs.push('bad color');return true}})}}});
  const w=dom.window;w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};w.matchMedia=()=>({matches:true});
  w.onerror=(m)=>errs.push(String(m));
  const d=w.document;
  d.querySelector(`.ballot button[data-party="${['jj','sm','ind'][g%3]}"]`).click();
  const regs=d.querySelectorAll('#rg button');regs[g%regs.length].click();
  const ds=d.querySelectorAll('#ds button');ds[g%ds.length].click();
  d.querySelectorAll('#bgc button')[Math.floor(g/3)%6].click();
  d.getElementById('go').click();if(process.env.FORCEPRES){w.eval("S.office='nat';S.held.nat=3;S.everChair=true;S.s.fame=70;S.s.party=70;S.s.support=45;S.s.money=60000")}
  let steps=0;
  while(steps++<8000){
    const S=w.eval('S');if(!S||S.phase==='ending')break;
    if(S.phase==='action'){
      let acts=[...d.querySelectorAll('.act:not([disabled])')];if(STRAT==='smart')acts=acts.filter(a=>!a.classList.contains('dark'));if(STRAT==='mod'){const S0=w.eval('S');acts=acts.filter(a=>!a.classList.contains('dark')||(w.eval('broke()')&&!w.eval('!!S.trial')&&Math.random()<.35))}
      if(STRAT==='dirty'&&Math.random()<.5){const dk=acts.filter(a=>a.classList.contains('dark'));if(dk.length)acts=dk}
      if(S.ap>0&&acts.length){acts[Math.floor(Math.random()*acts.length)].click();const jb=d.querySelector('#joinbox [data-p]');if(jb)jb.click();continue}
      d.getElementById('endyr').click();continue}
    let bs=[...d.querySelectorAll('#stage button:not([disabled])')];
    {const nd=bs.filter(b=>!b.classList.contains('dark'));
     if(STRAT==='smart'&&nd.length)bs=nd;
     if(STRAT==='mod'&&nd.length&&!(w.eval('broke()')&&!w.eval('!!S.trial')&&w.eval('S.s.integrity')>=40))bs=nd;
     if(STRAT==='mod'&&bs.length>nd.length&&w.eval('broke()')&&!w.eval('!!S.trial')&&w.eval('S.s.integrity')>=40){const dk=bs.filter(b=>b.classList.contains('dark'));if(Math.random()<.6)bs=dk}
     if(STRAT==='dirty'){const dk=bs.filter(b=>b.classList.contains('dark'));if(dk.length)bs=dk}}
    if(!bs.length){errs.push('stuck '+S.phase+' '+JSON.stringify(S.cur)+' '+JSON.stringify(S.elec));break}
    if(STRAT!=='rand'&&!S.res&&(S.cur&&(S.cur.type==='detect'||S.cur.type==='trial'))){const mny=w.eval('S.s.money'),LW=w.eval('LAW');const L=[...d.querySelectorAll('[data-l]:not([disabled])')].filter(b=>LW[+b.dataset.l].cost<=mny*.5);if(L.length){L[L.length-1].click();continue}}
    if(STRAT!=='rand'&&!S.res&&S.s.mental<30){const rb=bs.find(b=>b.textContent.includes('쉬어'));if(rb){rb.click();continue}}
    if(STAGE_SMART(S,d,bs))continue;
    bs[Math.floor(Math.random()*bs.length)].click();
  }
  function STAGE_SMART(S,d,bs){
    if(STRAT==='rand')return false;
    // smart: in election choose highest office (first non-skip option from end), avoid bribes
    if(S.cur&&S.cur.type==='elec'&&S.elec&&S.elec.step==='choose'&&!S.res){const o=[...d.querySelectorAll('[data-o]:not([disabled])')].filter(b=>b.dataset.o!=='skip');if(o.length){
  const est=w.eval(`(o)=>{const x=S.s;let p=x.support*.45+x.fame*.22+route(o)*.3+7+(S.office===o?5:0);if(member()&&o!=='pres')p+=(o==='gov'?leanFor(S.party,false):leanFor(S.party));return p-OFF[o].base}`);
  const cand=o.map(b=>({b,o:b.dataset.o,e:est(b.dataset.o)})).filter(c=>c.e>=0);
  const pickc=cand.length?cand[cand.length-1]:o.map(b=>({b,e:est(b.dataset.o)})).sort((a,b)=>b.e-a.e)[0];pickc.b.click();return true}}
    if(S.cur&&S.cur.type==='elec'&&S.elec&&S.elec.step==='camp'&&!S.res){const v=[...d.querySelectorAll('[data-v]:not([disabled])')];if(!v.length){d.getElementById('giveup').click();return true}v[v.length-1].click();return true}
    if(S.cur&&S.cur.type==='elec'&&S.elec&&S.elec.step==='nom'&&!S.res){d.getElementById('n1').click();return true}
    if(S.cur&&S.cur.type==='ev'&&!S.res&&bs.length>1&&w.eval('EV').find(e=>e.id===S.cur.id).tempt){if(STRAT==='smart'||(STRAT==='mod'&&(!w.eval('broke()')||w.eval('S.s.integrity')<40||w.eval('!!S.trial'))))bs[bs.length-1].click();else bs[0].click();return true}
    // 임기 공약: PLEDGE=ignore가 아니면 진척이 임기 경과에 못 미칠 때 공약 선택지를 고르고, 공약 후퇴·파기 선택지는 피한다
    if(process.env.PLEDGE!=='ignore'&&S.pl&&!S.res&&S.cur&&S.cur.type==='ev'){const pc=bs.filter(b=>b.classList.contains('plc')&&!(/보고회로 연다/.test(b.textContent)&&w.eval('broke()')));
      if(pc.length&&w.eval('plgPct()')<Math.min(100,(S.year-S.pl.y)*25+10)){pc[0].click();return true}
      const nb=bs.filter(b=>!/공약 후퇴|공약 파기/.test(b.textContent));if(nb.length&&nb.length<bs.length){nb[Math.floor(Math.random()*nb.length)].click();return true}}
    return false;
  }
  const S=w.eval('S');
  if(S){for(const [y,l] of S.log){for(const k of ['국무총리에 임명','원내대표에 선출','임명동의안이','총리 후보자','장관에 임명','청문회 끝에','장관직을 사퇴','라이벌','새 라이벌','퇴임했다','정계를 떠나기로','전직 대통령','비례대표','탄핵소추안 가결','탄핵소추안 부결','파면 선고','탄핵 기각','대통령 파면','정권 교체','대한민국 대통령 낙선','대한민국 대통령 공천 탈락','대한민국 대통령 당선','도지사 당선','광역시장 당선','특별시장 당선','다수당','소수당','여대야소','여소야대','낙선','당선','유죄 확정','무죄 확정','불기소','기소.','공천 탈락','운영비 부족','기탁금이 없어','벌금'])if(l.includes(k))KW[k]=(KW[k]||0)+1}}
  if(S&&S.seen){global.SEEN=global.SEEN||{};for(const k in S.seen)SEEN[k]=(SEEN[k]||0)+1}
  if(S&&S.evn){global.EVN=global.EVN||{};for(const k in S.evn)EVN[k]=(EVN[k]||0)+S.evn[k]}
  if(S&&S.phase==='ending'){const tier=w.eval('OFF[S.best].tier');for(const [M,k] of [[BGR,S.bg],[PTR,['jj','sm','ind'][g%3]]]){M[k]=M[k]||{n:0,t3:0,t4:0,pres:0,yrs:0};M[k].n++;if(tier>=3)M[k].t3++;if(tier>=4)M[k].t4++;if(S.end==='pres'||S.held.pres)M[k].pres++;M[k].yrs+=S.year-2026}res[S.end]=(res[S.end]||0)+1;AGES.push(S.end+':'+S.age);if(S.rival)RIV.push(S.rival.l+'-'+S.rival.w);bestC[S.best]=(bestC[S.best]||0)+1;yearsTot+=S.year-2026;trials+=S.stats.trials}
  else errs.push('not ended steps='+steps);
  w.close();
}
if(process.env.SEENOUT)require('fs').writeFileSync(process.env.SEENOUT,JSON.stringify(global.SEEN||{}));if(process.env.EVNOUT)require('fs').writeFileSync(process.env.EVNOUT,JSON.stringify(global.EVN||{}));console.log(STRAT,'ends',res);console.log(JSON.stringify(KW),'prespoor',typeof PRESPOOR==='undefined'?0:PRESPOOR);console.log('best',bestC);console.log('rival',JSON.stringify(RIV));console.log('avg years',(yearsTot/N).toFixed(1),'trials',trials,'paints',paints);console.log('BG',JSON.stringify(BGR));console.log('PT',JSON.stringify(PTR));console.log('errs',[...new Set(errs)].slice(0,8),errs.length);
