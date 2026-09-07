import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, layout, inputReset } from '../../constants/theme';
import { useApp } from '../../store/useApp';
import { extraOpinions } from '../../data/mock';
import { Card, Button, Chip, VerdictBar, SectionTitle } from '../../components/ui';
import OpinionCard from '../../components/OpinionCard';
import Confirm from '../../components/Confirm';

export default function StatementScreen() {
  const router = useRouter();
  const { title = '친구 소개팅 자리에 30분 늦음', rate = '0.88', id = 'mc1' } = useLocalSearchParams();
  const submitStatement = useApp((s) => s.submitStatement);
  const [text, setText] = useState('');
  const [confirm, setConfirm] = useState(false);

  const ok = text.trim().length >= 20;

  // 무엇에 대해 말하는지 모르면 최후진술을 쓸 수 없다. 가장 아팠을 판결문부터 보여준다.
  const harshest = Object.values(extraOpinions)
    .flat()
    .filter((o) => o.guilty)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[type.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>{title}</Text>
            <Chip label="확정" color={colors.textMuted} small />
          </View>
          <VerdictBar guiltyRate={Number(rate)} height={8} />
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            판결이 확정되었습니다 · 최후진술은 이 사건 배심원 전원에게 전달됩니다
          </Text>
        </Card>

        <View>
          <SectionTitle title="가장 많이 추천받은 유죄 의견" />
          <View style={{ gap: 10 }}>
            {harshest.map((o) => (
              <OpinionCard key={o.id} item={o} compact canReply={false} />
            ))}
          </View>
        </View>

        <View style={{ gap: 7 }}>
          <Text style={[type.h2, { color: colors.text }]}>피고 최후진술</Text>
          <Text style={[type.small, { color: colors.textMuted }]}>
            판결에 참여한 배심원 전원에게 알림이 발송됩니다. 확정 후 48시간 내 1회만 작성할 수 있고, 수정과 삭제는 불가능합니다.
          </Text>
        </View>

        <View style={s.inputWrap}>
          <TextInput
            value={text}
            onChangeText={(t) => t.length <= 300 && setText(t)}
            placeholder="판결을 받아들이든 반박하든, 하고 싶은 말을 남기세요 (20자 이상)"
            placeholderTextColor={colors.textFaint}
            multiline
            accessibilityLabel="최후진술 입력"
            style={[type.body, { color: colors.text, minHeight: 140, textAlignVertical: 'top' }, inputReset]}
          />
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'right' }]}>{text.length} / 300</Text>
        </View>

        <Card style={{ gap: 8, borderColor: colors.close }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Ionicons name="warning" size={15} color={colors.close} />
            <Text style={[type.h3, { color: colors.text }]}>주의</Text>
          </View>
          <Text style={[type.small, { color: colors.textMuted }]}>
            최후진술에도 실명 · 회사명 · 학교명 · 연락처 필터가 적용됩니다. 배심원을 향한 비방이 담기면 계정 정지 대상입니다.
          </Text>
        </Card>

        <Button
          title="최후진술 등록 (1회)"
          icon="megaphone"
          disabled={!ok}
          onPress={() => setConfirm(true)}
          full
        />
        {!ok ? (
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
            20자 이상 적어야 등록할 수 있습니다 ({text.trim().length} / 20)
          </Text>
        ) : null}

        <Confirm
          visible={confirm}
          icon="megaphone"
          title="최후진술을 등록할까요?"
          message="사건당 1회만 가능하며 수정과 삭제가 불가능합니다. 이 사건에 판결한 배심원 전원에게 알림이 갑니다."
          confirmLabel="등록"
          onConfirm={() => {
            submitStatement(String(id), text);
            router.back();
          }}
          onClose={() => setConfirm(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  inputWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 4,
  },
});
