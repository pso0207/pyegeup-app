import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, press } from '../constants/theme';

/**
 * 탭.
 *
 * 이전에는 둥근 트랙 안에서 표시자가 미끄러지는 세그먼트 컨트롤이었다.
 * 잘 만든 부품이긴 한데, 그래서 문제였다 — **부품처럼 보인다.**
 * 트랙 · 알약 · 미끄러지는 썸네일은 전부 "디자인된 컨트롤"의 신호라,
 * 화면이 정보가 아니라 UI 킷으로 읽힌다.
 *
 * 네이버 카페 · 에브리타임 · 다음 카페는 전부 **밑줄 탭**이다.
 * 활성 항목 아래 잉크 밑줄 하나. 그게 전부다.
 *
 * 라벨 옆 아이콘은 받지 않는다. 한국어 라벨은 이미 두세 글자라 아이콘이 뜻을 더하지 않고,
 * 셋이 나란히 붙으면 탭이 아니라 툴바로 읽힌다.
 */
export default function Segmented({ items, value, onChange, style }) {
  return (
    <View style={[s.wrap, style]}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={it.label}
            onPress={() => onChange(it.key)}
            style={({ pressed }) => [s.item, on && s.itemOn, pressed && press.control]}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={[
                type.bodyStrong,
                { color: on ? colors.text : colors.textFaint, fontSize: 14 },
              ]}
            >
              {it.label}
              {it.count != null ? (
                <Text style={{ color: on ? colors.textMuted : colors.textFaint }}> {it.count}</Text>
              ) : null}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  // 탭 줄 전체에 깔리는 괘선. 활성 탭만 그 위에 잉크 밑줄을 덮어쓴다.
  wrap: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // 표적 높이 44dp 확보
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  itemOn: { borderBottomColor: colors.accent },
});
