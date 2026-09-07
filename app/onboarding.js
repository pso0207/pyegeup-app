import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, type, layout } from '../constants/theme';
import { COURTS } from '../constants/domain';
import { useApp } from '../store/useApp';
import { Button, Card } from '../components/ui';

/** 앱이 무엇인지 세 문장으로 — 약관을 읽기 전에 먼저 납득시킨다. */
const HOW = [
  { icon: 'reader-outline', title: '사연을 읽어요', text: '상황 · 행동 · 상대 반응만 읽으면 쟁점이 한 문장으로 정리돼요.' },
  { icon: 'hammer-outline', title: '내 판단을 남겨요', text: '유죄 또는 무죄를 고르고, 유죄라면 형량까지 정해요.' },
  { icon: 'trophy-outline', title: '마감 뒤 결과를 봐요', text: '다수의견과 맞으면 판사 지수가 올라요. 틀려도 점수는 깎이지 않아요.' },
];

const RULES = [
  { icon: 'person', text: '본인이 겪은 일만 투고할 수 있습니다. 제3자 저격은 전면 차단됩니다.' },
  { icon: 'shield-checkmark', text: '불쾌 콘텐츠와 악성 이용자에 대해 무관용 정책을 적용합니다.' },
  { icon: 'flag', text: '모든 사연과 판결문은 신고할 수 있고, 24시간 내 처리됩니다.' },
  { icon: 'eye-off', text: '실명 · 회사명 · 학교명 · 연락처는 자동으로 차단됩니다.' },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const onboardingCompleted = useApp((s) => s.onboardingCompleted);
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(onboardingCompleted);
  const currentCourt = useApp((s) => s.me.courtId);
  const [picked, setPicked] = useState(currentCourt || 'love');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30, paddingHorizontal: 20, gap: 20 }, layout.content]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이용 안내 닫고 재판소로 돌아가기"
        onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        style={{ minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' }}
      >
        <Text style={[type.small, { color: colors.textMuted }]}>‹ 재판소로 돌아가기</Text>
      </Pressable>
      <View
        style={s.steps}
        accessibilityRole="progressbar"
        accessibilityLabel={onboardingCompleted ? '이용 안내' : `이용 안내 ${step + 1}/2 단계`}
        accessibilityValue={onboardingCompleted ? undefined : { min: 1, max: 2, now: step + 1 }}
      >
        <View style={s.stepOn} />
        {!onboardingCompleted ? <View style={step === 1 ? s.stepOn : s.stepOff} /> : null}
      </View>
      {step === 0 ? (
        <>
          <View style={s.hero}>
            <Text style={[type.label, { color: colors.accentDim }]}>30초 이용 안내</Text>
            <Text style={[type.display, { color: colors.text, textAlign: 'center' }]}>남의 일은{`\n`}조금 더 잘 보이니까</Text>
            <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
              익명 사연을 읽고 유죄·무죄를 고르는 커뮤니티예요. 내 선택은 판결 전까지 남에게 보이지 않아요.
            </Text>
          </View>

          <View style={s.howList}>
            {HOW.map((h, i) => (
              <View key={h.title} style={[s.howRow, i > 0 && s.howDivider]}>
                <View style={s.howNum}>
                  <Text style={[type.tiny, { color: colors.accent, fontSize: 11 }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={h.icon} size={14} color={colors.accent} />
                    <Text style={[type.h3, { color: colors.text }]}>{h.title}</Text>
                  </View>
                  <Text style={[type.small, { color: colors.textMuted, lineHeight: 20 }]}>{h.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <Card style={{ gap: 13 }}>
            <Text style={[type.h3, { color: colors.text }]}>이용 약관 (EULA)</Text>
            {RULES.map((r) => (
              <View key={r.text} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Ionicons name={r.icon} size={15} color={colors.accent} style={{ marginTop: 3 }} />
                <Text style={[type.small, { color: colors.textMuted, flex: 1, lineHeight: 20 }]}>{r.text}</Text>
              </View>
            ))}
          </Card>

          {!onboardingCompleted ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agree }}
              accessibilityLabel="이용 약관에 동의하며 만 17세 이상입니다"
              onPress={() => setAgree(!agree)}
              style={s.agree}
            >
              <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={20} color={agree ? colors.accent : colors.textFaint} />
              <Text style={[type.small, { color: colors.text, flex: 1 }]}>
                위 내용에 동의하며, 만 17세 이상입니다
              </Text>
            </Pressable>
          ) : null}

          <Button
            title={onboardingCompleted ? '확인했어요' : '동의하고 계속하기'}
            disabled={!agree}
            onPress={() => onboardingCompleted ? router.replace('/') : setStep(1)}
            full
          />
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
            국민재판소는 오락 목적의 익명 커뮤니티이며, 판결에 법적 효력은 없습니다
          </Text>
        </>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <Text style={[type.label, { color: colors.accentDim }]}>2 / 2 단계</Text>
            <Text style={[type.h1, { color: colors.text }]}>소속 법원을 고르세요</Text>
            <Text style={[type.small, { color: colors.textMuted }]}>
              법원은 사건 분류이자 길드입니다. 이적은 시즌당 1회 가능합니다.
            </Text>
          </View>
          <View style={s.grid}>
            {COURTS.map((c) => {
              const on = picked === c.id;
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${c.name} 선택`}
                  onPress={() => setPicked(c.id)}
                  style={[s.courtCard, on && { borderColor: c.color, backgroundColor: c.color + '14' }]}
                >
                  <Ionicons name={c.icon} size={22} color={on ? c.color : colors.textFaint} />
                  <Text style={[type.h3, { color: on ? colors.text : colors.textMuted }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <Card style={{ gap: 6 }}>
            <Text style={[type.h3, { color: colors.accent }]}>티켓은 이렇게 써요</Text>
            <Text style={[type.small, { color: colors.textMuted }]}>
              판결 1회에 1장이 들고, 출석 · 광고 · 사연 등록으로 다시 채울 수 있어요.
            </Text>
          </Card>
          <Button
            title="입장하기"
            onPress={() => {
              completeOnboarding(picked);
              router.replace('/');
            }}
            full
          />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  steps: { flexDirection: 'row', gap: 6, alignSelf: 'stretch' },
  stepOn: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.accent },
  stepOff: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  agree: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  howList: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface, paddingHorizontal: 14 },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingVertical: 14,
  },
  howDivider: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  howNum: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
    marginTop: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  courtCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
});
