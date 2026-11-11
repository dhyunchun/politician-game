# 정치인키우기 — 작업 인수인계

새 대화에서 이어 작업할 때 이 문서부터 읽는다. 마지막 정리: 2026-11-07.

## 프로젝트
- 저장소: GitHub `dhyunchun/politician-game` (main), 배포: https://dhyunchun.github.io/politician-game/ (push하면 GitHub Actions가 Pages 배포)
- Claude 아티팩트도 같이 갱신: https://claude.ai/artifact/NyESfQPSDvNWpyfy5hborW (`src/game.html` 복사본을 이 URL로 publish)
- 로그인·클라우드 저장: Firebase 프로젝트 `minbeop-2f119` (민법 두문자와 공용), Firestore `users/<uid>/games/politician` = `{json:{save,hof,ach}, updated}`
- 배포 주의: 세션 프록시로 푸시하면 Pages 배포가 자동으로 안 돌 수 있음 → `gh workflow run "Deploy to GitHub Pages" --ref main`으로 수동 실행 후 성공 확인.

## 파일 구조
- `src/game.html` — 게임 본체(HTML 조각 + 인라인 style/script, 약 3900줄, 이벤트 약 380개). 거의 모든 작업은 여기서.
- `src/shell.html` — 페이지 틀(계정 바, 로그인 창). `src/firebase.js` — 인증·동기화·백업(`mergeHof`, `mergeAch`: ends·ach·bgs·dex 합침).
- `static/` — sw.js, manifest, 아이콘. `build.py` — `python3 build.py` 하면 `_site/` 생성.
- `tools/` — 테스트 도구(아래). `proto/` — 도트 스타일 시안과 비교 이미지(배포 안 됨).
- localStorage 키: `pol-save`(진행 중 판), `pol-hof`(명예의 전당), `pol-ach`(업적·엔딩·출신·이벤트 도감 `dex`), `pol-save-bak`, `pol-snd`, `pol-ts`, `pol-statopen`.

## 게임 흐름 (src/game.html)
- 상태는 전역 `S`. 한 해 = `buildQueue()`가 만든 일정 큐를 `renderQueueItem`이 하나씩 보여 주고 → `yearEnd()` → `nextYear()`.
- 큐 항목 type: `ev`(이벤트), `elec`(선거), `trial`, `detect`, `fig`(당 인사 뉴스), `poll`(여론조사), `leader`, `impeach`, `pagenda`, `pbudget`, `pfound`, `chair`.
- 이벤트 형식: `{id, w, core, tempt, tag, px, c:()=>조건, t, b, ch:[[선택지, fn, {hint,dis,dark}]]}`. `t`·`b`·`ch`·`px`는 함수도 됨. `core:true`는 큐에 직접 넣는 것(무작위 풀 제외).
- 도우미: `chg({...})` 능력치 변화, `addCase(이름,경중)`, `addLog`, `finish(html)` 결과 화면, `J(단어,'이가'|'을를'|'은는'|'과와')` 조사, `hon()` 호칭, `R()`/`ri()`/`pick()`/`gauss()`.
- 선택지 문구는 "~한다"체로 통일(예외: 대사형 "진행시켜"·"하지 마", 책 제목).

