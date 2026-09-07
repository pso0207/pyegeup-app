import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, type, layout } from '../../constants/theme';
import { courtById, jurorTier, nextJurorTier } from '../../constants/domain';
import { profileOf, REPORT_REASONS } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Button, Facts, Section } from '../../components/ui';
import Avatar from '../../components/Avatar';
import ActionSheet from '../../components/ActionSheet';
import IconButton from '../../components/IconButton';

export default function PublicProfile() {
  const { nick } = useLocalSearchParams();
  const router = useRouter();
  const nickname = decodeURIComponent(String(nick ?? ''));
  const p = profileOf(nickname);
  const court = courtById(p.courtId);

  const blocked = useApp((s) => !!s.blocked[nickname]);
  const blockUser = useApp((s) => s.blockUser);
  const unblockUser = useApp((s) => s.unblockUser);
  const followed = useApp((s) => !!s.followed[nickname]);
  const toggleFollow = useApp((s) => s.toggleFollow);
  const report = useApp((s) => s.report);
  const [sheet, setSheet] = useState(null);

  // 계급은 목업 문자열이 아니라 판사 지수에서 계산한다 (계급표와 항상 일치).
  const tier = jurorTier(p.jurorScore);
  const next = nextJurorTier(p.jurorScore);

  if (blocked) {
    return (
      <>
        <Stack.Screen options={{ title: '차단된 사용자' }} />
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
          <Empty
            icon="ban"
            text={`${nickname} 님을 차단했습니다`}
            sub="차단을 해제하면 이 배심원의 판결문과 사연이 다시 보입니다."
            action="차단 해제"
            onAction={() => unblockUser(nickname)}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '배심원 프로필',
          headerRight: () => (
            <IconButton
              name="ellipsis-horizontal"
              size={19}
              label="사용자 메뉴"
              onPress={() => setSheet('menu')}
            />
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 44, gap: 15 }, layout.content]}
        showsVerticalScrollIndicator={false}
      >
        {/* 명패 — 상자가 아니라 서류 머리다. 인장 + 이름 + 신분 한 줄. */}
        <View style={s.plate}>
          <Avatar name={nickname} size={52} ring />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[type.h2, { color: colors.text }]} numberOfLines={1}>
              {nickname}
            </Text>
            <Text style={[type.small, { color: colors.textMuted }]} numberOfLines={1}>
              {tier.name} · {court.name}
            </Text>
            <Text style={[type.tiny, { color: colors.textFaint }]} numberOfLines={1}>
              {p.joinedAt}부터 활동 · 연속 출석 {p.streak}일
            </Text>
          </View>
        </View>

        {/* 활동 기록.
            이전에는 3열 대형 숫자 + 승급 진행바 + 자물쇠 안내 상자였다.
            같은 정보가 표 다섯 줄에 들어가고, 숫자는 오른쪽 끝에 정렬돼 세로로 읽힌다. */}
        <Section title="활동 기록">
          <Facts
            rows={[
              ['판사 지수', p.jurorScore.toLocaleString()],
              ['계급', tier.note ? `${tier.name} · ${tier.note}` : tier.name],
              next && ['다음 계급', `${next.name}까지 ${(next.min - p.jurorScore).toLocaleString()}점`],
              ['적중률', `${p.accuracy}%`],
              ['판결 수', p.judged.toLocaleString()],
              ['폐급 계급', p.guiltTier],
              ...(p.specialty ?? []).map((sp) => [
                `전문 · ${courtById(sp.courtId).name}`,
                `${Math.round(sp.accuracy * 100)}%`,
              ]),
            ]}
          />
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            폐급 지수의 숫자는 본인만 볼 수 있습니다. 남에게는 계급만 공개됩니다.
          </Text>
        </Section>

        {/* 대표 판결문 */}
        {p.bestOpinion ? (
          <Section title="대표 판결문">
            <View style={s.quote}>
              <Text style={[type.read, { color: colors.text }]}>"{p.bestOpinion}"</Text>
            </View>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              추천 {p.bestOpinionLikes.toLocaleString()} · 이 배심원의 최다 추천 판결문
            </Text>
          </Section>
        ) : null}

        {/* 훈장 — 알약을 늘어놓지 않고 한 줄로 적는다 */}
        {p.medals?.length ? (
          <Section title="훈장">
            <Text style={[type.body, { color: colors.text }]}>{p.medals.join(' · ')}</Text>
          </Section>
        ) : null}

        {p.generated ? (
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            공개 활동이 적어 요약만 표시합니다
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 4 }}>
          <Button
            title={followed ? '구독 중' : '구독'}
            tone={followed ? 'surface' : 'primary'}
            onPress={() => toggleFollow(nickname)}
            style={{ flex: 1 }}
          />
          <Button title="차단" tone="ghost" onPress={() => blockUser(nickname)} style={{ flex: 1 }} />
        </View>
      </ScrollView>

      <ActionSheet
        visible={sheet === 'menu'}
        title={nickname}
        subtitle="배심원"
        options={[
          { key: 'report', label: '신고하기', desc: '규정을 위반한 사용자입니다', icon: 'flag', danger: true },
          { key: 'block', label: '차단하기', desc: '이 사용자의 글을 보지 않습니다', icon: 'ban' },
        ]}
        onSelect={(k) => {
          if (k === 'report') setTimeout(() => setSheet('report'), 260);
          if (k === 'block') blockUser(nickname);
        }}
        onClose={() => setSheet(null)}
      />
      <ActionSheet
        visible={sheet === 'report'}
        title="신고 사유를 선택하세요"
        subtitle="접수 후 24시간 내 처리됩니다"
        confirmLabel="신고 접수"
        options={REPORT_REASONS.map((r) => ({ key: r.key, label: r.label, desc: r.desc }))}
        onSelect={(k) => report(`user:${nickname}`, k, '사용자')}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

const s = StyleSheet.create({
  plate: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  // 인용은 상자에 담지 않는다. 왼쪽 괘선 하나면 "인용"으로 읽힌다.
  quote: { paddingLeft: 13, borderLeftWidth: 2, borderLeftColor: colors.accent },
});
