import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import ToastHost from '../components/Toast';
import { installWebFocusStyle } from '../components/webFocusStyle';

// 웹 키보드 포커스 링. 네이티브에서는 아무 일도 하지 않는다.
installWebFocusStyle();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        {/* 종이 배경이므로 상태바 글자는 어두워야 한다.
            개표(case/result)만 암전되는데, 그 화면이 자체적으로 되돌린다. */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontSize: 16, fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="case/[id]" options={{ title: '사건 상세' }} />
          <Stack.Screen name="case/result" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="case/appeal" options={{ title: '항소 신청' }} />
          <Stack.Screen name="case/statement" options={{ title: '최후진술' }} />
          <Stack.Screen name="write/index" options={{ title: '사연 투고', presentation: 'modal' }} />
          <Stack.Screen name="court/select" options={{ title: '법원 선택' }} />
          <Stack.Screen name="notifications" options={{ title: '알림' }} />
          <Stack.Screen name="legal" options={{ title: '약관' }} />
          <Stack.Screen name="u/[nick]" options={{ title: '배심원 프로필' }} />
          <Stack.Screen name="settings" options={{ title: '설정' }} />
          <Stack.Screen name="blocked" options={{ title: '차단한 사용자' }} />
          <Stack.Screen name="reports" options={{ title: '내 신고 내역' }} />
          <Stack.Screen name="tickets" options={{ title: '티켓', presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
