/* ── 도트 3판 배경 ──
   실내 기준: 뒷벽 바닥선 y=200(그 깊이에서 1m≈38px, 문 높이 80px), 소실점 (256,118).
   앞쪽 주요 인물은 발 y 282~302, 머리 y≈150이라 벽 장식은 y 40~150과 좌우에 둔다. */
const VPY=118;
// 글자 폭(띄어쓰기는 5칸)
function signW(str,sz){return [...str].reduce((a,ch)=>a+(SIGNF[sz+ch]?SIGNF[sz+ch][0].length:5),0)+([...str].length-1)*2}
// 비트맵 글자 찍기. k: 배율(옛 1024 좌표면 2)
function signText(H,x,y,str,sz,ink,sh,k=1){let cx=x;for(const ch of str){const g=SIGNF[sz+ch];if(!g){cx+=7*k;continue}
  if(sh)g.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')H.P(cx+(i+1)*k,y+(j+1)*k,k,k,sh)});
  g.forEach((r,j)=>{let i=0;while(i<r.length){if(r[i]!=='#'){i++;continue}let n=1;while(r[i+n]==='#')n++;H.P(cx+i*k,y+j*k,n*k,k,ink);i+=n}});cx+=(g[0].length+2)*k}}
// 원근 바닥: y0(뒤 끝)부터 아래로. o={w 뒤쪽 칸 너비, q 줄 간격, c:[색1,색2], ln 줄눈, mode 'check'|'plank'|'row', off}
function pfl(H,y0,o){const{P}=H,a=y0-VPY;let n=0,ya=y0;
  while(ya<320){const yb=Math.min(320,Math.round(VPY+a*(1+(n+1)*o.q)));
    for(let y=Math.round(ya);y<yb;y++){const s=(y-VPY)/a,w=o.w*s,sh=(o.mode==='plank'&&n&1?.5:0)+(o.off||0);
      const k0=Math.floor((-256/s)/o.w-sh)-1,k1=Math.ceil((256/s)/o.w-sh)+1;
      for(let k=k0;k<=k1;k++){const x0=Math.round(256+(k+sh)*w),x1=Math.round(256+(k+1+sh)*w);if(x1<=0||x0>=512)continue;
        const col=o.mode==='check'?o.c[(k+n)&1]:o.mode==='plank'?o.c[((k*7+n*3)%5+5)%5<2?1:0]:o.c[n&1];P(x0,y,x1-x0,1,col);if(o.ln&&o.mode!=='row')P(x0,y,1,1,o.ln)}
      if(o.ln&&y===Math.round(ya))P(0,y,512,1,o.ln)}
    ya=yb;n++}
  if(o.shine)H.alpha(.08,()=>H.poly([[200,y0],[312,y0],[360,320],[152,320]],'#ffffff'))}
// 천장: 0~y1, 원근 줄과 조명 띠
function pceil(H,y1,col,light){const{P}=H,b=VPY-y1;P(0,0,512,y1,col);P(0,y1-2,512,2,shade(col,.7));
  for(let n=0;n<4;n++){const y=Math.round(VPY-b*(1+n*.55));if(y<0)break;const s=(VPY-y)/b;P(0,y,512,1,shade(col,.86));
    if(light)for(const k of[-1.5,-.5,.5,1.5]){const x=256+k*120*s,w=46*s;H.raw(true);P(Math.round(x-w/2),y+2,Math.round(w),Math.max(2,Math.round(4*s)),light);H.raw(false)}}}
// 벽: y0~200, 아래 걸레받이
function pwall(H,y0,col,o={}){const{P}=H;P(0,y0,512,200-y0,col);if(o.pan){for(let x=o.pan/2;x<512;x+=o.pan){P(x,y0,1,200-y0,shade(col,.88))}}
  if(o.wain){const y=200-o.wain;P(0,y,512,200-y,o.wc||shade(col,.7));P(0,y,512,2,shade(o.wc||shade(col,.7),1.25));for(let x=8;x<512;x+=44){P(x,y+6,36,o.wain-12,shade(o.wc||shade(col,.7),.9));P(x,y+6,36,1,shade(o.wc||shade(col,.7),.75));P(x,y+o.wain-7,36,1,shade(o.wc||shade(col,1),1.1))}}
  P(0,194,512,6,o.base||shade(col,.45));P(0,194,512,1,shade(o.base||shade(col,.45),1.4))}
// 문(바닥 y=200 기준, 2.1m)
function pdoor(H,x,w,col,o={}){const{P}=H,h=o.h||80,y=200-h;P(x-3,y-3,w+6,h+3,o.frame||shade(col,.55));P(x,y,w,h,col);P(x,y,w,1,shade(col,1.3));P(x+w-2,y,2,h,shade(col,.72));
  if(o.glass){P(x+5,y+6,w-10,30,'#22242c');P(x+6,y+7,w-12,28,'#8fbbdb');P(x+6,y+7,w-12,8,'#b9dcf0')}else{P(x+5,y+6,w-10,h/2-10,shade(col,.88));P(x+5,y+h/2+2,w-10,h/2-10,shade(col,.88))}
  P(x+w-8,y+h/2,3,7,'#e2b04a');P(x+w-8,y+h/2,1,7,'#fff1b8')}
// 액자·창
function pframe(H,x,y,w,h,fr,inner){const{P}=H;P(x-1,y-1,w+2,h+2,'#1d1a1e');P(x,y,w,h,fr);P(x,y,w,1,shade(fr,1.3));P(x+3,y+3,w-6,h-6,shade(fr,.6));inner(x+4,y+4,w-8,h-8)}
function pwindow(H,x,y,w,h,view){const{P}=H;P(x-3,y-3,w+6,h+8,'#e9ecef');P(x-3,y+h+2,w+6,3,'#c6ccd2');P(x-1,y-1,w+2,h+2,'#5a626c');view(x,y,w,h);
  P(x+Math.round(w/2)-1,y,3,h,'#e9ecef');P(x,y+Math.round(h*.38),w,2,'#e9ecef');for(let i=0;i<Math.min(w,h)-8;i++){P(x+6+i,y+h-4-i,1,1,'#ffffff')}}
