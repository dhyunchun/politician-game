/* ── 도트 3판 소품·앞줄 관중: 픽셀 격자에 그린 뒤 외곽선을 둘러 캐시한다 ── */
function PG3(w,h){w=Math.ceil(w);h=Math.ceil(h);const g=new Array(w*h).fill(null);
  const set=(x,y,c)=>{if(x<0||y<0||x>=w||y>=h||!c)return;g[y*w+x]=c};
  const A={w,h,set,
    R(x,y,ww,hh,c){x=Math.round(x);y=Math.round(y);ww=Math.max(1,Math.round(ww));hh=Math.max(1,Math.round(hh));for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)set(x+i,y+j,c)},
    E(cx,cy,rx,ry,c,tone){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const u=(x+.5-cx)/rx,v=(y+.5-cy)/ry;if(u*u+v*v<=1)set(x,y,tone?tone(u,v):c)}},
    P(pts,c,tone){let y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;for(const[a,b]of pts){y0=Math.min(y0,b);y1=Math.max(y1,b);x0=Math.min(x0,a);x1=Math.max(x1,a)}
      for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++)if(inPoly3(pts,x+.5,y+.5))set(x,y,tone?tone((x+.5-x0)/(x1-x0||1),(y+.5-y0)/(y1-y0||1)):c)},
    L(ax,ay,bx,by,c,t=1){const n=Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay)))||1;for(let i=0;i<=n;i++)A.R(ax+(bx-ax)*i/n-(t-1)/2,ay+(by-ay)*i/n-(t-1)/2,t,t,c)},
    canvas(ol){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;let cl=g[i];
        if(!cl&&ol!==false){const nb=(x>0&&g[i-1])||(x<w-1&&g[i+1])||(y>0&&g[i-w])||(y<h-1&&g[i+w]);if(nb)cl=shade(nb,.3)}
        if(cl){c.fillStyle=cl;c.fillRect(x,y,1,1)}}
      return cv}};return A}
const P3C=new Map();
function p3(key,w,h,fn){let cv=P3C.get(key);if(!cv){const g=PG3(w,h);fn(g);cv=g.canvas();if(P3C.size>90)P3C.clear();P3C.set(key,cv)}return cv}
const t3=(c,a=1.16,b=.8)=>u=>shade(c,u<.18?a:u>.78?b:1);

/* 연단: 윗판·몸통·받침, 문장, 가는 마이크 두 개 */
function hdPodium(c,cx,fy){const m=mz(fy),w=Math.round(.62*m),h=Math.round(1.0*m),tw=Math.round(w*1.24),mh=Math.round(.2*m),W=tw+6,Hh=h+mh+6;
  const cv=p3('pod'+w,W,Hh,g=>{const mx=W>>1,top=mh+3,cap=Math.max(4,Math.round(.07*m)),x0=mx-(w>>1),bot=top+h;
    // 마이크(가는 목 + 작은 머리)
    for(const s of[-1,1]){const bx=mx+s*Math.round(.11*m),tx=mx+s*Math.round(.05*m);g.L(bx,top,tx,top-mh+3,'#2a2d34',1);g.R(tx-1,top-mh,3,4,'#3a3f48');g.R(tx-1,top-mh,1,1,'#8a929c')}
    // 몸통
    g.R(x0,top+cap,w,h-cap,'#8a5a33');g.R(x0,top+cap,2,h-cap,'#a8744a');g.R(x0+w-3,top+cap,3,h-cap,'#6b4426');
    g.R(x0+5,top+cap+5,w-10,1,'#6b4426');g.R(x0+5,bot-9,w-10,1,'#a8744a');g.R(x0+5,top+cap+5,1,h-cap-13,'#6b4426');g.R(x0+w-6,top+cap+5,1,h-cap-13,'#a8744a');
    g.R(x0,top+cap,w,2,'#5a3a20');
    // 받침
    g.R(x0-2,bot-5,w+4,5,'#6b4426');g.R(x0-2,bot-5,w+4,1,'#a8744a');
    // 윗판
    g.R(mx-(tw>>1),top,tw,cap,'#c08a52');g.R(mx-(tw>>1),top,tw,1,'#e2b47c');g.R(mx-(tw>>1),top+cap-1,tw,1,'#9a6a3a');
    // 문장
    const er=Math.max(4,Math.round(.13*m)),ey=top+Math.round(.44*m);g.E(mx,ey,er,er,'#e8b94a',(u,v)=>shade('#e8b94a',u+v<-.5?1.3:u+v>.5?.74:1));
    g.E(mx,ey,er*.62,er*.62,'#2a58b0',(u,v)=>shade('#2a58b0',u+v<-.4?1.25:u+v>.5?.78:1))});
  c.drawImage(cv,Math.round(cx-W/2),Math.round(fy-Hh+3))}

