import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { colors, type, layout } from '../constants/theme';
import { useApp } from '../store/useApp';
import { blockedSeed } from '../data/mock';
import { Card, Divider } from '../components/ui';
import Confirm from '../components/Confirm';

function Row({ icon, label, value, onPress, danger, right }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && onPress && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={16} color={danger ? colors.guilty : colors.textMuted} />
      <Text style={[type.body, { color: danger ? colors.guilty : colors.text, flex: 1 }]}>{label}</Text>
      {right ?? (
        <>
          {value ? <Text style={[type.small, { color: colors.textFaint }]}>{value}</Text> : null}
          {onPress ? <Ionicons name="chevron-forward" size={15} color={colors.textFaint} /> : null}
        </>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const me = useApp((s) => s.me);
  const blocked = useApp((s) => s.blocked);
  const reports = useApp((s) => s.reports);
  const blockedCount = new Set([...blockedSeed, ...Object.keys(blocked)]).size;
  const reportCount = Object.keys(reports).length + 1;
  const push = useApp((st) => st.push);
  const setPush = useApp((st) => st.setPush);
  const [confirm, setConfirm] = useState(null);
  const showToast = useApp((st) => st.showToast);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
    >
      <Card style={{ padding: 0 }}>
        <Row
          icon="person-circle-outline"
          label="닉네임"
          value={me.nickname}
          onPress={() =>
            showToast('익명 닉네임은 가입 시 배정되며 변경할 수 없습니다', 'default')
          }
        />
        <Divider style={{ marginHorizontal: 14 }} />
        <Row icon="business-outline" label="소속 법원" value="연애지법" onPress={() => router.push('/court/select')} />
        <Divider style={{ marginHorizontal: 14 }} />
        <Row icon="logo-apple" label="연결된 계정" value="Apple 로그인" />
      </Card>

      <View style={{ gap: 8 }}>
        <Text style={[type.h3, { color: colors.textMuted, marginLeft: 4 }]}>알림</Text>
        <Card style={{ padding: 0 }}>
          {[
            { key: 'daily', label: '오늘의 사건 배정 (09:00)' },
            { key: 'myCase', label: '내 사건 실시간 · 마감 알림' },
            { key: 'result', label: '개표 결과 · 지수 정산 (24:00)' },
            { key: 'court', label: '법원 대항전 소식' },
          ].map((p, i, arr) => (
            <View key={p.key}>
              <Row
                icon="notifications-outline"
                label={p.label}
                right={
                  <Switch
                    accessibilityRole="switch"
                    accessibilityLabel={p.label}
                    accessibilityState={{ checked: !!push[p.key] }}
                    value={!!push[p.key]}
                    onValueChange={(v) => setPush(p.key, v)}
                    trackColor={{ true: colors.accentDim, false: colors.border }}
                    thumbColor={push[p.key] ? colors.accent : colors.textFaint}
                  />
                }
              />
              {i < arr.length - 1 ? <Divider style={{ marginHorizontal: 14 }} /> : null}
            </View>
          ))}
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[type.h3, { color: colors.textMuted, marginLeft: 4 }]}>안전</Text>
        <Card style={{ padding: 0 }}>
          <Row
            icon="ban-outline"
            label="차단한 사용자"
            value={`${blockedCount}명`}
            onPress={() => router.push('/blocked')}
          />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row
            icon="flag-outline"
            label="내 신고 내역"
            value={reportCount ? `${reportCount}건` : '1건 처리중'}
            onPress={() => router.push('/reports')}
          />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row
            icon="shield-outline"
            label="커뮤니티 가이드라인 · EULA"
            onPress={() => router.push('/legal?doc=eula')}
          />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row
            icon="mail-outline"
            label="문의하기"
            value="help@pyegeup.app"
            onPress={async () => {
              // 메일 앱이 없는 기기(에뮬레이터 포함)에서는 조용히 실패하므로 주소를 안내한다.
              const url = 'mailto:help@pyegeup.app?subject=' + encodeURIComponent('[국민재판소] 문의');
              const can = await Linking.canOpenURL(url).catch(() => false);
              if (can) Linking.openURL(url);
              else showToast('help@pyegeup.app 으로 보내주세요', 'default');
            }}
          />
        </Card>
        <Text style={[type.tiny, { color: colors.textFaint, marginLeft: 4 }]}>
          신고는 접수 후 24시간 내 처리됩니다. 불쾌 콘텐츠와 악성 이용자에 대해 무관용 정책을 적용합니다.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[type.h3, { color: colors.textMuted, marginLeft: 4 }]}>구독 · 결제</Text>
        <Card style={{ padding: 0 }}>
          <Row icon="sparkles-outline" label="명판사 패스" value="미구독" onPress={() => router.push('/ranking')} />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row
            icon="refresh-outline"
            label="구매 복원"
            onPress={() => showToast('구매 내역을 확인했습니다 · 복원할 항목이 없습니다', 'ok')}
          />
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[type.h3, { color: colors.textMuted, marginLeft: 4 }]}>계정</Text>
        <Card style={{ padding: 0 }}>
          <Row
            icon="document-text-outline"
            label="개인정보처리방침"
            onPress={() => router.push('/legal?doc=privacy')}
          />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row icon="log-out-outline" label="로그아웃" onPress={() => setConfirm('logout')} />
          <Divider style={{ marginHorizontal: 14 }} />
          <Row
            icon="trash-outline"
            label="계정 삭제"
            danger
            onPress={() => setConfirm('delete')}
          />
        </Card>
      </View>

      <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
        국민재판소 v1.0.0 · 17+ 연령등급
      </Text>
      <Confirm
        visible={confirm === 'delete'}
        danger
        icon="trash"
        title="계정을 삭제할까요?"
        message="작성한 사연과 판결 이력이 모두 삭제되며 복구할 수 없습니다. 진행 중인 사건은 즉시 무효 처리됩니다."
        confirmLabel="삭제"
        onConfirm={() => showToast('계정 삭제 요청이 접수되었습니다 · 7일 내 처리', 'warn')}
        onClose={() => setConfirm(null)}
      />
      <Confirm
        visible={confirm === 'logout'}
        icon="log-out"
        title="로그아웃할까요?"
        message="다시 로그인하면 판결 이력과 티켓은 그대로 유지됩니다."
        confirmLabel="로그아웃"
        onConfirm={() => showToast('로그아웃되었습니다', 'ok')}
        onClose={() => setConfirm(null)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
});
