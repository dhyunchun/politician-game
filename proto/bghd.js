// 1024×640 배경 시안 + 원근 배율 장면 배치
// 원근: 발 위치 y(fy)에서 인물 배율 K = KF*(fy-hz)/(FY-hz). 사람 키 1.7m = 84단위 → 1m = 49.4단위.
const HD={W:1024,H:640,KF:3.43,FY:600};
const kAt=(sc,fy)=>HD.KF*(fy-sc.hz)/(HD.FY-sc.hz);
const pxm=(sc,fy)=>kAt(sc,fy)*84/1.7;// 그 깊이에서 1m가 몇 픽셀인지

/* ── 앨리어싱 없는 도트 그리기 도구 ── */
let ZZ=1;// 배경 좌표(1024 기준) → 실제 캔버스 배율. 512 격자면 0.5
function PX2(ctx){const Z=ZZ;
  const rawR=(x,y,w,h,c)=>{if(w<=0||h<=0)return;ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  const sc=(x,y,w,h)=>{const X=Math.round(x*Z),Y=Math.round(y*Z);return[X,Y,Math.max(1,Math.round((x+w)*Z)-X),Math.max(1,Math.round((y+h)*Z)-Y)]};
  const R=(x,y,w,h,c)=>{if(w<=0||h<=0)return;rawR(...sc(x,y,w,h),c)};
  const poly=(pts,c)=>{pts=pts.map(([x,y])=>[x*Z,y*Z]);let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}ctx.fillStyle=c;
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yc=y+.5,xs=[];for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>yc)!==(yj>yc))xs.push(xi+(yc-yi)/(yj-yi)*(xj-xi))}
      xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const a=Math.round(xs[k]),b=Math.round(xs[k+1]);if(b>a)ctx.fillRect(a,y,b-a,1)}}};
  const ell=(cx,cy,rx,ry,c)=>{cx*=Z;cy*=Z;rx=Math.max(.6,rx*Z);ry=Math.max(.6,ry*Z);ctx.fillStyle=c;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){const t=(y+.5-cy)/ry;if(Math.abs(t)>1)continue;const w=rx*Math.sqrt(1-t*t);const a=Math.round(cx-w),b=Math.round(cx+w);if(b>a)ctx.fillRect(a,y,b-a,1)}};
  // 테두리 있는 상자: 테두리 1픽셀, 윗면 밝게, 아래 어둡게
  const box=(x,y,w,h,c,o={})=>{const[X,Y,W,H]=sc(x,y,w,h);const e=o.e||shade(c,.32);rawR(X,Y,W,H,e);rawR(X+1,Y+1,W-2,H-2,c);if(!o.flat&&H>4){const t=Math.max(1,Math.round(H*.06)),b=Math.max(1,Math.round(H*.08));rawR(X+1,Y+1,W-2,t,shade(c,1.18));rawR(X+1,Y+H-1-b,W-2,b,shade(c,.82))}};
  return{R,poly,ell,box}}

/* ── 소품(실제 크기, m 단위 → 깊이별 픽셀) ── */
function hdCar(ctx,x,base,m,col,toRight){// 승용차 길이 4.5m, 높이 1.45m. x는 차 왼쪽 끝
  const T=PX2(ctx),L=4.5*m,H=1.45*m,X=u=>toRight?x+u*m:x+L-u*m,Y=v=>base-v*m;const e=shade(col,.3);
  const body=[[0,.32],[0,.82],[.25,.92],[1.1,.98],[1.55,1.42],[3.1,1.44],[3.6,1.0],[4.3,.92],[4.5,.72],[4.5,.32]].map(([u,v])=>[X(u),Y(v)]);
  T.poly(body.map(([a,b])=>[a+(toRight?-1:1)*0,b]),e);T.poly(body.map(([a,b],i)=>[a+(a<x+L/2?1:-1),b+(i===0||i===body.length-1?-1:1)]),col);
  T.poly([[X(1.25),Y(1.0)],[X(1.66),Y(1.36)],[X(2.3),Y(1.37)],[X(2.3),Y(1.0)]],'#2a3644');T.poly([[X(2.42),Y(1.0)],[X(2.42),Y(1.37)],[X(3.04),Y(1.38)],[X(3.44),Y(1.0)]],'#2a3644');
  T.poly([[X(1.4),Y(1.02)],[X(1.7),Y(1.3)],[X(1.9),Y(1.3)],[X(1.6),Y(1.02)]],'#7f9bb5');T.poly([[X(2.6),Y(1.02)],[X(2.9),Y(1.3)],[X(3.05),Y(1.3)],[X(2.75),Y(1.02)]],'#7f9bb5');
  T.R(Math.min(X(.1),X(4.4)),Y(.72),Math.abs(X(4.4)-X(.1)),Math.max(1,.05*m),shade(col,1.3));
  T.R(Math.min(X(.2),X(4.3)),Y(.5),Math.abs(X(4.3)-X(.2)),Math.max(1,.04*m),shade(col,.7));
  const dl=X(2.36);T.R(dl,Y(.98),1,.6*m,e);T.R(Math.min(X(1.9),X(2.1)),Y(.86),.15*m,.04*m,'#c8ccd2');T.R(Math.min(X(2.8),X(3.0)),Y(.86),.15*m,.04*m,'#c8ccd2');
  T.ell(X(4.42),Y(.78),.1*m,.07*m,'#ffe7a0');T.ell(X(.06),Y(.78),.08*m,.07*m,'#e04040');
  for(const u of[.95,3.55]){T.ell(X(u),Y(.33),.36*m,.36*m,'#16161a');T.ell(X(u),Y(.33),.2*m,.2*m,'#9aa0a8');T.ell(X(u),Y(.33),.08*m,.08*m,'#4a4f57')}
  T.poly([[X(.1),base+2],[X(4.4),base+2],[X(4.2),base+5],[X(.3),base+5]],'rgba(0,0,0,.25)')}