/* 종이 상자 세 개: 앞면 + 위에서 보이는 윗면, 테이프와 송장 */
function hdBoxes(c,cx,fy){const m=mz(fy),w=Math.round(.5*m),h=Math.round(.36*m),d=Math.max(3,Math.round(h*.3)),W=w*2+10,Hh=h*2+d+6;
  const cv=p3('box'+w,W,Hh,g=>{const fl=Hh-2,box=(x,y)=>{
      g.P([[x+3,y-h-d],[x+w-3,y-h-d],[x+w,y-h],[x,y-h]],'#e6bd84');g.R(x+3,y-h-d,w-6,1,'#f4d8a8');g.R(x+(w>>1)-2,y-h-d,4,d,'#f2e2bc');
      g.R(x,y-h,w,h,'#c8975c');g.R(x,y-h,w,1,'#a87a44');g.R(x,y-h+1,w,1,'#dcb078');g.R(x+w-3,y-h+2,3,h-2,'#ad7f48');g.R(x,y-3,w,3,'#b48650');
      g.R(x+(w>>1)-2,y-h+1,4,Math.round(h*.42),'#e6d3a6');
      const lw=Math.round(w*.4),lh=Math.max(4,Math.round(h*.26)),lx=x+4,ly=y-Math.round(h*.44);g.R(lx,ly,lw,lh,'#f8f5ea');g.R(lx+1,ly+1,lw-3,1,'#8a929c');if(lh>4)g.R(lx+1,ly+3,lw-6,1,'#b8c0c8')};
    box(3,fl);box(w+6,fl);box(3+(w>>1)+2,fl-h)});
  c.drawImage(cv,Math.round(cx-W/2),Math.round(fy-Hh+2))}

/* 의사봉: 받침 위에 머리를 올리고 자루는 옆으로 */
function gavelArt(m){const gw=Math.round(.62*m)+6,gh=Math.round(.2*m)+8;
  return p3('gavel'+Math.round(m),gw,gh,g=>{const fl=gh-2,bw=Math.round(.3*m),bh=Math.max(3,Math.round(.05*m)),hw=Math.round(.25*m),hh=Math.max(5,Math.round(.11*m)),x0=3;
    g.R(x0,fl-bh,bw,bh,'#5a3a20');g.R(x0,fl-bh,bw,1,'#8a5a3a');g.R(x0+bw-2,fl-bh+1,2,bh-1,'#3e2814');
    const hx=x0+((bw-hw)>>1),hy=fl-bh-hh;
    // 자루
    g.L(hx+hw-2,hy+(hh>>1),gw-4,fl-2,'#6b4426',2);g.L(hx+hw-2,hy+(hh>>1)-1,gw-5,fl-3,'#9a6a3e',1);
    // 머리(가로 원통)
    g.R(hx,hy,hw,hh,'#8a5a33');g.R(hx,hy,hw,1,'#b8844e');g.R(hx,hy+hh-2,hw,2,'#6b4426');
    const bd=Math.max(2,Math.round(hw*.12));g.R(hx+bd,hy,bd,hh,'#e8b94a');g.R(hx+hw-bd*2,hy,bd,hh,'#e8b94a');g.R(hx+bd,hy,bd,1,'#ffe48a');g.R(hx+hw-bd*2,hy,bd,1,'#ffe48a');g.R(hx+bd,hy+hh-2,bd,2,'#b8862a');g.R(hx+hw-bd*2,hy+hh-2,bd,2,'#b8862a')})}
function hdGavel(c,cx,fy){const m=mz(fy);hdTable(c,cx-.42*m,cx+.42*m,fy,{cloth:'#2f3f6a'});const cv=gavelArt(m);c.drawImage(cv,Math.round(cx-cv.width/2+.06*m),Math.round(fy-.74*m-.1*m-cv.height+2))}
function hdBenchGavel(c,cx,y){const cv=gavelArt(48);c.drawImage(cv,Math.round(cx-cv.width/2),y-cv.height+2)}

