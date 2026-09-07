import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { colors, radius } from '../constants/theme';

/** 로딩 자리표시. 깜빡임 대신 은은한 명암 왕복만 준다. */
export function Bone({ w = '100%', h = 12, r = 6, style }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: r, backgroundColor: colors.surfaceAlt, opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] }) },
        style,
      ]}
    />
  );
}

/** 사건 행 자리표시 — CaseCard의 행 높이와 맞춰 목록이 튀지 않게 한다. */
export function CaseCardSkeleton() {
  return (
    <View style={s.row}>
      <Bone w={12} h={11} r={2} />
      <View style={{ flex: 1, gap: 6 }}>
        <Bone w="86%" h={15} r={3} />
        <Bone w="58%" h={11} r={3} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <View style={s.list}>
      {Array.from({ length: count }).map((_, i) => (
        <CaseCardSkeleton key={i} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
});
