// 고해상도 도트 인물 시안 (2배 밀도 + 크기 가변)
// 모양은 '단위 좌표'(옛 512 격자 1칸 = 1단위, 몸 중심 x=18, 머리 꼭대기 y≈-14, 발바닥 y≈66)로 정의하고
// 배율 K(단위당 픽셀)로 래스터화한다. 바깥 외곽선·레이어 경계선은 픽셀 단위로 자동.
function HDR(K,flip){
  const U0x=-26,U0y=-36,UW=88,UH=112,GW=Math.ceil(UW*K),GH=Math.ceil(UH*K);
  const col=new Array(GW*GH).fill(null),lay=new Int16Array(GW*GH),nol=new Uint8Array(GW*GH);let L=0,NL=0;
  const LX=-.62,LY=-.78;
  const each=(x0,y0,x1,y1,fn)=>{let i0,i1;if(!flip){i0=Math.floor((x0-U0x)*K)-1;i1=Math.ceil((x1-U0x)*K)+1}else{i0=Math.floor((36-x1-U0x)*K)-1;i1=Math.ceil((36-x0-U0x)*K)+1}
    const j0=Math.max(0,Math.floor((y0-U0y)*K)-1),j1=Math.min(GH-1,Math.ceil((y1-U0y)*K)+1);
    for(let j=j0;j<=j1;j++)for(let i=Math.max(0,i0);i<=Math.min(GW-1,i1);i++){let ux=(i+.5)/K+U0x;if(flip)ux=36-ux;const uy=(j+.5)/K+U0y;const c=fn(ux,uy);if(c){const q=j*GW+i;col[q]=c;lay[q]=L;nol[q]=NL}}};
  const band=(dt,o)=>{if(o.flat)return 1;const f=dt>.62?1.24:dt>.22?1.08:dt>-.28?1:dt>-.66?.8:.64;return f*(o.f||1)};
  const lit=(nx,ny)=>(flip?-nx:nx)*LX+ny*LY;
  const TT=[[.1,1.3],[.26,1.1],[.62,1],[.84,.8],[1,.64]];
  const tone=(fr,o)=>{if(o.flat)return o.f||1;if(flip)fr=1-fr;for(const[l,m]of(o.tones||TT))if(fr<=l)return m*(o.f||1);return 1};
  const api={K,
    part(){L++;NL=0},feat(){L++;NL=1},
    cap(ax,ay,bx,by,ra,rb,c,o={}){if(o.flat){ra=Math.max(ra,.55/K);rb=Math.max(rb,.55/K)}const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||.001,ux=dx/len,uy=dy/len,R=Math.max(ra,rb);
      each(Math.min(ax,bx)-R,Math.min(ay,by)-R,Math.max(ax,bx)+R,Math.max(ay,by)+R,(x,y)=>{const vx=x-ax,vy=y-ay;let al=vx*ux+vy*uy;al=Math.max(0,Math.min(len,al));const qx=vx-ux*al,qy=vy-uy*al,d=Math.hypot(qx,qy),r=ra+(rb-ra)*al/len;if(d>r)return null;
        return shade(c,band(d<.05?0:lit(qx/d,qy/d)*Math.min(1,d/r*1.3),o))})},
    ell(cx,cy,rx,ry,c,o={}){rx=Math.max(rx,.55/K);ry=Math.max(ry,.55/K);each(cx-rx,cy-ry,cx+rx,cy+ry,(x,y)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry,d=nx*nx+ny*ny;if(d>1)return null;if(o.clip&&!o.clip(x,y))return null;return shade(c,band(lit(nx,ny)*Math.min(1,Math.sqrt(d)*1.2),o))})},
    poly(pts,c,o={}){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
      each(x0,y0,x1,y1,(x,y)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)ins=!ins}
        if(!ins)return null;if(o.clip&&!o.clip(x,y))return null;return shade(c,tone((x-x0)/(x1-x0||1),o))})},
    rect(x,y,w,h,c,o={}){each(x,y,x+w,y+h,(px,py)=>px>=x&&px<x+w&&py>=y&&py<y+h?shade(c,o.f||1):null)},
    line(ax,ay,bx,by,w,c){api.cap(ax,ay,bx,by,w/2,w/2,c,{flat:1})},
    // 몸통: 목(n)→엉덩이(h) 축, 왼쪽 폭 wl(t)·오른쪽 폭 wr(t). at(t,s): s>0 이 화면 오른쪽(로컬)
    trunk(nx,ny,hx,hy,wl,wr,c,o={}){const dx=hx-nx,dy=hy-ny,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
      each(Math.min(nx,hx)-16,Math.min(ny,hy)-2,Math.max(nx,hx)+16,Math.max(ny,hy)+2,(x,y)=>{const vx=x-nx,vy=y-ny,al=vx*ux+vy*uy;if(al<0||al>len)return null;const t=al/len,sr=vx*uy-vy*ux,a=wl(t),b=wr(t);if(sr<-a||sr>b)return null;
        return shade(c,tone((sr+a)/(a+b||1),o))});return(t,s)=>[nx+dx*t+uy*s,ny+dy*t-ux*s]},
    flush(ctx,X,Y){const out=col.slice();
      for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;
        if(!col[i]){let nb=null;if(x>0&&col[i-1])nb=col[i-1];else if(x<GW-1&&col[i+1])nb=col[i+1];else if(y>0&&col[i-GW])nb=col[i-GW];else if(y<GH-1&&col[i+GW])nb=col[i+GW];if(nb)out[i]=shade(nb,.28)}
        else if(!nol[i]){const l=lay[i];const chk=j=>col[j]&&!nol[j]&&lay[j]>l;if((x>0&&chk(i-1))||(x<GW-1&&chk(i+1))||(y>0&&chk(i-GW))||(y<GH-1&&chk(i+GW)))out[i]=shade(col[i],.5)}}
      const ox=Math.round(X+U0x*K),oy=Math.round(Y+U0y*K);
      for(let y=0;y<GH;y++){let x=0;while(x<GW){const cl=out[y*GW+x];if(!cl){x++;continue}let n=1;while(x+n<GW&&out[y*GW+x+n]===cl)n++;ctx.fillStyle=cl;ctx.fillRect(ox+x,oy+y,n,1);x+=n}}}};
  return api}

