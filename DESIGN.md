---
version: "2.0"
name: 국민재판소 (Gukmin Court)
description: "익명 심판 커뮤니티의 종이 시스템. 배경은 순백이 아닌 미색 종이(#F4F2EC), 그 위에 흰 서류(#FFFFFF)를 얹고, 글자는 따뜻한 잉크(#17160F)로 쓴다. 색이 붙은 것은 뜻이 있는 것뿐이다 — 유죄 인주 적색, 무죄 먹녹색, 초박빙 황토, 티켓 호박. 강조(accent)를 잉크색으로 둔 것이 이 시스템의 핵심 결정이다: 강조에 채도를 주면 유죄 적색과 신호가 겹쳐 둘 다 약해진다. 다크는 버리지 않고 개표 3초에만 쓴다 — 밝게 읽다가 선고 순간 암전되어야 그게 '선고'로 읽힌다. 한글 본문 기준 행간 1.68~1.75, 자간 -0.3으로 조판했고, 모든 글자색과 채움색은 세 배경(canvas·surface·surface-alt) 전부에서 WCAG AA 4.5:1을 계산으로 검증했다."

colors:
  # 표면 — 미색 종이 위에 흰 서류
  canvas: "#F4F2EC"
  surface-raised: "#FFFFFF"
  surface: "#FFFFFF"
  surface-alt: "#EBE8E0"
  border: "#CFC9BA"
  border-soft: "#E1DCD1"

  # 글자 — 순검정이 아닌 따뜻한 잉크
  ink: "#17160F"
  ink-muted: "#56524A"
  ink-subtle: "#6B665B"

  # 강조 — 채도가 아니라 잉크
  accent: "#17160F"
  accent-dim: "#6B665B"
  accent-soft: "rgba(23,22,15,0.055)"
  on-accent: "#FAF9F5"

  # 정체성 — 인주(印朱). 라이트에서는 하나로 충분하다
  brand: "#B3271B"
  brand-fill: "#B3271B"

  # 의미색
  guilty: "#B3271B"
  guilty-soft: "rgba(179,39,27,0.09)"
  innocent: "#1D6B44"
  innocent-soft: "rgba(29,107,68,0.09)"
  close: "#8F5408"
  close-soft: "rgba(143,84,8,0.09)"
  info: "#23548F"
  purple: "#62479A"
  purple-soft: "rgba(98,71,154,0.08)"
  ticket: "#8A6114"
  ticket-soft: "rgba(138,97,20,0.10)"
  scrim: "rgba(23,22,15,0.45)"

  # 순위
  gold: "#7E5F14"
  silver: "#63656B"
  bronze: "#8A5A32"

  # 관할 법원 6종 — 인쇄 잉크 톤
  court-love: "#A8323F"
  court-work: "#2E4A7D"
  court-family: "#2F6B4F"
  court-friend: "#6B4C8A"
  court-money: "#8A6114"
  court-online: "#1F6B72"

typography:
  display:
    fontSize: 30px
    fontWeight: 800
    lineHeight: 38px
    letterSpacing: -0.9px
  h1:
    fontSize: 23px
    fontWeight: 800
    lineHeight: 32px
    letterSpacing: -0.7px
  h2:
    fontSize: 18px
    fontWeight: 700
    lineHeight: 26px
    letterSpacing: -0.5px
  h3:
    fontSize: 15.5px
    fontWeight: 700
    lineHeight: 22px
    letterSpacing: -0.35px
  body:
    fontSize: 15.5px
    fontWeight: 400
    lineHeight: 26px
    letterSpacing: -0.3px
  read:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: -0.3px
  body-strong:
    fontSize: 15.5px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.35px
  list-title:
    fontSize: 15.5px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: -0.35px
  small:
    fontSize: 13.5px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: -0.2px
  tiny:
    fontSize: 12px
    fontWeight: 500
    lineHeight: 17px
    letterSpacing: -0.1px
  mono:
    fontSize: 13.5px
    fontWeight: 600
    fontVariant: tabular-nums
    letterSpacing: 0px
  doc-no:
    fontSize: 11.5px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.3px
    fontVariant: tabular-nums
  label:
    fontSize: 11px
    fontWeight: 700
    lineHeight: 15px
    letterSpacing: 0.6px

