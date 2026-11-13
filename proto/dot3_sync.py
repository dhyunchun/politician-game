"""도트 3판 배경(proto/dot3_bgs.js)을 src/game.html 에 넣는다. 여러 번 돌려도 같은 결과.
- BGK 도구 묶음(H)에 nt·raw·stars·skyline·curtain 을 내보낸다
- DOT3-BGS 표시 사이에 간판 글자 비트맵 + dot3_bgs.js 를 넣는다
- SCN 정의 뒤에서 SCN3(새 배경 설정)를 덮어쓴다
사용법: python3 proto/dot3_sync.py
"""
import json, subprocess, sys, re
from pathlib import Path
root = Path(__file__).parent.parent
g = root/'src'/'game.html'
s = g.read_text(encoding='utf-8')
# 간판에 쓰는 글자(크기:글자들). 새 간판 글자는 여기에 더한다
GLYPHS = {15: '맛나김밥늘봄마트커피한잔싱청과황소정육바다수산투표소국감사함께만드는내일새바람치', 13: '노래방제회의원선거관위응급실', 11: '출구입'}
args = [f'{k}:{"".join(dict.fromkeys(v))}' for k, v in GLYPHS.items()]
gl = json.loads(subprocess.check_output([sys.executable, str(root/'proto'/'dot3_glyphs.py'), *args]))
a = "const H={P,dith,bands,vbands,blk,panel,blob,alpha,glow,poly,cloud,tree,win,floor,tiles,flag,lamp,wheel,flame,bust,"
if a in s and 'nt(v){NT=v}' not in s:
    s = s.replace(a, a + "nt(v){NT=v},raw(v){RAW=v},stars,skyline,curtain,ridge,", 1)
body = "/* DOT3-BGS-BEGIN */\nObject.assign(SIGNF," + json.dumps(gl, ensure_ascii=False, separators=(',', ':')) + ");\n" + (root/'proto'/'dot3_bgs.js').read_text(encoding='utf-8') + "\n/* DOT3-BGS-END */\n"
if '/* DOT3-BGS-BEGIN */' in s:
    s = re.sub(r'/\* DOT3-BGS-BEGIN \*/.*?/\* DOT3-BGS-END \*/\n', lambda m: body, s, flags=re.S)
else:
    s = s.replace('/* ── 배경별 설정 ──', body + '/* ── 배경별 설정 ──', 1)
i = s.index('const SCN={'); j = s.index('\n};', i) + 3
merge = "\nfor(const k in SCN3)SCN[k]=Object.assign({},SCN[k],SCN3[k]);"
if not s[j:j+len(merge)] == merge:
    s = s[:j] + merge + s[j:]
g.write_text(s, encoding='utf-8')
print('synced', len(body))
