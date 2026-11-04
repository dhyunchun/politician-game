# 정치인키우기

시군구의원에서 대통령까지. 해마다 찾아오는 사건 앞에서 선택하며 정치인을 키우는 풍자 게임입니다.
모든 정당·인물·사건은 가상입니다.

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/game.html` | 게임 본체(화면·규칙·이벤트·도트 그래픽). 이 파일 하나만 고치면 대부분의 업데이트가 끝납니다. |
| `src/shell.html` | 웹페이지 틀(제목, 앱 설치 정보, 로그인 창). 빌드할 때 `__GAME__` 자리에 게임 본체가 들어갑니다. |
| `src/firebase.js` | Google·이메일 로그인과 Firestore 저장 연결 |
| `static/` | 앱 설치 정보(manifest), 아이콘, 오프라인용 service worker |
| `build.py` | `src/`와 `static/`을 합쳐 `_site/`를 만듭니다. |
| `firestore.rules` | Firestore 보안 규칙(각 사용자는 자기 기록만 읽고 쓰기) |

`main` 브랜치에 올리면 GitHub Actions가 빌드해서 GitHub Pages에 자동으로 배포합니다.

## 저장

- 로그인 전: 기기 브라우저(localStorage)의 `pol-save`(진행 중인 판), `pol-hof`(명예의 전당)
- 로그인 후: Firestore `users/<uid>/games/politician` 문서에 함께 저장. 더 최근에 저장된 쪽을 따르고, 명예의 전당은 합칩니다.
- Firebase 프로젝트는 민법 두문자 복습장(`minbeop-2f119`)과 같이 씁니다. 같은 계정으로 두 앱 모두 로그인됩니다.

## 로컬에서 보기

```
python3 build.py && cd _site && python3 -m http.server 8000
```
