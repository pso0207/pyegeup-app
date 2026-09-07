import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, type } from '../constants/theme';

/**
 * 확정 도장(印).
 *
 * 종이 UI에서 "이 사건은 끝났다"를 알리는 가장 짧은 신호다.
 * 진행 중 사건과 확정 사건을 상태 텍스트로만 구분하면 목록을 훑을 때 안 보이는데,
 * 도장은 색·형태·기울기가 전부 달라 스캔 한 번에 잡힌다.
 *
 * 실제 인장처럼 살짝 기울여 찍는다. 정확히 수평이면 UI 배지로 읽히고,
 * 기울면 "찍힌 것"으로 읽힌다 — 이 앱에서 그 차이가 정체성이다.
 *
 * 색은 판결 결과를 따른다: 유죄는 인주 빨강, 무죄는 먹녹색.
 * 무효·기타는 회색이라 "찍히긴 했으나 뜻이 없다"로 읽힌다.
 */

const TONES = {
  guilty: colors.guilty,
  innocent: colors.innocent,
  neutral: colors.textFaint,
};

export default function Stamp({ label, tone = 'guilty', size = 'md', style }) {
  const c = TONES[tone] ?? TONES.neutral;
  const big = size === 'lg';
  const sm = size === 'sm';
  const dim = big ? 68 : sm ? 38 : 52;
  const fs = big ? 15 : sm ? 9 : 12;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label} 확정`}
      style={[
        s.seal,
        {
          width: dim,
          height: dim,
          borderRadius: dim,
          borderColor: c,
          borderWidth: big ? 2.5 : sm ? 1.5 : 2,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={1.1}
        style={[
          type.label,
          { color: c, fontSize: fs, lineHeight: fs * 1.25, letterSpacing: big ? 1 : 0.4 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * 목록용 납작 도장. 원형 도장은 행 높이를 먹어서, 밀도가 중요한 목록에서는
 * 같은 인주색의 각인 형태로 줄인다. 원형과 같은 뜻이되 한 줄에 들어간다.
 */
export function StampChip({ label, tone = 'guilty' }) {
  const c = TONES[tone] ?? TONES.neutral;
  return (
    <View style={[s.chip, { borderColor: c }]}>
      <Text maxFontSizeMultiplier={1.2} style={[type.label, { color: c, fontSize: 10, letterSpacing: 0.2 }]}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  seal: {
    alignItems: 'center',
    justifyContent: 'center',
    // 인장은 비뚤게 찍힌다. 수평이면 배지, 기울면 도장.
    transform: [{ rotate: '-11deg' }],
    backgroundColor: 'transparent',
  },
  chip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderRadius: 2,
    alignSelf: 'center',
  },
});
