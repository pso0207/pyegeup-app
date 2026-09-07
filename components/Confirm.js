import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, shadow, press } from '../constants/theme';

/**
 * 확인 대화상자.
 * RN Web에서 Alert.alert은 아무것도 띄우지 않아, 계정 삭제·항소처럼
 * 되돌릴 수 없는 동작이 웹에서 조용히 무시됐다. 그래서 직접 만든다.
 */
export default function Confirm({
  visible,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger,
  icon,
  onConfirm,
  onClose,
}) {
  // 아이콘·테두리는 밝은 빨강(글자 대비), 버튼 채움은 어두운 빨강(흰 글자 대비).
  const accent = danger ? colors.guilty : colors.accent;
  const fill = danger ? colors.brandFill : colors.accent;
  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={s.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      />
      <View style={s.center} pointerEvents="box-none">
        <View
          style={[s.box, shadow.card]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <View style={[s.icon, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
            <Ionicons name={icon ?? (danger ? 'warning' : 'help-circle')} size={20} color={accent} />
          </View>
          <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
          {message ? (
            <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>{message}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 9, alignSelf: 'stretch', marginTop: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onClose}
              style={({ pressed }) => [s.btn, s.ghost, pressed && press.surface]}
            >
              <Text style={[type.h3, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={() => {
                onConfirm?.();
                onClose?.();
              }}
              style={({ pressed }) => [
                s.btn,
                { backgroundColor: fill, flex: 1.4 },
                pressed && press.surface,
              ]}
            >
              <Text style={[type.h3, { color: danger ? '#FFF' : colors.onAccent }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 26 },
  box: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 11,
    padding: 22,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  ghost: { borderWidth: 1, borderColor: colors.border },
});
