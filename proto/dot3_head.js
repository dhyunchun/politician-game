/* ── 도트 3판 얼굴·머리 ──
   얼굴 윤곽은 예전 다각형을 그대로 쓰고, 눈·눈썹·코·입은 픽셀 단위 틀로 찍는다(크기 3단계: 2 큰 인물, 1 중간, 0 먼 행인).
   머리카락은 두피보다 2단위 높은 볼륨 + 앞머리 톱니 + 앞머리 그림자 + 결선·윤기 획. 방향 f 정면, q 3/4(오른쪽 봄), s 옆. */
const HAIR3={
  f:{cx:18,top:[[11.6,-8.6],[12.0,-11.4],[13.4,-13.6],[15.6,-14.9],[18,-15.3],[20.4,-14.9],[22.6,-13.6],[24.0,-11.4],[24.4,-8.6]],
    R:{short:[[24.1,-5.4],[23.2,-5.4],[23.1,-8.4]],long:[[24.8,-4],[25.0,2],[24.6,7.0],[23.0,6.4],[23.3,0],[23.4,-6]],bob:[[24.8,-4],[24.8,-.8],[23.6,.2],[22.8,-.6],[23.3,-4],[23.4,-6]]},
    L:{short:[[12.9,-8.4],[12.8,-5.4],[11.9,-5.4]],long:[[12.6,-6],[12.7,0],[13.0,6.4],[11.4,7.0],[11.0,2],[11.2,-4]],bob:[[12.6,-6],[12.7,-4],[13.2,-.6],[12.4,.2],[11.2,-.8],[11.2,-4]]},
    B:{short:[[22.4,-8.8],[21.6,-10.2],[20.8,-8.2],[19.8,-9.9],[18.6,-7.9],[17.4,-9.8],[16.2,-8.1],[15.2,-9.9],[14.2,-8.6],[13.2,-9.4]],
      part:[[22.8,-8.8],[21.8,-10.6],[20.6,-11.4],[19.8,-9.8],[18.4,-8.6],[17.4,-9.6],[16.2,-8.0],[14.8,-8.6],[13.6,-7.4]],
      slick:[[23.0,-9.8],[21.8,-11.2],[20.0,-11.8],[18,-11.0],[16.0,-11.8],[14.2,-11.2],[13.0,-9.8]],
      fem:[[23.0,-7.8],[22.4,-9.4],[21.2,-10.6],[20.2,-9.0],[19.4,-10.4],[17.8,-8.4],[16.6,-9.6],[15.2,-8.0],[14.0,-9.0],[13.2,-7.4]]}},
  q:{cx:16.8,top:[[12.8,-12.6],[14.8,-14.5],[17.4,-15.3],[20.2,-15.0],[22.3,-13.8],[23.6,-11.8],[24.0,-9.8]],
    back:{short:[[13.6,-3.4],[12.3,-2.8],[10.9,-6.2],[11.0,-9.8]],long:[[14.4,6.6],[13.0,7.2],[11.2,4.0],[10.9,-2],[11.2,-7],[11.7,-9.8]],bob:[[14.6,-.2],[13.4,.4],[11.6,-.8],[11.2,-4],[11.4,-7.6],[11.7,-9.8]]},
    B:{short:[[23.4,-9.0],[22.5,-10.2],[21.6,-8.3],[20.6,-9.9],[19.5,-8.2],[18.4,-9.9],[17.3,-8.5],[16.3,-9.8]],
      part:[[23.6,-9.2],[22.8,-10.8],[21.4,-11.6],[20.4,-9.8],[19.2,-8.4],[18.0,-9.6],[16.8,-8.2]],
      slick:[[23.6,-10.6],[22.2,-11.8],[20,-12.0],[17.8,-11.6],[16.4,-11.2]],
      fem:[[23.6,-8.0],[23.0,-9.6],[21.8,-10.8],[20.8,-9.0],[19.8,-10.4],[18.4,-8.4],[17.2,-9.6],[16.4,-8.6]]},
    T:{short:[[15.4,-9.6],[15.0,-7.6],[14.6,-5.4],[14.1,-7.4],[13.6,-6.4]],long:[[15.4,-9.4],[14.8,-6],[14.7,1.0]],bob:[[15.4,-9.4],[14.8,-5],[14.8,-1.2]]}},
  s:{cx:17.4,top:[[13.4,-12.8],[15.6,-14.6],[18.4,-15.2],[21,-14.6],[22.8,-12.8],[23.6,-10.6]],
    back:{short:[[14.6,-3.0],[12.9,-2.4],[11.3,-5.6],[11.4,-9.8]],long:[[16.6,6.0],[14.6,7.4],[12.4,4.0],[11.6,-2],[11.8,-7],[12.2,-9.8]],bob:[[16.6,-.4],[14.6,.4],[12.4,-1.0],[11.8,-5],[12.2,-9.8]]},
    B:{short:[[23.0,-9.6],[22.2,-10.6],[21.6,-8.8],[20.6,-10.4],[19.8,-9.0]],part:[[23.4,-9.4],[22.4,-11.2],[21.0,-10.2],[19.8,-8.8]],
      slick:[[23.4,-11.4],[21.6,-12.2],[19.8,-11.6]],fem:[[23.2,-8.6],[22.6,-10.0],[21.6,-9.2],[20.6,-10.4],[19.8,-9.0]]},
    T:{short:[[18.8,-9.6],[18.2,-7.6],[17.6,-5.8],[17.2,-7.6],[15.6,-7.8],[15.0,-5.6]],long:[[18.8,-9.6],[18.2,-7.6],[17.4,-4.4],[17.2,1.6]],bob:[[18.8,-9.6],[18.2,-7.6],[17.4,-4.4],[17.2,-1.2]]}}};