function cityView(H,x,y,w,h){const{P}=H;P(x,y,w,h,'#9fd0ee');P(x,y+h*.55,w,h*.45,'#c6e3f8');[[.05,.45,.16],[.2,.25,.14],[.36,.4,.12],[.5,.18,.16],[.68,.35,.14],[.84,.3,.14]].forEach(([fx,fy,fw])=>{const bx=x+fx*w,by=y+fy*h,bw=fw*w;P(bx,by,bw,y+h-by,'#8aa6c0');for(let yy=by+3;yy<y+h-2;yy+=5)for(let xx=bx+2;xx<bx+bw-2;xx+=4)P(xx,yy,2,2,'#b9cfe1')})}
// 화분·책장·벽시계·의자
function pplant(H,x,base,s=1){const{P,blob}=H;P(x-9*s,base-18*s,18*s,18*s,'#8a5a33');P(x-9*s,base-18*s,18*s,2,'#b07a4a');P(x+5*s,base-18*s,4*s,18*s,'#6b4426');
  const T=['#7bc65a','#4f9a3f','#3a7a32','#2a5a2c'];[[0,-38,11,14],[-9,-30,8,10],[9,-29,8,10],[-4,-46,6,8],[5,-44,6,8]].forEach(([dx,dy,rx,ry])=>blob(x+dx*s,base+dy*s,rx*s|0,ry*s|0,T,'#1a3a20'))}
function pshelf(H,x,w,h,col){const{P}=H,y=200-h;P(x-1,y-1,w+2,h+1,'#1d1a1e');P(x,y,w,h,col);P(x,y,w,2,shade(col,1.3));const n=Math.floor((h-6)/22);
  const bc=['#c2321f','#2f6be0','#3a9e6a','#e8a33a','#7a3fb0','#f4f1ea','#35507a','#8a5a33'];
  for(let r=0;r<n;r++){const yy=y+4+r*22;P(x+3,yy,w-6,19,shade(col,.45));let bx=x+4,i=r*3;while(bx<x+w-6){const bw=3+((i*5)%3),bh=13+((i*7)%5);P(bx,yy+19-bh,bw,bh,bc[(i*3+r)%8]);P(bx,yy+19-bh,1,bh,shade(bc[(i*3+r)%8],1.3));bx+=bw+((i%6)===5?4:0);i++}P(x+3,yy+19,w-6,3,shade(col,1.1))}}
function pclock(H,x,y,r){H.blob(x,y,r,r,['#ffffff','#f4f4f4','#dfe3e6','#c6ccd2'],'#2a2d34');H.P(x,y-r+3,1,r-3,'#2a2d34');H.P(x,y,r-4,1,'#2a2d34')}
function pchair(H,x,base,col,tall){const{P}=H,h=tall?52:40;P(x-10,base-h,20,h-14,'#1d1a1e');P(x-9,base-h+1,18,h-16,col);P(x-9,base-h+1,18,2,shade(col,1.3));P(x-11,base-16,22,5,shade(col,.8));P(x-1,base-11,3,9,'#3a3f48');P(x-8,base-3,17,2,'#2a2d34')}
function emblem(H,cx,cy,r){H.blob(cx,cy,r,r,['#ffe48a','#e8b44a','#c8901f','#8a5a14'],'#3a2a10');H.blob(cx,cy,r-4,r-4,['#3a6fd0','#2a58b0','#1d4590','#14306a']);for(let i=-1;i<=1;i++)H.P(cx-r+8,cy+i*4-1,(r-8)*2,2,'#f4f1ea')}

/* ── 사무실(의원실·단체장실) ── */
function bgOffice(c,H){const{P}=H;pceil(H,34,'#ece6da','#fffbe8');pwall(H,34,'#e9dfc8',{wain:42,wc:'#a8784a'});
  pshelf(H,14,92,150,'#7a5232');pplant(H,124,200,1.1);
  pframe(H,156,64,70,46,'#c8a06a',(x,y,w,h)=>{P(x,y,w,h,'#f6f1e2');for(let i=0;i<4;i++){P(x+8+i*14,y+6,3,h-14,'#2a2d34');P(x+6+i*14,y+12+(i%2)*8,7,2,'#2a2d34')}P(x+w-12,y+h-10,6,6,'#c2321f')});
  pclock(H,256,58,11);H.flag(276,96,0);
  pwindow(H,330,52,148,96,(x,y,w,h)=>cityView(H,x,y,w,h));
  // 뒤쪽 집무 책상과 의자
  pchair(H,404,186,'#3a2a24',true);P(356,172,104,6,'#5a3a24');P(356,172,104,1,'#8a5a3a');P(360,178,96,22,'#4a2e1c');P(360,178,96,1,'#6b4426');
  P(372,156,26,16,'#2a2d34');P(374,158,22,11,'#6fa8dc');P(383,170,4,3,'#2a2d34');P(420,166,22,6,'#f4f1ea');P(420,166,22,1,'#ffffff');
  pfl(H,200,{w:34,q:.3,c:['#b88a5a','#a87c4e'],ln:'#8a6440',mode:'plank'})}
/* ── 기자회견장: 짙은 파랑 배경막, 상징, 국기 둘 ── */
function bgPress(c,H){const{P}=H;P(0,0,512,200,'#16244a');for(let x=0;x<512;x+=8){P(x,0,4,200,'#1b2c58');P(x+4,0,1,200,'#122040')}
  P(0,0,512,14,'#0c142c');for(let x=40;x<512;x+=110){H.raw(true);P(x,10,14,4,'#fff6c8');H.raw(false);H.alpha(.06,()=>H.poly([[x-30,14],[x+44,14],[x+90,200],[x-76,200]],'#fff6c8'))}
  P(96,30,320,150,'#1e3a7a');P(96,30,320,2,'#4a6fc0');P(96,178,320,2,'#0c1a3a');for(let x=104;x<412;x+=24)for(let y=38;y<174;y+=24){P(x+10,y+10,4,4,'#24468e')}
  emblem(H,256,82,30);P(176,128,160,14,'#e8b44a');P(176,128,160,1,'#ffe48a');P(186,133,140,4,'#8a5a14');
  H.flag(70,92,0);H.flag(430,92,0);
  pfl(H,200,{w:44,q:.32,c:['#2a3350','#262e4a'],mode:'row',ln:'#20283f'})}
/* ── 대통령 브리핑룸: 밝은 배경막 ── */
function bgBrief(c,H){const{P}=H;P(0,0,512,200,'#e8edf4');P(0,0,512,18,'#1d3a7c');P(0,18,512,3,'#c8a13a');
  for(let x=20;x<512;x+=60)for(let y=36;y<156;y+=40){const ox=((y/40)|0)%2?30:0;H.blob(x+ox,y,7,7,['#e0384c','#d02a3a','#b81e2e','#901622']);P(x+ox-7,y,14,7,'#2f5fc0');P(x+ox-7,y+6,14,1,'#e8edf4')}
  H.alpha(.55,()=>P(0,24,512,140,'#f4f7fa'));P(0,160,512,30,'#1d3a7c');P(0,160,512,2,'#c8a13a');for(let x=150;x<362;x+=8)P(x,171,5,6,'#f4f1ea');
  H.flag(46,90,0);H.flag(436,90,0);P(0,190,512,10,'#14284e');
  pfl(H,200,{w:46,q:.32,c:['#5a6478','#545e72'],mode:'row',ln:'#4a5468'})}