function hdDesk(ctx,cx,fy,m,o={}){// 책상 1.6×0.75m, 깊이 0.7m(윗판 두께로 표현)
  const T=PX2(ctx),w=1.6*m,h=.75*m,top=fy-h,x=cx-w/2,dp=.18*m;
  T.poly([[x+dp*.6,top-dp],[x+w-dp*.6,top-dp],[x+w,top],[x,top]],'#8a5a33');T.R(x,top-dp,w,1,'#a87444');
  T.box(x,top,w,.06*m,'#6b4426');T.box(x+.04*m,top+.06*m,w-.08*m,h-.06*m,'#7a4e2c');
  T.box(x+w*.62,top+.12*m,w*.32,.2*m,'#86562f');T.box(x+w*.62,top+.34*m,w*.32,.2*m,'#86562f');T.R(x+w*.76,top+.21*m,w*.05,2,'#c8a050');T.R(x+w*.76,top+.43*m,w*.05,2,'#c8a050');
  if(o.monitor){const mx=cx-w*.18,mw=.5*m,mh=.32*m;T.box(mx-mw/2,top-dp*.5-mh-.12*m,mw,mh,'#2a2d34');T.R(mx-mw/2+3,top-dp*.5-mh-.12*m+3,mw-6,mh-6,'#5f8fb8');T.R(mx-mw/2+3,top-dp*.5-mh-.12*m+3,mw-6,(mh-6)*.3,'#8fb8d8');T.R(mx-3,top-dp*.5-.12*m,6,.12*m,'#3a3a44');T.R(mx-.12*m,top-dp*.5-3,.24*m,3,'#3a3a44')}
  if(o.files){for(let i=0;i<4;i++){const c=['#c0392b','#2f6be0','#e8a33a','#3a9e6a'][i];T.box(cx+w*.12+(i%2)*3,top-dp*.5-(i+1)*.045*m,.34*m,.045*m,c)}}}
function hdChair(ctx,cx,fy,m,col='#3a3a44'){const T=PX2(ctx);T.box(cx-.25*m,fy-1.15*m,.5*m,.6*m,col);T.box(cx-.27*m,fy-.5*m,.54*m,.08*m,shade(col,1.1));T.R(cx-.03*m,fy-.42*m,.06*m,.3*m,'#22222a');T.R(cx-.25*m,fy-.12*m,.5*m,.04*m,'#22222a')}
function hdCase(ctx,cx,fy,m){// 돈가방 0.46×0.34m, 열린 상태
  const T=PX2(ctx),w=.46*m,h=.14*m,x=cx-w/2;T.poly([[x,fy-h],[x+w,fy-h],[x+w-.04*m,fy-h-.34*m],[x+.04*m,fy-h-.34*m]],'#3a2a20');T.R(x+.03*m,fy-h-.3*m,w-.06*m,.25*m,'#5a4030');
  T.box(x,fy-h,w,h,'#4a3426');for(let i=0;i<5;i++){T.box(x+.03*m+i*.08*m,fy-h-.05*m,.075*m,.06*m,'#62ad5a');T.R(x+.05*m+i*.08*m,fy-h-.04*m,.025*m,.04*m,'#f4f0e0')}T.R(cx-.04*m,fy-h+.03*m,.08*m,.03*m,'#c8a050')}
