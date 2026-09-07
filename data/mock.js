import { colors } from '../constants/theme';

// 프론트 전용 목업 데이터. 서버 붙일 때 이 파일만 API 응답으로 교체하면 된다.

export const me = {
  id: 'u_me',
  nickname: '익명의피고인_4821',
  courtId: 'love',
  guiltIndex: 78,
  guiltCaseCount: 7,
  jurorScore: 3240,
  jurorPercentile: 18,
  accuracy: 71,
  streak: 12,
  innocenceMedals: 2,
  ticketBalance: 46,
  season: 3,
  lastSeasonTier: '부장판사 (시즌 2)',
};

export const dailyPicks = ['c1', 'c2', 'c3', 'c4', 'c5'];

export const cases = {
  c1: {
    id: 'c1',
    caseNo: '2026고합1174',
    courtId: 'work',
    author: '익명의피고인_1174',
    title: '팀 회식 중간에 말없이 집에 갔습니다',
    situation:
      '지난주 금요일 밤 10시, 팀 회식 2차 노래방에서 있었던 일입니다. 다음날 오전에 개인 일정이 잡혀 있었고 1차에서 이미 3시간을 앉아 있던 상태였습니다.',
    action:
      '팀장님이 화장실 간 사이에 아무에게도 말하지 않고 코트만 챙겨서 조용히 나왔습니다. 다음날 아침에 단톡방에 "어제 몸이 안 좋아 먼저 갔습니다"라고 한 줄 남겼습니다.',
    reaction:
      '팀장님은 읽고 답이 없었고, 사수 선배가 개인 톡으로 "너 어제 그렇게 가면 어떡하냐"고 했습니다. 월요일에 팀 분위기가 서늘했습니다.',
    issue: '말없이 회식 자리를 이탈한 것이 유죄인가요?',
    difficulty: 'easy',
    voteCount: 1240,
    guiltyRate: 0.31,
    avgSentence: 2.1,
    closesInMin: 184,
    status: 'open',
    opinionCount: 96,
  },
  c2: {
    id: 'c2',
    caseNo: '2026고합9032',
    courtId: 'love',
    author: '익명의피고인_9032',
    title: '여자친구 생일에 기프티콘만 보냈습니다',
    situation:
      '연애 8개월 차, 여자친구 생일이 평일이었습니다. 저는 그 주에 프로젝트 마감이라 야근이 이어지고 있었습니다.',
    action:
      '당일 아침 00시에 카톡으로 케이크 기프티콘 하나와 "생일 축하해 사랑해"를 보냈고, 주말에 보자고 했습니다. 따로 선물은 준비하지 않았습니다.',
    reaction:
      '여자친구는 "고마워"라고만 답했고 그날 하루 종일 연락이 없었습니다. 주말 약속도 자기가 피곤하다며 미뤘습니다.',
    issue: '바쁘다는 이유로 생일을 기프티콘으로 넘긴 것이 유죄인가요?',
    difficulty: 'normal',
    voteCount: 2871,
    guiltyRate: 0.83,
    avgSentence: 3.4,
    closesInMin: 47,
    status: 'open',
    opinionCount: 412,
  },
  c3: {
    id: 'c3',
    caseNo: '2026고합2210',
    courtId: 'money',
    author: '익명의피고인_2210',
    title: '더치페이 하자던 친구 밥값 3천원을 안 보냈습니다',
    situation:
      '대학 동기 4명과 점심을 먹고 총 4만 8천원이 나왔습니다. 한 명이 먼저 카드로 결제하고 1/n로 정산하기로 했습니다.',
    action:
      '저는 1만 2천원 중 9천원만 보냈습니다. 제가 먹은 메뉴가 제일 싼 것이었고, 다른 친구들이 추가로 시킨 사이드는 손도 대지 않았기 때문입니다. 따로 설명은 하지 않았습니다.',
    reaction:
      '결제한 친구가 "3천원 모자란데?"라고 물었고, 제가 "나 그거 안 먹었잖아"라고 하자 "그럼 미리 말하지"라고 했습니다. 그 뒤로 그 모임 정산에서 제가 빠졌습니다.',
    issue: '먹지 않은 메뉴 값을 말없이 뺀 것이 유죄인가요?',
    difficulty: 'close',
    voteCount: 3902,
    guiltyRate: 0.52,
    avgSentence: 2.6,
    closesInMin: 12,
    status: 'open',
    opinionCount: 731,
  },
  c4: {
    id: 'c4',
    caseNo: '2026고합7788',
    courtId: 'family',
    author: '익명의피고인_7788',
    title: '엄마 카톡을 3일 동안 읽고 답 안 했습니다',
    situation:
      '자취 2년 차입니다. 엄마가 "밥은 먹었니", "이번 주말에 오니?" 같은 카톡을 하루에 두세 번씩 보냅니다.',
    action:
      '3일 동안 전부 읽기만 하고 답하지 않았습니다. 답하면 통화로 이어지고 결국 언제 오냐는 이야기가 나와서 피했습니다.',
    reaction:
      '나흘째 되는 날 아빠에게 전화가 왔습니다. "엄마가 너 무슨 일 있는 줄 알고 밤에 잠을 못 잔다"고 했습니다.',
    issue: '부담스러워서 부모님 연락을 읽씹한 것이 유죄인가요?',
    difficulty: 'normal',
    voteCount: 1980,
    guiltyRate: 0.68,
    avgSentence: 2.9,
    closesInMin: 320,
    status: 'open',
    opinionCount: 240,
  },
  c5: {
    id: 'c5',
    caseNo: '2026고합5510',
    courtId: 'friend',
    author: '익명의피고인_5510',
    title: '10년 친구 결혼식에 축의금 5만원 내고 뷔페 2인분 먹었습니다',
    situation:
      '10년 된 친구 결혼식이었습니다. 저는 당시 이직 준비 중으로 소득이 없는 상태였고, 그 친구는 제 상황을 알고 있었습니다.',
    action:
      '축의금 5만원을 내고 식권 2장을 받아 여자친구와 함께 식사했습니다. 뷔페 식대가 1인 6만원대인 곳이었습니다.',
    reaction:
      '친구는 그 자리에서 아무 말도 하지 않았습니다. 반년 뒤 제 결혼식에 그 친구는 5만원을 냈고, 그때 "너도 그랬잖아"라고 웃으며 말했습니다.',
    issue: '사정이 있었다 해도 식대보다 적은 축의금을 낸 것이 유죄인가요?',
    difficulty: 'twist',
    voteCount: 5120,
    guiltyRate: 0.74,
    avgSentence: 3.1,
    closesInMin: 540,
    status: 'open',
    opinionCount: 1104,
  },
  c6: {
    id: 'c6',
    caseNo: '2026고합0031',
    courtId: 'online',
    author: '익명의피고인_0031',
    title: '중고거래 약속 10분 전에 취소했습니다',
    situation: '당근으로 의자를 팔기로 하고 지하철역에서 만나기로 했습니다.',
    action: '약속 10분 전, 더 높은 가격을 제시한 사람이 나타나 기존 약속을 취소했습니다.',
    reaction: '상대는 이미 역에 도착한 상태였고, 매너온도를 깎았습니다.',
    issue: '더 비싼 값을 이유로 약속을 깬 것이 유죄인가요?',
    difficulty: 'easy',
    voteCount: 8820,
    guiltyRate: 0.96,
    avgSentence: 4.2,
    closesInMin: 0,
    status: 'closed',
    opinionCount: 2210,
    myVerdict: { guilty: true, sentence: 4, correct: true, points: 12 },
    statement: '변명의 여지가 없습니다. 그 분께 직접 사과드렸고 의자는 원래 약속한 가격으로 넘겼습니다. 96%는 인정합니다.',
  },
  c7: {
    id: 'c7',
    caseNo: '2026고합4410',
    courtId: 'love',
    author: '익명의피고인_4410',
    title: '헤어진 다음날 SNS 프로필을 바꿨습니다',
    situation: '3년 연애를 끝낸 다음날이었습니다.',
    action: '커플 사진을 전부 내리고 혼자 찍은 여행 사진으로 프로필을 교체했습니다.',
    reaction: '상대가 "벌써?"라는 카톡을 보냈습니다.',
    issue: '이별 다음날 프로필을 정리한 것이 유죄인가요?',
    difficulty: 'close',
    voteCount: 4410,
    guiltyRate: 0.47,
    avgSentence: 2.2,
    closesInMin: 0,
    status: 'closed',
    opinionCount: 980,
    myVerdict: { guilty: false, sentence: null, correct: true, points: 30 },
    statement: '3년을 정리하는 데 하루가 짧다고 하시는데, 그 사진들을 남겨두는 게 더 예의 없는 일이라고 생각했습니다.',
  },
  c8: {
    id: 'c8',
    caseNo: '2026고합1902',
    courtId: 'work',
    author: '익명의피고인_1902',
    title: '퇴사 통보를 카톡으로 했습니다',
    situation: '3년 다닌 회사에서 퇴사를 결심했습니다.',
    action: '팀장에게 대면 없이 카톡으로 퇴사 의사를 전달했습니다.',
    reaction: '팀장은 "전화 좀"이라고 답했고 저는 읽고 답하지 않았습니다.',
    issue: '퇴사 통보를 카톡으로 한 것이 유죄인가요?',
    difficulty: 'normal',
    voteCount: 6240,
    guiltyRate: 0.58,
    avgSentence: 2.8,
    closesInMin: 0,
    status: 'appeal',
    opinionCount: 1502,
  },
};