function hairPts3(d,st,FEM){const H=HAIR3[d],len=st==='long'?'long':st==='bob'?'bob':'short',bg=FEM?'fem':st==='part'?'part':st==='slick'?'slick':'short';
  const BB=H.B[bg].map((p,i,a)=>{const lo=(i===0||p[1]>a[i-1][1])&&(i===a.length-1||p[1]>a[i+1][1]);return lo&&bg!=='slick'?[p[0],p[1]+.9]:p});
  const vol=([x,y])=>y<-10?[H.cx+(x-H.cx)*1.05,y-(-10-y)*.2]:[x,y];
  return{pts:(d==='f'?H.top.concat(H.R[len],BB,H.L[len]):H.back[len].concat(H.top,BB,H.T[len])).map(vol),bangs:BB.map(vol),cx:H.cx,len}}
const BALD3={f:[[[11.9,-9.6],[13.0,-9.4],[13.1,-6.6],[12.7,-4.6],[12.0,-5.4],[11.7,-7.6]],[[24.1,-9.6],[23.0,-9.4],[22.9,-6.6],[23.3,-4.6],[24.0,-5.4],[24.3,-7.6]]],
  q:[[[12.4,-9.4],[13.6,-9.0],[14.4,-7.6],[14.6,-5.6],[13.6,-3.6],[12.6,-4.6],[12.2,-7]]],s:[[[12.5,-9.6],[13.5,-9.2],[14.6,-8.2],[15,-6],[14.6,-3.6],[13.4,-3.2],[12.6,-5]]]};
// 픽셀 틀: K 윤곽, W 흰자, H 홍채 밝은 쪽, P 동공, I 홍채, S·D 피부 그늘, B 눈썹, M 입속, T 이, R 혀, L 입술, C 볼, E 눈물, F 안경테, G 안경 아래테
const EYE3={2:{n:['KKKK','WHPW','.II.'],nF:['KKKK','KHPW','.II.'],smile:['.KK.','K..K'],down:['....','.SS.','KKKK'],shock:['KKKK','WPPW','.WW.'],angry:['KKK.','WHPK','.II.'],sad:['.KKK','KHPW','.II.','E...']},
  1:{n:['KKK','WPW'],nF:['KKK','KPW'],smile:['.K.','K.K'],down:['...','KKK'],shock:['KKK','WPW','.W.'],angry:['KK.','WPK'],sad:['.KK','KPW']},
  0:{n:['K'],nF:['K'],smile:['K'],down:['K'],shock:['K'],angry:['K'],sad:['K']}};
const BROW3={2:{n:['BBBB'],nF:['.BBB','B...'],angry:['BB..','..BB'],sad:['..BB','BB..'],shock:['BBBB']},1:{n:['BBB'],nF:['BBB'],angry:['B..','.BB'],sad:['..B','BB.'],shock:['BBB']}};
const MOUTH3={2:{n:['SLLS'],nF:['.LL.'],talk:['MMMM','MRRM'],smile:['M..M','.MM.'],grin:['MTTM','.MM.'],angry:['MMMM','MTTM'],shock:['.MM.','MMMM','.MM.'],sad:['.LL.','L..L']},
  1:{n:['LL'],nF:['LL'],talk:['MM','MM'],smile:['M..M','.MM.'],grin:['M..M','.MM.'],angry:['MMMM'],shock:['MM','MM'],sad:['.LL.','L..L']},0:{talk:['MM'],shock:['MM']}};