/* ── 국무회의실: 나무 벽, 큰 화면, 긴 탁자 ── */
function bgCabinet(c,H){const{P}=H;pceil(H,30,'#5a4030','#ffe9b0');pwall(H,30,'#8a5e3a',{pan:64,wain:56,wc:'#6b4426'});
  P(150,44,212,104,'#1d1a1e');P(152,46,208,100,'#1a2a4a');P(152,46,208,4,'#2a4070');emblem(H,256,94,26);
  H.flag(116,70,0);H.flag(380,70,0);
  for(let x=80;x<=432;x+=44)pchair(H,x,198,'#6a1a22',true);
  P(40,168,432,8,'#4a2e1c');P(40,168,432,2,'#8a5a3a');P(48,176,416,24,'#3a2416');for(let x=70;x<450;x+=44){P(x,163,14,5,'#f4f1ea');P(x+4,160,6,3,'#c6ccd2')}
  pfl(H,200,{w:40,q:.3,c:['#5a3a4a','#523444'],mode:'row',ln:'#48303e'})}
/* ── 국정감사장: 계단식 의석, 위원 명패·모니터 ── */
function bgAudit(c,H){const{P}=H;pceil(H,26,'#e2dccd','#fffbe8');pwall(H,26,'#d9cdb2',{pan:80});
  P(156,36,200,22,'#1d3a7c');P(156,36,200,2,'#3a5fb0');signText(H,256-signW('국정감사',15)/2,39,'국정감사',15,'#ffffff','#0c1a3a');pclock(H,420,50,9);
  for(const[ty,th] of[[70,30],[112,34],[156,44]]){P(0,ty,512,th,'#7a5232');P(0,ty,512,3,'#a8784a');P(0,ty+th-2,512,2,'#4a2e1c');
    for(let x=14;x<512;x+=46){P(x,ty-10,22,10,'#2a2d34');P(x+2,ty-8,18,6,'#6fa8dc');P(x+6,ty+6,26,7,'#f4f1ea');P(x+8,ty+8,16,2,'#3a3a44')}}
  pfl(H,200,{w:44,q:.32,c:['#2f6f6a','#2a6560'],mode:'row',ln:'#255a55'})}
/* ── 법정: 판사석(윗면 y=128), 양쪽 책상, 방청석은 앞줄 뒷머리 ── */
function bgCourt(c,H){const{P}=H;pceil(H,22,'#4a3424','#ffe9b0');pwall(H,22,'#7a5232',{pan:56});
  P(196,30,120,30,'#5a3a24');emblem(H,256,44,13);
  for(const x of[176,256,336]){P(x-15,72,30,58,'#1d1a1e');P(x-14,73,28,56,'#6a1a22');P(x-14,73,28,3,'#8a2a32');P(x-10,80,20,40,'#5a141c')}
  P(96,126,320,4,'#a8784a');P(96,128,320,72,'#5a3a24');P(96,128,320,2,'#c8a06a');for(let x=106;x<410;x+=52){P(x,140,42,48,'#4a2e1c');P(x,140,42,1,'#3a2416');P(x,187,42,1,'#6b4426')}
  P(232,150,48,24,'#c8a13a');P(234,152,44,20,'#e8c46a');for(let i=0;i<3;i++)P(244+i*10,156,4,12,'#8a5a14');
  // 법봉과 받침(판사석 위)
  P(318,120,16,6,'#5a3a24');P(318,120,16,1,'#8a5a3a');P(322,111,14,6,'#7a4a2a');P(322,111,14,1,'#a8784a');P(334,113,9,2,'#5a3a24');
  for(const x0 of[8,388]){P(x0,176,116,6,'#6b4426');P(x0,176,116,1,'#a8784a');P(x0+4,182,108,18,'#4a2e1c');P(x0+40,166,30,10,'#f4f1ea')}
  pfl(H,200,{w:36,q:.3,c:['#9a6a40','#8e6038'],ln:'#6b4426',mode:'plank'})}
const SCN3={
  street:{noOld:['house']},
  office:{full:bgOffice,extras:[['aide','paper',452,214,1]]},
  press:{full:bgPress,extras:[['aide','idleQ',30,214,0],['aide','paper',482,214,1]]},
  brief:{full:bgBrief,extras:[]},
  cabinet:{full:bgCabinet,extras:[['aide','idleQ',22,212,0],['aide','paper',490,212,1]]},
  audit:{full:bgAudit,extras:[['aide','paper',474,212,1]]},
  court:{full:bgCourt,bench:128,noOld:['gavel'],extras:[['rep','idleQ',40,206,0,{clipY:182}],['aide','paper',468,206,1,{clipY:182}]]},
};
/* ── 유세 무대(야외, 해 질 녘): 트러스, 대형 화면, 스피커 ── */
function bgStage(c,H){const{P}=H;H.bands(0,140,['#2a2a5a','#4a3a6a','#7a4a6a','#b0606a','#e08a6a','#f2b07a']);H.skyline(150,'#4a3a5a','#5a4a6a',.25);H.skyline(160,'#3a2e4a','#4a3e5a',.3);
  P(0,160,512,40,'#2a2a34');
  const truss=(x,top,w)=>{P(x,top,w,200-top,'#5a626c');P(x+2,top,w-4,200-top,'#2a2a34');for(let y=top;y<200;y+=10){P(x,y,w,2,'#8a929c');for(let i=0;i<w-2;i++)P(x+1+i,y+2+Math.round(i*8/(w-2)),1,1,'#8a929c')}};
  truss(52,20,12);truss(448,20,12);P(52,18,408,10,'#5a626c');P(52,18,408,2,'#9aa3ad');for(let x=56;x<456;x+=10)P(x,20,2,6,'#2a2a34');
  for(const x of[90,160,352,422]){H.raw(true);H.blob(x,34,6,5,['#fff6c8','#ffe48a','#e8b44a','#a07a2a']);H.raw(false);H.alpha(.07,()=>H.poly([[x-6,38],[x+6,38],[x+40,200],[x-40,200]],'#fff6c8'))}
  P(110,44,292,128,'#14141a');P(114,48,284,120,'#1d3a7c');H.raw(true);for(let y=50;y<166;y+=4)P(114,y,284,1,'#24468e');H.raw(false);emblem(H,256,96,24);P(170,132,172,10,'#f4f1ea');P(176,135,160,4,'#1d3a7c');
  for(const x of[64,410]){P(x,112,38,88,'#1d1a1e');P(x+2,114,34,84,'#2a2a34');for(const y of[124,152,178]){H.blob(x+19,y,10,10,['#5a5a64','#3a3a44','#2a2a34','#1b1b22']);H.blob(x+19,y,4,4,['#8a8a94','#6a6a74','#4a4a54','#3a3a44'])}}
  P(0,200,512,8,'#1d1a1e');P(0,200,512,2,'#5a5a64');pfl(H,208,{w:40,q:.3,c:['#3a3036','#342a30'],ln:'#2a2228',mode:'plank'})}
