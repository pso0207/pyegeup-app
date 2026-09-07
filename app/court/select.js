import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, layout } from '../../constants/theme';
import { COURTS, courtById } from '../../constants/domain';
import { courtStandings } from '../../data/mock';
import { useApp } from '../../store/useApp';
import { Button, Card } from '../../components/ui';
import Confirm from '../../components/Confirm';

export default function CourtSelect() {
  const router = useRouter();
  const current = useApp((s) => s.me.courtId);
  const setCourt = useApp((s) => s.setCourt);
  const [picked, setPicked] = useState(current);
  const [confirm, setConfirm] = useState(false);
  const used = useApp((st) => st.transfersUsed) >= 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
    >
      <View style={{ gap: 5 }}>
        <Text style={[type.h1, { color: colors.text }]}>소속 법원을 고르세요</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>
          법원은 사건 분류이자 길드입니다. 이적은 시즌당 1회만 가능합니다.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {COURTS.map((c) => {
          const on = picked === c.id;
          const stat = courtStandings.find((x) => x.courtId === c.id);
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${c.name} 선택`}
              onPress={() => setPicked(c.id)}
              style={[s.row, on && { borderColor: c.color, backgroundColor: c.color + '12' }]}
            >
              <View style={[s.emblem, { borderColor: on ? c.color : colors.border }]}>
                <Ionicons name={c.icon} size={20} color={on ? c.color : colors.textFaint} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[type.h3, { color: colors.text }]}>
                  {c.name}
                  {c.id === current ? ' · 현재 소속' : ''}
                </Text>
                <Text style={[type.tiny, { color: colors.textFaint }]}>
                  소속원 {stat?.members.toLocaleString()}명 · 주간 평균 {stat?.avg.toLocaleString()}점
                </Text>
              </View>
              <Ionicons
                name={on ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={on ? c.color : colors.textFaint}
              />
            </Pressable>
          );
        })}
      </View>

      <Card style={{ gap: 6 }}>
        <Text style={[type.h3, { color: colors.text }]}>이적 시 유의사항</Text>
        <Text style={[type.body, { color: colors.textMuted }]}>
          이적하면 이번 주 대항전 기여도는 새 법원으로 이월되지 않습니다. 프로필의 법원 명패는 새 법원 기준으로 갱신됩니다.
        </Text>
      </Card>

      <Button
        title={
          picked === current
            ? '현재 소속입니다'
            : used
            ? '이번 시즌 이적을 이미 사용했습니다'
            : '이 법원으로 이적'
        }
        disabled={picked === current || used}
        onPress={() => setConfirm(true)}
        full
      />
      {used && picked !== current ? (
        <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center', marginTop: 8 }]}>
          다음 시즌이 시작되면 다시 이적할 수 있습니다
        </Text>
      ) : null}

      <Confirm
        visible={confirm}
        icon="swap-horizontal"
        title={`${courtById(picked).name}으로 이적할까요?`}
        message="시즌당 1회만 가능합니다. 이번 주 대항전 기여도는 새 법원으로 넘어가지 않고, 프로필 명패는 새 법원 기준으로 갱신됩니다."
        confirmLabel="이적하기"
        onConfirm={() => {
          if (setCourt(picked)) {
            useApp.getState().showToast(`${courtById(picked).name}으로 이적했습니다`, 'ok');
            router.back();
          }
        }}
        onClose={() => setConfirm(false)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  emblem: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
