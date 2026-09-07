# 구조

## 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Expo SDK 57, React Native 0.86.3, React 19.2.3 | |
| 라우팅 | expo-router 57 (파일 기반) | `package.json`의 `main`이 `expo-router/entry` |
| 상태 | zustand 5 + `persist` | `store/useApp.js` 하나뿐 |
| 저장 | @react-native-async-storage/async-storage 2.2 | 웹에선 localStorage로 동작 |
| 스타일 | StyleSheet + 자체 토큰 | UI 라이브러리 없음 |
| 기타 | expo-haptics, @expo/vector-icons(Ionicons) | `expo-linear-gradient`는 package.json에 남아 있지만 소스에서 쓰는 곳이 없습니다 |

기획서가 지정한 서버 스택(Spring Boot 3 · PostgreSQL · Redis)은 **미착수**.

## 파일 지도

```
app/                        expo-router — 파일 경로가 곧 URL
  _layout.js                루트 스택 + ToastHost
  (tabs)/_layout.js         하단 5탭 (활성 표시자 + 배지)
  (tabs)/index.js           홈 · 재판소
  (tabs)/archive.js         판례집 (검색 · 7개 코너)
  (tabs)/court.js           법원 (피드 / 대항전 / 소속원)
  (tabs)/ranking.js         랭킹 (리더보드 / 라이벌 / 시즌패스)
  (tabs)/profile.js         프로필 (이중지수 / 판결이력 / 내사건 / 훈장 / 구독)
  case/[id].js              사건 상세 + 3단계 판결 + 판결문   ← 가장 큰 파일
  case/result.js            개표 연출 + 지수 정산 + 랜덤보상 + 공유카드
  case/appeal.js            항소 (티켓 50)
  case/statement.js         피고 최후진술
  write/index.js            사연 투고 4칸 템플릿             ← 두 번째로 큰 파일
  u/[nick].js               배심원 공개 프로필
  notifications.js          알림함
  legal.js                  약관 · 개인정보처리방침 (?doc=eula|privacy)
  +not-found.js             잘못된 주소 (한국어 404)
  court/select.js           법원 선택 · 이적
  onboarding.js             앱 설명 + EULA + 법원 선택
  settings.js  tickets.js  blocked.js  reports.js

components/
  ui.js                     Facts(표), Section(제목+괘선), Rule, Card, SectionTitle,
                            Chip, Button, VerdictBar, ProgressDots, Divider, Empty, Loading
  CaseCard.js               사건 목록 행 + CaseList(흰 서류판). 말머리·사건번호·도장
  OpinionCard.js            판결문 1건 + 반박 스레드  ← 4개 화면이 공유
  Avatar.js                 닉네임 해시 → 색 + 두 글자 "인장" (UserLine 포함)
  Segmented.js              밑줄 탭 (아이콘 없음)
  Stamp.js                  확정 도장 — Stamp(원형 인장) / StampChip(목록용 각인)
  ScreenHeader.js           탭 화면 상단 (제목 + 아래 설명 한 줄 + 우측 액션)
  NotifBell.js              알림 종 + 안읽음 배지
  Confirm.js                확인 대화상자 (Alert.alert 대체)
  ActionSheet.js            하단 시트 — 신고 / 차단 / 삭제 공용
  Toast.js                  하단 토스트 (ToastHost를 _layout에 마운트)
  Skeleton.js               Bone / CaseCardSkeleton / ListSkeleton (행 모양)
  LiveCount.js              불규칙 간격으로 오르는 숫자
  Countdown.js              1초마다 갱신되는 마감 타이머
  useRefresh.js             당겨서 새로고침 공용 훅
  TicketPill.js             티켓 잔액 뱃지

constants/
  theme.js                  colors(종이) · dark(개표 전용) · type · radius · layout · press
  domain.js                 형량 · 계급표 · 교차칭호 · 법원 · 티켓 단가 · 점수 규칙
data/mock.js                목업 전부  ← 서버 연동 시 여기만 교체
store/useApp.js             전역 상태 (zustand + persist)
```

## 라우팅

expt-router는 `app/` 아래 파일 경로를 그대로 URL로 씁니다.
`app/u/[nick].js` → `/u/무죄추정`. 새 화면은 파일만 만들면 잡히지만,
헤더 제목을 주려면 `app/_layout.js`의 `Stack.Screen`에도 등록하세요.

`(tabs)`는 괄호 그룹이라 URL에 들어가지 않습니다 — `app/(tabs)/court.js`는 `/court`.