/* 판사석 의자: 등받이 높은 가죽 의자(법대 뒤라 윗부분만 보인다) */
function hdJChair(c,cx,yb){const W=42,Hh=64;
  const cv=p3('jchair',W,Hh,g=>{g.P([[4,Hh],[4,10],[8,4],[14,2],[W-14,2],[W-8,4],[W-4,10],[W-4,Hh]],'#4a2a1a',u=>shade('#4a2a1a',u<.12?1.12:u>.85?.75:1));
    g.P([[8,Hh],[8,12],[11,8],[15,6],[W-15,6],[W-11,8],[W-8,12],[W-8,Hh]],'#7a1e28',u=>shade('#7a1e28',u<.22?1.2:u>.72?.74:1));
    for(let j=0;j<4;j++)for(let i=0;i<3;i++){const x=13+i*8+(j%2?0:0),y=14+j*12;g.R(x,y,2,2,'#4e1018');g.R(x,y,1,1,'#b04a56')}});
  c.drawImage(cv,Math.round(cx-W/2),yb-Hh)}

/* 화이트보드 차트: 바퀴 달린 받침대 위 */
function hdChart(c,cx,fy){const m=mz(fy),bw=Math.round(1.25*m),bh=Math.round(.85*m),lg=Math.round(.9*m),W=bw+12,Hh=bh+lg+6;
  const cv=p3('chart'+bw,W,Hh,g=>{const x0=6,y0=2,fl=y0+bh+lg;
    for(const x of[x0+4,x0+bw-7]){g.R(x,y0+bh-2,3,lg,'#8a929c');g.R(x,y0+bh-2,1,lg,'#c0c8d0');g.R(x-5,fl-2,13,3,'#5a626c');g.R(x-5,fl-2,13,1,'#8a929c')}
    g.R(x0+5,y0+bh+Math.round(lg*.5),bw-10,2,'#6d7682');
    g.R(x0,y0,bw,bh,'#aeb6c0');g.R(x0,y0,bw,1,'#dde3e8');g.R(x0+2,y0+2,bw-4,bh-6,'#fbfbf8');g.R(x0+bw-5,y0+2,3,bh-6,'#e4e6e2');
    g.R(x0,y0+bh-3,bw,3,'#8a929c');g.R(x0,y0+bh-3,bw,1,'#b8c0c8');g.R(x0+7,y0+bh-4,5,1,'#e0384c');g.R(x0+14,y0+bh-4,5,1,'#2f6be0');
    const ix=x0+6,iw=bw-14,by=y0+bh-9;g.R(ix,y0+5,Math.round(iw*.45),2,'#5a6470');g.R(ix,y0+9,Math.round(iw*.28),1,'#aeb6c0');g.R(ix,by,iw,1,'#8a929c');
    const gap=iw/5;[.3,.46,.38,.62,.84].forEach((v,i)=>{const hh=Math.round((bh-24)*v),bx=Math.round(ix+gap*i+gap*.2),ww=Math.max(3,Math.round(gap*.6)),cl=i===4?'#e0384c':'#3a9e6a';g.R(bx,by-hh,ww,hh,cl);g.R(bx,by-hh,1,hh,shade(cl,1.3));g.R(bx+ww-1,by-hh,1,hh,shade(cl,.72))})});
  c.drawImage(cv,Math.round(cx-W/2),Math.round(fy-Hh+3))}

/* 축하 화환: 삼각 받침, 꽃 세 단, 리본 두 줄 */
function hdWreath(c,cx,fy){const m=mz(fy),R1=Math.round(.3*m),W=R1*2+14,Hh=Math.round(2.0*m)+6;
  const cv=p3('wreath'+R1,W,Hh,g=>{const mx=W>>1,fl=Hh-3,G='#2f6a3a';
    g.L(mx-1,R1*2.4,mx-R1*.85,fl,'#6b4426',2);g.L(mx+1,R1*2.4,mx+R1*.85,fl,'#5a3a20',2);g.L(mx,R1*2.4,mx,fl-2,'#7a5230',2);
    const tier=(cy,r,cols)=>{g.E(mx,cy,r+2.5,r+2.5,G,(u,v)=>shade(G,u+v<-.5?1.3:u+v>.5?.72:1));
      for(let rho=r-2.5,k=0;rho>=0;rho-=5.2,k++){const n=rho<2?1:Math.round(6.283*rho/5.6);for(let i=0;i<n;i++){const a=i/n*6.283+k*.5,x=mx+rho*Math.cos(a),y=cy+rho*Math.sin(a),cl=cols[(k+(i%2))%cols.length];
        g.E(x,y,2.6,2.6,cl,(u,v)=>shade(cl,u+v<-.5?1.18:u+v>.6?.8:1));g.set(Math.round(x-.5),Math.round(y-.5),'#f2c14e')}}};
    tier(R1+3,R1*.82,['#ffffff','#f4a6b8']);tier(R1*2.5,R1,['#ffe27a','#ffffff','#f28a3a']);tier(R1*3.95,R1*.8,['#e0486a','#ffffff']);
    const ry0=Math.round(R1*2.7),rl=Math.round(1.02*m),rw=Math.max(4,Math.round(.085*m));
    for(const[dx,sk]of[[-rw-1,-.07],[2,.07]])for(let j=0;j<rl;j++){const x=Math.round(mx+dx+sk*j);g.R(x,ry0+j,rw,1,j<2?'#e0486a':'#fbf6ee');g.R(x+rw-1,ry0+j,1,1,'#d8cebc');if(j%6>1&&j>5&&j<rl-4)g.R(x+(rw>>1)-1,ry0+j,2,1,'#2a2d34')}});
  c.drawImage(cv,Math.round(cx-W/2),Math.round(fy-Hh+3))}

