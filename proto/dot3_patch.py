"""도트 3판 시안: src/game.html 을 고쳐 쓴 사본을 만든다(원본은 건드리지 않음).
사용법: python3 proto/dot3_patch.py <출력 디렉터리>   → <출력>/index.html
바꾸는 것: ①인물 음영 3단 ②체형(어깨·팔다리 굵기·다리 길이·손발) ③머리카락 결 ④행인 다양화 ⑤거리 배경을 인물 크기에 맞춰 새로 그림
"""
import sys, shutil
from pathlib import Path
root = Path(__file__).parent.parent
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
s = (root/'src'/'game.html').read_text(encoding='utf-8')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)

# ① 음영 3단: 밝음·기본·그늘
rep("const band=(dt,o)=>{if(o.flat)return 1;const f=dt>.62?1.24:dt>.22?1.08:dt>-.28?1:dt>-.66?.8:.64;return f*(o.f||1)};",
    "const band=(dt,o)=>{if(o.flat)return 1;const f=dt>.5?1.16:dt>-.4?1:.74;return f*(o.f||1)};")
rep("const TT=[[.1,1.3],[.26,1.1],[.62,1],[.84,.8],[1,.64]];", "const TT=[[.2,1.16],[.74,1],[1,.74]];")

# ② 체형
rep("const sw=FEM?8.4:10,wa=FEM?5.6:6.6,hp=FEM?7.6:7;", "const sw=FEM?8.8:10.5,wa=FEM?5.9:7.3,hp=FEM?7.9:7.6;")
rep("const hipC=[18+(P0.hip?P0.hip[0]:0),25+(P0.hip?P0.hip[1]:0)]", "const hipC=[18+(P0.hip?P0.hip[0]:0),27+(P0.hip?P0.hip[1]:0)]")
rep("const hpA=d==='f'?[hipC[0]-3.4,hipC[1]+1]", "const hpA=d==='f'?[hipC[0]-3.9,hipC[1]+1]")
rep("const hpB=d==='f'?[hipC[0]+3.4,hipC[1]+1]", "const hpB=d==='f'?[hipC[0]+3.9,hipC[1]+1]")
rep("  const J=(o,r)=>[o[0]+r[0],o[1]+r[1]];", "  const J=(o,r)=>[o[0]+r[0],o[1]+r[1]],LJ=(o,r)=>[o[0]+r[0],o[1]+r[1]*.944];")
rep("const leg=(hp0,Lg,far)=>{const kn=J(hp0,Lg[0]),ft=J(hp0,Lg[1]);", "const leg=(hp0,Lg,far)=>{const kn=LJ(hp0,Lg[0]),ft=LJ(hp0,Lg[1]);")
rep("else{const fA=J(hpA,P0.lA[1]),fB=J(hpB,P0.lB[1]);part();const sh='#2c201a';", "else{const fA=LJ(hpA,P0.lA[1]),fB=LJ(hpB,P0.lB[1]);part();const sh='#2c201a';")
rep("cap(...hp0,...kn,2.5,2.1,s,{f});cap(...kn,...ft,2.1,1.6,s,{f})}else{cap(...hp0,...kn,3.8,3.2,L0,{f});cap(...kn,...ft,3.2,2.7,L0,{f});",
    "cap(...hp0,...kn,2.9,2.4,s,{f});cap(...kn,...ft,2.4,1.9,s,{f})}else{cap(...hp0,...kn,4.7,4,L0,{f});cap(...kn,...ft,4,3.5,L0,{f});")
rep("if(d==='f')poly([[fx-2.6,fyy],[fx+2.6,fyy],[fx+3.2,fyy+2.4],[fx+2.8,fyy+3.4],[fx-2.8,fyy+3.4],[fx-3.2,fyy+2.4]],sh,{f});",
    "if(d==='f')poly([[fx-3.4,fyy-.6],[fx+3.4,fyy-.6],[fx+4,fyy+2.2],[fx+3.6,fyy+3.4],[fx-3.6,fyy+3.4],[fx-4,fyy+2.2]],sh,{f});")
rep("else poly([[fx-2.6,fyy-.4],[fx+2,fyy-.4],[fx+5.4,fyy+1.6],[fx+5.6,fyy+3.4],[fx-2.8,fyy+3.4],[fx-3,fyy+1.4]],sh,{f});",
    "else poly([[fx-3.4,fyy-.8],[fx+2.6,fyy-.8],[fx+6.6,fyy+1.4],[fx+7,fyy+3.4],[fx-3.6,fyy+3.4],[fx-3.8,fyy+1.2]],sh,{f});")
