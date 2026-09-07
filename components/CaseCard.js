import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, press } from '../constants/theme';
import { useApp } from '../store/useApp';
import { courtById, caseNoOf, CASE_STATUS } from '../constants/domain';
import { StampChip } from './Stamp';
import Countdown from './Countdown';

/**
 * 사건 목록 한 줄.
 *
 * 카드가 아니라 "행"이다. 이전에는 radius 12 / border 1 / padding 15 박스에
 * 제목 + 쟁점 2줄 + 아이콘 메타를 담아, 390px 화면에 사건이 2.5개밖에 안 들어갔다.
 * 디시·클리앙·에타 같은 실제 커뮤니티 게시판은 한 화면에 12~15줄이 뜨고,
 * 그 밀도가 "훑어보는 재미"의 전부다.
 *
 * 그래서 바꾼 것:
 *   - 박스 → 하단 헤어라인 한 줄 (`CaseList`가 흰 서류판을 깔아준다)
 *   - 법원 색 띠 + 색 dot + 번호 뱃지 3중 표식 → 말머리 `[직장]` 하나
 *   - 쟁점 요약 줄 삭제 (제목이 이미 쟁점이다)
 *   - 아이콘 메타(사람·문서·자물쇠) → `1,240표 · 판결문 96` 텍스트
 *   - 확정 사건은 유죄율 + 도장으로 즉시 구분
 *
 * 북마크 버튼은 행 Pressable "밖에" 형제로 둔다. 안에 넣으면 웹에서
 * <button> 중첩이 되어 콘솔 경고가 뜨고, 중첩 버튼은 스크린리더에서도
 * 바깥 버튼 하나로만 읽힌다.
 */
// compact은 예전에 '쟁점 요약 줄을 숨긴다'는 뜻이었다. 이제 행에는 쟁점 줄이 없어
// 모든 행이 항상 compact이므로 호출부 호환을 위해 받기만 하고 쓰지 않는다.
export default function CaseCard({ item, onPress, index, judged, compact, bookmarkable = true }) {
  const court = courtById(item.courtId);
  const marked = useApp((s) => !!s.bookmarks[item.id]);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const status = CASE_STATUS[item.status];
  const isClose = item.difficulty === 'close';
  const settled = item.status === 'closed';
  const guiltyPct = Math.round(item.guiltyRate * 100);

  return (
    <View style={[s.row, judged && { opacity: 0.55 }]}>
      {/* 좌측 열은 "이 행의 신분"을 적는 자리다.
          데일리 목록에서는 순번(디시의 글번호 열), 판례집에서는 확정 도장. */}
      {index != null ? (
        <View style={s.gutter}>
          {judged ? (
            <Ionicons name="checkmark" size={13} color={colors.innocent} />
          ) : (
            <Text style={[type.docNo, { color: colors.textFaint }]}>{index}</Text>
          )}
        </View>
      ) : settled ? (
        <StampChip label={guiltyPct >= 50 ? '유죄' : '무죄'} tone={guiltyPct >= 50 ? 'guilty' : 'innocent'} />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${court.name} ${item.title}${judged ? ', 판결 완료' : ''}`}
        onPress={onPress}
        style={({ pressed }) => [s.main, pressed && press.surface]}
      >
        {/* 한 줄로 끊는다. 게시판이 훑어지는 이유는 모든 행의 높이가 같아서다 —
            제목이 두 줄로 넘어가는 순간 눈이 리듬을 잃는다. */}
        <Text style={[type.listTitle, { color: colors.text }]} numberOfLines={1}>
          <Text style={{ color: isClose && !judged ? colors.close : colors.textMuted }}>
            [{isClose && !judged ? '초박빙' : court.short}]{' '}
          </Text>
          {item.title}
        </Text>

        {/* 메타는 반드시 한 줄이다. 줄바꿈되는 순간 행 높이가 두 배가 되고
            목록의 밀도가 통째로 무너진다 — 각 조각에 numberOfLines와
            flexShrink: 0을 함께 걸어야 한다(하나만으로는 RN이 접는다). */}
        <View style={s.meta}>
          <Text style={[type.docNo, s.fixed, { color: colors.textFaint }]} numberOfLines={1}>
            {caseNoOf(item)}
          </Text>
          <Dot />
          <Text style={[type.tiny, s.fixed, { color: colors.textFaint }]} numberOfLines={1}>
            {item.voteCount.toLocaleString()}표
          </Text>
          {/* 댓글수를 대괄호로 적는 건 한국 게시판의 오래된 관습이다.
              "판결문 96"보다 짧고, 숫자가 바로 눈에 띈다. */}
          <Text style={[type.tiny, s.fixed, { color: colors.textMuted }]} numberOfLines={1}>
            [{item.opinionCount.toLocaleString()}]
          </Text>

          <View style={{ flex: 1, minWidth: 6 }} />

          {settled || judged ? (
            <Text style={[type.tiny, s.fixed, { color: guiltyPct >= 50 ? colors.guilty : colors.innocent }]} numberOfLines={1}>
              {guiltyPct >= 50 ? `유죄 ${guiltyPct}%` : `무죄 ${100 - guiltyPct}%`}
            </Text>
          ) : item.status === 'open' ? (
            <Countdown minutes={item.closesInMin} suffix="" style={s.fixed} />
          ) : (
            <Text style={[type.tiny, s.fixed, { color: colors.textFaint }]} numberOfLines={1}>{status?.label}</Text>
          )}
        </View>
      </Pressable>

      {bookmarkable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={marked ? '스크랩 해제' : '판례집에 스크랩'}
          accessibilityState={{ selected: marked }}
          onPress={() => toggleBookmark(item.id)}
          style={({ pressed }) => [s.bookmark, pressed && press.control]}
        >
          <Ionicons
            name={marked ? 'bookmark' : 'bookmark-outline'}
            size={15}
            color={marked ? colors.accent : colors.textFaint}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const Dot = () => <Text style={[type.tiny, { color: colors.borderSoft }]}>·</Text>;

/**
 * 사건 행을 얹는 흰 서류판. 미색 종이 배경 위에 흰 판을 깔아야
 * 목록이 "게시판"으로 읽히고, 행 사이 헤어라인도 이 위에서만 보인다.
 */
export function CaseList({ children, style }) {
  return <View style={[s.list, style]}>{children}</View>;
}

const s = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  // 디시의 글번호 열과 같은 자리. 데일리 5건에서 몇 번째인지 알려준다.
  gutter: { width: 16, alignItems: 'center' },
  main: { flex: 1, minWidth: 0, paddingVertical: 9, gap: 3, borderRadius: radius.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fixed: { flexShrink: 0 },
  bookmark: { width: 40, height: 40, marginVertical: -6, alignItems: 'center', justifyContent: 'center' },
});
