import React from 'react';
import { Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { colors, radius, type, layout, press } from '../constants/theme';
import { useApp } from '../store/useApp';
import { Card, Empty } from '../components/ui';
import Avatar from '../components/Avatar';

export default function BlockedScreen() {
  const blocked = useApp((s) => s.blocked);
  const unblock = useApp((s) => s.unblockUser);

  const list = Object.keys(blocked).filter((n) => blocked[n]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 12 }, layout.content]}
    >
      <Text style={[type.small, { color: colors.textMuted }]}>
        차단한 사용자의 사연과 판결문은 피드에 노출되지 않습니다. 차단은 상대에게 알려지지 않습니다.
      </Text>

      {list.length === 0 ? (
        <Empty
          icon="ban"
          text="차단한 사용자가 없습니다"
          sub="사건이나 판결문의 ⋯ 메뉴에서 언제든 차단할 수 있습니다. 차단은 상대에게 알려지지 않습니다."
        />
      ) : (
        list.map((n) => (
          <Card key={n} style={s.row}>
            <Avatar name={n} size={32} />
            <Text style={[type.bodyStrong, { color: colors.text, flex: 1 }]} numberOfLines={1}>{n}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${n} 차단 해제`}
              onPress={() => unblock(n)}
              style={({ pressed }) => [s.unblock, pressed && press.surface]}
            >
              <Text style={[type.small, { color: colors.accent }]}>차단 해제</Text>
            </Pressable>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13 },
  unblock: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
});
