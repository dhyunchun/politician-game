/* ── 도트 4판 배경: 사람은 그대로, 배경 완성도(광원·그늘·질감·소품 밀도)를 올린다.
   집무실은 새로 그리고(bgOffice4), 나머지는 3판 배경 위에 덧그린다(D4OVER). proto/dot3_sync.py가 game.html에 넣는다. ── */
// 결정적 난수(배경이 매번 같게)
function d4rng(seed){let h=2166136261;for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return(h>>>0)/4294967296}}
// 체크무늬 반투명(디더) 그늘: k=0..1 밀도
function d4sh(H,x,y,w,h,col,k=.5){const{P}=H;x=Math.round(x);y=Math.round(y);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const t=((i+j)&1)?k>.25:((i&1)&&(j&1)?k>.75:k>.5);if(t)P(x+i,y+j,1,1,col)}}
// 위에서 아래로 짙어지는 접지 그늘(벽·바닥 이음매, 가구 밑)
function d4ao(H,x,y,w,col){d4sh(H,x,y,w,1,col,.9);d4sh(H,x,y+1,w,1,col,.6);d4sh(H,x,y+2,w,2,col,.3)}

/* ===== 집무실 ===== */
function bgOffice4(c,H){const{P,blob}=H,r=d4rng('office4');
  // 천장: 몰딩 + 매입 조명 + 환기구
  P(0,0,512,34,'#ece6da');for(let n=0;n<4;n++){const y=[30,22,12,2][n];P(0,y,512,1,'#ddd5c6')}
  for(const[x,y,w]of[[96,26,40],[216,26,80],[376,26,40],[40,15,30],[256,15,60],[472,15,30]]){H.raw(true);P(x-w/2,y,w,3,'#fffbe8');P(x-w/2+2,y+3,w-4,1,'#fff3c0');H.raw(false)}
  P(150,6,34,7,'#c9c2b4');for(let k=0;k<6;k++)P(152+k*5,7,3,5,'#9a9486');P(330,7,8,4,'#f6f6f6');P(333,9,2,1,'#e0384c');
  // 벽: 벽지 결 + 크라운 몰딩 + 몰딩 그늘
  P(0,34,512,166,'#ebe1c9');for(let x=3;x<512;x+=8)P(x,40,1,110,'#e3d8bd');for(let x=7;x<512;x+=16)d4sh(H,x,40,1,110,'#f2eadb',.5);
  P(0,34,512,6,'#d9ccad');P(0,34,512,1,'#fff6de');P(0,38,512,1,'#c2b392');P(0,39,512,1,'#a8987a');d4sh(H,0,40,512,3,'#cdbf9f',.5);
  // 징두리 판벽(웨인스코팅)
  P(0,148,512,46,'#8f6238');P(0,148,512,3,'#b07c4a');P(0,148,512,1,'#d4a26c');P(0,151,512,1,'#5a3a20');
  for(let x=6;x<512;x+=62){P(x,157,54,30,'#82572f');P(x,157,54,1,'#5a3a20');P(x,157,1,30,'#5a3a20');P(x,186,54,1,'#b07c4a');P(x+53,157,1,30,'#b07c4a');P(x+4,161,46,22,'#8a5e35')}
  P(0,194,512,6,'#4e3018');P(0,194,512,1,'#7a5232');
  // ── 왼쪽: 책장(위 유리장 + 아래 수납) ──
  {const x=10,w=96,y=40;P(x-2,y-2,w+4,162,'#2a1a10');P(x,y,w,160,'#6b4426');P(x,y,w,3,'#8a5a33');P(x,y,3,160,'#7e5530');P(x+w-3,y,3,160,'#4a2e18');
    const bc=['#c2321f','#2f6be0','#3a9e6a','#e8a33a','#7a3fb0','#efe8d6','#35507a','#8a5a33','#1f5a4a','#b8862a'];
    for(let s=0;s<4;s++){const sy=y+6+s*27;P(x+4,sy,w-8,22,'#3e2614');d4sh(H,x+4,sy,w-8,3,'#24160b',.6);
      let bx=x+6,i=s*5;const obj=s===1?'cup':s===2?'photo':s===3?'globe':null,ox=s%2?x+w-26:x+10;
      while(bx<x+w-8){if(obj&&bx>=ox&&bx<ox+20){bx=ox+20;continue}const bw=3+((i*5)%3),bh=12+((i*7)%7),cl=bc[(i*3+s)%10];
        if(i%9===4&&bx<x+w-16){P(bx,sy+22-4,12,4,cl);P(bx,sy+22-4,12,1,shade(cl,1.3));P(bx,sy+22-8,10,4,bc[(i+2)%10]);bx+=13;i++;continue}
        P(bx,sy+22-bh,bw,bh,cl);P(bx,sy+22-bh,1,bh,shade(cl,1.28));P(bx+bw-1,sy+22-bh,1,bh,shade(cl,.75));if(bh>14)P(bx,sy+22-bh+3,bw,1,shade(cl,1.45));bx+=bw;i++}
      if(obj==='cup'){P(ox+6,sy+18,8,4,'#8a5a14');P(ox+8,sy+14,4,4,'#c8901f');blob(ox+10,sy+9,6,6,['#fff1a8','#f2c14e','#c8901f','#8a5a14'],'#5a3a10');P(ox+3,sy+6,2,6,'#c8901f');P(ox+15,sy+6,2,6,'#c8901f')}
      if(obj==='photo'){P(ox+2,sy+5,15,17,'#2a1a10');P(ox+3,sy+6,13,15,'#e8d9b0');P(ox+4,sy+7,11,11,'#8fbfdc');P(ox+6,sy+11,3,7,'#2a2d34');P(ox+10,sy+12,3,6,'#2a2d34');P(ox+6,sy+9,3,3,'#f1c7a0');P(ox+10,sy+10,3,3,'#f1c7a0')}
      if(obj==='globe'){blob(ox+10,sy+10,7,7,['#9fd0ee','#5aa0d8','#3a78b0','#285a84'],'#1d2a3a');P(ox+7,sy+7,4,3,'#6fbf5a');P(ox+11,sy+12,3,3,'#6fbf5a');P(ox+9,sy+18,3,3,'#8a5a14');P(ox+6,sy+21,9,1,'#5a3a20')}
      P(x+3,sy+22,w-6,3,'#8a5a33');P(x+3,sy+22,w-6,1,'#a8744a')}
    // 유리문 반사
    const cy=y+116;P(x+3,cy,w-6,41,'#5e3c20');for(const dx of[0,(w-6)/2]){P(x+5+dx,cy+3,(w-6)/2-4,35,'#6b4426');P(x+5+dx,cy+3,(w-6)/2-4,1,'#8a5a33');P(x+8+dx,cy+6,(w-6)/2-10,29,'#734a2a');P(x+dx+(w-6)/2-6,cy+17,2,8,'#e2b04a')}}
  d4sh(H,106,40,4,160,'#bfae8a',.5);// 책장 옆 그늘
  // ── 사이드보드 + 큰 액자(현장 사진) + 상패 ──
  {const x=124,w=96;P(x,166,w,28,'#5e3c20');P(x,163,w+4,4,'#8a5a33');P(x,163,w+4,1,'#b07c4a');P(x-2,163,w+6,1,'#c48f58');
    for(let i=0;i<3;i++){P(x+4+i*31,170,28,20,'#6b4426');P(x+4+i*31,170,28,1,'#8a5a33');P(x+16+i*31,178,4,2,'#e2b04a')}P(x+2,194,w,2,'#2a1a10');
    // 위 소품: 상패, 액자, 작은 화분
    P(x+8,150,18,13,'#2a1a10');P(x+9,151,16,11,'#b8862a');P(x+11,153,12,7,'#f2d27a');P(x+12,155,10,1,'#8a5a14');P(x+12,157,7,1,'#8a5a14');P(x+6,162,22,1,'#2a1a10');
    P(x+36,146,22,17,'#2a1a10');P(x+37,147,20,15,'#f4f1ea');P(x+39,149,16,10,'#6aa0c8');P(x+41,153,4,6,'#1f2a3a');P(x+47,152,4,7,'#1f2a3a');P(x+41,151,3,2,'#f1c7a0');P(x+47,150,3,2,'#f1c7a0');P(x+44,155,4,1,'#f1c7a0');
    P(x+72,152,12,11,'#c06a3a');P(x+72,152,12,2,'#e08a5a');blob(x+78,146,7,6,['#9bd66f','#62ad4c','#3f823b','#2a5a2c'],'#1a3a20');blob(x+74,142,4,4,['#9bd66f','#62ad4c','#3f823b','#2a5a2c']);
    // 액자: 취임식 군중 사진
    const fx=x+8,fy=66,fw=82,fh=52;P(fx-3,fy-3,fw+6,fh+6,'#2a1a10');P(fx-2,fy-2,fw+4,fh+4,'#c8a06a');P(fx-2,fy-2,fw+4,1,'#f2d4a0');P(fx+fw+1,fy-2,1,fh+4,'#8a6a3a');
    P(fx,fy,fw,fh,'#f6f1e2');P(fx+3,fy+3,fw-6,fh-6,'#7fb0d8');P(fx+3,fy+3+(fh-6)*.55,fw-6,(fh-6)*.45,'#c8b896');P(fx+3,fy+3,fw-6,6,'#a8cce8');
    P(fx+30,fy+12,22,10,'#e0384c');P(fx+30,fy+12,22,2,'#f4f1ea');for(let i=0;i<14;i++){const hx=fx+5+i*5+((i*3)%2),hy=fy+29+(i%3)*3;P(hx,hy,3,3,['#2a2d34','#4a2f1f','#1f1f1f'][i%3]);P(hx,hy+3,3,5,['#2f6be0','#3a4048','#e0384c','#f2c14e'][i%4])}
    P(fx+38,fy+22,4,4,'#f1c7a0');P(fx+38,fy+20,4,2,'#1f1f1f');P(fx+37,fy+26,6,6,'#2f6be0');P(fx+42,fy+24,2,4,'#f1c7a0')}
  d4ao(H,124,194,100,'#3a2412');
  // ── 가운데: 시계, 국기(받침대), 표창장 두 장 ──
  blob(256,60,12,12,['#ffffff','#f6f6f6','#e2e4e6','#c6ccd2'],'#2a2d34');for(let a=0;a<12;a++)P(256+Math.round(9*Math.cos(a*.5236)),60+Math.round(9*Math.sin(a*.5236)),1,1,'#8a929c');P(256,52,1,8,'#2a2d34');P(256,60,6,1,'#2a2d34');P(256,60,1,1,'#e0384c');
  for(const fx of[222,250]){P(fx-1,82,24,30,'#2a1a10');P(fx,83,22,28,'#b8862a');P(fx+2,85,18,24,'#fbf6ea');P(fx+5,88,12,1,'#8a5a14');for(let l=0;l<5;l++)P(fx+4,92+l*3,14-(l%2)*4,1,'#b8ad92');P(fx+13,103,4,4,'#c2321f')}
  {const px=284;P(px,74,2,120,'#c8901f');P(px,74,1,120,'#ffe48a');blob(px+1,72,3,3,['#fff1a8','#f2c14e','#c8901f','#8a5a14']);P(px-6,192,14,4,'#8a5a14');P(px-4,188,10,4,'#b8862a');P(px-4,188,10,1,'#ffe48a');
    // 늘어진 태극기(주름)
    const fw=30,fh=40;for(let j=0;j<fh;j++){const sw=Math.round(2*Math.sin(j/5));P(px+2,78+j,fw-Math.abs(sw),1,j%10<5?'#ffffff':'#f0ede6')}
    blob(px+15,96,6,6,['#e0384c','#c2321f','#c2321f','#a01a2a']);P(px+9,96,13,6,'#2f6be0');P(px+10,96,11,1,'#e0384c');for(const[a,b]of[[5,84],[21,84],[5,108],[21,108]])P(px+a,b,5,3,'#1f1f1f');d4sh(H,px+2,78,6,40,'#d8d4cc',.5)}
  // ── 오른쪽: 창(블라인드·커튼) ──
  {const x=336,y=48,w=154,h=100;P(x-6,y-6,w+12,h+14,'#f2ede4');P(x-6,y+h+4,w+12,4,'#d8cfbf');P(x-8,y+h+6,w+16,3,'#c4b8a2');P(x-2,y-2,w+4,h+4,'#5a626c');
    // 바깥 풍경: 하늘·먼 빌딩·가까운 빌딩
    H.raw(true);P(x,y,w,h,'#9fd0ee');P(x,y+40,w,30,'#b4dcf4');P(x,y+70,w,30,'#cbe7f8');
    [[0,50,22,'#a9bfd4'],[18,34,18,'#9fb6cc'],[40,58,26,'#aec4d8'],[70,28,20,'#9ab2c8'],[94,46,24,'#a9bfd4'],[122,36,18,'#9fb6cc'],[144,52,24,'#aec4d8']].forEach(([dx,dy,bw,cl])=>{P(x+dx,y+dy,bw,h-dy,cl);P(x+dx,y+dy,1,h-dy,shade(cl,1.08));for(let yy=y+dy+4;yy<y+h-2;yy+=5)for(let xx=x+dx+3;xx<x+dx+bw-3;xx+=4)P(xx,yy,2,2,shade(cl,1.12))});
    [[8,68,30,'#7a92aa'],[60,74,34,'#6e86a0'],[118,64,30,'#7a92aa']].forEach(([dx,dy,bw,cl])=>{P(x+dx,y+dy,bw,h-dy,cl);for(let yy=y+dy+4;yy<y+h-2;yy+=6)for(let xx=x+dx+3;xx<x+dx+bw-4;xx+=5)P(xx,yy,3,3,'#9fbad2')});H.raw(false);
    // 블라인드(위 35% 내려옴)
    for(let yy=y;yy<y+36;yy+=4){P(x,yy,w,3,'#f4f1ea');P(x,yy+2,w,1,'#d6d0c4')}P(x,y+36,w,3,'#c8c0b0');P(x+w/2-30,y+38,1,10,'#8a929c');P(x+w/2+30,y+38,1,10,'#8a929c');
    P(x+w/2-1,y,3,h,'#e9ecef');P(x+w/2,y,1,h,'#ffffff');for(let i=0;i<26;i++){P(x+10+i,y+h-4-i,1,1,'#ffffff');P(x+w/2+12+i,y+h-4-i,1,1,'#ffffff')}
    // 커튼(주름)
    for(const[cx,cw]of[[x-14,22],[x+w-8,22]]){P(cx,y-12,cw,h+50,'#7a2a34');for(let k=0;k<cw;k+=5){P(cx+k,y-12,2,h+50,'#9a3a44');P(cx+k+3,y-12,1,h+50,'#5a1a22')}P(cx,y+h+36,cw,2,'#5a1a22')}
    P(x-18,y-16,w+36,5,'#c8901f');P(x-18,y-16,w+36,1,'#ffe48a')}
  // ── 집무 책상(뒤쪽) + 높은 의자 ──
  {const x=346,w=124;// 의자 등받이
    P(394,124,30,46,'#1f1410');P(396,126,26,44,'#3a2418');for(let k=0;k<3;k++)for(let j=0;j<4;j++){P(400+k*8,132+j*9,2,2,'#24160e');P(400+k*8,132+j*9,1,1,'#5a3a28')}P(396,126,26,3,'#5a3a28');
    P(x-2,164,w+4,6,'#3e2614');P(x-2,164,w+4,1,'#a8744a');P(x,168,w,26,'#5a3a20');P(x,168,w,1,'#8a5a33');for(let gx=x+4;gx<x+w-4;gx+=9)d4sh(H,gx,172,1,20,'#4a2e18',.5);
    P(x+6,172,w-12,18,'#4a2e18');P(x+6,172,w-12,1,'#3a2412');P(x+6,189,w-12,1,'#6b4426');
    // 책상 위: 모니터, 서류 더미, 명패, 스탠드, 전화
    P(x+12,140,32,22,'#1d1f24');P(x+14,142,28,17,'#2f4a6a');P(x+16,144,12,2,'#8fbfdc');P(x+16,148,20,1,'#5a7a9a');P(x+16,151,16,1,'#5a7a9a');P(x+26,162,4,3,'#2a2d34');P(x+20,164,16,1,'#2a2d34');
    for(let i=0;i<4;i++){P(x+52,160-i*3,22,3,i%2?'#f4f1ea':'#e8e2d0');P(x+52,160-i*3,22,1,'#ffffff')}P(x+54,148,18,1,'#c8c0b0');
    P(x+80,158,30,7,'#2a1a10');P(x+81,159,28,5,'#c8901f');P(x+83,161,24,1,'#ffe48a');P(x+80,165,30,1,'#1d1a1e');
    P(x+w-14,150,2,14,'#c8901f');P(x+w-20,144,14,6,'#1f6a4a');P(x+w-20,144,14,1,'#4fa07a');P(x+w-19,150,12,1,'#fff1b8');P(x+w-17,163,10,2,'#8a5a14');
    H.raw(true);H.alpha(.18,()=>H.poly([[x+w-20,151],[x+w-6,151],[x+w,166],[x+w-26,166]],'#fff1b8'));H.raw(false);
    P(x+w-38,160,12,5,'#2a2d34');P(x+w-36,158,8,2,'#3a3f48')}
  d4ao(H,340,194,136,'#3a2412');
  // ── 바닥: 원목 쪽마루 + 결 ──
  pfl(H,200,{w:30,q:.28,c:['#b4865a','#a67a4e'],ln:'#86603c',mode:'plank'});
  for(let i=0;i<260;i++){const y=202+Math.floor(r()*118),x=Math.floor(r()*512),l=2+Math.floor(r()*6*((y-118)/82));P(x,y,l,1,r()<.5?'#9a6e44':'#c0946a')}
  d4ao(H,0,200,512,'#5a3a20');
  // 창빛이 바닥에 떨어진다
  H.alpha(.13,()=>H.poly([[318,201],[490,201],[420,312],[176,312]],'#fff4cf'));H.alpha(.07,()=>H.poly([[318,201],[404,201],[300,312],[176,312]],'#ffffff'));
  // 카펫(원근 사다리꼴, 테두리 무늬)
  {const T=[[148,214],[364,214],[492,320],[20,320]],q=(pts)=>H.poly(pts,'#7a2a2e');q(T);
    const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],inset=(k)=>{const c0=[256,267];return T.map(p=>[p[0]+(c0[0]-p[0])*k,p[1]+(c0[1]-p[1])*k])};
    H.poly(inset(.06),'#c8a04a');H.poly(inset(.1),'#7a2a2e');H.poly(inset(.13),'#5e1e24');H.poly(inset(.16),'#8a3238');
    const I=inset(.16);for(let t=.05;t<1;t+=.1){const a=lerp(I[3],I[2],t),b=lerp(I[0],I[1],t);if(((t*10)|0)%2)H.poly([[b[0]-2,b[1]],[b[0]+2,b[1]],[a[0]+4,a[1]],[a[0]-4,a[1]]],'#9a3a40')}
    // 가운데 문양
    H.poly([[256,236],[300,262],[256,292],[212,262]],'#c8a04a');H.poly([[256,242],[290,262],[256,286],[222,262]],'#5e1e24');H.poly([[256,252],[272,262],[256,274],[240,262]],'#c8a04a');
    d4sh(H,0,0,0,0,'#000',0);for(let i=0;i<500;i++){const y=214+Math.floor(r()*106),x=Math.floor(r()*512),s=(y-118)/82,l=(x-256)/s;if(Math.abs(l)<100&&r()<.5)P(x,y,1,1,'#6a2228')}}
  // ── 앞쪽 모서리 화분(화면 밖으로 잘림): 길쭉한 잎
  {const x=14,base=336;P(x-16,base-40,34,40,'#3a3f48');P(x-16,base-40,34,3,'#6a727c');P(x-16,base-37,34,1,'#24272e');P(x+14,base-40,4,40,'#24272e');
    const leaf=(bx,by,ang,len,wd)=>{const ca=Math.cos(ang),sa=Math.sin(ang),tip=[bx+ca*len,by+sa*len],m=[bx+ca*len*.45,by+sa*len*.45],nx=-sa*wd,ny=ca*wd;
      H.poly([[bx,by],[m[0]+nx,m[1]+ny],tip,[m[0]-nx,m[1]-ny]],'#3f8a3a');H.poly([[bx,by],[m[0]+nx*.7,m[1]+ny*.7],tip,m],'#5aaa4a');
      for(let t=.1;t<.95;t+=.04)P(Math.round(bx+ca*len*t),Math.round(by+sa*len*t),1,1,'#2a5a2c')};
    P(x,base-96,2,58,'#5a3a20');P(x+1,base-96,1,58,'#7a5232');
    [[x,base-44,-2.2,40,8],[x,base-48,-1.1,44,9],[x+1,base-62,-2.6,36,8],[x+1,base-66,-.7,38,8],[x,base-80,-2,34,7],[x+1,base-84,-1.25,36,8],[x,base-94,-1.7,30,7]].forEach(a=>leaf(...a))}
}

