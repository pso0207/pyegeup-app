import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, hit, press } from '../constants/theme';

/**
 * 아이콘만 있는 버튼.
 *
 * 맨 아이콘에 hitSlop만 주면 두 가지가 잘못된다.
 *  1) 표적이 44dp에 못 미친다 (Material 48dp · Apple 44pt · WCAG 2.5.5 44px).
 *  2) 아이콘을 나란히 두면 hitSlop이 서로 겹쳐, 위에 그려진 쪽이 이웃의 탭까지 가져간다.
 *     실제로 사건 상세 헤더에서 북마크 오른쪽을 누르면 메뉴가 열리고 있었다.
 *
 * 그래서 hitSlop 대신 40×40 실제 박스를 잡고, 줄에서는 gap을 0~2로 붙인다.
 * 박스끼리는 겹치지 않으므로 어느 지점을 눌러도 의도한 버튼이 눌린다.
 */
export default function IconButton({
  name,
  size = 18,
  color = colors.textMuted,
  onPress,
  label,
  selected,
  disabled,
  tone,          // 'surface'면 배경 있는 원형 버튼
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.box,
        tone === 'surface' && s.surface,
        disabled && { opacity: 0.4 },
        pressed && press.control,
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  box: {
    width: hit.box,
    height: hit.box,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
});