### 큐 분기 (buildQueue)
- 흙집 칩거(`S.togul` && 무직): `tg_day` + 칩거 이벤트(`e.tg` 또는 tag 칩거·하산) 2개 + 하산 조건이면 `y_return` 보장. 정치 일정·선거 없음.
- 국무총리(`S.pm`): `pm_work` + `e.pm` 이벤트 2개 + 개각(`pm_end`) + 대선 캠프 + 여론조사 + 선거.
- 장관(`S.minister`): `mn_work` + 부처 이벤트(`e.md`) 1 + 중앙정치(`e.mn`) 1 + 개각·총리 제안·대선 캠프 + 여론조사 + 선거.
- 일반: 핵심 일정(c_work 등) + 무작위 풀 2개 + 장관/총리 제안 + 야당 원내대표 경선·원내 협상 + 야당 이벤트(전용 칸 35%, 일반 풀에서는 제외) + 여론조사 + 선거.
- 장관·총리 이벤트는 플래그(`e.mn`/`e.pm`)로 판별. ID 접두어로 판별하면 안 됨(소수당 이벤트도 `mn_`로 시작).
- 이벤트 고르게 나오게(2026-11-08): 모든 분기에서 `pickWt`로 뽑고 가중치에 `evFresh(e)`를 곱한다. 같은 판에서 본 횟수(`S.evn`)마다 ×0.35, 도감(`pol-ach.dex`)에 없는 이벤트는 ×2. 기획 가중치는 `evW`로 2 초과분을 절반만 반영. 일반 풀 보너스: 직책 전용(조건 문자열에 isAdmin·isNat·isCouncil·isLocalCouncil·isPres·`S.office`)은 ×1.8(기획 w가 1 이하일 때만), 대통령 전용(`()=>S.office==='pres'`·`()=>isPres()&&`)은 ×3. 유혹 이벤트는 1 + 자금 부족 1.5 + 선거 임박 0.5.
  - 효과(시뮬 120판): 판당 서로 다른 이벤트 46→55개, 가장 많이 나온 이벤트 170→112회, 상위 10개 비중 16→12%, 2회 이하 이벤트 46→36개, 대통령 전용 이벤트 임기당 0.5→1.3개. 대통령 도달률 변화 없음.
  - 남은 "자주 나오는" 이벤트(경제 위기 후속, 공천 학살, 칩거 제안, 라이벌)는 상황 연출용 고가중치라 의도대로 둠. 한 번도 안 나오는 이벤트는 대부분 도달이 드문 상태(대통령·파벌 연쇄) 전용.

### 주요 시스템
- 선거: `elecBase(off,lv)`가 무작위 없는 기대 득표 구도(지지율·인지도·역량·당 지지도·지역 성향·정권 평가·라이벌·여론조사 효과)를 내고 `tally(E)`가 무작위를 더해 확정. 공천 `nomProb(off)`. 대선은 검증 공세·TV 토론 단계 추가. 지방 소규모 선거 출구조사는 자주 틀림.
- 여론조사: `pollTargets()`(1~2년 안 선거의 다음 자리·재선, 최대 3) → `runPolls()` → `renderPoll`. 공표 효과(밴드왜건/낙인) `addPollFx`, 선택(대세론·읍소·무시·체리피킹), 효과는 `pollFx(off)`로 득표에 ±6 한도. 공천에도 `pollLead` 반영. 선거 화면 버튼에 최근 수치 표시.
- 대통령: `S.gov`, 국정과제 1개(`AGENDA`, 과제별 2·4년차 전용 이벤트 `pa_<과제>1/2`), `presEval`. 도달률은 의도적으로 낮음(무난한 전략 1~2%) — 사용자가 "지금이 적당"하다고 함.
- 장관: 출신별 부처(`MIN`: 변호사 법무부, 방송인 문체부, 시민운동가 환경부, 사업가 중기부, 공무원 행안부, 보좌관 국토부). 국회의원·광역단체장만 제안. 청문회 낙마, 도지사는 임명 시 사퇴.
- 국무총리: 장관 경력 + 재선 의원 또는 광역단체장, 청문회 + 국회 임명동의 표결. 총리 경력은 대선 경로 충족.
- 야당: `opp()`. 원내대표 경선(`op_whip`, 홀수 해), 원내 협상, 야당 이벤트 `e.op`.
- 칩거: `y_togul`로 진입, `tg_*` 이벤트, 칩거 전용 배경음악.
- 가족 `S.fam`(`F()`, `kidAt`, `hasKid`), 라이벌 `S.rival`, 계파 `S.pf`, 위기 `S.crisis`, 멘탈.
- 도감: 엔딩·업적·출신 + 이벤트 도감(`dexMark`가 본 이벤트 제목을 `pol-ach.dex`에 기록, `DEXCAT` 13분류).
- 엔딩 칭호: `careerTitle()` 24종(경로 우선). 엔딩 화면·공유 카드·공유 텍스트에 표시.
- 공유 카드 `makeCard()`: 내용 길이에 맞춰 높이 자동(최소 1000).

