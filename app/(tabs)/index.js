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
import { ProgressDots } from '../../components/ui';

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
  const onboardingCompleted = useApp((s) => s.onboardingCompleted);
  const showToast = useApp((s) => s.showToast);
  const rolloverDaily = useApp((s) => s.rolloverDaily);
  const { refreshing, onRefresh } = useRefresh('사건 목록을 새로 불러왔습니다');
  useFocusEffect(React.useCallback(() => {
    if (rolloverDaily()) showToast('오늘의 사건 5건이 새로 배정되었습니다', 'ok');
  }, [rolloverDaily, showToast]));

  const visible = (c) => c && !deleted[c.id] && !blocked[c.author];
  const todayCases = dailyPicks.map((id) => cases[id]).filter(visible);
  const total = todayCases.length;
  const done = todayCases.filter((c) => judged[c.id]).length;
  const allDone = total > 0 && done === total;
  const next = todayCases.find((c) => !judged[c.id]);
  const rows = filter === 'today' ? todayCases
    : filter === 'discussed' ? caseList.filter(visible).slice().sort((a, b) => b.opinionCount - a.opinionCount)
    : caseList.filter((c) => visible(c) && c.status === 'closed');
  const posts = myPosts.filter((c) => !deleted[c.id]);

  return (
    <View style={s.screen}>
      <ScrollView ref={listRef} style={{ flex: 1 }}
        contentContainerStyle={[layout.content, s.content, { paddingTop: insets.top + 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
        <View style={s.header}>
          <View style={s.headerCopy}>
            <Text numberOfLines={1} style={[type.h1, s.ink]}>국민재판소</Text>
            <Text numberOfLines={1} style={[type.tiny, s.muted]}>애매한 일, 혼자 판단하지 마세요.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="보유 티켓 보기"
            onPress={() => router.push('/tickets')} style={s.ticket}><TicketPill /></Pressable>
          <NotifBell />
        </View>

        <View style={s.dailyBrief}>
          <View style={s.dailyTop}>
            <View style={s.flexText}>
              <Text style={[type.small, s.muted]}>{next ? `${courtById(next.courtId).name} · 오늘의 사건` : '오늘의 재판'}</Text>
              <Text style={[type.h1, s.ink, { marginTop: 10 }]}>
                {next ? next.title : allDone ? '오늘의 판단을 모두 남겼어요' : '새로운 사건을 기다리고 있어요'}
              </Text>
              {next ? <Text numberOfLines={2} style={[type.body, s.muted, { marginTop: 10 }]}>{next.situation}</Text> : null}
            </View>
            <Text numberOfLines={1} style={[type.mono, { color: colors.text }]}>{done}/{total}</Text>
          </View>
          <View style={s.dailyBottom}>
            <View style={[s.flexText, { gap: 8 }]}>
              <ProgressDots total={total} done={done} />
              <Text style={[type.tiny, s.muted]}>{allDone ? '오늘의 참여 완료' : '오늘의 재판 완주 시 +15점'}</Text>
            </View>
            {next ? (
              <Pressable accessibilityRole="button" onPress={() => router.push(`/case/${next.id}`)}
                style={({ pressed }) => [s.nextButton, pressed && press.cta]}>
                <Text numberOfLines={1} maxFontSizeMultiplier={1.2} style={[type.small, { color: colors.onAccent }]}>
                  {done ? '다음 사연 읽기' : '읽고 판단하기'}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={colors.onAccent} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {!onboardingCompleted ? <Pressable accessibilityRole="button" accessibilityLabel="참여 방법 보기"
          onPress={() => router.push('/onboarding')} style={({ pressed }) => [s.helpRow, pressed && press.control]}>
          <Ionicons name="help-circle-outline" size={17} color={colors.textMuted} />
          <Text style={[type.small, s.muted, s.flexText]}>유죄·무죄만 고르면 되나요?</Text>
          <Text style={[type.small, s.ink]}>참여 방법 ›</Text>
        </Pressable> : null}

        <View style={s.boardHeading}>
          <Text accessibilityRole="header" numberOfLines={1} style={[type.h2, s.ink, s.flexText]}>누구 잘못일까요?</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/write')}
            style={({ pressed }) => [s.writeButton, pressed && press.cta]}>
            <Ionicons name="create-outline" size={16} color={colors.onAccent} />
            <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={[type.small, { color: colors.onAccent }]}>사연 쓰기</Text>
          </Pressable>
        </View>
        <View accessibilityRole="tablist" style={s.tabs}>
          {FILTERS.map(([key, label]) => (
            <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: filter === key }}
              onPress={() => setFilter(key)} style={({ pressed }) => [s.tab, filter === key && s.activeTab, pressed && press.control]}>
              <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={[type.small, { color: filter === key ? colors.text : colors.textFaint, fontWeight: filter === key ? '700' : '400' }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {filter === 'today' ? (
          <Text style={[type.tiny, s.muted, { paddingVertical: 10 }]}>매일 오전 9시에 새로운 사건이 열립니다</Text>
        ) : null}
        {refreshing ? <ListSkeleton count={3} /> : rows.length ? rows.map((c) => (
          <StoryRow key={c.id} item={c} judged={!!judged[c.id]} onPress={() => router.push(`/case/${c.id}`)} />
        )) : <Text style={[type.small, s.muted, s.empty]}>아직 표시할 사건이 없습니다.</Text>}

        {posts.length > 0 && <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}
          style={({ pressed }) => [s.notice, { marginTop: 20 }, pressed && press.surface]}>
          <Text style={[type.small, s.ink, { flex: 1 }]}>내가 올린 사연 {posts.length}건</Text>
          <Text style={[type.tiny, s.muted]}>확인하기 ›</Text>
        </Pressable>}

        <View style={s.footer}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/onboarding')} style={s.textButton}>
            <Text style={[type.tiny, s.muted]}>이용 안내</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/legal?doc=eula')} style={s.textButton}>
            <Text style={[type.tiny, s.muted]}>커뮤니티 규칙</Text>
          </Pressable>
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
        <Text numberOfLines={1} style={[type.tiny, s.muted, s.fixed]}>{courtById(item.courtId).short}</Text>
        <Text numberOfLines={1} style={[type.tiny, s.muted, s.flexText]}>{item.author}</Text>
        {closed ? <Text numberOfLines={1} style={[type.tiny, s.fixed, { color: guilty ? colors.guilty : colors.innocent }]}>{guilty ? '유죄' : '무죄'} 종결</Text>
          : judged ? <Text numberOfLines={1} style={[type.tiny, s.fixed, { color: colors.innocent }]}>참여 완료</Text> : null}
      </View>
      <Text numberOfLines={2} style={[s.storyTitle, s.ink]}>{item.title}</Text>
      <View style={[s.storyMeta, { flexWrap: 'wrap' }]}>
        <Text style={[type.tiny, s.muted]}>{item.voteCount.toLocaleString()}명 참여</Text>
        <Text style={[type.tiny, s.muted]}>·</Text>
        <Text style={[type.tiny, s.ink]}>의견 {item.opinionCount.toLocaleString()}</Text>
        <View style={s.flexText} />
        {!closed && !judged ? <Text numberOfLines={1} style={[type.tiny, s.muted]}>{formatRemaining(item.closesInMin)}</Text> : null}
      </View>
    </Pressable>
  );
}

function formatRemaining(minutes) {
  if (minutes < 60) return `${minutes}분 후 마감`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 후 마감`;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  ink: { color: colors.text },
  muted: { color: colors.textFaint },
  fixed: { flexShrink: 0 },
  flexText: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 18 },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 4 },
  ticket: { minHeight: 44, justifyContent: 'center' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSoft },
  dailyBrief: { gap: 24, marginTop: 8, padding: 22, borderRadius: 12, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface },
  helpRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  dailyTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dailyBottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  nextButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.accent },
  boardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 12, gap: 8 },
  writeButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  tab: { flex: 1, minWidth: 0, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.text },
  textButton: { minHeight: 44, justifyContent: 'center' },
  story: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  storyTitle: { fontSize: 18, lineHeight: 27, fontWeight: '600', letterSpacing: -0.4, marginVertical: 9 },
  storyMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  footer: { marginTop: 30, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderSoft, flexDirection: 'row', gap: 18 },
  empty: { paddingVertical: 32 },
});
