# 간판 글자 비트맵: Noto Sans CJK KR Black을 작은 크기로 그려 1비트로 자르고, 기기마다 같게 보이도록 코드에 박아 넣는다
from PIL import Image, ImageDraw, ImageFont
import sys, json
F='/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
def bitmap(ch,size,th=110):
    # ttc 안에서 KR 글꼴 번호 찾기
    for idx in range(10):
        try:
            f=ImageFont.truetype(F,size,index=idx)
        except Exception: break
        if 'KR' in ' '.join(f.getname()): break
    im=Image.new('L',(size*2,size*2),0);d=ImageDraw.Draw(im);d.text((size//2,size//2),ch,font=f,fill=255)
    px=im.load();W,H=im.size
    on=[(x,y) for y in range(H) for x in range(W) if px[x,y]>th]
    x0=min(x for x,_ in on);x1=max(x for x,_ in on);
    return on,x0,x1
out={}
for size,chars in [(int(a.split(':')[0]),a.split(':')[1]) for a in sys.argv[1:]]:
    # 같은 크기 글자는 위아래 기준선을 맞춘다
    bms={c:bitmap(c,size) for c in chars}
    y0=min(y for on,_,_ in bms.values() for _,y in on);y1=max(y for on,_,_ in bms.values() for _,y in on)
    for c,(on,x0,x1) in bms.items():
        w=x1-x0+1;h=y1-y0+1;rows=[['.']*w for _ in range(h)]
        for x,y in on: rows[y-y0][x-x0]='#'
        out[f'{size}{c}']=[''.join(r) for r in rows]
print(json.dumps(out,ensure_ascii=False))
