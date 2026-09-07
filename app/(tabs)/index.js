import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useScrollToTop } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, radius, type, shadow, layout, press } from '../../constants/theme';
import { cases, dailyPicks, caseList, pushTimeline, liveTicker, courtActivity } from '../../data/mock';
import { caseNoOf } from '../../constants/domain';
import { useApp } from '../../store/useApp';
import CaseCard, { CaseList } from '../../components/CaseCard';
import TicketPill from '../../components/TicketPill';
import Countdown from '../../components/Countdown';
import NotifBell from '../../components/NotifBell';
import Avatar from '../../components/Avatar';
import LiveCount from '../../components/LiveCount';
import { ListSkeleton } from '../../components/Skeleton';
import useRefresh from '../../components/useRefresh';
import { Card, SectionTitle, ProgressDots} from '../../components/ui';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '심야 개정 중';
  if (h < 12) return '오전 공판 중';
  if (h < 18) return '오후 공판 중';
  return '야간 개정 중';
};

/** 2026. 9. 6. (목) — 법원 게시물은 언제나 날짜를 먼저 적는다. */
const today = () => {
  const d = new Date();
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${w})`;
};

export default function HomeScreen() {
  // 활성 탭을 다시 누르면 맨 위로. iOS·Android 공통 관습인데 빠져 있었다.
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const judged = useApp((s) => s.judged);
  const combo = useApp((s) => s.combo);
  const showToast = useApp((s) => s.showToast);
  const tickets = useApp((s) => s.tickets);

  const doneCount = dailyPicks.filter((id) => judged[id]).length;
  const nextCase = dailyPicks.find((id) => !judged[id]);
  const hot = caseList.filter((c) => c.status !== 'open').slice(0, 2);
  const allDone = doneCount === 5;
  const comboMult = combo >= 10 ? '×2.0' : combo >= 5 ? '×1.5' : combo >= 3 ? '×1.2' : '×1.0';

  const { refreshing, onRefresh } = useRefresh('사건 목록을 새로 불러왔습니다');

  // 앱을 켜둔 채 09:00을 넘길 수 있다. 홈에 돌아올 때마다 회차가 바뀌었는지 확인한다.
  const rolloverDaily = useApp((s) => s.rolloverDaily);
  useFocusEffect(
    React.useCallback(() => {
      if (rolloverDaily()) showToast('오늘의 사건 5건이 새로 배정되었습니다', 'ok');
    }, [rolloverDaily, showToast])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { paddingTop: insets.top + 10, paddingBottom: 36, paddingHorizontal: 16, gap: 18 },
          layout.content,
        ]}
        ref={listRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {/* 헤더 */}
        <View style={s.header}>
          <View style={{ gap: 2 }}>
            <Text style={[type.h1, { color: colors.text }]}>재판소</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              {today()} · {greeting()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`티켓 충전, 보유 ${tickets}장`}
              onPress={() => router.push('/tickets')}
              style={({ pressed }) => [{ paddingVertical: 11 }, pressed && press.control]}
            >
              <TicketPill />
            </Pressable>
            <NotifBell />
          </View>
        </View>

        <LiveTicker />

        {/* 데일리 5건 */}
        <View
          style={[
            s.dailyCard,
            allDone && { borderColor: colors.innocent, backgroundColor: colors.innocentSoft },
          ]}
        >
          <View style={s.dailyTop}>
            <View style={{ gap: 5, flex: 1 }}>
              <Text style={[type.tiny, { color: colors.textFaint }]}>오늘 배당 5건</Text>
              <Text style={[type.h2, { color: colors.text }]}>
                {allDone ? '오늘 공판 종료' : `${doneCount}건 판결 · ${5 - doneCount}건 미결`}
              </Text>
            </View>
            {combo > 0 ? (
              <View style={s.comboBox}>
                <Text style={[type.mono, { color: colors.close }]}>{combo}연속 적중</Text>
              </View>
            ) : null}
          </View>

          <ProgressDots total={5} done={doneCount} />

          <Text style={[type.small, { color: colors.textMuted }]}>
            {allDone
              ? '내일 09:00 다시 개정합니다'
              : `5건 완결 시 판사 지수 +15 · 콤보 ${comboMult}`}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={allDone ? '오늘의 재판 완료' : '다음 사건 심판하기'}
            disabled={allDone}
            onPress={() => nextCase && router.push(`/case/${nextCase}`)}
            style={({ pressed }) => [
              s.cta,
              allDone && { backgroundColor: colors.surfaceAlt },
              pressed && press.cta,
            ]}
          >
            <Text style={[type.h3, { color: allDone ? colors.textMuted : colors.onAccent }]}>
              {allDone
                ? '내일 09:00 개정'
                : `${caseNoOf(cases[nextCase])} 심리 시작`}
            </Text>
          </Pressable>
        </View>

        {/* 내 사건 실시간 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 사건 실시간 현황 보기"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [s.liveCard, pressed && press.surface]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={s.liveDot} />
            <Text style={[type.tiny, { color: colors.guilty }]}>내 사건 심리 중</Text>
            <Text style={[type.tiny, { color: colors.textFaint, flex: 1, textAlign: 'right' }]}>
              <Countdown minutes={176} prefix="선고까지 " />
            </Text>
          </View>
          <Text style={[type.bodyStrong, { color: colors.text }]}>지금 12명이 당신을 심판하고 있습니다</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={[type.docNo, { color: colors.textFaint }]}>2026고합4821</Text>
            <Text style={[type.small, { color: colors.textMuted }]} numberOfLines={1}>
              회의 중 몰래 딴짓 ·
            </Text>
            <LiveCount from={640} suffix="표" style={{ ...type.small, color: colors.textMuted }} />
          </View>
        </Pressable>

        {/* 오늘의 5건 */}
        <View>
          <SectionTitle title="오늘 배당된 사건" />
          {refreshing ? (
            <ListSkeleton count={3} />
          ) : (
            <CaseList>
              {dailyPicks.map((id, i) => (
                <FadeIn key={id} delay={i * 45}>
                  <CaseCard
                    item={cases[id]}
                    index={i + 1}
                    judged={!!judged[id]}
                    onPress={() => router.push(`/case/${id}`)}
                  />
                </FadeIn>
              ))}
            </CaseList>
          )}
        </View>

        {/* 화제의 재판 */}
        <View>
          <SectionTitle title="화제의 재판" action="판례집" onAction={() => router.push('/archive')} />
          <CaseList>
            {hot.map((c) => (
              <CaseCard key={c.id} item={c} compact onPress={() => router.push(`/case/${c.id}`)} />
            ))}
          </CaseList>
        </View>

        {/* 지금 법정에서 — 커뮤니티가 살아 있다는 신호 */}
        <View>
          <SectionTitle title="지금 법정에서" action="법원" onAction={() => router.push('/court')} />
          <Card style={{ gap: 0, paddingVertical: 6 }}>
            {courtActivity.map((a, i) => (
              <Pressable
                key={a.id}
                accessibilityRole="link"
                accessibilityLabel={`${a.actor} ${a.verb}`}
                onPress={() => router.push(`/u/${encodeURIComponent(a.actor)}`)}
                style={({ pressed }) => [
                  s.activityRow,
                  i > 0 && { borderTopWidth: 1, borderTopColor: colors.borderSoft },
                  pressed && press.control,
                ]}
              >
                <Avatar name={a.actor} size={26} />
                <View style={{ flex: 1 }}>
                  <Text style={[type.small, { color: colors.textMuted }]} numberOfLines={1}>
                    <Text style={{ color: colors.text }}>{a.actor}</Text>
                    {a.verb}
                  </Text>
                  {a.target ? (
                    <Text style={[type.tiny, { color: colors.textFaint }]} numberOfLines={1}>
                      "{a.target}"
                    </Text>
                  ) : null}
                </View>
                <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>{a.at}</Text>
              </Pressable>
            ))}
          </Card>
        </View>

        {/* 오늘의 일정 */}
        <Card style={{ gap: 12 }}>
          <Text style={[type.h3, { color: colors.text }]}>오늘의 일정</Text>
          {pushTimeline.map((p, i) => {
            const past = Number(p.time.slice(0, 2)) <= new Date().getHours();
            return (
              <View key={p.time} style={s.timelineRow}>
                <View style={[s.timeDot, past && { backgroundColor: colors.accent, borderColor: colors.accent }]} />
                <Text style={[type.mono, { color: past ? colors.accent : colors.textFaint, width: 44 }]}>{p.time}</Text>
                <Text style={[type.small, { color: past ? colors.text : colors.textMuted, flex: 1 }]}>{p.text}</Text>
              </View>
            );
          })}
        </Card>

        {/* 투고 유도 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 사연 투고하기"
          onPress={() => router.push('/write')}
          style={({ pressed }) => [s.writeCta, shadow.card, pressed && press.surface]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[type.h3, { color: colors.onAccent, fontSize: 16 }]}>내 흑역사를 재판에 넘기기</Text>
            <Text style={[type.tiny, { color: 'rgba(250,249,245,0.72)' }]}>
              검수 통과 시 티켓 25장 · 하루 2건까지
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={colors.onAccent} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

/** 상단 한 줄 속보. 5초마다 다음 소식으로 세로 크로스페이드된다. */
function LiveTicker() {
  const [i, setI] = useState(0);
  const anim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const t = setInterval(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setI((v) => (v + 1) % liveTicker.length);
        Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.ticker} accessibilityLiveRegion="polite">
      <Text style={[type.label, { color: colors.brand, fontSize: 10 }]}>속보</Text>
      <Animated.Text
        numberOfLines={1}
        style={[
          type.tiny,
          {
            color: colors.textMuted,
            flex: 1,
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
          },
        ]}
      >
        {liveTicker[i]}
      </Animated.Text>
    </View>
  );
}

/** 리스트가 한 번에 쏟아지지 않게 살짝 계단식으로 올린다. */
function FadeIn({ children, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  dailyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  comboBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.close,
    backgroundColor: colors.closeSoft,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  liveCard: {
    gap: 7,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.guilty,
    backgroundColor: colors.guiltySoft,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.guilty },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  writeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: 17,
  },
});