/* ===== 거리: 기존 거리 위에 덧그리는 세부 ===== */
function streetDetail4(c,H,M){const{P,blob}=H,N=M==='night',WET=M==='rain',r=d4rng('street4'),B=180;if(N||WET)H.nt(true);
  // 건물 벽 밑동 그늘·얼룩
  d4ao(H,0,176,512,'#3a3430');for(const[x,w]of[[2,40],[60,30],[200,24],[400,40]])d4sh(H,x,12+((x*7)%40),w,3,'#00000022',.25);
  // 전봇대 + 변압기 + 전선
  {const px=163;P(px-3,4,7,180,'#8a8478');P(px-3,4,2,180,'#b0aa9c');P(px+3,4,1,180,'#5a554c');for(let y=20;y<176;y+=14)P(px-3,y,7,1,'#7a7468');
    P(px-18,14,37,3,'#5a554c');P(px-18,14,37,1,'#8a8478');P(px-14,26,29,3,'#5a554c');for(const dx of[-16,-8,8,16])P(px+dx,11,2,3,'#d8dde2');
    P(px+4,34,12,20,'#6a7480');P(px+4,34,12,2,'#8a96a2');P(px+13,36,2,16,'#4a5460');P(px+6,40,6,4,'#f2c14e');P(px-6,62,6,30,'#2a2d34');P(px-5,63,4,28,'#f4f1ea');P(px-5,66,4,2,'#2f6be0');P(px-5,72,4,2,'#2f6be0');
    P(px-2,120,6,10,'#f2c14e');P(px-2,120,6,1,'#ffe48a');P(px,122,2,6,'#1f1f1f');
    // 전선(늘어짐)
    const wire=(x0,y0,x1,y1,sag,col)=>{for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){const t=(x-x0)/(x1-x0),y=y0+(y1-y0)*t+sag*4*t*(1-t);P(x,Math.round(y),1,1,col)}};
    for(const[dy,s]of[[0,10],[3,14],[12,9]]){wire(px-17,15+dy,-2,20+dy,s,'#24262c');wire(px+17,15+dy,514,26+dy,s+10,'#24262c')}
    wire(px+4,34,240,96,6,'#3a3d44');wire(px-14,27,96,80,4,'#3a3d44');
    // 전봇대 그늘(오른쪽 아래로 길게)
    if(!N&&!WET)d4sh(H,px+4,182,46,3,'#5a5040',.5)}
  // 쓰레기 봉투 더미(종량제)
  {const gx=176,gy=184;[[0,0,9,7],[10,1,8,6],[5,-6,8,6],[-8,2,7,5]].forEach(([dx,dy,rx,ry],i)=>{blob(gx+dx,gy+dy,rx,ry,['#f6f6f2','#e6e8e2','#cfd4cc','#aab2a8'],'#5a6058');P(gx+dx-1,gy+dy-ry-1,3,2,'#f2d27a')});
    P(gx-12,182,5,6,'#2f6aa8');P(gx-12,182,5,1,'#5a8fd0')}
  // 배달 오토바이(김밥집 앞)
  {const x=296,y=186;blob(x+4,y,7,7,['#3a3f48','#2a2d34','#1d1f24','#121418'],'#0c0d10');blob(x+4,y,3,3,['#c6ccd2','#9aa3ad','#7a828c','#5a626c']);blob(x+34,y,7,7,['#3a3f48','#2a2d34','#1d1f24','#121418'],'#0c0d10');blob(x+34,y,3,3,['#c6ccd2','#9aa3ad','#7a828c','#5a626c']);
    P(x+6,y-10,28,6,'#e8e4d8');P(x+6,y-10,28,1,'#ffffff');P(x+8,y-4,22,4,'#2a2d34');P(x+28,y-18,4,12,'#5a626c');P(x+26,y-20,9,2,'#2a2d34');P(x+32,y-14,6,4,'#e0384c');P(x+33,y-13,3,2,'#ffd86a');
    P(x-4,y-26,20,16,'#c2321f');P(x-4,y-26,20,2,'#e86a5a');P(x+14,y-24,2,14,'#8a1a14');P(x-1,y-20,14,4,'#f4f1ea');P(x+1,y-19,10,2,'#c2321f');P(x+10,y-8,6,1,'#1d1f24')}
  // 볼라드(스테인리스)
  for(const bx of[232,262,292]){P(bx,186,4,12,'#9aa3ad');P(bx,186,1,12,'#e6eaee');P(bx+3,186,1,12,'#6a727c');P(bx,186,4,1,'#ffffff');P(bx-1,197,6,1,'#5a554c')}
  // 점자 블록(뒤 인도)
  {const y=190;for(let x=0;x<512;x+=10){P(x,y,9,4,'#e8c23a');P(x,y,9,1,'#f6dc6a');P(x+2,y+1,1,1,'#c89a1a');P(x+6,y+1,1,1,'#c89a1a');P(x+4,y+2,1,1,'#c89a1a')}}
  // 빗물받이(연석)
  for(const gx of[110,330]){P(gx,199,22,4,'#3a3d44');for(let k=1;k<22;k+=3)P(gx+k,199,1,4,'#6a6e76')}
  // 차도: 아스팔트 알갱이·보수 자국·맨홀·횡단보도
  const roadTop=204,roadBot=277;
  for(let i=0;i<900;i++){const y=roadTop+Math.floor(r()*(roadBot-roadTop)),x=Math.floor(r()*512);P(x,y,1,1,r()<.5?'#6e727a':'#4c5058')}
  P(120,248,58,14,'#4e5259');d4sh(H,120,248,58,14,'#5a5e66',.5);P(120,248,58,1,'#45494f');
  {const mx=214,my=262;blob(mx,my,15,5,['#5a5e66','#4a4e56','#3e4248','#34383e'],'#26292e');for(let k=-10;k<=10;k+=4)P(mx+k,my-1,2,2,'#6a6e76')}
  for(let k=0;k<7;k++){const y=roadTop+4+k*10,h=Math.round(4+k*.9),x0=Math.round(452-k*3),w=Math.round(46+k*7);P(x0,y,w,h,'#e6e3d6');P(x0,y,w,1,'#f6f4ea');d4sh(H,x0,y+h-1,w,1,'#a8a69c',.5)}
  for(let i=0;i<40;i++){const x=Math.floor(r()*512),y=roadTop+Math.floor(r()*(roadBot-roadTop));P(x,y,2+Math.floor(r()*4),1,'#45484f')}
  // 앞 인도: 보도블록 줄눈·나뭇잎
  H.nt(false);
  if(!N&&!WET)for(let i=0;i<14;i++){const x=Math.floor(r()*512),y=288+Math.floor(r()*30);P(x,y,3,2,['#c88a3a','#a8722a','#7a9a3a'][i%3]);P(x+1,y-1,1,1,'#e8b45a')}
}