export const caseList = Object.values(cases);

/** 판결문 — 유죄측/무죄측 분리 (기획서 02) */
export const opinions = {
  c3: [
    {
      id: 'o1',
      author: '금전지법 부장판사',
      guilty: true,
      sentence: 3,
      body: '먹은 만큼 낸다는 원칙 자체는 맞습니다. 문제는 사후에 말없이 뺀 절차입니다. 결제 전에 한마디만 했으면 무죄였습니다.',
      likeCount: 1204,
      isTop: true,
    },
    {
      id: 'o2',
      author: '연애지법 배심원장',
      guilty: false,
      sentence: null,
      body: '3천원 때문에 사람을 모임에서 빼는 쪽이 더 문제 아닌가요. 안 먹은 걸 안 냈을 뿐입니다.',
      likeCount: 987,
      isTop: true,
    },
    {
      id: 'o3',
      author: '직장지법 판사',
      guilty: true,
      sentence: 2,
      body: '1/n 하기로 합의한 순간 계산은 끝난 겁니다. 합의를 혼자 수정한 게 유죄 포인트입니다.',
      likeCount: 640,
      isTop: true,
    },
    {
      id: 'o4',
      author: '온라인지법 배심원',
      guilty: false,
      sentence: null,
      body: '사이드 안 먹은 사람이 사이드값 내는 게 정상이라고 생각하는 사람들이 더 무섭습니다.',
      likeCount: 402,
      isTop: false,
    },
    {
      id: 'o5',
      author: '가족지법 배심원',
      guilty: true,
      sentence: 1,
      body: '훈방입니다. 잘못은 맞는데 3천원이잖아요.',
      likeCount: 388,
      isTop: false,
    },
  ],
};

