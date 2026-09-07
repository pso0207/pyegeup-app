import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, shadow , layout, press } from '../../constants/theme';
import { courtById, jurorTier, nextJurorTier, JUROR_TIERS, SCORE_RULES } from '../../constants/domain';
import { leaderboard, rival, seasonPass } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Card, Chip, Button, Divider, Facts, Section } from '../../components/ui';
import Segmented from '../../components/Segmented';
import ScreenHeader from '../../components/ScreenHeader';
import useRefresh from '../../components/useRefresh';
import Avatar from '../../components/Avatar';
import { useRouter, useScrollToTop } from 'expo-router';

/** 1·2·3위만 메달색. 나머지는 무채색 번호. */
const MEDAL = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

const TABS = [
  { key: 'board', label: '리더보드' },
  { key: 'rival', label: '라이벌' },
  { key: 'pass', label: '시즌 패스' },
];

export default function RankingScreen() {
  // 활성 탭을 다시 누르면 맨 위로. iOS·Android 공통 관습인데 빠져 있었다.
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const { refreshing, onRefresh } = useRefresh('순위를 새로 집계했습니다');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useApp((s) => s.me);
  const [tab, setTab] = useState('board');
  const tier = jurorTier(me.jurorScore);
  const next = nextJurorTier(me.jurorScore);

  const openProfile = (row) =>
    row.isMe ? router.push('/profile') : router.push(`/u/${encodeURIComponent(row.nickname)}`);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        { paddingTop: insets.top + 10, paddingBottom: 36, paddingHorizontal: 16, gap: 16 },
        layout.content,
      ]}
      ref={listRef}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <ScreenHeader
        eyebrow={`시즌 ${seasonPass.season} · ${seasonPass.endsIn} 남음`}
        title="랭킹"
        right={<Text style={[type.tiny, { color: colors.textFaint }]}>판사 지수 기준</Text>}
      />

      {/* 내 계급.
          이전에는 큰 숫자 + 승급 진행바 + 안내문이 들어간 카드였다.
          승급까지 남은 점수는 진행바보다 숫자가 정확하고 짧다. */}
      <View style={{ gap: 3, marginTop: 4 }}>
        <Text style={[type.tiny, { color: colors.textFaint }]}>현재 계급</Text>
        <Text style={[type.display, { color: colors.text }]}>{tier.name}</Text>
      </View>
      <Facts
        rows={[
          ['시즌 점수', me.jurorScore.toLocaleString()],
          ['백분위', tier.note || `상위 ${me.jurorPercentile}%`],
          ['적중률', `${me.accuracy}%`],
          next && ['승급까지', `${(next.min - me.jurorScore).toLocaleString()}점 · 3연속 적중`],
        ]}
      />

      <Segmented items={TABS} value={tab} onChange={setTab} />

      {tab === 'board' ? (
        <View style={{ gap: 14 }}>
          {/* 1~3위도 같은 목록에 둔다. 시상대(단상 + 메달 아이콘)는 게임의 문법이고,
              커뮤니티 랭킹은 번호를 매긴 목록이다 — 순위 숫자만 메달색으로 칠한다. */}
          <View style={s.board}>
            {leaderboard.map((row) => {
              const c = courtById(row.courtId);
              const medal = MEDAL[row.rank];
              return (
                <Pressable
                  key={row.rank}
                  accessibilityRole={row.isMe ? 'button' : 'link'}
                  accessibilityLabel={`${row.rank}위 ${row.nickname}, ${row.points.toLocaleString()}점`}
                  onPress={() => openProfile(row)}
                  style={({ pressed }) => [
                    s.rankRow,
                    row.isMe && { backgroundColor: colors.accentSoft },
                    pressed && press.surface,
                  ]}
                >
                  <Text
                    style={[
                      type.mono,
                      { color: medal ?? colors.textFaint, width: 24, textAlign: 'center' },
                      medal && { fontWeight: '800' },
                    ]}
                  >
                    {row.rank}
                  </Text>
                  <Avatar name={row.nickname} size={30} me={row.isMe} ring={row.isMe} />
                  <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <Text style={[type.listTitle, { color: colors.text }]} numberOfLines={1}>
                      {row.nickname}{row.isMe ? ' · 나' : ''}
                    </Text>
                    <Text style={[type.tiny, { color: colors.textFaint }]} numberOfLines={1}>
                      {c.name} · {row.tier} · 적중률 {row.accuracy}%
                    </Text>
                  </View>
                  <Text style={[type.mono, { color: colors.text }]}>{row.points.toLocaleString()}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            상위 100위까지 공개됩니다 · 내 순위 {leaderboard.find((r) => r.isMe)?.rank}위
          </Text>

          <Section title="판사 지수 획득 규칙">
            <Facts
              rows={SCORE_RULES.map((r) => [
                r.label,
                r.value,
                r.value === '감점 없음' ? colors.textFaint : colors.text,
              ])}
            />
          </Section>

          <Section title="계급표">
            <Facts
              rows={JUROR_TIERS.map((t) => [
                t.note ? `${t.name} · ${t.note}` : t.name,
                t.max === Infinity
                  ? `${t.min.toLocaleString()}+`
                  : `${t.min.toLocaleString()}–${t.max.toLocaleString()}`,
                t.name === tier.name ? colors.text : colors.textFaint,
              ])}
            />
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              시즌 종료 시 소프트 리셋 — 점수 40%만 이월됩니다
            </Text>
          </Section>
        </View>
      ) : null}

      {tab === 'rival' ? (
        <View style={{ gap: 14 }}>
          <Section title="이번 주 라이벌">
            <Facts
              rows={[
                ['나', rival.myPoints.toLocaleString()],
                [rival.nickname, rival.points.toLocaleString()],
                ['차이', `${rival.points - rival.myPoints}점 뒤짐`, colors.guilty],
                ['남은 기간', rival.endsIn],
                ['승리 보상', `티켓 ${rival.reward}장`],
              ]}
            />
          </Section>
          <Section title="라이벌 매칭 규칙">
            <Text style={[type.body, { color: colors.textMuted }]}>
              판사 지수가 비슷한 유저 1명이 주간 단위로 자동 배정됩니다. 닉네임 외의 정보는 공개되지 않으며,
              라이벌에게 직접 연락하거나 프로필을 열람할 수 없습니다.
            </Text>
          </Section>
        </View>
      ) : null}

      {tab === 'pass' ? (
        <View style={{ gap: 14 }}>
          <Section
            title={`시즌 ${seasonPass.season} 패스`}
            note={`${seasonPass.endsIn} 남음 · 달성 ${Math.round(seasonPass.progress * 100)}%`}
          >
            <Facts
              rows={seasonPass.rewards.map((r) => [
                `${r.at.toLocaleString()}점 · ${r.label}`,
                r.done ? '수령' : '미달',
                r.done ? colors.innocent : colors.textFaint,
              ])}
            />
          </Section>

          <View style={[s.passCta, shadow.card]}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={[type.h2, { color: colors.text }]}>명판사 패스</Text>
            <Text style={[type.small, { color: colors.textMuted, textAlign: 'center' }]}>
              광고 제거 · 데일리 티켓 30장 · 시즌 배지 · 프로필 꾸미기 · 판결 통계 대시보드
            </Text>
            <Button
              title="월 3,900원 구독하기"
              full
              onPress={() =>
                useApp.getState().showToast('결제는 아직 연결되지 않았습니다 · 준비 중입니다', 'warn')
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="구매 복원"
              onPress={() => useApp.getState().showToast('구매 내역을 확인했습니다', 'ok')}
              hitSlop={12}
            >
              <Text style={[type.tiny, { color: colors.textFaint }]}>구매 복원</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

/** 1~3위는 줄이 아니라 단상에 세운다. 리더보드에서 가장 먼저 눈이 가야 할 곳. */
const s = StyleSheet.create({
  board: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  passCta: {
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