rounded:
  sm: 3px
  md: 6px
  lg: 8px
  xl: 10px
  pill: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  screen: 16px
  row-padding: 12px
  section-gap: 16px

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: 14px 18px
    minHeight: 44px
  button-primary-pressed:
    opacity: 0.85
    scale: 0.99
  button-guilty:
    backgroundColor: "{colors.brand-fill}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  button-innocent:
    backgroundColor: "{colors.innocent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  icon-button:
    size: 40px
    rounded: "{rounded.pill}"
    iconColor: "{colors.ink-muted}"
  icon-button-pressed:
    opacity: 0.5
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-soft}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-pressed:
    backgroundColor: "{colors.accent-soft}"
  facts:
    rowPaddingVertical: 10px
    rowBorderColor: "{colors.border-soft}"
    labelColor: "{colors.ink-muted}"
    valueColor: "{colors.ink}"
    valueTypography: "{typography.mono}"
  section:
    ruleColor: "{colors.border}"
    gap: 10px
  tab:
    activeBorderColor: "{colors.accent}"
    activeBorderWidth: 2px
    inactiveColor: "{colors.ink-subtle}"
    itemMinHeight: 44px
  case-list:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-soft}"
    rounded: "{rounded.lg}"
  case-row:
    paddingVertical: 9px
    paddingLeft: 12px
    borderBottomColor: "{colors.border-soft}"
    titleLines: 1
    metaLines: 1
  stamp:
    borderColor: "{colors.guilty}"
    borderWidth: 2px
    rounded: "{rounded.pill}"
    rotate: -11deg
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    typography: "{typography.read}"
  input-focused:
    borderColor: "{colors.accent}"
  badge-alert:
    backgroundColor: "{colors.brand-fill}"
    textColor: "#FFFFFF"
    size: 16px
    rounded: "{rounded.pill}"
  badge-count:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    size: 16px
    rounded: "{rounded.pill}"
  toast:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
  tab-bar:
    backgroundColor: "{colors.surface-raised}"
    borderTopColor: "{colors.border-soft}"
    height: 68px
  segmented:
    borderBottomColor: "{colors.border-soft}"
    activeBorderColor: "{colors.accent}"
    itemMinHeight: 44px
---

## Overview

**익명 심판 커뮤니티.** 사람들이 자기 흑역사를 올리고 서로에게 유죄·무죄를 선고합니다.

이 시스템의 두 가지 목표:

1. **긴 한글 사연이 편하게 읽힐 것.** 사용자가 이 앱에서 가장 오래 하는 일은 4칸 사연을 읽는 것입니다.
2. **적색과 녹색이 뜻으로 읽힐 것.** 나머지는 전부 그 신호를 방해하지 않도록 물러나 있습니다.

### 왜 다크가 아니라 종이인가

이전 버전은 무채색 다크였고, 그 전은 딥네이비+황동이었습니다. 둘 다 "AI가 만든 티가 난다"는
지적을 받았습니다. 두 번째 지적에서 드러난 것은 **문제가 색이 아니라 매체**라는 점입니다.

| 근거 | 내용 |
|---|---|
| 읽기 | 획이 많은 한글은 어두운 배경에서 halation(흰 글자 번짐)이 라틴보다 심합니다 |
| 은유 | "재판"은 문서의 세계입니다 — 판결문·서류·도장·판례집. 검정 배경은 법정이 아니라 트레이딩 앱의 기호입니다 |
| 관습 | 한국 커뮤니티는 전부 라이트 기본입니다 — 디시·에타·네이트판·더쿠·클리앙 |
| 차별화 | 검정 배경 + 흰 강조 버튼 + 채도 높은 의미색은 현재 AI 생성 UI의 최빈값입니다 |

순백(`#FFFFFF`)이 아니라 **미색 종이(`#F4F2EC`)** 위에 **흰 서류(`#FFFFFF`)** 를 얹습니다.
배경을 순백으로 두면 흰 카드가 배경에 녹아 층이 사라지고, 전부 미색이면 서류가 뜨지 않습니다.

### 다크는 어디로 갔나

버리지 않았습니다. `constants/theme.js`의 `dark` 팔레트로 남아 **개표 3초에만** 쓰입니다
(`app/case/result.js`). 화면 전체가 처음부터 어두우면 개표의 게이지 역전 연출이 배경에 묻힙니다.
밝게 읽다가 불이 꺼지고, 확정되는 순간 조명이 다시 올라와야 그게 **선고**로 읽힙니다.

## Colors

### 왜 강조가 채도색이 아닌가

