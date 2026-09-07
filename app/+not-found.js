import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, layout, press } from '../constants/theme';
import { Button } from '../components/ui';

/**
 * 잘못된 주소로 들어왔을 때.
 *
 * 이게 없으면 expo-router의 영어 개발자 화면("Unmatched Route / Page could not be
 * found.")이 그대로 사용자에게 보인다 — 오래된 공유 링크나 오타 한 글자로 충분히 닿는다.
 */
export default function NotFound() {
  const router = useRouter();
  const path = usePathname();

  return (
    <>
      <Stack.Screen options={{ title: '주소를 찾을 수 없음' }} />
      <View style={s.wrap}>
        <View style={s.inner}>
          <View style={s.icon}>
            <Ionicons name="help-outline" size={26} color={colors.textFaint} />
          </View>

          <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]}>
            이 주소에는 아무것도 없습니다
          </Text>
          <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
            링크가 오래돼 사라졌거나, 주소가 잘못 적혔을 수 있습니다.
          </Text>

          {path ? (
            <View style={s.path}>
              <Text style={[type.mono, { color: colors.textFaint, fontSize: 12 }]} numberOfLines={2}>
                {path}
              </Text>
            </View>
          ) : null}

          <View style={{ alignSelf: 'stretch', gap: 9, marginTop: 4 }}>
            <Button title="재판소로 가기" icon="hammer" onPress={() => router.replace('/')} full />
            <Button title="판례집에서 찾아보기" tone="ghost" onPress={() => router.replace('/archive')} full />
          </View>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  inner: { ...layout.content, alignItems: 'center', gap: 12 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 4,
  },
  path: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginTop: 2,
  },
});
