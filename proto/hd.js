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
    cap(ax,ay,bx,by,ra,rb,c,o={}){const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||.001,ux=dx/len,uy=dy/len,R=Math.max(ra,rb);
      each(Math.min(ax,bx)-R,Math.min(ay,by)-R,Math.max(ax,bx)+R,Math.max(ay,by)+R,(x,y)=>{const vx=x-ax,vy=y-ay;let al=vx*ux+vy*uy;al=Math.max(0,Math.min(len,al));const qx=vx-ux*al,qy=vy-uy*al,d=Math.hypot(qx,qy),r=ra+(rb-ra)*al/len;if(d>r)return null;
        return shade(c,band(d<.05?0:lit(qx/d,qy/d)*Math.min(1,d/r*1.3),o))})},
    ell(cx,cy,rx,ry,c,o={}){each(cx-rx,cy-ry,cx+rx,cy+ry,(x,y)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry,d=nx*nx+ny*ny;if(d>1)return null;if(o.clip&&!o.clip(x,y))return null;return shade(c,band(lit(nx,ny)*Math.min(1,Math.sqrt(d)*1.2),o))})},
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
  walk:   {d:'s',A:[[-4,11],[-6,22]],B:[[5,10],[9,20]],lA:[[4,16],[-2,34]],lB:[[-3,17],[7,35]],walk:1},
  walkB:  {d:'s',A:[[-4,11],[-6,22]],B:[[5,10],[9,20]],hA:'bag',lA:[[-3,17],[6,35]],lB:[[4,16],[-2,34]],walk:1},
  give:   {d:'q',A:[[-1,12],[0,25]],B:[[5,10],[13,10]],hB:'env',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],lean:3,face:'smile'},
  camera: {d:'q',A:[[5,9],[8,-3]],B:[[6,8],[11,-4]],aFront:2,hB:'cam',lA:[[-1,18],[-3,36]],lB:[[3,18],[6,36]]},
  sign:   {d:'f',A:[[-5,4],[-3,-10]],B:[[5,4],[3,-10]],aFront:1,hA:'fist',hB:'sign',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'talk'},
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
  const P=pts=>pts.map(([x,y])=>[X(x),Y(y)]);const FT=[[.14,1.04],[.84,1],[1,.86]];
  // 눈 하나: 중심(ex,ey), 반폭 w(측면이면 좁게), 바깥쪽 방향 side(-1 왼쪽 눈, +1 오른쪽 눈)
  const eye=(ex,ey,w,side)=>{ex=X(ex);ey=Y(ey);
    if(face==='smile'||face==='grin'){cap(ex-w,ey+.1,ex,ey-.7,.36,.36,INK,{flat:1});cap(ex,ey-.7,ex+w,ey+.1,.36,.36,INK,{flat:1});return}
    if(face==='down'||face==='down2'){cap(ex-w,ey-.1,ex+w,ey+.2,.34,.34,INK,{flat:1});line(ex-w*.6,ey+.6,ex+w*.4,ey+.7,.25,S3);return}
    const sh=face==='shock';ell(ex,ey+.1,w*.95,sh?1.1:.82,EW,{flat:1});
    ell(ex+(w<1.2?.2*side*-1:0),ey+.15,sh?.5:Math.min(.78,w*.55),sh?.55:.86,IR,{flat:1});ell(ex+(w<1.2?.2*-side:0),ey+.25,.3,.36,'#120c0a',{flat:1});ell(ex-.3,ey-.2,.24,.24,'#ffffff',{flat:1});
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
    part();poly(P([[13,-12.6],[23,-12.6],[23.4,-6],[22.8,-3],[21,-.8],[18,.3],[15,-.8],[13.2,-3],[12.6,-6]]),s,{tones:FT});
    feat();line(X(14.2),Y(-2.2),X(15.4),Y(-1.2),.3,S2);line(X(21.8),Y(-2.2),X(20.6),Y(-1.2),.3,S2);
    brow(15.4,-8.9,1.6,-1);brow(20.6,-8.9,1.6,1);eye(15.4,-6.3,1.45,-1);eye(20.6,-6.3,1.45,1);
    line(X(18.5),Y(-5.6),X(18.6),Y(-3.6),.32,S2);ell(X(18.1),Y(-3.2),.9,.34,S3,{flat:1});
    if(FEM||face==='smile'||face==='grin'){ell(X(14.6),Y(-3.8),1,.4,'#f0a090',{flat:1});ell(X(21.4),Y(-3.8),1,.4,'#e08a7a',{flat:1})}
    mouthAt(18,-1.7,1.25);glasses([15.4,20.6],[1.5,1.5],-6.3);
    if(c.gl){line(X(17.3),Y(-7.3),X(18.7),Y(-7.3),.26,'#4c5158')}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'f',s)}
  else if(d==='q'){
    part();poly(P([[13.4,-12.6],[22.4,-12.8],[23.2,-9],[23.4,-6.4],[24.4,-4.4],[23.2,-3.6],[22.8,-2],[21.2,-.4],[19,.3],[16,-1],[14,-3.4],[12.9,-7]]),s,{tones:FT});
    if(!(st==='long'||st==='bob')){part();ell(X(14),Y(-5.8),1.2,1.9,S2);feat();line(X(14),Y(-6.8),X(14.3),Y(-4.8),.3,S3)}
    feat();brow(16.6,-8.9,1.6,-1);brow(21.6,-9,1.1,1);eye(16.6,-6.3,1.45,-1);eye(21.7,-6.3,.95,1);
    line(X(23),Y(-5.6),X(23.7),Y(-4.2),.3,S2);ell(X(22.6),Y(-3.6),.6,.3,S3,{flat:1});line(X(16),Y(-1.8),X(17.2),Y(-.9),.3,S2);
    if(FEM||face==='smile'||face==='grin')ell(X(16),Y(-3.8),1,.4,'#f0a090',{flat:1});
    mouthAt(20.6,-1.7,1.05);glasses([16.6,21.7],[1.5,1],-6.3);if(c.gl){line(X(18.4),Y(-7.3),X(20.5),Y(-7.3),.26,'#4c5158');line(X(15),Y(-7.2),X(14.3),Y(-6.4),.26,'#4c5158')}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'q',s)}
  else{
    part();poly(P([[14,-12.6],[21.6,-12.8],[22.8,-10],[22.9,-7.4],[24.6,-4.4],[23.2,-3.8],[23.4,-2.8],[22.7,-2.3],[22.8,-1.2],[21.8,-.1],[19.4,.4],[16.6,-.6],[14.2,-3],[13,-7]]),s,{tones:FT});
    if(!(st==='long'||st==='bob')){part();ell(X(16.4),Y(-5.8),1.3,2,S2);feat();line(X(16.2),Y(-6.8),X(16.6),Y(-4.8),.32,S3)}
    feat();brow(21,-9,1.2,1);
    {const ex=X(21.4),ey=Y(-6.3);if(face==='smile'||face==='grin'){cap(ex-.9,ey+.1,ex,ey-.6,.34,.34,INK,{flat:1});cap(ex,ey-.6,ex+.6,ey,.34,.34,INK,{flat:1})}
      else if(face==='down'||face==='down2')line(ex-.9,ey,ex+.5,ey+.3,.34,INK);
      else{poly([[ex-.9,ey-.6],[ex+.7,ey-.5],[ex+.7,ey+.9],[ex-.6,ey+.8]],EW,{flat:1});ell(ex+.15,ey+.15,.45,.8,IR,{flat:1});line(ex-.9,ey-.7,ex+.8,ey-.8,.36,INK);if(FEM)line(ex+.6,ey-.8,ex+1.2,ey-1.2,.24,INK)}}
    line(X(23.4),Y(-4.6),X(22.6),Y(-3.9),.28,S3);
    {const mx=X(22.4),my=Y(-2);if(talk||face==='shock'||face==='angry'){ell(mx,my,.6,.6,'#5a1c1c',{flat:1})}else if(face==='smile'||face==='grin')line(mx-.8,my+.1,mx+.2,my-.4,.3,lp);else line(mx-.6,my,mx+.3,my,.3,lp)}
    if(c.gl){const F='#4c5158';line(X(20),Y(-7.4),X(22.8),Y(-7.4),.34,F);line(X(22.8),Y(-7.4),X(22.7),Y(-5.2),.22,F);line(X(20),Y(-7.3),X(17),Y(-6.6),.3,F)}
    part();hairH(G,X,Y,P,st,h,hd,H,FEM,'s',s)}}

