// 공용 도트 그리드: 레이어별로 칠하고 마지막에 외곽선/안쪽선 처리
function pxGrid(opt){
  const OX=14,OY=24,GW=68,GH=104,col=new Array(GW*GH).fill(null),lay=new Int16Array(GW*GH),nol=new Uint8Array(GW*GH);let L=0,NL=0;
  const set=(x,y,cl)=>{x=Math.round(x);y=Math.round(y);if(x+OX<0||x+OX>=GW||y+OY<0||y+OY>=GH||!cl)return;const i=(y+OY)*GW+x+OX;col[i]=cl;lay[i]=L;nol[i]=NL};
  const p=(x,y,w,h,cl)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,cl)};
  const T=opt.tones;// [[비율 경계, 배율]...]
  const shape=(y0,rows,base,o={})=>rows.forEach(([a,b],k)=>{const y=y0+k;for(let x=a;x<=b;x++){const fr=b===a?.5:(x-a)/(b-a);let f=1;
      for(const [lim,m] of T)if(fr<=lim){f=m;break}
      if(o.vg)f*=1+o.vg*(.5-k/Math.max(1,rows.length-1));if(o.rim&&x===a&&b-a>2)f=Math.max(f,o.rim);if(o.bot&&k>=rows.length-o.bot)f=Math.min(f,.72);set(x,y,shade(base,f))}});
  const span=(y0,hws,cx=18)=>hws.map(h=>[Math.round(cx-h),Math.round(cx+h)]);
  const flush=(r,X,Y)=>{const out=col.slice(),N=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;
      if(!col[i]){let nb=null;for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]){nb=col[j];break}}if(nb)out[i]=opt.outer||shade(nb,.3)}
      else if(!nol[i]){for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]&&!nol[j]&&lay[j]>lay[i]){out[i]=opt.inner||shade(col[i],.5);break}}}}
    for(let y=0;y<GH;y++){let x=0;while(x<GW){const cl=out[y*GW+x];if(!cl){x++;continue}let n=1;while(x+n<GW&&out[y*GW+x+n]===cl)n++;r(X+x-OX,Y+y-OY,n,1,cl);x+=n}}};
  return{set,p,shape,span,flush,part(){L++;NL=0},feat(){L++;NL=1}}}

