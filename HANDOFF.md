# 정치인키우기 — 작업 인수인계 (도트 리모델링용)

## 프로젝트
- 저장소: GitHub `dhyunchun/politician-game` (main), 배포: https://dhyunchun.github.io/politician-game/ (push하면 GitHub Actions가 Pages 배포)
- Claude 아티팩트도 같이 갱신: https://claude.ai/artifact/NyESfQPSDvNWpyfy5hborW (`src/game.html` 복사본을 이 URL로 publish)
- 로그인·클라우드 저장: Firebase 프로젝트 `minbeop-2f119` (민법 두문자와 공용), Firestore `users/<uid>/games/politician`

## 파일 구조
- `src/game.html` — 게임 본체(HTML 조각 + 인라인 style/script, 약 3300줄). 거의 모든 작업은 여기서.
- `src/shell.html` — 페이지 틀(계정 바, 로그인 창). `src/firebase.js` — 인증·동기화·백업.
- `static/` — sw.js, manifest, 아이콘. `build.py` — `python3 build.py` 하면 `_site/` 생성.
- `proto/` — 도트 스타일 시안 코드와 비교 이미지(아래 참고).

## 도트 그래픽 구조 (src/game.html)
- `drawPx(spec, canvas)` — 장면 그리기. spec = `'배경|인물,인물|소품,소품'` (예: `'hall|aide,me^,aide|banner'`, `^`는 손 흔들기).
- 캔버스 512×256, 논리 좌표 256×128. 인물은 `personHD(r,X,Y,col,wave)`로 2배 해상도로 그림 — 킹오파 풍(약 6등신, 폭 36, 키 약 84, 머리 꼭대기 Y-14, 발 바닥 Y+69). 내부적으로 `pxGrid()`(레이어 칠하기 → 외곽선·안쪽선 자동)를 씀. 저해상도 `person()`은 삭제(캔버스가 모두 512폭이라 HD만 사용).
- 표정: `col.face` = smile/angry/sad/shock. spec 꼬리표로 지정 가능: `me^`(흔들기) `me+`(웃음) `me!`(화남) `me~`(슬픔) `me?`(놀람), 조합 가능(`me^+`). 표정이 없으면 me는 말하기 애니메이션.
- `whoCol(k)` + `WHO{}` — 인물 종류별 색/옷(me, riv, aide, cit, cit2, old, biz, rep, judge, doc, fjj/fsm). 속성: st(머리: part/short/slick/long/bob/bun/bald), h(머리색), s(피부), P(상의), L(하의), t(넥타이), w(셔츠), gl(안경), sk(치마), robe(법복), hood, steth, pin, note, talk.
- `BGS{}`(배경), `DET{}`(배경 디테일), `BGX{}`(앞/뒤 레이어), `PROPS{}`(소품), `crowd()`(군중), `litPass()`(조명 후처리).
- `EVPX{}` / `ENDPX{}` — 이벤트·엔딩별 장면 spec. `makeCard()` — 공유 카드(엔딩 장면 포함).
- `PF` — 520ms마다 0/1 토글(숨쉬기·말하기 애니메이션). `shade(hex,f)` 색 명암, `disc()` 원.
- 외형 설정 화면(시작 2단계)은 `S.look`으로 me 캐릭터 미리보기(`#lookc` 80×100). 상단 기호 아바타 `#avc`(36×36)는 상반신.

## 스타일 시안 (proto/)
- `personCQ.js` — 크루세이더퀘스트 풍(2.3등신, 큰 눈, 색 외곽선).
- `styles2.js` — 공용 `pxGrid()`(레이어별 칠하기 → 바깥 외곽선·앞 레이어와 맞닿은 안쪽선 자동 생성 → 가로 런 병합 출력) + `personMS`(메탈슬러그 풍) + `personKOF`(킹오브파이터 풍: 6.5등신, 역삼각 체형, 림라이트 5단 음영, 키 약 85px로 머리 꼭대기 Y-15, 발 Y+67).
- `dnf.js` — `personDNF`(던파 풍, 5.5등신, 3/4 측면).
- 시그니처는 모두 `personHD`와 같음 → `personHD`를 교체하면 게임 전체에 적용됨.
- `shot3.js` — Playwright로 사이트를 열고 시안 스크립트를 주입해 캐릭터 줄세우기 + 장면 비교 PNG 생성.
- `compare2.png`(지금/크퀘/메탈슬러그/킹오파), `compare3.png`(지금/던파).