/* 방송 카메라: 삼각대 위, 렌즈는 화면 가운데 쪽 */
function hdTvCam(c,cx,fy,toRight){const m=mz(fy),W=Math.round(1.0*m)+6,Hh=Math.round(1.72*m)+6;
  const cv=p3('tvcam'+Math.round(m)+(toRight?'r':'l')+PF,W,Hh,g=>{const fl=Hh-3,q=v=>Math.round(v*m),r=(x,y,w,h,cl)=>g.R(toRight?x:W-x-w,y,w,h,cl),l=(a,b,c2,d,cl,t)=>g.L(toRight?a:W-1-a,b,toRight?c2:W-1-c2,d,cl,t);
    const ax=3+q(.42),ay=3+q(.66);
    l(ax,ay,3+q(.08),fl,'#3a3f48',2);l(ax,ay,3+q(.8),fl,'#2a2d34',2);l(ax,ay,ax+1,fl-2,'#4a5060',2);l(3+q(.26),ay+q(.5),3+q(.6),ay+q(.5),'#2a2d34',1);
    r(ax-3,ay-q(.09),8,q(.09)+1,'#4a5060');r(ax-5,ay-q(.11),12,2,'#2a2d34');
    const bx=3+q(.16),by=3+q(.24),bw=q(.52),bh=q(.3);
    r(bx,by,bw,bh,'#2a2d34');r(bx,by,bw,1,'#5a626c');r(bx,by+bh-2,bw,2,'#1b1b22');r(bx+3,by+4,q(.2),q(.12),'#3a3f48');r(bx+4,by+5,q(.2)-3,1,'#8a929c');r(bx+bw-q(.14),by+3,q(.1),2,'#f4f1ea');
    // 렌즈·후드
    r(bx+bw,by+q(.05),q(.14),q(.2),'#1b1b22');r(bx+bw+q(.14),by+q(.02),q(.08),q(.26),'#3a3f48');r(bx+bw+q(.14)+q(.08)-2,by+q(.05),2,q(.2),'#7fb3d5');r(bx+bw+q(.14)+q(.08)-2,by+q(.05),2,2,'#d9eef9');
    // 뷰파인더·손잡이·표시등
    r(bx-q(.1),by-q(.04),q(.16),q(.12),'#3a3f48');r(bx-q(.1),by-q(.04),2,q(.12),'#5a8fb8');
    r(bx+q(.1),by-q(.07),q(.3),2,'#4a5060');r(bx+q(.1),by-q(.07),2,q(.07),'#4a5060');r(bx+q(.38),by-q(.07),2,q(.07),'#4a5060');
    r(bx+bw-4,by-2,3,2,PF?'#ff6a5a':'#a82a20')});
  c.drawImage(cv,Math.round(cx-W/2),Math.round(fy-Hh+3))}