// extraOpinions는 파일 아래쪽에 선언되지만, 이 함수는 렌더 시점에 호출되므로 TDZ에 걸리지 않는다.
export const opinionsFor = (caseId) => opinions[caseId] ?? extraOpinions[caseId] ?? opinions.c3;

/** 시즌 리더보드 */
export const leaderboard = [
  { rank: 1, nickname: '판결기계_0417', courtId: 'work', points: 12480, accuracy: 84, tier: '대법관' },
  { rank: 2, nickname: '무죄추정', courtId: 'love', points: 10920, accuracy: 79, tier: '대법관' },
  { rank: 3, nickname: '형량장인', courtId: 'money', points: 9840, accuracy: 81, tier: '대법관' },
  { rank: 4, nickname: '초박빙사냥꾼', courtId: 'online', points: 8610, accuracy: 76, tier: '부장판사' },
  { rank: 5, nickname: '가정평화수호', courtId: 'family', points: 7720, accuracy: 74, tier: '부장판사' },
  { rank: 6, nickname: '침착한배심원', courtId: 'friend', points: 6980, accuracy: 72, tier: '부장판사' },
  { rank: 7, nickname: '데일리개근', courtId: 'work', points: 6210, accuracy: 68, tier: '부장판사' },
  { rank: 8, nickname: '소수의견러', courtId: 'love', points: 5640, accuracy: 70, tier: '부장판사' },
  { rank: 41, nickname: '익명의피고인_4821', courtId: 'love', points: 3240, accuracy: 71, tier: '판사', isMe: true },
];

export const rival = {
  nickname: '연애전문판사_77',
  points: 3310,
  myPoints: 3240,
  endsIn: '3일 4시간',
  reward: 50,
};

