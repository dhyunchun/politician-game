// 크루세이더퀘스트 방향 SD 캐릭터 시안: 2.3등신, 큰 눈, 색 외곽선(셀아웃), 3단 음영, 겹침 그림자
function personCQ(r,X,Y,c,wave){
  const OX=10,OY=16,GW=60,GH=96,col=new Array(GW*GH).fill(null),lay=new Int16Array(GW*GH),nol=new Uint8Array(GW*GH);let L=0,NL=0;
  const set=(x,y,cl)=>{x=Math.round(x);y=Math.round(y);const i=(y+OY)*GW+x+OX;if(x+OX<0||x+OX>=GW||y+OY<0||y+OY>=GH||!cl)return;col[i]=cl;lay[i]=L;nol[i]=NL};
  const p=(x,y,w,h,cl)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,cl)};
  const part=()=>{L++;NL=0};const feat=()=>{L++;NL=1};
  // 행별 [a,b] 구간을 채우고 왼쪽 위 빛·오른쪽 아래 그림자
  const shape=(y0,rows,base,o={})=>{const hi=shade(base,o.hi||1.2),md=base,lo=shade(base,o.lo||.78),lo2=shade(base,(o.lo||.78)-.12);
    rows.forEach(([a,b],k)=>{const y=y0+k;for(let x=a;x<=b;x++){let cl=md;const fr=(x-a)/Math.max(1,b-a);
      if(fr>.78)cl=lo;if(fr>.92&&b-a>4)cl=lo2;if(fr<.16&&b-a>3)cl=hi;if(k===rows.length-1&&o.botDark)cl=lo;set(x,y,cl)}})};
  const span=(y0,hws,cx=18)=>hws.map(h=>[Math.round(cx-h),Math.round(cx+h)]);
  const s=c.s||'#f1c7a0',S2=shade(s,.86),S3=shade(s,.74),P=c.P||'#4a6fa5',L0=c.L||'#2a2d34',h=c.h||'#2b2421',H=shade(h,1.55),H2=shade(h,1.3),hd=shade(h,.7);
  const st=c.st||'short',FEM=st==='long'||st==='bob'||st==='bun',ROBE=!!c.robe,b=PF?1:0;
  // ── 뒷머리 ──
  part();
  if(st==='long')shape(2,span(2,[13,14,14.5,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14.5,14.5,14,14,14,13.5,13.5,13,13,12.5,12.5,12,12,11.5,11,11,10.5,10,10,9.5,9,8,7,6]),hd,{hi:1.25,lo:.8});
  if(st==='bob')shape(2,span(2,[13,14,14.5,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14.5,14,13,12,11]),hd,{hi:1.25,lo:.8});
  // ── 하체 ──
  part();
  if(ROBE){shape(30,span(30,[11,11,11.5,11.5,12,12,12,12,12.5,12.5,12.5,12.5,13,13,13,13,13,13.5,13.5,13.5,13.5,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]),'#26262e',{hi:1.5,lo:.7});
    for(let i=0;i<3;i++)p(12+i*6,46,1,20,'#1c1c22')}
  else if(c.sk){shape(49,span(49,[10,10.5,11,11.5,12,12.5,13,13.5,14]),L0,{hi:1.3,lo:.72,botDark:1});for(let i=0;i<4;i++)p(10+i*5,51,1,7,shade(L0,.8));
    part();shape(58,[[11,15],[11,15],[11,15],[11,15],[11,15],[12,15]],s,{lo:.86});shape(58,[[21,25],[21,25],[21,25],[21,25],[21,25],[21,24]],s,{lo:.86})}
  else{shape(49,[[8,17],[8,17],[8,17],[8,17],[9,17],[9,17],[9,17],[9,17],[9,17],[9,17],[9,17],[9,17],[9,17],[9,17]],L0,{hi:1.35,lo:.72});
    shape(49,[[19,28],[19,28],[19,28],[19,28],[19,27],[19,27],[19,27],[19,27],[19,27],[19,27],[19,27],[19,27],[19,27],[19,27]],L0,{hi:1.35,lo:.72});p(18,49,1,4,L0);p(18,53,1,1,shade(L0,.6))}
  if(!ROBE){part();const sh='#3a2a24';shape(63,[[8,16],[7,17],[7,17],[7,17],[7,17]],sh,{hi:1.6,lo:.6,botDark:1});shape(63,[[19,28],[19,29],[19,29],[19,29],[19,29]],sh,{hi:1.6,lo:.6,botDark:1});
    p(9,64,3,1,shade(sh,2.2));p(21,64,3,1,shade(sh,2.2))}
  // ── 팔(뒤) ──
  const AC=ROBE?'#26262e':P;
  const arm=(x,flipLight)=>{part();shape(32,[[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x,x+4],[x+0,x+4],[x,x+4]],AC,{hi:1.25,lo:.72});
    p(x,45,5,2,c.w||'#f4f4f4');part();shape(47,[[x,x+4],[x,x+4],[x,x+4],[x+1,x+3]],s,{lo:.85})};
  const AL=FEM?4:3,AR=FEM?28:29;
  arm(AL);if(!wave)arm(AR);
  // ── 몸통 ──
  part();
  if(!ROBE){const hw=FEM?[6,8.5,9.5,10,10,10,10,9.5,9.5,9,9,9,9,9,9,9.5,9.5,10,10,10,10]:[6,9,10.5,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11];shape(29,span(29,hw),P,{hi:1.25,lo:.74})}
  else{shape(29,span(29,[6,9,10.5,11,11,11,11,11,11,11]),'#26262e',{hi:1.5,lo:.7})}
  // 셔츠·넥타이·옷깃
  feat();
  if(c.hood){p(11,29,14,3,shade(P,.72));p(12,30,12,1,shade(P,.58));p(15,32,1,7,'#f4f4f4');p(21,32,1,7,'#f4f4f4');p(11,41,14,6,shade(P,.82));p(11,41,14,1,shade(P,.66))}
  else if(ROBE){for(let k=0;k<5;k++)p(14+k*0,29+k,8-0,1,'#f4f4f4');p(15,34,6,2,'#f4f4f4');p(16,36,4,1,'#dcdcdc')}
  else if(c.w){for(let k=0;k<11;k++){const w=Math.max(0,4-Math.floor(k/2.6));p(18-w,29+k,2*w+1,1,c.w);if(w>0){p(18-w-1,29+k,1,1,shade(P,.6));p(18+w+1,29+k,1,1,shade(P,.6))}}
    p(13,29,3,1,shade(P,1.3));p(21,29,3,1,shade(P,.6));
    if(c.t){p(17,30,3,2,shade(c.t,.8));p(17,32,3,7,c.t);p(17,32,1,6,shade(c.t,1.35));p(19,32,1,7,shade(c.t,.72));p(18,39,1,2,shade(c.t,.72));p(18,34,1,1,shade(c.t,.85));p(18,37,1,1,shade(c.t,.85))}
    for(let i=0;i<2;i++)p(18,43+i*3,1,1,shade(P,.5))}
  if(!ROBE)p(8,47,21,1,shade(P,.62));
  if(c.pin){p(10,33,3,3,shade('#f2c14e',.6));p(11,34,1,1,'#ffe48a')}
  if(c.steth){p(13,30,1,12,'#3a3a44');p(23,30,1,12,'#3a3a44');p(13,42,11,1,'#3a3a44');p(16,43,4,3,'#9aa3ad');p(17,43,2,1,'#e8eef2')}
  // ── 목 ──
  part();p(15,26,7,4,S3);
  // ── 귀 ──
  part();if(!(st==='long'||st==='bob')){shape(13,[[4,6],[4,6],[4,6],[5,6],[5,6]],s,{lo:.86});shape(13,[[30,32],[30,32],[30,32],[30,31],[30,31]],S2,{lo:.86})}
  // ── 얼굴 (크게, 아래로 갸름) ──
  part();
  const FH=[7,9,10.5,11.5,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11.5,11,10.5,9.5,8,6];
  FH.forEach((hw,k)=>{const y=2+k,a=Math.round(18-hw),bb=Math.round(18+hw);for(let x=a;x<=bb;x++){let cl=s;if(x>=bb-2)cl=S2;if(x===bb&&k>3&&k<20)cl=S3;if(k>=21)cl=x>bb-4?S3:S2;if(x<=a+1&&k>2&&k<16)cl=shade(s,1.06);set(x,y,cl)}});
  // ── 이목구비 ──
  feat();const iris=c.eye||'#3b2a26',ir2=shade(iris,1.9),lash=shade(h,.55);
  const eye=(x0,out)=>{p(x0,13,4,1,lash);p(x0+(out<0?-1:4),13+(FEM?0:1),1,1,lash);if(FEM)p(x0+(out<0?-1:4),12,1,1,lash);
    p(x0,14,4,5,iris);p(x0,14,4,1,shade(iris,.6));p(x0+1,17,2,2,ir2);p(x0,19,4,1,shade(s,.82));
    p(x0+(out<0?0:1),15,2,2,'#ffffff');p(x0+(out<0?3:0),17,1,1,'#fff3e8')};
  if(c.gl){eye(11,-1);eye(22,1)}else{eye(11,-1);eye(22,1)}
  // 눈썹
  if(FEM){p(11,10,4,1,hd);p(22,10,4,1,hd)}else{p(10,10,5,1,hd);p(10,11,1,1,hd);p(22,10,5,1,hd);p(26,11,1,1,hd)}
  // 볼·코·입
  const bl=FEM?'#f4a093':'#eea08c';p(8,19,3,2,shade(bl,1.08));p(26,19,3,2,shade(bl,1.08));p(9,19,1,1,'#ffd9cf');p(27,19,1,1,'#ffd9cf');
  p(18,19,1,1,S3);
  const lp=FEM?'#c95a62':'#a8524a';
  if(c.talk&&PF){p(16,22,4,2,'#5a2026');p(17,23,2,1,'#e2737c');p(16,22,4,1,lp)}
  else{p(16,22,4,1,lp);if(FEM)p(17,23,2,1,shade(lp,1.25));else p(15,21,1,1,lp)}
  if(c.gl){const F='#5a4636';p(10,12,6,1,F);p(10,12,1,8,F);p(15,12,1,8,F);p(10,19,6,1,F);p(21,12,6,1,F);p(21,12,1,8,F);p(26,12,1,8,F);p(21,19,6,1,F);p(16,14,5,1,F);p(7,13,3,1,F);p(27,13,3,1,F);
    p(11,13,1,1,'#ffffff');p(22,13,1,1,'#ffffff')}
  // ── 앞머리 ──
  part();
  const crown=(hws,y0=-4)=>{hws=[4.5,8.5].concat(hws.slice(1));shape(y0-1,span(y0-1,hws),h,{hi:1.18,lo:.74});L++;NL=1;[[11,0,5],[15,-2,6],[23,-1,6],[27,1,5]].forEach(([x,y,n])=>{for(let k=0;k<n;k++)set(x+(x<18?-Math.floor(k/3):Math.floor(k/3)),y+k,hd)});L--;NL=0};
  const shine=()=>{L++;NL=1;p(9,0,2,1,H);p(10,-1,4,1,H);p(13,-2,6,1,H);p(19,-2,3,1,H2);p(22,-1,2,1,H2);p(14,-2,1,1,'#ffffff');p(11,-1,1,1,'#ffffff');L--;NL=0};
  if(st==='bald'){feat();p(13,1,6,1,shade(s,1.25));p(12,2,3,1,shade(s,1.15));part();shape(7,[[4,7],[4,7],[4,7],[4,7],[5,7],[5,7],[5,7],[5,7]],h,{lo:.8});shape(7,[[29,32],[29,32],[29,32],[29,32],[29,31],[29,31],[29,31],[29,31]],hd,{lo:.8})}
  else if(st==='slick'){crown([7,10,12,13,13.5,14,14,14,14,13.5]);p(5,6,3,7,h);p(29,6,3,7,hd);p(5,13,2,1,hd);p(30,13,2,1,hd);
    feat();for(let i=0;i<4;i++)p(9+i*5,1+(i%2),4,1,hd);p(9,3,18,1,H2);p(11,-2,10,1,H);p(10,-1,3,1,H)}
  else if(st==='short'||st==='part'){crown([7,10,12,13,13.5,14,14,14,14,14,14,13.5]);
    // 삐침 있는 앞머리
    const len=st==='part'?[3,4,5,5,4,4,5,4,3,4,3,2,1,0,0,1,2,3,3,2,3,2,2,1,1]:[3,4,4,3,4,5,4,3,4,5,4,3,4,5,4,3,4,4,3,4,3,3,2,2,1];
    for(let x=6;x<=30;x++){const n=len[x-6];if(n>0)p(x,8,1,n,(x>25)?hd:h)}
    p(5,7,3,9,h);p(29,7,3,8,hd);p(5,16,2,1,h);p(30,15,1,1,hd);
    if(st==='part'){feat();p(20,-3,1,10,hd)}
    shine()}
  else if(FEM){
    if(st==='bun'){part();shape(-12,span(-12,[3,5,6,6.5,6.5,6,5,3]),h,{hi:1.25,lo:.75});feat();p(15,-11,3,1,H);p(14,-10,2,1,H);part()}
    crown([7,10,12,13.5,14,14.5,14.5,14.5,14.5,14.5,14.5]);
    // 옆으로 넘긴 앞머리 + 얼굴 감싸는 옆머리
    for(let x=6;x<=30;x++){const n=x<20?Math.max(0,Math.round(7-(x-6)*.42)):x<23?1:Math.round((x-22)*.9);if(n>0)p(x,7,1,n,x>24?hd:h)}
    const e=st==='long'?27:st==='bob'?24:15;
    for(let y=7;y<=e;y++){const w=y<e-2?3:2;p(4,y,w,1,h);p(33-w,y,w,1,hd);if(y%3===0&&y<e-1)p(5,y,1,1,H2)}
    if(st==='bun'){feat();p(5,16,1,2,'#f2c14e');p(31,16,1,2,'#f2c14e')}
    shine()}
  // ── 흔드는 팔 ──
  if(wave){part();const x=AR+1;shape(13,Array(19).fill([x,x+4]),P,{hi:1.25,lo:.72});p(x,13,5,2,c.w||'#f4f4f4');part();shape(7-b,[[x,x+4],[x-1,x+5],[x-1,x+5],[x,x+5],[x,x+4],[x+1,x+3]],s,{lo:.85});feat();p(x+5,7-b,1,2,S2)}
  if(c.note){part();shape(40,Array(11).fill([33,40]),'#ffffff',{lo:.9});feat();p(33,40,8,2,'#c2321f');for(let i=0;i<3;i++)p(34,44+i*2,6,1,'#9aa3ad')}
  // ── 외곽선: 바깥은 이웃색의 진한 톤, 안쪽은 앞 레이어와 맞닿은 뒤 레이어 가장자리를 어둡게 ──
  const out=col.slice(),N=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;
    if(!col[i]){let nb=null;for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]){nb=col[j];break}}if(nb)out[i]=shade(nb,.32)}
    else if(!nol[i]){for(const[dx,dy]of N){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=GW||yy>=GH)continue;const j=yy*GW+xx;if(col[j]&&!nol[j]&&lay[j]>lay[i]&&dy<=0+(dy===-1?0:1)){out[i]=shade(col[i],.58);break}}}}
  // 가로 런 병합해서 그리기
  for(let y=0;y<GH;y++){let x=0;while(x<GW){const cl=out[y*GW+x];if(!cl){x++;continue}let n=1;while(x+n<GW&&out[y*GW+x+n]===cl)n++;r(X+x-OX,Y+y-OY,n,1,cl);x+=n}}
}