`accent`는 잉크 `#17160F`입니다. 주 버튼은 **잉크 배경 + 미색 글자**입니다.

강조를 파랑이나 금색으로 두면 유죄 적색과 신호가 경쟁해 둘 다 약해집니다.
강조를 잉크로만 표현하면 **적/녹만 뜻을 갖습니다.**

### 빨강이 하나로 줄었다

다크 시절에는 빨강이 둘이어야 했습니다. 어두운 배경 위 **글자**는 밝아야 하고(`#FF4D57`),
흰 글자를 얹는 **채움**은 어두워야 해서(`#DC2029`) 요구가 정반대였기 때문입니다.

종이 위에서는 이 충돌이 사라집니다. 어두운 인주 빨강 `#B3271B` 하나가 양쪽 모두 통과합니다:

| 용도 | 대비 |
|---|---|
| 종이 배경 위 글자 | 5.82:1 |
| 흰 서류 위 글자 | 6.52:1 |
| 흰 글자를 얹는 채움 | 6.52:1 |

`brand`와 `brand-fill` 토큰은 호출부 호환을 위해 남아 있고 값이 같습니다.
**`dark` 팔레트에서는 여전히 둘로 갈라야 합니다.**

### 대비 (전부 계산으로 검증)

라이트에서 가장 까다로운 배경은 `canvas`가 아니라 **`surface-alt`(`#EBE8E0`)** 입니다.
칩·빈 상태·입력 배경이 이 색이라, 여기서 통과하지 않으면 실사용에서 깨집니다.

| 색 | canvas | surface | surface-alt |
|---|---|---|---|
| `ink` | 16.20 | 18.13 | 14.81 |
| `ink-muted` | 6.94 | 7.77 | 6.35 |
| `ink-subtle` | 5.10 | 5.71 | 4.66 |
| `guilty` | 5.82 | 6.52 | 5.32 |
| `innocent` | 5.79 | 6.48 | 5.30 |
| `close` | 5.45 | 6.11 | 4.99 |
| `ticket` | 4.94 | 5.53 | 4.51 |

**새 색을 추가하면 세 배경 모두에서 4.5:1을 확인하세요.** 채움색은 글자색이 아니라
**채움 기준으로** 계산합니다. `node scripts/check-design.mjs`가 이 문서와 코드를 대조합니다.

### 법원 6색

이전 팔레트는 Tailwind 400번대(`#F472B6` `#A78BFA` `#2DD4BF` …)를 그대로 쓴 것이라
어느 앱에서나 본 색이었습니다. **이게 가장 큰 AI 지문이었습니다.** 인쇄 잉크 톤으로 바꿨고,
6색 전부 세 배경에서 4.5:1을 확인했습니다.

법원 색은 법원을 **길드로 다루는 화면**(법원 탭·대항전·필터·투고 선택)에서만 씁니다.
**사건 목록 행에는 쓰지 않습니다** — 한 화면에 6색이 섞이면 제목이 안 읽힙니다.
목록에서 법원은 말머리 `[직장]`가 나타냅니다.

## Typography

한글 UI 기준입니다. iOS 본문 17pt · Android 최소 16sp를 한글에 맞춰 조정했습니다.

| 항목 | 값 | 이유 |
|---|---|---|
| 본문 | 15.5~16px | 15px 미만은 한글에서 작습니다 |
| 행간 | 155~175% | `body` 1.68 · `read` 1.75 |
| 자간 | -0.3px | 한글은 라틴보다 좁혀야 덩어리로 읽힙니다 |

라틴 기준 행간(1.4~1.5)을 그대로 쓰면 긴 사연이 읽히지 않고, 자간 0은 헐거워 보입니다.
제목은 커질수록 자간을 더 좁힙니다 (`h1` -0.7 → `display` -0.9).

`doc-no`는 사건번호 전용입니다. 서류의 등록번호처럼 읽혀야 하므로 **본문과 반대로 자간을 벌리고**
(`+0.3`) 숫자폭을 고정합니다(`tabular-nums`). 그래야 `2026고합1174`가 목록에서 세로로 정렬됩니다.

글꼴은 시스템 기본(iOS SF Pro / Android Roboto + 한글 대체)을 씁니다.
커스텀 웹폰트를 넣지 않습니다 — 한글 폰트는 무겁고, 시스템 한글 글꼴이 이미 잘 읽힙니다.