/** 법원 대항전 */
export const courtStandings = [
  { courtId: 'love', avg: 1842, members: 3120 },
  { courtId: 'work', avg: 1790, members: 4010 },
  { courtId: 'money', avg: 1655, members: 1980 },
  { courtId: 'family', avg: 1502, members: 2240 },
  { courtId: 'online', avg: 1440, members: 2870 },
  { courtId: 'friend', avg: 1388, members: 1760 },
];

export const courtMembers = [
  { rank: 1, nickname: '무죄추정', points: 10920 },
  { rank: 2, nickname: '소수의견러', points: 5640 },
  { rank: 3, nickname: '연애전문판사_77', points: 3310 },
  { rank: 4, nickname: '익명의피고인_4821', points: 3240, isMe: true },
  { rank: 5, nickname: '이별심판관', points: 2980 },
];

/** 훈장 */
export const medals = [
  { id: 'm1', name: '무죄 훈장', count: 2, icon: 'shield-checkmark', color: colors.innocent, desc: '무죄 판결을 받은 사건' },
  { id: 'm2', name: '선견지명', count: 1, icon: 'eye', color: colors.purple, desc: '소수의견이 항소심에서 뒤집힘' },
  { id: 'm3', name: '명판결', count: 3, icon: 'ribbon', color: colors.gold, desc: '판결문이 사건 최다 추천 3위 내' },
  { id: 'm4', name: '억울함 인증', count: 0, icon: 'sad', color: colors.info, desc: '항소로 무죄를 받음' },
  { id: 'm5', name: '초박빙 저격', count: 8, icon: 'flash', color: colors.close, desc: '초박빙 사건 적중' },
  { id: 'm6', name: '개근', count: 1, icon: 'calendar', color: colors.innocent, desc: '7일 연속 출석' },
];

/** 판례집 코너 */
export const archiveSections = [
  { id: 'hot', title: '화제의 재판', desc: '주간 최다 투표 사건', icon: 'flame', color: colors.close, caseIds: ['c5', 'c6'] },
  { id: 'close', title: '초박빙', desc: '유죄율 45~55% 사건', icon: 'git-compare', color: colors.info, caseIds: ['c3', 'c7'] },
  { id: 'hall', title: '명예의 전당', desc: '역대 최고 유죄율 (익명 처리)', icon: 'trophy', color: colors.guilty, caseIds: ['c6'] },
  { id: 'unfair', title: '억울함의 전당', desc: '항소로 판결이 뒤집힌 사건', icon: 'refresh', color: colors.innocent, caseIds: ['c8'] },
  { id: 'best', title: '명판결', desc: '역대 최다 추천 판결문', icon: 'ribbon', color: colors.gold, caseIds: [] },
  { id: 'scrap', title: '내 스크랩', desc: '북마크한 사건만 모아보기', icon: 'bookmark', color: colors.innocent, caseIds: null },
  { id: 'follow', title: '구독 배심원', desc: '내가 구독한 사람의 판결문', icon: 'people', color: colors.purple, caseIds: null },
];

/** 판결 이력 (프로필) */
export const verdictHistory = [
  { caseId: 'c6', title: '중고거래 약속 10분 전에 취소', myGuilty: true, result: '유죄 96%', correct: true, points: 12 },
  { caseId: 'c7', title: '헤어진 다음날 SNS 프로필을 바꿈', myGuilty: false, result: '무죄 53%', correct: true, points: 30 },
  { caseId: 'c8', title: '퇴사 통보를 카톡으로 함', myGuilty: false, result: '유죄 58%', correct: false, points: 0 },
];

/** 내 사건 이력 (프로필) */
export const myCases = [
  { id: 'mc1', title: '친구 소개팅 자리에 30분 늦음', guiltyRate: 0.88, sentence: 3.2, score: 74, votes: 1820, status: 'closed', canStatement: true },
  { id: 'mc2', title: '동생 택배를 뜯어봄', guiltyRate: 0.91, sentence: 3.6, score: 82, votes: 2410, status: 'closed', canAppeal: true },
  { id: 'mc3', title: '단톡방에서 혼자 읽씹', guiltyRate: 0.41, sentence: 1.8, score: 34, votes: 1120, status: 'closed' },
  { id: 'mc4', title: '회의 중 몰래 딴짓', guiltyRate: 0.62, sentence: 2.4, score: 58, votes: 640, status: 'open', closesInMin: 176 },
  { id: 'mc5', title: '룸메이트 우유를 마심', guiltyRate: 0, sentence: 0, score: 0, votes: 0, status: 'review' },
  { id: 'mc6', title: '엘리베이터 열림 버튼을 안 누름', guiltyRate: 0.55, sentence: 2.0, score: 0, votes: 14, status: 'void' },
];