rep("feat();rect(fx-(d==='f'?1.8:1.2),fyy+.6,d==='f'?1.6:3,.6,shade(sh,2.8));rect(fx-3,fyy+2.8,d==='f'?6:8.4,.6,'#120c0a')};",
    "feat();rect(fx-(d==='f'?2.2:.6),fyy+.2,d==='f'?1.2:1.8,.6,shade(sh,1.9));rect(fx-3.8,fyy+2.8,d==='f'?7.6:10.6,.6,'#120c0a')};")
# 팔·소매·손
rep("else{cap(...sh0,...el,2.3,2.05,AC,k);cap(...el,...hn,2.05,1.85,AC,k);", "else{cap(...sh0,...el,2.65,2.4,AC,k);cap(...el,...hn,2.4,2.15,AC,k);")
rep("cap(hn[0]-ux/ln*1.9,hn[1]-uy/ln*1.9,hn[0]-ux/ln*.6,hn[1]-uy/ln*.6,1.75,1.7,W,{f:1})", "cap(hn[0]-ux/ln*1.9,hn[1]-uy/ln*1.9,hn[0]-ux/ln*.6,hn[1]-uy/ln*.6,2.15,2.05,W,{f:1})")
rep("if(hand==='point'){ell(fx,fy2,1.9,1.8,s);", "if(hand==='point'){ell(fx,fy2,2.3,2.2,s);")
rep("else if(hand==='fist'){ell(fx,fy2,2.05,1.95,s);", "else if(hand==='fist'){ell(fx,fy2,2.5,2.4,s);")
rep("else if(hand==='palm'){ell(fx,fy2-.4,1.8,2,s);for(let k=0;k<4;k++)cap(fx-1.3+k*.85,fy2-1.8,fx-1.5+k*.95,fy2-3.6+Math.abs(k-1.5)*.4,.42,.38,s);cap(fx-1.6,fy2,fx-3,fy2-1.4,.5,.42,s)}",
    "else if(hand==='palm'){ell(fx,fy2-.4,2.2,2.4,s);for(let k=0;k<4;k++)cap(fx-1.6+k*1.05,fy2-2.2,fx-1.9+k*1.2,fy2-4.4+Math.abs(k-1.5)*.5,.55,.5,s);cap(fx-2,fy2,fx-3.7,fy2-1.7,.62,.52,s)}")
rep("else{ell(fx,fy2,1.85,1.9,s);feat();cap(fx-1.4,fy2-.4,fx-2.4,fy2+.8,.5,.45,s);part()}", "else{ell(fx,fy2,2.25,2.35,s);feat();cap(fx-1.7,fy2-.4,fx-2.9,fy2+1,.6,.55,s);part()}")
rep("part();cap(nk[0]+(d==='s'?.6:0),nk[1]-3,nk[0]+(d==='s'?.6:0),nk[1]+.4,2.1,2.2,S3,{flat:1});", "part();cap(nk[0]+(d==='s'?.6:0),nk[1]-3,nk[0]+(d==='s'?.6:0),nk[1]+.4,2.6,2.8,S3,{flat:1});")
# 바지 주름선은 조금 가늘게 한 줄만
rep("line(hp0[0]+cx2,hp0[1]+3,kn[0]+cx2*.8,kn[1],.45,shade(L0,.72));line(kn[0]+cx2*.8,kn[1],ft[0]+cx2*.6,ft[1]-1,.4,shade(L0,.72))}",
    "line(kn[0]+cx2*.8,kn[1]+1,ft[0]+cx2*.6,ft[1]-1.4,.4,shade(L0,.74))}")

# ③ 머리카락: 윤기 획을 굵게 한 덩어리로, 정수리·뒤통수에 삐친 결
rep("function arcHi(G,cx,cy,rx,ry,H,h){// 머리 윤기: 왼쪽 위 호를 따라 짧은 획 3개\n  [[200,222],[230,250],[258,272]].forEach(",
    "function arcHi(G,cx,cy,rx,ry,H,h){H=shade(h,1.5);rx*=.9;ry*=.86;// 머리 윤기: 가는 획 2개\n  [[206,226],[236,258]].forEach(")