### 글자 크기 배율

본문은 시스템 글자 크기를 따릅니다. **고정 높이 안에 들어가야 하는 크롬만** 상한을 겁니다.

- 탭바 라벨 · 배지: `maxFontSizeMultiplier={1.2}`
- 칩 · 말머리 탭: `maxFontSizeMultiplier={1.3}`
- 본문: 상한 없음

## Layout

- **본문 최대 폭 560px**, 전 화면 중앙 정렬. 태블릿·웹에서 글줄이 늘어지지 않게.
- 화면 좌우 여백 16px, 섹션 사이 16px.
- 형제 요소는 `gap`으로 배치합니다 — 개별 `margin`은 무너집니다.

### 목록은 카드가 아니라 행이다

이 앱에서 가장 큰 레이아웃 결정입니다.

이전에는 사건 하나가 `rounded 12 / border 1 / padding 15` 박스였고 제목 + 쟁점 2줄 +
아이콘 메타를 담았습니다. 390px 화면에 **사건이 2.5개** 들어갔습니다.
디시·클리앙·에브리타임은 한 화면에 12~15줄이 뜨고, **그 밀도가 훑어보는 재미의 전부**입니다.

지금은 `CaseList`(흰 서류판)에 `CaseCard`(행)를 쌓습니다:

```
 1 │ [직장] 팀 회식 중간에 말없이 집에 갔습니다              🔖
   │ 2026고합1174 · 1,240표 [96]            3시간 3분
```

- 제목 **1줄 고정**. 행 높이가 전부 같아야 눈이 리듬을 탑니다.
- 메타 **1줄 고정**. 줄바꿈되는 순간 행 높이가 두 배가 되고 밀도가 통째로 무너집니다.
  각 조각에 `numberOfLines={1}`과 `flexShrink: 0`을 **함께** 걸어야 합니다.
- 좌측 열은 "이 행의 신분": 데일리 목록은 순번, 판례집은 확정 도장.

## Elevation & Depth

**그림자를 쓰지 않습니다.** 종이 위에서는 보이긴 하지만, 커뮤니티 목록에 그림자를 깔면
정보가 아니라 위젯으로 읽힙니다. 층은 **표면색과 테두리**로만 만듭니다.

```
canvas #F4F2EC  →  surface #FFFFFF  +  border-soft #E1DCD1
```

`shadow` 토큰은 호출부 호환을 위해 남아 있지만 값이 비어 있습니다. 새 코드에서 쓰지 마세요.

**그라디언트도 쓰지 않습니다.**

## Shapes

| 단계 | 값 | 쓰는 곳 |
|---|---|---|
| `sm` | 3px | 배지 · 도장 각인 · 작은 표식 |
| `md` | 6px | 버튼 · 입력 · 세그먼트 |
| `lg` | 8px | 카드 · 목록판 |
| `xl` | 10px | 큰 카드 (데일리 · 계급) |
| `pill` | 999px | 아이콘 버튼 · 배지 · 도장 |

**서류는 각집니다.** 다크 시절 상한이 14px였는데 종이 시스템에서는 10px로 더 조였습니다.
둥글수록 앱 위젯처럼 보이고, 각질수록 문서처럼 보입니다.

## Components

### 도장 (`components/Stamp.js`)

확정 사건과 확정 판결의 표식입니다. 종이 UI에서 "이 사건은 끝났다"를 알리는 가장 짧은 신호로,
상태 텍스트로만 구분하면 목록을 훑을 때 보이지 않습니다.

**살짝 기울여 찍습니다(-11deg).** 정확히 수평이면 UI 배지로 읽히고, 기울면 "찍힌 것"으로
읽힙니다 — 이 앱에서 그 차이가 정체성입니다.

- `Stamp` — 원형 인장. 사건 상세 표제부, 개표 확정 직후.
- `StampChip` — 납작한 각인. 목록 행처럼 높이가 아까운 자리.

### 사건번호 (`caseNoOf`)

`2026고합1174`. 실제 법원 사건번호 형식이면서 동시에 커뮤니티 게시판의 글번호 역할을 합니다.
사건을 "몇 호 사건"으로 부를 수 있게 되면 공유·검색·언급이 전부 쉬워집니다.
목업은 `data/mock.js`가 들고 있고, 없을 때만 id에서 파생시킵니다(사용자 투고분).

### 말머리

