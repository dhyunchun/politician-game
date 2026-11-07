/* ===== 도트 2판: 512×320 화면, 원근 배율, 자세 있는 인물 =====
   좌표는 512×320. 기존 배경(512×256)은 키 84픽셀(K=1) 인물에 맞춰 그려져 있으므로
   원근상 K=1이 되는 깊이(y=224)에 바닥선이 오도록 24픽셀 내려 '뒤쪽 평면'으로 쓴다. */
const DOT={W:512,H:320,KF:1.715,FY:300,HZ:118,OFF:24};
const kz=fy=>DOT.KF*(fy-DOT.HZ)/(DOT.FY-DOT.HZ);// 발 위치 y에서의 인물 배율
const mz=fy=>kz(fy)*84/1.7;// 그 깊이에서 1m가 몇 픽셀인지
let ZZ=1;

/* ── 인물 그림 캐시: (색·자세·방향·배율·입 모양)별로 한 번만 래스터화 ── */
const SPC=new Map();
function sprite(col,pose,flip,K){const key=JSON.stringify([col,pose,flip?1:0,Math.round(K*200)]);let s=SPC.get(key);if(s)return s;
  if(SPC.size>260)SPC.clear();const cv=document.createElement('canvas');cv.width=Math.ceil(88*K)+2;cv.height=Math.ceil(112*K)+2;const x=cv.getContext('2d');
  personH(x,44*K,102*K,K,col,pose,!!flip);s={cv,ax:44*K,ay:102*K};SPC.set(key,s);return s}
function drawPerson(c,x,fy,K,col,pose,flip){const s=sprite(col,pose,flip,K);c.drawImage(s.cv,Math.round(x-s.ax),Math.round(fy-s.ay))}
function shadowAt(c,x,fy,K){const T=PX2(c);T.ell(x,fy+1.4*K,13*K,2.2*K,'rgba(30,20,20,.2)')}

/* ── 배경 프레임: 기존 배경을 24픽셀 내리고 위(하늘·천장)는 첫 줄을, 아래(앞쪽 바닥)는 배경별로 이어 그린다 ── */
const BGF={};
function bgFrame(bg){const key=bg+'|'+PF;if(BGF[key])return BGF[key];const old=bgCached(bg),cv=document.createElement('canvas');cv.width=512;cv.height=320;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  const O=DOT.OFF;c.drawImage(old,0,O);for(let y=0;y<O;y++)c.drawImage(old,0,0,512,1,0,y,512,1);
  const sc=SCN[bg]||{};const ext=sc.ext||[216,256];
  if(typeof ext==='function')ext(c,old);else{const[a,b]=ext,h=b-a;for(let y=256+O;y<320;y+=h)c.drawImage(old,0,a,512,h,0,y,512,h)}
  return BGF[key]=cv}
function bands2(c,old,list){for(const[a,b,y0,y1]of list){const h=b-a;for(let y=y0;y<y1;y+=h)c.drawImage(old,0,a,512,Math.min(h,y1-y),0,y,512,Math.min(h,y1-y))}}
// 앞쪽 인도(거리용): 연석 + 원근 보도블록
function walkway(c,y0,col,line){const T=PX2(c);T.R(0,y0,512,5,shade(col,.82));T.R(0,y0,512,1,shade(col,1.1));T.R(0,y0+5,512,320-y0-5,col);
  for(let k=0,y=y0+12;y<320;k++,y+=7+k*2.2){T.R(0,Math.round(y),512,1,line);const off=k%2?0:20;for(let x=off;x<512;x+=40+k*4)T.R(x,Math.round(y),1,Math.round(7+k*2.2),line)}}

/* ── 배경별 설정 ──
   ext: 아래 확장(복사할 원본 줄 범위 또는 그리기 함수), extras: 배경 인물 [종류, 자세, x, 발y, 왼쪽보기, 옵션],
   deco: 깊이가 있는 배경 사물 [[깊이y, 그리기]], heads: 앞줄 관객 뒷머리, slots: 주요 인물 자리 */
