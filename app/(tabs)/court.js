import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useScrollToTop } from 'expo-router';
import { colors, radius, type, shadow , layout, press } from '../../constants/theme';
import { courtById, jurorTier } from '../../constants/domain';
import { me, courtStandings, courtMembers, caseList, opinionsFor, courtActivity } from '../../data/mock';
import { useApp } from '../../store/useApp';
import CaseCard, { CaseList } from '../../components/CaseCard';
import Segmented from '../../components/Segmented';
import ScreenHeader from '../../components/ScreenHeader';
import useRefresh from '../../components/useRefresh';
import OpinionCard from '../../components/OpinionCard';
import Avatar from '../../components/Avatar';
import { Card, SectionTitle, Chip, Button, Empty, Divider, Facts, Section } from '../../components/ui';

const TABS = [
  { key: 'feed', label: '피드' },
  { key: 'battle', label: '대항전' },
  { key: 'members', label: '소속원' },
];

export default function CourtScreen() {
  // 활성 탭을 다시 누르면 맨 위로. iOS·Android 공통 관습인데 빠져 있었다.
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const { refreshing, onRefresh } = useRefresh('법원 소식을 새로 불러왔습니다');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const myCourtId = useApp((s) => s.me.courtId);
  const court = courtById(myCourtId);
  const [tab, setTab] = useState('feed');

  const myRank = courtStandings
    .slice()
    .sort((a, b) => b.avg - a.avg)
    .findIndex((c) => c.courtId === myCourtId) + 1;

  // 계급은 목업 문자열이 아니라 판사 지수에서 파생시킨다 (계급표와 항상 일치).
  const myTierLabel = jurorTier(me.jurorScore).name;

  const feed = caseList.filter((c) => c.courtId === myCourtId);

  // 이 법원 사건에 달린 판결문만 모은다. 아무 사건에서나 끌어오면 소속감이 깨진다.
  const courtOpinions = feed
    .flatMap((c) => opinionsFor(c.id))
    .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

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
        eyebrow="내 소속"
        title={court.name}
        action="이적"
        actionLabel="법원 이적하기"
        onAction={() => router.push('/court/select')}
      />

      <Facts
        rows={[
          ['소속원', `${courtStandings.find((c) => c.courtId === myCourtId)?.members.toLocaleString()}명`],
          ['주간 대항전', `${myRank}위`, myRank === 1 ? colors.gold : colors.text],
          ['내 계급', myTierLabel],
        ]}
      />

      <Segmented items={TABS} value={tab} onChange={setTab} />

      {tab === 'feed' ? (
        <View style={{ gap: 16 }}>
          {/* 소속원 활동 — 길드가 돌아가고 있다는 인상을 먼저 준다 */}
          <Card style={{ gap: 0, paddingVertical: 4 }}>
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
                <Text style={[type.small, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
                  <Text style={{ color: colors.text }}>{a.actor}</Text>
                  {a.verb}
                </Text>
                <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>{a.at}</Text>
              </Pressable>
            ))}
          </Card>

          <View>
            <SectionTitle title="법원 전용 사건" />
            {feed.length ? (
              <CaseList>
                {feed.map((c) => (
                  <CaseCard key={c.id} item={c} compact onPress={() => router.push(`/case/${c.id}`)} />
                ))}
              </CaseList>
            ) : (
              <Empty
                icon="hammer-outline"
                text="이 법원에 열린 사건이 없습니다"
                sub="사연을 투고하면 같은 법원 소속원이 먼저 판결합니다."
                action="사연 투고하기"
                onAction={() => router.push('/write')}
              />
            )}
          </View>

          <View>
            <SectionTitle title="소속원 명판결" action="판례집" onAction={() => router.push('/archive')} />
            <View style={{ gap: 10 }}>
              {courtOpinions.length ? (
                courtOpinions.map((o, i) => (
                  <OpinionCard key={o.id} item={o} rank={i + 1} compact canReply={false} />
                ))
              ) : (
                <Empty
                  icon="ribbon-outline"
                  text="아직 명판결이 없습니다"
                  sub="이 법원 사건에 판결문을 남기면 여기 먼저 걸립니다."
                  action="법원 사건 판결하러 가기"
                  onAction={() => router.push('/')}
                />
              )}
            </View>
          </View>
        </View>
      ) : null}

      {tab === 'battle' ? (
        <View style={{ gap: 14 }}>
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text numberOfLines={1} style={[type.h3, { color: colors.text, flex: 1, minWidth: 0 }]}>주간 법원 대항전</Text>
              <Chip label="종료까지 2일" color={colors.close} icon="time" small />
            </View>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              인원수 보정 평균 판사 지수 기준 · 1위 법원 전원 티켓 100장
            </Text>
          </Card>

          <View style={{ gap: 9 }}>
            {courtStandings
              .slice()
              .sort((a, b) => b.avg - a.avg)
              .map((row, i) => {
                const c = courtById(row.courtId);
                const mine = row.courtId === myCourtId;
                const max = Math.max(...courtStandings.map((x) => x.avg));
                return (
                  <View key={row.courtId} style={[s.standRow, mine && { borderColor: c.color, backgroundColor: c.color + '10' }]}>
                    <Text style={[type.mono, { color: i === 0 ? colors.accent : colors.textFaint, width: 22 }]}>{i + 1}</Text>
                    <Ionicons name={c.icon} size={15} color={c.color} />
                    <View style={{ flex: 1, gap: 5 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        <Text numberOfLines={1} style={[type.small, { color: colors.text, flex: 1, minWidth: 0 }]}>
                          {c.name} {mine ? '· 내 법원' : ''}
                        </Text>
                        <Text numberOfLines={1} style={[type.mono, { color: colors.textMuted, flexShrink: 0 }]}>{row.avg.toLocaleString()}</Text>
                      </View>
                      <View style={s.miniTrack}>
                        <View style={{ width: `${(row.avg / max) * 100}%`, height: '100%', backgroundColor: c.color, borderRadius: 3 }} />
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      ) : null}

      {tab === 'members' ? (
        <View style={{ gap: 9 }}>
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            소속원 지수 상위 {courtMembers.length}명 · 매주 월요일 09:00 갱신
          </Text>
          {courtMembers.map((m) => (
            <Pressable
              key={m.rank}
              accessibilityRole={m.isMe ? 'button' : 'link'}
              accessibilityLabel={`${m.nickname} ${m.rank}위, ${m.points.toLocaleString()}점`}
              onPress={() =>
                m.isMe ? router.push('/profile') : router.push(`/u/${encodeURIComponent(m.nickname)}`)
              }
              style={({ pressed }) => [
                s.memberRow,
                m.isMe && { borderColor: court.color, backgroundColor: court.color + '10' },
                pressed && press.surface,
              ]}
            >
              <Text style={[type.mono, { color: m.rank <= 3 ? colors.accent : colors.textFaint, width: 20 }]}>
                {m.rank}
              </Text>
              <Avatar name={m.nickname} size={30} me={m.isMe} ring={m.isMe} />
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={[type.small, { color: colors.text }]} numberOfLines={1}>
                  {m.nickname}
                  {m.isMe ? ' · 나' : ''}
                </Text>
                <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>
                  {m.rank <= 3 ? '이번 주 상위권' : '소속원'}
                </Text>
              </View>
              <Text style={[type.mono, { color: m.isMe ? court.color : colors.textMuted }]}>
                {m.points.toLocaleString()}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
            </Pressable>
          ))}
          <Divider style={{ marginVertical: 4 }} />
          <Button title="법원 이적 (시즌당 1회)" tone="ghost" icon="swap-horizontal" onPress={() => router.push('/court/select')} full />
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
            이적하면 이번 시즌 대항전 기여도는 새 법원으로 넘어가지 않습니다
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  standRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  miniTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
});