/* ── 방송 스튜디오: 큰 화면 셋, 반짝이는 바닥 ── */
function bgTv(c,H){const{P}=H;P(0,0,512,200,'#0e1530');for(let x=0;x<512;x+=32)P(x,0,1,200,'#18224a');P(0,0,512,16,'#080c1c');for(let x=30;x<512;x+=60){H.raw(true);P(x,12,20,4,'#cfe6ff');H.raw(false)}
  const scr=(x,y,w,h,fn)=>{P(x-3,y-3,w+6,h+6,'#2a2d34');P(x-1,y-1,w+2,h+2,'#5a626c');H.raw(true);fn(x,y,w,h);H.raw(false)};
  scr(28,40,132,90,(x,y,w,h)=>{P(x,y,w,h,'#1d3a7c');P(x+8,y+8,60,4,'#ffffff');[22,34,28,48,40,60].forEach((v,i)=>P(x+12+i*19,y+h-8-v,12,v,i===5?'#f2c14e':'#9fc4f0'));P(x+8,y+h-8,w-16,1,'#ffffff')});
  scr(190,32,132,100,(x,y,w,h)=>{P(x,y,w,h,'#c2321f');P(x,y+h-24,w,24,'#f4f1ea');P(x+6,y+h-18,w-30,4,'#1d1a1e');P(x+6,y+h-10,w-50,3,'#6a727c');P(x+w-20,y+h-20,14,14,'#f2c14e');P(x+10,y+10,40,6,'#ffffff');for(let i=0;i<5;i++)P(x+60+i*12,y+30+(i%2)*6,8,30,'#e0384c')});
  scr(352,40,132,90,(x,y,w,h)=>{P(x,y,w,h,'#2a7a4a');for(let i=0;i<5;i++){P(x+10,y+12+i*15,8,8,'#f2c14e');P(x+24,y+14+i*15,70-(i*9)%30,4,'#f4f1ea')}});
  P(0,150,512,4,'#2f6be0');H.raw(true);P(0,151,512,1,'#9fc4f0');H.raw(false);P(0,154,512,46,'#141c3a');for(let x=0;x<512;x+=64)P(x,154,1,46,'#1d2a50');
  pfl(H,200,{w:48,q:.32,c:['#141a34','#18203e'],ln:'#22305a',mode:'check',shine:1})}
/* ── 병실 ── */
function bgHospital(c,H){const{P}=H;pceil(H,26,'#eef2f2','#ffffff');pwall(H,26,'#d6ebe6',{wain:30,wc:'#b8d8d0'});
  pwindow(H,300,48,120,86,(x,y,w,h)=>{P(x,y,w,h,'#9fd0ee');P(x,y+h*.6,w,h*.4,'#9bd66f');H.tree(x+30,y+h,0.8);H.tree(x+92,y+h-4,0.7)});
  P(36,30,4,100,'#c6ccd2');P(36,30,140,3,'#c6ccd2');for(let x=36;x<120;x+=12){P(x,33,12,120,x%24?'#cfe6f2':'#bcdcec');P(x+11,33,1,120,'#9fc4dc')}
  // 침대(길이 2m≈76px)
  P(130,128,6,72,'#9aa3ad');P(128,124,10,6,'#c6ccd2');P(136,156,92,10,'#c6ccd2');P(136,148,92,10,'#f4f4f4');P(140,140,26,10,'#ffffff');P(166,146,60,4,'#9fc4f0');P(150,166,4,30,'#8a929c');P(214,166,4,30,'#8a929c');P(146,194,12,3,'#3a3f48');P(210,194,12,3,'#3a3f48');
  P(244,72,3,128,'#9aa3ad');P(236,72,18,2,'#9aa3ad');P(238,74,9,14,'#dff0fa');P(238,74,9,1,'#ffffff');P(242,88,1,40,'#9fc4dc');P(236,196,18,3,'#5a626c');
  P(440,128,34,72,'#e9ecef');P(440,128,34,2,'#ffffff');P(444,140,26,24,'#d6dbe0');P(444,170,26,24,'#d6dbe0');P(454,150,6,2,'#9aa3ad');P(454,180,6,2,'#9aa3ad');
  P(452,90,44,30,'#2a2d34');H.raw(true);P(454,92,40,26,'#0e2a1a');for(let i=0;i<38;i++){const yy=i%10===4?-8:i%10===5?6:0;P(455+i,105+yy,1,1,'#4cff7a')}H.raw(false);
  P(206,44,22,22,'#ffffff');P(214,48,6,14,'#e0384c');P(210,52,14,6,'#e0384c');
  pfl(H,200,{w:40,q:.3,c:['#eef2f4','#dfe6ea'],ln:'#c8d2d8',mode:'check'})}
/* ── 투표소(체육관): 기표대, 안내판 ── */
function bgBallot(c,H){const{P}=H;pceil(H,24,'#d8d2c4','#fffbe8');pwall(H,24,'#efe9dc',{pan:96,wain:22,wc:'#c8b896'});
  P(176,34,160,26,'#1d3a7c');P(176,34,160,2,'#3a5fb0');signText(H,256-signW('투표소',15)/2,39,'투표소',15,'#ffffff','#0c1a3a');
  for(let i=0;i<4;i++){const x=120+i*72;P(x,118,62,82,'#c6ccd2');P(x+2,118,58,6,'#2f6be0');P(x+2,124,58,52,'#f4f4f4');for(let k=0;k<58;k+=6)P(x+2+k,124,1,52,'#dfe3e6');P(x+2,176,58,24,'#e9ecef');P(x+28,184,6,2,'#9aa3ad');P(x,118,2,82,'#9aa3ad');P(x+60,118,2,82,'#9aa3ad');P(x+6,107,50,10,'#ffffff');P(x+10,110,42,4,'#c2321f')}
  P(14,150,86,8,'#5a3a24');P(14,150,86,1,'#8a5a3a');P(20,158,74,42,'#3f5f8f');P(22,160,70,2,'#5a7fb0');P(40,142,34,8,'#f4f1ea');
  pfl(H,200,{w:42,q:.3,c:['#d8b47a','#ccaa72'],ln:'#b8925a',mode:'plank'});H.alpha(.6,()=>{P(80,250,352,2,'#e0384c');P(40,300,432,2,'#2f6be0')})}
