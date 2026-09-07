import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, press } from '../constants/theme';
import { useApp } from '../store/useApp';
import { courtById, CASE_STATUS } from '../constants/domain';
import { StampChip } from './Stamp';
import Countdown from './Countdown';

/**
 * 제목은 두 줄까지 읽고, 참여 수와 상태는 다음 줄에서 확인하는 목록 행.
 * 메타 정보는 좁은 화면에서 줄바꿈하며, 읽은 사건도 대비를 유지한다.
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
    <View style={s.row}>
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
        <Text style={[type.listTitle, { color: colors.text, fontSize: 16, lineHeight: 25 }]} numberOfLines={2}>
          <Text style={{ color: isClose && !judged ? colors.close : colors.textMuted }}>
            [{isClose && !judged ? '초박빙' : court.short}]{' '}
          </Text>
          {item.title}
        </Text>

        {/* 메타는 반드시 한 줄이다. 줄바꿈되는 순간 행 높이가 두 배가 되고
            목록의 밀도가 통째로 무너진다 — 각 조각에 numberOfLines와
            flexShrink: 0을 함께 걸어야 한다(하나만으로는 RN이 접는다). */}
        <View style={s.meta}>
          <Text style={[type.tiny, s.fixed, { color: colors.textFaint }]} numberOfLines={1}>
            {item.voteCount.toLocaleString()}표
          </Text>
          {/* 댓글수를 대괄호로 적는 건 한국 게시판의 오래된 관습이다.
              "판결문 96"보다 짧고, 숫자가 바로 눈에 띈다. */}
          <Text style={[type.tiny, s.fixed, { color: colors.textMuted }]} numberOfLines={1}>
            의견 {item.opinionCount.toLocaleString()}
          </Text>


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
  main: { flex: 1, minWidth: 0, paddingVertical: 16, gap: 8, borderRadius: radius.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 4 },
  fixed: { flexShrink: 0 },
  bookmark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