function hdPlant(ctx,cx,fy,m){const T=PX2(ctx);T.box(cx-.2*m,fy-.4*m,.4*m,.4*m,'#b8643a');T.R(cx-.22*m,fy-.4*m,.44*m,.05*m,'#9a4e2a');
  for(const[dx,dy,r]of[[-.18,-.75,.2],[.16,-.8,.22],[0,-1.0,.24],[-.1,-.55,.18],[.2,-.56,.16],[0,-.72,.2]])T.ell(cx+dx*m,fy+dy*m,r*m,r*m*.9,'#2f7a46');
  for(const[dx,dy,r]of[[-.2,-.8,.08],[.1,-1.06,.09],[.14,-.84,.07]])T.ell(cx+dx*m,fy+dy*m,r*m,r*m*.8,'#52a868')}
function hdLamp(ctx,x,fy,m){const T=PX2(ctx);T.box(x-.06*m,fy-5*m,.12*m,5*m,'#4a4f57');T.box(x-.06*m,fy-5*m,.9*m,.1*m,'#4a4f57');T.box(x+.6*m,fy-4.95*m,.4*m,.14*m,'#3a3f48');T.R(x+.64*m,fy-4.82*m,.32*m,.04*m,'#fff2b8');T.box(x-.12*m,fy-.25*m,.24*m,.25*m,'#3a3f48')}
function hdTree(ctx,x,fy,m){const T=PX2(ctx);T.box(x-.12*m,fy-2.6*m,.24*m,2.6*m,'#6b4426');T.R(x-.06*m,fy-2.6*m,.05*m,2.6*m,'#8a5a33');
  for(const[dx,dy,r]of[[-.7,-3.2,.8],[.7,-3.3,.85],[0,-3.9,1],[-.3,-2.8,.7],[.4,-2.75,.7]])T.ell(x+dx*m,fy+dy*m,r*m,r*m*.85,'#2f7a46');
  for(const[dx,dy,r]of[[-.5,-3.5,.35],[.2,-4.3,.4],[.6,-3.5,.3]])T.ell(x+dx*m,fy+dy*m,r*m,r*m*.8,'#4f9e62');T.box(x-.5*m,fy-.05*m,1*m,.08*m,'#5a5a64')}