/* ===== 공통 도구 ===== */
// 원근 바닥 알갱이: y0부터 아래로, 먼 쪽은 성기게
function d4grain(H,y0,y1,seed,cols,n){const{P}=H,r=d4rng(seed);for(let i=0;i<n;i++){const t=Math.pow(r(),.7),y=Math.round(y0+(y1-y0)*t),x=Math.floor(r()*512),l=1+Math.floor(r()*3*(y-y0+20)/100);P(x,y,l,1,cols[i%cols.length])}}
// 위에서 내려오는 빛 원뿔
function d4cone(H,x,y0,y1,w0,w1,col,a){H.alpha(a,()=>H.poly([[x-w0,y0],[x+w0,y0],[x+w1,y1],[x-w1,y1]],col))}
// 바닥 접지 그늘 + 바닥 알갱이(실내 공통)
function d4room(H,seed,ao,g,y0=200){d4ao(H,0,y0,512,ao);d4grain(H,y0+2,320,seed,g,260)}
// 스탠드 조명(소프트박스)
function d4soft(H,x,base,flip){const{P}=H;P(x,base-78,2,78,'#2a2d34');P(x-7,base-2,16,2,'#2a2d34');P(x-6,base-4,2,4,'#2a2d34');P(x+5,base-4,2,4,'#2a2d34');
  const s=flip?-1:1;H.poly([[x,base-80],[x+s*16,base-96],[x+s*16,base-62],[x,base-74]],'#1d1f24');H.poly([[x+s*13,base-93],[x+s*16,base-96],[x+s*16,base-62],[x+s*13,base-65]],'#f4f1e2')}