const flipRows=r=>r.map(x=>[...x].reverse().join(''));
function inPoly3(pts,x,y){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)ins=!ins}return ins}
function headH(G,c,d,dx,dy,st,face,talk,FEM,pf){const{part,feat,ell,poly,line,cap,K}=G;
  const X=x=>x+dx,Y=y=>y+dy,P=pts=>pts.map(([x,y])=>[X(x),Y(y)]),s=c.s||'#f1c7a0',S2=shade(s,.86),S3=shade(s,.72),h=c.h||'#2b2421',BALD=st==='bald',LONG=st==='long'||st==='bob';
  const sz=K>=1.3?2:K>=.95?1:0,gx=ux=>G.gx(X(ux)),gy=uy=>G.gy(Y(uy)),R=Math.round;
  const CL={K:'#1e1616',W:c.gl?'#e8f2f8':'#ffffff',H:FEM?'#9a6a52':'#7a5a48',P:'#140e0c',I:FEM?'#5a3628':'#3e2c22',B:shade(h,FEM?.62:.5),S:S2,D:S3,M:'#5a1c1c',T:'#ffffff',R:'#c95a5a',L:FEM?'#c4545c':shade(s,.64),C:'#f0a090',E:'#9fd4ff',F:'#33383f',G:'#9aa3ad'};
  const px=(i,j,rows)=>G.pixI(i,j,rows,CL);
  const fk=face==='grin'?'smile':face==='down2'?'down':face;
  const eyeT=(set)=>{const T=EYE3[sz];return T[fk]||(FEM?T.nF:T.n)};
  const browT=()=>{const T=BROW3[sz];if(!T)return null;return T[fk==='shock'?'shock':fk]||(FEM?T.nF:T.n)};
  const mouthT=()=>{const T=MOUTH3[sz];if(talk&&!['smile','grin','sad'].includes(face))return T.talk||null;return T[face]||T[fk]||(FEM?T.nF:T.n)||null};
  // 얼굴 윤곽(예전과 같은 다각형). 대머리는 정수리를 둥글게 이어서 한 덩어리로
  const skull=(pts,cx)=>{if(!BALD)return pts;const arc=[];for(let a=192;a<=348;a+=12){const r=a*Math.PI/180;arc.push([cx+6*Math.cos(r),-9.5+5.7*Math.sin(r)])}return arc.concat(pts.slice(2))};
  const FT=[[.14,1.04],[.84,1],[1,.86]];
  const fp=d==='f'?skull([[13,-12.6],[23,-12.6],[23.4,-6],[22.8,-3],[21,-.8],[18,.3],[15,-.8],[13.2,-3],[12.6,-6]],18)
    :d==='q'?skull([[13.4,-12.6],[22.4,-12.8],[23.1,-9],[23.3,-6.4],[23.8,-4.8],[23.6,-3.9],[23,-3.3],[22.7,-2],[21.2,-.4],[19,.3],[16,-1],[14,-3.4],[12.9,-7]],17.6)
    :skull([[14,-12.6],[21.6,-12.8],[22.6,-10],[22.8,-7.6],[23.3,-6],[23.9,-4.7],[23.6,-3.9],[23.1,-3.5],[23.2,-2.7],[22.7,-2.1],[22.6,-1.2],[21.7,-.1],[19.4,.4],[16.6,-.6],[14.2,-3],[13,-7]],17);
  if(d==='f'&&!LONG){part();ell(X(12.5),Y(-5.8),1.3,2,S2);ell(X(23.5),Y(-5.8),1.3,2,S2);feat();line(X(12.3),Y(-6.6),X(12.5),Y(-4.8),.3,S3);line(X(23.7),Y(-6.6),X(23.5),Y(-4.8),.3,S3)}
  part();const FP=P(fp);poly(FP,s,{tones:FT});
  const HP=BALD?null:hairPts3(d,st,FEM);
  // 앞머리 그림자: 머리 모양을 아래로 조금 내려 이마에 드리운다
  if(HP&&sz>0){feat();poly(P(HP.pts.map(([x,y])=>[x+.25,y+.75])),S2,{flat:1,clip:(x,y)=>inPoly3(FP,x,y)})}
  // 볼 그늘(빛은 왼쪽 위): 얼굴 오른쪽 아래
  if(sz===2){feat();if(d==='f')poly(P([[21.6,-4.4],[23.0,-5.6],[22.8,-3],[21,-.8],[19.6,-.2],[21.2,-1.8]]),S2,{flat:1,clip:(x,y)=>inPoly3(FP,x,y)});}
  // ── 이목구비(픽셀 틀) ──
  feat();
  const ej=R(gy(sz===2?-7.1:sz===1?-6.9:-6.6)),ET=eyeT(),ew=ET[0].length,BT=browT(),MT=mouthT();
  const browAt=(i,rows,ww)=>{if(!rows)return;const two=rows.length>1||fk==='shock';px(i,ej-(two?3:2),rows.map(r=>r.slice(0,ww)))};
  if(d==='f'){const ci=R(gx(18)),gap=sz===2?4:sz===1?2:2,gl=gap>>1,gr=gap-gl,iL=ci-gl-ew,iR=ci+gr;
    px(iL,ej,ET);px(iR,ej,flipRows(ET));if(BT){browAt(iL,BT,ew);browAt(iR,flipRows(BT),ew)}
    if(sz===2&&(FEM||fk==='smile')){px(iL,ej+3+(fk==='sad'?1:0),['CC']);px(iR+ew-2,ej+3+(fk==='sad'?1:0),['CC'])}
    if(sz>0){const nj=R(gy(-4.7));px(ci,nj,sz===2?['S','D']:['D'])}
    if(MT){const mj=R(gy(sz===2?-2.3:-2.1)),mw=MT[0].length;px(ci-(mw>>1),mj,MT)}
    if(c.gl&&sz>0)glasses3(px,d,[[iL,ew],[iR,ew]],ej,sz)}
  else if(d==='q'){const iN=R(gx(sz===2?15.6:15.8)),gapQ=sz===2?4:2,iF=iN+ew+gapQ,FT2=ET.map(r=>r.slice(0,Math.max(1,ew-1))),fw=FT2[0].length;
    px(iN,ej,ET);px(iF,ej,FT2);if(BT){browAt(iN,BT,ew);browAt(iF,BT,fw)}
    if(sz===2&&(FEM||fk==='smile'))px(iN,ej+3,['CC']);
    if(sz>0)px(R(gx(22.6)),R(gy(-4.6)),sz===2?['S','D']:['D']);
    if(MT){const mj=R(gy(sz===2?-2.3:-2.1)),mw=MT[0].length,mT=sz===2&&mw===4?MT.map(r=>r.slice(1)):MT;px(R(gx(20.4))-(mT[0].length>>1),mj,mT)}
    if(c.gl&&sz>0)glasses3(px,d,[[iN,ew],[iF,fw]],ej,sz,R(gx(14.4)))}
  else{const iE=R(gx(sz===2?20.6:21)),PT=ET.map(r=>r.slice(Math.max(0,ew-3))).map(r=>r.slice(0,sz===2?3:Math.max(1,ew-1)));
    px(iE,ej,PT);if(BT)browAt(iE,BT.map(r=>r.slice(-3)),PT[0].length);
    if(MT){const mj=R(gy(sz===2?-2.3:-2.1)),mT=MT.map(r=>r.slice(0,sz===2?2:1));px(R(gx(21.8)),mj,mT)}
    if(c.gl&&sz>0)glasses3(px,d,[[iE,PT[0].length]],ej,sz,R(gx(16.8)))}
  // ── 머리카락 ──
  part();
  if(BALD){const hg=shade(h,.92);BALD3[d].forEach(pp=>poly(P(pp),hg,{tones:[[.3,1.1],[1,.86]]}));
    feat();const tx=d==='f'?15.2:d==='q'?15:15.6;cap(X(tx),Y(-13.4),X(tx+2.2),Y(-14.4),.5,.45,shade(s,1.16),{flat:1})}
  else{poly(P(HP.pts),h,{tones:[[.22,1.14],[.66,1],[1,.74]]});
    feat();const hd=shade(h,.64),HI=shade(h,1.62),cx=HP.cx,B=HP.bangs;
    if(sz>0){
      if(st==='slick')for(let i=0;i<3;i++)line(X(cx+2.4-i*2.4),Y(-11.4),X(cx+.6-i*2.6),Y(-14.2),.32,hd);
      else for(let i=1;i<B.length-1;i++)if(B[i][1]<B[i-1][1]&&B[i][1]<B[i+1][1]){const[vx,vy]=B[i];line(X(vx),Y(vy+.2),X(vx+(cx-vx)*.25),Y(vy-2.6),.3,hd)}
      if(HP.len!=='short'&&sz===2){const sx=d==='f'?[11.9,24.1]:[d==='q'?12.0:12.6];sx.forEach(x0=>line(X(x0+(x0<18?.7:-.7)),Y(-6),X(x0+(x0<18?.9:-.9)),Y(HP.len==='long'?5.4:-1.4),.3,hd))}
      [[206,220],[228,246],[252,262]].forEach(([a,b],k)=>{const A=a*Math.PI/180,Bq=b*Math.PI/180,rx=5.2,ry=3.6,cy=-11.4;
        cap(X(cx+Math.cos(A)*rx),Y(cy+Math.sin(A)*ry),X(cx+Math.cos(Bq)*rx),Y(cy+Math.sin(Bq)*ry),k===1?.42:.34,k===1?.4:.3,k===1?HI:shade(h,1.34),{flat:1})})}
    if(st==='bun'){const bx=d==='f'?14:d==='q'?13.8:13.4;ell(X(bx),Y(-12.4),.6,.6,'#f2c14e')}}
  // 3/4·옆 귀는 머리 위에(긴 머리는 귀를 덮는다)
  if(d!=='f'&&!LONG){const ex=d==='q'?14:16.4;part();ell(X(ex),Y(-5.4),1,1.6,s,{tones:[[.5,1],[1,.86]]});feat();line(X(ex+.1),Y(-6.2),X(ex+.2),Y(-4.6),.3,S3)}}
