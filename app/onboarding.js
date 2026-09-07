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
  { icon: 'reader-outline', title: '사연이 올라옵니다', text: '네 칸(상황 · 내 행동 · 상대 반응 · 쟁점)으로 정리된 익명 사연이 매일 5건 배정됩니다.' },
  { icon: 'hammer-outline', title: '유죄인지 정합니다', text: '유죄면 형량 5단계까지 고릅니다. 남의 의견은 내가 투표한 뒤에야 열립니다.' },
  { icon: 'trending-up-outline', title: '다수와 맞히면 승급합니다', text: '적중하면 판사 지수가 오르고, 틀려도 깎이지 않습니다. 계급은 방청객에서 대법관까지.' },
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
  const setCourt = useApp((s) => s.setCourt);
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [picked, setPicked] = useState('love');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30, paddingHorizontal: 20, gap: 20 }, layout.content]}
    >
      {step === 0 ? (
        <>
          <View style={s.hero}>
            <Ionicons name="hammer" size={38} color={colors.accent} />
            <Text style={[type.display, { color: colors.text }]}>국민재판소</Text>
            <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
              내 흑역사를 국민 재판에 넘기고{'\n'}남의 사연을 심판하며 판사로 승급하는 익명 심판 커뮤니티
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {HOW.map((h, i) => (
              <View key={h.title} style={s.howRow}>
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

          <Button title="동의하고 시작하기" disabled={!agree} onPress={() => setStep(1)} full />
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
            <Text style={[type.h3, { color: colors.accent }]}>가입 축하 티켓 30장</Text>
            <Text style={[type.small, { color: colors.textMuted }]}>
              판결 1회에 티켓 1장이 소모됩니다. 출석 · 광고 · 사연 등록으로 충전할 수 있습니다.
            </Text>
          </Card>
          <Button
            title="입장하기"
            onPress={() => {
              setCourt(picked);
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
    padding: 28,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agree: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
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