/* ── 국회 앞: 돔 건물(멀리), 계단, 광장 ── */
function bgHall(c,H){const{P}=H;H.bands(0,140,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);H.cloud(70,30,1,PF*2);H.cloud(420,44,.8,PF*2);
  // 돔
  H.blob(256,52,62,30,['#9ad8c0','#6ab8a0','#4a9a84','#3a7a68'],'#1d4a3e',true);P(194,52,124,8,'#4a9a84');for(let x=200;x<314;x+=10)P(x,30,1,30,'#3a7a68');P(252,14,8,10,'#e9ecef');P(255,8,2,6,'#9aa3ad');
  P(176,60,160,14,'#e9ecef');P(176,60,160,2,'#ffffff');for(let x=184;x<330;x+=10)P(x,63,4,9,'#9aa3ad');
  P(120,74,272,10,'#f4f4f4');P(120,74,272,2,'#ffffff');P(120,82,272,2,'#c6ccd2');
  P(96,84,320,56,'#dfe3e6');for(let x=104;x<412;x+=14){P(x,88,7,48,'#ffffff');P(x+6,88,2,48,'#b8c0c8')}P(96,84,320,4,'#c6ccd2');P(96,136,320,4,'#9aa3ad');
  for(const x0 of[40,416]){P(x0,98,56,42,'#e2e6ea');for(let y=104;y<136;y+=10)for(let x=x0+6;x<x0+52;x+=10)P(x,y,6,6,'#8fbbdb')}
  for(let i=0;i<6;i++){P(150-i*8,140+i*2,212+i*16,2,i%2?'#d6dbe0':'#eef0f2')}
  H.tree(22,152,1.1);H.tree(490,152,1.1);H.flag(118,96,0);
  P(0,152,512,48,'#cfd6dc');pfl(H,152,{w:30,q:.28,c:['#d6d2c8','#ccc8be'],ln:'#b8b4aa',mode:'check'});
  P(0,152,512,1,'#9aa3ad');H.alpha(.9,()=>{H.poly([[0,170],[120,152],[150,152],[0,230]],'#7bc65a');H.poly([[512,170],[392,152],[362,152],[512,230]],'#7bc65a')})}
Object.assign(SCN3,{
  stage:{full:bgStage,heads:1,extras:[['aide','phone',30,214,0],['aide','paper',484,214,1]]},
  tv:{full:bgTv,extras:[['rep','camera',24,218,0],['aide','paper',488,214,1]]},
  hospital:{full:bgHospital,extras:[['doc','paper',446,214,1,{st:'long',h:'#3a2a20'}]]},
  ballot:{full:bgBallot,extras:[['aide','paper',40,212,0],['aide','idleQ',480,214,1]]},
  hall:{full:bgHall,extras:[['aide','phone',22,224,0],['rep','camera',64,230,0],['cit','sign',430,228,1],['cit2','sign',478,224,1]]},
});
/* ── 전통시장(아케이드): 가게 셋, 간판, 진열 ── */
function bgMarket(c,H){const{P,blob}=H;P(0,0,512,46,'#c6d2da');for(let x=0;x<512;x+=16){P(x,0,8,46,'#d6e0e6')}P(0,40,512,6,'#5a626c');for(let x=20;x<512;x+=120){P(x,0,6,190,'#5a626c');P(x,0,2,190,'#8a929c')}
  P(0,46,512,144,'#7a6a5a');
  const stall=(x,w,name,sign,aw,goods)=>{P(x,52,w,138,'#e9dfc8');P(x,52,w,2,'#ffffff');P(x+w-2,52,2,138,'#b8a888');
    P(x+4,56,w-8,24,'#141418');P(x+5,57,w-10,22,sign);P(x+5,57,w-10,1,shade(sign,1.35));signText(H,Math.round(x+(w-signW(name,15))/2),61,name,15,'#ffffff',shade(sign,.45));
    for(let k=0;k<w;k+=10){P(x+k,82,5,10,aw);P(x+k+5,82,5,10,'#f4f1ea')}P(x,92,w,2,shade(aw,.6));
    P(x+4,94,w-8,60,'#5a4a3a');P(x+4,94,w-8,60,'#6b5a48');for(let y=100;y<150;y+=14)P(x+4,y,w-8,2,'#4a3a2a');
    goods(x,w);P(x+2,160,w-4,8,'#8a6a3a');P(x+2,160,w-4,2,'#c8a06a');P(x+6,168,w-12,22,'#6b4a30');for(let k=x+10;k<x+w-14;k+=24)P(k,172,18,14,'#5a3a24')};
  stall(4,160,'싱싱청과','#3a9e6a','#e0384c',(x,w)=>{const F=[['#e0384c','#ff8a8a','#b02a33','#7a1a20'],['#f58a24','#ffc070','#c8641a','#8a4410'],['#f2c14e','#fff0a0','#c89a2a','#8a6a1a'],['#5aae4a','#9bd66f','#3f823b','#2a5a2c']];
    for(let k=0;k<6;k++){const t=F[k%4],bx=x+12+k*24;P(bx-8,150,20,10,'#c8a06a');for(let m=0;m<5;m++)blob(bx+(m%3)*5-3,148-(m>2?5:0),4,4,t,'#2a1a10')}
    for(let k=0;k<4;k++){P(x+16+k*34,104,26,4,'#c8a06a');P(x+20+k*34,96,18,8,['#e0384c','#5aae4a','#f2c14e','#f58a24'][k])}});
  stall(176,160,'황소정육','#c2321f','#c2321f',(x,w)=>{H.raw(true);P(x+8,98,w-16,4,'#ff6a6a');H.raw(false);for(let k=0;k<5;k++){P(x+16+k*28,104,4,8,'#9aa3ad');P(x+10+k*28,112,16,24,'#c84a4a');P(x+12+k*28,114,12,20,'#e07a7a');P(x+14+k*28,118,6,3,'#f4e0d0')}
    P(x+8,146,w-16,14,'#dfe6ea');P(x+8,146,w-16,2,'#ffffff');for(let k=0;k<6;k++){P(x+14+k*22,149,16,8,'#d06060');P(x+16+k*22,150,6,2,'#f4d0c0')}});
  stall(348,164,'바다수산','#2f6be0','#2f6be0',(x,w)=>{P(x+8,134,w-16,26,'#dfeef4');for(let k=x+10;k<x+w-12;k+=10)P(k,136,6,4,'#ffffff');
    for(let k=0;k<6;k++){const fx=x+16+k*22;P(fx,142,16,6,'#8aa6c0');P(fx+16,143,4,4,'#6a8aa6');P(fx+2,143,2,2,'#1d1a1e');P(fx,148,16,1,'#5a7a96')}
    for(let k=0;k<3;k++){P(x+20+k*44,100,30,22,'#3a5a7a');P(x+20+k*44,100,30,2,'#5a7a9a');P(x+24+k*44,106,22,10,'#e07a4a')}});
  pfl(H,190,{w:36,q:.3,c:['#b8b0a0','#aea696'],ln:'#9a9284',mode:'check'})}