## 상태

전역 상태는 `store/useApp.js` **하나**입니다. 화면은 셀렉터로 필요한 조각만 구독합니다.

```js
const tickets = useApp((s) => s.tickets);          // 구독
useApp.getState().showToast('...', 'ok');          // 구독 없이 호출
```

`persist` 미들웨어로 AsyncStorage에 저장됩니다. 저장 대상은 `partialize`에 나열돼 있고,
토스트나 진행 중인 판결 단계처럼 한 세션에서만 의미 있는 값은 빼뒀습니다.

**데일리 롤오버** — 저장이 생기면서 "오늘의 5건"이 영원히 소진된 채로 남는 문제가 따라왔습니다.
`courtDay()`가 09:00을 기준으로 회차 날짜를 계산하고, `rolloverDaily()`가 회차가 바뀌었을 때
`judged`만 비웁니다. 앱을 켜둔 채 09:00을 넘기는 경우를 위해 홈에서 `useFocusEffect`로도 확인합니다.
티켓 · 구독 · 판결문 같은 누적분은 건드리지 않습니다.

## 저장본은 믿지 않는다

`persist`의 `merge`가 저장된 모든 필드를 기대 타입으로 검증합니다. 지우지 마세요.

앱 버전이 올라가 구조가 바뀌거나 쓰기가 끊기면 **JSON은 멀쩡한데 타입만 틀린 값**이
들어옵니다. zustand는 깨진 JSON만 잡고 이건 통과시킵니다. 그대로 쓰면
`judged[id]` 접근이 렌더 도중 던져 **콘솔 에러 없이 화면이 백지**가 됩니다.

새 필드를 `partialize`에 추가하면 `merge`의 검증 목록에도 넣으세요.

```js
const rec = (v, fb) => (v && typeof v === 'object' && !Array.isArray(v) ? v : fb);
const arr = (v, fb) => (Array.isArray(v) ? v : fb);
const num = (v, fb) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
```

## 단일 출처 원칙

**화면에서 목업 상수를 스토어 상태와 합치지 마세요.**
같은 실수를 세 번 했습니다.

| 화면 | 증상 |
|---|---|
| `blocked.js` | 시드 사용자를 차단 해제해도 목록에 다시 나타남 |
| `reports.js` | 목업 1건이 항상 섞여 빈 상태가 절대 안 나옴 |
| `profile.js` 판결 이력 | 판결해도 목업 3건 그대로 |

시드가 필요하면 **스토어 초기값**으로 넣고(`blockedSeed`, `reportSeed`),
화면은 스토어만 읽으세요. 사용자 행동으로 늘어나는 것은 스토어에 배열로
두고(`myPosts`) 목업 앞에 붙입니다.

원칙: **화면이 사용자의 행동을 반영하지 못하면 앱이 고장 난 것처럼 보입니다.**
새 기능을 넣을 때 "이 행동을 하면 어느 화면이 바뀌어야 하나"를 먼저 적어보세요.

## 화면이 약속한 것은 지켜야 한다

UI에 "1일 3회", "시즌당 1회"라고 써놓고 코드로 막지 않은 곳이 세 군데 있었습니다.
광고는 무한히 눌러 티켓을 얻을 수 있었습니다.

일일 한도는 `store.claims`(`{ day, attend, ads }`)로 관리하고,
`claimsToday()`가 `courtDay()`와 비교해 회차가 바뀌면 초기화된 값을 돌려줍니다.
새 보상을 추가하면 여기에 같이 넣으세요 — 화면에 문구만 쓰면 지켜지지 않습니다.

**죽은 버튼(`onPress={() => {}}`)을 남기지 마세요.** 눌러도 아무 반응이 없으면
사용자는 앱이 고장 났다고 판단합니다. 아직 붙일 기능이 없으면 최소한 토스트로
"준비 중"이라고 알려주세요.

## 탭 화면 관습

- **활성 탭 재탭 → 맨 위로**: `useScrollToTop`(expo-router)에 ScrollView ref를 넘깁니다.
  다섯 탭 모두 적용돼 있으니 새 탭을 만들면 같이 붙이세요.
- **당겨서 새로고침**: `components/useRefresh.js` 훅.
- **배지**: 안 읽은 알림은 `colors.brand`(인주 적색), 남은 할 일 개수는 `colors.accent`(잉크).
  둘을 같은 색으로 쓰면 개수가 안 읽은 알림처럼 읽힙니다.
