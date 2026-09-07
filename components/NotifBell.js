import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, type, press } from '../constants/theme';
import { useApp } from '../store/useApp';

/** 알림 종 + 안읽음 배지. 헤더 어디에나 놓을 수 있게 독립 컴포넌트로 뺐다. */
export default function NotifBell({ size = 40 }) {
  const router = useRouter();
  const unread = useApp((s) => s.notifs.filter((n) => n.unread).length);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread ? `알림 ${unread}건 읽지 않음` : '알림'}
      onPress={() => router.push('/notifications')}
      style={({ pressed }) => [s.btn, { width: size, height: size }, pressed && press.control]}
    >
      <Ionicons name={unread ? 'notifications' : 'notifications-outline'} size={19} color={unread ? colors.accent : colors.text} />
      {unread ? (
        <View style={s.badge}>
          <Text maxFontSizeMultiplier={1.2} style={[type.tiny, { color: '#FFF', fontSize: 9.5, lineHeight: 12 }]}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandFill,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
});
