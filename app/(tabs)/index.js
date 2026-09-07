import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useScrollToTop } from 'expo-router';
import { colors, radius, type, layout, press } from '../../constants/theme';
import { cases, dailyPicks, caseList } from '../../data/mock';
import { courtById } from '../../constants/domain';
import { useApp } from '../../store/useApp';
import NotifBell from '../../components/NotifBell';
import TicketPill from '../../components/TicketPill';
import useRefresh from '../../components/useRefresh';
import { ListSkeleton } from '../../components/Skeleton';

const FILTERS = [['today', '오늘의 재판'], ['discussed', '토론 많은'], ['closed', '판결 완료']];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const [filter, setFilter] = useState('today');
  const judged = useApp((s) => s.judged);
  const blocked = useApp((s) => s.blocked);
  const deleted = useApp((s) => s.deletedCases);
  const myPosts = useApp((s) => s.myPosts);
  const showToast = useApp((s) => s.showToast);
  const rolloverDaily = useApp((s) => s.rolloverDaily);
  const { refreshing, onRefresh } = useRefresh('사건 목록을 새로 불러왔습니다');
  useFocusEffect(React.useCallback(() => {
    if (rolloverDaily()) showToast('오늘의 사건 5건이 새로 배정되었습니다', 'ok');
  }, [rolloverDaily, showToast]));

  const visible = (c) => c && !deleted[c.id] && !blocked[c.author];
  const todayCases = dailyPicks.map((id) => cases[id]).filter(visible);
  const done = todayCases.filter((c) => judged[c.id]).length;
  const next = todayCases.find((c) => !judged[c.id]);
  const rows = filter === 'today' ? todayCases
    : filter === 'discussed' ? caseList.filter(visible).slice().sort((a, b) => b.opinionCount - a.opinionCount)
    : caseList.filter((c) => visible(c) && c.status === 'closed');
  const undecided = caseList.filter((c) => visible(c) && c.status === 'open' && c.difficulty === 'close');
  const posts = myPosts.filter((c) => !deleted[c.id]);

  return (
    <View style={s.screen}>
      <ScrollView ref={listRef} style={{ flex: 1 }}
        contentContainerStyle={[layout.content, s.content, { paddingTop: insets.top + 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={[type.h1, s.ink]}>국민재판소</Text>
            <Text style={[type.tiny, s.muted]}>살다 보면, 누구 잘못인지 궁금한 순간.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="보유 티켓 보기"
            onPress={() => router.push('/tickets')} style={s.ticket}><TicketPill /></Pressable>
          <NotifBell />
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [s.notice, pressed && press.surface]}>
          <Text style={[type.tiny, s.muted]}>이용 안내</Text>
          <Text style={[type.small, s.ink, { flex: 1 }]}>처음 오셨나요? 이렇게 참여해요</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
        </Pressable>

        <View style={s.boardHeading}>
          <Text accessibilityRole="header" style={[type.h2, s.ink]}>누구 잘못일까요?</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/write')}
            style={({ pressed }) => [s.writeButton, pressed && press.cta]}>
            <Ionicons name="create-outline" size={16} color={colors.onAccent} />
            <Text style={[type.small, { color: colors.onAccent }]}>사연 쓰기</Text>
          </Pressable>
        </View>
        <View accessibilityRole="tablist" style={s.tabs}>
          {FILTERS.map(([key, label]) => (
            <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: filter === key }}
              onPress={() => setFilter(key)} style={({ pressed }) => [s.tab, filter === key && s.activeTab, pressed && press.control]}>
              <Text style={[type.small, { color: filter === key ? colors.text : colors.textFaint, fontWeight: filter === key ? '700' : '400' }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {filter === 'today' && (
          <View style={s.progressRow}>
            <Text style={[type.tiny, s.muted, { flex: 1 }]}>{done}/{todayCases.length}건 참여 · 매일 오전 9시 새 사건</Text>
            {next && <Pressable accessibilityRole="button" onPress={() => router.push(`/case/${next.id}`)} style={s.textButton}>
              <Text style={[type.tiny, s.ink]}>{done ? '이어서 판결' : '첫 판결 하기'} ›</Text>
            </Pressable>}
          </View>
        )}
        {refreshing ? <ListSkeleton count={3} /> : rows.length ? rows.map((c) => (
          <StoryRow key={c.id} item={c} judged={!!judged[c.id]} onPress={() => router.push(`/case/${c.id}`)} />
        )) : <Text style={[type.small, s.muted, s.empty]}>아직 표시할 사건이 없습니다.</Text>}

        {undecided.length > 0 && (
          <View style={s.secondary}>
            <Text accessibilityRole="header" style={[type.h3, s.ink]}>쉽게 못 고르겠는 사건</Text>
            <Text style={[type.tiny, s.muted, { marginTop: 4 }]}>사연을 읽고, 내 생각부터 남겨보세요.</Text>
            {undecided.slice(0, 2).map((c) => (
              <Pressable key={c.id} accessibilityRole="button" onPress={() => router.push(`/case/${c.id}`)}
                style={({ pressed }) => [s.related, pressed && press.surface]}>
                <Text style={[type.small, s.ink, { flex: 1 }]} numberOfLines={2}>{c.title}</Text>
                <Text style={[type.tiny, s.muted]}>{c.opinionCount.toLocaleString()} 의견</Text>
              </Pressable>
            ))}
          </View>
        )}

        {posts.length > 0 && <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}
          style={({ pressed }) => [s.notice, { marginTop: 20 }, pressed && press.surface]}>
          <Text style={[type.small, s.ink, { flex: 1 }]}>내가 올린 사연 {posts.length}건</Text>
          <Text style={[type.tiny, s.muted]}>확인하기 ›</Text>
        </Pressable>}

        <View style={s.footer}>
          <Text style={[type.tiny, s.muted]}>내 얘기도 다른 사람에게 물어보고 싶다면</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/write')} style={s.textButton}>
            <Text style={[type.small, s.ink, { textDecorationLine: 'underline' }]}>익명으로 사연 남기기</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/onboarding')} style={s.textButton}>
              <Text style={[type.tiny, s.muted]}>이용 방법</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push('/legal?doc=eula')} style={s.textButton}>
              <Text style={[type.tiny, s.muted]}>커뮤니티 규칙</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StoryRow({ item, judged, onPress }) {
  const closed = item.status === 'closed';
  const guilty = item.guiltyRate >= 0.5;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}, 의견 ${item.opinionCount}개${judged ? ', 참여 완료' : ''}`}
      onPress={onPress} style={({ pressed }) => [s.story, pressed && press.surface]}>
      <View style={s.storyMeta}>
        <Text style={[type.tiny, s.muted]}>{courtById(item.courtId).short}</Text>
        <Text numberOfLines={1} style={[type.tiny, s.muted, { flex: 1 }]}>{item.author}</Text>
        {closed ? <Text style={[type.tiny, { color: guilty ? colors.guilty : colors.innocent }]}>{guilty ? '유죄' : '무죄'}로 종결</Text>
          : judged ? <Text style={[type.tiny, { color: colors.innocent }]}>참여 완료</Text> : null}
      </View>
      <Text numberOfLines={2} style={[type.listTitle, s.ink, { fontWeight: '500', marginVertical: 6 }]}>{item.title}</Text>
      <View style={s.storyMeta}>
        <Text style={[type.tiny, s.muted]}>{item.voteCount.toLocaleString()}명 참여</Text>
        <Text style={[type.tiny, s.muted]}>·</Text>
        <Text style={[type.tiny, s.ink]}>의견 {item.opinionCount.toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  ink: { color: colors.text },
  muted: { color: colors.textFaint },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 18 },
  ticket: { minHeight: 44, justifyContent: 'center' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSoft },
  boardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 12, gap: 8 },
  writeButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabs: { flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  tab: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  textButton: { minHeight: 44, justifyContent: 'center' },
  story: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  storyMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondary: { marginTop: 28, paddingTop: 18, borderTopWidth: 2, borderTopColor: colors.border },
  related: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  footer: { marginTop: 30, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  empty: { paddingVertical: 32 },
});
