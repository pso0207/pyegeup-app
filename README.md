# 폐급재판 — 프론트엔드 (React Native / Expo)

> 문서는 [`docs/`](docs/)에 있습니다. 작업을 이어받는다면 [docs/HANDOFF.md](docs/HANDOFF.md)부터.
> Java Spring Boot + MySQL은 [`실습 N 시작해줘` 방식의 프로젝트 코스](docs/learning/PRACTICE-PROJECT.md)로 시작하고, 전체 코드는 [백엔드 참고서](docs/BACKEND-TUTORIAL.md)에서 찾으세요.

`폐급재판_기획서_v1.0.pdf` 기준으로 만든 **UI 전용** 앱입니다. 서버·DB·인증·결제는 붙어 있지 않고,
모든 데이터는 `data/mock.js`의 목업과 `store/useApp.js`의 로컬 상태로 동작합니다.

## 실행

```bash
npm install
npx expo start        # QR 스캔 → Expo Go
npx expo start --ios  # iOS 시뮬레이터
```

## 웹 배포

- 서비스: https://pso0207.github.io/pyegeup-app/
- 저장소: https://github.com/pso0207/pyegeup-app
- `main` 브랜치에 푸시하면 GitHub Actions가 Expo 웹 빌드를 생성해 GitHub Pages에 자동 배포합니다.

## 화면 구성 (기획서 07)

| 경로 | 화면 | 구현된 기획 항목 |
|---|---|---|
| `app/(tabs)/index.js` | 홈 · 재판소 | 오늘의 재판 진행·완주 보상, 다음 판결 CTA, 오늘/토론/종결 목록, 첫 이용 안내, 사연 투고 |
| `app/case/[id].js` | 사건 상세 · 판결 | 4칸 템플릿 열람, 3단계 판결 플로우(유죄·무죄 → 형량 → 판결문), 형량 단계별 햅틱, 판결문 탭(추천순/유죄 측/무죄 측), 투표 전 판결문 잠금 |
| `app/case/result.js` | 개표 | 짧은 결과 공개와 건너뛰기, 판사 지수 정산 내역, 랜덤 보상(88/10/2%), 공유 카드 |
| `app/case/appeal.js` | 항소 | 티켓 50 소모, 소명문 300자, 재심 규칙 |
| `app/(tabs)/archive.js` | 판례집 | 검색·법원 필터, 화제의 재판 / 초박빙 / 명예의 전당 / 억울함의 전당 / 명판결 |
| `app/(tabs)/court.js` | 법원 | 내 법원 피드, 주간 대항전 순위, 소속원 랭킹, 이적 |
| `app/(tabs)/ranking.js` | 랭킹 | 시즌 리더보드, 계급표, 획득 규칙, 라이벌 대결, 시즌 패스 + 명판사 패스 페이월 |
| `app/(tabs)/profile.js` | 내 프로필 | 이중 지수, 교차 칭호, 판결 이력 / 내 사건 / 훈장, 폐급 계급표 |
| `app/write/index.js` | 사연 투고 | 4칸 강제 템플릿, 글자수 검증, 실시간 차단 필터(실명·회사·학교·연락처), 본인 사연 확인 |
| `app/settings.js` | 설정 | 알림, 차단·신고 내역, EULA, 구매 복원, 계정 삭제 |
| `app/case/statement.js` | 최후진술 | 확정 후 48시간 내 1회, 300자, 배심원 전원 알림 |
| `app/blocked.js` | 차단 목록 | 차단 해제 |
| `app/reports.js` | 신고 내역 | 접수 상태 확인 |
| `app/onboarding.js` | 온보딩 | 30초 참여 방법, EULA 동의, 첫 소속 법원 선택, 재방문 안내 |
| `app/tickets.js` | 티켓 | 획득 경로 / 소모표, 리워드 광고 |
| `app/notifications.js` | 알림함 | 내 사건 / 커뮤니티 / 운영 필터, 읽음 처리, 안읽음 배지 |
| `app/u/[nick].js` | 배심원 공개 프로필 | 계급·적중률·전문 법원·대표 판결문·훈장, 구독 / 차단 / 신고 |

## 커뮤니티 레이어

익명 심판 게임 위에 "사람이 있는 곳"으로 느껴지게 하는 층을 따로 뒀다.

| 기능 | 어디에 있나 |
|---|---|
| 인장 아바타 | `components/Avatar.js` — 닉네임 해시로 색·두 글자를 정해, 같은 사람은 어느 화면에서든 같은 인장 |
| 배심원 공개 프로필 | `app/u/[nick].js` — 판결문 작성자·랭킹 행·활동 피드 어디서든 눌러 들어간다 |
| 구독 | 프로필에서 구독 → 판례집 `구독 배심원` 코너 + 프로필 `구독` 탭 + 판결문 카드의 `구독` 표식 |
| 반박(1단계 대댓글) | `components/OpinionCard.js` — 스레드가 깊어지면 익명 커뮤니티는 싸움만 길어져 1단계로 끊었다 |
| 알림함 | `app/notifications.js` + `components/NotifBell.js` (홈·프로필 헤더, 탭바 배지) |
| 활동 피드 | 법원 피드 상단 — 같은 법원 사람들이 활동 중이라는 신호 |
| 스크랩 | 사건 카드/상세의 책갈피 → 판례집 `내 스크랩` 코너 |
| 말머리 · 사건번호 | `constants/domain.js` — `COURTS[].short`, `caseNoOf()` |
| 확정 도장 | `components/Stamp.js` — 사건 상세 표제부 · 판례집 목록 · 개표 확정 |

