import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useScrollToTop } from 'expo-router';
import { colors, radius, type, shadow, layout, press } from '../../constants/theme';
import { guiltTier, jurorTier, crossTitle, courtById, GUILT_TIERS} from '../../constants/domain';
import { medals, verdictHistory, myCases, categoryAccuracy, profileOf, cases } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Card, Chip, Divider, VerdictBar, Button, Empty, Facts, Section } from '../../components/ui';
import ActionSheet from '../../components/ActionSheet';
import Countdown from '../../components/Countdown';
import Segmented from '../../components/Segmented';
import Avatar from '../../components/Avatar';
import NotifBell from '../../components/NotifBell';
import IconButton from '../../components/IconButton';
import useRefresh from '../../components/useRefresh';

const TABS = [
  { key: 'verdicts', label: '판결 이력' },
  { key: 'cases', label: '내 사건' },
  { key: 'medals', label: '훈장' },
  { key: 'follow', label: '구독' },
];

export default function ProfileScreen() {
  // 활성 탭을 다시 누르면 맨 위로. iOS·Android 공통 관습인데 빠져 있었다.
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const { refreshing, onRefresh } = useRefresh('프로필을 새로 불러왔습니다');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useApp((s) => s.me);
  const tickets = useApp((s) => s.tickets);
  const [tab, setTab] = useState('verdicts');
  const [showIndex, setShowIndex] = useState(false); // 폐급 지수 숫자 공개 토글 (기획서 13-2)

  const gTier = guiltTier(me.guiltIndex);
  const jTier = jurorTier(me.jurorScore);
  const title = crossTitle(me.guiltIndex, me.jurorScore);
  const court = courtById(me.courtId);
  // 카테고리 적중률 75% 이상이면 부칭호 (기획서 06)
  const subTitles = categoryAccuracy
    .filter((c) => c.accuracy >= 0.75 && c.judged >= 30)
    .map((c) => ({ ...c, name: courtById(c.courtId).name.replace('지법', '') + ' 전문 판사' }));

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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: -6 }}>
        <Avatar name={me.nickname} size={46} me ring />
        <View style={{ flex: 1, gap: 1 }}>
          {/* 제목이 먼저. 작은 라벨을 위에 얹는 eyebrow는 읽는 순서를 뒤집는다. */}
          <Text style={[type.h2, { color: colors.text }]} numberOfLines={1}>{me.nickname}</Text>
          <Text style={[type.tiny, { color: colors.textFaint }]}>내 프로필</Text>
        </View>
        <NotifBell />
        <IconButton
          name="settings-outline"
          size={19}
          color={colors.text}
          label="설정"
          onPress={() => router.push('/settings')}
        />
      </View>

      {/* 교차 칭호 — 상자 없이 종이 위에 크게. 알약 세 줄은 표로 접었다. */}
      <View style={{ gap: 4, marginTop: 4 }}>
        <Text style={[type.tiny, { color: colors.textFaint }]}>교차 칭호</Text>
        <Text style={[type.display, { color: colors.text }]}>{title}</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>
          {court.name} · {jTier.name} · {gTier.name}
          {subTitles.length
            ? ` · ${subTitles.map((t) => `${t.name} ${Math.round(t.accuracy * 100)}%`).join(' · ')}`
            : ''}
        </Text>
      </View>

      {/* 이중 지수.
          이전에는 게이지 두 개 + 4열 숫자 + 지난 시즌 배너가 한 카드에 들어 있었다.
          숫자를 키우는 대신 표로 세우고, 폐급 지수만 본인 확인 후 열리게 남긴다. */}
      <Section title="내 지수">
        <Facts
          rows={[
            ['판사 지수', `${me.jurorScore.toLocaleString()} · ${jTier.name}`],
            ['판사 백분위', `상위 ${me.jurorPercentile}%`],
            [
              '폐급 지수',
              showIndex ? `${me.guiltIndex} · ${gTier.name}` : gTier.name,
              showIndex ? gTier.color : colors.textMuted,
            ],
            ['누적 사건', `${me.guiltCaseCount}건`],
            ['적중률', `${me.accuracy}%`],
            ['연속 출석', `${me.streak}일`],
            ['무죄 훈장', `${me.innocenceMedals}개`],
            ['보유 티켓', `${tickets}장`],
            ['지난 시즌', me.lastSeasonTier],
          ]}
        />
        {!showIndex ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`폐급 지수 계급 ${gTier.name}, 숫자 보기`}
            onPress={() => setShowIndex(true)}
            style={({ pressed }) => [s.revealBtn, pressed && press.control]}
          >
            <Text style={[type.small, { color: colors.accent }]}>폐급 지수 숫자 보기</Text>
          </Pressable>
        ) : null}
      </Section>

      <Segmented items={TABS} value={tab} onChange={setTab} />

      {tab === 'verdicts' ? <VerdictHistory /> : null}

      {tab === 'cases' ? <MyCases /> : null}

      {tab === 'follow' ? <Following /> : null}

      {tab === 'medals' ? (
        <Facts
          rows={medals.map((m) => [
            m.name,
            m.count ? `×${m.count}` : '—',
            m.count ? m.color : colors.textFaint,
          ])}
        />
      ) : null}

      {/* 계급표 안내 */}
      <Section title="폐급 계급표">
        <Facts
          rows={GUILT_TIERS.map((t) => [
            `${t.name} · ${t.desc}`,
            `${t.min}–${t.max}`,
            t.name === gTier.name ? t.color : colors.textFaint,
          ])}
        />
        <Text style={[type.tiny, { color: colors.textFaint }]}>
          사건 3건 이상 누적 시 계급 부여 · 계급 변동은 사건 확정 시점에만 반영
        </Text>
      </Section>
    </ScrollView>
  );
}

