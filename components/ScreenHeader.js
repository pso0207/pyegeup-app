import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type, press } from '../constants/theme';

/**
 * 탭 화면 상단. 다섯 화면이 각자 헤더를 짜면서 라벨 크기와 여백이 조금씩 달랐다.
 * title(큰 제목) + eyebrow(아래 설명 한 줄) + 우측 액션으로 통일한다.
 */
export default function ScreenHeader({ eyebrow, title, right, action, onAction, actionLabel }) {
  return (
    <View style={s.wrap}>
      <View style={s.copy}>
        {/* 제목이 먼저다.
            작은 라벨을 제목 위에 얹는 eyebrow는 SaaS 랜딩의 문법이고, 한국어 UI에서는
            읽는 순서까지 뒤집는다. 제목을 세우고 설명을 아래에 붙인다. */}
        <Text style={[type.h1, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {eyebrow ? <Text numberOfLines={1} style={[type.tiny, { color: colors.textFaint }]}>{eyebrow}</Text> : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel ?? action}
          onPress={onAction}
          hitSlop={12}
          style={({ pressed }) => [s.action, pressed && press.control]}
        >
          <Text style={[type.small, { color: colors.textMuted }]}>{action}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.textFaint} />
        </Pressable>
      ) : null}
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    paddingLeft: 14,
    marginVertical: -6,
    marginRight: -4,
  },
});