`[연애] [직장] [가족] [우정] [금전] [온라인]` — `COURTS[].short`.
초박빙 사건은 법원 대신 `[초박빙]`을 씁니다(난이도가 더 중요한 정보입니다).
대괄호 말머리는 한국 게시판의 기본 문법이고, 색 알약보다 밀도가 높고 훑기 쉽습니다.

### 표 (`Facts`) — 큰 숫자 대신

**"AI 느낌"의 두 번째 원인이 3열 대형 숫자 블록이었습니다** (`판사 지수 3,310 / 적중률 73% / 판결 수 402`).
대시보드의 대표 부품이고, 정보량은 세 줄인데 화면은 한 화면을 먹습니다.

에브리타임 프로필 · 디시 갤로그 · 클리앙 회원정보는 전부 **표**입니다. 서류도 표입니다.
숫자를 키우는 대신 **오른쪽 끝에 정렬**해서 세로로 읽히게 합니다.

```jsx
<Facts rows={[['판사 지수', '3,310'], ['적중률', '73%'], ['보유 티켓', '46장']]} />
```

값에는 `type.mono`(`tabular-nums`)가 붙어 자릿수가 흔들리지 않습니다.
세 번째 원소로 값의 색을 줄 수 있습니다 — 뜻이 있을 때만 쓰세요.

### 구획 (`Section`) — 상자 대신 괘선

`Card`로 감싸면 흰 상자가 종이 위에 뜹니다. 상자를 세로로 쌓으면
화면이 정보가 아니라 **위젯 묶음**으로 읽힙니다.

`Section`은 제목 + 괘선 + 내용을 **종이 위에 그대로** 놓습니다.
`Card`는 진짜로 떠 있어야 하는 것(배너 · 알림 · 데일리 공고)에만 남깁니다.

### 탭 — 밑줄

세그먼트 컨트롤(둥근 트랙 + 미끄러지는 알약)은 잘 만든 부품이라서 문제였습니다 —
**부품처럼 보입니다.** 네이버 카페 · 에브리타임 · 다음 카페는 전부 밑줄 탭입니다.
활성 항목 아래 잉크 밑줄 하나가 전부입니다.

### 터치 표적 — 최소 44dp

Material 48dp · Apple 44pt · WCAG 2.5.5 44px.

**아이콘만 있는 버튼은 40×40 실제 박스**를 잡습니다 (`IconButton`).
`hitSlop`으로 때우지 마세요:

1. RN Web에서는 `hitSlop`이 적용되지 않습니다.
2. **아이콘을 나란히 두면 hitSlop이 서로 겹칩니다.** 실제로 헤더에서
   북마크(17px)와 메뉴(19px)가 10px 겹쳐, 북마크 오른쪽을 누르면 메뉴가 열렸습니다.

목록 행에서 표적이 행 높이를 먹지 않게 하려면 **음수 세로 마진**으로 흡수시킵니다.

### 누름 상태

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `press.surface` | `accent-soft` 배경 | 카드 · 목록 행 |
| `press.control` | opacity 0.5 | 아이콘 버튼 · 텍스트 링크 |
| `press.cta` | opacity 0.85 + scale 0.99 | 주 행동 버튼 |
| `press.choice` | scale 0.97 | 유죄/무죄처럼 큰 선택지 |

**목록 행은 투명도가 아니라 배경으로 누름을 표현합니다.** 라이트에서 투명도를 낮추면
요소가 배경 쪽으로 **밝아져** "눌렸다"의 반대로 읽힙니다.

### 재사용해야 하는 컴포넌트

| 무엇을 그릴 때 | 무엇을 쓸 것 |
|---|---|
| 사건 목록 | `CaseList` + `CaseCard` |
| 확정 표식 | `Stamp` / `StampChip` |
| 판결문 | `OpinionCard` — 4개 화면이 공유 |
| 사람 이름 | `Avatar` — 닉네임 해시로 색·두 글자 결정 |
| 탭 | `Segmented` (아이콘 없음) |
| 화면 상단 | `ScreenHeader` |
| 아이콘 버튼 | `IconButton` |
| 확인 | `Confirm` (`Alert.alert`은 웹에서 무동작) |
| 알림 | `showToast` |

## Do's and Don'ts

### Do