const SCN={
  street:{ext:c=>walkway(c,280,'#d6cfc0','#c2baab'),
    extras:[['cit2','walk',36,236,0],['cit','walkB',150,234,1],['old','idleQ',398,238,1],['aide','phone',470,236,1]],
    deco:pr=>pr.some(p=>['truck','bus','car'].includes(p))?[]:[[262,c=>hdCar(c,PF?-60:-66,280,mz(262),'#c94040',true)],[264,c=>hdCar(c,PF?352:358,282,mz(262),'#e8e4d8',false)]]},
  night:{ext:c=>walkway(c,280,'#4a4a5a','#3e3e4c'),
    extras:[['cit2','phone',40,236,0],['aide','walk',462,236,1]],
    deco:()=>[[262,c=>hdCar(c,PF?360:366,282,mz(262),'#e8e4d8',false)]]},
  market:{extras:[['cit','walkB',30,232,0],['old','talkQ',150,230,0],['cit2','idleQ',184,232,1,{st:'bob',h:'#3a2a20'}],['cit','walk',470,236,1]]},
  office:{extras:[['aide','paper',440,226,1]]},
  stage:{heads:1,ext:(c,old)=>bands2(c,old,[[191,209,233,306],[209,222,306,319],[222,256,319,320]]),extras:[['aide','phone',62,222,0],['aide','paper',452,222,1]]},
  press:{heads:1,extras:[['aide','idleQ',36,226,0],['aide','paper',478,226,1]]},
  hall:{extras:[['aide','phone',22,232,0],['rep','camera',56,236,0],['cit','sign',430,236,1],['cit2','sign',476,232,1]]},
  court:{heads:1,bench:128,ext:(c,old)=>bands2(c,old,[[186,220,244,306],[220,234,306,320]]),extras:[['rep','idleQ',58,214,0,{clipY:190}],['aide','paper',454,214,1,{clipY:190}]]},
  tv:{extras:[['rep','camera',20,236,0],['aide','paper',494,232,1]]},
  school:{extras:[['cit','walk',30,234,0],['cit2','talkQ',62,236,0],['cit','talkQ',448,236,1,{st:'bob',h:'#3a2a20'}],['cit2','walkB',486,232,1]]},
  rain:{extras:[['cit','umb',36,234,0],['cit2','umb',470,234,1]]},
  sea:{extras:[['cit2','idleQ',24,234,0],['old','talkQ',56,236,0],['cit2','phone',474,236,1]]},
  field:{extras:[['old','idleQ',40,232,0],['cit','talkQ',96,234,0],['old','talkQ',446,234,1]]},
  ballot:{extras:[['aide','paper',28,236,0],['aide','idleQ',486,236,1]]},
  plane:{extras:[['cit','walkB',28,234,0],['cit2','walkB',74,236,0],['aide','walk',112,232,0],['aide','idleQ',474,236,1]]},
  train:{extras:[['cit2','phone',24,234,0],['cit','walkB',60,232,0],['aide','walk',452,234,1],['cit2','idleQ',490,236,1]]},
  hospital:{extras:[['doc','paper',420,232,1,{st:'long',h:'#3a2a20'}],['old','idleQ',482,236,1]]},
  factory:{extras:[['cit2','idleQ',26,234,0],['cit2','paper',62,236,0],['cit2','talkQ',446,236,1],['cit2','idleQ',484,234,1]]},
  audit:{extras:[]},brief:{extras:[]},cabinet:{extras:[]},phone:{extras:[]},
  fire:{extras:[['cit2','idleQ',36,236,0]]},
};

/* ── 소품: 실제 크기 ── */
function hdPodium(c,cx,fy){const m=mz(fy),T=PX2(c),w=.62*m,h=1.0*m,top=fy-h;
  T.poly([[cx-w*.62,top],[cx+w*.62,top],[cx+w*.56,top+.08*m],[cx-w*.56,top+.08*m]],'#b8804a');T.box(cx-w/2,top+.08*m,w,h-.08*m,'#8a5a33');T.R(cx-w/2+2,top+.1*m,2,h-.12*m,'#a8744a');
  T.ell(cx,top+.42*m,.13*m,.13*m,'#e8b94a');T.ell(cx,top+.42*m,.08*m,.08*m,'#24499a');
  for(const dx of[-.1,.1]){T.R(cx+dx*m,top-.32*m,1.6,.32*m,'#3a3a44');T.ell(cx+dx*m+1,top-.33*m,.035*m,.035*m,'#5a626c')}}