// ───────── 메탈슬러그 풍: 3.5등신, 굵은 검정 외곽선, 큼직한 코·손·신발, 옷 주름 ─────────
function personMS(r,X,Y,c,wave){
  const G=pxGrid({tones:[[.12,1.32],[.3,1.12],[.68,1],[.86,.76],[1,.58]],outer:'#140f12'}),{p,shape,span,part,feat}=G;
  const s=c.s||'#f1c7a0',S2=shade(s,.84),S3=shade(s,.68),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421',hd=shade(h,.6),INK='#140f12';
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,b=PF?1:0,AC=ROBE?'#2a2a32':P;
  // 뒷머리
  part();if(st==='long')shape(2,span(2,[9.5,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,9.5,9.5,9,9,8.5,8,7]),shade(h,.8));
  if(st==='bob')shape(2,span(2,[9.5,10,10,10,10,10,10,10,10,10,10,10,10,9.5,9,8]),shade(h,.8));
  // 하체
  part();
  if(ROBE){shape(20,span(20,[7,9.5,11,11.5,12,12,12,12.5,12.5,12.5,12.5,13,13,13,13,13,13,13.5,13.5,13.5,13.5,14,14,14,14,14,14,14,14,14,14,14.5,14.5,14.5,14.5,14.5,14.5,15,15,15,15,15,15,15,15]),'#2a2a32',{bot:2});feat();
    for(const x of[11,17,24])for(let y=42;y<63;y++)if((y+x)%7<5)p(x+((y>>2)&1),y,1,1,'#18181e')}
  else if(c.sk){shape(43,span(43,[11,11.5,12,12.5,13,13.5,14,14.5,15]),L0,{bot:1});feat();for(let i=0;i<5;i++)p(9+i*4,45,1,6,shade(L0,.62));
    part();shape(52,Array(7).fill([11,16]),s);shape(52,Array(7).fill([20,25]),s)}
  else{shape(43,Array(16).fill(0).map((_,k)=>[9-(k>10?1:0),17]),L0);shape(43,Array(16).fill(0).map((_,k)=>[19,27+(k>10?1:0)]),L0);
    feat();p(11,50,4,1,shade(L0,.55));p(12,51,2,1,shade(L0,.55));p(22,50,4,1,shade(L0,.55));p(22,51,2,1,shade(L0,.55));p(10,46,1,6,shade(L0,1.35));p(20,46,1,6,shade(L0,1.35))}
  if(!ROBE){part();const sh='#3b2a22';shape(58,[[8,16],[6,17],[5,17],[5,17],[5,17],[5,17],[5,17]],sh,{bot:2});shape(58,[[19,28],[19,30],[19,31],[19,31],[19,31],[19,31],[19,31]],sh,{bot:2});
    feat();p(7,60,4,1,shade(sh,2.3));p(21,60,4,1,shade(sh,2.3));p(5,64,13,1,'#1e1612');p(19,64,13,1,'#1e1612')}
  // 팔(뒤)
  const hand=(x)=>{part();shape(39,[[x,x+6],[x-1,x+6],[x-1,x+6],[x-1,x+6],[x,x+6],[x+1,x+5]],s);feat();p(x,42,1,1,S3);p(x+2,43,1,2,S3);p(x+4,43,1,2,S3)};
  const arm=(x)=>{part();shape(22,Array(17).fill([x,x+5]),AC);feat();p(x+1,28,3,1,shade(AC,.6));p(x+2,29,2,1,shade(AC,.6));p(x+1,33,3,1,shade(AC,.6));if(!ROBE)p(x,37,6,2,c.w||'#f4f4f4');hand(x)};
  arm(3);if(!wave)arm(28);
  // 몸통
  part();shape(20,span(20,[7,9.5,11,11.5,12,12,12,12,12,11.5,11.5,11.5,11,11,11,11,11,11,11,11,11,11,11]),ROBE?'#2a2a32':P);
  feat();
  if(ROBE){p(14,20,9,3,'#f4f4f4');p(15,23,7,2,'#f4f4f4');p(17,25,3,1,'#d6d6d6')}
  else if(c.hood){p(10,20,17,4,shade(P,.7));p(11,21,15,1,shade(P,.55));p(14,24,1,8,'#f4f4f4');p(22,24,1,8,'#f4f4f4');p(11,34,15,6,shade(P,.82));p(11,34,15,1,shade(P,.6))}
  else if(c.w){for(let k=0;k<12;k++){const w=Math.max(0,4-Math.floor(k/2.8));p(18-w,20+k,2*w+1,1,c.w);if(w>0){p(17-w,20+k,1,1,INK);p(19+w,20+k,1,1,INK)}}
    if(c.t){p(17,21,3,2,shade(c.t,.75));p(17,23,3,8,c.t);p(17,23,1,7,shade(c.t,1.4));p(19,23,1,8,shade(c.t,.65));p(18,31,1,2,shade(c.t,.65))}
    p(12,27,2,1,shade(P,.6));p(13,28,2,1,shade(P,.6));p(23,26,2,1,shade(P,.6));p(22,27,2,1,shade(P,.6));
    p(18,35,1,1,INK);p(18,38,1,1,INK)}
  if(!ROBE){p(7,40,23,2,'#1f1a18');p(17,40,3,2,'#c8a13a')}
  if(c.pin){p(10,24,3,3,'#8a6a1a');p(11,25,1,1,'#ffe48a')}
  if(c.steth){p(13,21,1,12,'#3a3a44');p(23,21,1,12,'#3a3a44');p(13,33,11,1,'#3a3a44');p(16,34,4,3,'#9aa3ad');p(17,34,2,1,'#e8eef2')}
  // 목·귀·얼굴
  part();p(15,16,7,5,S3);
  part();if(!(st==='long'||st==='bob')){shape(7,[[7,9],[7,9],[7,9],[8,9],[8,9]],s);shape(7,[[27,29],[27,29],[27,29],[27,28],[27,28]],S2)}
  part();shape(0,span(0,[5,7,8,8.5,8.5,8.5,8.5,8.5,8.5,8.5,8.5,8.5,8.5,8,7.5,7,6,4.5]),s,{bot:2});
  feat();
  // 눈썹(굵게)·눈(작게, 만화풍)
  p(12,6,4,2,hd);p(11,7,1,1,hd);p(20,6,4,2,hd);p(24,7,1,1,hd);if(FEM){p(12,7,4,1,s);p(20,7,4,1,s)}
  p(13,9,1,2,'#ffffff');p(14,9,1,2,INK);p(21,9,1,2,INK);p(22,9,1,2,'#ffffff');if(FEM){p(12,8,3,1,INK);p(21,8,3,1,INK)}
  // 큰 코
  p(17,9,3,4,S2);p(17,9,1,3,shade(s,1.12));p(19,10,1,3,S3);p(17,13,3,1,S3);p(18,12,1,1,'#7a3a30');
  p(12,13,1,2,S3);p(24,13,1,2,S3);
  if(FEM){p(11,12,2,1,'#f09a8a');p(24,12,2,1,'#f09a8a')}
  const lp=FEM?'#c0404a':'#6a2a24';
  if(c.talk&&PF){p(14,15,8,3,'#4a1414');p(15,15,6,1,'#ffffff');p(16,17,4,1,'#d0606a')}else{p(14,15,8,1,lp);p(13,14,1,1,lp);p(22,14,1,1,lp);p(16,16,4,1,S3)}
  if(c.gl){const F='#140f12';p(11,8,6,1,F);p(11,8,1,4,F);p(16,8,1,4,F);p(11,11,6,1,F);p(20,8,6,1,F);p(20,8,1,4,F);p(25,8,1,4,F);p(20,11,6,1,F);p(17,9,3,1,F);p(12,9,1,1,'#bfe3ff');p(21,9,1,1,'#bfe3ff')}
  // 앞머리
  part();const crown=hw=>shape(-4,span(-4,hw),h);
  if(st==='bald'){feat();p(13,1,5,1,shade(s,1.3));p(12,2,2,1,shade(s,1.15));part();shape(4,Array(7).fill([8,10]),h);shape(4,Array(7).fill([26,28]),h)}
  else if(st==='slick'){crown([5,7.5,9,9.5,9.5,9.5,9.5,9.5,9.5]);p(8,5,2,6,h);p(27,5,2,6,shade(h,.7));feat();for(let i=0;i<4;i++)p(10+i*4,-2+(i&1),3,1,shade(h,1.5));p(10,3,17,1,hd)}
  else if(st==='short'||st==='part'){crown([5,7.5,9,9.5,9.5,9.5,9.5,9.5,9.5]);
    const len=st==='part'?[3,4,4,3,3,4,3,2,1,0,0,1,2,2,3,2,2]:[2,4,3,2,3,4,3,2,3,4,3,2,3,4,3,2,2];for(let x=10;x<=26;x++){const n=len[x-10];if(n)p(x,5,1,n,x>23?shade(h,.75):h)}
    p(8,4,2,8,h);p(27,4,2,7,shade(h,.7));feat();p(11,-2,5,1,shade(h,1.6));p(10,-1,2,1,shade(h,1.6));p(16,-3,3,1,shade(h,1.35));if(st==='part')p(20,-3,1,8,hd)}
  else if(FEM){if(st==='bun'){part();shape(-10,span(-10,[3,4.5,5,5,4.5,3]),h);part()}
    crown([5,7.5,9,9.5,10,10,10,10,10]);for(let x=9;x<=27;x++){const n=x<19?Math.max(0,6-Math.floor((x-9)*.6)):x<21?1:Math.round((x-20)*.8);if(n)p(x,4,1,n,x>24?shade(h,.75):h)}
    const e=st==='long'?24:st==='bob'?18:11;for(let y=4;y<=e;y++){p(7,y,3,1,h);p(27,y,3,1,shade(h,.7))}
    feat();p(11,-2,5,1,shade(h,1.6));p(10,-1,2,1,shade(h,1.6));p(16,-3,3,1,shade(h,1.35));if(st==='bun'){p(8,13,1,2,'#f2c14e');p(28,13,1,2,'#f2c14e')}}
  // 흔드는 팔
  if(wave){part();shape(6,Array(17).fill([28,33]),P);if(!ROBE)p(28,6,6,2,c.w||'#f4f4f4');part();shape(-1-b,[[28,33],[27,34],[27,34],[27,34],[28,34],[28,33],[29,32]],s);feat();for(let i=0;i<3;i++)p(28+i*2,1-b,1,2,S3)}
  if(c.note){part();shape(34,Array(11).fill([34,42]),'#ffffff');feat();p(34,34,9,2,'#c2321f');for(let i=0;i<3;i++)p(35,38+i*2,7,1,'#9aa3ad')}
  G.flush(r,X,Y)}

