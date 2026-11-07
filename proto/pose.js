// 자세 있는 인물 시안 (personHD 후속)
// 로컬 좌표(512 기준): 몸 중심 x=18, 머리 꼭대기 y≈-14, 발바닥 y≈66. 오른쪽을 보는 것을 기준으로 정의하고 flip이면 좌우 반전.
// 방향 d: 'f' 정면, 'q' 3/4(오른쪽), 's' 측면(오른쪽)
function pxGrid2(flip){
  const OX=34,OY=34,GW=104,GH=118,col=new Array(GW*GH).fill(null),lay=new Int16Array(GW*GH),nol=new Uint8Array(GW*GH);let L=0,NL=0;
  const set=(x,y,cl)=>{x=Math.round(x);y=Math.round(y);if(flip)x=36-x;if(x+OX<0||x+OX>=GW||y+OY<0||y+OY>=GH||!cl)return;const i=(y+OY)*GW+x+OX;col[i]=cl;lay[i]=L;nol[i]=NL};
  const p=(x,y,w,h,cl)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,cl)};
  const TT=[[.1,1.4],[.26,1.15],[.6,1],[.82,.76],[1,.56]];
  const shape=(y0,rows,base,o={})=>rows.forEach(([a,b],k)=>{const y=y0+k;for(let x=a;x<=b;x++){let fr=b===a?.5:(x-a)/(b-a);if(flip)fr=1-fr;let f=1;
      for(const [lim,m] of (o.tones||TT))if(fr<=lim){f=m;break}
      if(o.rim&&(flip?x===b:x===a)&&b-a>2)f=Math.max(f,o.rim);if(o.bot&&k>=rows.length-o.bot)f=Math.min(f,.72);set(x,y,shade(base,f))}});
  const LX=flip?.62:-.62,LY=-.78;
  // 캡슐(팔다리): 굵기 ra→rb, 원통 음영(빛은 화면 왼쪽 위)
  const seg=(ax,ay,bx,by,ra,rb,base,o={})=>{const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||.01,ux=dx/len,uy=dy/len,R=Math.max(ra,rb)+1;
    for(let y=Math.floor(Math.min(ay,by)-R);y<=Math.ceil(Math.max(ay,by)+R);y++)for(let x=Math.floor(Math.min(ax,bx)-R);x<=Math.ceil(Math.max(ax,bx)+R);x++){
      const vx=x+.5-ax,vy=y+.5-ay;let al=vx*ux+vy*uy;if(o.nocap&&(al<0||al>len))continue;al=Math.max(0,Math.min(len,al));const qx=vx-ux*al,qy=vy-uy*al,d=Math.hypot(qx,qy),r=ra+(rb-ra)*al/len;if(d>r)continue;
      const dt=d<.3?0:((flip?-qx:qx)*(flip?-LX:LX)+qy*LY)/d*Math.min(1,d/r*1.25);let f=dt>.5?1.2:dt>-.2?1:dt>-.62?.8:.62;if(o.f)f*=o.f;set(x,y,shade(base,f))}};
  // 몸통: 목(n)→엉덩이(h) 축을 따라 왼쪽 폭 wl(t), 오른쪽 폭 wr(t)
  const trunk=(nx,ny,hx,hy,wl,wr,base,o={})=>{const dx=hx-nx,dy=hy-ny,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    for(let y=Math.floor(Math.min(ny,hy)-16);y<=Math.ceil(Math.max(ny,hy)+16);y++)for(let x=Math.floor(Math.min(nx,hx)-16);x<=Math.ceil(Math.max(nx,hx)+16);x++){
      const vx=x+.5-nx,vy=y+.5-ny,al=vx*ux+vy*uy;if(al<0||al>len)continue;const t=al/len,sr=vx*uy-vy*ux,L=wl(t),Rr=wr(t);if(sr<-L||sr>Rr)continue;
      let fr=(sr+L)/(L+Rr||1);if(flip)fr=1-fr;let f=1;for(const [lim,m] of (o.tones||TT))if(fr<=lim){f=m;break}set(x,y,shade(base,f))}
    return(t,s)=>[nx+dx*t+uy*s,ny+dy*t-ux*s]};// at(t,s): s>0 이 화면 오른쪽
  const disc=(cx,cy,r,base,o={})=>seg(cx,cy,cx+.01,cy,r,r,base,o);
  const flush=(r,X,Y)=>{const out=col.slice(),N=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;
      if(!col[i]){let nb=null;for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]){nb=col[j];break}}if(nb)out[i]=shade(nb,.32)}
      else if(!nol[i]){for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]&&!nol[j]&&lay[j]>lay[i]){out[i]=shade(col[i],.52);break}}}}
    for(let y=0;y<GH;y++){let x=0;while(x<GW){const cl=out[y*GW+x];if(!cl){x++;continue}let n=1;while(x+n<GW&&out[y*GW+x+n]===cl)n++;r(X+x-OX,Y+y-OY,n,1,cl);x+=n}}};
  return{set,p,shape,seg,trunk,disc,flush,part(){L++;NL=0},feat(){L++;NL=1}}}

