import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, layout, inputReset } from '../../constants/theme';
import { TICKET_COST, SENTENCES } from '../../constants/domain';
import { useApp } from '../../store/useApp';
import { Card, Button, Chip, VerdictBar } from '../../components/ui';
import TicketPill from '../../components/TicketPill';
import Confirm from '../../components/Confirm';

export default function AppealScreen() {
  const router = useRouter();
  // 하드코딩된 사건을 보여주고 있었다. 어느 사건에서 눌러도 "동생 택배"가 떴다.
  const {
    id = 'mc2',
    title = '동생 택배를 뜯어봄',
    rate = '0.91',
    votes = '2410',
    sentence = '3.6',
    score = '82',
  } = useLocalSearchParams();
  const guiltyRate = Number(rate);
  const tickets = useApp((s) => s.tickets);
  const spend = useApp((s) => s.spendTickets);
  const [text, setText] = useState('');
  const [confirm, setConfirm] = useState(false);

  const enough = tickets >= TICKET_COST.appeal;
  const ok = enough && text.trim().length >= 30;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[type.h3, { color: colors.text }]}>1심 판결</Text>
            <Chip label="확정" color={colors.textMuted} small />
          </View>
          <Text style={[type.body, { color: colors.text }]}>{title}</Text>
          <VerdictBar guiltyRate={guiltyRate} height={9} />
          <Text style={[type.small, { color: colors.textFaint }]}>
            {Number(votes).toLocaleString()}표 · 평균 형량 {Number(sentence).toFixed(1)}단계
            {SENTENCES[Math.round(Number(sentence)) - 1]
              ? ` (${SENTENCES[Math.round(Number(sentence)) - 1].name})`
              : ''}
            {' · 사건점수 '}{score}점
          </Text>
        </Card>

        <View style={{ gap: 7 }}>
          <Text style={[type.h3, { color: colors.text }]}>소명문</Text>
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            300자 이내 · 1심에서 밝히지 않은 사정을 적으면 재심 결과가 달라질 수 있습니다
          </Text>
          <View style={s.inputWrap}>
            <TextInput
              value={text}
              onChangeText={(t) => t.length <= 300 && setText(t)}
              placeholder="왜 억울한지 설명해주세요 (30자 이상)"
              placeholderTextColor={colors.textFaint}
              multiline
              style={[type.body, { color: colors.text, minHeight: 130, textAlignVertical: 'top' }, inputReset]}
            />
            <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'right' }]}>{text.length} / 300</Text>
          </View>
        </View>

        <Card style={{ gap: 9 }}>
          <Text style={[type.h3, { color: colors.text }]}>재심 규칙</Text>
          {[
            '티켓 50장이 소모됩니다 (환불 없음)',
            '재심 기간은 24시간입니다',
            '1심 배심원단은 재심에 참여할 수 없습니다',
            '재심 결과가 우선 반영되며 1심은 이력으로 보존됩니다',
            '재심에서 무죄를 받으면 억울함 인증 훈장이 지급됩니다',
          ].map((r) => (
            <View key={r} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Ionicons name="ellipse" size={5} color={colors.accent} style={{ marginTop: 7 }} />
              <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>{r}</Text>
            </View>
          ))}
        </Card>

        <View style={s.costRow}>
          <Text style={[type.small, { color: colors.textMuted }]}>보유 티켓</Text>
          <TicketPill />
        </View>

        {enough ? (
          <Button
            title={`항소 신청 (티켓 ${TICKET_COST.appeal})`}
            tone="guilty"
            icon="refresh"
            disabled={!ok}
            onPress={() => setConfirm(true)}
            full
          />
        ) : (
          // 티켓이 모자랄 때 버튼을 죽여두면 길이 끊긴다. 충전 화면으로 보낸다.
          <Button
            title={`티켓 ${TICKET_COST.appeal - tickets}장 더 필요 · 받으러 가기`}
            tone="primary"
            icon="ticket"
            onPress={() => router.push('/tickets')}
            full
          />
        )}
        {!enough ? null : ok ? null : (
          <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center', marginTop: 8 }]}>
            소명문을 30자 이상 적어야 항소할 수 있습니다 ({text.trim().length} / 30)
          </Text>
        )}
        <Confirm
          visible={confirm}
          icon="refresh"
          title="항소를 신청할까요?"
          message={`티켓 ${TICKET_COST.appeal}장이 소모되며 되돌릴 수 없습니다. 재심 24시간 동안 1심 배심원단은 참여할 수 없습니다.`}
          confirmLabel={`티켓 ${TICKET_COST.appeal}장 사용`}
          onConfirm={() => {
            if (spend(TICKET_COST.appeal)) {
              useApp.getState().showToast('항소가 접수되었습니다 · 24시간 뒤 재심 확정', 'ok');
              useApp.getState().pushNotif({
                kind: 'appeal',
                title: '항소가 접수되었습니다',
                body: `"${title}" · 재심 24시간 · 1심 배심원단은 참여할 수 없습니다`,
                href: '/profile',
              });
              router.back();
            }
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
  costRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
