"""src/ 와 static/ 을 합쳐 _site/ 에 배포용 파일을 만든다.

- src/shell.html 의 __GAME__ 자리에 src/game.html(게임 본체)을 넣어 index.html 을 만든다.
- static/sw.js 의 __BUILD__ 를 빌드 번호로 바꿔 새 버전이 캐시를 갈아끼우게 한다.
사용법: python3 build.py [빌드번호]
"""
import shutil, sys, time
from pathlib import Path

root = Path(__file__).parent
out = root / "_site"
build = sys.argv[1] if len(sys.argv) > 1 else time.strftime("%Y%m%d%H%M%S")

if out.exists():
    shutil.rmtree(out)
shutil.copytree(root / "static", out)

game = (root / "src" / "game.html").read_text(encoding="utf-8")
shell = (root / "src" / "shell.html").read_text(encoding="utf-8")
assert "__GAME__" in shell
assert 'id="app"' in game, "game.html 에 #app 이 없어요"
game = game.replace("<title>정치인키우기</title>", "")  # 제목은 shell 의 <head> 에 있다
(out / "index.html").write_text(shell.replace("__GAME__", game), encoding="utf-8")
shutil.copy(root / "src" / "firebase.js", out / "firebase.js")
sw = out / "sw.js"
sw.write_text(sw.read_text(encoding="utf-8").replace("__BUILD__", build), encoding="utf-8")
(out / ".nojekyll").write_text("")
print(f"built -> {out} (build {build})")