/* ── 학교: 4층 교사(멀리), 시계탑, 운동장 ── */
function bgSchool(c,H){const{P}=H;H.bands(0,120,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);H.cloud(70,22,1,PF*2);H.cloud(430,40,.8,PF*2);
  P(212,6,88,26,'#d9b98a');P(212,6,88,2,'#f0d8b0');H.blob(256,19,10,10,['#ffffff','#f4f4f4','#dfe3e6','#c6ccd2'],'#2a2d34');P(256,12,1,7,'#2a2d34');P(256,19,5,1,'#2a2d34');
  P(24,30,464,132,'#e8d6b0');P(24,30,464,3,'#f8ecd0');P(20,26,472,6,'#b0603a');for(let f=0;f<4;f++){const y=40+f*31;P(24,y+24,464,3,'#d4bf96');for(let x=34;x<480;x+=30){if(x>226&&x<286)continue;P(x,y,22,18,'#5a6a7a');P(x+1,y+1,20,16,'#9fd0ee');P(x+1,y+1,20,5,'#c6e3f8');P(x+11,y,1,18,'#5a6a7a')}}
  P(228,36,56,126,'#d4bf96');P(236,120,40,42,'#5a4a3a');P(238,122,36,40,'#8fbbdb');P(255,122,2,40,'#5a4a3a');P(232,112,48,6,'#b0603a');
  for(const x of[14,120,392,498])H.tree(x,170,.9);P(450,90,2,80,'#9aa3ad');P(452,90,22,14,'#ffffff');P(452,90,22,4,'#e0384c');
  P(0,162,512,8,'#9a8a74');for(let x=0;x<512;x+=6)P(x,162,2,8,'#7a6a58');
  pfl(H,170,{w:60,q:.35,c:['#d8b886','#d2b280'],mode:'row'});H.alpha(.8,()=>{for(const[ry,rx]of[[214,200],[230,236]]){for(let a=0;a<360;a+=1){const t=a*Math.PI/180,x=256+Math.cos(t)*rx,y=ry+Math.sin(t)*(ry-170)*.6;if(y>176)P(Math.round(x),Math.round(y),2,1,'#f4f1ea')}}})}
/* ── 항구: 바다, 배, 크레인, 부두 ── */
function bgSea(c,H){const{P}=H;H.bands(0,124,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);H.cloud(330,26,1,PF*2);
  H.ridge(132,x=>10+6*Math.sin(x/40)+4*Math.sin(x/13),'#7a9ab0','#9ab8cc');P(0,132,512,50,'#2f6aa8');H.bands(132,182,['#4a86c0','#3f7ab4','#356ea8','#2f64a0','#2a5a94']);for(let y=136;y<182;y+=5)for(let x=(y*7+PF*6)%23;x<512;x+=23)P(x,y,8,1,'#7aaee0');
  P(200,112,190,22,'#c2321f');P(196,108,198,6,'#1d1a1e');P(204,120,182,4,'#8a1a14');for(let i=0;i<7;i++)P(216+i*24,92,22,16,['#2f6be0','#e8a33a','#3a9e6a','#e0384c','#7a3fb0','#e8a33a','#2f6be0'][i]);P(352,78,26,30,'#f4f1ea');for(let i=0;i<3;i++)P(356+i*7,84,5,4,'#5a6a7a');P(366,70,6,10,'#c2321f');
  P(40,12,10,170,'#f58a24');P(110,12,10,170,'#f58a24');P(30,10,150,10,'#f58a24');P(30,10,150,2,'#ffb060');for(let x=34;x<176;x+=8){P(x,12,1,6,'#c8641a')}P(150,20,2,40,'#3a3f48');P(144,60,14,8,'#3a3f48');
  for(let i=0;i<3;i++){const x=400+i*38;P(x,120,34,62,['#2f6be0','#3a9e6a','#c2321f'][i]);for(let k=x+3;k<x+33;k+=4)P(k,122,1,58,shade(['#2f6be0','#3a9e6a','#c2321f'][i],.75))}
  P(0,182,512,6,'#5a626c');P(0,182,512,2,'#9aa3ad');for(let x=30;x<512;x+=90){P(x,178,10,6,'#2a2d34');P(x+1,176,8,2,'#3a3f48')}for(let x=8;x<512;x+=60)H.blob(x,190,5,4,['#3a3a44','#2a2a34','#1b1b22','#121218']);
  pfl(H,188,{w:44,q:.3,c:['#b8bcc0','#aeb2b6'],ln:'#9aa0a6',mode:'check'});P(0,224,512,3,'#e8b44a')}
/* ── 농촌: 산, 논, 농가, 경운기 ── */
function bgField(c,H){const{P}=H;H.bands(0,110,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);H.cloud(380,26,1,PF*2);
  H.ridge(128,x=>36+18*Math.sin(x/70)+8*Math.sin(x/23),'#8ab0a0','#a8ccb8');H.ridge(140,x=>22+12*Math.sin(x/55+2)+5*Math.sin(x/17),'#5a9a6a','#7ab88a');
  P(0,140,512,30,'#6aa84a');for(let x=0;x<512;x+=5)P(x,140+((x*7)%9),1,2,'#5a9a3a');
  // 농가(4m≈70px)
  P(36,118,140,8,'#2a3a6a');H.poly([[28,120],[184,120],[166,98],[46,98]],'#2f4a8a');P(46,98,120,2,'#5a7ac0');P(44,126,124,46,'#f4ecd8');P(44,126,124,2,'#ffffff');P(62,138,26,34,'#6b4a30');P(108,136,40,20,'#5a6a7a');P(110,138,36,16,'#9fd0ee');P(127,138,2,16,'#5a6a7a');
  H.tree(210,170,1);for(let k=0;k<6;k++)H.blob(200+(k*13)%26,124+(k*7)%14,2,2,['#f58a24','#e06a14','#c8501a','#8a3410']);
  // 경운기(먼 쪽)
  const tx=372,tb=178;P(tx,tb-34,60,22,'#3a8a4a');P(tx,tb-34,60,2,'#6ab87a');P(tx+44,tb-48,16,16,'#3a8a4a');P(tx+46,tb-46,12,8,'#9fd0ee');H.wheel(tx+12,tb-8,9);H.wheel(tx+50,tb-8,9);P(tx+60,tb-30,30,3,'#5a626c');H.wheel(tx+86,tb-6,5);
  pfl(H,170,{w:52,q:.34,c:['#7cc35a','#6ab84a'],mode:'row',ln:'#5aa040'});
  H.poly([[240,170],[272,170],[340,320],[200,320]],'#c8a874');for(let y=172;y<320;y+=8)P(250+(y-170)*.05,y,6,2,'#b8986a')}