## 코드 구조

```
constants/theme.js    색·타이포·라운드 등 디자인 토큰 (종이 라이트 + 개표 전용 dark 팔레트)
constants/domain.js   형량 5단계, 폐급/판사 계급표, 교차 칭호, 법원 6종, 티켓 단가
data/mock.js          사건·판결문·랭킹·훈장·신고사유 목업  ← 서버 연동 시 이 파일만 교체
store/useApp.js       티켓, 판결 진행, 신고·차단·삭제, 구독, 스크랩, 알림, 토스트 (zustand + persist)
components/           CaseCard(+CaseList), Stamp, OpinionCard, Avatar, Segmented, ScreenHeader,
                      NotifBell, Confirm, Skeleton, useRefresh, TicketPill, Countdown,
                      Toast, ActionSheet, ui.js(Facts/Section/Rule/Card/Button/…)
```

### 상태 저장

`store/useApp.js`는 `zustand/middleware`의 `persist`로 AsyncStorage(웹에선 localStorage)에 저장된다.
티켓·구독·스크랩·차단·판결 이력은 앱을 껐다 켜도 남고, 토스트나 진행 중인 판결 단계처럼
한 세션에서만 의미 있는 값은 `partialize`에서 빼 저장하지 않는다.

## UI 원칙

- **한글 가독성** — 본문 행간을 1.65~1.75로 잡았다(`type.body` / `type.read`). 라틴 기준 행간을 그대로 쓰면 한글은 빽빽해 읽히지 않는다.
- **종이 위의 재판** — 미색 종이(`#F4F2EC`) 위에 흰 서류를 얹고 잉크로 쓴다. 이 앱에서 제일 오래 하는 일이 긴 한글 사연을 읽는 것이라 라이트가 맞고, "재판"은 문서의 세계다.
- **선고 순간만 암전** — 결과를 확인하는 짧은 순간에만 화면이 어두워지고 바로 건너뛸 수 있다(`app/case/result.js` + `theme.dark`).
- **목록은 읽기 쉬운 단위로 분리** — 홈은 흰 사건 카드, 판례집은 압축된 목록 행을 사용한다. 긴 제목은 두 줄까지 읽고 메타 정보는 다음 줄에서 확인한다.
- **말머리 · 사건번호 · 도장** — `[직장]` 말머리, `2026고합1174` 사건번호, 확정 사건에 -11도로 기울여 찍는 도장. 게시판의 문법과 법원의 문법을 겹쳐 놓은 것이 이 앱의 정체성이다.
- **읽기와 쓰기를 분리** — 사건 상세는 표제부(사건번호 + 괘선) 아래 4칸을 흐르게 배치하고 쟁점만 따로 세운다. 작성 화면은 흰 원고지(`colors.paper`)를 올리고 포커스 시 잉크 테두리로 바꾼다.
- **넓은 화면 대응** — 모든 화면이 `layout.content`(최대 560px)로 가운데 정렬된다. 태블릿·웹에서 글줄이 가로로 늘어지지 않는다.
- **피드백은 토스트로** — 신고·차단·티켓 소모 등은 Alert 대신 하단 토스트(`components/Toast.js`)로 알린다. 흐름이 끊기지 않는다.
- **피드백은 토스트, 확인은 Confirm** — `Alert.alert`은 RN Web에서 아무것도 띄우지 않아 계정 삭제·항소 같은
  되돌릴 수 없는 동작이 웹에서 조용히 무시됐다. `components/Confirm.js`로 전부 대체했고, 코드에 `Alert`은 남아 있지 않다.
- **접근성** — 모든 버튼·탭·게이지에 `accessibilityRole`과 한국어 라벨을 부여했다.

## 서버 연동 시 손댈 곳

1. `data/mock.js` → TanStack Query 훅으로 교체 (엔티티명은 기획서 08 데이터 모델과 동일하게 맞춰둠)
2. `store/useApp.js`의 `submitVerdict` → `POST /cases/{id}/verdicts`
3. `app/case/result.js`의 지수 산식 → 서버 응답값 사용 (현재는 클라이언트에서 기획서 산식대로 계산)
4. `app/write/index.js`의 `PATTERNS` 정규식 → 서버 필터와 동일 규칙 유지 (OTA로 수정 가능한 위치)

## 스토어 심사 필수 세트 (기획서 10)

| 항목 | 위치 |
|---|---|
| EULA 강제 동의 | `app/onboarding.js` |
| 자동 콘텐츠 필터 | `app/write/index.js`의 `PATTERNS` |
| 모든 게시물·판결문 신고 버튼 | 사건 상세 헤더 ⋯, 판결문 카드 ⋯ |
| 유저 차단 | 사건 메뉴 → 차단, `app/blocked.js` |
| 본인 게시물 즉시 삭제 | 프로필 → 내 사건 → ⋯ → 삭제 |
| 앱 내 문의 이메일 / 계정 삭제 / 구매 복원 | `app/settings.js` |

## 미구현 (의도적)

백엔드 전체(서버·DB·인증·결제·푸시), 어드민 웹, 실제 광고 SDK, 이미지 업로드(기획서상 텍스트 전용).
프론트는 목업 데이터로만 돌아간다.