// 안경: 렌즈마다 테를 두르고 다리를 귀 쪽으로
function glasses3(px,d,lens,ej,sz,earI){const top=ej-1,bot=ej+(sz===2?3:2);
  lens.forEach(([i,w])=>{px(i-1,top,['F'.repeat(w+2)]);px(i-1,bot,['G'.repeat(w+2)]);for(let j=top+1;j<bot;j++){px(i-1,j,['F']);px(i+w,j,['F'])}});
  if(lens.length===2){const a=lens[0][0]+lens[0][1]+1,b=lens[1][0]-1;if(b>a)px(a,top+1,['F'.repeat(b-a)])}
  if(d==='f'){const[iL]=lens[0],[iR,wR]=lens[1];px(iL-3,top+1,['FF']);px(iR+wR+1,top+1,['FF'])}
  else if(earI!=null){const i0=lens[0][0]-1;if(i0-earI>0)px(earI,top+1,['F'.repeat(i0-earI)])}}
function backHairH(G,c,d,dx,dy,st,h){const{ell,poly}=G,cx=18+dx+(d==='q'?-1:d==='s'?-2.4:0),y=dy,hb=shade(h,.72);
  if(st==='long'){if(d==='f')poly([[cx-6.6,-11+y],[cx+6.6,-11+y],[cx+7.2,2+y],[cx+6.8,11+y],[cx+2,12.6+y],[cx-2,12.6+y],[cx-6.8,11+y],[cx-7.2,2+y]],hb);
    else poly([[cx-5.4,-11+y],[cx+4.6,-11+y],[cx+4.4,4+y],[cx+2.6,10.6+y],[cx-2.4,12+y],[cx-6.4,9+y],[cx-7,2+y]],hb)}
  if(st==='bob'){if(d==='f')poly([[cx-6.6,-11+y],[cx+6.6,-11+y],[cx+7,-1+y],[cx+6.2,1.2+y],[cx-6.2,1.2+y],[cx-7,-1+y]],hb);
    else poly([[cx-5.4,-11+y],[cx+4.6,-11+y],[cx+4.4,-1+y],[cx+2.4,1+y],[cx-4.4,1+y],[cx-6.6,-1+y]],hb)}
  if(st==='bun'){const bx=d==='f'?18+dx:d==='q'?14.4+dx:13+dx;ell(bx,(d==='f'?-18:-15.6)+y,3.6,3.2,h,{tones:[[.3,1.12],[1,.82]]})}}