const lerpT=(arr)=>t=>{const k=t*(arr.length-1),i=Math.min(arr.length-2,Math.floor(k)),f=k-i;return arr[i]+(arr[i+1]-arr[i])*f};

/* 자세 표: 팔은 어깨 기준 [팔꿈치, 손] 상대 좌표, 다리는 엉덩이 기준 [무릎, 발]. A=화면 왼쪽 팔·다리(3/4·측면에서는 가까운 쪽), B=오른쪽.
   aFront: 팔을 몸통 앞에 그림. hA/hB: 손 모양(open/fist/point/palm) 또는 소품(mic/paper/phone/cup). lean: 몸통 기울기(목을 x만큼 앞으로), hd: 머리 방향 */
const POSES={
  stand:  {d:'f',A:[[-1,12],[-1,25]],B:[[1,12],[2,25]],lA:[[-1,18],[-1,36]],lB:[[1,18],[1,36]]},
  rest:   {d:'f',A:[[-2,12],[-1,25]],B:[[2,11],[1,23]],lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]],hip:[1,0],lean:-1},
  hips:   {d:'f',A:[[-7,8],[-3,19]],B:[[7,8],[3,19]],lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],hA:'fist',hB:'fist'},
  talkF:  {d:'f',A:[[-2,12],[-1,25]],B:[[6,10],[5,-1]],hB:'palm',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'talk'},
  idleQ:  {d:'q',A:[[-1,12],[0,25]],B:[[1,12],[2,24]],lA:[[0,18],[-1,36]],lB:[[2,18],[4,36]]},
  talkQ:  {d:'q',A:[[-1,12],[0,25]],B:[[5,9],[13,4]],hB:'palm',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],face:'talk'},
  point:  {d:'q',A:[[-2,11],[-1,24]],B:[[8,4],[18,0]],hB:'point',lA:[[-1,18],[-4,36]],lB:[[3,18],[7,36]],lean:2,face:'talk'},
  cross:  {d:'q',A:[[1,10],[10,10]],B:[[-1,10],[-8,11]],aFront:2,hA:'fist',hB:'fist',lA:[[-1,18],[-3,36]],lB:[[2,18],[3,36]],lean:-1},
  crossF: {d:'f',A:[[1,10],[11,8]],B:[[-1,10],[-11,9]],aFront:1,hA:'fist',hB:'fist',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]]},
  fistUp: {d:'f',A:[[-2,12],[-1,25]],B:[[4,-8],[3,-21]],hB:'fist',lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],face:'talk'},
  wave:   {d:'q',A:[[-1,12],[0,25]],B:[[7,-3],[7,-15]],hB:'palm',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]]},
  shake:  {d:'q',A:[[-1,12],[0,25]],B:[[4,11],[13,14]],hB:'open',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],lean:2},
  bow:    {d:'s',A:[[3,12],[4,24]],B:[[3,12],[5,24]],lA:[[1,18],[0,36]],lB:[[2,18],[2,36]],lean:9,face:'down'},
  mic:    {d:'q',A:[[-1,12],[0,25]],B:[[5,8],[3,-4]],hB:'mic',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],face:'talk'},
  paper:  {d:'f',A:[[2,11],[7,17]],B:[[-2,11],[-6,17]],aFront:1,hA:'paper',hB:'open',lA:[[-1,18],[-2,36]],lB:[[1,18],[2,36]],face:'down2'},
  phone:  {d:'q',A:[[-1,12],[0,25]],B:[[5,7],[3,-9]],hB:'phone',lA:[[0,18],[-2,36]],lB:[[2,18],[4,36]]},
  think:  {d:'q',A:[[2,11],[10,12]],B:[[4,10],[3,-2]],aFront:2,hB:'fist',lA:[[0,18],[-1,36]],lB:[[2,18],[3,36]]},
  despair:{d:'f',A:[[-8,-2],[-3,-13]],B:[[8,-2],[3,-13]],aFront:1,lA:[[-1,18],[-3,36]],lB:[[1,18],[3,36]],lean:0,face:'sad'},
  walk:   {d:'s',A:[[-4,11],[-6,22]],B:[[5,10],[9,20]],lA:[[4,16],[-2,34]],lB:[[-3,17],[7,35]],aFront:0},
  give:   {d:'q',A:[[-1,12],[0,25]],B:[[5,10],[13,10]],hB:'env',lA:[[0,18],[-2,36]],lB:[[2,18],[5,36]],lean:3,face:'smile'},
};