// ───────── 킹오파 풍: 6.5등신, 넓은 어깨·역삼각 몸, 림라이트 강한 5단 음영 ─────────
function personKOF(r,X,Y,c,wave){
  const G=pxGrid({tones:[[.1,1.42],[.26,1.16],[.6,1],[.82,.74],[1,.54]]}),{p,shape,span,part,feat}=G;
  const s=c.s||'#e8b48e',S2=shade(s,.82),S3=shade(s,.66),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421',hd=shade(h,.6);
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,b=PF?1:0,AC=ROBE?'#2a2a32':P;
  const sw=FEM?7.5:10,wa=FEM?5:6.5,hp=FEM?7.5:7;
  // 뒷머리
  part();if(st==='long')shape(-12,span(-12,[4,5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,6,6,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6,6,5.5,5.5,5,4.5,4]),shade(h,.8));
  if(st==='long'){}
  if(st==='bob')shape(-12,span(-12,[4,5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5,4.5]),shade(h,.8));
  // 다리(콘트라포스토)
  part();
  if(ROBE)shape(2,span(2,Array(64).fill(0).map((_,k)=>Math.min(13,sw-1+k*.08))),'#2a2a32',{rim:1.6});
  else if(c.sk){shape(25,span(25,[hp,hp,hp+.5,hp+.5,hp,hp,hp-.5,hp-.5,hp-.5,hp-1,hp-1,hp-1,hp-1,hp-1.5,hp-1.5]),L0,{rim:1.5,bot:1});
    part();shape(40,Array(24).fill(0).map((_,k)=>[14-(k>16?1:0),16-(k>16?1:0)]),s,{rim:1.2});shape(40,Array(24).fill(0).map((_,k)=>[20+(k>16?1:0),22+(k>16?1:0)]),s,{rim:1.2})}
  else{shape(26,Array(38).fill(0).map((_,k)=>{const t=k/37;return[Math.round(11-t*1.5),Math.round(17-t*2.5)]}),L0,{rim:1.5});
    shape(26,Array(38).fill(0).map((_,k)=>{const t=k/37;return[Math.round(19+t*1.5),Math.round(25+t*2)]}),L0,{rim:1.5});
    feat();p(11,44,1,4,shade(L0,1.6));p(20,44,1,4,shade(L0,1.6));p(13,26,1,8,shade(L0,.6))}
  if(!ROBE){part();const sh='#2c201a';shape(63,[[9,14],[7,15],[6,15],[6,15]],sh,{bot:1});shape(63,[[21,26],[21,28],[21,29],[21,29]],sh,{bot:1});feat();p(8,64,3,1,shade(sh,2.4));p(22,64,3,1,shade(sh,2.4))}
  // 팔(뒤)
  const arm=x=>{part();shape(3,Array(28).fill(0).map((_,k)=>{const o=k<14?0:(x<18?-1:1);return[x+o,x+3+o]}),AC,{rim:1.5});if(!ROBE)p(x+(x<18?-1:1),29,4,2,c.w||'#f4f4f4');
    part();shape(31,[[x+(x<18?-1:1),x+3+(x<18?-1:1)],[x+(x<18?-1:1),x+3+(x<18?-1:1)],[x+(x<18?-1:1),x+3+(x<18?-1:1)],[x+(x<18?0:1),x+2+(x<18?0:1)]],s,{rim:1.2})};
  arm(18-sw-1);if(!wave)arm(18+sw-2);
  // 몸통(역삼각)
  part();const tw=[sw-4,sw-1.5,sw-.5,sw,sw,sw,sw-.3,sw-.6,sw-1,sw-1.4,sw-1.8,sw-2.2,wa+1.5,wa+1,wa+.5,wa,wa,wa,wa,wa,wa+.3,wa+.6,wa+.9,hp];
  shape(2,span(2,tw),ROBE?'#2a2a32':P,{rim:1.6});
  feat();
  if(ROBE){p(15,2,7,3,'#f4f4f4');p(16,5,5,2,'#f4f4f4')}
  else if(c.hood){p(12,2,13,3,shade(P,.66));p(15,5,1,6,'#f4f4f4');p(21,5,1,6,'#f4f4f4');p(13,16,11,5,shade(P,.8))}
  else if(c.w){for(let k=0;k<12;k++){const w=Math.max(0,3-Math.floor(k/3.5));p(18-w,2+k,2*w+1,1,c.w);if(w>0){p(17-w,2+k,1,1,shade(P,.45));p(19+w,2+k,1,1,shade(P,.45))}}
    if(c.t){p(17,3,3,2,shade(c.t,.72));p(18,5,1,9,c.t);p(17,6,1,6,shade(c.t,1.35));p(19,6,1,7,shade(c.t,.6))}
    // 가슴·복부 음영 (근육 실루엣)
    p(13,9,4,1,shade(P,.72));p(21,9,4,1,shade(P,.6));p(18,15,1,1,shade(P,.5));p(18,19,1,1,shade(P,.5))}
  if(!ROBE){p(18-wa,24,2*wa+1,1,'#1a1614');p(17,24,3,1,'#c8a13a')}
  if(c.pin){p(12,6,2,2,'#c8a13a')}
  if(c.steth){p(14,3,1,10,'#3a3a44');p(22,3,1,10,'#3a3a44');p(14,13,9,1,'#3a3a44');p(17,14,3,2,'#9aa3ad')}
  // 목·머리
  part();p(16,-1,5,4,S3);p(16,-1,1,4,S2);
  part();if(!(st==='long'||st==='bob')){p(13,-7,1,3,S2);p(23,-7,1,3,S3)}
  part();shape(-12,span(-12,[3,4,4.5,4.5,4.5,4.5,4.5,4,4,3.5,2.5,1.5]),s,{rim:1.15});
  feat();
  p(15,-7,2,1,hd);p(20,-7,2,1,hd);if(!FEM){p(14,-6,1,1,hd);p(22,-6,1,1,hd)}
  p(15,-6,2,1,'#201818');p(20,-6,2,1,'#201818');if(FEM){p(15,-7,2,1,'#201818');p(20,-7,2,1,'#201818');p(14,-7,1,1,'#201818');p(22,-7,1,1,'#201818')}
  p(19,-5,1,2,S3);p(18,-3,2,1,S3);
  const lp=FEM?'#b8424a':shade(s,.62);if(c.talk&&PF){p(17,-2,3,2,'#4a1818');p(17,-2,3,1,'#ffffff')}else p(17,-2,3,1,lp);
  p(20,-4,2,3,S2);p(21,-2,1,2,S3);
  if(c.gl){const F='#2a2420';p(14,-7,3,2,F);p(20,-7,3,2,F);p(15,-7,1,1,'#bfe3ff');p(21,-7,1,1,'#bfe3ff');p(17,-7,3,1,F)}
  // 앞머리
  part();const crown=hw=>shape(-15,span(-15,hw),h,{rim:1.6});
  if(st==='bald'){feat();p(15,-11,3,1,shade(s,1.35));part();p(13,-9,1,4,h);p(23,-9,1,4,h)}
  else if(st==='slick'){crown([3,4.5,5,5.5,5.5,5]);p(13,-10,1,4,h);p(23,-10,1,4,hd);feat();p(15,-14,4,1,shade(h,1.6));p(14,-12,7,1,hd)}
  else if(st==='short'||st==='part'){crown([3,4.5,5,5.5,5.5,5]);const len=st==='part'?[2,3,3,2,2,1,0,1,2,2,1]:[2,3,2,3,2,3,2,3,2,2,1];for(let x=13;x<=23;x++)if(len[x-13])p(x,-10,1,len[x-13],x>20?hd:h);
    p(13,-10,1,5,h);p(23,-10,1,4,hd);feat();p(15,-14,4,1,shade(h,1.7));p(14,-13,2,1,shade(h,1.4));if(st==='part')p(20,-15,1,6,hd);
    // 앞으로 뻗친 한 가닥(킹오파 감성)
    part();p(12,-9,1,3,h);p(11,-7,1,2,h)}
  else if(FEM){if(st==='bun'){shape(-19,span(-19,[2,3,3.5,3,2]),h,{rim:1.5})}
    crown([3,4.5,5,5.5,5.5,5.5]);for(let x=13;x<=23;x++){const n=x<19?Math.max(1,4-Math.floor((x-13)*.6)):x<21?1:x-19;p(x,-10,1,n,x>21?hd:h)}
    const e=st==='long'?-1:st==='bob'?-2:-6;for(let y=-10;y<=e;y++){p(12,y,2,1,h);p(23,y,2,1,hd)}
    feat();p(15,-14,4,1,shade(h,1.7));p(14,-13,2,1,shade(h,1.4))}
  // 흔드는 팔(주먹 불끈)
  if(wave){part();const x=18+sw-2;shape(-14,Array(18).fill(0).map((_,k)=>[x+1+(k<9?1:0),x+4+(k<9?1:0)]),P,{rim:1.5});if(!ROBE)p(x+2,-14,4,2,c.w||'#f4f4f4');
    part();shape(-19-b,[[x+2,x+5],[x+1,x+6],[x+1,x+6],[x+1,x+6],[x+2,x+5]],s,{rim:1.2});feat();p(x+2,-17-b,3,1,S3)}
  if(c.note){part();shape(18,Array(9).fill([30,36]),'#ffffff');feat();p(30,18,7,2,'#c2321f')}
  G.flush(r,X,Y)}