const lerpA=arr=>t=>{const k=Math.max(0,Math.min(1,t))*(arr.length-1),i=Math.min(arr.length-2,Math.floor(k)),f=k-i;return arr[i]+(arr[i+1]-arr[i])*f};

/* 자세: 팔 [팔꿈치, 손](어깨 기준), 다리 [무릎, 발](엉덩이 기준). A=화면 왼쪽(3/4·측면에선 가까운 쪽) */
const HPOSE={
  stand:  {d:'f',A:[[-1,12],[-1,25]],B:[[1,12],[2,25]],lA:[[-1,18],[-1,36]],lB:[[1,18],[1,36]]},
  rest:   {d:'f',A:[[-2,12],[-1,25]],B:[[2,11],[1,23]],lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]],hip:[1,0],lean:-1},
  hips:   {d:'f',A:[[-7,8],[-3,19]],B:[[7,8],[3,19]],lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],hA:'fist',hB:'fist'},
  talkF:  {d:'f',A:[[-2,12],[-1,25]],B:[[6,10],[5,-1]],hB:'palm',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'talk'},
  idleQ:  {d:'q',A:[[-1,12],[0,25]],B:[[1,12],[2,24]],lA:[[0,18],[-1,36]],lB:[[2,18],[4,36]]},
  talkQ:  {d:'q',A:[[-1,12],[0,25]],B:[[5,9],[13,4]],hB:'palm',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],face:'talk'},
  point:  {d:'q',A:[[-2,11],[-1,24]],B:[[8,4],[18,0]],hB:'point',lA:[[-1,18],[-4,36]],lB:[[3,18],[7,36]],lean:2,face:'talk'},
  cross:  {d:'q',A:[[1,10],[10,10]],B:[[-1,10],[-8,11]],aFront:2,hA:'fist',hB:'fist',lA:[[-1,18],[-3,36]],lB:[[2,18],[3,36]],lean:-1},
  fistUp: {d:'f',A:[[-2,12],[-1,25]],B:[[4,-8],[3,-21]],hB:'fist',lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],face:'talk'},
  wave:   {d:'q',A:[[-1,12],[0,25]],B:[[7,-3],[7,-15]],hB:'palm',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]]},
  shake:  {d:'q',A:[[-1,12],[0,25]],B:[[4,11],[13,14]],hB:'open',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],lean:2},
  bow:    {d:'s',A:[[3,12],[4,24]],B:[[3,12],[5,24]],lA:[[1,18],[0,36]],lB:[[2,18],[2,36]],lean:9,face:'down'},
  mic:    {d:'q',A:[[-1,12],[0,25]],B:[[5,8],[3,-4]],hB:'mic',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],face:'talk'},
  paper:  {d:'f',A:[[2,11],[7,17]],B:[[-2,11],[-6,17]],aFront:1,hA:'paper',hB:'open',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'down2'},
  phone:  {d:'q',A:[[-1,12],[0,25]],B:[[5,7],[3,-9]],hB:'phone',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]]},
  think:  {d:'q',A:[[2,11],[10,12]],B:[[4,10],[3,-2]],aFront:2,hB:'fist',lA:[[0,18],[-1,36]],lB:[[2,18],[3,36]]},
  despair:{d:'f',A:[[-8,-2],[-3,-13]],B:[[8,-2],[3,-13]],aFront:1,lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],face:'sad'},
  walk:   {d:'s',A:[[-4,11],[-6,22]],B:[[4,11],[8,21]],lA:[[4,17],[7,35]],lB:[[-2,17],[-6,33]],walk:1},
  walkB:  {d:'s',A:[[3,11],[5,23]],B:[[-4,11],[-7,21]],hA:'bag',lA:[[-2,17],[-6,33]],lB:[[4,17],[7,35]],walk:1},
  give:   {d:'q',A:[[-1,12],[0,25]],B:[[5,10],[13,10]],hB:'env',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],lean:3,face:'smile'},
  camera: {d:'q',A:[[5,9],[8,-3]],B:[[6,8],[11,-4]],aFront:2,hB:'cam',lA:[[-1,18],[-3,36]],lB:[[3,18],[6,36]]},
  sign:   {d:'f',A:[[-5,4],[-3,-10]],B:[[5,4],[3,-10]],aFront:1,hA:'fist',hB:'sign',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'talk'},
  cheerQ: {d:'q',A:[[-1,12],[0,25]],B:[[5,-6],[7,-18]],hB:'fist',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]],face:'talk'},
  clasp:  {d:'q',A:[[1,12],[8,21]],B:[[0,11],[-4,21]],aFront:2,hA:'open',hB:'fist',lA:[[0,18],[-1,36]],lB:[[2,18],[3,36]],face:'down2'},
  umb:    {d:'q',A:[[-1,12],[0,25]],B:[[4,9],[7,3]],hB:'umb',lA:[[0,18],[-1,36]],lB:[[2,18],[4,36]]},
  toast:  {d:'q',A:[[-1,12],[0,25]],B:[[5,5],[9,-5]],hB:'glass',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]],face:'smile'},
  memo:   {d:'q',A:[[3,10],[9,11]],B:[[5,10],[10,8]],aFront:2,hA:'note',hB:'pen',lA:[[0,18],[-1,36]],lB:[[2,18],[3,36]]},
  shock:  {d:'f',A:[[-7,6],[-7,-5]],B:[[7,6],[7,-5]],hA:'palm',hB:'palm',lA:[[-1,18],[-4,36]],lB:[[1,18],[3,36]],lean:-1,face:'shock'},
  holdBag:{d:'q',A:[[-1,12],[-1,25]],B:[[1,12],[2,24]],hA:'bag',lA:[[0,18],[-1,36]],lB:[[2,18],[4,36]]},
  clap:   {d:'q',A:[[3,10],[10,6]],B:[[5,9],[11,5]],aFront:2,hA:'open',hB:'open',lA:[[0,18],[-1,36]],lB:[[2,18],[3,36]],face:'smile'},
  judge:  {d:'f',A:[[-3,11],[2,20]],B:[[3,11],[-2,20]],aFront:1,lA:[[-1,18],[-1,36]],lB:[[1,18],[1,36]]},
};

