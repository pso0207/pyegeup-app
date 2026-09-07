import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, type, layout } from '../constants/theme';
import { REPORT_REASONS } from '../data/mock';
import { useApp } from '../store/useApp';
import { Card, Chip, Empty } from '../components/ui';

const label = (key) => REPORT_REASONS.find((r) => r.key === key)?.label ?? '기타';
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}시간 전` : `${Math.floor(h / 24)}일 전`;
};

export default function ReportsScreen() {
  const router = useRouter();
  const reports = useApp((s) => s.reports);
  // 스토어가 단일 출처다. 화면에서 목업 상수를 합치면 사용자의 실제 상태가 안 보인다.
  const list = Object.entries(reports)
    .map(([target, v]) => ({ id: target, target, reason: v.reason, at: v.at, state: v.state ?? '접수됨' }))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 12 }, layout.content]}
    >
      <Text style={[type.small, { color: colors.textMuted }]}>
        신고는 접수 후 24시간 내 처리됩니다. 명예훼손 신고는 판단이 곤란한 경우 최대 30일간 블라인드 처리될 수 있습니다.
      </Text>

      {list.length === 0 ? (
        <Empty
          icon="flag-outline"
          text="신고한 내역이 없습니다"
          sub="사연이나 판결문의 ⋯ 메뉴에서 신고할 수 있습니다. 접수 후 24시간 내 처리됩니다."
          action="재판소로 가기"
          onAction={() => router.push('/')}
        />
      ) : (
        list.map((r) => (
          <Card key={r.id} style={{ gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[type.bodyStrong, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {r.target}
              </Text>
              <Chip
                label={r.state}
                color={r.state === '처리중' ? colors.close : colors.info}
                small
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flag" size={12} color={colors.textFaint} />
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                {label(r.reason)} · {ago(r.at)}
              </Text>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({});