/* ── 배경 ── */
const BGHD={
  street:{hz:236,draw(ctx){const T=PX2(ctx),{R,box,poly}=T;
    for(let i=0;i<6;i++)R(0,i*30,1024,30,['#7cc0f0','#86c6f2','#92ccf3','#9ed2f4','#aad8f5','#b6ddf6'][i]);
    for(const[x,y,w]of[[90,40,120],[640,24,160],[880,70,90]]){T.ell(x,y,w*.5,14,'#ffffff');T.ell(x-w*.25,y+6,w*.3,11,'#ffffff');T.ell(x+w*.3,y+5,w*.28,10,'#eef6fb');R(x-w*.5,y+12,w,3,'#dde9f2')}
    // 길 건너 건물(거리 약 25m)
    const bs=[[0,150,'#c8775a'],[150,200,'#e8dcc4'],[350,170,'#8aa0b8'],[520,210,'#6fa58a'],[730,160,'#e6c27a'],[890,134,'#b98ab0']];
    bs.forEach(([x,w,c],i)=>{const top=70+(i*37%60);box(x,top,w,326-top,c);for(let y=top+18;y<258;y+=34)for(let xx=x+14;xx<x+w-24;xx+=30){box(xx,y,18,22,'#4a6a88',{e:shade(c,.45)});R(xx+2,y+2,6,18,'#7fa6c8');R(xx+1,y+21,16,2,shade(c,1.2))}
      const sc=['#c0392b','#2f6be0','#3a9e6a','#e8a33a','#7a6bd1','#d95f5f'][i];box(x+6,266,w-12,20,sc);R(x+16,272,w*.4,8,'#ffffff');
      for(let k=0;k<w-12;k+=12)R(x+6+k,288,6,8,k%24?'#ffffff':sc);box(x+10,298,w*.5,28,'#5a7a96');R(x+12,300,w*.5-4,6,'#a8c8e0');box(x+w*.66,300,w*.22,26,'#6b4426')});
    R(0,326,1024,22,'#c9c4bc');for(let x=0;x<1024;x+=36)R(x,326,1,22,'#aaa49a');R(0,346,1024,4,'#8e8a84');
    // 차도
    R(0,350,1024,96,'#4a4c52');for(let x=10;x<1024;x+=110)R(x,396,60,4,'#e8e4d8');R(0,350,1024,2,'#3a3c42');
    // 이쪽 연석·인도
    R(0,446,1024,10,'#b8b2a8');R(0,446,1024,2,'#d8d2c8');R(0,456,1024,184,'#d9d2c4');
    for(let y=470,k=0;y<640;y+=(14+k*2.4),k++){R(0,Math.round(y),1024,1,'#c4bcae');const off=k%2?0:40;for(let x=off;x<1024;x+=80+k*6)R(x,Math.round(y),1,Math.round(14+k*2.4),'#c4bcae')}},
    props(sc){return[// [깊이 fy, 그리기]
      [420,ctx=>hdCar(ctx,PF?40:30,438,pxm(sc,420),'#c94040',true)],[421,ctx=>hdCar(ctx,PF?620:632,442,pxm(sc,424),'#e8e4d8',false)],
      [344,ctx=>hdLamp(ctx,120,344,pxm(sc,344))],[345,ctx=>hdLamp(ctx,860,344,pxm(sc,344))],
      [470,ctx=>hdTree(ctx,968,470,pxm(sc,470))],[468,ctx=>hdLamp(ctx,40,468,pxm(sc,468))]]},
    extras:[['cit2','walk',300,343,0],['cit','walkB',560,342,1],['old','idleQ',700,344,0],['aide','phone',470,344,1],['cit','talkQ',785,343,1,{st:'bob',h:'#3a2a20'}],['cit2','walk',210,476,1],['aide','phone',884,476,1]]},
  office:{hz:170,draw(ctx){const T=PX2(ctx),{R,box}=T;const m=pxm({hz:170},420);
    R(0,0,1024,150,'#efe9dc');for(const x of[180,520,860]){box(x-70,40,140,14,'#f8f8f2');R(x-64,54,128,3,'#fffbe0')}R(0,146,1024,4,'#c8bfac');R(0,150,1024,8,'#d8cfbc');R(0,158,1024,262,'#f4eedf');for(let x=0;x<1024;x+=4)R(x,158,1,262,(x/4)%2?'#f1eadb':'#f4eedf');
    // 걸레받이 겸 웨인스코트(높이 0.9m)
    const wy=420-.9*m;box(0,wy,1024,.9*m,'#9a6a40');for(let x=20;x<1024;x+=170)box(x,wy+10,150,.9*m-20,'#a87444');R(0,wy,1024,6,'#7a4e2c');
    // 창문 1.8×1.4m, 창턱 0.9m
    const wx=560,ww=1.9*m,wh=1.4*m,wt=wy-wh;box(wx-8,wt-8,ww+16,wh+16,'#f8f8f6');R(wx,wt,ww,wh,'#9fcbe8');for(let i=0;i<7;i++){const bx=wx+8+i*ww/7,bh=30+((i*53)%70);R(bx,wt+wh-bh,ww/7-6,bh,'#c4d6e4');for(let y=wt+wh-bh+6;y<wt+wh-4;y+=10)R(bx+4,y,ww/7-16,3,'#e8f0f6')}
    R(wx+ww/2-3,wt,6,wh,'#f8f8f6');R(wx,wt+wh/2-3,ww,6,'#f8f8f6');R(wx-12,wt+wh+8,ww+24,8,'#e8e4dc');
    // 책장 1.2×2.0m
    const bx=60,bw=1.2*m,bh=2.0*m,bt=420-bh;box(bx,bt,bw,bh,'#6b4426');for(let k=0;k<5;k++){const sy=bt+10+k*(bh-20)/5;R(bx+8,sy,bw-16,(bh-20)/5-6,'#3a2414');let x=bx+10;let i=k*7;while(x<bx+bw-18){const w=7+(i*5)%7,hh=(bh-20)/5-10-(i*3)%10,cc=['#c0392b','#2f6be0','#e8a33a','#3a9e6a','#7a6bd1','#2a4a7a','#8a2a2a'][i%7];R(x,sy+(bh-20)/5-6-hh,w,hh,cc);R(x+1,sy+(bh-20)/5-6-hh+4,w-2,2,'#f4f0e0');x+=w+1;i++}R(bx+6,sy+(bh-20)/5-6,bw-12,4,'#8a5a33')}
    // 시계·액자
    T.ell(420,200,26,26,'#3a3a44');T.ell(420,200,22,22,'#ffffff');R(419,184,2,17,'#222');R(420,199,12,2,'#222');
    box(300,210,70,52,'#c8a050');R(306,216,58,40,'#7aa66a');R(306,236,58,20,'#5a8a4a');
    // 바닥(나무, 원근)
    R(0,420,1024,220,'#c08a58');for(let k=0,y=420;y<640;k++,y+=8+k*2.2){R(0,Math.round(y),1024,1,'#a87444')}for(let i=-12;i<=12;i++){const x0=512+i*60,x1=512+i*150;T.poly([[x0,420],[x0+1,420],[x1+1,640],[x1,640]],'#b07a4a')}
    R(0,420,1024,3,'#7a4e2c')},
    props(sc){return[[470,ctx=>{hdChair(ctx,820,452,pxm(sc,452));hdDesk(ctx,820,470,pxm(sc,470),{monitor:1,files:1})}],[440,ctx=>hdPlant(ctx,236,440,pxm(sc,440))]]},
    extras:[['aide','paper',982,462,1]]},
  court:{hz:200,draw(ctx){const T=PX2(ctx),{R,box}=T;
    R(0,0,1024,440,'#7a4e2c');for(let x=0;x<1024;x+=128){box(x+8,16,112,180,'#8a5a33');box(x+8,206,112,214,'#8a5a33');R(x+20,28,88,156,'#7a4e2c');R(x+20,218,88,190,'#7a4e2c')}
    R(508,30,8,74,'#c8a050');R(436,50,152,6,'#c8a050');T.ell(512,30,9,9,'#e8c060');for(const x of[444,580]){R(x-1,56,2,26,'#c8a050');T.ell(x,86,28,7,'#c8a050');R(x-28,82,56,4,'#e8c060')}R(484,100,56,8,'#c8a050');
    for(const x of[340,512,684]){box(x-32,186,64,130,'#6a1a22');R(x-26,192,52,8,'#8a2a32')}
    R(0,440,1024,200,'#8a5a33');for(let k=0,y=440;y<640;k++,y+=10+k*2.6)R(0,Math.round(y),1024,2,'#6b4426');R(0,440,1024,4,'#4a2c18')},
    props(sc){const BF=476,m=pxm(sc,BF),top=BF-1.45*m;return[
      [BF,ctx=>{const T=PX2(ctx),w=7.4*m,x=512-w/2;T.poly([[x+14,top-.2*m],[x+w-14,top-.2*m],[x+w,top],[x,top]],'#8a5a33');T.R(x,top-.2*m,w,2,'#a87444');
        T.box(x,top,w,1.45*m,'#6b4426');for(let i=0;i<7;i++)T.box(x+14+i*(w-28)/7,top+16,(w-28)/7-12,1.45*m-32,'#7a4e2c');T.box(x-6,top-6,w+12,10,'#5a3a20');
        T.box(496,top+34,32,32,'#c8a050');T.R(502,top+40,20,20,'#e8c060');
        const gy=top-.2*m*.5;T.box(612,gy-.05*m,.26*m,.05*m,'#5a3a20');T.box(618,gy-.15*m,.16*m,.1*m,'#7a5230');T.box(626,gy-.34*m,.04*m,.2*m,'#6b4426')}],
      [530,ctx=>{const mm=pxm(sc,530);hdDesk(ctx,150,530,mm,{files:1});hdDesk(ctx,874,530,mm,{files:1})}]]},
    extras:[['judge','judge',512,452,0,{lift:.45}],['rep','idleQ',150,512,0],['aide','talkQ',876,512,1]]},
};