function personH(ctx,cx,fy,K,c,pose,flip){
  const P0=HPOSE[pose]||HPOSE.stand,d=P0.d,G=HDR(K,!!flip),{part,feat,cap,ell,poly,rect,line,trunk}=G;
  const s=c.s||'#f1c7a0',S2=shade(s,.84),S3=shade(s,.7),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421';
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,AC=ROBE?'#24242c':P,W=c.w||'#f4f4f4';
  let face=c.face||'';if(!face&&P0.face&&P0.face!=='talk')face=P0.face;const talk=!!(c.talk||P0.face==='talk');
  const sw=FEM?8.4:10,wa=FEM?5.6:6.6,hp=FEM?7.6:7;
  const hipC=[18+(P0.hip?P0.hip[0]:0),25+(P0.hip?P0.hip[1]:0)],lean=P0.lean||0,nk=[18+lean,2+Math.abs(lean)*.35];
  const front=[sw-4,sw-.6,sw,sw,sw-.6,sw-1.6,wa+1,wa,wa,wa+.5,hp];let wl,wr;
  if(d==='f'){wl=lerpA(front);wr=wl}
  else if(d==='q'){wl=lerpA(front.map(v=>v*.9));wr=lerpA(front.map((v,i)=>v*.74+(i>0&&i<4?.6:0)))}
  else{wl=lerpA([3,4.6,5,5,4.6,4.2,4,4,4,4.4,5]);wr=lerpA([3,5.4,6.4,6.4,6,5,4.6,4.6,4.6,4.6,4.6])}
  const tAt=(t,s2)=>{const dx=hipC[0]-nk[0],dy=hipC[1]-nk[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;return[nk[0]+dx*t+uy*s2,nk[1]+dy*t-ux*s2]};
  const shA=d==='f'?tAt(.13,-(sw-2.4)):d==='q'?tAt(.13,-(sw*.9-2.2)):tAt(.14,-.5);
  const shB=d==='f'?tAt(.13,sw-2.4):d==='q'?tAt(.12,sw*.74-1.6):tAt(.14,1);
  const hpA=d==='f'?[hipC[0]-3.4,hipC[1]+1]:d==='q'?[hipC[0]-2.6,hipC[1]+1]:[hipC[0]-.5,hipC[1]+1];
  const hpB=d==='f'?[hipC[0]+3.4,hipC[1]+1]:d==='q'?[hipC[0]+2.4,hipC[1]+.5]:[hipC[0]+.5,hipC[1]+1];
  const J=(o,r)=>[o[0]+r[0],o[1]+r[1]];
  const HX=nk[0]-18+(d==='q'?1:d==='s'?2:0),HY=nk[1]-2+(P0.face==='down'?3:0);
  const leg=(hp0,Lg,far)=>{const kn=J(hp0,Lg[0]),ft=J(hp0,Lg[1]);const f=far&&d!=='f'?.88:1;
    part();if(c.sk){cap(...hp0,...kn,2.5,2.1,s,{f});cap(...kn,...ft,2.1,1.6,s,{f})}else{cap(...hp0,...kn,3.8,3.2,L0,{f});cap(...kn,...ft,3.2,2.7,L0,{f});
      feat();const cx2=d==='f'?.6:1.6;line(hp0[0]+cx2,hp0[1]+3,kn[0]+cx2*.8,kn[1],.45,shade(L0,.72));line(kn[0]+cx2*.8,kn[1],ft[0]+cx2*.6,ft[1]-1,.4,shade(L0,.72))}
    part();const sh='#2c201a',[fx,fyy]=ft;
    if(d==='f')poly([[fx-2.6,fyy],[fx+2.6,fyy],[fx+3.2,fyy+2.4],[fx+2.8,fyy+3.4],[fx-2.8,fyy+3.4],[fx-3.2,fyy+2.4]],sh,{f});
    else poly([[fx-2.6,fyy-.4],[fx+2,fyy-.4],[fx+5.4,fyy+1.6],[fx+5.6,fyy+3.4],[fx-2.8,fyy+3.4],[fx-3,fyy+1.4]],sh,{f});
    feat();rect(fx-(d==='f'?1.8:1.2),fyy+.6,d==='f'?1.6:3,.6,shade(sh,2.8));rect(fx-3,fyy+2.8,d==='f'?6:8.4,.6,'#120c0a')};
  const handDraw=(hn,ux,uy,hand)=>{const[x,y]=hn,fx=x+ux*.8,fy2=y+uy*.8;
    if(hand==='point'){ell(fx,fy2,1.9,1.8,s);feat();cap(fx+ux*1.4,fy2+uy*1.4-.4,fx+ux*5,fy2+uy*5-.5,.65,.55,s);line(fx-.8,fy2+.6,fx+.6,fy2+.8,.3,S3);part()}
    else if(hand==='fist'){ell(fx,fy2,2.05,1.95,s);feat();for(let k=-1;k<=1;k++)line(fx-1+k*.2,fy2+k*.7,fx+.6+k*.2,fy2+k*.7,.28,S3);part()}
    else if(hand==='palm'){ell(fx,fy2-.4,1.8,2,s);for(let k=0;k<4;k++)cap(fx-1.3+k*.85,fy2-1.8,fx-1.5+k*.95,fy2-3.6+Math.abs(k-1.5)*.4,.42,.38,s);cap(fx-1.6,fy2,fx-3,fy2-1.4,.5,.42,s)}
    else{ell(fx,fy2,1.85,1.9,s);feat();cap(fx-1.4,fy2-.4,fx-2.4,fy2+.8,.5,.45,s);part()}
    if(hand==='mic'){part();cap(x,y-.6,x+2.2,y-5,1,1.15,'#2a2d34');ell(x+2.8,y-6.6,2,2,'#9aa3ad');feat();for(let k=-1;k<=1;k++)line(x+1.4,y-6.6+k*.7,x+4.2,y-6.6+k*.7,.22,'#5a626c');part();ell(x,y,1.9,1.9,s)}
    if(hand==='phone'){part();rect(x-1.4,y-4.4,2.8,5.6,'#22252b');feat();rect(x-.9,y-3.8,1.8,4.2,'#6fa8dc');part();ell(x-.3,y+.6,1.8,1.8,s)}
    if(hand==='paper'){part();poly([[x-1,y-6],[x+11,y-6.6],[x+11.4,y+1.6],[x-.6,y+2]],'#f6f4ec',{flat:1});feat();for(let i=0;i<4;i++)line(x+1.4,y-4+i*1.6,x+(i===3?6:9.6),y-4.1+i*1.6,.35,'#a8aeb6');part();ell(x,y,1.8,1.8,s)}
    if(hand==='env'){part();poly([[x+1,y-3],[x+9,y-3.4],[x+9.2,y+2],[x+1.2,y+2.2]],'#e9d9a8',{flat:1});feat();line(x+1.2,y-2.9,x+5,y,.32,'#b89a50');line(x+5,y,x+9,y-3.3,.32,'#b89a50');part();ell(x,y,1.8,1.8,s)}
    if(hand==='cam'){part();rect(x-6,y-4,9,6,'#2a2d34');rect(x-5,y-5.4,3,1.4,'#2a2d34');feat();ell(x-1.6,y-1,2.1,2.1,'#3a4a5a');ell(x-2,y-1.4,.8,.8,'#9fd0ee');rect(x+1.4,y-3.4,1,.8,'#e8eef2');part()}
    if(hand==='sign'){part();rect(x-.5,y-14,1,16,'#8a5a33');rect(x-9,y-24,18,11,'#fbfbf6');feat();rect(x-6.5,y-21,13,2.4,'#c2321f');rect(x-5,y-17.4,10,1.4,'#3a3a44');part();ell(x,y,1.9,1.9,s)}
    if(hand==='umb'){part();line(x,y+1,x+.4,y-21,.45,'#3a3a44');poly([[x-15,y-18],[x-11,y-23],[x-4,y-26],[x+5,y-26],[x+12,y-23],[x+16,y-18]],'#c8283a');feat();for(const dx of[-8,0,8])line(x+dx*.3,y-26,x+dx,y-18.4,.35,'#a01a2a');cap(x-15,y-18,x+16,y-18,.5,.5,'#7a1020',{flat:1});part();ell(x,y,1.9,1.9,s)}
    if(hand==='glass'){part();poly([[x-1.4,y-6],[x+1.8,y-6],[x+1.5,y-1],[x-1.1,y-1]],'#e8f0f4',{flat:1});feat();rect(x-1.2,y-4.6,2.8,3.4,'#f2c860');rect(x-1.2,y-5.6,2.8,1,'#fff8e0');part();ell(x,y,1.8,1.8,s)}
    if(hand==='note'){part();rect(x-.8,y-5,5.6,7,'#f6f4ec');feat();rect(x-.8,y-5,5.6,.8,'#c2321f');for(let i=0;i<3;i++)line(x+.2,y-3+i*1.6,x+4,y-3+i*1.6,.25,'#a8aeb6');part();ell(x,y,1.8,1.8,s)}
    if(hand==='pen'){part();line(x-1,y+1,x-3,y-4,.35,'#22252b');ell(x,y,1.8,1.8,s)}
    if(hand==='bag'){part();line(x,y,x-1.4,y+3,.4,'#3a2a20');line(x,y,x+1.4,y+3,.4,'#3a2a20');poly([[x-3.6,y+3],[x+3.6,y+3],[x+4.2,y+9],[x-4.2,y+9]],'#7a4a2a');part();ell(x,y,1.8,1.8,s)}};
  const arm=(sh0,A,hand,fr)=>{const el=J(sh0,A[0]),hn=J(sh0,A[1]),k=fr?{f:.9}:{};part();
    if(ROBE){cap(...sh0,...el,2.7,2.6,AC,k);cap(...el,...hn,2.6,3.1,AC,k)}else{cap(...sh0,...el,2.3,2.05,AC,k);cap(...el,...hn,2.05,1.85,AC,k);
      feat();const mx=(sh0[0]+el[0])/2,my=(sh0[1]+el[1])/2;line(mx,my,el[0],el[1],.35,shade(AC,.7))}
    const ux=hn[0]-el[0],uy=hn[1]-el[1],ln=Math.hypot(ux,uy)||1;
    if(!ROBE){part();cap(hn[0]-ux/ln*1.9,hn[1]-uy/ln*1.9,hn[0]-ux/ln*.6,hn[1]-uy/ln*.6,1.75,1.7,W,{f:1})}
    part();handDraw(ROBE?[hn[0]+ux/ln*1.2,hn[1]+uy/ln*1.2]:hn,ux/ln,uy/ln,hand)};
  const hA=P0.hA||'open',hB=P0.hB||'open';
  // 순서: 뒷머리 → 뒤 다리·팔 → 몸통(치마/법복) → 앞 다리·팔 → 목 → 머리
  part();backHairH(G,c,d,HX,HY,st,h);
  if(!ROBE){if(d!=='f'){leg(hpB,P0.lB,1);leg(hpA,P0.lA,0)}else{leg(hpA,P0.lA);leg(hpB,P0.lB)}}
  else{const fA=J(hpA,P0.lA[1]),fB=J(hpB,P0.lB[1]);part();const sh='#2c201a';for(const f of[fB,fA])poly([[f[0]-2.4,f[1]+.2],[f[0]+(d==='f'?2.4:4.8),f[1]+.2],[f[0]+(d==='f'?2.8:5),f[1]+3.4],[f[0]-2.6,f[1]+3.4]],sh)}
  if(!P0.aFront){if(d==='f'){arm(shA,P0.A,hA);arm(shB,P0.B,hB)}else arm(shB,P0.B,hB)}else if(d!=='f'&&P0.aFront!==2)arm(shB,P0.B,hB);
  part();
  let at;
  if(ROBE){// 법복: 어깨에서 발목까지 퍼지는 가운, 앞여밈과 세로 주름, 흰 옷깃
    const len=64-nk[1];const wlr=t=>t<.1?sw-4+t*40:Math.min(13.5,sw+(t-.1)*5.2);
    at=trunk(nk[0],nk[1],18,64,d==='f'?wlr:t=>wlr(t)*(d==='q'?.9:.62),d==='f'?wlr:t=>wlr(t)*(d==='q'?.78:.7),'#26262e');
    feat();for(const s2 of(d==='f'?[-7,-3.6,3.6,7]:[-5,-1.5,3]))for(let k=0;k<3;k++){const a=at(.38+k*.2,s2+(k%2?.3:-.3)),b=at(.54+k*.2,s2+(k%2?-.3:.3));line(a[0],a[1],b[0],b[1],.4,'#18181e')}
    {const fc=d==='f'?0:d==='q'?2.4:4;const a=at(.12,fc),b=at(1,fc);line(a[0],a[1],b[0],b[1],.45,'#141418');
      const n0=at(0,fc-2.6),n1=at(0,fc+2.6),n2=at(.11,fc);poly([n0,n1,[n2[0],n2[1]]],'#f4f4f4',{flat:1});
      const y1=at(.05,fc-4.2),y2=at(.05,fc+4.2),y3=at(.13,fc+3.4),y4=at(.13,fc-3.4);poly([y1,y2,y3,y4],'#3a2a52',{f:1})}}
  else at=trunk(nk[0],nk[1],hipC[0],hipC[1]+3.5,wl,wr,P);
  feat();
  const fc=d==='f'?0:d==='q'?2.2:4.4;
  if(!ROBE){
    if(c.hood){const a=at(.02,fc);ell(a[0],a[1]+1,5.5,2.2,shade(P,.8));const b=at(.1,fc-1.6),b2=at(.1,fc+1.6);line(b[0],b[1],b[0]-.3,b[1]+6,.45,'#f4f4f4');line(b2[0],b2[1],b2[0]+.3,b2[1]+6,.45,'#f4f4f4');
      const q1=at(.62,fc-4),q2=at(.62,fc+4),q3=at(.86,fc+5),q4=at(.86,fc-5);poly([q1,q2,q3,q4],shade(P,.88));}
    else{// 셔츠 V·옷깃·넥타이·라펠
      const v0=at(0,fc-(d==='s'?1.2:2.6)),v1=at(0,fc+(d==='s'?1.4:2.6)),v2=at(.44,fc);poly([v0,v1,v2],W,{flat:1});
      const c0=at(0,fc-2.8),c1=at(.09,fc-1.2),c2=at(.03,fc-3.6);if(d!=='s')poly([c0,c1,c2],W,{f:1.02});const e0=at(0,fc+2.8),e1=at(.09,fc+1.2),e2=at(.03,fc+3.6);poly([e0,e1,e2],W,{f:.92});
      if(c.t){const k0=at(.05,fc-.9),k1=at(.05,fc+.9),k2=at(.11,fc+.7),k3=at(.11,fc-.7);poly([k0,k1,k2,k3],shade(c.t,.8));
        const b0=at(.11,fc-.7),b1=at(.11,fc+.7),b2=at(.46,fc+(d==='s'?.8:1.2)),b3=at(.52,fc+(d==='s'?.2:0)),b4=at(.46,fc-(d==='s'?.4:1.2));poly([b0,b1,b2,b3,b4],c.t);
        const s0=at(.18,fc+.2),s1=at(.42,fc+.6);line(s0[0],s0[1],s1[0],s1[1],.3,shade(c.t,.72))}
      const la=at(0,fc-3.2),lb=at(.46,fc-.6),lc=at(0,fc+3.2),ld=at(.46,fc+.6);line(la[0],la[1],lb[0],lb[1],.45,shade(P,.62));if(d!=='s')line(lc[0],lc[1],ld[0],ld[1],.45,shade(P,.5));
      const n1=at(.2,fc-4.4),n2=at(.24,fc-3.2);line(n1[0],n1[1],n2[0],n2[1],.4,shade(P,.62));
      for(const t of[.56,.74]){const b=at(t,fc+.3);ell(b[0],b[1],.55,.55,shade(P,.5),{flat:1})}
      if(d!=='s'){const p1=at(.66,-wl(.66)+1.6),p2=at(.66,-wl(.66)+4.6);line(p1[0],p1[1],p2[0],p2[1],.35,shade(P,.66))}
      const hm=at(.98,0);line(hm[0]-wl(1)+.6,hm[1],hm[0]+wr(1)-.6,hm[1],.4,shade(P,.6))}
    if(c.pin&&d!=='s'){const q=at(.2,d==='f'?-5.6:-4.4);ell(q[0],q[1],.9,.9,'#c8a13a');feat();ell(q[0]-.25,q[1]-.25,.3,.3,'#ffe48a',{flat:1})}
    if(c.steth){const q=at(.04,fc);cap(q[0]-4,q[1],q[0]-3.4,q[1]+9,.38,.38,'#3a3a44',{flat:1});cap(q[0]+4,q[1],q[0]+3.4,q[1]+9,.38,.38,'#3a3a44',{flat:1});cap(q[0]-3.4,q[1]+9,q[0]+1,q[1]+11,.38,.38,'#3a3a44',{flat:1});ell(q[0]+1.6,q[1]+11.2,1.2,1.2,'#b8c0c8')}
  }
  if(c.sk){part();// 치마: 몸통 축을 따라 허리에서 이어지게
    const sk=trunk(...at(.96,0),at(.96,0)[0]+(hipC[0]-nk[0])*.02,at(.96,0)[1]+13,t=>wl(1)+.4+t*2.4,t=>wr(1)+.4+t*(d==='s'?2.8:2.4),L0);
    feat();for(const s2 of(d==='f'?[-3,0,3]:[-1.5,1.8])){const a=sk(.25,s2),b=sk(1,s2*1.25);line(a[0],a[1],b[0],b[1],.35,shade(L0,.7))}
    const w0=at(.96,-wl(1)),w1=at(.96,wr(1));line(w0[0],w0[1],w1[0],w1[1],.5,shade(L0,.6))}
  if(d!=='f'&&!P0.aFront)arm(shA,P0.A,hA,1);
  if(P0.aFront){if(d==='f'||P0.aFront===2){arm(shB,P0.B,hB,1);arm(shA,P0.A,hA,1)}else arm(shA,P0.A,hA,1)}
  part();cap(nk[0]+(d==='s'?.6:0),nk[1]-3,nk[0]+(d==='s'?.6:0),nk[1]+.4,2.1,2.2,S3,{flat:1});
  headH(G,c,d,HX,HY,st,face,talk,FEM,P0.face);
  G.flush(ctx,cx-18*K,fy-66*K)}

function backHairH(G,c,d,dx,dy,st,h){const{ell,poly}=G,cx=18+dx+(d==='q'?-1:d==='s'?-2.4:0),y=dy;
  if(st==='long'){poly([[cx-6.4,-11+y],[cx+6.4,-11+y],[cx+7.2,2+y],[cx+6.4,10+y],[cx+2,12+y],[cx-2,12+y],[cx-6.6,10+y],[cx-7.4,2+y]],shade(h,.8))}
  if(st==='bob'){poly([[cx-6.4,-11+y],[cx+6.4,-11+y],[cx+7,-2+y],[cx+6.2,1.6+y],[cx-6.2,1.6+y],[cx-7,-2+y]],shade(h,.8))}
  if(st==='bun'){const bx=d==='f'?18+dx:d==='q'?14.6+dx:13+dx;ell(bx,(d==='f'?-17.6:-14.6)+y,3.4,3,h)}}

function headH(G,c,d,dx,dy,st,face,talk,FEM,pf){const{part,feat,ell,poly,line,cap,rect}=G;
  const X=x=>x+dx,Y=y=>y+dy,s=c.s||'#f1c7a0',S2=shade(s,.86),S3=shade(s,.72),h=c.h||'#2b2421',hd=shade(h,.6),H=shade(h,1.75),INK='#1e1616',IR=FEM?'#5a3a2a':'#3a2a22',EW=c.gl?'#e8f2f8':'#ffffff',lp=FEM?'#c4545c':shade(s,.6);
  const P=pts=>pts.map(([x,y])=>[X(x),Y(y)]);const BALD=st==='bald';const skull=(pts,cx)=>{if(!BALD)return pts;const arc=[];for(let a=192;a<=348;a+=12){const r=a*Math.PI/180;arc.push([cx+6*Math.cos(r),-9.5+5.7*Math.sin(r)])}return arc.concat(pts.slice(2))};const FT=[[.14,1.04],[.84,1],[1,.86]];
  // 눈 하나: 중심(ex,ey), 반폭 w(측면이면 좁게), 바깥쪽 방향 side(-1 왼쪽 눈, +1 오른쪽 눈)
  const eye=(ex,ey,w,side,look=0)=>{ex=X(ex);ey=Y(ey);
    if(face==='smile'||face==='grin'){cap(ex-w,ey+.1,ex,ey-.7,.36,.36,INK,{flat:1});cap(ex,ey-.7,ex+w,ey+.1,.36,.36,INK,{flat:1});return}
    if(face==='down'||face==='down2'){cap(ex-w,ey-.1,ex+w,ey+.2,.34,.34,INK,{flat:1});line(ex-w*.6,ey+.6,ex+w*.4,ey+.7,.25,S3);return}
    const sh=face==='shock';ell(ex,ey+.1,w*.95,sh?1.1:.82,EW,{flat:1});
    const ir=sh?.5:Math.min(.78,w*.55),ix=ex+Math.max(-(w*.95-ir),Math.min(w*.95-ir,look));ell(ix,ey+.15,ir,sh?.55:.86,IR,{flat:1});ell(ix,ey+.25,.3,.36,'#120c0a',{flat:1});ell(ix-.3,ey-.2,.24,.24,'#ffffff',{flat:1});
    const ang=face==='angry'?.35*side:face==='sad'?-.3*side:0;cap(ex-w*1.05,ey-.75-ang*.5*side,ex+w*1.05,ey-.85+ang*.5*side,.36,.36,INK,{flat:1});
    if(FEM)cap(ex+w*side,ey-.8,ex+(w+.6)*side,ey-1.2,.24,.24,INK,{flat:1});
    if(face==='sad')ell(ex-side*.2,ey+1.3,.3,.4,'#bfe3ff',{flat:1})};
  const brow=(ex,ey,w,side)=>{const a=face==='angry'?.7:face==='sad'||face==='shock'?-.6:0;const o=-side*a;cap(X(ex-w),Y(ey+(side<0?-o*.6:o*.6)*-1),X(ex+w),Y(ey+(side<0?o*.6:-o*.6)*-1),FEM?.32:.48,FEM?.28:.42,shade(h,.55),{flat:1})};
  const mouthAt=(mx,my,w)=>{mx=X(mx);my=Y(my);
    if(talk&&face!=='smile'&&face!=='grin'&&face!=='sad'){ell(mx,my+.2,w*.8,.75,'#5a1c1c',{flat:1});rect(mx-w*.6,my-.45,w*1.2,.35,'#ffffff');ell(mx,my+.6,w*.45,.25,'#c95a5a',{flat:1})}
    else if(face==='smile'||face==='grin'){poly([[mx-w,my-.4],[mx+w,my-.4],[mx+w*.5,my+.8],[mx-w*.5,my+.8]],'#7a2a2a',{flat:1});rect(mx-w*.8,my-.4,w*1.6,.4,'#ffffff')}
    else if(face==='angry'){rect(mx-w,my-.3,w*2,.75,'#5a1c1c');rect(mx-w*.7,my-.3,w*1.4,.3,'#f0f0f0')}
    else if(face==='shock'){ell(mx,my+.2,w*.45,.8,'#5a1c1c',{flat:1})}
    else if(face==='sad'){cap(mx-w,my+.4,mx,my-.1,.26,.26,lp,{flat:1});cap(mx,my-.1,mx+w,my+.4,.26,.26,lp,{flat:1})}
    else cap(mx-w*.8,my,mx+w*.8,my,.3,.3,lp,{flat:1})};
  const glasses=(xs,ws,ey)=>{if(!c.gl)return;const F='#4c5158';for(let i=0;i<xs.length;i++){const ex=X(xs[i]),w=ws[i],y0=Y(ey)-1.1,y1=Y(ey)+1.2;line(ex-w-.4,y0,ex+w+.4,y0,.34,F);line(ex-w-.3,y0,ex-w-.1,y1-.2,.2,shade(s,.7));line(ex+w+.3,y0,ex+w+.1,y1-.2,.2,shade(s,.7));line(ex-w,y1,ex+w,y1,.2,'#aab0b8')}};
  if(d==='f'){
    part();if(!(st==='long'||st==='bob')){ell(X(12.6),Y(-6),1.2,1.9,S2);ell(X(23.4),Y(-6),1.2,1.9,S2)}
    part();poly(P(skull([[13,-12.6],[23,-12.6],[23.4,-6],[22.8,-3],[21,-.8],[18,.3],[15,-.8],[13.2,-3],[12.6,-6]],18)),s,{tones:FT});
    feat();line(X(14.2),Y(-2.2),X(15.4),Y(-1.2),.3,S2);line(X(21.8),Y(-2.2),X(20.6),Y(-1.2),.3,S2);
    brow(15.4,-8.9,1.6,-1);brow(20.6,-8.9,1.6,1);eye(15.4,-6.3,1.45,-1);eye(20.6,-6.3,1.45,1);
    line(X(18.5),Y(-5.6),X(18.6),Y(-3.6),.32,S2);ell(X(18.1),Y(-3.2),.9,.34,S3,{flat:1});
    if(FEM||face==='smile'||face==='grin'){ell(X(14.6),Y(-3.8),1,.4,'#f0a090',{flat:1});ell(X(21.4),Y(-3.8),1,.4,'#e08a7a',{flat:1})}
    mouthAt(18,-1.7,1.25);glasses([15.4,20.6],[1.5,1.5],-6.3);
    if(c.gl){line(X(17.3),Y(-7.3),X(18.7),Y(-7.3),.26,'#4c5158')}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'f',s)}
  else if(d==='q'){
    part();poly(P(skull([[13.4,-12.6],[22.4,-12.8],[23.1,-9],[23.3,-6.4],[23.8,-4.8],[23.6,-3.9],[23,-3.3],[22.7,-2],[21.2,-.4],[19,.3],[16,-1],[14,-3.4],[12.9,-7]],17.6)),s,{tones:FT});
    if(!(st==='long'||st==='bob')){part();ell(X(14),Y(-5.8),1.2,1.9,S2);feat();line(X(14),Y(-6.8),X(14.3),Y(-4.8),.3,S3)}
    feat();brow(16.6,-8.9,1.6,-1);brow(21.6,-9,1.1,1);eye(16.6,-6.3,1.45,-1,.55);eye(21.7,-6.3,.95,1,.4);
    line(X(22.8),Y(-5.6),X(23.2),Y(-4.4),.3,S2);ell(X(22.5),Y(-3.7),.5,.3,S3,{flat:1});line(X(16),Y(-1.8),X(17.2),Y(-.9),.3,S2);
    if(FEM||face==='smile'||face==='grin')ell(X(16),Y(-3.8),1,.4,'#f0a090',{flat:1});
    mouthAt(20.6,-1.7,1.05);glasses([16.6,21.7],[1.5,1],-6.3);if(c.gl){line(X(18.4),Y(-7.3),X(20.5),Y(-7.3),.26,'#4c5158');line(X(15),Y(-7.2),X(14.3),Y(-6.4),.26,'#4c5158')}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'q',s)}
  else{
    part();poly(P(skull([[14,-12.6],[21.6,-12.8],[22.6,-10],[22.8,-7.6],[23.3,-6],[23.9,-4.7],[23.6,-3.9],[23.1,-3.5],[23.2,-2.7],[22.7,-2.1],[22.6,-1.2],[21.7,-.1],[19.4,.4],[16.6,-.6],[14.2,-3],[13,-7]],17)),s,{tones:FT});
    if(!(st==='long'||st==='bob')){part();ell(X(16.4),Y(-5.8),1.3,2,S2);feat();line(X(16.2),Y(-6.8),X(16.6),Y(-4.8),.32,S3)}
    feat();brow(21,-9,1.2,1);
    {const ex=X(21.4),ey=Y(-6.3);if(face==='smile'||face==='grin'){cap(ex-.9,ey+.1,ex,ey-.6,.34,.34,INK,{flat:1});cap(ex,ey-.6,ex+.6,ey,.34,.34,INK,{flat:1})}
      else if(face==='down'||face==='down2')line(ex-.9,ey,ex+.5,ey+.3,.34,INK);
      else{poly([[ex-.9,ey-.6],[ex+.7,ey-.5],[ex+.7,ey+.9],[ex-.6,ey+.8]],EW,{flat:1});ell(ex+.35,ey+.15,.45,.8,IR,{flat:1});line(ex-.9,ey-.7,ex+.8,ey-.8,.36,INK);if(FEM)line(ex+.6,ey-.8,ex+1.2,ey-1.2,.24,INK)}}
    line(X(23.1),Y(-4.6),X(22.5),Y(-4),.28,S3);
    {const mx=X(22.4),my=Y(-2);if(talk||face==='shock'||face==='angry'){ell(mx,my,.6,.6,'#5a1c1c',{flat:1})}else if(face==='smile'||face==='grin')line(mx-.8,my+.1,mx+.2,my-.4,.3,lp);else line(mx-.6,my,mx+.3,my,.3,lp)}
    if(c.gl){const F='#4c5158';line(X(20),Y(-7.4),X(22.8),Y(-7.4),.34,F);line(X(22.8),Y(-7.4),X(22.7),Y(-5.2),.22,F);line(X(20),Y(-7.3),X(17),Y(-6.6),.3,F)}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'s',s)}}

