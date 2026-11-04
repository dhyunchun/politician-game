// ───────── 던전앤파이터 풍: 5.5등신, 3/4 측면, 7단 그라데이션 음영, 뾰족한 머리결, 갈색 톤 외곽선 ─────────
function personDNF(r,X,Y,c,wave){
  const G=pxGrid({tones:[[.06,1.42],[.16,1.24],[.32,1.1],[.58,1],[.74,.87],[.88,.74],[1,.6]]}),{p,shape,span,part,feat,set}=G;
  const s=c.s||'#f0c4a0',S2=shade(s,.88),S3=shade(s,.74),S4=shade(s,.6),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421',hd=shade(h,.62),hh=shade(h,1.55),hh2=shade(h,1.28);
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,b=PF?1:0,AC=ROBE?'#262630':P;
  const sw=FEM?7:8.5,wa=FEM?5:6.3;
  const iris=c.eye||(FEM?'#6a3e2a':'#3a2a24');
  // 뒷머리 (3/4: 뒤쪽 왼편으로 더 보임)
  part();
  if(st==='long')shape(-15,span(-15,[5,6.5,7,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7,7,6.5,6.5,6,6,5.5,5.5,5,5,4.5,4,3.5,3],17.5),shade(h,.82),{vg:.25});
  if(st==='bob')shape(-15,span(-15,[5,6.5,7,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7.5,7,6.5],17.5),shade(h,.82),{vg:.25});
  // 다리 (긴 다리, 살짝 벌린 자세)
  part();
  if(ROBE)shape(4,span(4,Array(62).fill(0).map((_,k)=>Math.min(12.5,sw+k*.07)),18),'#262630',{vg:.3});
  else if(c.sk){shape(26,span(26,[6.5,7,7,7,7,6.8,6.6,6.4,6.2,6,6,6,5.8,5.8]),L0,{vg:.3,bot:1});
    part();shape(40,Array(23).fill(0).map((_,k)=>[13+(k>15?1:0),16]),s,{vg:.2});shape(40,Array(23).fill(0).map((_,k)=>[20,23-(k>15?1:0)]),s,{vg:.2})}
  else{shape(27,Array(37).fill(0).map((_,k)=>{const t=k/36;return[Math.round(12-t*1.2),Math.round(17-t*2)]}),L0,{vg:.3});
    shape(27,Array(37).fill(0).map((_,k)=>{const t=k/36;return[Math.round(19+t*1.3),Math.round(24.5+t*1.6)]}),L0,{vg:.3});
    feat();for(let y=33;y<62;y++){p(Math.round(13.5-(y-27)/36*1.6),y,1,1,shade(L0,1.5));p(Math.round(21.5+(y-27)/36*1.4),y,1,1,shade(L0,1.25))}
    p(12,46,4,1,shade(L0,.7));p(20,47,4,1,shade(L0,.7))}
  if(!ROBE){part();const sh=FEM?'#3a1e22':'#2a1e18';
    shape(63,[[10,14],[9,15],[8,16],[8,16]],sh,{bot:1});shape(63,[[21,25],[21,27],[21,28],[21,28]],sh,{bot:1});
    feat();p(9,64,4,1,shade(sh,2.6));p(23,64,4,1,shade(sh,2.6));p(10,63,2,1,shade(sh,1.8))}
  // 뒤팔
  const arm=(x,dir)=>{part();shape(5,Array(28).fill(0).map((_,k)=>{const o=k<13?0:dir;return[x+o,x+3+o]}),AC,{vg:.3});
    feat();p(x+1+dir,17,2,1,shade(AC,.7));p(x+dir,24,3,1,shade(AC,.72));if(!ROBE)p(x+dir,31,4,2,c.w||'#f4f4f4');
    part();shape(33,[[x+dir,x+3+dir],[x+dir,x+3+dir],[x+dir,x+3+dir],[x+dir+1,x+3+dir],[x+dir+1,x+2+dir]],s)};
  arm(Math.round(18-sw-1.5),-1);if(!wave)arm(Math.round(18+sw-1.5),1);
  // 몸통 + 재킷 자락
  part();
  const tw=[sw-3.5,sw-1.2,sw-.3,sw,sw,sw-.2,sw-.4,sw-.7,sw-1,sw-1.3,sw-1.6,sw-1.9,wa+1,wa+.7,wa+.4,wa+.2,wa,wa,wa,wa,wa+.2,wa+.4,wa+.7,wa+1,FEM?wa+1.5:wa+1.6,FEM?wa+1.8:wa+2];
  shape(3,span(3,tw,18),ROBE?'#262630':P,{vg:.35});
  if(!ROBE&&!FEM&&!c.hood){shape(29,[[11,17],[11,17],[11,16]],P,{vg:.2});shape(29,[[19,25],[19,25],[20,25]],shade(P,.85))}
  feat();
  const V=19;// 3/4라 중심선이 오른쪽으로
  if(ROBE){p(15,3,8,3,'#f4f4f4');p(16,6,6,2,'#eaeaea');p(17,8,4,1,'#d4d4d4')}
  else if(c.hood){p(11,3,15,3,shade(P,.68));p(12,4,13,1,shade(P,.55));p(16,6,1,6,'#f4f4f4');p(21,6,1,6,'#f4f4f4');p(12,18,13,6,shade(P,.84));p(12,18,13,1,shade(P,.66))}
  else if(c.w){for(let k=0;k<13;k++){const w=Math.max(0,3-Math.floor(k/3.6)),x0=V-w;p(x0,3+k,2*w+1,1,k<2?shade(c.w,.92):c.w);
      if(w>0){p(x0-1,3+k,1,1,shade(P,1.35));p(x0-2,3+k,1,1,shade(P,.55));p(V+w+1,3+k,1,1,shade(P,.45))}}
    if(c.t){p(V-1,4,3,2,shade(c.t,.72));p(V,6,1,10,c.t);p(V-1,7,1,7,shade(c.t,1.4));p(V+1,7,1,8,shade(c.t,.62));p(V,16,1,1,shade(c.t,.6))}
    // 라펠 칼깃·단추·포켓스퀘어
    p(V-5,5,1,1,shade(P,.5));p(V+5,5,1,1,shade(P,.5));for(let i=0;i<2;i++){p(V,19+i*4,1,1,shade(P,.45));p(V-1,19+i*4,1,1,shade(P,1.3))}
    p(V+4,10,3,1,shade(P,.55));if(!FEM){p(V+5,9,2,1,'#f4f4f4')}
    p(13,11,1,8,shade(P,1.18));p(24,12,1,9,shade(P,.66))}
  if(c.pin){p(13,8,2,2,'#d9b04a');p(13,8,1,1,'#fff0b0')}
  if(c.steth){p(14,4,1,11,'#34343e');p(23,4,1,11,'#34343e');p(14,15,10,1,'#34343e');p(17,16,3,3,'#a0aab4');p(17,16,1,1,'#eef4f8')}
  if(!ROBE&&FEM){p(18-wa,27,2*wa+1,1,shade(P,.55))}
  // 목
  part();p(16,0,5,5,S3);p(16,0,1,5,S2);p(19,0,2,5,S4);
  // 귀(3/4: 왼쪽만)
  part();if(!(st==='long'||st==='bob')){shape(-8,[[12,13],[11,13],[11,13],[12,13],[12,13]],s)}
  // 얼굴 (3/4 측면: 오른쪽 볼이 좁고 턱선이 각짐)
  part();
  const FR=[[15,22],[14,23],[13,24],[13,24],[13,24],[13,24],[13,24],[13,24],[13,24],[14,24],[14,23],[15,23],[16,22],[17,21],[18,20]];
  FR.forEach(([a,bb],k)=>{const y=-14+k;for(let x=a;x<=bb;x++){let cl=s;const fr=(x-a)/(bb-a);
    if(fr<.2&&k>2&&k<11)cl=shade(s,1.06);if(fr>.75)cl=S2;if(x===bb&&k>3)cl=S3;if(k>=11)cl=fr>.5?S3:S2;if(k===14)cl=S3;set(x,y,cl)}});
  feat();
  // 눈 (먼 눈 작게, 가까운 눈 크게)
  const lash=shade(h,.45);
  p(15,-8,3,1,lash);p(15,-7,2,3,iris);p(15,-7,2,1,shade(iris,.55));p(15,-6,1,1,'#ffffff');p(17,-7,1,2,'#f4ece8');
  p(20,-8,4,1,lash);if(FEM){p(24,-9,1,1,lash);p(14,-9,1,1,lash)}p(20,-7,3,3,iris);p(20,-7,3,1,shade(iris,.55));p(21,-5,1,1,shade(iris,1.7));p(20,-6,1,1,'#ffffff');p(23,-7,1,2,'#f4ece8');
  // 눈썹(날카롭게)
  if(FEM){p(15,-10,3,1,hd);p(20,-10,4,1,hd)}else{p(14,-10,4,1,hd);p(15,-11,2,1,hd);p(20,-11,4,1,hd);p(24,-10,1,1,hd)}
  // 코(측면 윤곽)·입·턱 그림자
  p(23,-6,1,3,S3);p(24,-4,1,2,S3);p(23,-3,1,1,S4);p(22,-3,1,1,S2);
  const lp=FEM?'#c0525a':shade(s,.62);
  if(c.talk&&PF){p(19,-1,3,2,'#4a1a1a');p(19,-1,3,1,'#f6f2ee')}else{p(19,-1,3,1,lp);if(FEM)p(20,0,1,1,shade(lp,1.25))}
  if(FEM){p(14,-4,2,1,'#f2a8a0');p(22,-4,1,1,'#f2a8a0')}
  if(c.gl){const F='#3a2c26';p(14,-8,4,1,F);p(14,-8,1,4,F);p(14,-5,4,1,F);p(17,-8,1,4,F);p(19,-8,5,1,F);p(19,-8,1,4,F);p(23,-8,1,4,F);p(19,-5,5,1,F);p(18,-7,1,1,F);p(12,-7,2,1,F);
    p(15,-7,1,1,'#dff2ff');p(20,-7,1,1,'#dff2ff')}
  // 앞머리: 뾰족한 결 + 2단 광택
  part();
  const spikes=(y0,list,col)=>list.forEach(([x,len,dx])=>{len=Math.max(1,len-2);for(let k=0;k<len;k++)set(x+Math.round(dx*k),y0+k,col)});
  const crown=(hws)=>{shape(-19,span(-19,hws,18.5),h,{vg:.35});feat();
    p(13,-16,5,1,hh);p(12,-15,3,1,hh);p(18,-17,4,1,hh2);p(22,-16,2,1,hh2);p(14,-17,2,1,'#ffffff');part()};
  if(st==='bald'){feat();p(16,-13,4,1,shade(s,1.3));p(15,-12,2,1,shade(s,1.15));part();p(12,-11,2,6,h);p(11,-10,1,4,hd)}
  else if(st==='slick'){crown([3,5.5,6.5,7,7.5,7.5,7]);p(12,-12,2,6,h);p(11,-11,1,5,hd);
    feat();for(let i=0;i<4;i++)p(13+i*3,-14+(i&1),2,1,hd);p(14,-12,10,1,hd);part();spikes(-12,[[24,3,.3],[25,2,.5]],h)}
  else if(st==='short'||st==='part'){crown([3,5.5,6.5,7,7.5,7.5,7.5,7]);
    spikes(-13,[[13,6,-.2],[14,5,0],[15,6,.15],[16,5,.2],[17,7,.3],[18,6,.3],[19,5,.4],[20,4,.4],[21,6,.5],[22,5,.5],[23,4,.6],[24,4,.6],[25,3,.7]],h);
    p(11,-13,2,8,h);p(12,-6,1,2,h);feat();spikes(-12,[[16,4,.2],[20,3,.4],[23,3,.5]],hd);if(st==='part')p(16,-19,1,7,hd)}
  else if(FEM){if(st==='bun'){shape(-24,span(-24,[2.5,3.5,4,4,3.5,2.5],16),h,{vg:.3});feat();p(14,-23,2,1,hh);part()}
    crown([3,5.5,6.5,7.5,8,8,8,8]);
    spikes(-12,[[13,5,-.2],[14,6,0],[15,5,.1],[16,4,.2],[17,3,.3],[22,3,.5],[23,4,.5],[24,5,.6],[25,6,.5]],h);
    const e=st==='long'?14:st==='bob'?2:-5;for(let y=-12;y<=e;y++){p(11,y,2,1,h);p(25,y,2,1,shade(h,.72))}
    feat();spikes(-11,[[15,4,.1],[24,4,.5]],hd);for(let y=-9;y<e;y+=4)p(11,y,1,2,hh2);if(st==='bun'){p(25,-4,1,2,'#f2c14e')}}
  // 흔드는 팔
  if(wave){part();const x=Math.round(18+sw-1);shape(-14,Array(19).fill(0).map((_,k)=>[x+1+(k<9?1:0),x+4+(k<9?1:0)]),P,{vg:.3});if(!ROBE)p(x+2,-14,4,2,c.w||'#f4f4f4');
    part();shape(-20-b,[[x+2,x+5],[x+1,x+6],[x+1,x+6],[x+1,x+6],[x+2,x+5],[x+3,x+5]],s);feat();p(x+2,-18-b,3,1,S3);p(x+1,-17-b,1,1,S3)}
  if(c.note){part();shape(20,Array(10).fill([29,36]),'#ffffff');feat();p(29,20,8,2,'#c2321f');for(let i=0;i<3;i++)p(30,23+i*2,6,1,'#9aa3ad')}
  G.flush(r,X,Y)}