/** 카테고리별 적중률 — 75% 이상이면 부칭호 (기획서 06) */
export const categoryAccuracy = [
  { courtId: 'love', accuracy: 0.79, judged: 142 },
  { courtId: 'work', accuracy: 0.74, judged: 98 },
  { courtId: 'money', accuracy: 0.68, judged: 61 },
  { courtId: 'family', accuracy: 0.77, judged: 44 },
  { courtId: 'friend', accuracy: 0.62, judged: 37 },
  { courtId: 'online', accuracy: 0.55, judged: 22 },
];

/** 차단 목록 */
export const blockedSeed = ['판결기계_0417', '무례한배심원_88'];

/** 신고 이력 시드. 스토어 초기값으로 들어간다 — 화면에서 상수와 합치면 안 된다. */
export const reportSeed = {
  '판결문 · 금전지법 배심원': { reason: 'defame', at: Date.now() - 3600e3, state: '처리중' },
};

/** 신고 사유 (기획서 10 · 정보통신망법 제44조의2 대응) */
export const REPORT_REASONS = [
  { key: 'personal', label: '개인정보 노출', desc: '실명 · 연락처 · 소속이 드러납니다' },
  { key: 'defame', label: '명예훼손 · 비방', desc: '특정인을 저격하거나 모욕합니다' },
  { key: 'thirdparty', label: '본인 사연이 아님', desc: '제3자의 일을 대신 투고했습니다' },
  { key: 'sexual', label: '선정적 · 폭력적 내용', desc: '불쾌감을 주는 표현이 포함됩니다' },
  { key: 'spam', label: '광고 · 도배', desc: '티켓 파밍이나 홍보 목적입니다' },
  { key: 'etc', label: '기타', desc: '위 항목에 해당하지 않습니다' },
];

/** 시즌 패스 */
export const seasonPass = {
  season: 3,
  endsIn: '11일',
  progress: 0.58,
  rewards: [
    { at: 500, label: '티켓 30', done: true },
    { at: 1500, label: '프로필 명패', done: true },
    { at: 3000, label: '티켓 80', done: true },
    { at: 4500, label: '한정 칭호', done: false },
    { at: 6000, label: '시즌 배지', done: false },
  ],
};

/** 알림 타임라인 (기획서 06) */
export const pushTimeline = [
  { time: '09:00', text: '오늘의 사건 5건이 배정되었습니다' },
  { time: '12:30', text: '점심 재판 — 점수 2배 사건 1건' },
  { time: '21:00', text: '내 사건 마감 3시간 전' },
  { time: '24:00', text: '개표 결과 + 판사 지수 정산' },
];

/* ────────────────────────────────────────────────────────────────
   커뮤니티 레이어 — 알림함 · 공개 프로필 · 판결문 반박 · 활동 피드
   ──────────────────────────────────────────────────────────────── */

/** 알림함. kind로 아이콘·색·이동 경로가 갈린다. */
export const notifications = [
  {
    id: 'n1',
    kind: 'verdict',
    title: '내 사건에 판결이 쏟아지고 있습니다',
    body: '"회의 중 몰래 딴짓" · 최근 1시간 동안 218표',
    at: '방금',
    unread: true,
    href: '/profile',
  },
  {
    id: 'n2',
    kind: 'opinion',
    title: '내 판결문이 추천 1위가 되었습니다',
    body: '"1/n 하기로 합의한 순간 계산은 끝난 겁니다" · +3 판사 지수',
    at: '12분 전',
    unread: true,
    href: '/case/c3',
  },
  {
    id: 'n3',
    kind: 'rival',
    title: '라이벌이 당신을 추월했습니다',
    body: '연애전문판사_77 · 3,310점 (내 3,240점)',
    at: '1시간 전',
    unread: true,
    href: '/ranking',
  },
  {
    id: 'n4',
    kind: 'result',
    title: '개표가 끝났습니다 — 적중',
    body: '"헤어진 다음날 SNS 프로필을 바꿈" 무죄 53% · +30점',
    at: '3시간 전',
    unread: false,
    href: '/case/c7',
  },
  {
    id: 'n5',
    kind: 'court',
    title: '연애지법이 주간 대항전 1위에 올랐습니다',
    body: '종료까지 2일 · 유지 시 소속원 전원 티켓 100장',
    at: '5시간 전',
    unread: false,
    href: '/court',
  },
  {
    id: 'n6',
    kind: 'appeal',
    title: '항소가 접수되었습니다',
    body: '"퇴사 통보를 카톡으로 함" · 재심 24시간',
    at: '어제',
    unread: false,
    href: '/case/c8',
  },
  {
    id: 'n7',
    kind: 'system',
    title: '신고하신 판결문이 삭제되었습니다',
    body: '명예훼손 · 비방 사유로 검토 후 조치되었습니다',
    at: '어제',
    unread: false,
    href: '/reports',
  },
  {
    id: 'n8',
    kind: 'ticket',
    title: '사연이 승인되어 티켓 25장을 받았습니다',
    body: '"룸메이트 우유를 마심"이 검수를 통과했습니다',
    at: '2일 전',
    unread: false,
    href: '/tickets',
  },
];