function hairH(G,X,Y,P,st,h,hd,H,FEM,d,s){const{ell,poly,line,feat,part,cap}=G;
  const dome=(cx,cy,rx,ry,ymax,cl,o={})=>ell(X(cx),Y(cy),rx,ry,cl,{clip:(x,y)=>y<=Y(ymax)+(o.dip?o.dip(x-X(cx)):0),...o});
  if(d==='f'){
    if(st==='bald'){feat();cap(X(14.8),Y(-13.6),X(16.8),Y(-14.6),.45,.4,shade(s,1.14),{flat:1});feat();const hg=shade(h,.92);poly(P([[12.3,-9.9],[13.3,-9.5],[13.2,-8.4],[12.4,-8.2]]),hg);poly(P([[23.7,-9.9],[22.7,-9.5],[22.8,-8.4],[23.6,-8.2]]),shade(hg,.85));return}
    const fem=FEM;dome(18,-10.2,6.4,5.8,-9.2,h,{dip:x=>st==='slick'?-1.4:st==='part'?(x>1?-.6:.8):fem?(x<0?1.8:.6):Math.sin(x*1.9)*.8+.3});
    // 옆머리
    poly(P([[11.6,-11],[13.4,-11],[13.4,-6.6+(fem?(st==='long'?6:st==='bob'?3:-1):0)],[11.8,-7+(fem?(st==='long'?6:st==='bob'?3:-1):0)]]),h);
    poly(P([[24.4,-11],[22.6,-11],[22.6,-6.6+(fem?(st==='long'?6:st==='bob'?3:-1):0)],[24.2,-7+(fem?(st==='long'?6:st==='bob'?3:-1):0)]]),hd);
    feat();
    if(st==='part'){line(X(19.6),Y(-15.6),X(20.4),Y(-11.2),.4,hd);cap(X(20.6),Y(-12),X(23),Y(-10.6),.5,.4,shade(h,1.25),{flat:1})}
    if(st==='slick')for(let i=0;i<3;i++)cap(X(14.6+i*2.6),Y(-11.6),X(15.6+i*2.6),Y(-14.6),.32,.32,shade(h,1.3),{flat:1});
    arcHi(G,X(18),Y(-10.2),5.2,4.8,H,h);
    if(fem){cap(X(13.4),Y(-10.6),X(16.6),Y(-9.4),.45,.3,hd,{flat:1})}else for(let k=0;k<4;k++)line(X(14.4+k*2.4),Y(-10.6),X(14.8+k*2.4),Y(-9.6),.3,hd);
    if(st==='bun'){ell(X(14),Y(-12.2),.6,.6,'#f2c14e')}
    return}
  // 3/4·측면: 정수리를 뒤(왼쪽)로, 뒤통수를 귀 뒤까지 덮고 이마 쪽 앞머리는 짧게
  const cx=d==='q'?17.2:16.6,bk=d==='q'?12.6:12.4,tail=st==='long'?4:st==='bob'?0:-4.6;
  if(st==='bald'){feat();cap(X(cx-2.6),Y(-13.6),X(cx-.6),Y(-14.6),.45,.4,shade(s,1.14),{flat:1});feat();const hg=shade(h,.92);
    if(d==='s'){poly(P([[12.5,-9.6],[13.5,-9.2],[14.3,-8.4],[14.1,-7.6],[14.5,-6.6],[14.2,-5.6],[14.4,-4.4],[13.4,-3.4],[12.5,-5]]),hg);line(X(13.3),Y(-8.4),X(13.5),Y(-4.6),.3,shade(h,.78))}
    else poly(P([[12.5,-9.4],[13.3,-9],[13.2,-6.2],[13,-4.4],[12.5,-4.6],[12.3,-7]]),hg);return}
  dome(cx,-10.2,6.6,5.8,-9.4,h,{dip:x=>x<-1?4:st==='slick'?-1.2:st==='part'?(x>2?-.4:.6):FEM?1.4:Math.sin(x*1.9)*.7+.2});
  poly(P([[bk-.6,-11],[bk+(d==='q'?2.2:4),-11],[bk+(d==='q'?1.6:3.6),tail],[bk-.4,tail+.6]]),shade(h,.9));
  if(d==='q'&&FEM)poly(P([[22.2,-11],[23.6,-11],[23.6,-6+(st==='long'?5:st==='bob'?3:0)],[22.6,-6.4+(st==='long'?5:st==='bob'?3:0)]]),hd);
  feat();arcHi(G,X(cx),Y(-10.2),5.4,4.8,H,h);
  if(st==='slick')for(let i=0;i<3;i++)cap(X(cx-2+i*2.6),Y(-11.6),X(cx-3+i*2.6),Y(-14.4),.32,.32,shade(h,1.3),{flat:1});
  for(let k=0;k<3;k++)line(X(bk+.6+k*1.1),Y(-9),X(bk+.4+k*1.1),Y(tail-1),.28,shade(h,.62));
  if(st==='bun'){ell(X(bk+1.4),Y(-12),.6,.6,'#f2c14e')}}

