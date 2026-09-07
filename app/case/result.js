import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, dark, radius, type, layout, press } from '../../constants/theme';
import { caseNoOf } from '../../constants/domain';
import { cases, dailyPicks, opinionsFor } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Card, Button, Chip, SectionTitle } from '../../components/ui';
import OpinionCard from '../../components/OpinionCard';
import Stamp from '../../components/Stamp';

/** 판결 후 랜덤 보상 (기획서 05) */
function rollReward() {
  const r = Math.random();
  if (r < 0.02) return { kind: '다이아 판결', tickets: 20, color: colors.info, icon: 'diamond' };
  if (r < 0.12) return { kind: '황금 티켓', tickets: 5, color: colors.ticket, icon: 'star' };
  return { kind: '일반 보상', tickets: 1, color: colors.textMuted, icon: 'ticket' };
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const item = cases[id] ?? cases[useApp.getState().lastResult?.caseId] ?? cases.c1;

  const judged = useApp((s) => s.judged[item.id]);
  const addTickets = useApp((s) => s.addTickets);
  const combo = useApp((s) => s.combo);
  const judgedMap = useApp((s) => s.judged);
  const showToast = useApp((s) => s.showToast);

  const [phase, setPhase] = useState('counting'); // counting → revealed
  const [reward] = useState(rollReward);
  const [rewardTaken, setRewardTaken] = useState(false);

  const anim = useRef(new Animated.Value(0.5)).current;
  const [displayRate, setDisplayRate] = useState(0.5);

  // 조명. 0 = 암전(개표 중) · 1 = 종이(판결 확정).
  //
  // 앱 전체가 종이 라이트인데 이 화면만 처음부터 어두우면 그냥 다른 화면일 뿐이다.
  // 밝게 읽다가 개표에서 불이 꺼지고, 확정되는 순간 다시 켜져야 그게 "선고"로 읽힌다.
  // 색 보간이라 useNativeDriver는 쓸 수 없다.
  const lights = useRef(new Animated.Value(0)).current;

  const finalRate = item.guiltyRate;
  const myGuilty = judged?.guilty ?? false;
  const majorityGuilty = finalRate >= 0.5;
  const correct = myGuilty === majorityGuilty;
  const isClose = finalRate >= 0.45 && finalRate <= 0.55;
  const isUnanimous = finalRate >= 0.9 || finalRate <= 0.1;
  const margin = Math.round(Math.abs(finalRate - 0.5) * 2 * item.voteCount);
  // 다수의견 쪽의 득표율 — 유죄율을 그대로 쓰면 무죄 다수일 때 숫자가 뒤집힌다
  const majorityPct = Math.round((majorityGuilty ? finalRate : 1 - finalRate) * 100);

  // 판사 지수 계산 (기획서 03)
  let points = 0;
  if (correct) {
    points += 10;
    if (isClose) points += 20;
    if (isUnanimous) points += 2;
    if (myGuilty && judged?.sentence != null && Math.abs(judged.sentence - item.avgSentence) <= 1) points += 5;
  }
  const comboMult = combo >= 10 ? 2 : combo >= 5 ? 1.5 : combo >= 3 ? 1.2 : 1;
  const totalPoints = Math.round(points * comboMult);

  useEffect(() => {
    // 게이지 역전 연출 — 실제 투표 순서대로 3초간 재생
    const listener = anim.addListener(({ value }) => setDisplayRate(value));
    Animated.sequence([
      Animated.timing(anim, { toValue: finalRate > 0.5 ? 0.34 : 0.66, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(anim, { toValue: finalRate > 0.5 ? 0.62 : 0.41, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(anim, { toValue: finalRate, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
      setPhase('revealed');
      Animated.timing(lights, { toValue: 1, duration: 560, useNativeDriver: false }).start();
    });
    return () => anim.removeListener(listener);
  }, []);

  const pct = Math.round(displayRate * 100);
  // 내가 선 편의 상위 판결문 2건만. 반대편 의견은 사건 상세에서 보게 둔다.
  const sameSide = opinionsFor(item.id)
    .filter((o) => o.guilty === myGuilty)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 2);
  const nextCase = dailyPicks.find((cid) => !judgedMap[cid]);
  const doneCount = dailyPicks.filter((cid) => judgedMap[cid]).length;

  const counting = phase === 'counting';

  // 개표 중에는 화면 전체가 암전된다. 게이지 하나만 남기고 전부 지운다 —
  // 이 3초가 이 앱에서 가장 극적인 순간이고, 곁가지가 하나라도 있으면 힘이 빠진다.
  if (counting) {
    return (
      <View style={[s.blackout, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="light" />
        <View style={[{ width: '100%', gap: 26, paddingHorizontal: 26 }, layout.content]}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={[type.docNo, { color: dark.textFaint }]}>{caseNoOf(item)}</Text>
            <Text style={[type.h2, { color: dark.text, textAlign: 'center' }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={[type.tiny, { color: dark.guilty }]}>유죄</Text>
                <Text style={[type.display, { color: dark.guilty }]}>{pct}%</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[type.tiny, { color: dark.innocent }]}>무죄</Text>
                <Text style={[type.display, { color: dark.innocent }]}>{100 - pct}%</Text>
              </View>
            </View>

            <View style={[s.gaugeTrack, { backgroundColor: dark.innocent }]}>
              <Animated.View
                style={[
                  s.gaugeFill,
                  {
                    backgroundColor: dark.guilty,
                    width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  },
                ]}
              />
              <View style={s.midLine} />
            </View>
          </View>

          <Text style={[type.small, { color: dark.textFaint, textAlign: 'center' }]}>
            개표 중 · {item.voteCount.toLocaleString()}표를 투표 순서대로 재생하고 있습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        // 암전에서 종이로 조명이 올라온다. 개표가 끝난 직후 0.56초.
        backgroundColor: lights.interpolate({
          inputRange: [0, 1],
          outputRange: [dark.bg, colors.bg],
        }),
      }}
    >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28, paddingHorizontal: 18, gap: 16 },
        layout.content,
      ]}
    >
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={[type.docNo, { color: colors.textFaint }]}>{caseNoOf(item)}</Text>
        <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Stamp
          label={majorityGuilty ? '유죄' : '무죄'}
          tone={majorityGuilty ? 'guilty' : 'innocent'}
          size="lg"
          style={{ marginTop: 6 }}
        />
      </View>

      {/* 확정 개표 */}
      <Card style={{ gap: 14, paddingVertical: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={[type.tiny, { color: colors.guilty }]}>유죄</Text>
            <Text style={[type.display, { color: colors.guilty }]}>{pct}%</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[type.tiny, { color: colors.innocent }]}>무죄</Text>
            <Text style={[type.display, { color: colors.innocent }]}>{100 - pct}%</Text>
          </View>
        </View>

        <View style={s.gaugeTrack}>
          <Animated.View
            style={[
              s.gaugeFill,
              {
                width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
          <View style={s.midLine} />
        </View>

        <Text style={[type.small, { color: colors.textMuted, textAlign: 'center' }]}>
          {item.voteCount.toLocaleString()}명 참여 · 평균 형량 {item.avgSentence.toFixed(1)}단계
        </Text>
      </Card>

      {/* 여기 도달했다면 개표는 끝났다 (개표 중은 위에서 암전 화면으로 조기 반환) */}
      <>
          {/* 내 판결 결과 */}
          <View
            style={[
              s.verdictCard,
              {
                backgroundColor: correct ? colors.innocentSoft : colors.guiltySoft,
                borderColor: correct ? colors.innocent : colors.guilty,
              },
            ]}
          >
            <Ionicons
              name={correct ? 'checkmark-circle' : 'close-circle'}
              size={34}
              color={correct ? colors.innocent : colors.guilty}
            />
            <Text style={[type.h1, { color: colors.text }]}>
              {correct ? '다수의견 적중' : '소수의견'}
            </Text>
            <Text style={[type.small, { color: colors.textMuted, textAlign: 'center' }]}>
              당신은 {myGuilty ? `유죄 ${judged?.sentence}단계` : '무죄'}. 결과는{' '}
              {majorityGuilty ? '유죄' : '무죄'} {majorityPct}%
              {!correct ? ` — ${margin.toLocaleString()}표 차이로 빗나갔습니다` : ''}
            </Text>
            {isClose ? (
              <Chip label="초박빙 사건 · +20" color={colors.close} bg={colors.closeSoft} icon="flash" />
            ) : null}
          </View>

          {/* 점수 정산 */}
          <Card style={{ gap: 11 }}>
            <Text style={[type.h3, { color: colors.text }]}>판사 지수 정산</Text>
            {[
              correct && { label: '다수의견 적중', v: '+10' },
              correct && isClose && { label: '초박빙 사건 적중', v: '+20' },
              correct && isUnanimous && { label: '만장일치 사건 적중', v: '+2' },
              correct && myGuilty && Math.abs((judged?.sentence ?? 0) - item.avgSentence) <= 1 && { label: '형량 정밀', v: '+5' },
              comboMult > 1 && { label: `${combo}연속 콤보`, v: `×${comboMult}` },
              !correct && { label: '오답 — 감점 없음', v: '0' },
            ]
              .filter(Boolean)
              .map((r) => (
                <View key={r.label} style={s.scoreRow}>
                  <Text style={[type.small, { color: colors.textMuted }]}>{r.label}</Text>
                  <Text style={[type.mono, { color: colors.accent }]}>{r.v}</Text>
                </View>
              ))}
            <View style={[s.scoreRow, { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 10 }]}>
              <Text style={[type.h3, { color: colors.text }]}>합계</Text>
              <Text style={[type.h2, { color: colors.accent }]}>+{totalPoints}</Text>
            </View>
          </Card>

          {/* 랜덤 보상 */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rewardTaken ? '보상 수령 완료' : `${reward.kind}, 티켓 ${reward.tickets}장 받기`}
            onPress={() => {
              if (rewardTaken) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              addTickets(reward.tickets);
              setRewardTaken(true);
            }}
            style={({ pressed }) => [s.reward, { borderColor: reward.color }, pressed && press.surface]}
          >
            <Ionicons name={reward.icon} size={22} color={reward.color} />
            <View style={{ flex: 1 }}>
              <Text style={[type.h3, { color: colors.text }]}>{reward.kind}</Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                {rewardTaken ? '수령 완료' : `탭해서 티켓 +${reward.tickets} 받기`}
              </Text>
            </View>
            {rewardTaken ? (
              <Ionicons name="checkmark" size={18} color={colors.innocent} />
            ) : (
              <Text style={[type.mono, { color: reward.color }]}>+{reward.tickets}</Text>
            )}
          </Pressable>

          {/* 공유 카드 */}
          <Card style={{ gap: 10, alignItems: 'center', paddingVertical: 20, borderColor: colors.accentDim }}>
            <Text style={[type.tiny, { color: colors.accent }]}>공유 카드</Text>
            <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]}>
              국민 {item.voteCount.toLocaleString()}명 중 {majorityPct}%가{' '}
              {majorityGuilty ? '유죄' : '무죄'}를 선고했습니다
            </Text>
            <Button
              title="공유하기"
              icon="share-social"
              tone="ghost"
              onPress={() => showToast('판결 카드를 클립보드에 복사했습니다', 'ok')}
            />
          </Card>

          {/* 여론이 확정된 직후가 남의 의견을 읽고 싶어지는 순간이다 */}
          <View>
            <SectionTitle
              title={myGuilty ? '같은 편에 선 판결문' : '나와 같은 무죄 측 판결문'}
              action="전체 보기"
              onAction={() => router.replace(`/case/${item.id}`)}
            />
            <View style={{ gap: 10 }}>
              {sameSide.length ? (
                sameSide.map((o) => <OpinionCard key={o.id} item={o} compact canReply={false} />)
              ) : (
                <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 20 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textFaint} />
                  <Text style={[type.bodyStrong, { color: colors.textMuted }]}>
                    이쪽 편에 남은 판결문이 없습니다
                  </Text>
                  <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
                    소수의견을 먼저 남기면 상단에 고정됩니다.
                  </Text>
                </Card>
              )}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Button
              title={nextCase ? `다음 사건 (${doneCount}/5)` : '오늘의 5건 완주 · +15'}
              icon={nextCase ? 'arrow-forward' : 'trophy'}
              onPress={() => (nextCase ? router.replace(`/case/${nextCase}`) : router.replace('/'))}
              full
            />
            <Button title="재판소로" tone="ghost" onPress={() => router.replace('/')} full />
          </View>
      </>
    </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  // 개표 3초 동안의 암전 화면.
  blackout: {
    flex: 1,
    backgroundColor: dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTrack: {
    height: 16,
    borderRadius: 10,
    backgroundColor: colors.innocent,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gaugeFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.guilty },
  midLine: {
    position: 'absolute',
    left: '50%',
    width: 2,
    top: 0,
    bottom: 0,
    // 유죄 적색·무죄 녹색 어느 쪽 위에 놓여도 보여야 하는 눈금이라 흰색으로 둔다.
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  verdictCard: {
    alignItems: 'center',
    gap: 8,
    padding: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
});