rep("G.cap(cx+Math.cos(A)*rx,cy+Math.sin(A)*ry,cx+Math.cos(B)*rx,cy+Math.sin(B)*ry,i===1?.5:.4,i===1?.5:.36,i===1?H:shade(h,1.4),{flat:1})","G.cap(cx+Math.cos(A)*rx,cy+Math.sin(A)*ry,cx+Math.cos(B)*rx,cy+Math.sin(B)*ry,.32,.3,i===1?H:shade(h,1.3),{flat:1})")
rep("fem?(x<0?1.8:.6):Math.sin(x*1.9)*.8+.3});","fem?(x<0?1.8:.6):Math.sin(x*1.7)*1.3+.9});")
rep("FEM?1.4:Math.sin(x*1.9)*.7+.2});","FEM?1.4:Math.sin(x*1.7)*1.2+.7});")

# ④ 행인 다양화: 배경 인물은 종류만 같고 머리·옷이 자리마다 다르다(주요 인물과 겹쳐 보이지 않게)
rep("function whoCol(k){", """const EXV={P:['#b05a4a','#4a7a9a','#7a6a9a','#c8b070','#4f7a5a','#8a8f98','#d08a5a','#35507a','#a04a6a'],L:['#3b3f48','#2f343b','#4a4f5a','#3f5f8f','#5a4a3a','#26303c'],h:['#1f1f1f','#3a2a20','#5a3a22','#2b2421','#6a5a4a','#151515'],M:['short','part','slick'],F:['long','bob','bun']};
function varyCol(col,seed){if(col.robe||col.steth)return col;const r=mkRng('ex'+seed),pk=a=>a[Math.floor(r()*a.length)],fem=['long','bob','bun'].includes(col.st),c=Object.assign({},col);
  c.P=pk(EXV.P);c.L=pk(EXV.L);if(col.st!=='bald'){c.st=pk(fem?EXV.F:EXV.M);c.h=pk(EXV.h)}else if(r()<.5){c.st='slick';c.h='#b8b8b8'}
  c.gl=r()<.25?1:0;c.hood=!fem&&r()<.3?1:0;if(c.hood)c.t=null;c.sk=fem&&r()<.4?1:0;return c}
function whoCol(k){""")
rep("(sc.extras||[]).forEach(([kk,pose,x,fy,flip,o])=>items.push({fy,fn:()=>{const K=kz(fy),col=Object.assign({},whoCol(kk),o||{});",
    "(sc.extras||[]).forEach(([kk,pose,x,fy,flip,o],xi)=>items.push({fy,fn:()=>{const K=kz(fy),col=Object.assign({},sc.full?varyCol(whoCol(kk),bg+xi):whoCol(kk),o||{});")

# ⑤ 거리 배경: 인물 크기에 맞춘 전체 그림(sc.full)
rep("  const sc=SCN[bg]||{};const ext=sc.ext||[216,256];\n", "  const sc=SCN[bg]||{};if(sc.full){c.clearRect(0,0,512,320);BGK.run(c,H=>sc.full(c,H));return BGF[key]=cv}const ext=sc.ext||[216,256];\n")
rep("  const X=BGX[bg];try{if(X&&X.back)X.back(r,mkRng(spec+'b'),c,ws)}catch(e){}", "  const X=BGX[bg];try{if(X&&X.back&&!sc.full)X.back(r,mkRng(spec+'b'),c,ws)}catch(e){}")
street = (Path(__file__).parent/'dot3_street.js').read_text(encoding='utf-8')
rep("/* ── 배경별 설정 ──", street + "\n/* ── 배경별 설정 ──")
rep("""  street:{ext:c=>walkway(c,280,'#d6cfc0','#c2baab'),
    extras:[['cit2','walk',36,236,0],['cit','walkB',150,234,1],['old','idleQ',398,238,1],['aide','phone',470,236,1]],""",
    """  street:{full:(c,H)=>streetV3(c,H),
    extras:[['cit2','walk',58,193,0],['cit','walkB',236,191,1],['old','idleQ',318,194,0],['aide','phone',470,192,1]],""")

shutil.copytree(root/'static', out, dirs_exist_ok=True)
shell = (root/'src'/'shell.html').read_text(encoding='utf-8')
(out/'index.html').write_text(shell.replace('__GAME__', s.replace('<title>정치인키우기</title>', '')), encoding='utf-8')
shutil.copy(root/'src'/'firebase.js', out/'firebase.js')
(out/'game_v3.html').write_text(s, encoding='utf-8')
print('ok', out)