- 색은 뜻이 있을 때만 씁니다. 강조는 잉크로.
- 새 색은 세 배경(`canvas`·`surface`·`surface-alt`) 모두에서 4.5:1을 계산으로 확인합니다.
- 채움색은 **채움 기준**으로 대비를 계산합니다.
- 목록은 행으로 쌓습니다. 제목 1줄 · 메타 1줄 고정.
- 층은 표면색과 테두리로 만듭니다.
- 터치 표적은 40dp 이상. 아이콘 버튼은 실제 박스로.
- 형제 요소는 `gap`으로 배치합니다.
- 한글 본문은 행간 155% 이상, 자간 -0.3. 사건번호만 자간을 벌립니다.

### Don't

- **`View`에 함수형 style을 넘기지 마세요.** `style={({pressed}) => [...]}` 는
  `Pressable`만 지원합니다. `View`에 넘기면 **에러 없이 통째로 무시돼** 배경이 사라집니다.
- **누를 수 있는 것 안에 누를 수 있는 것을 넣지 마세요.** 웹에서 `<button>` 중첩이 되어
  콘솔 경고가 뜨고, 스크린리더는 바깥 버튼 하나로만 읽습니다. 형제로 두세요
  (사건 행의 북마크가 그래서 행 Pressable 밖에 있습니다).
- **`LayoutAnimation`을 쓰지 마세요.** New Architecture에서 무효이고 경고가 뜹니다.
- **`Alert.alert`을 쓰지 마세요.** RN Web에서 아무것도 띄우지 않습니다.
- **그라디언트·그림자를 쓰지 마세요.**
- **강조에 채도색을 쓰지 마세요.** 유죄·무죄 신호가 묻힙니다.
- **목록 행에 법원 색을 쓰지 마세요.** 말머리가 그 일을 합니다.
- **AI 부품 5종을 쓰지 마세요.** 이 앱에서 "만든 티"의 대부분이 여기서 나왔습니다:
  1. **3열 대형 숫자 스탯** → `Facts`
  2. **게이미피케이션 게이지** → 숫자로 적으세요 (`부장판사까지 2,190점`이 진행바보다 정확합니다).
     뜻이 있는 게이지는 남깁니다 — `VerdictBar`(유죄/무죄)·개표·폼 진행률은 장식이 아니라 데이터입니다
  3. **흰 둥근 카드 쌓기** → `Section` + 괘선
  4. **세그먼트 컨트롤** → 밑줄 탭
  5. **시상대 · 메달 · 정사각 아이콘 타일** → 번호 매긴 목록
- **탭·섹션 제목에 아이콘을 붙이지 마세요.** 한국어 라벨은 이미 두세 글자라 아이콘이
  뜻을 더하지 않고, 셋이 붙으면 탭이 아니라 툴바로 읽힙니다.
- **메타 줄을 두 줄로 흘리지 마세요.** 목록 밀도가 통째로 무너집니다.
- **작은 라벨을 제목 위에 얹지 마세요(eyebrow).** SaaS 랜딩의 문법이고 읽는 순서를 뒤집습니다.
- **죽은 버튼(`onPress={() => {}}`)을 남기지 마세요.** 아무 반응이 없으면
  사용자는 앱이 고장 났다고 판단합니다.
- **화면에서 목업 상수를 스토어 상태와 합치지 마세요.** 사용자의 행동이 반영되지 않습니다.
- Tailwind 기본 팔레트를 그대로 가져오지 마세요. 어느 앱에서나 본 색입니다.

### 키보드 포커스

`focusRing` 토큰: `2px solid #1A4C8F`, offset 2px.

종이 배경 8.1:1 · 흰 서류 9.1:1. 유죄 적색·무죄 녹색과 겹치지 않는 색이라 의미로 오독되지
않습니다. `components/webFocusStyle.js`가 웹에서만 `:focus-visible`을 덮어씁니다.
`:focus`가 아니라 `:focus-visible`이므로 마우스 클릭에는 링이 그려지지 않습니다.

`color-scheme: light`도 여기서 선언합니다 — 안 하면 브라우저가 종이 배경에 검은 스크롤바를 붙입니다.

`app/+html.js`는 정적 렌더링에서만 적용되고 이 앱은 SPA(`web.output: "single"`)이므로
런타임 주입을 씁니다.

## 알려진 공백

- **다크 테마가 없습니다.** 라이트 단일이고, `dark` 팔레트는 개표 화면 전용입니다.
- **네이티브 포커스 표시가 없습니다.** 외장 키보드·스위치 컨트롤 사용자는 웹에서만 링을 봅니다.