/* 장면: ppl = [[종류, 자세, x, 발 y, 왼쪽 보기, 표정/외모]] */
function sceneHD(cv,bg,ppl,more){ZZ=cv.width/1024;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;const sc=BGHD[bg];sc.draw(ctx);
  const items=[];(sc.props?sc.props(sc):[]).forEach(([fy,fn])=>items.push({fy,fn}));
  const add=([k,pose,x,fy,flip,o],extra)=>items.push({fy,fn:c=>{const K=kAt(sc,fy);const col=Object.assign({},whoCol(k),(o&&o.look)||{});if(o&&o.face)col.face=o.face;
    if(o&&(o.st||o.h)){col.st=o.st||col.st;col.h=o.h||col.h}
    const T=PX2(c),rx=13*K,ry=2.2*K,ly=o&&o.lift?o.lift*pxm(sc,fy):0;const sx=x+((HPOSE[pose]||{}).d==='s'?(flip?-2:2)*K:0);if(!ly)T.ell(sx,fy+1.6*K,rx,ry,'rgba(30,20,20,.22)');
    personH(c,x*ZZ,(fy-ly)*ZZ,K*ZZ,col,pose,!!flip)}});
  (more||[]).forEach(([fy,fn])=>items.push({fy,fn:c=>fn(c,sc)}));(sc.extras||[]).forEach(e=>add(e,1));ppl.forEach(p=>add(p));
  items.sort((a,b)=>a.fy-b.fy).forEach(it=>it.fn(ctx))}