// 화분(작은)
function d4pot(H,x,base,s=1){const{P,blob}=H;P(x-7*s,base-12*s,14*s,12*s,'#5a626c');P(x-7*s,base-12*s,14*s,2,'#8a929c');P(x+4*s,base-12*s,3*s,12*s,'#3a3f48');
  const T=['#7bc65a','#4f9a3f','#3a7a32','#24502a'];[[0,-22,8,9],[-6,-17,6,6],[6,-16,6,6],[0,-30,5,6]].forEach(([dx,dy,rx,ry])=>blob(x+dx*s,base+dy*s,rx*s|0,ry*s|0,T,'#14301a'))}

/* ===== 배경별 덧그림 ===== */
const D4OVER={
 press(c,H){const{P}=H;// 천장 조명 원뿔, 소프트박스, 바닥 케이블
   for(const x of[150,256,362])d4cone(H,x,0,200,10,70,'#bcd2ff',.05);
   d4soft(H,74,200,0);d4soft(H,438,200,1);
   d4room(H,'press',`#0c142c`,['#2a3a64','#1e2c50']);
   for(const[x0,y0,x1,y1]of[[76,200,10,236],[438,200,500,228]])for(let i=0;i<=40;i++){const t=i/40,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+Math.sin(t*6)*3;P(Math.round(x),Math.round(y),2,1,'#0c0e14')}},
 brief(c,H){const{P}=H;// 양옆 나무 기둥, 화분, 바닥
   for(const x of[0,494]){P(x,21,18,179,'#7a5232');P(x+(x?0:15),21,3,179,x?'#a8744a':'#5a3a20');for(let y=30;y<196;y+=7)P(x+4,y,10,1,'#6b4426')}
   d4pot(H,38,214,1.2);d4pot(H,474,214,1.2);d4room(H,'brief','#1a2a4a',['#5a6478','#4c5568']);
   for(const x of[128,256,384])d4cone(H,x,0,200,8,46,'#ffffff',.05)},
 cabinet(c,H){const{P,blob}=H;// 천장 펜던트 조명, 벽 결, 카펫 무늬
   for(const x of[128,256,384]){P(x,0,1,12,'#3a2a20');P(x-12,12,24,6,'#c8901f');P(x-12,12,24,1,'#ffe48a');H.raw(true);P(x-10,18,20,2,'#fff1b8');H.raw(false);d4cone(H,x,20,200,10,60,'#ffe9b0',.05)}
   for(let x=6;x<512;x+=11)d4sh(H,x,34,1,120,'#7e5530',.5);
   d4room(H,'cabinet','#24121a',['#5a2e3a','#4a2430']);
   for(let k=0;k<6;k++){const y=226+k*16,w=10+k*3;for(let x=(k%2?32:0);x<512;x+=64)H.poly([[x,y],[x+w,y+6+k],[x,y+12+k*2],[x-w,y+6+k]],'#6a3646')}},
 audit(c,H){const{P}=H;for(const x of[100,256,412])d4cone(H,x,0,200,8,50,'#fffbe8',.05);
   d4room(H,'audit','#123030',['#2a5454','#244a4a']);
   for(let k=0;k<6;k++){const y=212+k*18,w=8+k*3;for(let x=(k%2?28:0);x<512;x+=56)H.poly([[x,y],[x+w,y+5+k],[x,y+10+k*2],[x-w,y+5+k]],'#357070')}},
 court(c,H){const{P}=H;// 벽 결, 가운데 붉은 통로 카펫
   for(let x=4;x<512;x+=9)d4sh(H,x,24,1,104,'#6e4a2c',.5);
   d4room(H,'court','#24160c',['#8a603a','#7a5232']);
   H.poly([[232,200],[280,200],[330,320],[182,320]],'#7a2a2e');H.poly([[236,200],[276,200],[320,320],[192,320]],'#8a3238');
   for(const s of[-1,1]){for(let y=200;y<320;y++){const t=(y-200)/120,x=256+s*(22+t*68);P(Math.round(x),y,2,1,'#c8a04a')}}},
 stage(c,H){const{P}=H;// 무대 조명 빛줄기, 나무 마루 결
   for(const[x,a]of[[90,.07],[160,.05],[352,.05],[422,.07]])d4cone(H,x,26,208,4,46,'#fff1c8',a);
   d4grain(H,210,320,'stage',['#2a2230','#3a3040'],300);d4ao(H,0,208,512,'#0e0a14')},
 tv(c,H){const{P}=H;// 바닥 반사, 가장자리 카메라
   H.alpha(.12,()=>{H.poly([[96,200],[168,200],[176,300],[88,300]],'#3a6ac8');H.poly([[214,200],[298,200],[306,300],[206,300]],'#e0384c');H.poly([[344,200],[416,200],[424,300],[336,300]],'#3a9e6a')});
   d4ao(H,0,200,512,'#04060e');
   for(const[x,f]of[[18,1],[494,-1]]){P(x-2,200,4,100,'#1d1f24');P(x-14,296,28,4,'#1d1f24');P(x-16,180,32,22,'#2a2d34');P(x-16,180,32,2,'#4a5060');P(x+f*16-(f>0?0:8),184,8,14,'#1d1f24');P(x-12,184,10,8,'#3a4a6a');P(x+6,178,4,2,'#e0384c')}},
 hospital(c,H){const{P}=H;// 벽 손잡이 레일, 모니터 카트, 바닥 광택
   P(0,150,512,4,'#c8d6d2');P(0,150,512,1,'#f2f8f6');P(0,154,512,1,'#9ab0aa');for(let x=20;x<512;x+=90)P(x,148,4,8,'#9ab0aa');
   {const x=106;P(x,150,30,26,'#3a3f48');P(x+2,152,26,18,'#0e2a1e');for(let i=0;i<24;i++)P(x+3+i,160+Math.round(Math.sin(i*.9)*3*(i%6===3?2:.4)),1,1,'#4ae07a');P(x+3,154,8,1,'#f2c14e');P(x+13,176,4,20,'#8a929c');P(x+4,194,22,3,'#5a626c');P(x+4,197,3,3,'#1d1f24');P(x+23,197,3,3,'#1d1f24')}
   d4room(H,'hospital','#7a9a92',['#e2ece8','#d6e2de']);H.alpha(.1,()=>H.poly([[330,201],[470,201],[440,300],[280,300]],'#ffffff'))},
 ballot(c,H){const{P}=H;// 선거 안내문, 화살표, 기표소 안내
   for(const[x,y]of[[30,64],[80,64]]){P(x-1,y-1,42,58,'#8a7a5a');P(x,y,40,56,'#fbf8ee');P(x+4,y+4,32,6,'#1d3a7c');for(let l=0;l<7;l++)P(x+4,y+14+l*5,32-(l%3)*6,2,'#b8ad92');P(x+28,y+46,8,6,'#c2321f')}
   {const x=430,y=100;P(x,y,60,20,'#1d3a7c');P(x+1,y+1,58,18,'#2f5fc0');for(let i=0;i<8;i++)P(x+8+i*2,y+6+Math.abs(i-4),6,2,'#ffffff');P(x+28,y+8,24,4,'#ffffff')}
   d4room(H,'ballot','#6a5a3a',['#c8a878','#b89868'])},
 hall(c,H){const{P,blob}=H;// 화단, 비둘기, 바닥 알갱이
   for(const x0 of[0,400]){P(x0,154,112,12,'#5a4a3a');P(x0,154,112,2,'#8a7a6a');for(let i=0;i<22;i++)blob(x0+6+i*5,152-(i%3),3,3,[['#e0384c','#c2321f','#a01a2a','#7a1414'],['#f2c14e','#e8a33a','#c8861a','#8a5a14'],['#f4f1ea','#e2ded4','#c8c2b4','#9a9486']][i%3])}
   d4grain(H,166,320,'hall',['#b8b2a6','#d6d0c4'],300);
   for(const[x,y]of[[300,236],[316,240],[140,300]]){P(x,y,7,4,'#8a929c');P(x+6,y-2,3,3,'#6a727c');P(x+8,y-1,1,1,'#f2c14e');P(x+1,y+4,1,2,'#c2321f');P(x+4,y+4,1,2,'#c2321f');P(x,y+1,5,1,'#b8c0c8')}},
 market(c,H){const{P}=H;// 백열전구 줄, 가격표, 바닥 물기
   for(let x=0;x<512;x++){const y=50+Math.round(4*Math.sin((x%170)/170*Math.PI));P(x,y,1,1,'#2a2d34');if(x%24===12){P(x-1,y+1,3,2,'#3a3f48');H.raw(true);P(x-2,y+3,5,5,'#ffe27a');P(x-1,y+4,3,3,'#fff6d0');H.raw(false);d4sh(H,x-8,y+2,19,9,'#fff1c8',.25)}}
   for(const x of[62,96,140,250,300,346,420,470]){P(x,128,12,8,'#f2d27a');P(x,128,12,1,'#fff1b8');P(x+2,131,8,1,'#c2321f');P(x+2,133,5,1,'#5a3a14')}
   d4grain(H,192,320,'market',['#8a8a86','#a8a8a2'],300);
   H.alpha(.18,()=>{for(const[x,y,w]of[[60,250,70],[340,280,90],[180,306,60]])H.poly([[x,y],[x+w,y],[x+w-8,y+5],[x+6,y+5]],'#e6f2fa')})},
 school(c,H){const{P}=H;// 축구 골대, 모래 알갱이, 화단
   {const x=444,y=140;P(x,y,56,2,'#f4f4f4');P(x,y,2,30,'#f4f4f4');P(x+54,y,2,30,'#f4f4f4');for(let k=0;k<7;k++)d4sh(H,x+2+k*8,y+2,1,28,'#d8dde2',.5);for(let k=0;k<4;k++)d4sh(H,x+2,y+6+k*7,52,1,'#d8dde2',.5)}
   P(60,158,140,6,'#5a4a3a');for(let i=0;i<26;i++)H.blob(64+i*5,156-(i%2),3,3,[['#f2c14e','#e8a33a','#c8861a','#8a5a14'],['#e0486a','#c2321f','#a01a2a','#7a1414']][i%2]);
   d4grain(H,172,320,'school',['#c8a878','#e2c89a','#b89868'],420);
   H.blob(380,250,5,5,['#ffffff','#f4f4f4','#d8dde2','#9aa3ad'],'#2a2d34')},
 sea(c,H){const{P}=H;// 갈매기, 물비늘, 밧줄 더미·생선 상자
   for(const[x,y]of[[120,40],[136,48],[380,30]]){P(x,y,3,1,'#2a2d34');P(x+3,y+1,2,1,'#2a2d34');P(x+5,y,3,1,'#2a2d34')}
   const r=d4rng('sea');for(let i=0;i<70;i++){const x=Math.floor(r()*512),y=134+Math.floor(r()*46);if(x>200&&x<320&&y<150)continue;P(x,y,2+Math.floor(r()*3),1,'#d8ecf8')}
   {const x=88,y=214;H.blob(x,y,10,4,['#d8b878','#c8a060','#a8803a','#7a5a20'],'#4a3412');for(let k=-8;k<=8;k+=4)P(x+k,y-1,2,1,'#8a6a2a')}
   for(const[x,y]of[[430,206],[446,210]]){P(x,y,18,10,'#2f6be0');P(x,y,18,2,'#5a8fd0');P(x+2,y+3,14,1,'#d8dde2');P(x+3,y+1,4,2,'#c6ccd2');P(x+9,y+1,5,2,'#c6ccd2')}
   d4grain(H,190,320,'seag',['#8a929c','#aab2ba'],300)},
 field(c,H){const{P,blob}=H;// 허수아비, 먼 전봇대 줄, 논 결
   {const x=372,y=150;P(x,y,2,34,'#6b4426');P(x-12,y+8,26,2,'#6b4426');blob(x+1,y+2,5,5,['#f4e8c8','#e2d4a8','#c8b888','#a89868'],'#5a4a2a');P(x-6,y-4,15,3,'#c8a04a');P(x-3,y-7,9,3,'#c8a04a');P(x-6,y+10,14,12,'#c2321f');P(x-6,y+10,14,1,'#e0605a')}
   for(const x of[40,150,300,470]){P(x,112,2,30,'#6a6050');P(x-4,114,10,1,'#6a6050')}for(let x=40;x<470;x++){const k=x<150?(x-40)/110:x<300?(x-150)/150:(x-300)/170,y=115+Math.round(6*4*k*(1-k));P(x,y,1,1,'#4a4a4a')}
   d4grain(H,172,320,'field',['#4a9a3a','#7ac65a','#3a7a2a'],420)},
 plane(c,H){const{P}=H;// 고깔, 바퀴 고임목, 지상 장비, 활주로 알갱이
   for(const x of[200,232,394])for(const[dx,dy]of[[0,0]]){P(x+dx,206+dy,6,8,'#f58a24');P(x+1+dx,206+dy,4,2,'#f4f4f4');P(x-1+dx,214+dy,8,2,'#f58a24')}
   {const x=436,y=194;P(x,y,34,12,'#f2c14e');P(x,y,34,2,'#ffe48a');P(x+24,y-8,10,8,'#2a2d34');P(x+26,y-6,6,4,'#8fbfdc');H.blob(x+6,y+13,4,4,['#3a3f48','#2a2d34','#1d1f24','#121418'],'#0c0d10');H.blob(x+28,y+13,4,4,['#3a3f48','#2a2d34','#1d1f24','#121418'],'#0c0d10')}
   d4grain(H,188,320,'plane',['#6a6e76','#585c64'],420)},
 train(c,H){const{P}=H;// 천장 형광등, 벤치, 승강장 바닥
   for(let x=20;x<512;x+=96){H.raw(true);P(x,30,56,3,'#f4fbff');H.raw(false);d4sh(H,x-6,33,68,3,'#e8f2f8',.25)}
   for(const x of[22,430]){P(x,206,62,4,'#3a6ac8');P(x,206,62,1,'#6a9ae0');P(x+4,210,3,10,'#5a626c');P(x+55,210,3,10,'#5a626c');P(x,200,62,6,'#2f5fc0')}
   d4grain(H,200,320,'train',['#a8acb2','#c6c9ce'],320)},
 factory(c,H){const{P}=H;// 드럼통·팔레트, 바닥 기름 얼룩, 배관
   P(0,96,512,3,'#6a7480');P(0,96,512,1,'#9aa6b2');for(let x=30;x<512;x+=120)P(x,96,6,6,'#5a626c');
   for(const[x,cl]of[[22,'#2f6be0'],[36,'#c2321f'],[50,'#2f6be0']]){P(x,190,12,18,cl);P(x,190,12,2,shade(cl,1.3));P(x,197,12,1,shade(cl,.7));P(x+9,190,3,18,shade(cl,.75))}
   {const x=462,y=200;P(x,y,40,4,'#8a6a3a');P(x,y+4,4,4,'#6b4426');P(x+18,y+4,4,4,'#6b4426');P(x+36,y+4,4,4,'#6b4426');P(x+4,y-16,32,16,'#c8a06a');P(x+4,y-16,32,1,'#e8c890');P(x+19,y-16,2,16,'#a8804a')}
   H.alpha(.25,()=>{for(const[x,y,rx,ry]of[[150,250,26,5],[360,288,34,6],[90,300,20,4]])H.blob(x,y,rx,ry,['#2a2d34','#2a2d34','#1d1f24','#1d1f24'])});
   d4grain(H,182,320,'factory',['#5a5e66','#6e727a'],360)},
 fire(c,H){const{P,blob}=H;// 연기 기둥, 탄 나무, 불티, 호스, 물웅덩이 반사
   H.alpha(.45,()=>{for(let i=0;i<7;i++)blob(110+i*46,120-i*9-(i%2)*10,22+i*3,14+i*2,['#5a4a48','#4a3c3c','#3a2e2e','#2a2222'])});
   for(const x of[60,184,300]){P(x,134,4,44,'#1a1010');P(x-8,146,10,2,'#1a1010');P(x+3,140,9,2,'#1a1010');P(x-5,154,6,2,'#1a1010')}
   const r=d4rng('fire'+PF);H.raw(true);for(let i=0;i<40;i++){const x=Math.floor(r()*512),y=Math.floor(r()*170);P(x,y,1,1,r()<.5?'#ffb347':'#ffd86a')}H.raw(false);
   for(let i=0;i<=60;i++){const t=i/60,x=340-t*320,y=190+t*16+Math.sin(t*7)*3;P(Math.round(x),Math.round(y),3,2,'#c2321f');P(Math.round(x),Math.round(y),3,1,'#e0605a')}
   H.alpha(.3,()=>{for(const[x,y,w]of[[80,240,60],[300,290,80]])H.poly([[x,y],[x+w,y],[x+w-6,y+5],[x+6,y+5]],'#ff8a3a')});
   d4grain(H,188,320,'fireg',['#2a1c18','#4a3028'],300)},
};
