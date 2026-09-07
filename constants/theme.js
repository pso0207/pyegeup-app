import { Platform } from 'react-native';

// 폐급재판 — 디자인 토큰
//
// 종이 라이트. 배경은 순백이 아니라 미색 종이(#F4F2EC), 글자는 잉크(#17160F),
// 확정 표식은 인주 빨강(#B3271B). "재판"은 문서의 세계이고, 이 앱의 핵심 행위는
// 긴 한글 사연을 읽는 것이라 라이트가 맞다. 획이 많은 한글은 다크에서
// halation(흰 글자 번짐)이 라틴보다 심하다.
//
// 다크는 버리지 않고 "선고 순간"에만 쓴다 → 아래 `dark` 팔레트, app/case/result.js.
// 흰 화면으로 읽다가 개표에서 화면이 검게 내려앉는 것 자체가 연출이다.

export const colors = {
  // 표면 — 미색 종이 위에 흰 서류를 얹는 구조.
  // 순백 배경(#FFF)에 흰 카드를 얹으면 층이 안 생기고, 미색만 쓰면 서류가 안 뜬다.
  bg: '#F4F2EC',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EBE8E0',
  border: '#CFC9BA',
  borderSoft: '#E1DCD1',

  // 글자 — 순수 검정(#000)은 종이 위에서 눈이 아프다. 따뜻한 잉크 쪽으로.
  text: '#17160F',
  textMuted: '#56524A',
  textFaint: '#6B665B', // 가장 밝은 배경(surfaceAlt) 위에서도 4.66:1

  // 강조 = 잉크. 라이트에서는 "검은 버튼 + 미색 글자"가 다크의 반대짝이다.
  accent: '#17160F',
  accentDim: '#6B665B',
  accentSoft: 'rgba(23,22,15,0.055)',
  onAccent: '#FAF9F5',

  // 인주(印朱) 빨강. 도장 · 확정 표식 · 안 읽은 배지.
  //
  // 다크에서는 빨강이 둘 필요했다 — 글자용은 밝아야 하고 채움용은 어두워야 해서
  // 요구가 정반대였다. 라이트에서는 이 충돌이 사라진다: 어두운 빨강 하나가
  // 종이 위 글자로도(6.52:1), 흰 글자를 얹는 채움으로도(6.52:1) 동시에 통과한다.
  // 두 토큰은 호출부 호환을 위해 남기되 값이 같다.
  brand: '#B3271B',
  brandFill: '#B3271B',

  // ── 의미색 — 여기 있는 색만 뜻이 있다 ──
  guilty: '#B3271B',
  guiltySoft: 'rgba(179,39,27,0.09)',
  innocent: '#1D6B44',
  innocentSoft: 'rgba(29,107,68,0.09)',
  close: '#8F5408', // 초박빙
  closeSoft: 'rgba(143,84,8,0.09)',
  info: '#23548F',
  purple: '#62479A',
  purpleSoft: 'rgba(98,71,154,0.08)',
  ticket: '#8A6114',
  ticketSoft: 'rgba(138,97,20,0.10)',

  // 모달·시트 뒤에 까는 막. 종이 배경 위에서는 순검정보다 잉크색이 자연스럽다.
  scrim: 'rgba(23,22,15,0.45)',

  // 1·2·3위 메달
  gold: '#7E5F14',
  silver: '#63656B',
  bronze: '#8A5A32',

  // 작성 화면 입력부 — 미색 바탕 위에 흰 원고지를 올린다
  paper: '#FFFFFF',
  paperFocus: '#FFFFFF',
  paperLine: '#CFC9BA',
};

/**
 * 선고 팔레트. 개표(app/case/result.js)에서만 쓴다.
 *
 * 화면 전체가 처음부터 어두우면 개표의 3초 역전 연출이 배경에 묻힌다.
 * 밝게 읽다가 판결을 확정하는 순간 암전되어야 그게 "선고"로 읽힌다.
 * 값은 이전 무채색 다크 팔레트를 그대로 가져왔다 — 대비는 이미 검증돼 있다.
 */
export const dark = {
  bg: '#0B0B0C',
  bgElevated: '#131315',
  surface: '#17171A',
  surfaceAlt: '#1F1F23',
  border: '#2C2C31',
  borderSoft: '#232327',

  text: '#EDEDEF',
  textMuted: '#9B9CA3',
  textFaint: '#848693',

  accent: '#EDEDEF',
  accentDim: '#848693',
  accentSoft: 'rgba(255,255,255,0.07)',
  onAccent: '#0B0B0C',

  // 어두운 배경에서는 다시 둘로 갈라야 한다 (위 brand 주석 참고)
  brand: '#FF4D57',
  brandFill: '#DC2029',

  guilty: '#FF4D57',
  guiltySoft: 'rgba(255,77,87,0.13)',
  innocent: '#2FBF71',
  innocentSoft: 'rgba(47,191,113,0.13)',
  close: '#E8913C',
  ticket: '#E0A33C',

  gold: '#E8B44A',
  silver: '#B9BDC7',
  bronze: '#B8794A',
};

