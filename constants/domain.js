import { colors } from './theme';

/** 형량 5단계 (기획서 04) */
export const SENTENCES = [
  { level: 1, name: '훈방', nuance: '그럴 수도 있지' },
  { level: 2, name: '벌금형', nuance: '좀 잘못했네' },
  { level: 3, name: '집행유예', nuance: '확실히 잘못' },
  { level: 4, name: '실형', nuance: '많이 심함' },
  { level: 5, name: '무기징역', nuance: '인간이 아님' },
];

/** 폐급 계급표 (기획서 03) */
export const GUILT_TIERS = [
  { min: 0, max: 14, name: '성인군자', desc: '심판대에 섰으나 흠 없이 내려옴', color: colors.innocent },
  { min: 15, max: 29, name: '모범시민', desc: '대체로 무죄', color: '#3A6E3A' },
  { min: 30, max: 44, name: '경고누적', desc: '애매한 인간', color: '#5E6B24' },
  { min: 45, max: 54, name: '집행유예', desc: '반반의 갈림길', color: colors.close },
  { min: 55, max: 69, name: '전과자', desc: '유죄가 더 많음', color: '#9A4715' },
  { min: 70, max: 84, name: '상습범', desc: '반복적으로 유죄', color: '#A5341F' },
  { min: 85, max: 94, name: '폐급', desc: '만장일치급', color: colors.guilty },
  { min: 95, max: 100, name: '인간말종', desc: '명예의 전당 (본인만 열람)', color: '#7E140D' },
];

export const guiltTier = (v) =>
  GUILT_TIERS.find((t) => v >= t.min && v <= t.max) ?? GUILT_TIERS[0];

/** 판사 계급표 (기획서 03) */
export const JUROR_TIERS = [
  { min: 0, max: 199, name: '방청객', note: '' },
  { min: 200, max: 599, name: '예비배심원', note: '' },
  { min: 600, max: 1499, name: '배심원', note: '' },
  { min: 1500, max: 2999, name: '배심원장', note: '' },
  { min: 3000, max: 5499, name: '판사', note: '상위 20%' },
  { min: 5500, max: 8999, name: '부장판사', note: '상위 5%' },
  { min: 9000, max: Infinity, name: '대법관', note: '상위 1%' },
];

export const jurorTier = (v) =>
  JUROR_TIERS.find((t) => v >= t.min && v <= t.max) ?? JUROR_TIERS[0];

export const nextJurorTier = (v) => {
  const i = JUROR_TIERS.findIndex((t) => v >= t.min && v <= t.max);
  return JUROR_TIERS[i + 1] ?? null;
};

/** 교차 칭호 (기획서 03) */
export function crossTitle(guilt, juror) {
  if (guilt >= 85 && juror >= 9000) return '타락한 재판관';
  const g = guilt >= 55;
  const j = juror >= 3000;
  if (!g && j) return '청렴결백';
  if (!g && !j) return '평범한 시민';
  if (g && j) return '내로남불';
  return '구제불능';
}

/**
 * 법원 6종 (기획서 02)
 *
 * `short`는 목록 말머리다 — `[직장] 팀 회식 중간에...` 처럼 쓴다.
 * 한국 커뮤니티 게시판(디시·클리앙·보배드림)의 기본 문법이고,
 * 카드마다 색 알약을 붙이는 것보다 밀도가 높고 훑기 쉽다.
 *
 * `color`는 법원을 "길드"로 다루는 화면(법원 탭·대항전·필터)에서만 쓴다.
 * 목록 행에는 쓰지 않는다 — 한 화면에 6색이 섞이면 제목이 안 읽힌다.
 *
 * 이전 팔레트는 Tailwind 400번대(#F472B6 #A78BFA #2DD4BF …)를 그대로 쓴 것이라
 * 어느 앱에서나 본 색이었다. 인쇄 잉크 톤으로 바꿔 종이 배경과 결을 맞췄고,
 * 6색 전부 bg·surface·surfaceAlt에서 4.5:1을 계산으로 확인했다.
 */
export const COURTS = [
  { id: 'love', name: '연애지법', short: '연애', icon: 'heart', color: '#A8323F' },
  { id: 'work', name: '직장지법', short: '직장', icon: 'briefcase', color: '#2E4A7D' },
  { id: 'family', name: '가족지법', short: '가족', icon: 'home', color: '#2F6B4F' },
  { id: 'friend', name: '우정지법', short: '우정', icon: 'people', color: '#6B4C8A' },
  { id: 'money', name: '금전지법', short: '금전', icon: 'cash', color: '#8A6114' },
  { id: 'online', name: '온라인지법', short: '온라인', icon: 'globe', color: '#1F6B72' },
];

export const courtById = (id) => COURTS.find((c) => c.id === id) ?? COURTS[0];

/**
 * 사건번호. `2026고합1174` — 실제 법원 사건번호 형식이면서
 * 동시에 커뮤니티 게시판의 글번호 역할을 한다.
 * 사건을 "몇 번 사건"으로 부를 수 있게 되면 공유·검색·언급이 전부 쉬워진다.
 *
 * 서버가 붙으면 이 값은 서버가 발번한다. 목업에서는 `data/mock.js`가 들고 있고,
 * 없을 때만 여기서 파생시킨다(사용자 투고분).
 */
export const CASE_NO_PREFIX = '고합';
export const caseNoOf = (c) =>
  c?.caseNo ?? `${new Date().getFullYear()}${CASE_NO_PREFIX}${String(
    Math.abs([...String(c?.id ?? '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) % 9000 + 1000
  )}`;

/** 판사 지수 획득 규칙 (기획서 03) */
export const SCORE_RULES = [
  { label: '다수의견 적중', value: '+10' },
  { label: '형량 정밀 (평균과 차이 1 이내)', value: '+5' },
  { label: '선구안 (마감 전 50% 이내 투표 후 적중)', value: '×1.5' },
  { label: '초박빙 사건 적중 (유죄율 45~55%)', value: '+20' },
  { label: '만장일치 사건 적중', value: '+2' },
  { label: '판결문 추천 획득', value: '+3' },
  { label: '데일리 5건 완주', value: '+15' },
  { label: '7일 연속 출석', value: '+50' },
  { label: '오답', value: '감점 없음' },
];

/** 티켓 소모 (기획서 05) */
export const TICKET_COST = { verdict: 1, peek: 3, appeal: 50 };

/** 사건 상태 (기획서 04) */
export const CASE_STATUS = {
  review: { label: '검수대기', color: colors.textMuted },
  open: { label: '공판중', color: colors.accent },
  counting: { label: '개표', color: colors.info },
  closed: { label: '확정', color: colors.textMuted },
  statement: { label: '최후진술', color: colors.purple },
  appeal: { label: '항소중', color: colors.close },
  void: { label: '무효', color: colors.textFaint },
};

/** 난이도 = 데일리 5건 세션 설계 (기획서 06) */
export const DIFFICULTY = {
  easy: { label: '쉬움', color: colors.innocent },
  normal: { label: '보통', color: colors.info },
  close: { label: '초박빙', color: colors.close },
  twist: { label: '반전 사연', color: colors.purple },
};