function hairH(G,X,Y,P,st,h,hd,H,FEM,d,s){const{ell,poly,line,feat,part,cap}=G;
  const dome=(cx,cy,rx,ry,ymax,cl,o={})=>ell(X(cx),Y(cy),rx,ry,cl,{clip:(x,y)=>y<=Y(ymax)+(o.dip?o.dip(x-X(cx)):0),...o});
  if(d==='f'){
    if(st==='bald'){dome(18,-9.5,6,5.6,-11.4,s,{});part();ell(X(12.9),Y(-8.6),1.2,2.6,h);ell(X(23.1),Y(-8.6),1.2,2.6,hd);feat();line(X(15.4),Y(-14.4),X(17.4),Y(-14.8),.5,shade(s,1.3));return}
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
  if(st==='bald'){dome(cx+.4,-9.5,6,5.6,-11.6,s,{});part();ell(X(bk+1.4),Y(-7.8),1.7,3.2,h,{clip:(x,y)=>y>Y(-10.6)});return}
  dome(cx,-10.2,6.6,5.8,-9.4,h,{dip:x=>x<-1?4:st==='slick'?-1.2:st==='part'?(x>2?-.4:.6):FEM?1.4:Math.sin(x*1.9)*.7+.2});
  poly(P([[bk-.6,-11],[bk+(d==='q'?2.2:4),-11],[bk+(d==='q'?1.6:3.6),tail],[bk-.4,tail+.6]]),shade(h,.9));
  if(d==='q'&&FEM)poly(P([[22.2,-11],[23.6,-11],[23.6,-6+(st==='long'?5:st==='bob'?3:0)],[22.6,-6.4+(st==='long'?5:st==='bob'?3:0)]]),hd);
  feat();arcHi(G,X(cx),Y(-10.2),5.4,4.8,H,h);
  if(st==='slick')for(let i=0;i<3;i++)cap(X(cx-2+i*2.6),Y(-11.6),X(cx-3+i*2.6),Y(-14.4),.32,.32,shade(h,1.3),{flat:1});
  for(let k=0;k<3;k++)line(X(bk+.6+k*1.1),Y(-9),X(bk+.4+k*1.1),Y(tail-1),.28,shade(h,.62));
  if(st==='bun'){ell(X(bk+1.4),Y(-12),.6,.6,'#f2c14e')}}

function arcHi(G,cx,cy,rx,ry,H,h){// 머리 윤기: 왼쪽 위 호를 따라 짧은 획 3개
  [[200,222],[230,250],[258,272]].forEach(([a,b],i)=>{const A=a*Math.PI/180,B=b*Math.PI/180;G.cap(cx+Math.cos(A)*rx,cy+Math.sin(A)*ry,cx+Math.cos(B)*rx,cy+Math.sin(B)*ry,i===1?.5:.4,i===1?.5:.36,i===1?H:shade(h,1.4),{flat:1})})}
