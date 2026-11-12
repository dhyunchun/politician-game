/* ── 거리 배경 3판: 인물 크기에 맞춘 전체 그림 ──
   건물 발치 y=180(그 깊이에서 사람 키 약 47px, 1m≈28px). 문 높이 2.1m≈60px, 1층 천장 y=93, 2층 지붕 y=12.
   지평선은 y=118이라 먼 건물은 1층 가게 지붕 위와 골목 사이로만 보인다. */
function streetV3(c,H){const{P,dith,bands,blk,blob,cloud}=H,B=180,FL=93;
  // 가짜 한글 간판 글자(9×10)
  const GL=[[[0,0,5,1],[0,0,1,5],[4,0,1,5],[0,4,5,1],[7,0,1,10],[7,4,2,1],[1,7,5,1],[1,7,1,3],[1,9,5,1]],
    [[4,0,1,3],[2,3,2,1],[5,3,2,1],[1,4,1,1],[7,4,1,1],[4,6,1,2],[0,8,9,1]],
    [[0,0,6,1],[5,0,1,6],[8,0,1,10],[0,8,6,1],[0,8,1,2]],
    [[0,0,1,5],[4,0,1,5],[0,2,5,1],[0,4,5,1],[7,0,1,6],[7,2,2,1],[2,7,4,1],[1,8,1,1],[6,8,1,1],[2,9,4,1]],
    [[2,0,2,1],[0,2,6,1],[3,3,1,1],[2,4,1,1],[4,4,1,1],[1,5,1,1],[5,5,1,1],[8,0,1,10]]];
  const glyph=(x,y,k,col)=>GL[k%5].forEach(([a,b,w,h])=>P(x+a,y+b,w,h,col));
  // 유리: 알루미늄 틀 + 3단 유리 + 사선 반사
  const glass=(x,y,w,h,lit,show)=>{P(x-2,y-2,w+4,h+4,'#22242c');P(x-1,y-1,w+2,h+2,'#dfe5ea');
    const g=lit?['#fff1b8','#ffd86a','#e8b44a']:['#b9dcf0','#8fbbdb','#5d86a8'],h1=Math.round(h*.3),h2=Math.round(h*.68);
    P(x,y,w,h1,g[0]);P(x,y+h1,w,h2-h1,g[1]);P(x,y+h2,w,h-h2,g[2]);dith(x,y+h1-1,w,2,g[1]);dith(x,y+h2-1,w,2,g[2]);
    if(show)show(x,y,w,h);
    for(let i=0;i<Math.min(h-6,26);i++){P(x+8+i,y+h-4-i,2,1,'#e6f4fb');if(w>40)P(x+20+i,y+h-4-i,1,1,'#d4ebf8')}
    P(x,y,w,1,'#f4fafd');P(x,y+h-1,w,1,'#3f5f7c')};
  const door=(x,w,col)=>{const y=B-61,h=61;P(x-2,y-2,w+4,h+2,'#1d1a1e');P(x,y,w,h,col);P(x,y,w,1,shade(col,1.35));P(x,y,1,h,shade(col,1.15));P(x+w-2,y,2,h,shade(col,.7));
    P(x+4,y+5,w-8,30,'#22242c');P(x+5,y+6,w-10,28,'#8fbbdb');P(x+5,y+6,w-10,9,'#b9dcf0');for(let i=0;i<12;i++)P(x+7+i,y+30-i,1,1,'#e6f4fb');
    P(x+4,y+41,w-8,15,shade(col,.78));P(x+4,y+41,w-8,1,shade(col,.55));P(x+5,y+55,w-10,1,shade(col,1.2));
    P(x+w-7,y+31,2,8,'#e2b04a');P(x+w-7,y+31,1,8,'#fff1b8');P(x-3,B-2,w+6,2,'#8f8371')};
  // 가게 건물: o={fl 층수, wall, brick, sign, ink, g0, gn, aw, door 'L'|'R', dcol, lit, ac, show}
  const shop=(x,w,o)=>{const two=o.fl===2,top=two?12:FL-8,wall=o.wall,dk=shade(wall,.6),lt=shade(wall,1.14);
    P(x,top,w,B-top,wall);
    if(o.brick){for(let y=top+3;y<B;y+=4){P(x,y,w,1,shade(wall,.84));for(let k=x+(((y-top-3)/4)%2?2:6);k<x+w;k+=8)P(k,y-3,1,3,shade(wall,.84))}}
    else for(let y=top+7;y<B;y+=11)dith(x,y,w,1,shade(wall,.92));
    P(x,top,2,B-top,lt);P(x+w-3,top,3,B-top,dk);P(x+w-1,top,1,B-top,'#1d1a1e');
    P(x-2,top-5,w+4,6,shade(wall,.72));P(x-2,top-5,w+4,1,shade(wall,1.22));P(x-2,top+1,w+4,1,shade(wall,.42));
    if(two){const n=Math.max(1,Math.floor((w-24)/50)),gap=(w-n*32)/(n+1);
      for(let i=0;i<n;i++){const wx=Math.round(x+gap+i*(32+gap));glass(wx,30,32,38,i===o.lit);P(wx+15,30,2,38,'#22242c');P(wx,48,32,1,'#22242c');
        P(wx-4,70,40,3,lt);P(wx-4,73,40,1,dk);
        if(i===o.ac){blk(wx+5,56,22,13,'#d8dde2','#3a3f48');for(let k=0;k<4;k++)P(wx+8+k*4,58,2,9,'#9aa3ad')}}
      P(x,FL-2,w,3,dk);P(x,FL-2,w,1,shade(wall,.82))}
    const sy=two?FL-13:FL-3,sh=19;
    P(x+5,sy-1,w-10,sh+2,'#141418');P(x+6,sy,w-12,sh,o.sign);P(x+6,sy,w-12,1,shade(o.sign,1.35));P(x+6,sy+1,1,sh-1,shade(o.sign,1.15));P(x+6,sy+sh-2,w-12,2,shade(o.sign,.7));
    const gn=o.gn||4,gw=14,gx0=x+(w-gn*gw)/2;for(let i=0;i<gn;i++)glyph(Math.round(gx0+i*gw+2),sy+4,o.g0+i,o.ink||'#ffffff');
    const ay=sy+sh+1;
    if(o.aw){for(let k=0;k<w-8;k+=8){const cl=(k/8)%2?'#f4f1ea':o.aw;P(x+4+k,ay,8,9,cl);P(x+4+k,ay+7,8,2,shade(cl,.82));P(x+5+k,ay+9,6,2,cl);P(x+6+k,ay+11,4,1,cl)}
      P(x+4,ay,w-8,1,shade(o.aw,1.4));dith(x+6,ay+12,w-12,3,'#1d1a1e')}
    const dw=28,dx=o.door==='L'?x+9:x+w-9-dw,wx=o.door==='L'?x+9+dw+8:x+9,ww=w-18-dw-8,wy=ay+16,wh=165-wy;
    P(x+3,165,w-6,B-165,shade(wall,.68));for(let k=x+3;k<x+w-3;k+=10)P(k,166,1,B-166,shade(wall,.52));P(x+3,165,w-6,1,shade(wall,.5));
    glass(wx,wy,ww,wh,false,o.show);P(wx+Math.round(ww/2)-1,wy,2,wh,'#22242c');
    door(dx,dw,o.dcol||'#6b4a30')};
  // ── 하늘·먼 건물 ──
  bands(0,120,['#3d7fd1','#4f93dc','#66a7e6','#82bcee','#a3d0f4','#c6e3f8']);cloud(268,30,1,PF*2);cloud(214,60,.6,PF*2);
  [[150,58,24],[178,34,30],[212,66,26],[240,44,30],[274,72,22],[298,30,28],[328,60,16]].forEach(([x,y,w],i)=>{const cl=i%2?'#9fb8cf':'#b3c8da';P(x,y,w,122-y,cl);P(x,y,1,122-y,shade(cl,1.1));P(x+w-2,y,2,122-y,shade(cl,.88));
    for(let yy=y+5;yy<116;yy+=8)for(let k=x+4;k<x+w-4;k+=6)P(k,yy,3,4,shade(cl,1.13))});
  // 골목(건물 사이): 안쪽 벽과 그늘
  P(150,74,28,106,'#8793a3');for(let y=82;y<170;y+=14)for(let k=154;k<174;k+=9)P(k,y,5,7,'#a9b6c6');dith(150,74,6,106,'#5a6472');dith(172,74,6,106,'#5a6472');P(150,168,28,12,'#b7ab95');
  // ── 건물 3채 ──
  const showCafe=(x,y,w,h)=>{P(x,y+h-22,w,22,'#3f5a70');for(let k=x+6;k<x+w-12;k+=22){P(k,y+h-20,14,3,'#e9dcc0');P(k+5,y+h-17,4,13,'#8a6a3a');P(k+1,y+h-26,5,6,'#f4f1ea');P(k+8,y+h-25,5,5,'#e0a93f')}
    P(x+8,y+6,26,14,'#f4f1ea');P(x+11,y+9,20,2,'#c2321f');P(x+11,y+14,13,2,'#6a727c')};
  const showCloth=(x,y,w,h)=>{P(x,y+h-12,w,12,'#3f5a70');const cs=['#e0384c','#f2c14e','#2f6be0','#3a9e6a'];
    for(let i=0,k=x+10;k<x+w-14;k+=24,i++){P(k+3,y+10,4,4,'#f1c7a0');P(k,y+14,10,16,cs[i%4]);P(k,y+14,10,1,shade(cs[i%4],1.3));P(k+1,y+30,3,h-42,'#3b3f48');P(k+6,y+30,3,h-42,'#3b3f48')}};
  shop(-10,160,{fl:2,wall:'#c8664c',brick:1,sign:'#c2321f',g0:0,gn:5,aw:'#2f6be0',door:'R',lit:1,ac:0,show:showCloth});
  // 세로 돌출 간판
  P(137,26,12,56,'#141418');P(138,27,10,54,'#f2c14e');P(138,27,10,1,'#fff1b8');glyph(139,31,2,'#141418');glyph(139,45,4,'#141418');glyph(139,59,1,'#141418');
  // 편의점(1층)
  {const x=178,w=154,top=FL-8;P(x,top,w,B-top,'#e9ecef');P(x,top,2,B-top,'#ffffff');P(x+w-3,top,3,B-top,'#aab2ba');P(x+w-1,top,1,B-top,'#1d1a1e');
    P(x-2,top-5,w+4,6,'#8d96a0');P(x-2,top-5,w+4,1,'#c6ccd2');P(x-2,top+1,w+4,1,'#4a5058');
    blk(x+16,top-22,28,17,'#cfd6dc','#3a3f48');for(let k=0;k<5;k++)P(x+19+k*5,top-19,2,11,'#8a929c');
    blk(x+w-52,top-30,24,25,'#4a8fd0','#1d2a3a');P(x+w-52,top-22,24,2,'#2f6aa8');P(x+w-52,top-12,24,2,'#2f6aa8');P(x+w-46,top-5,3,5,'#3a3f48');P(x+w-37,top-5,3,5,'#3a3f48');
    P(x+3,top+5,w-6,21,'#141418');P(x+4,top+6,w-8,19,'#2f9e5f');P(x+4,top+6,w-8,1,'#7fd9a6');P(x+4,top+19,w-8,3,'#f4f1ea');P(x+4,top+22,w-8,3,'#e8a33a');
    for(let i=0;i<3;i++)glyph(x+14+i*14,top+8,i+2,'#ffffff');
    // 24
    {const nx=x+w-34,ny=top+8;[[0,0,6,2],[4,0,2,6],[0,4,6,2],[0,4,2,6],[0,8,6,2],[9,0,2,6],[13,0,2,10],[9,4,6,2]].forEach(([a,b,ww,hh])=>P(nx+a,ny+b,ww,hh,'#ffffff'))}
    const gy=top+29,gh=B-gy-4;P(x+3,gy-2,w-6,gh+4,'#22242c');P(x+5,gy,w-10,gh,'#f6f1dc');
    // 진열대
    const cs=['#e0384c','#f2c14e','#2f6be0','#3a9e6a','#f58a24','#7a3fb0','#f4f1ea'];
    for(let r=0;r<3;r++){const ry=gy+6+r*17;P(x+5,ry+11,w-10,2,'#b8ad92');P(x+5,ry+13,w-10,1,'#8f8371');for(let k=x+8,i=r*3;k<x+w-12;k+=7,i++)P(k,ry+(i%3?2:0),5,11-(i%3?2:0),cs[(i*5+r)%7])}
    // 자동문(가운데)과 유리 틀
    const dx=x+Math.round(w/2)-21;P(dx,gy,42,gh,'#eaf4f8');P(dx,gy,42,10,'#cfe6f2');
    for(const mx of[x+5+44,dx-2,dx+20,dx+42,x+w-5-46])P(mx,gy,2,gh,'#22242c');
    P(dx+16,gy+26,2,10,'#8a929c');P(dx+24,gy+26,2,10,'#8a929c');P(dx+4,gy+12,12,7,'#2f9e5f');P(dx+26,gy+12,12,7,'#2f9e5f');
    dith(x+5,gy,44,gh,'#bfe0f0');dith(x+w-51,gy,46,gh,'#bfe0f0');
    for(let i=0;i<24;i++){P(x+12+i,gy+gh-6-i,2,1,'#f4fafd');P(x+w-44+i,gy+gh-6-i,2,1,'#f4fafd')}
    P(x+10,gy+6,17,24,'#e0384c');P(x+12,gy+9,13,2,'#ffffff');P(x+12,gy+14,9,2,'#ffffff');P(x+12,gy+22,13,5,'#f2c14e');
    P(x+3,B-4,w-6,4,'#8d96a0');P(dx+2,B-3,38,3,'#3a6a4a')}
  shop(336,186,{fl:2,wall:'#e3d6b8',sign:'#e8a33a',ink:'#3a2a14',g0:3,gn:4,aw:'#3a9e6a',door:'L',dcol:'#3f5a4a',lit:2,ac:1,show:showCafe});
  P(332,12,4,168,'#1d1a1e');
  // ── 뒤쪽 인도 ──
  P(0,B,512,19,'#cdbfa7');for(let y=B,row=0;y<B+18;y+=6,row++){P(0,y,512,1,'#b3a58c');for(let k=(row%2)*11;k<512;k+=22)P(k,y,1,6,'#b3a58c')}
  P(0,B,512,1,'#7d7262');dith(0,B+1,512,2,'#a59880');
  P(0,B+18,512,3,'#ece6da');P(0,B+21,512,2,'#9b927f');P(0,B+23,512,1,'#4a453c');
  // 입간판·버스 표지·가로등·가로수
  blk(392,166,14,20,'#f4f1ea','#3a2a14');P(394,169,10,2,'#c2321f');P(394,174,7,1,'#6a727c');P(394,178,9,1,'#6a727c');
  P(40,118,2,74,'#8a929c');P(40,118,1,74,'#c6ccd2');blk(31,104,20,16,'#2f6be0','#141c3a');P(34,108,14,2,'#ffffff');P(34,113,9,2,'#ffffff');
  P(352,30,3,162,'#3a4a46');P(352,30,1,162,'#6a7c76');P(352,30,22,3,'#3a4a46');blk(368,33,12,5,'#2a3432','#101614');P(370,38,8,1,'#fff1b8');P(349,188,9,4,'#2a3432');
  {const tx=164;P(tx-3,96,7,94,'#6b4a30');P(tx-3,96,2,94,'#8a6440');P(tx+2,96,2,94,'#4a301c');P(tx-8,188,17,4,'#5a5148');
    const Tn=['#9bd66f','#62ad4c','#3f823b','#2a5a2c'],O='#1a3a20',L=[[0,-106,24,19],[-17,-92,16,13],[19,-94,17,13],[0,-84,22,12]];
    L.forEach(([dx,dy,rx,ry])=>blob(tx+dx,B+dy,rx,ry,Tn,O));L.forEach(([dx,dy,rx,ry])=>blob(tx+dx,B+dy,rx-1,ry-1,Tn))}
  // ── 차도 ──
  bands(B+24,282,['#676b73','#5f636b','#575b63','#4f535b']);
  for(let x=(PF?10:0)-24;x<512;x+=80){P(x,236,46,4,'#ece9dc');P(x,240,46,1,'#a8a69c')}
  P(0,277,512,3,'#3e4148');
  walkway(c,282,'#d6cfc0','#c2baab')}
