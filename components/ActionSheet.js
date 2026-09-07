import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, type, press } from '../constants/theme';

/**
 * 하단 시트. 신고 · 차단 · 삭제처럼 확인이 필요한 동작에 쓴다.
 * options: [{ key, label, desc, icon, danger }]
 */
export default function ActionSheet({ visible, title, subtitle, options, onSelect, onClose, confirmLabel }) {
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState(null);
  const needsPick = !!confirmLabel;

  const close = () => {
    setPicked(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={s.backdrop} onPress={close} accessibilityRole="button" accessibilityLabel="닫기" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.handle} />
        <View style={{ gap: 3, paddingHorizontal: 18 }}>
          <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[type.small, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>

        <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ padding: 12, gap: 6 }}>
          {options.map((o) => {
            const on = picked === o.key;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                onPress={() => {
                  if (needsPick) return setPicked(o.key);
                  onSelect(o.key);
                  close();
                }}
                style={({ pressed }) => [
                  s.option,
                  on && { borderColor: colors.accent, backgroundColor: colors.accentSoft },
                  pressed && press.surface,
                ]}
              >
                {o.icon ? (
                  <Ionicons name={o.icon} size={17} color={o.danger ? colors.guilty : colors.textMuted} />
                ) : null}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[type.bodyStrong, { color: o.danger ? colors.guilty : colors.text }]}>{o.label}</Text>
                  {o.desc ? <Text style={[type.tiny, { color: colors.textFaint }]}>{o.desc}</Text> : null}
                </View>
                {needsPick ? (
                  <Ionicons
                    name={on ? 'radio-button-on' : 'radio-button-off'}
                    size={17}
                    color={on ? colors.accent : colors.textFaint}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 12, gap: 8 }}>
          {needsPick ? (
            <Pressable
              accessibilityRole="button"
              disabled={!picked}
              onPress={() => {
                onSelect(picked);
                close();
              }}
              style={({ pressed }) => [
                s.confirm,
                { backgroundColor: colors.brandFill },
                !picked && { opacity: 0.35 },
                pressed && press.surface,
              ]}
            >
              <Text style={[type.h3, { color: '#FFF' }]}>{confirmLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={close} style={s.cancel}>
            <Text style={[type.h3, { color: colors.textMuted }]}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
    gap: 6,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  confirm: { alignItems: 'center', paddingVertical: 14, borderRadius: radius.md },
  cancel: { alignItems: 'center', paddingVertical: 14 },
});