/* ── 앞줄 관객 뒷모습(가장 가까운 줄, 화면 아래를 가림) ── */
function backHead3(g,cx,cy,o){const h=o.hair,col=o.cloth,s=o.skin,st=o.st,r=o.r||16,ry=r+2,ny=cy+ry-2;
  const tn=(c,k=1)=>(u,v)=>{const t=u*.62+v*.5;return shade(c,t<-.5?1+.32*k:t<.1?1:t<.52?1-.2*k:1-.36*k)};
  // 어깨·등
  g.P([[cx-9,ny+4],[cx+9,ny+4],[cx+29,ny+11],[cx+38,ny+24],[cx+41,g.h],[cx-41,g.h],[cx-38,ny+24],[cx-29,ny+11]],col,u=>shade(col,u<.17?1.2:u>.68?.78:1));
  if(o.hood)g.E(cx,ny+9,13,6,col,(u,v)=>shade(col,v<-.3?.92:.72));
  else g.P([[cx-9,ny+3],[cx+9,ny+3],[cx+12,ny+7],[cx-12,ny+7]],'#f1f1ee',u=>u>.68?'#c8ccd2':'#f4f4f0');
  // 목·귀
  g.R(cx-6,ny-5,12,9,s);g.R(cx+2,ny-5,4,9,shade(s,.84));g.R(cx-6,ny+3,12,1,shade(s,.72));
  if(st!=='bob'&&st!=='long'){g.E(cx-r+.5,cy+3,2.6,4,s);g.E(cx+r-.5,cy+3,2.6,4,shade(s,.8))}
  // 머리
  if(st==='bald'){g.E(cx,cy,r,ry,s,tn(s,.45));g.E(cx,cy,r,ry,h,(u,v)=>v>.02+.34*(1-u*u)?tn(h)(u,v):null)}
  else if(st==='cap'){g.E(cx,cy,r,ry,h,tn(h));const cc=o.cap||'#2f6be0';g.E(cx,cy-1,r+.6,ry,cc,(u,v)=>v<.34?tn(cc)(u,v):null);
    g.E(cx,cy+ry*.3,5,4,h,(u,v)=>v<.2?shade(h,.8):null);g.R(cx-5,cy+Math.round(ry*.3),10,1,shade(cc,.7));g.R(cx-1,cy-ry-1,3,2,shade(cc,1.2))}
  else{if(st==='bun'){g.E(cx,cy-ry-2,7,6,h,tn(h));g.R(cx-4,cy-ry+3,8,1,'#c2321f')}
    g.E(cx,cy,r,ry,h,tn(h));
    if(st==='bob'||st==='long'){const bot=cy+ry+(st==='long'?24:5),e=st==='long'?4:2,pts=[[cx-r,cy],[cx+r,cy],[cx+r+e,bot-3]];
      if(st==='long')for(let i=0;i<=6;i++)pts.push([cx+r+e-(2*r+2*e)*i/6,bot-(i%2?0:4)]);else pts.push([cx+r+e-1,bot],[cx-r-e+1,bot]);
      pts.push([cx-r-e,bot-3]);g.P(pts,h,u=>shade(h,u<.14?1.2:u>.66?.7:u>.4?.84:1));
      for(const dx of[-r*.45,r*.2])g.L(cx+dx,cy+ry-4,cx+dx*1.1,bot-5,shade(h,.72),1)}
    else for(const dx of[-9,-4,2,7]){const ye=cy+ry*Math.sqrt(1-dx*dx/(r*r));g.R(cx+dx,ye-1,2,3,shade(h,dx>0?.66:.84))}
    // 윤기
    g.E(cx,cy,r,ry,h,(u,v)=>{const rho=Math.hypot(u,v);return rho>.5&&rho<.66&&u<-.05&&v<-.12&&u>-.6?shade(h,1.5):null})}}
const BH3={hair:['#1f1f1f','#3a2a20','#4a2f1f','#c8c8c8','#6b4426','#222222','#2b2421','#8a8a8a'],cloth:['#e0a93f','#5b9e6a','#7a6bd1','#d95f5f','#4b8fd1','#c9a36b','#3a9e9a','#55606e'],
  st:['short','bob','short','long','bald','short','bun','cap','short','bob'],skin:['#f1c7a0','#e0b08a','#f1c7a0','#eab890']};
function frontHeads(c,rnd){const L=[];for(let i=0;i<10;i++){const st=BH3.st[i],hair=st==='bald'?'#b8b8b8':BH3.hair[(i*5)%BH3.hair.length];
    L.push({i,x:i*56-10+(rnd()*10|0),y:297+(i%2)*6-((i+PF)%3===0?1:0),o:{st,hair,cloth:BH3.cloth[(i*3)%BH3.cloth.length],skin:BH3.skin[i%4],r:15+(i*7)%3,hood:i%4===2,cap:['#c2321f','#2f6be0'][i%2]}})}
  L.sort((a,b)=>a.y-b.y).forEach(q=>{const cv=p3('bh'+q.i,92,72,g=>backHead3(g,46,30,q.o));c.drawImage(cv,q.x-46,q.y-30)})}
