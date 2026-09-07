import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, type, layout, press } from '../constants/theme';
import { TICKET_COST } from '../constants/domain';
import { useApp } from '../store/useApp';
import { Facts, Section } from '../components/ui';

// cap과 done은 실제 사용량(store.claims)에서 계산한다.
// 고정 문자열로 두면 "1일 3회"라고 써놓고 무한히 받을 수 있었다.
const earnList = (claims) => [
  { key: 'attend', label: '데일리 출석', amount: 10, cap: '1일 1회', done: claims.attend, claim: 'attend' },
  { key: 'streak', label: '7일 연속 출석', amount: 20, cap: '보너스 · 5일 남음' },
  { key: 'post', label: '사연 등록 승인', amount: 25, cap: '1일 2건', action: '/write' },
  {
    key: 'ad',
    label: '리워드 광고 시청',
    amount: 5,
    cap: claims.ads >= 3 ? '오늘 다 받았습니다' : `1일 3회 · ${3 - claims.ads}회 남음`,
    icon: 'play-circle',
    done: claims.ads >= 3,
    claim: 'ad',
  },
  { key: 'reward', label: '판결 후 랜덤 보상', amount: 1.5, cap: '판결당 기대값' },
  { key: 'battle', label: '법원 대항전 1위', amount: 100, cap: '주간' },
];

export default function TicketsScreen() {
  const router = useRouter();
  const tickets = useApp((s) => s.tickets);
  const claims = useApp((s) => s.claimsToday());
  const claimAttend = useApp((s) => s.claimAttend);
  const claimAd = useApp((s) => s.claimAd);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 40, gap: 14 }, layout.content]}
    >
      {/* 잔액. 이전에는 호박색 히어로 카드 안에 40px 숫자와 티켓 아이콘이 있었다.
          "큰 숫자 하나짜리 카드"는 대시보드 위젯이지 화면이 아니다. 한 줄로 적는다. */}
      <View style={{ gap: 2 }}>
        <Text style={[type.h1, { color: colors.text }]}>티켓 {tickets}장</Text>
        <Text style={[type.small, { color: colors.textFaint }]}>
          판결 1건에 1장 소모 · 현금으로는 구매할 수 없습니다
        </Text>
      </View>

      {/* 획득 경로.
          이전에는 6줄이 각각 흰 둥근 카드 + 정사각 아이콘 타일이었다.
          누를 수 있는 줄(출석 · 광고 · 투고)만 표적으로 세우고 나머지는 표로 읽는다. */}
      <Section title="티켓 얻기">
        <View>
          {earnList(claims).map((e, i, arr) => {
            const tappable = !!(e.action || e.claim) && !e.done;
            const Row = (
              <>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[type.small, { color: colors.text }]}>{e.label}</Text>
                  <Text style={[type.tiny, { color: colors.textFaint }]}>{e.cap}</Text>
                </View>
                <Text
                  style={[
                    type.mono,
                    { color: e.done ? colors.innocent : tappable ? colors.accent : colors.textMuted },
                  ]}
                >
                  {e.done ? '수령 완료' : `+${e.amount}`}
                </Text>
              </>
            );
            const style = [s.earnRow, i === arr.length - 1 && { borderBottomWidth: 0 }];
            return tappable ? (
              <Pressable
                key={e.key}
                accessibilityRole="button"
                accessibilityLabel={`${e.label}, ${e.cap}`}
                onPress={() => {
                  if (e.action) return router.push(e.action);
                  if (e.claim === 'attend') return claimAttend();
                  if (e.claim === 'ad') return claimAd();
                }}
                style={({ pressed }) => [...style, pressed && press.surface]}
              >
                {Row}
              </Pressable>
            ) : (
              <View key={e.key} style={[...style, e.done && { opacity: 0.6 }]}>
                {Row}
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="티켓 소모">
        <Facts
          rows={[
            ['판결 1회', `-${TICKET_COST.verdict}`],
            ['마감 전 실시간 개표 조기 열람', `-${TICKET_COST.peek}`],
            ['항소 신청', `-${TICKET_COST.appeal}`],
            ['판례집 열람', '무료', colors.innocent],
          ]}
        />
        <Text style={[type.tiny, { color: colors.textFaint }]}>
          티켓은 현금으로 구매할 수 없습니다. 판결 결과나 지수를 돈으로 바꾸는 상품은 제공하지 않습니다.
        </Text>
      </Section>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44, // 누를 수 있는 줄이 섞여 있어 전부 표적 높이를 지킨다
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
});