/** 판결 이력 — 결과뿐 아니라 내가 남긴 판결문까지 같이 보여준다. */
function VerdictHistory() {
  const router = useRouter();
  const myOpinions = useApp((st) => st.myOpinions);
  const judged = useApp((st) => st.judged);

  // 이번 세션에 내린 판결을 목업 이력 위에 얹는다.
  // 이걸 안 하면 사건을 판결해도 "판결 이력"이 그대로라 앱이 내 행동을 잊은 것처럼 보인다.
  const mine = Object.entries(judged)
    .map(([caseId, v]) => {
      const c = cases[caseId];
      if (!c) return null;
      const majorityGuilty = c.guiltyRate >= 0.5;
      const correct = v.guilty === majorityGuilty;
      const pct = Math.round((majorityGuilty ? c.guiltyRate : 1 - c.guiltyRate) * 100);
      return {
        caseId,
        title: c.title,
        myGuilty: v.guilty,
        result: `${majorityGuilty ? '유죄' : '무죄'} ${pct}%`,
        correct,
        points: v.points ?? (correct ? 10 : 0),
        at: v.at ?? 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.at - a.at);

  const seeded = verdictHistory.filter((v) => !judged[v.caseId]);
  const list = [...mine, ...seeded];
  const hits = list.filter((v) => v.correct).length;
  const accuracy = Math.round((hits / Math.max(1, list.length)) * 100);

  if (!list.length) {
    return (
      <Empty
        icon="hammer-outline"
        text="아직 판결한 사건이 없습니다"
        sub="오늘의 5건을 판결하면 여기에 적중 여부와 지수가 쌓입니다."
        action="재판소로 가기"
        onAction={() => router.push('/')}
      />
    );
  }

  return (
    <View style={{ gap: 9 }}>
      <View style={s.histSummary}>
        <Text style={[type.small, { color: colors.textMuted }]}>
          최근 {list.length}건 중 {hits}건 적중
        </Text>
        <Text style={[type.mono, { color: colors.accent }]}>{accuracy}%</Text>
      </View>

      {list.map((v) => {
        const written = myOpinions[v.caseId];
        return (
          <Card key={v.caseId} onPress={() => router.push(`/case/${v.caseId}`)} style={{ gap: 9 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={[type.bodyStrong, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {v.title}
              </Text>
              <Ionicons
                name={v.correct ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={v.correct ? colors.innocent : colors.textFaint}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Chip
                  label={v.myGuilty ? '내 판결 유죄' : '내 판결 무죄'}
                  color={v.myGuilty ? colors.guilty : colors.innocent}
                  bg={v.myGuilty ? colors.guiltySoft : colors.innocentSoft}
                  small
                />
                <Text style={[type.tiny, { color: colors.textFaint }]}>결과 {v.result}</Text>
              </View>
              <Text style={[type.mono, { color: v.points ? colors.accent : colors.textFaint }]}>
                +{v.points}
              </Text>
            </View>
            {written ? (
              <View style={s.myOpinionBox}>
                <Ionicons name="create-outline" size={12} color={colors.accent} />
                <Text style={[type.small, { color: colors.textMuted, flex: 1 }]} numberOfLines={2}>
                  {written}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}
      <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
        판결 이력은 본인만 볼 수 있습니다
      </Text>
    </View>
  );
}

/** 구독한 배심원 — 이 사람들의 판결문이 판례집 상단에 모인다. */
function Following() {
  const router = useRouter();
  const followed = useApp((st) => st.followed);
  const toggleFollow = useApp((st) => st.toggleFollow);
  const names = Object.keys(followed).filter((n) => followed[n]);

  if (!names.length) {
    return (
      <Empty
        icon="people-outline"
        text="구독한 배심원이 없습니다"
        sub="판결문의 작성자를 눌러 프로필에서 구독하면 그 사람의 의견이 먼저 보입니다."
        action="랭킹에서 찾아보기"
        onAction={() => router.push('/ranking')}
      />
    );
  }

  return (
    <View style={{ gap: 9 }}>
      {names.map((n) => {
        const p = profileOf(n);
        const c = courtById(p.courtId);
        return (
          <Pressable
            key={n}
            accessibilityRole="link"
            accessibilityLabel={`${n} 프로필 보기`}
            onPress={() => router.push(`/u/${encodeURIComponent(n)}`)}
            style={({ pressed }) => [s.followRow, pressed && press.surface]}
          >
            <Avatar name={n} size={34} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type.bodyStrong, { color: colors.text }]} numberOfLines={1}>{n}</Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                {c.name} · {p.tier} · 적중률 {p.accuracy}%
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${n} 구독 해제`}
              onPress={() => toggleFollow(n)}
              hitSlop={12}
              style={s.unfollowBtn}
            >
              <Text style={[type.tiny, { color: colors.textMuted }]}>구독 중</Text>
            </Pressable>
          </Pressable>
        );
      })}
      <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
        구독은 상대에게 알려지지 않습니다
      </Text>
    </View>
  );
}

/** 내 사건 — 검수대기 · 공판중 · 확정 · 무효를 상태별로 다르게 보여준다. */
function MyCases() {
  const router = useRouter();
  const deleted = useApp((st) => st.deletedCases);
  const deleteCase = useApp((st) => st.deleteCase);
  const statements = useApp((st) => st.statements);
  const myPosts = useApp((st) => st.myPosts);
  const deletePost = useApp((st) => st.deletePost);
  const [sheetFor, setSheetFor] = useState(null);

  // 방금 투고한 사연이 맨 위에 온다. 이걸 안 하면 투고해도 목록이 그대로라
  // 앱이 내 행동을 잊은 것처럼 보인다.
  const list = [...myPosts, ...myCases].filter((c) => !deleted[c.id]);

  const STATE = {
    review: { label: '검수대기', color: colors.textMuted, note: '운영자 검수까지 최대 12시간' },
    open: { label: '공판중', color: colors.accent, note: null },
    closed: { label: '확정', color: colors.info, note: null },
    void: { label: '무효', color: colors.textFaint, note: '20표 미달로 지수에 반영되지 않았습니다' },
  };

  if (!list.length) {
    return (
      <Empty
        icon="document-text"
        text="투고한 사연이 없습니다"
        sub="첫 사연을 올리면 티켓 25장과 함께 24시간 공판이 시작됩니다."
        action="사연 투고하기"
        onAction={() => router.push('/write')}
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Button title="새 사연 투고하기" icon="add" onPress={() => router.push('/write')} full />

      {list.map((c) => {
        const st = STATE[c.status] ?? STATE.closed;
        const scored = c.status === 'closed';
        return (
          <Card key={c.id} style={{ gap: 11 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[type.bodyStrong, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {c.title}
              </Text>
              <Chip label={st.label} color={st.color} small />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="사연 관리"
                onPress={() => setSheetFor(c)}
                hitSlop={12}
              >
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textFaint} />
              </Pressable>
            </View>

            {c.status === 'review' ? (
              <View style={s.noteRow}>
                <Ionicons name="hourglass-outline" size={13} color={colors.textMuted} />
                <Text style={[type.small, { color: colors.textMuted }]}>{st.note}</Text>
              </View>
            ) : c.status === 'void' ? (
              <View style={s.noteRow}>
                <Ionicons name="close-circle-outline" size={13} color={colors.textFaint} />
                <Text style={[type.small, { color: colors.textFaint }]}>{st.note}</Text>
              </View>
            ) : (
              <>
                <VerdictBar guiltyRate={c.guiltyRate} height={6} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[type.tiny, { color: colors.textFaint }]}>
                    {c.votes.toLocaleString()}표 · 평균 형량 {c.sentence.toFixed(1)}
                    {scored ? ` · 사건점수 ${c.score}` : ''}
                  </Text>
                  {c.status === 'open' ? <Countdown minutes={c.closesInMin ?? 120} /> : null}
                </View>
              </>
            )}

            {/* 확정 사건 후속 행동 */}
            {c.canStatement && !statements[c.id] ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/case/statement',
                    params: { id: c.id, title: c.title, rate: String(c.guiltyRate) },
                  })
                }
                style={({ pressed }) => [s.followUp, pressed && press.surface]}
              >
                <Ionicons name="megaphone-outline" size={15} color={colors.purple} />
                <Text style={[type.small, { color: colors.text, flex: 1 }]}>최후진술 남기기</Text>
                <Text style={[type.tiny, { color: colors.textFaint }]}>확정 후 48시간 내 1회</Text>
              </Pressable>
            ) : null}

            {statements[c.id] ? (
              <View style={s.statementDone}>
                <Ionicons name="checkmark-circle" size={13} color={colors.purple} />
                <Text style={[type.small, { color: colors.textMuted, flex: 1 }]} numberOfLines={2}>
                  {statements[c.id]}
                </Text>
              </View>
            ) : null}

            {c.canAppeal ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/case/appeal',
                    params: {
                      id: c.id,
                      title: c.title,
                      rate: String(c.guiltyRate),
                      votes: String(c.votes),
                      sentence: String(c.sentence),
                      score: String(c.score),
                    },
                  })
                }
                style={({ pressed }) => [s.followUp, { borderColor: colors.close + '66' }, pressed && press.surface]}
              >
                <Ionicons name="refresh" size={15} color={colors.close} />
                <Text style={[type.small, { color: colors.text, flex: 1 }]}>항소하기</Text>
                <Text style={[type.tiny, { color: colors.ticket }]}>티켓 50</Text>
              </Pressable>
            ) : null}
          </Card>
        );
      })}

      <ActionSheet
        visible={!!sheetFor}
        title="내 사연"
        subtitle={sheetFor?.title}
        options={[
          { key: 'delete', label: '사연 삭제', desc: '판결 이력과 함께 즉시 삭제됩니다', icon: 'trash', danger: true },
        ]}
        onSelect={(k) => {
          if (k !== 'delete') return;
          // 내가 방금 올린 사연은 목록에서 실제로 빼고, 목업 사건은 삭제 표시만 한다.
          if (sheetFor?.mine) deletePost(sheetFor.id);
          else deleteCase(sheetFor.id);
        }}
        onClose={() => setSheetFor(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  revealBtn: { alignSelf: 'flex-start', paddingVertical: 12, marginVertical: -6 },
  histSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  myOpinionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  unfollowBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 11,
  },
  followUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  statementDone: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.purpleSoft,
  },
});