## 도트 그래픽 (도트 2판, 2026-11-07 배포)
- `drawPx(spec, canvas)` — spec = `'배경|인물,인물|소품,소품'`. 인물 꼬리표: `^` 흔들기, 표정 `+` 웃음 `!` 화남 `~` 슬픔 `?` 놀람(조합 가능). spec 형식은 예전과 같고, 자세·자리·방향은 엔진이 정한다.
- 장면 캔버스 512×320(16:10, `.px` aspect-ratio 16/10). 원근: 발 위치 y에서 배율 `kz(fy)`(y=300에서 1.715, y=224에서 1), 1m 픽셀 `mz(fy)`. 앞쪽 인물은 그림 높이의 약 45%.
- 인물 `personH(ctx,cx,fy,K,col,pose,flip)`: 단위 좌표(옛 512 격자 1칸=1단위, 몸 중심 x=18, 발 y≈66)로 정의하고 배율 K로 래스터화(`HDR`). 정면 `f`·3/4 `q`·측면 `s`, 좌우 반전, 관절 자세 `HPOSE`(팔은 어깨 기준 [팔꿈치,손], 다리는 엉덩이 기준 [무릎,발]), 손 소품(mic·phone·paper·env·cam·sign·bag·umb·glass·note·pen). 그린 인물은 `sprite()`가 캐시(`SPC`).
- 장면 배치 `stageScene(bg,who,props)`: 주인공이 맨 앞 자리, 상대는 주인공을, 주인공은 라이벌(없으면 가장 가까운 사람)을 본다. 웃으며 둘이 만나면 악수(손 닿는 거리), 사업가+봉투·돈·책·가방이면 건네기, 연단·탁자·우산·전화·잔 소품은 해당 자세. 판사는 배경 법대(`SCN.court.bench`) 뒤 단상에서 상반신만(`clipY`).
- 배경: 기존 `BGK` 배경(512×256, K=1 인물 기준)을 24px 내려 '뒤쪽 평면'으로 쓰고(`bgFrame`), 위는 첫 줄 늘림, 아래 40px는 배경별 확장(`SCN[bg].ext`, 거리는 `walkway` 인도). 옛 단역(`mini`/`miniSit`/`smallCar`)은 `PXC.nomini`로 끄고, `SCN[bg].extras`의 자세 있는 배경 인물로 대체. 지나가는 차는 `SCN[bg].deco`(실제 4.5m 크기).
- 소품: 실제 크기로 다시 그린 것(`hdPodium`·`hdTable`(desk)·`hdBallot`·`hdBooks`·`hdCase`(cash)·`hdBoxes`·`hdBus`·법정 밖 `hdGavel`)은 사람 없는 빈자리(`freeX`, 빈자리 없으면 뒤쪽 깊이)에. 배경 평면 소품(`OLDPLANE`: 법정 의사봉·카메라·차트·승용차·집·화환·트럭)은 K=1 깊이에, 현수막·아이콘(`OVERLAY`)은 맨 위.
- 앞줄 관객 뒷머리(`crowd` 토큰 또는 `SCN[bg].heads`)는 `headsLayer()`로 캐시.
- 다음 장면 미리 그리기(2026-11-09): `paint()` 직후 `warm(nextSpecs(spec))`. 지금 장면의 결과 표정(+·~·?)과 다음 일정 두 개(`itemSpecs`: 이벤트는 `evSpec`, 그 밖의 일정은 `TYPESPEC` 표 + 마지막에 본 장면 `LASTSPEC`)를 `warmTasks`로 배경 한 장·인물 한 명 단위로 쪼개 `requestIdleCallback` 틈에 캐시에 넣는다(한 번에 약 6ms). 한 해 정리 화면에서는 `yearStartSpecs()`(다음 해 첫 일정), 시작 화면에서는 `warmBg`로 첫 배경. 인물 캐시 `SPC`는 LRU(320장 넘으면 오래된 것부터 260장까지). 새 일정 종류나 고정 장면을 추가하면 `TYPESPEC`에도 넣을 것. 장면 색 결정은 `pplCol(o)` 하나로 공유(그리기와 미리 그리기의 캐시 키가 같아야 함).
  - 효과(CPU 4배 감속): 처음 보는 장면 그리기 중앙 46→4ms, 느린 10% 161→11ms, 최대 222→41ms.