function arcHi(G,cx,cy,rx,ry,H,h){// 머리 윤기: 왼쪽 위 호를 따라 짧은 획 3개
  [[200,222],[230,250],[258,272]].forEach(([a,b],i)=>{const A=a*Math.PI/180,B=b*Math.PI/180;G.cap(cx+Math.cos(A)*rx,cy+Math.sin(A)*ry,cx+Math.cos(B)*rx,cy+Math.sin(B)*ry,i===1?.5:.4,i===1?.5:.36,i===1?H:shade(h,1.4),{flat:1})})}

// 1024×640 배경 시안 + 원근 배율 장면 배치
// 원근: 발 위치 y(fy)에서 인물 배율 K = KF*(fy-hz)/(FY-hz). 사람 키 1.7m = 84단위 → 1m = 49.4단위.

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


/* ===== 도트 2판: 512×320 화면, 원근 배율, 자세 있는 인물 =====
   좌표는 512×320. 기존 배경(512×256)은 키 84픽셀(K=1) 인물에 맞춰 그려져 있으므로
   원근상 K=1이 되는 깊이(y=224)에 바닥선이 오도록 24픽셀 내려 '뒤쪽 평면'으로 쓴다. */
const DOT={W:512,H:320,KF:1.715,FY:300,HZ:118,OFF:24};
const kz=fy=>DOT.KF*(fy-DOT.HZ)/(DOT.FY-DOT.HZ);// 발 위치 y에서의 인물 배율
const mz=fy=>kz(fy)*84/1.7;// 그 깊이에서 1m가 몇 픽셀인지

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