function hdTable(c,x0,x1,fy,o={}){const m=mz(fy),T=PX2(c),h=.74*m,top=fy-h,dp=.22*m,col=o.col||'#a06a40';
  T.poly([[x0+dp*.5,top-dp],[x1-dp*.5,top-dp],[x1,top],[x0,top]],shade(col,1.12));T.R(x0,top-dp,x1-x0,1,shade(col,1.35));T.box(x0,top,x1-x0,.07*m,shade(col,.85));
  T.box(x0+.03*m,top+.07*m,x1-x0-.06*m,h-.07*m,o.cloth||shade(col,.66));if(o.cloth)T.R(x0+.03*m,top+.07*m,x1-x0-.06*m,2,shade(o.cloth,1.15))}
function hdBallot(c,cx,fy){const m=mz(fy),T=PX2(c),w=.5*m,h=.55*m;hdTable(c,cx-.45*m,cx+.45*m,fy,{cloth:'#2f5fc0'});const top=fy-.74*m-.22*m*.5;
  T.box(cx-w/2,top-h,w,h,'#f4f6f8');T.R(cx-w*.3,top-h+2,w*.6,2,'#3a3a44');T.ell(cx,top-h*.45,.1*m,.1*m,'#e0384c');T.ell(cx,top-h*.45,.06*m,.06*m,'#ffffff');T.R(cx-1,top-h*.45-.06*m,2,.12*m,'#e0384c');T.R(cx-.05*m,top-h*.45-1,.1*m,2,'#e0384c')}
function hdBooks(c,cx,fy,n=9){const m=mz(fy),T=PX2(c),cs=['#c0392b','#2f6be0','#e8a33a','#3a9e6a','#7a6bd1','#2a4a7a','#8a2a2a'];let y=fy;
  for(let i=0;i<n;i++){const h=(.045+(i%3)*.012)*m,w=(.28+(i*7%5)*.02)*m,x=cx-w/2+((i*13)%5-2);T.box(x,y-h,w,h,cs[i%cs.length]);T.R(x+w-.05*m,y-h+1,.04*m,h-2,'#f4f0e0');y-=h}}
function hdBoxes(c,cx,fy){const m=mz(fy),T=PX2(c),bx=(x,y,w,h)=>{T.box(x,y-h,w,h,'#d0a870');T.R(x+w/2-1,y-h,2,h,'#b08850');T.R(x+w*.2,y-h*.55,w*.6,h*.22,'#ffffff');T.R(x+w*.28,y-h*.48,w*.44,1,'#9aa3ad')};
  const w=.5*m,h=.36*m;bx(cx-w-1,fy,w,h);bx(cx+1,fy,w,h);bx(cx-w/2,fy-h,w,h)}
function hdGavel(c,cx,fy){const m=mz(fy),T=PX2(c);hdTable(c,cx-.42*m,cx+.42*m,fy,{cloth:'#2f3f6a'});const top=fy-.74*m-.11*m;T.box(cx-.16*m,top-.05*m,.32*m,.05*m,'#5a3a20');T.box(cx-.03*m,top-.24*m,.06*m,.19*m,'#6b4426');T.box(cx-.12*m,top-.3*m,.24*m,.08*m,'#7a5230')}
function hdBus(c,x,base,m,col,toRight){const T=PX2(c),L=11*m,H=3.1*m,X=u=>toRight?x+u*m:x+L-u*m,Y=v=>base-v*m,lx=Math.min(X(0),X(11));
  T.box(lx,Y(3.1),L,2.75*m,col);T.R(lx+2,Y(3.1)+2,L-4,.12*m,shade(col,1.25));T.R(lx,Y(.9),L,.1*m,'#f2c14e');
  for(let i=0;i<7;i++){const u=1.6+i*1.25;T.box(Math.min(X(u),X(u+1.05)),Y(2.7),1.05*m,1.1*m,'#5f8fb8',{e:shade(col,.35)});T.R(Math.min(X(u),X(u+1.05))+2,Y(2.7)+2,.25*m,1.1*m-4,'#8fb8d8')}
  T.box(Math.min(X(.3),X(1.3)),Y(2.7),1*m,2.2*m,'#7fa6c8',{e:shade(col,.35)});
  for(const u of[2.2,8.6]){T.ell(X(u),Y(.42),.48*m,.48*m,'#16161a');T.ell(X(u),Y(.42),.26*m,.26*m,'#9aa0a8')}}