function personP(r,X,Y,c,pose,flip){
  Y+=2;const P0=POSES[pose]||POSES.stand,d=P0.d,G=pxGrid2(!!flip),{p,shape,seg,trunk,disc,part,feat}=G;
  const s=c.s||'#f1c7a0',S2=shade(s,.84),S3=shade(s,.68),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421',hd=shade(h,.62),H=shade(h,1.7);
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,AC=ROBE?'#2a2a32':P,INK='#1e1616',W=c.w||'#f4f4f4';
  let face=c.face||'';if(!face&&P0.face&&P0.face!=='talk')face=P0.face;const talk=(c.talk||P0.face==='talk')&&(typeof PF==='undefined'||PF);
  const sw=FEM?8:10,wa=FEM?5.5:6.5,hp=FEM?7.5:7;
  // 골격
  const hipC=[18+(P0.hip?P0.hip[0]:0),25+(P0.hip?P0.hip[1]:0)],lean=P0.lean||0,neck=[18+lean,1+Math.abs(lean)*.35];
  let wl,wr;const front=[sw-4,sw-.5,sw,sw,sw-.6,sw-1.6,wa+1,wa,wa,wa+.5,hp];
  if(d==='f'){wl=lerpT(front);wr=wl}
  else if(d==='q'){wl=lerpT(front.map(v=>v*.92));wr=lerpT(front.map((v,i)=>v*.74+(i>0&&i<4?.6:0)))}
  else{wl=lerpT([3,4.5,5,5,4.5,4,4,4,4,4.5,5]);wr=lerpT([3,5.5,6.5,6.5,6,5,4.5,4.5,4.5,4.5,4.5])}
  const nk=[neck[0],neck[1]+1];
  // 어깨·엉덩이 관절
  const tmpAt=(t,s2)=>{const dx=hipC[0]-nk[0],dy=hipC[1]-nk[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;return[nk[0]+dx*t+uy*s2,nk[1]+dy*t-ux*s2]};
  const shA=d==='f'?tmpAt(.13,-(sw-2.4)):d==='q'?tmpAt(.13,-(sw*.92-2.2)):tmpAt(.14,-.5);
  const shB=d==='f'?tmpAt(.13,sw-2.4):d==='q'?tmpAt(.12,sw*.74-1.6):tmpAt(.14,1);
  const hpA=d==='f'?[hipC[0]-3.4,hipC[1]+1]:d==='q'?[hipC[0]-2.6,hipC[1]+1]:[hipC[0]-.5,hipC[1]+1];
  const hpB=d==='f'?[hipC[0]+3.4,hipC[1]+1]:d==='q'?[hipC[0]+2.4,hipC[1]+.5]:[hipC[0]+.5,hipC[1]+1];
  const J=(o,rel)=>[o[0]+rel[0],o[1]+rel[1]];
  const leg=(hp0,L,near)=>{const kn=J(hp0,L[0]),ft=J(hp0,L[1]);
    part();if(c.sk){seg(...hp0,...kn,2.6,2.2,s);seg(...kn,...ft,2.2,1.7,s)}else if(!ROBE){seg(...hp0,...kn,3.5,3,L0);seg(...kn,...ft,3,2.5,L0)}
    if(!ROBE){part();const sh='#2c201a',fx=Math.round(ft[0]),fy=Math.round(ft[1])+1;
      if(d==='f')shape(fy,[[fx-2,fx+2],[fx-3,fx+3],[fx-3,fx+3]],sh,{bot:1});
      else shape(fy,[[fx-2,fx+3],[fx-2,fx+5],[fx-3,fx+5]],sh,{bot:1});
      feat();p(fx-1,fy+1,2,1,shade(sh,2.6))}};
  const arm=(sh0,A,hand,fr)=>{const el=J(sh0,A[0]),hn=J(sh0,A[1]),k=fr?{f:.86}:{};part();seg(...sh0,...el,2.3,2,AC,k);seg(...el,...hn,2,1.8,AC,k);
    // 소매 끝 셔츠
    const ux=hn[0]-el[0],uy=hn[1]-el[1],ln=Math.hypot(ux,uy)||1,cx=hn[0]-ux/ln*1.2,cy=hn[1]-uy/ln*1.2;
    if(!ROBE){feat();disc(cx,cy,1.6,W,{f:1})}
    part();handDraw(hn,ux/ln,uy/ln,hand)};
  const handDraw=(hn,ux,uy,hand)=>{const [x,y]=hn;
    if(hand==='point'){seg(x,y,x+ux*4.5,y+uy*4.5,1,.8,s);disc(x,y,1.9,s)}
    else if(hand==='fist'){disc(x+ux*.8,y+uy*.8,2.1,s);feat();p(Math.round(x+ux)-1,Math.round(y+uy),2,1,S3)}
    else if(hand==='palm'){disc(x+ux*1,y+uy*1,2,s);seg(x,y,x-1.6,y+1.5,.9,.7,s)}
    else{disc(x+ux*.6,y+uy*.6,1.8,s)}
    if(hand==='mic'){part();seg(x+.5,y-1,x+2.5,y-5,1,1.1,'#2a2d34');disc(x+3,y-6.5,1.9,'#9aa3ad');feat();p(Math.round(x+2),Math.round(y-8),1,1,'#e8eef2');part();disc(x,y,1.9,s)}
    if(hand==='phone'){part();p(Math.round(x)-1,Math.round(y)-4,3,6,'#22252b');feat();p(Math.round(x),Math.round(y)-3,1,3,'#6fa8dc');part();disc(x-.4,y+.6,1.8,s)}
    if(hand==='paper'){part();const px0=Math.round(x)-1,py0=Math.round(y)-6;p(px0,py0,12,8,'#f4f2ea');feat();for(let i=0;i<3;i++)p(px0+2,py0+2+i*2,i===2?5:8,1,'#9aa3ad');p(px0,py0,12,1,'#ffffff');part();disc(x,y,1.8,s)}
    if(hand==='env'){part();const px0=Math.round(x)+1,py0=Math.round(y)-3;p(px0,py0,8,5,'#e9d9a8');feat();p(px0+1,py0+1,3,1,'#b89a50');p(px0+4,py0+2,3,1,'#b89a50');part();disc(x,y,1.8,s)}};
  const hA=P0.hA||'open',hB=P0.hB||'open';
  // ── 그리기 순서: 뒷머리 → 뒤쪽 다리/팔 → 몸통 → 앞쪽 다리/팔 → 목·머리
  const HX=neck[0]-18+(d==='q'?1:d==='s'?2:0),HY=neck[1]-1+(P0.face==='down'?3:0);
  part();backHair(G,c,d,HX,HY,st,h);
  if(d!=='f'){leg(hpB,P0.lB,0);if(!ROBE)leg(hpA,P0.lA,1)}else{leg(hpA,P0.lA);leg(hpB,P0.lB)}
  if(!P0.aFront){if(d==='f'){arm(shA,P0.A,hA);arm(shB,P0.B,hB)}else arm(shB,P0.B,hB)}
  else if(d!=='f'&&P0.aFront!==2)arm(shB,P0.B,hB);
  // 몸통
  part();
  if(ROBE){trunk(nk[0],nk[1],18,64,t=>t<.1?sw-3+t*20:sw-1+t*5,t=>t<.1?sw-3+t*20:sw-1+t*5,'#2a2a32')}
  const at=trunk(nk[0],nk[1],hipC[0],hipC[1]+1,wl,wr,ROBE?'#2a2a32':P);
  feat();
  const fc=d==='f'?0:d==='q'?2.2:4.2;// 앞섶 위치(옷깃 V의 중심이 오른쪽으로)
  if(ROBE){const q=at(.04,fc);p(Math.round(q[0])-3,Math.round(q[1]),7,3,'#f4f4f4')}
  else if(c.hood){for(let k=0;k<3;k++){const q=at(.02+k*.04,fc);p(Math.round(q[0])-5,Math.round(q[1]),11,1,shade(P,.6))}}
  else if(c.w){for(let k=0;k<11;k++){const w2=Math.max(0,3-Math.floor(k/3.5))*(d==='s'?.5:1),q=at(.02+k*.042,fc);const x0=Math.round(q[0]-w2),y0=Math.round(q[1]);p(x0,y0,Math.round(2*w2)+1,1,W);if(w2>0){p(x0-1,y0,1,1,shade(P,.45));p(x0+Math.round(2*w2)+1,y0,1,1,shade(P,.45))}}
    if(c.t&&d!=='s'){for(let k=1;k<12;k++){const q=at(.04+k*.04,fc);p(Math.round(q[0]),Math.round(q[1]),1,1,k<3?shade(c.t,.72):c.t);if(k>2&&k<10)p(Math.round(q[0])+1,Math.round(q[1]),1,1,shade(c.t,.6))}}
    else if(c.t&&d==='s'){for(let k=2;k<11;k++){const q=at(.04+k*.04,fc+.6);p(Math.round(q[0]),Math.round(q[1]),1,1,c.t)}}}
  if(!ROBE&&!c.sk){const q=at(.98,0);p(Math.round(q[0]-wl(1)),Math.round(q[1]),Math.round(wl(1)+wr(1))+1,1,'#1a1614');const b=at(.98,fc);p(Math.round(b[0])-1,Math.round(b[1]),3,1,'#c8a13a')}
  if(c.sk){part();const q=at(1,0);shape(Math.round(q[1]),Array(12).fill(0).map((_,k)=>[Math.round(q[0]-hp-k*.25),Math.round(q[0]+hp+k*.25)]),L0,{rim:1.5,bot:1})}
  if(c.pin&&d!=='s'){const q=at(.2,d==='f'?-5.5:-4.5);p(Math.round(q[0]),Math.round(q[1]),2,2,'#c8a13a');p(Math.round(q[0]),Math.round(q[1]),1,1,'#ffe48a')}
  if(c.steth){const q=at(.05,fc);p(Math.round(q[0])-4,Math.round(q[1]),1,10,'#3a3a44');p(Math.round(q[0])+4,Math.round(q[1]),1,10,'#3a3a44');p(Math.round(q[0])-4,Math.round(q[1])+10,9,1,'#3a3a44')}
  if(c.note&&d==='f'){}
  // 앞쪽 팔
  if(d!=='f'&&!P0.aFront)arm(shA,P0.A,hA,1);
  if(P0.aFront){if(d==='f'||P0.aFront===2){arm(shB,P0.B,hB,1);arm(shA,P0.A,hA,1)}else arm(shA,P0.A,hA,1)}
  // 목
  part();p(Math.round(nk[0])-2+(d==='s'?1:0),Math.round(nk[1])-2,5,4,S3);
  head(G,c,d,HX,HY,st,face,talk,{s,S2,S3,h,hd,H,FEM,INK},P0.face);
  G.flush(r,X,Y)}

function backHair(G,c,d,dx,dy,st,h){const{shape,p}=G;const sp=(y0,hw,cx)=>hw.map(v=>[Math.round(cx-v),Math.round(cx+v)]);
  const cx=18+dx+(d==='q'?-1:d==='s'?-2.5:0);
  if(st==='long')shape(-14+dy,sp(-14,[4.5,5.5,6,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,7,7,7,7,7,7,6.5,6.5,6,6,5.5,5,4.5,4],cx),shade(h,.78));
  if(st==='bob')shape(-14+dy,sp(-14,[4.5,5.5,6,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6,5],cx),shade(h,.78));
  if(st==='bun'){const bx=d==='f'?18:d==='q'?15:13;shape(-21+dy+(d==='f'?0:3),sp(0,[2,3,3.5,3.5,3],bx+dx),h,{rim:1.5})}}

function head(G,c,d,dx,dy,st,face,talk,K,pf){const{shape,part,feat}=G;const P=(x,y,w,hh,cl)=>G.p(x+dx,y+dy,w,hh,cl);
  const SH=(y0,rows,base,o)=>shape(y0+dy,rows.map(([a,b])=>[a+dx,b+dx]),base,o);const sp=(hw,cx=18)=>hw.map(v=>[Math.round(cx-v),Math.round(cx+v)]);
  const{s,S2,S3,h,hd,H,FEM,INK}=K,BR=hd,EW=c.gl?'#e2f0f8':'#ffffff',lp=FEM?'#c4545c':shade(s,.58);
  if(d==='f'){
    part();if(!(st==='long'||st==='bob')){P(12,-8,1,4,s);P(24,-8,1,4,S2);feat();P(12,-7,1,2,S3);P(24,-7,1,2,S3)}
    part();SH(-13,sp(FEM?[3,4.5,5,5,5,5,5,5,4.5,4.5,4,3.5,2.5,1.5]:[3,4.5,5,5,5,5,5,5,5,5,4.5,4,3,2]),s,{tones:[[.12,1.03],[.86,1],[1,.88]]});feat();
    P(14,-2,1,1,S2);P(22,-2,1,1,S2);
    if(face==='angry'){P(15,-10,1,1,BR);P(16,-9,2,1,BR);P(22,-10,1,1,BR);P(20,-9,2,1,BR)}
    else if(face==='sad'||face==='shock'){P(15,-9,1,1,BR);P(16,-10,2,1,BR);P(22,-9,1,1,BR);P(20,-10,2,1,BR)}
    else{P(15,-9,3,1,BR);P(20,-9,3,1,BR);if(!FEM){P(15,-10,2,1,BR);P(21,-10,2,1,BR)}}
    if(face==='smile'||face==='grin'){P(15,-7,1,1,INK);P(16,-8,2,1,INK);P(20,-8,2,1,INK);P(22,-7,1,1,INK)}
    else if(face==='down2'){P(15,-6,3,1,INK);P(20,-6,3,1,INK)}
    else if(face==='shock'){P(15,-8,3,1,INK);P(20,-8,3,1,INK);P(15,-7,3,2,EW);P(20,-7,3,2,EW);P(16,-7,1,1,INK);P(21,-7,1,1,INK)}
    else{P(15,-7,3,1,INK);P(20,-7,3,1,INK);P(15,-6,1,1,EW);P(16,-6,2,1,'#2a201c');P(20,-6,2,1,'#2a201c');P(22,-6,1,1,EW);
      if(FEM){P(13,-7,1,1,INK);P(23,-7,1,1,INK)}if(face==='angry'){P(15,-7,1,1,BR);P(22,-7,1,1,BR)}if(face==='sad')P(15,-5,1,1,'#bfe3ff')}
    P(18,-5,1,2,S2);P(17,-3,1,1,S2);P(18,-3,1,1,S3);P(19,-3,1,1,S2);
    if(FEM||face==='smile'||face==='grin'){P(15,-4,2,1,'#ef9e8c');P(21,-4,2,1,'#e08a7a')}
    mouth(P,face,talk,17,lp);
    if(c.gl){const F='#5c6168',F2=shade(s,.78);P(13,-8,5,1,F);P(19,-8,5,1,F);P(18,-7,1,1,'#aab0b8');P(12,-7,1,1,F);P(24,-7,1,1,F);P(13,-7,1,2,F2);P(23,-7,1,2,F2);P(15,-4,3,1,F2);P(20,-4,3,1,F2)}
    part();hairFront(G,P,SH,sp,st,h,hd,H,FEM,'f')}
  else if(d==='q'){
    // 3/4: 얼굴이 오른쪽으로 돌아감. 뒤통수(왼쪽)는 머리카락, 귀는 왼쪽에 하나
    part();SH(-13,[[13,21],[12,22],[12,23],[12,23],[12,23],[12,23],[12,23],[12,23],[12,23],[12,23],[13,23],[14,22],[15,21],[16,20]],s,{tones:[[.12,1.03],[.86,1],[1,.88]]});feat();
    P(21,-2,1,1,S2);P(15,-2,1,1,S2);
    // 귀
    if(!(st==='long'||st==='bob')){part();P(13,-8,2,4,S2);feat();P(14,-7,1,2,S3);part()}
    feat();
    if(face==='angry'){P(16,-10,1,1,BR);P(17,-9,2,1,BR);P(22,-10,1,1,BR);P(21,-9,1,1,BR)}
    else if(face==='sad'||face==='shock'){P(16,-9,1,1,BR);P(17,-10,2,1,BR);P(22,-9,1,1,BR);P(21,-10,1,1,BR)}
    else{P(16,-9,3,1,BR);P(21,-9,2,1,BR);if(!FEM)P(16,-10,2,1,BR)}
    if(face==='smile'||face==='grin'){P(16,-7,1,1,INK);P(17,-8,2,1,INK);P(21,-8,1,1,INK);P(22,-7,1,1,INK)}
    else if(face==='down2'||face==='down'){P(16,-6,3,1,INK);P(21,-6,2,1,INK)}
    else if(face==='shock'){P(16,-8,3,1,INK);P(21,-8,2,1,INK);P(16,-7,3,2,EW);P(21,-7,2,2,EW);P(18,-7,1,1,INK);P(22,-7,1,1,INK)}
    else{P(16,-7,3,1,INK);P(21,-7,2,1,INK);P(16,-6,1,1,EW);P(17,-6,2,1,'#2a201c');P(21,-6,2,1,'#2a201c');
      if(FEM){P(15,-7,1,1,INK)}if(face==='angry'){P(16,-7,1,1,BR)}if(face==='sad')P(16,-5,1,1,'#bfe3ff')}
    // 코(오른쪽 가장자리로 살짝 튀어나옴)
    P(22,-5,1,2,S2);P(23,-4,1,1,s);P(22,-3,1,1,S3);
    if(FEM||face==='smile'||face==='grin'){P(16,-4,2,1,'#ef9e8c')}
    mouth(P,face,talk,19,lp);
    if(c.gl){const F='#5c6168',F2=shade(s,.78);P(15,-8,5,1,F);P(20,-8,4,1,F);P(19,-7,1,1,'#aab0b8');P(13,-7,1,1,F);P(15,-4,3,1,F2);P(20,-4,3,1,F2)}
    part();hairFront(G,P,SH,sp,st,h,hd,H,FEM,'q')}
  else{
    // 측면: 얼굴선이 오른쪽, 코가 튀어나옴
    part();SH(-13,[[14,21],[13,22],[13,22],[13,22],[13,22],[13,22],[13,22],[13,23],[13,24],[13,23],[14,23],[15,22],[16,22],[17,21]],s,{tones:[[.12,1.03],[.86,1],[1,.88]]});feat();
    P(22,-5,1,1,S2);P(23,-4,1,1,S3);
    if(!(st==='long'||st==='bob')){part();P(15,-8,3,4,s);feat();P(16,-7,1,2,S3);P(15,-8,1,4,S2)}
    feat();
    if(face==='angry'){P(19,-10,1,1,BR);P(20,-9,2,1,BR)}else if(face==='sad'||face==='shock'){P(19,-9,1,1,BR);P(20,-10,2,1,BR)}else P(19,-9,3,1,BR);
    if(face==='smile'||face==='grin'){P(19,-7,1,1,INK);P(20,-8,1,1,INK)}
    else if(face==='down'||face==='down2'){P(19,-6,2,1,INK)}
    else if(face==='shock'){P(20,-8,2,1,INK);P(20,-7,2,2,EW);P(21,-7,1,1,INK)}
    else{P(20,-7,2,1,INK);P(20,-6,1,1,'#2a201c');P(21,-6,1,1,EW)}
    if(FEM)P(21,-8,1,1,INK);
    if(face==='smile'||face==='grin'){P(20,-2,2,1,lp);P(21,-3,1,1,lp)}else if(talk||face==='shock'||face==='angry')P(21,-2,2,2,'#4a1818');else P(21,-2,2,1,lp);
    if(c.gl){const F='#5c6168';P(19,-8,4,1,F);P(23,-7,1,2,F);P(19,-4,4,1,shade(s,.78));P(16,-7,3,1,F)}
    part();hairFront(G,P,SH,sp,st,h,hd,H,FEM,'s')}
}
function mouth(P,face,talk,x,lp){
  if(talk&&face!=='smile'&&face!=='grin'&&face!=='sad'){P(x,-2,3,2,'#4a1818');P(x,-2,3,1,'#ffffff')}
  else if(face==='smile'||face==='grin'){P(x-1,-2,1,1,lp);P(x,-1,3,1,lp);P(x+3,-2,1,1,lp);P(x,-2,3,1,'#ffffff')}
  else if(face==='angry'){P(x-1,-2,5,1,'#4a1818');P(x,-2,3,1,'#f0f0f0')}
  else if(face==='sad'){P(x,-2,3,1,lp);P(x-1,-1,1,1,lp);P(x+3,-1,1,1,lp)}
  else if(face==='shock'){P(x,-2,3,2,'#4a1818')}
  else P(x,-2,3,1,lp)}
function hairFront(G,P,SH,sp,st,h,hd,H,FEM,d){const{part,feat}=G;
  if(d==='f'){const crown=hw=>SH(-16,sp(hw),h,{rim:1.6});const CR=[3,4.5,5.5,6,6,6];
    if(st==='bald'){SH(-16,sp([2.5,4,5,5.5,5.5,5.5]),'#f1c7a0',{rim:1.15});part();P(12,-11,2,5,h);P(23,-11,2,5,hd)}
    else if(st==='slick'){crown(CR);P(12,-11,1,4,h);P(24,-11,1,3,hd);feat();P(14,-15,5,1,H);for(let i=0;i<3;i++)P(15+i*3,-13,2,1,shade(h,1.3));P(14,-11,9,1,hd)}
    else if(st==='short'||st==='part'){crown(CR);const len=st==='part'?[1,2,1,1,1,1,0,0,0,1,1]:[1,1,1,0,1,1,0,1,1,0,1];for(let x=13;x<=23;x++)if(len[x-13])P(x,-10,1,len[x-13],x>21?hd:h);
      P(12,-11,1,4,h);P(24,-11,1,3,hd);feat();P(14,-15,4,1,H);P(18,-13,2,1,shade(h,1.3));if(st==='part'){P(19,-16,1,5,hd);P(20,-12,3,1,shade(h,1.25))}}
    else{crown([3,4.5,5.5,6,6.5,6.5]);for(let x=13;x<=23;x++){const n=x<18?2:x<20?1:0;if(n)P(x,-10,1,n,x>21?hd:h)}P(20,-10,3,1,h);
      const e=st==='long'?-1:st==='bob'?-3:-7;for(let y=-11;y<=e;y++){P(12,y,1,1,h);P(24,y,1,1,hd)}feat();P(14,-15,4,1,H)}
    return}
  // 3/4·측면: 정수리를 뒤(왼쪽)로 밀고, 이마 쪽 앞머리는 짧게
  const cx=d==='q'?17:16.5,back=d==='q'?12:12.5;
  if(st==='bald'){SH(-16,sp([2.5,4,5,5.5,5.5,5.5],cx+.5),'#f1c7a0',{rim:1.15});part();P(back,-11,3,6,h);return}
  SH(-16,sp([3,4.5,5.5,6,6.2,6.2],cx),h,{rim:1.6});
  // 뒤통수 덮기
  const bl=st==='long'?4:st==='bob'?1:-5;for(let y=-11;y<=bl;y++){const w=d==='q'?(y<-9?4:2):(y<-8?5:3);P(d==='q'?11:back,y,w,1,y<-8?h:shade(h,.85))}
  if(d==='q'){const fr=st==='slick'?[0,0,0,0,0,0,0,0]:st==='part'?[1,2,1,1,1,1,0,1]:FEM?[2,2,2,1,1,1,1,0]:[1,1,1,0,1,1,1,0];for(let x=15;x<=22;x++)if(fr[x-15])P(x,-10,1,fr[x-15],x>20?hd:h);P(23,-11,1,2,hd)}
  else{for(let x=15;x<=21;x++)if((x+(st==='part'?1:0))%3)P(x,-10,1,1,h);P(22,-11,1,1,hd)}
  feat();P(cx-3,-15,4,1,H);P(cx-4,-14,2,1,shade(h,1.35));if(st==='slick')for(let i=0;i<3;i++)P(cx-2+i*3,-13,2,1,shade(h,1.3));
  if(FEM&&st==='bun'){}
}

/* 장면 시안: 사람마다 [종류, 자세, x(256 기준), 깊이 dy(+면 앞), 왼쪽 보기, 표정] */
function drawScene(bg,ppl,props,cv){
  const c=cv.getContext('2d'),k2=cv.width/256;c.setTransform(k2,0,0,k2,0,0);PXC={c,k2};const spec=bg+'|'+ppl.map(p=>p[0]).join(',')+'|'+props;const rnd=mkRng(spec);
  const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  c.clearRect(0,0,256,128);PXC.hi=k2>=2;c.setTransform(k2/2,0,0,k2/2,0,0);c.imageSmoothingEnabled=false;c.drawImage(bgCached(bg),0,0);c.setTransform(k2,0,0,k2,0,0);
  const ws=ppl.map(p=>p[0]);const X=BGX[bg];if(X&&X.back)X.back(r,mkRng(spec+'b'),c,ws);
  [...ppl].sort((a,b)=>(a[3]||0)-(b[3]||0)).forEach(([k,pose,x,dy=0,flip,fc])=>{const col=Object.assign({},whoCol(k));if(fc)col.face=fc;
    c.setTransform(k2/2,0,0,k2/2,0,0);PXC.hi=false;
    // 발밑 타원 그림자
    const sx=x*2+18+(POSES[pose].d==='s'?(flip?-2:2):0),sy=199+dy*2;for(let j=-2;j<=2;j++){const w=Math.round(15*Math.sqrt(1-(j/3)**2));c.fillStyle='rgba(20,16,30,'+(.22-Math.abs(j)*.03)+')';c.fillRect(sx-w,sy+j,w*2,1)}
    personP(r,x*2,130+dy*2,col,pose,flip);c.setTransform(k2,0,0,k2,0,0);PXC.hi=k2>=2});
  if(X&&X.front)X.front(r,mkRng(spec+'f'),c,ws);
  (props?props.split(','):[]).forEach(p=>PROPS[p]&&PROPS[p](r,rnd,c));
  c.setTransform(1,0,0,1,0,0);PXC=null}
