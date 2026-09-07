import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, type, shadow, layout, inputReset, press } from '../../constants/theme';
import { SENTENCES, courtById, caseNoOf, DIFFICULTY, CASE_STATUS } from '../../constants/domain';
import { cases, opinionsFor, REPORT_REASONS } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Card, Chip, Button, VerdictBar, Empty } from '../../components/ui';
import TicketPill from '../../components/TicketPill';
import Countdown from '../../components/Countdown';
import Stamp from '../../components/Stamp';
import ActionSheet from '../../components/ActionSheet';
import Segmented from '../../components/Segmented';
import OpinionCard from '../../components/OpinionCard';
import Avatar from '../../components/Avatar';
import Confirm from '../../components/Confirm';
import IconButton from '../../components/IconButton';
import LiveCount from '../../components/LiveCount';

const FIELDS = [
  { key: 'situation', label: '상황' },
  { key: 'action', label: '내 행동' },
  { key: 'reaction', label: '상대 반응' },
];

export default function CaseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  // 없는 사건 id를 c1로 흘려보내면 "다른 사건이 열리는" 조용한 버그가 된다. 명시적으로 막는다.
  const item = cases[id];
  const court = courtById(item?.courtId);
  const diff = DIFFICULTY[item?.difficulty];
  // 확정된 사건에만 도장을 찍는다. 공판 중에 찍히면 결과를 미리 알려주는 셈이다.
  const settled = item?.status === 'closed';

  const judged = useApp((s) => (item ? s.judged[item.id] : null));
  const submitVerdict = useApp((s) => s.submitVerdict);
  const tickets = useApp((s) => s.tickets);
  const peeked = useApp((s) => (item ? s.peeked[item.id] : false));
  const peekCase = useApp((s) => s.peekCase);
  const report = useApp((s) => s.report);
  const blockUser = useApp((s) => s.blockUser);
  const blocked = useApp((s) => (item ? s.blocked[item.author] : false));
  const marked = useApp((s) => (item ? !!s.bookmarks[item.id] : false));
  const toggleBookmark = useApp((s) => s.toggleBookmark);

  const revealed = !!judged || item?.status !== 'open';

  const [step, setStep] = useState(1);
  const [guilty, setGuilty] = useState(null);
  const [sentence, setSentence] = useState(3);
  const [opinion, setOpinion] = useState('');
  const [sheet, setSheet] = useState(null); // 'menu' | 'report'

  const opinionList = useMemo(() => (item ? opinionsFor(item.id) : []), [item?.id]);

  const pickSide = (g) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGuilty(g);
    setStep(g ? 2 : 3);
  };

  const pickSentence = async (level) => {
    setSentence(level);
    // 형량 1은 짧게, 형량 5는 3연타로 강하게 (기획서 06)
    if (level <= 2) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (level === 3) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (level === 4) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else {
      for (let i = 0; i < 3; i++) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise((r) => setTimeout(r, 90));
      }
    }
  };

  const submit = () => {
    if (tickets < 1) {
      setSheet('noTicket');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submitVerdict(item.id, { guilty, sentence: guilty ? sentence : null, opinion });
    router.push({ pathname: '/case/result', params: { id: item.id } });
  };

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: '사건을 찾을 수 없음' }} />
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
          <Empty
            icon="help-circle-outline"
            text="사건을 찾을 수 없습니다"
            sub={`사건번호 ${String(id).toUpperCase()}가 삭제되었거나 아직 검수 중입니다.`}
            action="재판소로 가기"
            onAction={() => router.replace('/')}
          />
        </View>
      </>
    );
  }

  if (blocked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <Empty
          icon="ban"
          text="차단한 사용자의 사연입니다"
          sub="설정 › 차단한 사용자에서 차단을 해제하면 다시 볼 수 있습니다."
          action="돌아가기"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: court.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: -6 }}>
              <TicketPill style={{ marginRight: 4 }} />
              <IconButton
                name={marked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={marked ? colors.accent : colors.textMuted}
                selected={marked}
                label={marked ? '스크랩 해제' : '이 사건 스크랩'}
                onPress={() => toggleBookmark(item.id)}
              />
              <IconButton
                name="ellipsis-horizontal"
                size={20}
                label="사건 메뉴"
                onPress={() => setSheet('menu')}
              />
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 44, gap: 16 }, layout.content]}
        showsVerticalScrollIndicator={false}
      >
        {/* 사건 표제부.
            이전에는 [법원][난이도][상태] 색 알약 세 개가 제목 위에 떠 있었는데,
            같은 정보를 서류 머리말 두 줄로 접었다. 알약은 카드마다 색이 붙어
            장식으로 읽히고, 머리말은 "이건 사건 기록이다"로 읽힌다.
            확정된 사건에는 우측에 도장을 찍어 스크롤 없이도 끝난 사건임을 알린다. */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Text style={[type.docNo, { color: colors.text, fontSize: 13 }]}>{caseNoOf(item)}</Text>
                <Text style={[type.tiny, { color: CASE_STATUS[item.status]?.color ?? colors.textMuted }]}>
                  {CASE_STATUS[item.status]?.label ?? ''}
                </Text>
              </View>
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                {court.name}
                {diff ? ` · ${diff.label}` : ''}
                {item.status === 'open' ? ' · ' : ''}
                {item.status === 'open' ? <Countdown minutes={item.closesInMin} prefix="마감 " /> : null}
              </Text>
            </View>
            {settled ? (
              <Stamp
                label={item.guiltyRate >= 0.5 ? '유죄' : '무죄'}
                tone={item.guiltyRate >= 0.5 ? 'guilty' : 'innocent'}
                size="lg"
              />
            ) : null}
          </View>

          {/* 표제부와 본문을 가르는 잉크 괘선. 서류의 문법이다. */}
          <View style={s.headRule} />

          <Text style={[type.h1, { color: colors.text, fontSize: 25, lineHeight: 35 }]}>{item.title}</Text>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`피고인 ${item.author} 프로필 보기`}
            onPress={() => router.push(`/u/${encodeURIComponent(item.author)}`)}
            style={({ pressed }) => [s.defendantRow, pressed && press.control]}
          >
            <Avatar name={item.author} size={26} />
            <View style={{ flex: 1 }}>
              <Text style={[type.small, { color: colors.text }]}>{item.author}</Text>
              <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>피고인</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
          </Pressable>
        </View>

        {/* 사연 본문 — 읽기 우선 레이아웃 */}
        <View style={s.story}>
          {FIELDS.map((f, i) => (
            <View key={f.key} style={{ gap: 7 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={s.markerLine} />
                <Text style={[type.label, { color: colors.accent }]}>{f.label}</Text>
              </View>
              <Text style={[type.read, { color: i === 0 ? colors.textMuted : colors.text }]}>
                {item[f.key]}
              </Text>
            </View>
          ))}
        </View>

        {/* 쟁점 — 판결의 기준이므로 따로 세운다 */}
        <View style={[s.issue, shadow.soft]}>
          <Text style={[type.label, { color: colors.accent }]}>쟁점</Text>
          <Text style={[type.h2, { color: colors.text, lineHeight: 28 }]}>{item.issue}</Text>
        </View>

        {/* 결과 or 판결 플로우 */}
        {revealed ? (
          <ResultBlock item={item} judged={judged} />
        ) : (
          <VerdictFlow
            step={step}
            setStep={setStep}
            guilty={guilty}
            sentence={sentence}
            opinion={opinion}
            setOpinion={setOpinion}
            pickSide={pickSide}
            pickSentence={pickSentence}
            submit={submit}
          />
        )}

        {/* 공판 중 실시간 개표 조기 열람 */}
        {item.status === 'open' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="실시간 개표 조기 열람, 티켓 3장"
            onPress={() => !peeked && peekCase(item.id)}
            style={({ pressed }) => [s.peek, peeked && { borderColor: colors.accentDim }, pressed && press.surface]}
          >
            {peeked ? (
              <View style={{ gap: 10, width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[type.h3, { color: colors.text }]}>실시간 개표</Text>
                  <Chip label="마감 전 중간 집계" color={colors.accent} small />
                </View>
                <VerdictBar guiltyRate={item.guiltyRate} height={9} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[type.tiny, { color: colors.textFaint }]}>
                    개표 시점에 뒤집힐 수 있습니다 · 현재
                  </Text>
                  <LiveCount
                    from={item.voteCount}
                    suffix="표"
                    everyMs={2600}
                    style={{ ...type.tiny, color: colors.textFaint }}
                  />
                </View>
              </View>
            ) : (
              <>
                <Ionicons name="eye" size={17} color={colors.ticket} />
                <View style={{ flex: 1 }}>
                  <Text style={[type.bodyStrong, { color: colors.text }]}>실시간 개표 열어보기</Text>
                  <Text style={[type.tiny, { color: colors.textFaint }]}>마감 전 중간 집계를 확인합니다</Text>
                </View>
                <Chip label="티켓 3" color={colors.ticket} bg={colors.ticketSoft} icon="ticket" small />
              </>
            )}
          </Pressable>
        ) : null}

        {/* 피고 최후진술 */}
        {item.statement ? (
          <View style={s.statement}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="megaphone" size={15} color={colors.purple} />
              <Text style={[type.h3, { color: colors.text }]}>피고 최후진술</Text>
            </View>
            <Text style={[type.read, { color: colors.textMuted, fontStyle: 'italic' }]}>
              "{item.statement}"
            </Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>판결 확정 후 피고가 1회 남긴 말입니다</Text>
          </View>
        ) : null}

        {/* 판결문 */}
        <OpinionSection
          list={opinionList}
          locked={!revealed}
          count={item.opinionCount}
          caseId={item.id}
        />

        {item.status === 'appeal' ? (
          <Card style={{ gap: 11, borderColor: colors.close }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="refresh" size={15} color={colors.close} />
              <Text style={[type.h3, { color: colors.text }]}>항소심 진행 중</Text>
            </View>
            <Text style={[type.body, { color: colors.textMuted }]}>
              피고가 티켓 50장을 소모해 항소했습니다. 재심 24시간 동안 최초 배심원단은 참여할 수 없습니다.
            </Text>
            <Button
              title="항소 사건 보기"
              tone="ghost"
              onPress={() =>
                router.push({
                  pathname: '/case/appeal',
                  params: {
                    id: item.id,
                    title: item.title,
                    rate: String(item.guiltyRate),
                    votes: String(item.voteCount),
                    sentence: String(item.avgSentence),
                    score: String(Math.round(item.guiltyRate * 100)),
                  },
                })
              }
            />
          </Card>
        ) : null}
      </ScrollView>

      {/* 사건 메뉴 */}
      <ActionSheet
        visible={sheet === 'menu'}
        title="사건"
        subtitle={item.title}
        options={[
          {
            key: 'bookmark',
            label: marked ? '스크랩 해제' : '판례집에 스크랩',
            desc: marked ? '내 스크랩 코너에서 뺍니다' : '판례집 › 내 스크랩에 담아둡니다',
            icon: marked ? 'bookmark' : 'bookmark-outline',
          },
          { key: 'share', label: '공유하기', desc: '링크를 복사합니다', icon: 'share-social' },
          { key: 'profile', label: '피고인 프로필 보기', desc: item.author, icon: 'person-circle' },
          { key: 'report', label: '신고하기', desc: '규정을 위반한 사연입니다', icon: 'flag', danger: true },
          { key: 'block', label: `${item.author} 차단`, desc: '이 사용자의 사연을 보지 않습니다', icon: 'ban' },
        ]}
        onSelect={(k) => {
          if (k === 'bookmark') toggleBookmark(item.id);
          if (k === 'share') useApp.getState().showToast('링크를 복사했습니다', 'ok');
          if (k === 'profile') setTimeout(() => router.push(`/u/${encodeURIComponent(item.author)}`), 240);
          if (k === 'report') setTimeout(() => setSheet('report'), 260);
          if (k === 'block') blockUser(item.author);
        }}
        onClose={() => setSheet(null)}
      />

      {/* 티켓 부족 */}
      <Confirm
        visible={sheet === 'noTicket'}
        icon="ticket"
        title="티켓이 부족합니다"
        message="판결 1회에 티켓 1장이 필요합니다. 광고 시청이나 사연 등록으로 채울 수 있습니다."
        confirmLabel="티켓 받으러 가기"
        cancelLabel="닫기"
        onConfirm={() => router.push('/tickets')}
        onClose={() => setSheet(null)}
      />

      {/* 신고 사유 */}
      <ActionSheet
        visible={sheet === 'report'}
        title="신고 사유를 선택하세요"
        subtitle="접수 후 24시간 내 처리됩니다"
        confirmLabel="신고 접수"
        options={REPORT_REASONS.map((r) => ({ key: r.key, label: r.label, desc: r.desc }))}
        onSelect={(k) => report(item.id, k, '사연')}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

function ResultBlock({ item, judged }) {
  const router = useRouter();
  const myOpinion = useApp((s) => s.myOpinions[item.id]);
  const writeOpinion = useApp((s) => s.writeOpinion);
  const [draft, setDraft] = useState('');
  const [writing, setWriting] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 13 }}>
        <Text style={[type.h3, { color: colors.text }]}>개표 결과</Text>
        <VerdictBar guiltyRate={item.guiltyRate} height={10} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[type.small, { color: colors.textMuted }]}>
            평균 형량 {item.avgSentence.toFixed(1)}단계 · {SENTENCES[Math.round(item.avgSentence) - 1]?.name}
          </Text>
          <Text style={[type.small, { color: colors.textMuted }]}>{item.voteCount.toLocaleString()}표</Text>
        </View>
        {judged ? (
          <View style={s.myVerdictBox}>
            <Ionicons
              name={judged.guilty ? 'hammer' : 'shield-checkmark'}
              size={16}
              color={judged.guilty ? colors.guilty : colors.innocent}
            />
            <Text style={[type.small, { color: colors.text }]}>
              내 판결 — {judged.guilty ? `유죄 ${judged.sentence}단계 (${SENTENCES[judged.sentence - 1].name})` : '무죄'}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* 판결 완료자만 판결문 작성 */}
      {judged ? (
        myOpinion ? (
          <Card style={{ gap: 8, borderColor: colors.accentDim }}>
            <Text style={[type.label, { color: colors.accent }]}>내 판결문</Text>
            <Text style={[type.read, { color: colors.text }]}>{myOpinion}</Text>
          </Card>
        ) : writing ? (
          <Card style={{ gap: 11 }}>
            <Text style={[type.h3, { color: colors.text }]}>판결문 쓰기</Text>
            <View style={s.opinionInputWrap}>
              <TextInput
                value={draft}
                onChangeText={(t) => t.length <= 200 && setDraft(t)}
                placeholder="왜 그렇게 판결했는지 200자 이내로 적어주세요"
                placeholderTextColor={colors.textFaint}
                multiline
                autoFocus
                accessibilityLabel="판결문 입력"
                style={[type.read, { color: colors.text, minHeight: 90, textAlignVertical: 'top' }, inputReset]}
              />
              <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'right' }]}>{draft.length} / 200</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              <Button title="취소" tone="ghost" onPress={() => setWriting(false)} style={{ flex: 1 }} />
              <Button
                title="등록"
                disabled={draft.trim().length < 5}
                onPress={() => {
                  writeOpinion(item.id, draft);
                  setWriting(false);
                }}
                style={{ flex: 2 }}
              />
            </View>
          </Card>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setWriting(true)}
            style={({ pressed }) => [s.writePrompt, pressed && press.surface]}
          >
            <Ionicons name="create-outline" size={17} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[type.bodyStrong, { color: colors.text }]}>판결문 남기기</Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>추천받으면 판사 지수 +3</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
          </Pressable>
        )
      ) : null}
    </View>
  );
}