/* ── 앞줄 관객 뒷머리(가장 가까운 줄, 화면 아래를 가림) ── */
function frontHeads(c,rnd,y0=286,W=62){const hs=['#1f1f1f','#3a2a20','#4a2f1f','#d2d2d2','#6b4426','#222222'],cs=['#e0a93f','#5b9e6a','#7a6bd1','#d95f5f','#4b8fd1','#c9a36b','#3a9e9a','#55606e'];
  const k0=PXC;PXC={c,k2:2};try{for(let i=0;i<10;i++){const x=i*54-26+(rnd()*10|0),y=y0+(i%2)*8-((i+PF)%3===0?2:0);backHD(x,y,W,cs[(i*3)%cs.length],hs[(i*5)%hs.length],i%3?'#f1c7a0':'#e0b08a')}}finally{PXC=k0}}

const FHC={};function headsLayer(){const key='h'+PF;if(FHC[key])return FHC[key];const cv=document.createElement('canvas');cv.width=512;cv.height=320;frontHeads(cv.getContext('2d'),mkRng('heads'));return FHC[key]=cv}

/* ── 장면 배치: spec의 인물·표정·소품으로 자세·자리·방향을 정한다 ── */
const FACE2={'+':'smile','!':'angry','~':'sad','?':'shock'};
function parseWho(who){return(who?who.split(','):[]).filter(Boolean).map(w=>{const m=w.match(/^([a-z0-9]+)([\^+!~?]*)$/i)||[0,w,''];return{k:m[1],wave:m[2].includes('^'),face:[...m[2]].map(ch=>FACE2[ch]).find(Boolean)||''}})}
function stageScene(bg,who,props){
  const all=parseWho(who),crowd=all.some(p=>p.k==='crowd'),P=all.filter(p=>p.k!=='crowd'),n=P.length,has=k=>props.includes(k),meI=P.findIndex(p=>p.k==='me');
  const out=[];if(!n)return out;
  const BEN=SCN[bg]&&SCN[bg].bench,judges=BEN?P.filter(p=>p.k==='judge'):[],rest=BEN?P.filter(p=>p.k!=='judge'):P;
  // 자리: 연단·탁자·법대 같은 소품/배경이 있으면 그에 맞춘다
  let slots;const m=rest.length;
  if(has('podium')){slots=[[256,288],[150,294],[362,294],[78,290],[440,290]]}
  else if(has('desk')){slots=m===1?[[256,282]]:m===2?[[200,282],[312,282]]:[[256,282],[140,280],[372,280],[60,278]]}
  else if(m===1)slots=[[226,298]];
  else if(m===2)slots=[[200,300],[318,294]];
  else if(m===3)slots=[[256,302],[134,290],[380,292]];
  else slots=[[236,302],[110,288],[352,296],[452,286],[40,284]];
  // 주인공이 첫 자리(가장 앞), 나머지는 순서대로
  const order=rest.slice().sort((a,b)=>(b.k==='me')-(a.k==='me'));
  const others=order.filter(p=>p.k!=='me'),me=order.find(p=>p.k==='me');
  const mood=me?me.face:'',rival=others.find(p=>p.k==='riv'),anyone=others.length+judges.length;
  // 두 사람이 웃는 얼굴로 만나면 악수, 봉투·돈 소품이면 건네기
  const partner=others.find(p=>['cit','cit2','old','biz','fjj','fsm','aide'].includes(p.k));
  const meProp=['podium','desk','umbrella','phone','glass','bag'].some(has)||(has('env')&&!others.some(p=>p.k==='biz'));
  const shakeMode=me&&partner&&m===2&&(mood==='smile'||me.wave)&&!meProp&&partner.face!=='angry';
  const giveMode=me&&others.some(p=>p.k==='biz')&&(has('env')||has('cash')||has('book')||has('bag'));
  order.forEach((p,i)=>{let[x,fy]=slots[Math.min(i,slots.length-1)];let pose='idleQ',face=p.face;
    if(p.k==='me'){
      if(has('podium'))pose=p.wave?'fistUp':mood==='sad'?'bowF':'talkF';
      else if(has('umbrella'))pose='umb';
      else if(has('phone'))pose='phone';
      else if(has('glass'))pose='toast';
      else if(has('bag'))pose='holdBag';
      else if(has('env')&&!giveMode)pose='paper';
      else if(giveMode)pose=mood==='smile'?'shake':'think';
      else if(shakeMode)pose='shake';
      else if(p.wave)pose=mood==='smile'||crowd?'fistUp':'wave';
      else if(mood==='angry')pose=rival||others.length?'point':judges.length?'cross':'hips';
      else if(mood==='sad')pose=anyone?'clasp':'despair';
      else if(mood==='shock')pose='shock';
      else if(has('desk'))pose='talkF';
      else pose=others.length?'talkQ':judges.length?'clasp':'talkF';
    }else{const k=p.k;
      if(giveMode&&k==='biz'){pose='give';if(!face)face='smile'}
      else if(shakeMode&&p===partner)pose='shake';
      else if(k==='riv')pose=face==='angry'?'point':face==='smile'?'cross':face==='sad'?'clasp':'idleQ';
      else if(k==='rep')pose=has('cam')||bg==='press'?'memo':'memo';
      else if(k==='aide')pose=p.wave?'clap':mood==='sad'?'clasp':'paper';
      else if(k==='doc')pose='paper';
      else if(k==='judge')pose='judge';
      else if(k==='biz')pose=face==='angry'?'cross':'talkQ';
      else if(k==='fjj'||k==='fsm')pose='talkQ';
      else{pose=face==='smile'?(mood==='smile'||me&&me.wave?'cheerQ':'clap'):face==='angry'?'point':face==='sad'?'clasp':face==='shock'?'shock':p.wave?'wave':(i%2?'talkQ':'idleQ')}
    }
    if(has('desk')&&p.k!=='me'&&!['give','shake'].includes(pose))pose=pose==='paper'?'paper':'idleQ';
    out.push({k:p.k,pose,x,fy,face,me:p.k==='me'})});
  // 악수·건네기: 손이 닿는 거리로 붙인다(배율 1.7에서 중심 사이 약 75픽셀)
  if(shakeMode||giveMode){const a=out.find(o=>o.me),b=out.find(o=>!o.me&&(o.pose==='shake'||o.pose==='give'));if(a&&b){const K=kz(Math.min(a.fy,b.fy)),gap=(b.pose==='give'?57:43.5)*K;if(b.x>a.x)b.x=a.x+gap;else b.x=a.x-gap;b.fy=a.fy-2}}
  // 판사: 법대 뒤 단상(배경의 법대에 맞춰 위로 들어 올림)
  judges.forEach((p,i)=>{const nJ=judges.length,x=nJ===1?256:256+(i-(nJ-1)/2)*92;out.push({k:'judge',pose:'judge',x,fy:200,lift:38,clipY:BEN,face:p.face,me:false})});
  // 방향: 주인공은 상대(라이벌 우선)를 보고, 나머지는 주인공을 본다
  const meO=out.find(o=>o.me);
  out.forEach(o=>{if(o.k==='judge'){o.flip=false;return}
    const tgt=o.me?(out.find(q=>q.k==='riv')||out.filter(q=>!q.me&&q.k!=='judge').sort((u,v)=>Math.abs(u.x-o.x)-Math.abs(v.x-o.x))[0]):meO;
    o.flip=tgt?tgt.x<o.x:o.x>256});
  return out}