- 표정 자동화: `tagFace`(이벤트 태그→주인공·상대 인물 표정, `TAGFACE`/`NPCTAG`), 결과 화면 `moodSpec`(내 결과에 따라 내 편은 같이, 라이벌은 반대로, 판사는 굳은 얼굴).
- 상단 아바타·외모 미리보기도 `drawPerson`(stand 자세). 공유 카드는 16:10 장면.
- 개발용 원본: `proto/hd.js`(인물)·`proto/bghd.js`(실제 크기 소품 도구)·`proto/dot2.js`(엔진·배치) → `proto/dot2_all.js`로 합쳐 game.html의 `/* ===== 도트 2판 엔진` 구역에 넣었다. 게임 쪽을 직접 고쳐도 된다(이후 proto는 참고용).
- `whoCol(k)`/`WHO{}` 인물 종류, `PROPS` 소품(옛 그림), `ENDPX`·`EVPX` 장면 spec.

## 소리 (`SND` IIFE)
- 효과음 `FX`(click, good, bad, win, lose, gavel, stamp, tick, ach, coin).
- 배경음악 트래커: 곡마다 A+B 16마디(`SONGS`: title, play, tense, pres, togul). 성부: 펄스 리드(비브라토·딜레이, 왼쪽), 화음(3·6도, 오른쪽), 아르페지오, 삼각파 베이스, 드럼(k·s·h·c). 짧은 잔향, 8마디마다 필인, 셔플(`sw`), 곡 전환 크로스페이드.
- 곡 선택 `pickBgm()`. 기본 꺼짐(오른쪽 위 버튼). 미리듣기는 `SND._render(곡,초)`(OfflineAudioContext).
- 화면 밖에서 멈추기(2026-11-09): `visibilitychange`·`pagehide`·`pageshow`에서 `onVis()`. 가려지면 장면 애니메이션 타이머(`PXT`)를 지우고(`pxStop`) `SND.pause(true)`로 AudioContext suspend + 음악 스케줄러 정지. 돌아오면 `pxRun()`·`SND.pause(false)`로 이어서 재생. 가려진 동안 `bgm()`이 불려도 곡만 바꾸고 소리는 안 냄. 상태 확인은 `SND.state`.

## 테스트 도구 (tools/)
- 준비: `cd tools && npm install` (jsdom). Playwright·Chromium은 환경에 설치돼 있음(`playwright install` 금지).
- `node --max-old-space-size=3000 tools/sim.js <판 수 ≤60> <rand|smart|mod>` — jsdom 봇이 실제 화면 버튼을 눌러 끝까지 플레이. 엔딩 분포·로그 키워드·최고 직위·출신/정당별 성과·`errs`(런타임 오류)를 출력. `SEENOUT=파일`로 등장 이벤트 집계 저장, `FORCEPRES=1`로 대선 구간 점검. 한 프로세스 60판 이하(메모리), CPU 2개면 두 전략을 병렬로.
  - 임기 공약 균형(2026-11-11, 120판씩): 공약 챙기는 봇 — 이행 40~50%, 당선율 0.65~0.66, 광역단체장 이상 28~35판, 대통령 2~3판(smart 3/120, mod 2~3/60). 공약 무시 봇(`PLEDGE=ignore`) — 파기 36~47%, 당선율 0.62~0.63, 대통령 1판. 공약 도입 전 — 당선율 0.64, 광역단체장 이상 31~36판, 대통령 5~7판. 챙기는 봇은 당내입지·자금이 조금 낮아 대선 도전 횟수가 줄어든다(사람은 조절 가능).
  - 기준치(2026-11): 깨끗한 전략(smart) 대통령 4~6%(2026-11-11 재측정: 배포판 7/120, 1단계 후 5/120), 무난한 전략(mod) 2~3%, 잊힌 정치인 10~17%, 번아웃 수 %, 장관 약 10%.
