const {chromium}=require('playwright');const fs=require('fs');const D=__dirname; // 실행: python3 build.py _site 후 _site를 8767 포트로 서빙
(async()=>{const br=await chromium.launch();const p=await br.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
for(const f of ['personCQ.js','styles2.js','dnf.js'])await p.addScriptTag({content:fs.readFileSync(D+'/'+f,'utf8')});
const out=await p.evaluate(()=>{
  S={party:'jj',look:{st:'part',h:'#2b2421',s:'#f1c7a0'},s:{fame:50,support:50,integrity:50},year:2030,held:{},titles:{}};
  const ORIG=personHD;const ST=[['지금',ORIG,0],['던전앤파이터 풍',personDNF,2]];
  const chars=[['me',{}],['me',{st:'long',h:'#5a3a2a',sk:1}],['aide'],['biz'],['cit2'],['old'],['judge'],['doc']];
  function lineup(fn,dy){const cv=document.createElement('canvas');cv.width=8*50+8;cv.height=104;const c=cv.getContext('2d');c.fillStyle='#e9e4da';c.fillRect(0,0,cv.width,cv.height);
    const r=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
    chars.forEach(([k,lk],i)=>{S.look=Object.assign({st:'part',h:'#2b2421',s:'#f1c7a0'},lk||{});const col=Object.assign({},whoCol(k));if(k==='me')col.talk=1;
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(8+i*50+2,98,34,3);fn(r,8+i*50,28+dy,col,i===0)});
    S.look={st:'part',h:'#2b2421',s:'#f1c7a0'};return cv}
  const big=(cv,k)=>{const o=document.createElement('canvas');o.width=cv.width*k;o.height=cv.height*k;const c=o.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(cv,0,0,o.width,o.height);return o.toDataURL()};
  PF=1;const rows=ST.map(([n,fn,dy])=>[n,big(lineup(fn,dy),2.6)]);
  const scenes=['hall|aide,me^,aide|banner','office|biz,me|chart','court|judge,me,judge|gavel'];
  const sc=scenes.map(sp=>ST.map(([n,fn,dy])=>{const a=document.createElement('canvas');a.width=512;a.height=256;window.personHD=(r,X,Y,c,w)=>fn(r,X,Y+dy,c,w);drawPx(sp,a);window.personHD=ORIG;return a.toDataURL()}));
  return{rows,sc,names:ST.map(x=>x[0])}});
fs.writeFileSync(D+'/v3.html',`<body style="background:#1d1d1f;color:#eee;font-family:'Noto Sans KR',sans-serif;margin:16px;width:1080px">
${out.rows.map(([n,u])=>`<h3 style="margin:14px 0 6px">${n}</h3><img src="${u}">`).join('')}
${out.sc.map(row=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">${row.map((u,i)=>`<div><div style="font-size:14px;margin-bottom:4px">${out.names[i]}</div><img src="${u}" width="530"></div>`).join('')}</div>`).join('')}</body>`);
const q=await br.newPage({viewport:{width:1112,height:900}});await q.goto('file://'+D+'/v3.html');await q.waitForTimeout(300);await q.screenshot({path:D+'/compare3.png',fullPage:true});
console.log('errs',errs);await br.close()})();