export const NOTIF_KIND = {
  verdict: { icon: 'hammer', color: colors.gold, label: '내 사건' },
  opinion: { icon: 'ribbon', color: colors.gold, label: '판결문' },
  rival: { icon: 'flash', color: colors.close, label: '라이벌' },
  result: { icon: 'checkmark-circle', color: colors.innocent, label: '개표' },
  court: { icon: 'business', color: colors.info, label: '법원' },
  appeal: { icon: 'refresh', color: colors.close, label: '항소' },
  system: { icon: 'shield-checkmark', color: colors.textMuted, label: '운영' },
  ticket: { icon: 'ticket', color: colors.ticket, label: '티켓' },
};

/** 공개 프로필 — 기획서 13 결정에 따라 폐급 지수 숫자는 감추고 계급만 노출한다. */
export const userProfiles = {
  '판결기계_0417': {
    nickname: '판결기계_0417',
    courtId: 'work',
    tier: '대법관',
    jurorScore: 12480,
    accuracy: 84,
    judged: 1842,
    guiltTier: '경고누적',
    streak: 96,
    joinedAt: '시즌 1',
    bestOpinion: '합의를 혼자 수정한 게 유죄 포인트입니다. 금액은 쟁점이 아닙니다.',
    bestOpinionLikes: 3120,
    medals: ['명판결 ×12', '초박빙 저격 ×41', '개근 ×3'],
    specialty: [
      { courtId: 'work', accuracy: 0.88 },
      { courtId: 'money', accuracy: 0.83 },
    ],
  },
  '무죄추정': {
    nickname: '무죄추정',
    courtId: 'love',
    tier: '대법관',
    jurorScore: 10920,
    accuracy: 79,
    judged: 1510,
    guiltTier: '성인군자',
    streak: 44,
    joinedAt: '시즌 1',
    bestOpinion: '유죄를 던지기 전에 자기 카톡함부터 열어보시길 권합니다.',
    bestOpinionLikes: 2740,
    medals: ['무죄 훈장 ×5', '명판결 ×8'],
    specialty: [{ courtId: 'love', accuracy: 0.86 }],
  },
  '연애전문판사_77': {
    nickname: '연애전문판사_77',
    courtId: 'love',
    tier: '판사',
    jurorScore: 3310,
    accuracy: 73,
    judged: 402,
    guiltTier: '집행유예',
    streak: 12,
    joinedAt: '시즌 2',
    bestOpinion: '기프티콘이 죄가 아니라, 미리 말하지 않은 게 죄입니다.',
    bestOpinionLikes: 890,
    medals: ['초박빙 저격 ×6'],
    specialty: [{ courtId: 'love', accuracy: 0.81 }],
  },
};

/** 이름만 있고 상세가 없는 사용자는 규칙적으로 만들어 채운다 (서버 연동 전 임시). */
export function profileOf(nickname) {
  if (userProfiles[nickname]) return userProfiles[nickname];
  let h = 0;
  for (let i = 0; i < String(nickname).length; i++) h = (h * 31 + nickname.charCodeAt(i)) >>> 0;
  const courts = ['love', 'work', 'family', 'friend', 'money', 'online'];
  const jurorScore = 600 + (h % 5200);
  // 계급은 점수에서 파생시킨다. 따로 뽑으면 계급표와 어긋난 프로필이 나온다.
  const tier =
    jurorScore >= 5500 ? '부장판사'
      : jurorScore >= 3000 ? '판사'
      : jurorScore >= 1500 ? '배심원장'
      : '배심원';
  return {
    nickname,
    courtId: courts[h % 6],
    tier,
    jurorScore,
    accuracy: 58 + (h % 26),
    judged: 40 + (h % 700),
    guiltTier: ['성인군자', '모범시민', '경고누적', '집행유예', '전과자'][h % 5],
    streak: h % 40,
    joinedAt: `시즌 ${1 + (h % 3)}`,
    bestOpinion: null,
    bestOpinionLikes: 0,
    medals: [],
    specialty: [],
    generated: true,
  };
}