- `node tools/reach.js` — 서버(`python3 -m http.server 8767 -d _site`) 띄운 뒤 실행. 무작위 상태에서 이벤트 조건이 한 번도 참이 안 되는 것 찾기(지역·가족·라이벌 상태는 단순화돼 있어 NEVER가 곧 버그는 아님 → `sim.js`의 SEENOUT과 함께 볼 것).
- `node tools/bgm_render.js <폴더> <초>` — 곡별 WAV 렌더(ffmpeg로 mp3 변환해 사용자에게 들려줌).
- 수정 후 습관: 문법 검사(`new Function`으로 script 블록 파싱) → Playwright로 해당 화면 스크린샷 → `sim.js` 10~20판으로 `errs [] 0` 확인 → 커밋·푸시·아티팩트.
- 화면 확인: Playwright로 `http://localhost:8767/` 열고 `document.getElementById('go').click()`로 시작. 특정 화면은 `S.cur={type:'poll'};S.res=null;render()` 식으로 바로 띄움.

## 사용자 선호
- 답변은 한국어. 도트 픽셀 스타일 유지(실사·벡터 거절했음). 화풍은 킹오파 풍.
- "저출생" 대신 "저출산". 실존 정치인 이름·은어(윤심, 용산, 수박 등) 금지, 가상 정당명: 더불어지낸당(jj, 파랑), 시민의힘(sm, 빨강), 무소속(ind, 회색), 신당(np, 주황). 양당 풍자 균형 유지.
- 당대표 막말 같은 부수 피해는 플레이 경험을 해치지 않을 정도로만(현재 연 0.1회 수준).
- 대통령 난이도는 현재 수준 유지.
- 작업 끝나면 커밋·푸시·아티팩트 갱신까지.

## 재미 개선 계획 (2026-11-11 시작, 사용자 승인: 4단계 전부 진행, 단계마다 배포 후 확인)
조사 근거(봇 120판): 한 판 약 450클릭·31~33년, 결정의 48%가 연간 메뉴(c_work/c_promo/c_fund), 최고 직위 도달 중앙값 47~49세 뒤 14년 정체, 엔딩 62~73%가 '원로 은퇴', 이벤트는 거의 즉시 수치만 바꿈.
1. **(완료 2026-11-11) 목표·위험 안내 + 접전 연출**
   - `goalHTML()`/`goalOffice()`: 머리말 아래 🎯 한 줄(다음 선거·나갈 자리·정석 선거 필요 자금·최근 여론조사) + ⚠ 경고(멘탈<25, 야인 6년 이상, 청렴도<30, 연말 운영비 부족 예상). 이후 단계에서 공약 진척·후반 목표도 이 줄에 붙일 것.
   - `riskCol()`: 요약 줄의 멘탈·청렴도 경고색. `TIPS`/`showTip()`: 첫 판 안내(장면별 1회, localStorage `pol-tips`, 시뮬에서는 꺼짐).
   - `tight(share)`: 표시 득표율 압축(격차×√(격차/35)). 당락(50%)과 보전 기준(15%·10%)은 그대로, 중간 격차만 좁힘. 여론조사는 `q.lead`(원래 격차, 판세·공천 계산용)와 `q.dl`(화면 격차)을 따로 둔다. 압승 업적 기준 65→60%(같은 난이도). 라이벌 득표의 '기타 후보' 몫을 0~7로 바꿔 0.5%p 업적이 실제로 가능해짐(전에는 불가능했음).
