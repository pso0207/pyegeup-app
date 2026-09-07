import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, type, layout, press } from '../constants/theme';
import { NOTIF_KIND } from '../data/mock';
import { useApp } from '../store/useApp';
import { Empty } from '../components/ui';
import Segmented from '../components/Segmented';
import IconButton from '../components/IconButton';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'mine', label: '내 사건' },
  { key: 'community', label: '커뮤니티' },
  { key: 'system', label: '운영' },
];

const GROUP = {
  verdict: 'mine',
  result: 'mine',
  appeal: 'mine',
  opinion: 'community',
  rival: 'community',
  court: 'community',
  system: 'system',
  ticket: 'system',
};

export default function Notifications() {
  const router = useRouter();
  const notifs = useApp((s) => s.notifs);
  const readNotif = useApp((s) => s.readNotif);
  const readAll = useApp((s) => s.readAllNotifs);
  const clearAll = useApp((s) => s.clearNotifs);
  const [filter, setFilter] = useState('all');

  const unread = notifs.filter((n) => n.unread).length;
  const list = useMemo(
    () => notifs.filter((n) => filter === 'all' || GROUP[n.kind] === filter),
    [notifs, filter]
  );

  const open = (n) => {
    Haptics.selectionAsync();
    readNotif(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '알림',
          headerRight: () =>
            notifs.length ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={unread ? '모두 읽음으로 표시' : '알림함 비우기'}
                onPress={unread ? readAll : clearAll}
                style={({ pressed }) => [{ paddingVertical: 12, paddingHorizontal: 10, marginRight: -6 }, pressed && press.control]}
              >
                <Text style={[type.small, { color: colors.accent }]}>
                  {unread ? '모두 읽음' : '비우기'}
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.summary}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[type.h2, { color: colors.text }]}>
              {unread ? `읽지 않은 알림 ${unread}건` : '모두 확인했습니다'}
            </Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              개표 · 판결문 · 대항전 소식이 여기 모입니다
            </Text>
          </View>
          <IconButton
            name="options-outline"
            size={19}
            label="알림 설정으로 이동"
            tone="surface"
            onPress={() => router.push('/settings')}
          />
        </View>

        <Segmented items={FILTERS} value={filter} onChange={setFilter} />

        {list.length === 0 ? (
          <Empty
            icon="notifications-off"
            text="알림이 없습니다"
            sub="사건을 판결하거나 사연을 투고하면 소식이 도착합니다."
            action="재판소로 가기"
            onAction={() => router.push('/')}
          />
        ) : (
          <View style={{ gap: 9 }}>
            {list.map((n) => {
              const k = NOTIF_KIND[n.kind] ?? NOTIF_KIND.system;
              return (
                <Pressable
                  key={n.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${k.label} 알림, ${n.title}`}
                  onPress={() => open(n)}
                  style={({ pressed }) => [
                    s.row,
                    n.unread && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    pressed && press.surface,
                  ]}
                >
                  <View style={[s.icon, { backgroundColor: k.color + '18', borderColor: k.color + '44' }]}>
                    <Ionicons name={k.icon} size={16} color={k.color} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[type.tiny, { color: k.color, fontSize: 10 }]}>{k.label}</Text>
                      <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>· {n.at}</Text>
                    </View>
                    <Text style={[type.bodyStrong, { color: colors.text }]} numberOfLines={2}>
                      {n.title}
                    </Text>
                    <Text style={[type.small, { color: colors.textMuted }]} numberOfLines={2}>
                      {n.body}
                    </Text>
                  </View>
                  {n.unread ? <View style={s.dot} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center', marginTop: 4 }]}>
          알림은 30일간 보관됩니다
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 },
});
