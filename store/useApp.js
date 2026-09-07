import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { me as initialMe, dailyPicks, notifications as seedNotifications, blockedSeed, reportSeed, cases } from '../data/mock';

let toastSeq = 0;

/** 데일리 배정 기준일. 기획서 06대로 매일 09:00에 새 5건이 열린다. */
export const courtDay = (d = new Date()) => {
  const x = new Date(d);
  if (x.getHours() < 9) x.setDate(x.getDate() - 1); // 09시 전은 아직 어제 회차
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

/**
 * 프론트 전용 상태. 서버 연동 시 TanStack Query로 교체 예정.
 *
 * 티켓·구독·스크랩·차단은 앱을 껐다 켜도 남아야 한다 (웹에선 localStorage,
 * 네이티브에선 AsyncStorage). 반면 토스트나 진행 중인 판결 단계처럼
 * 한 세션에서만 의미 있는 값은 partialize에서 빼 저장하지 않는다.
 */
export const useApp = create(persist((set, get) => ({
  me: { ...initialMe },
  tickets: initialMe.ticketBalance,
  combo: 3,

  // 오늘의 5건: caseId -> { guilty, sentence, opinion }
  dailyPicks,
  judged: {},
  judgedDay: courtDay(),

  // 마지막 판결 결과 (개표 화면에서 소비)
  lastResult: null,

  likedOpinions: {},

  // 안전 기능 (스토어 심사 필수 세트)
  reports: { ...reportSeed }, // targetId -> { reason, at, state }
  // 차단 목록은 스토어가 단일 출처다. 화면이 목업 상수를 따로 합치면 차단 해제가 되돌아온다.
  blocked: Object.fromEntries(blockedSeed.map((n) => [n, true])), // 닉네임 -> true
  deletedCases: {},   // caseId -> true
  hiddenOpinions: {}, // opinionId -> true

  // 사건 부가 상태
  peeked: {},         // caseId -> true (티켓 3 소모 조기 열람)
  statements: {},     // caseId -> 최후진술 본문
  myOpinions: {},     // caseId -> 내가 쓴 판결문

  // 알림함 — 서버 붙이면 목록만 갈아끼우고 읽음 처리는 그대로 쓴다.
  notifs: seedNotifications.map((n) => ({ ...n })),
  followed: {},       // 닉네임 -> true (구독한 배심원)
  bookmarks: {},      // caseId -> true (스크랩한 사건)
  myPosts: [],        // 내가 투고한 사연 (검수 대기)

  // 알림 설정. useState로 두면 화면을 나갔다 오는 순간 초기화된다.
  push: { daily: true, myCase: true, result: true, court: false },

  // 일일 보상 사용량. 화면이 "1일 N회"라고 안내하는데 제한이 없었다.
  claims: { day: courtDay(), attend: false, ads: 0 },
  likedReplies: {},   // 반박 추천
  myReplies: {},      // opinionId -> [{ id, body, at }]

  toast: null,

  showToast: (message, tone = 'default') =>
    set({ toast: { id: ++toastSeq, message, tone } }),
  hideToast: () => set({ toast: null }),

  spendTickets: (n) => {
    const s = get();
    if (s.tickets < n) {
      s.showToast(`티켓이 ${n - s.tickets}장 부족합니다`, 'warn');
      return false;
    }
    set({ tickets: s.tickets - n });
    return true;
  },
  addTickets: (n) => set((s) => ({ tickets: s.tickets + n })),

  submitVerdict: (caseId, { guilty, sentence, opinion }) => {
    const s = get();
    if (s.tickets < 1) return null;
    const c = cases[caseId];
    const correct = c ? guilty === (c.guiltyRate >= 0.5) : true;
    const result = { guilty, sentence, opinion, at: Date.now(), correct };
    set({
      tickets: s.tickets - 1,
      judged: { ...s.judged, [caseId]: result },
      lastResult: { caseId, ...result },
      // 콤보는 "연속 적중"이다. 무조건 올리면 한 번도 안 끊겨 영구히 ×2.0이 된다.
      combo: correct ? s.combo + 1 : 0,
      myOpinions: opinion?.trim()
        ? { ...s.myOpinions, [caseId]: opinion.trim() }
        : s.myOpinions,
    });
    get().pushNotif({
      kind: 'result',
      title: '판결을 접수했습니다',
      body: `${guilty ? `유죄 ${sentence}단계` : '무죄'} · 마감 후 개표 결과와 지수 정산을 알려드립니다`,
      href: `/case/${caseId}`,
    });
    return result;
  },

  writeOpinion: (caseId, body) => {
    set((s) => ({ myOpinions: { ...s.myOpinions, [caseId]: body.trim() } }));
    get().showToast('판결문을 등록했습니다', 'ok');
    get().pushNotif({
      kind: 'opinion',
      title: '판결문이 등록되었습니다',
      body: '추천을 받으면 판사 지수 +3 · 상위 3건은 사건 상단에 고정됩니다',
      href: `/case/${caseId}`,
    });
  },

  peekCase: (caseId) => {
    const s = get();
    if (s.peeked[caseId]) return true;
    if (!s.spendTickets(3)) return false;
    set({ peeked: { ...get().peeked, [caseId]: true } });
    get().showToast('실시간 개표를 열었습니다 · 티켓 -3', 'ok');
    return true;
  },

  submitStatement: (caseId, body) => {
    set((s) => ({ statements: { ...s.statements, [caseId]: body.trim() } }));
    get().showToast('최후진술이 배심원 전원에게 전달됩니다', 'ok');
    get().pushNotif({
      kind: 'verdict',
      title: '최후진술이 전달되었습니다',
      body: '이 사건에 판결한 배심원 전원에게 알림이 발송됐습니다',
      href: `/case/${caseId}`,
    });
  },

  toggleLike: (opinionId) =>
    set((s) => ({
      likedOpinions: { ...s.likedOpinions, [opinionId]: !s.likedOpinions[opinionId] },
    })),

  report: (targetId, reason, kind = '게시물') => {
    set((s) => ({ reports: { ...s.reports, [targetId]: { reason, at: Date.now(), state: '접수됨' } } }));
    get().showToast(`${kind}을 신고했습니다 · 24시간 내 처리됩니다`, 'ok');
    get().pushNotif({
      kind: 'system',
      title: `${kind} 신고가 접수되었습니다`,
      body: '24시간 내 검토 후 결과를 알려드립니다',
      href: '/reports',
    });
  },

  blockUser: (nickname) => {
    set((s) => ({ blocked: { ...s.blocked, [nickname]: true } }));
    get().showToast(`${nickname}님을 차단했습니다`, 'ok');
  },
  unblockUser: (nickname) =>
    set((s) => {
      const next = { ...s.blocked };
      delete next[nickname];
      return { blocked: next };
    }),

  hideOpinion: (opinionId) =>
    set((s) => ({ hiddenOpinions: { ...s.hiddenOpinions, [opinionId]: true } })),

  deleteCase: (caseId) => {
    set((s) => ({ deletedCases: { ...s.deletedCases, [caseId]: true } }));
    get().showToast('사연을 삭제했습니다', 'ok');
  },

  // 화면이 "시즌당 1회"라고 안내하는데 제한이 없었다. 실제로 막는다.
  transfersUsed: 0,

  setCourt: (courtId) => {
    const s = get();
    if (s.me.courtId === courtId) return false;
    if (s.transfersUsed >= 1) {
      s.showToast('이번 시즌 이적을 이미 사용했습니다', 'warn');
      return false;
    }
    set({ me: { ...s.me, courtId }, transfersUsed: s.transfersUsed + 1 });
    return true;
  },

  unreadCount: () => get().notifs.filter((n) => n.unread).length,

  /** 알림함 맨 위에 한 건 꽂는다. 서버가 붙으면 소켓 수신부가 이 자리를 대신한다. */
  pushNotif: ({ kind, title, body, href }) =>
    set((s) => ({
      notifs: [
        { id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, kind, title, body, href, at: '방금', unread: true },
        ...s.notifs,
      ].slice(0, 40),
    })),

  /** 사연 투고. 서버가 붙으면 POST /cases 응답으로 교체한다. */
  submitPost: ({ title, courtId, body }) => {
    const post = {
      id: `mp_${Date.now()}`,
      title: title.trim().slice(0, 40),
      courtId,
      body,
      status: 'review',
      guiltyRate: 0,
      sentence: 0,
      score: 0,
      votes: 0,
      at: Date.now(),
      mine: true,
    };
    set((s) => ({ myPosts: [post, ...s.myPosts] }));
    get().addTickets(25);
    get().pushNotif({
      kind: 'ticket',
      title: '사연이 검수 대기열에 등록되었습니다',
      body: `"${post.title}" · 최대 12시간 내 검수 · 티켓 +25`,
      href: '/profile',
    });
    return post;
  },

  deletePost: (id) =>
    set((s) => ({ myPosts: s.myPosts.filter((p) => p.id !== id) })),

  /** 회차가 바뀌었으면 일일 보상을 리셋한다. */
  claimsToday: () => {
    const c = get().claims;
    return c.day === courtDay() ? c : { day: courtDay(), attend: false, ads: 0 };
  },

  claimAttend: () => {
    const c = get().claimsToday();
    if (c.attend) return false;
    set({ claims: { ...c, attend: true } });
    get().addTickets(10);
    get().showToast('출석 보상 티켓 10장을 받았습니다', 'ok');
    return true;
  },

  claimAd: () => {
    const c = get().claimsToday();
    if (c.ads >= 3) {
      get().showToast('오늘 광고 보상을 모두 받았습니다 · 내일 09시에 초기화', 'warn');
      return false;
    }
    set({ claims: { ...c, ads: c.ads + 1 } });
    get().addTickets(5);
    get().showToast(`광고 시청 완료 · 티켓 5장 (오늘 ${c.ads + 1}/3)`, 'ok');
    return true;
  },

  setPush: (key, value) =>
    set((s) => ({ push: { ...s.push, [key]: value } })),

  toggleBookmark: (caseId) => {
    const on = !get().bookmarks[caseId];
    set((s) => ({ bookmarks: { ...s.bookmarks, [caseId]: on } }));
    get().showToast(on ? '판례집 스크랩에 담았습니다' : '스크랩에서 뺐습니다', on ? 'ok' : 'default');
  },

  readNotif: (id) =>
    set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, unread: false } : n)) })),

  readAllNotifs: () => {
    const had = get().notifs.some((n) => n.unread);
    set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, unread: false })) }));
    if (had) get().showToast('알림을 모두 읽음으로 표시했습니다', 'ok');
  },

  clearNotifs: () => {
    set({ notifs: [] });
    get().showToast('알림함을 비웠습니다', 'ok');
  },

  toggleFollow: (nickname) => {
    const on = !get().followed[nickname];
    set((s) => ({ followed: { ...s.followed, [nickname]: on } }));
    get().showToast(on ? `${nickname} 님을 구독했습니다` : '구독을 해제했습니다', on ? 'ok' : 'default');
    if (on) {
      get().pushNotif({
        kind: 'opinion',
        title: `${nickname} 님을 구독했습니다`,
        body: '이 배심원의 새 판결문이 판례집 › 구독 배심원 코너에 모입니다',
        href: '/archive',
      });
    }
  },

  toggleReplyLike: (replyId) =>
    set((s) => ({ likedReplies: { ...s.likedReplies, [replyId]: !s.likedReplies[replyId] } })),

  addReply: (opinionId, body) => {
    const text = body.trim();
    if (!text) return;
    set((s) => ({
      myReplies: {
        ...s.myReplies,
        [opinionId]: [
          ...(s.myReplies[opinionId] ?? []),
          { id: `mr_${opinionId}_${Date.now()}`, body: text, at: '방금' },
        ],
      },
    }));
    get().showToast('반박을 등록했습니다', 'ok');
  },

  deleteReply: (opinionId, replyId) =>
    set((s) => ({
      myReplies: {
        ...s.myReplies,
        [opinionId]: (s.myReplies[opinionId] ?? []).filter((r) => r.id !== replyId),
      },
    })),

  judgedCount: () => Object.keys(get().judged).filter((id) => dailyPicks.includes(id)).length,

  /** 날짜가 바뀌었으면 오늘의 5건을 비운다. 판결문·티켓·구독 같은 누적분은 그대로 둔다. */
  rolloverDaily: () => {
    const today = courtDay();
    if (get().judgedDay === today) return false;
    set({ judged: {}, judgedDay: today, lastResult: null });
    return true;
  },

  reset: () => set({ judged: {}, lastResult: null, combo: 0 }),
}), {
  name: 'pyegeup-app-v1',
  storage: createJSONStorage(() => AsyncStorage),
  version: 1,
  partialize: (s) => ({
    me: s.me,
    tickets: s.tickets,
    combo: s.combo,
    judged: s.judged,
    judgedDay: s.judgedDay,
    likedOpinions: s.likedOpinions,
    likedReplies: s.likedReplies,
    myOpinions: s.myOpinions,
    myReplies: s.myReplies,
    reports: s.reports,
    blocked: s.blocked,
    deletedCases: s.deletedCases,
    hiddenOpinions: s.hiddenOpinions,
    peeked: s.peeked,
    statements: s.statements,
    followed: s.followed,
    bookmarks: s.bookmarks,
    myPosts: s.myPosts,
    push: s.push,
    transfersUsed: s.transfersUsed,
    claims: s.claims,
    notifs: s.notifs,
  }),
  merge: (persisted, current) => {
    // ── 저장본은 믿을 수 없다 ──
    // 앱 버전이 올라가 구조가 바뀌거나 쓰기가 중간에 끊기면, JSON은 멀쩡한데
    // 타입만 틀린 값이 들어온다. 그대로 쓰면 `judged[id]` 같은 접근이 렌더 도중 던지고
    // React 트리가 통째로 언마운트돼 **콘솔 에러 없이 화면이 백지**가 된다.
    // (실제로 judged: null / bookmarks: null에서 재현됨)
    const p = persisted && typeof persisted === 'object' ? persisted : {};
    const rec = (v, fb) => (v && typeof v === 'object' && !Array.isArray(v) ? v : fb);
    const arr = (v, fb) => (Array.isArray(v) ? v : fb);
    const num = (v, fb) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
    const str = (v, fb) => (typeof v === 'string' ? v : fb);

    const clean = {
      me: rec(p.me, current.me),
      tickets: num(p.tickets, current.tickets),
      combo: num(p.combo, current.combo),
      transfersUsed: num(p.transfersUsed, current.transfersUsed),
      judgedDay: str(p.judgedDay, current.judgedDay),
      push: rec(p.push, current.push),
      claims: rec(p.claims, current.claims),
      myPosts: arr(p.myPosts, current.myPosts),
    };
    // 레코드형(캐시·플래그 모음)은 전부 같은 규칙
    for (const k of [
      'judged', 'likedOpinions', 'likedReplies', 'myOpinions', 'myReplies',
      'reports', 'blocked', 'deletedCases', 'hiddenOpinions', 'peeked',
      'statements', 'followed', 'bookmarks',
    ]) {
      clean[k] = rec(p[k], current[k]);
    }

    const next = { ...current, ...clean };

    // 배열이 아닐 때(구버전 저장본)만 시드를 넣는다.
    // 빈 배열은 사용자가 직접 비운 것이므로 되살리면 안 된다.
    next.notifs = Array.isArray(p.notifs)
      ? p.notifs.filter((n) => n && typeof n === 'object' && typeof n.id === 'string')
      : seedNotifications.map((n) => ({ ...n }));
    // 어제 회차가 남아 있으면 데일리 5건만 비운다 (누적 지표는 유지).
    const today = courtDay();
    if (next.judgedDay !== today) {
      next.judged = {};
      next.judgedDay = today;
      next.lastResult = null;
    }
    return next;
  },
}));