/* ── 공항 계류장: 터미널, 관제탑, 비행기 앞부분 ── */
function bgPlane(c,H){const{P}=H;H.bands(0,140,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);H.cloud(120,30,1,PF*2);
  P(0,120,512,30,'#c6d6e2');for(let x=0;x<512;x+=12){P(x,122,10,24,'#8fbbdb');P(x,122,10,6,'#c6e3f8')}P(0,118,512,4,'#9aa3ad');
  P(56,40,12,82,'#d6dbe0');P(56,40,4,82,'#ffffff');P(44,30,36,12,'#5a6a7a');P(46,32,32,8,'#9fd0ee');P(48,24,28,6,'#3a3f48');P(61,16,2,8,'#e0384c');
  P(0,150,512,30,'#8a929c');P(0,160,512,2,'#f2c14e');
  // 비행기 앞부분(동체 지름 4m≈100px)
  const y0=72;for(let y=y0;y<y0+96;y++){const t=(y-y0-44)/48,ext=Math.round(70*Math.sqrt(Math.max(0,1-t*t))*(t>0?.9:1)),x1=390+ext;P(-20,y,x1+21,1,'#1d1a1e');if(y>y0&&y<y0+95)P(-20,y,x1+19,1,t<-.6?'#ffffff':t>.55?'#c6ccd2':t>.25?'#dfe3e6':'#f4f6f8')}
  P(-20,y0+60,452,10,'#2f6be0');P(-20,y0+70,446,4,'#c2321f');for(let x=10;x<380;x+=16){P(x,y0+30,8,10,'#2a3a4a');P(x+1,y0+31,6,3,'#6fa8dc')}
  P(418,y0+22,30,12,'#2a3a4a');P(420,y0+24,26,5,'#6fa8dc');P(446,y0+24,6,8,'#2a3a4a');P(300,y0+20,26,48,'#dfe3e6');P(300,y0+20,26,1,'#9aa3ad');P(300,y0+20,1,48,'#9aa3ad');
  P(-20,y0+86,400,10,'#c6ccd2');H.poly([[60,y0+90],[220,y0+90],[160,y0+112],[0,y0+112]],'#dfe3e6');
  for(const x of[120,380])H.wheel(x,186,10);P(118,y0+94,4,20,'#5a626c');P(378,y0+94,4,20,'#5a626c');
  // 탑승 계단
  for(let i=0;i<8;i++)P(286+i*6,y0+68+i*6,40,3,'#9aa3ad');P(282,y0+64,6,62,'#5a626c');P(330,y0+64,6,62,'#5a626c');
  pfl(H,186,{w:60,q:.35,c:['#7a7e86','#74787f'],mode:'row'});P(0,210,512,3,'#f2c14e');for(let x=0;x<512;x+=60)P(x,250,36,3,'#f4f1ea')}
/* ── 기차역 승강장: 지붕, 열차 옆면 ── */
function bgTrain(c,H){const{P}=H;P(0,0,512,40,'#3a3f48');for(let x=0;x<512;x+=24){P(x,0,2,40,'#5a626c')}P(0,36,512,4,'#2a2d34');for(let x=40;x<512;x+=150){P(x,40,8,150,'#5a626c');P(x,40,2,150,'#8a929c')}
  P(0,40,512,24,'#9fd0ee');P(0,52,512,12,'#c6e3f8');
  P(0,64,512,122,'#f4f6f8');P(0,64,512,3,'#ffffff');P(0,150,512,8,'#2f4a8a');P(0,158,512,3,'#c2321f');P(0,176,512,10,'#5a626c');
  for(let x=-10;x<512;x+=128){P(x,80,98,44,'#2a3a4a');for(let k=0;k<4;k++){P(x+3+k*24,83,20,38,'#6fa8dc');P(x+3+k*24,83,20,10,'#9fc4e8');P(x+8+k*24,100,10,21,['#e0a93f','#3f5f8f','#5b9e6a','#8a6d4d'][k]);P(x+10+k*24,92,6,7,'#f1c7a0')}
    P(x+100,72,24,104,'#d6dbe0');P(x+100,72,24,1,'#9aa3ad');P(x+111,72,2,104,'#9aa3ad');P(x+102,82,8,30,'#6fa8dc');P(x+114,82,8,30,'#6fa8dc')}
  P(0,186,512,4,'#1d1a1e');P(0,190,512,8,'#f2c14e');for(let x=0;x<512;x+=4)P(x,190,2,8,'#d8a83a');
  P(206,44,100,18,'#1d3a7c');signText(H,256-signW('출구',11)/2-6,47,'출구',11,'#ffffff','#0c1a3a');P(286,49,10,3,'#ffffff');P(292,47,3,7,'#ffffff');
  pfl(H,198,{w:40,q:.3,c:['#c6c8cc','#bcbec2'],ln:'#a8aab0',mode:'check'})}