function VerdictFlow({ step, setStep, guilty, sentence, opinion, setOpinion, pickSide, pickSentence, submit }) {
  return (
    <View style={[s.flow, shadow.card]}>
      <View style={s.stepRow}>
        {['유죄 / 무죄', '형량', '판결문'].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[s.stepDot, (active || done) && { backgroundColor: colors.accent }]}>
                <Text style={[type.tiny, { color: active || done ? colors.onAccent : colors.textFaint, fontSize: 10 }]}>
                  {n}
                </Text>
              </View>
              <Text style={[type.tiny, { color: active ? colors.text : colors.textFaint }]}>{label}</Text>
              {i < 2 ? <View style={s.stepLine} /> : null}
            </View>
          );
        })}
      </View>

      {step === 1 ? (
        <View style={{ gap: 13 }}>
          <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]}>당신의 판결은?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="유죄 선고"
              onPress={() => pickSide(true)}
              style={({ pressed }) => [
                s.sideBtn,
                { borderColor: colors.guilty, backgroundColor: colors.guiltySoft },
                pressed && press.choice,
              ]}
            >
              <Ionicons name="hammer" size={26} color={colors.guilty} />
              <Text style={[type.h1, { color: colors.guilty }]}>유죄</Text>
              <Text style={[type.tiny, { color: colors.textMuted }]}>형량을 정합니다</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="무죄 선고"
              onPress={() => pickSide(false)}
              style={({ pressed }) => [
                s.sideBtn,
                { borderColor: colors.innocent, backgroundColor: colors.innocentSoft },
                pressed && press.choice,
              ]}
            >
              <Ionicons name="shield-checkmark" size={26} color={colors.innocent} />
              <Text style={[type.h1, { color: colors.innocent }]}>무죄</Text>
              <Text style={[type.tiny, { color: colors.textMuted }]}>그럴 수 있습니다</Text>
            </Pressable>
          </View>
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
            판결 1회에 티켓 1장이 소모됩니다
          </Text>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 15 }}>
          <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]}>형량을 정하세요</Text>
          <View style={{ alignItems: 'center', gap: 3 }}>
            <Text style={[type.display, { color: colors.guilty }]}>{SENTENCES[sentence - 1].name}</Text>
            <Text style={[type.small, { color: colors.textMuted }]}>{SENTENCES[sentence - 1].nuance}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {SENTENCES.map((sv) => {
              const active = sentence === sv.level;
              return (
                <Pressable
                  key={sv.level}
                  accessibilityRole="button"
                  accessibilityLabel={`${sv.level}단계 ${sv.name}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => pickSentence(sv.level)}
                  style={[
                    s.sentenceStep,
                    {
                      // 채움색은 brandFill. guilty(#FF4D57) 위 흰 글자는 3.26:1로 미달이다.
                      backgroundColor: active ? colors.brandFill : colors.surfaceAlt,
                      borderColor: active ? colors.guilty : colors.border,
                    },
                  ]}
                >
                  <Text style={[type.h2, { color: active ? '#FFF' : colors.textFaint }]}>{sv.level}</Text>
                  <Text
                    style={[type.tiny, { color: active ? 'rgba(255,255,255,0.92)' : colors.textFaint, fontSize: 9.5 }]}
                    numberOfLines={1}
                  >
                    {sv.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="이전" tone="ghost" onPress={() => setStep(1)} style={{ flex: 1 }} />
            <Button title="다음" onPress={() => setStep(3)} style={{ flex: 2 }} />
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 13 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={[type.h2, { color: colors.text }]}>한 줄 판결문 (선택)</Text>
            <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
              추천을 받으면 판사 지수 +3 · 최다 추천 3건은 상단 고정
            </Text>
          </View>
          <View style={s.opinionInputWrap}>
            <TextInput
              value={opinion}
              onChangeText={(t) => t.length <= 200 && setOpinion(t)}
              placeholder="왜 그렇게 판결했는지 200자 이내로 적어주세요"
              placeholderTextColor={colors.textFaint}
              multiline
              accessibilityLabel="판결문 입력"
              style={[type.read, { color: colors.text, minHeight: 88, textAlignVertical: 'top' }, inputReset]}
            />
            <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'right' }]}>{opinion.length} / 200</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={[type.small, { color: colors.textMuted }]}>내 판결</Text>
            <Text style={[type.bodyStrong, { color: guilty ? colors.guilty : colors.innocent }]}>
              {guilty ? `유죄 · ${SENTENCES[sentence - 1].name}` : '무죄'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="이전" tone="ghost" onPress={() => setStep(guilty ? 2 : 1)} style={{ flex: 1 }} />
            <Button title="의사봉 두드리기" icon="hammer" onPress={submit} style={{ flex: 2 }} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function OpinionSection({ list, locked, count, caseId }) {
  const router = useRouter();
  const [tab, setTab] = useState('top');
  const [sort, setSort] = useState('top');
  const [sheetFor, setSheetFor] = useState(null);
  const hidden = useApp((s) => s.hiddenOpinions);
  const hideOpinion = useApp((s) => s.hideOpinion);
  const blocked = useApp((s) => s.blocked);
  const report = useApp((s) => s.report);
  const blockUser = useApp((s) => s.blockUser);

  const visible = list.filter((o) => !hidden[o.id] && !blocked[o.author]);
  const guiltyCount = visible.filter((o) => o.guilty).length;

  const tabs = [
    { key: 'top', label: '전체', count: visible.length },
    { key: 'guilty', label: '유죄 측', count: guiltyCount },
    { key: 'innocent', label: '무죄 측', count: visible.length - guiltyCount },
  ];

  const filtered = visible
    .filter((o) => (tab === 'guilty' ? o.guilty : tab === 'innocent' ? !o.guilty : true))
    .sort((a, b) =>
      sort === 'harsh'
        ? (b.guilty ? b.sentence : 0) - (a.guilty ? a.sentence : 0)
        : b.likeCount - a.likeCount
    );

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[type.h2, { color: colors.text }]}>판결문 {count.toLocaleString()}</Text>
        {!locked ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`정렬 기준 변경, 현재 ${sort === 'top' ? '추천순' : '형량순'}`}
            onPress={() => setSort((v) => (v === 'top' ? 'harsh' : 'top'))}
            hitSlop={12}
            style={s.sortBtn}
          >
            <Text style={[type.tiny, { color: colors.textMuted }]}>
              {sort === 'top' ? '추천순' : '형량 높은순'} ⇅
            </Text>
          </Pressable>
        ) : (
          <Text style={[type.tiny, { color: colors.textFaint }]}>투표 완료자만 열람</Text>
        )}
      </View>

      {!locked ? <Segmented items={tabs} value={tab} onChange={setTab} /> : null}

      {locked ? (
        <Card style={{ alignItems: 'center', gap: 9, paddingVertical: 30 }}>
          <View style={s.lockIcon}>
            <Ionicons name="lock-closed" size={18} color={colors.textFaint} />
          </View>
          <Text style={[type.bodyStrong, { color: colors.textMuted }]}>판결 후에 열람할 수 있습니다</Text>
          <Text style={[type.small, { color: colors.textFaint, textAlign: 'center', maxWidth: 260 }]}>
            남의 의견을 보고 투표하면 여론이 한쪽으로 쏠립니다. 먼저 판단해주세요.
          </Text>
          <View style={s.lockedPreview}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.blurLine, { width: `${88 - i * 18}%` }]} />
            ))}
          </View>
        </Card>
      ) : filtered.length === 0 ? (
        <Empty
          icon="chatbubbles-outline"
          text={tab === 'guilty' ? '유죄 측 판결문이 없습니다' : tab === 'innocent' ? '무죄 측 판결문이 없습니다' : '아직 판결문이 없습니다'}
          sub="첫 번째로 의견을 남기면 상단에 고정됩니다."
          action={tab === 'top' ? null : '전체 보기'}
          onAction={() => setTab('top')}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((o, i) => (
            <OpinionCard
              key={o.id}
              item={o}
              rank={sort === 'top' && tab === 'top' ? i + 1 : null}
              onMenu={setSheetFor}
            />
          ))}
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center', paddingVertical: 6 }]}>
            추천 상위 판결문만 표시하고 있습니다
          </Text>
        </View>
      )}

      <ActionSheet
        visible={!!sheetFor}
        title="판결문"
        subtitle={sheetFor?.author}
        options={[
          { key: 'profile', label: '작성자 프로필 보기', desc: '계급 · 적중률 · 대표 판결문', icon: 'person-circle' },
          { key: 'report', label: '신고하기', desc: '규정을 위반한 판결문입니다', icon: 'flag', danger: true },
          { key: 'block', label: '작성자 차단', desc: '이 배심원의 글을 보지 않습니다', icon: 'ban' },
          { key: 'hide', label: '이 판결문 숨기기', desc: '내 화면에서만 보이지 않습니다', icon: 'eye-off' },
        ]}
        onSelect={(k) => {
          if (k === 'profile') {
            const who = sheetFor.author;
            setTimeout(() => router.push(`/u/${encodeURIComponent(who)}`), 240);
          }
          if (k === 'report') report(`${caseId}:${sheetFor.id}`, 'defame', '판결문');
          if (k === 'block') blockUser(sheetFor.author);
          if (k === 'hide') hideOpinion(sheetFor.id);
        }}
        onClose={() => setSheetFor(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  // 표제부와 본문 사이 잉크 괘선. 이 한 줄이 화면을 '서류'로 만든다.
  headRule: { height: 1.5, backgroundColor: colors.accent, opacity: 0.85 },
  story: {
    gap: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 18,
  },
  markerLine: { width: 12, height: 2, borderRadius: 1, backgroundColor: colors.accentDim },
  // 쟁점은 사연 본문과 성격이 달라 왼쪽 굵은 선으로만 구분한다.
  issue: {
    gap: 8,
    padding: 17,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  flow: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 16,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  stepLine: { width: 14, height: 1, backgroundColor: colors.border },
  sideBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 24,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  sentenceStep: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  opinionInputWrap: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 4,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 13,
  },
  myVerdictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 12,
  },
  writePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentDim,
    backgroundColor: colors.accentSoft,
  },
  peek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  statement: {
    gap: 9,
    padding: 17,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    backgroundColor: colors.purpleSoft,
  },
  tabRow: { flexDirection: 'row', gap: 7 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  defendantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40, // paddingVertical만으로는 39dp였다
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  // 잠긴 판결문 자리에 흐릿한 글줄만 남겨 "여기 뭔가 있다"는 것만 알린다.
  lockedPreview: { alignSelf: 'stretch', gap: 7, marginTop: 8, opacity: 0.4 },
  blurLine: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt },
});