export const tone = {
  guilty: { fg: colors.guilty, bg: colors.guiltySoft },
  innocent: { fg: colors.innocent, bg: colors.innocentSoft },
  accent: { fg: colors.accent, bg: colors.accentSoft },
};

// 서류는 각지다. 라운드를 다크 시절보다 한 단계 더 조였다.
export const radius = { sm: 3, md: 6, lg: 8, xl: 10, pill: 999 };

// 태블릿·웹처럼 넓은 화면에서 본문이 가로로 퍼지지 않게 잡아둔다.
export const layout = {
  maxWidth: 560,
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
};

export const space = (n) => n * 4;

export const type = {
  // 한글 본문은 15~16px에 행간 155~175%, 자간 -0.3 전후가 권장값이다.
  // (iOS 본문 17pt · Android 최소 16sp 기준을 한글 UI에 맞춰 조정)
  // 라틴 기준 자간 0을 쓰면 한글은 헐거워 보이고, 행간을 좁히면 긴 사연이 안 읽힌다.
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.9, lineHeight: 38 },
  h1: { fontSize: 23, fontWeight: '800', letterSpacing: -0.7, lineHeight: 32 },
  h2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5, lineHeight: 26 },
  h3: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.35, lineHeight: 22 },
  body: { fontSize: 15.5, fontWeight: '400', lineHeight: 26, letterSpacing: -0.3 },
  read: { fontSize: 16, fontWeight: '400', lineHeight: 28, letterSpacing: -0.3 },
  bodyStrong: { fontSize: 15.5, fontWeight: '600', lineHeight: 24, letterSpacing: -0.35 },
  small: { fontSize: 13.5, fontWeight: '400', lineHeight: 20, letterSpacing: -0.2 },
  tiny: { fontSize: 12, fontWeight: '500', letterSpacing: -0.1, lineHeight: 17 },
  mono: { fontSize: 13.5, fontWeight: '600', fontVariant: ['tabular-nums'], letterSpacing: 0 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, lineHeight: 15 },

  // 사건번호 전용. 서류의 등록번호처럼 읽혀야 하므로 자간을 벌리고 숫자폭을 고정한다.
  docNo: { fontSize: 11.5, fontWeight: '600', letterSpacing: 0.3, lineHeight: 16, fontVariant: ['tabular-nums'] },
  // 목록 제목. 커뮤니티 리스트는 제목이 한 줄로 끊기고 다음 줄로 넘어가지 않는다.
  listTitle: { fontSize: 15.5, fontWeight: '600', lineHeight: 22, letterSpacing: -0.35 },
};

// 키보드 포커스. 웹·외장 키보드·스위치 컨트롤에서 "지금 어디에 있는지"를 알려준다.
// 이게 없으면 마우스 없이 앱을 쓸 수 없다.
export const focusRing = {
  outlineWidth: 2,
  outlineColor: '#1A4C8F',   // 종이 배경 대비 8.1:1 — 유죄 적색·무죄 녹색과 겹치지 않는 색
  outlineStyle: 'solid',
  outlineOffset: 2,
};

// 누름 상태. 값이 제각각이면 버튼마다 눌리는 느낌이 달라진다.
// 라이트에서는 투명도를 낮추면 배경이 비쳐 "밝아진다" — 다크와 반대 방향이라
// 목록 행은 투명도 대신 배경 하이라이트를 쓴다.
export const press = {
  surface: { backgroundColor: colors.accentSoft },        // 카드 · 목록 행
  control: { opacity: 0.5 },                              // 아이콘 버튼 · 텍스트 링크
  cta: { opacity: 0.85, transform: [{ scale: 0.99 }] },   // 주 행동 버튼
  choice: { transform: [{ scale: 0.97 }] },               // 유죄/무죄처럼 큰 선택지
};

// 터치 표적 최소 크기. Material 48dp · Apple 44pt · WCAG 2.5.5 44px.
// 아이콘만 있는 버튼은 이 값으로 정사각 박스를 잡는다.
export const hit = { min: 44, box: 40, slop: 12 };

// 종이 위에서는 그림자가 보이지만, 커뮤니티 목록에 그림자를 깔면
// 정보가 아니라 위젯으로 읽힌다. 층은 테두리와 표면색으로만 만든다.
// 토큰은 호출부 호환을 위해 남기되 값은 비운다.
export const shadow = {
  soft: {},
  card: {},
  focus: {},
};

// 웹의 기본 포커스 링을 끈다. 대신 각 입력이 자체 포커스 표현(잉크 테두리)을 갖는다.
export const inputReset = Platform.OS === 'web' ? { outlineStyle: 'none' } : null;