/* ── 공장: 톱니 지붕, 굴뚝, 지게차 ── */
function bgFactory(c,H){const{P}=H;H.bands(0,140,['#7a8a9a','#8a98a6','#98a6b2','#a8b4be','#b8c2ca','#c8d0d6']);
  for(const[x,h]of[[90,120],[136,100]]){P(x,20,18,h,'#f4f1ea');for(let y=24;y<20+h;y+=16)P(x,y,18,7,'#c2321f');H.alpha(.6,()=>{H.blob(x+9,14,16,10,['#e6e8ea','#d6d8dc','#c6c8cc','#b6b8bc']);H.blob(x+20,4,14,8,['#e6e8ea','#d6d8dc','#c6c8cc','#b6b8bc'])})}
  P(420,64,70,110,'#dfe3e6');H.blob(455,64,35,10,['#ffffff','#f4f4f4','#dfe3e6','#c6ccd2']);for(let y=74;y<170;y+=12)P(420,y,70,1,'#c6ccd2');
  for(let k=0;k<8;k++){const x=20+k*50;H.poly([[x,80],[x+50,58],[x+50,80]],'#8a929c');P(x+40,60,10,20,'#5a6a7a');P(x+42,62,6,16,'#9fd0ee')}
  P(20,80,400,94,'#9aa3ad');for(let x=20;x<420;x+=4)P(x,80,1,94,'#8a929c');P(20,80,400,3,'#c6ccd2');P(20,110,400,8,'#f2c14e');for(let x=20;x<420;x+=16)P(x,110,8,8,'#1d1a1e');
  for(const x of[60,220]){P(x,124,96,50,'#5a626c');for(let y=126;y<174;y+=5)P(x+2,y,92,1,'#7a828c')}P(330,130,40,44,'#4a5a6a');P(332,132,36,18,'#9fd0ee');
  P(0,174,512,6,'#5a5a64');
  // 지게차(먼 쪽, 깊이 186)
  const fx=380,fb=200;P(fx,fb-30,40,22,'#f2c14e');P(fx,fb-30,40,2,'#fff0a0');P(fx+8,fb-56,2,26,'#3a3f48');P(fx+30,fb-56,2,26,'#3a3f48');P(fx+8,fb-56,24,3,'#3a3f48');P(fx+42,fb-60,3,52,'#5a626c');P(fx+42,fb-10,22,3,'#5a626c');H.wheel(fx+8,fb-6,7);H.wheel(fx+32,fb-6,7);
  for(let i=0;i<3;i++){P(20+i*36,186-i*0,30,4,'#c8a06a');P(22+i*36,176,26,10,'#8a6a3a')}
  pfl(H,180,{w:56,q:.34,c:['#6a6e74','#64686e'],mode:'row'});P(0,214,512,4,'#f2c14e');for(let x=0;x<512;x+=24)P(x,214,12,4,'#1d1a1e')}
/* ── 산불 현장(밤): 불붙은 능선, 연기, 소방차 ── */
function bgFire(c,H){const{P}=H;H.raw(true);H.bands(0,160,['#1a0a10','#2a0e12','#4a1612','#7a2414','#a83a18','#d0601e']);
  H.ridge(160,x=>48+20*Math.sin(x/60)+10*Math.sin(x/19),'#2a1210','#5a2010');for(let x=10;x<512;x+=34)H.flame(x,160-(48+20*Math.sin(x/60)+10*Math.sin(x/19))+6,18+(x*7)%14,7,PF*2);
  H.ridge(176,x=>26+10*Math.sin(x/45+1),'#1a0c0a','#3a160c');for(let x=30;x<512;x+=60)H.flame(x,176-(26+10*Math.sin(x/45+1))+4,12+(x*5)%10,6,PF*2+1);
  H.alpha(.5,()=>{for(let i=0;i<5;i++)H.blob(60+i*100,40+(i%2)*14,40,12,['#5a3a3a','#4a2e2e','#3a2424','#2a1a1a'])});
  const r=mkRng('em'+PF);for(let i=0;i<70;i++)P(Math.floor(r()*512),Math.floor(r()*200),1,1,r()<.5?'#ffd23f':'#f58a24');H.raw(false);
  P(0,176,512,10,'#2a1a14');
  // 소방차(깊이 186, 길이 8m≈170px)
  const tx=330,tb=196;P(tx,tb-62,170,48,'#c8283a');P(tx,tb-62,170,2,'#ff6a6a');P(tx+130,tb-80,40,24,'#c8283a');P(tx+134,tb-76,30,14,'#9fd0ee');P(tx,tb-30,170,4,'#f4f1ea');
  for(let k=0;k<6;k++)P(tx+8+k*20,tb-56,14,20,'#a01a2a');P(tx+10,tb-70,110,6,'#c6ccd2');for(let k=0;k<12;k++)P(tx+12+k*9,tb-70,2,6,'#8a929c');
  H.raw(true);P(tx+140,tb-84,10,4,PF?'#ff3a3a':'#3a6aff');P(tx+152,tb-84,10,4,PF?'#3a6aff':'#ff3a3a');H.raw(false);H.wheel(tx+30,tb-10,12);H.wheel(tx+140,tb-10,12);
  pfl(H,186,{w:56,q:.34,c:['#3a2a26','#342622'],mode:'row'});H.raw(true);H.alpha(.08,()=>P(0,186,512,134,'#f58a24'));H.raw(false)}
Object.assign(SCN3,{
  night:{noOld:['house'],full:(c,H)=>streetV3(c,H,'night'),extras:[['cit2','phone',58,193,0],['aide','walk',470,192,1]],deco:()=>[[262,c=>hdCar(c,PF?352:358,282,mz(262),'#e8e4d8',false)]]},
  rain:{noOld:['house'],full:(c,H)=>streetV3(c,H,'rain'),extras:[['cit','umb',58,193,0],['cit2','umb',470,192,1]]},
  market:{full:bgMarket,extras:[['cit','walkB',30,206,0],['old','talkQ',140,204,0],['cit2','idleQ',360,204,1,{st:'bob',h:'#3a2a20'}],['cit','walk',486,208,1]]},
  school:{full:bgSchool,extras:[['cit','walk',30,200,0],['cit2','talkQ',66,204,0],['cit','talkQ',446,204,1,{st:'bob',h:'#3a2a20'}],['cit2','walkB',486,200,1]]},
  sea:{full:bgSea,extras:[['cit2','idleQ',24,206,0],['old','talkQ',60,210,0],['cit2','phone',478,208,1]]},
  field:{full:bgField,extras:[['old','idleQ',40,200,0],['cit','talkQ',96,204,0],['old','talkQ',452,206,1]]},
  plane:{full:bgPlane,extras:[['cit','walkB',28,206,0],['cit2','walkB',70,210,0],['aide','idleQ',478,210,1]]},
  train:{full:bgTrain,extras:[['cit2','phone',24,210,0],['cit','walkB',62,212,0],['aide','walk',450,212,1],['cit2','idleQ',490,210,1]]},
  factory:{full:bgFactory,extras:[['cit2','idleQ',30,206,0],['cit2','paper',66,208,0],['cit2','talkQ',448,208,1]]},
  fire:{full:bgFire,extras:[['cit2','idleQ',36,210,0]]},
});