2. **(완료 2026-11-11) 임기 공약** — 코드에서 `임기 공약` 주석 블록(`PLG_SZ`, `PLG`, `plg*` 함수)
   - 대상: basic·metro·mayor·nat·gov(대통령은 국정과제가 있어 제외, 비례 제외). 선거 `camp` 단계 뒤 `pledge` 단계에서 셋 중 하나(`plgOffer`: 주제 5개 중 3개 × 크기 3종). 낙선하면 사라짐.
   - 크기 `PLG_SZ`: 작은(need 60, 이번 선거 +0, 이행 +3, 파기 −3) / 큰(100, +1, +4.5, −5) / 통 큰(140, +2, +6.5, −8). 주제 `PLG`: dev·law(단체장은 행정 혁신)·care·talk·clean. 이름은 직책군(지방의원/국회의원/단체장)×크기.
   - 진척: `runAct`가 주제에 맞는 활동이면 `plgAct`로 14~18점, 연간 메뉴(c_work·c_promo) 맨 위 "공약에 매달린다"(`plgDv`, 36점 + 관련 역량, 멘탈 −2), c_fund "후원회를 공약 보고회로"(모금 80% + 12점), 임기 2년 차 `plg_<주제>` 이벤트(+30/+12/−15). clean은 `plgYear`에서 해마다 need/4 자동 + 세비 0/15/30% 반납, 검은돈(청렴도 깎이는 tempt·dark 선택) 받으면 `plgBreak`.
   - 평가 `plgEval`: 100% 이행 / 임기 경과분의 절반 미만이면 파기 / 그 사이 영향 없음. `elecBase`에서 대선이 아니면 p에 반영(여론조사에도 반영). `tally`에서 옛 공약 `plgClose`, 당선 시 새 공약 `S.pl`. 누적 `S.plg={n,done,broke}`(엔딩 표시, 업적 plg1·plg3·plgbig·plgx, 4단계 정치 유산 점수에 쓸 것).
   - 화면: 🎯 줄 아래 `plgLine`, 선거 선택 화면 `plgReport`, 선택지 강조 `.plc`, 힌트 `plgHint`.
   - 시뮬: `tools/sim.js` 봇이 공약을 챙긴다(`PLEDGE=ignore`면 무시). 균형 측정 결과는 아래 기준치 참고.
3. **(완료 2026-11-11) 연간 메뉴 변화 + 후일담 이벤트**
   - 올해만 나오는 선택지: `YOP` 21개(work 9·promo 8·fund 4). 조건(위기·여야·다수당·지역 유형·나이·직책·라이벌·대통령 지지율)에 맞는 것 중 메뉴마다 하나를 75% 확률로 끼운다(`yopOpt(m)`, 그해 결과는 `S.yop`에 고정, 직전 것은 `S.yopL`로 제외). 선택지 옵션 `yo:1`이면 "올해만" 배지.
   - 활동 결과 문구: `ATX`/`atx(id)` — 직책군(loc·nat·adm·out·pres)별 문구 + 공통 문구. c_work 제목·본문은 직책별 3종씩.
   - 후일담: `CB` 23개 원본 이벤트(33갈래). 선택 시 `cbMark`가 `S.mem[id]={y,v}`에 기억 → `cbDue()`가 buildQueue에서 최소 햇수 뒤 40%/년, 최대 햇수면 반드시 `cb_<id>` 이벤트를 한 해 하나 넣는다(`S.cbNow`, 본문은 `cbV()`·`ago()` 사용, 누적 `S.cbn`). 봇 기준 한 판 평균 4개.
   - 새 후일담을 추가하려면: `CB`에 원본 id·선택 번호·햇수를 적고 `cb_<id>` 이벤트(core:true, tag:'후일담')를 쓴다. 선택 번호는 원본 이벤트 ch 배열 순서라 원본 선택지 순서를 바꾸면 같이 고쳐야 한다.
   - 균형(120판, 공약 챙기는 봇): 당선율 0.63~0.67, 광역단체장 이상 32판, 대통령 5판(mod 5·smart 0). 도입 전과 같은 수준.
4. **후반 전용 목표 + 엔딩 세분화**: 후계자·계파·정치 유산, '원로 은퇴' 등급화.
단계마다 `tools/sim.js`로 대통령 도달률(mod 약 3%)이 그대로인지 확인.

## 아이디어 목록(아직 안 함)
- 글자 크기 설정, 저장 슬롯 2~3개.
