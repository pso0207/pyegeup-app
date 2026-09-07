import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, dark, radius, type, shadow } from '../constants/theme';
import { useApp } from '../store/useApp';

// 종이 위에서는 토스트를 반전시킨다(잉크 바탕 + 미색 글자).
// 밝은 회색 토스트는 종이 배경에 묻혀 "떠 있는 알림"으로 읽히지 않는다.
// 의미색은 어두운 바탕 위에서 읽혀야 하므로 dark 팔레트 쪽 값을 쓴다.
const TONES = {
  default: { icon: 'information-circle', color: dark.text },
  ok: { icon: 'checkmark-circle', color: dark.innocent },
  warn: { icon: 'alert-circle', color: dark.close },
  error: { icon: 'close-circle', color: dark.guilty },
};

export default function ToastHost() {
  const toast = useApp((s) => s.toast);
  const hide = useApp((s) => s.hideToast);
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 180 }).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(hide);
    }, 2600);
    return () => clearTimeout(timer.current);
  }, [toast?.id]);

  if (!toast) return null;
  const tone = TONES[toast.tone] ?? TONES.default;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        s.wrap,
        shadow.card,
        {
          bottom: insets.bottom + (Platform.OS === 'ios' ? 96 : 74),
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      <Ionicons name={tone.icon} size={16} color={tone.color} />
      <Text style={[type.small, { color: colors.onAccent, flex: 1 }]}>{toast.message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignSelf: 'center',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    zIndex: 999,
  },
});