function clipDraw(c,y,fn){if(!y||y>=320){fn();return}c.save();c.beginPath();c.rect(0,0,512,y);c.clip();try{fn()}finally{c.restore()}}
/* ── 새 drawPx ── */
const OLDPLANE=['gavel','cam','chart','car','house','flower','glassbox','truck'],OVERLAY=['banner','sun','heart','exclaim','xmark'];
function drawPx(spec,cv0){
  const cv=cv0||document.getElementById('pxc');if(!cv)return;const c=cv.getContext&&cv.getContext('2d');if(!c)return;
  let[bg,who='',props='']=spec.split('|');if(!SCN[bg]&&!['night','street'].includes(bg))bg=bg||'street';const pr=props?props.split(','):[];const rnd=mkRng(spec);
  const k=cv.width/512;c.setTransform(k,0,0,k,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,512,320);
  c.drawImage(bgFrame(bg),0,0);
  const sc=SCN[bg]||{},ws=who?who.split(','):[],O=DOT.OFF;
  // 기존 배경 장식(새·간판 등). 옛 단역·자동차는 그리지 않는다
  PXC={c,k2:2*k,hi:true,oy:O*k,nomini:1};c.setTransform(2*k,0,0,2*k,0,O*k);
  const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const X=BGX[bg];try{if(X&&X.back)X.back(r,mkRng(spec+'b'),c,ws)}catch(e){}
  c.setTransform(k,0,0,k,0,0);PXC={c,k2:2*k,hi:true,oy:0};
  // 깊이 순서로 그릴 것들
  const items=[];
  (sc.deco?sc.deco(pr):[]).forEach(([fy,fn])=>items.push({fy,fn:()=>fn(c)}));
  (sc.extras||[]).forEach(([kk,pose,x,fy,flip,o])=>items.push({fy,fn:()=>{const K=kz(fy),col=Object.assign({},whoCol(kk),o||{});const cy=o&&o.clipY;if(!cy)shadowAt(c,x,fy,K);clipDraw(c,cy,()=>drawPerson(c,x,fy-(o&&o.lift||0),K,col,pose,flip))}}));
  const ppl=stageScene(bg,who,pr);
  ppl.forEach((o,i)=>items.push({fy:o.fy,fn:()=>{const K=kz(o.fy),col=Object.assign({},whoCol(o.k));if(o.face)col.face=o.face==='smile'&&o.me?'grin':o.face;if(o.me&&!o.face)col.talk=PF;
    const bob=(i+PF)%2&&o.k!=='judge'?1:0;if(!o.lift)shadowAt(c,o.x,o.fy,K);clipDraw(c,o.clipY,()=>drawPerson(c,o.x,o.fy-(o.lift||0)+bob,K,col,o.pose,o.flip))}}));
  // 실제 크기 소품
  const meO=ppl.find(o=>o.me)||ppl[0]||{x:256,fy:298};
  // 바닥 소품은 사람과 가장 먼 빈자리에(좌우 대칭 후보 중에서)
  const used=ppl.map(o=>o.x);let lastD=0;const freeX=w=>{let best=256,bd=-1e9;for(let x=40+w/2;x<=472-w/2;x+=8){const d=Math.min(...used.map(u=>Math.abs(u-x)-w/2-30));if(d>bd){bd=d;best=x}}used.push(best);lastD=bd;return best};
  const pfy=f=>lastD<0?262:f;// 빈자리가 없으면 사람 뒤쪽 깊이에
  if(pr.includes('podium'))items.push({fy:meO.fy+4,fn:()=>hdPodium(c,meO.x,meO.fy+4)});
  if(pr.includes('desk'))items.push({fy:296,fn:()=>hdTable(c,40,472,300,{cloth:'#1d3a7c'})});
  if(pr.includes('ballot')){const x=freeX(70),f=pfy(304);items.push({fy:f,fn:()=>hdBallot(c,x,f)})}
  if(pr.includes('cash')){const x=freeX(50),f=pfy(304);items.push({fy:f,fn:()=>hdCase(c,x,f,mz(f))})}
  if(pr.includes('book')){const x=freeX(40),f=pfy(303);items.push({fy:f,fn:()=>hdBooks(c,x,f)})}
  if(pr.includes('boxes')){const x=freeX(84),f=pfy(306);items.push({fy:f,fn:()=>hdBoxes(c,x,f)})}
  const oldP=p=>()=>{const k0=PXC;PXC={c,k2:2*k,hi:true,oy:O*k};c.setTransform(2*k,0,0,2*k,0,O*k);try{PROPS[p](r,rnd,c)}finally{c.setTransform(k,0,0,k,0,0);PXC=k0}};
  pr.filter(p=>OLDPLANE.includes(p)&&PROPS[p]&&!(p==='gavel'&&!sc.bench)).forEach(p=>items.push({fy:p==='gavel'?100:224,fn:oldP(p)}));
  if(pr.includes('gavel')&&!sc.bench){const x=freeX(70),f=pfy(300);items.push({fy:f,fn:()=>hdGavel(c,x,f)})}
  if(pr.includes('bus'))items.push({fy:262,fn:()=>hdBus(c,-470,282,mz(262),'#2f9e6a',true)});
  items.sort((a,b)=>a.fy-b.fy).forEach(it=>{try{it.fn()}catch(e){console.error(e)}});
  // 앞줄 관객
  if(ws.includes('crowd')||sc.heads)c.drawImage(headsLayer(),0,0);
  // 기존 소품 중 원근과 무관한 것(현수막·아이콘)과 배경 평면 사물
  PXC={c,k2:2*k,hi:true,oy:O*k};c.setTransform(2*k,0,0,2*k,0,O*k);
  pr.filter(p=>OVERLAY.includes(p)).forEach(p=>{try{PROPS[p]&&PROPS[p](r,rnd,c)}catch(e){}});
  c.setTransform(1,0,0,1,0,0);PXC=null}
