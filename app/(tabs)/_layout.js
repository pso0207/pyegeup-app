import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { colors, type, radius } from '../../constants/theme';
import { useApp } from '../../store/useApp';
import { dailyPicks } from '../../data/mock';

const TITLES = {
  index: '재판소',
  archive: '판례집',
  court: '법원',
  ranking: '랭킹',
  profile: '내 프로필',
};

const icons = {
  index: ['hammer', 'hammer-outline'],
  archive: ['library', 'library-outline'],
  court: ['business', 'business-outline'],
  ranking: ['podium', 'podium-outline'],
  profile: ['person-circle', 'person-circle-outline'],
};

/** 활성 탭 위에 짧은 잉크 막대를 세운다. 색만으로는 구분이 약하고, 형태가 있어야 스캔된다. */
function TabIcon({ route, focused, color, size, badge, badgeTone }) {
  const pair = icons[route] ?? icons.index;
  const alert = badgeTone === 'alert';
  return (
    <View style={s.iconWrap}>
      <View style={[s.marker, focused && { backgroundColor: colors.accent }]} />
      <Ionicons name={focused ? pair[0] : pair[1]} size={size - 2} color={color} />
      {badge ? (
        <View style={[s.badge, alert ? s.badgeAlert : s.badgeCount]}>
          <Text
            maxFontSizeMultiplier={1.2}
            style={[
              type.tiny,
              { fontSize: 9.5, lineHeight: 12, color: alert ? '#FFF' : colors.onAccent },
            ]}
          >
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const unread = useApp((st) => st.notifs.filter((n) => n.unread).length);
  // 오늘의 5건만 센다. 전체 judged를 세면 판례집에서 판결한 사건까지 포함돼
  // 홈의 "오늘 N건 남았습니다"와 배지 숫자가 어긋난다.
  const judged = useApp((st) => st.judged);
  const remaining = Math.max(0, dailyPicks.length - dailyPicks.filter((id) => judged[id]).length);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        // 항목에 maxWidth를 주면 넓은 화면에서 탭이 왼쪽으로 몰린다. 폭 전체에 고르게 편다.
        tabBarItemStyle: { flex: 1 },
        // 라벨을 직접 그려 글자 배율 상한을 건다. 시스템 글자 크기를 최대로 올리면
        // 고정 높이 탭바 안에서 라벨이 잘렸다.
        tabBarLabel: ({ focused, color }) => (
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
            style={[type.tiny, { fontSize: 10.5, color, fontWeight: focused ? '700' : '500' }]}
          >
            {TITLES[route.name] ?? route.name}
          </Text>
        ),
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            route={route.name}
            focused={focused}
            color={color}
            size={size}
            badge={route.name === 'index' ? remaining : route.name === 'profile' ? unread : 0}
            badgeTone={route.name === 'profile' ? 'alert' : 'count'}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: '재판소', tabBarAccessibilityLabel: '재판소 탭' }} />
      <Tabs.Screen name="archive" options={{ title: '판례집', tabBarAccessibilityLabel: '판례집 탭' }} />
      <Tabs.Screen name="court" options={{ title: '법원', tabBarAccessibilityLabel: '법원 탭' }} />
      <Tabs.Screen name="ranking" options={{ title: '랭킹', tabBarAccessibilityLabel: '랭킹 탭' }} />
      <Tabs.Screen name="profile" options={{ title: '내 프로필', tabBarAccessibilityLabel: '내 프로필 탭' }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 7 },
  marker: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgElevated,
  },
  badgeAlert: { backgroundColor: colors.brandFill }, // 안 읽은 알림 — 흰 글자
  badgeCount: { backgroundColor: colors.accent },    // 남은 할 일 — 어두운 글자
});