/** 판결문에 달리는 반박. 커뮤니티의 말싸움이 이 앱의 재미이므로 1단계까지 허용한다. */
export const opinionReplies = {
  o1: [
    { id: 'r1', author: '무죄추정', body: '절차를 문제 삼으면 이 세상 더치페이의 절반이 유죄입니다.', likeCount: 214, at: '2시간 전' },
    { id: 'r2', author: '직장지법 판사', body: '동의합니다. 결제 전 한마디가 전부였어요.', likeCount: 88, at: '1시간 전' },
  ],
  o2: [
    { id: 'r3', author: '금전지법 부장판사', body: '3천원이 문제가 아니라 통보 없이 뺀 게 문제입니다.', likeCount: 176, at: '3시간 전' },
  ],
  o4: [
    { id: 'r4', author: '가족지법 배심원', body: '이 논리면 회식비도 각자 먹은 만큼만 내야죠. 찬성합니다.', likeCount: 41, at: '5시간 전' },
  ],
};

export const repliesFor = (opinionId) => opinionReplies[opinionId] ?? [];

/** 법원 피드 상단 실시간 활동 — 커뮤니티가 "살아 있다"는 신호. */
export const courtActivity = [
  { id: 'a1', actor: '이별심판관', verb: '님이 사연을 투고했습니다', target: '전남친 결혼식에 갔습니다', at: '방금' },
  { id: 'a2', actor: '무죄추정', verb: '님의 판결문이 추천 1000을 넘었습니다', target: null, at: '8분 전' },
  { id: 'a3', actor: '연애전문판사_77', verb: '님이 초박빙 사건을 적중했습니다', target: '헤어진 다음날 SNS 프로필', at: '22분 전' },
  { id: 'a4', actor: '소수의견러', verb: '님이 항소에 성공했습니다', target: null, at: '1시간 전' },
];