## 킹오파 풍 리모델링 (2026-11 완료)
- `personKOF`를 다듬어 `personHD` 교체: 머리 조금 키움(얼굴 11×14), 눈썹·눈·코·입 정리, 표정 5종, 흔들기(주먹 들썩), 기록지(rep) 손에 쥠.
- `drawPx` 인물 간격 `min(42,132/(n-1))`, 군중 뒷모습(`backHD`) 머리 비율 축소, 연단 마이크 높임.
- 엔딩 장면 표정: 대통령·은퇴(웃음), 수감·번아웃·잊힘(슬픔), 탄핵(놀람). 이벤트 중 `exclaim` 소품 장면은 me가 놀람.
- 비교 이미지: `proto/compare4.png`(이전 / 킹오파 / 표정).
- (해결) 배경 단역도 킹오파 풍 6등신으로 다시 그림 — 아래 배경 리모델링 참고.

## 킹오파 풍 배경 리모델링 (2026-11 완료)
- 배경 20종 모두 `BGK`(512 좌표 직접 그림)로 교체. 옛 `BGS`·`DET`·`litPass`와 256 좌표 배경 도우미는 삭제.
- 배경은 `bgCached(bg)`가 (장면, 애니메이션 프레임 PF)별로 한 번만 그려 캐시(`BGC`) → 매 프레임은 drawImage 한 번.
- 도구: `BGK.H`(P, blk, panel, blob, bands, floor, tiles, win, flame, wheel, bust 등). 장면 안 사물·소품은 `hi(H=>...)`로 512 좌표에 그림.
- 밤 장면은 `NT` 모드에서 색을 자동으로 어둡게(T 함수), 조명·간판은 `RAW`로 원색 유지.
- 단역 `miniHD`: pxGrid 기반 6등신 축소판(눈·눈썹·입 있음), 발 바닥 Y+36·머리 Y-21. `mini()`의 손 소품은 고해상도에서 y-9 보정. 앉은 단역 `sitHD`는 머리~허리만 잘라 그림.
- 군중 뒷모습 `backHD`, 자동차 `carHD`도 같은 화풍. TV 화면·기차 창 안 사람도 `bust()`/`miniHD`로 얼굴까지 그림.
- `PROPS`: heart·exclaim·xmark(말풍선 아이콘)만 옛 방식, 나머지 21종은 512 좌표로 새로 그림.
- 비교 이미지: `proto/compare5_bg.png`.

## 테스트·배포 방법
- 로컬 서버: `python3 build.py && python3 -m http.server 8767 -d _site` (백그라운드는 `setsid nohup ... &`).
- Playwright(Chromium 설치됨)로 스크린샷. 시작 화면 3단계의 `#go` 버튼은 JS로 `document.getElementById('go').click()`.
- jsdom 시뮬레이션 봇은 이전 세션 임시폴더에 있어 사라짐 → 필요하면 새로 작성(`window.__NOSUSP=1`로 연출 생략).
- 배포: `git add -A && git commit && git push origin main` → 아티팩트도 `src/game.html` 복사본으로 같은 URL에 다시 publish.

## 사용자 선호
- 답변은 한국어. 도트 픽셀 스타일 유지(실사·벡터 거절했음).
- "저출생" 대신 "저출산". 실존 정치인 이름·은어(윤심, 용산 등) 금지, 가상 정당명 사용: 더불어지낸당(파랑), 시민의힘(빨강), 무소속(회색), 신당(주황).
- 작업 끝나면 커밋·푸시·아티팩트 갱신까지.

- 배포 주의: 세션 프록시로 푸시하면 Pages 배포가 자동으로 안 돌 수 있음 → `gh workflow run "Deploy to GitHub Pages" --ref main`으로 수동 실행 후 성공 확인.