/** 사건별 판결문을 조금 더 채워 커뮤니티 밀도를 올린다. */
export const extraOpinions = {
  c1: [
    { id: 'c1o1', author: '직장지법 부장판사', guilty: false, sentence: null, body: '1차 3시간이면 할 만큼 했습니다. 다음날 일정 있는 사람 붙잡는 쪽이 유죄입니다.', likeCount: 862, isTop: true },
    { id: 'c1o2', author: '판결기계_0417', guilty: true, sentence: 2, body: '가는 건 자유인데 말없이 사라진 건 예의 문제입니다. 벌금형.', likeCount: 741, isTop: true },
    { id: 'c1o3', author: '가족지법 배심원', guilty: false, sentence: null, body: '단톡방에 남긴 한 줄이면 충분합니다. 회식은 근무가 아닙니다.', likeCount: 512, isTop: true },
    { id: 'c1o4', author: '침착한배심원', guilty: true, sentence: 1, body: '훈방. 다음엔 화장실 갔을 때 말고 눈 마주쳤을 때 가세요.', likeCount: 302, isTop: false },
  ],
  c2: [
    { id: 'c2o1', author: '무죄추정', guilty: true, sentence: 4, body: '야근은 이유가 되지만 기프티콘 한 장은 답이 아닙니다. 주말 약속도 안 잡아둔 게 결정타.', likeCount: 2140, isTop: true },
    { id: 'c2o2', author: '연애전문판사_77', guilty: true, sentence: 3, body: '00시에 보낸 건 인정합니다. 다만 "주말에 보자"를 상대에게 정하게 한 순간 유죄입니다.', likeCount: 1680, isTop: true },
    { id: 'c2o3', author: '소수의견러', guilty: false, sentence: null, body: '마감 주간에 생일이 낀 걸 죄로 만들면 직장인은 전부 폐급입니다.', likeCount: 1204, isTop: true },
    { id: 'c2o4', author: '금전지법 부장판사', guilty: true, sentence: 5, body: '8개월 차에 이 정도면 마음이 없는 겁니다.', likeCount: 640, isTop: false },
  ],
  c4: [
    { id: 'c4o1', author: '가정평화수호', guilty: true, sentence: 3, body: '읽씹 자체는 죄가 아닙니다. 사흘은 죄입니다. 한 글자면 끝날 일이었어요.', likeCount: 1320, isTop: true },
    { id: 'c4o2', author: '침착한배심원', guilty: false, sentence: null, body: '하루 두세 번씩 오는 연락에 매번 답할 의무는 없습니다.', likeCount: 980, isTop: true },
    { id: 'c4o3', author: '판결기계_0417', guilty: true, sentence: 2, body: '피하고 싶은 마음은 이해되지만 아버지가 전화할 지경까지 간 건 본인 책임.', likeCount: 705, isTop: true },
  ],
  c5: [
    { id: 'c5o1', author: '판결기계_0417', guilty: true, sentence: 3, body: '식대보다 적게 냈으면 혼자 왔어야 합니다. 동반이 결정적입니다.', likeCount: 3240, isTop: true },
    { id: 'c5o2', author: '무죄추정', guilty: false, sentence: null, body: '사정을 알고도 청첩장을 준 쪽이 감수할 일입니다. 반년 뒤 웃으며 넘긴 것도 답이고요.', likeCount: 2870, isTop: true },
    { id: 'c5o3', author: '소수의견러', guilty: true, sentence: 2, body: '무직인 건 참작되지만 2인분은 참작이 안 됩니다.', likeCount: 1990, isTop: true },
    { id: 'c5o4', author: '초박빙사냥꾼', guilty: false, sentence: null, body: '10년 친구 사이에 이걸 계산기 두드리는 게 더 슬픕니다.', likeCount: 1120, isTop: false },
  ],
  c6: [
    { id: 'c6o1', author: '초박빙사냥꾼', guilty: true, sentence: 5, body: '상대가 이미 역에 도착했습니다. 여기서 끝난 이야기입니다.', likeCount: 4210, isTop: true },
    { id: 'c6o2', author: '데일리개근', guilty: true, sentence: 4, body: '더 받겠다는 마음은 죄가 아닌데, 10분 전 통보는 죄입니다.', likeCount: 2180, isTop: true },
    { id: 'c6o3', author: '무죄추정', guilty: true, sentence: 3, body: '96%에 한 표 보탭니다. 다만 사과하고 원가에 넘긴 건 참작.', likeCount: 1440, isTop: true },
  ],
  c7: [
    { id: 'c7o1', author: '연애전문판사_77', guilty: false, sentence: null, body: '3년을 정리하는 데 하루가 짧다는 말이 더 이상합니다. 남겨두는 게 예의 없죠.', likeCount: 2210, isTop: true },
    { id: 'c7o2', author: '이별심판관', guilty: true, sentence: 2, body: '하루는 너무 빠릅니다. 상대가 "벌써?"라고 할 만합니다.', likeCount: 2040, isTop: true },
    { id: 'c7o3', author: '무죄추정', guilty: false, sentence: null, body: '헤어진 사람 프로필까지 관리해줘야 하나요.', likeCount: 1610, isTop: true },
  ],
  c8: [
    { id: 'c8o1', author: '판결기계_0417', guilty: true, sentence: 3, body: '3년이면 통보 방식에도 값이 있습니다. 전화 한 통은 하고 나가야죠.', likeCount: 2980, isTop: true },
    { id: 'c8o2', author: '소수의견러', guilty: false, sentence: null, body: '대면 통보를 요구할 권리는 회사에 없습니다. 근로기준법에도 없어요.', likeCount: 2740, isTop: true },
    { id: 'c8o3', author: '데일리개근', guilty: true, sentence: 2, body: '"전화 좀"을 읽씹한 게 유죄 포인트입니다. 카톡 통보 자체는 무죄.', likeCount: 1880, isTop: true },
  ],
};

/** 홈 LIVE 카드에 흘릴 짧은 소식 — 실시간감을 위해 순환시킨다. */
export const liveTicker = [
  '방금 "축의금 5만원" 사건에 1,204번째 판결이 내려졌습니다',
  '연애지법이 대항전 1위를 되찾았습니다',
  '초박빙 사건 "더치페이 3천원"이 마감 12분 전입니다',
  '무죄추정 님의 판결문이 추천 2,700을 넘었습니다',
  '오늘 접수된 사연 1,882건 중 431건이 검수를 통과했습니다',
];
