import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors, radius, type, layout } from '../constants/theme';

/**
 * 약관 · 개인정보처리방침 본문.
 * 설정에서 이 항목을 누르면 아무 일도 일어나지 않고 있었다.
 * 스토어 심사에도 앱 내 열람 경로가 필요하다.
 */
const DOCS = {
  eula: {
    title: '커뮤니티 가이드라인 · 이용약관',
    updated: '2026-09-01 개정',
    intro:
      '국민재판소는 오락 목적의 익명 심판 커뮤니티입니다. 여기서 내려지는 판결에 법적 효력은 없으며, 특정인을 향한 공격에 쓰일 수 없습니다.',
    sections: [
      {
        h: '1. 투고할 수 있는 것',
        body: [
          '본인이 직접 겪은 일만 투고할 수 있습니다.',
          '제3자의 일을 대신 올리거나, 특정인을 지목해 심판받게 하는 것은 전면 금지됩니다.',
          '실명 · 회사명 · 학교명 · 연락처 · 계정 아이디는 자동으로 차단되며, 우회 표기도 같은 기준으로 처리됩니다.',
        ],
      },
      {
        h: '2. 판결문과 반박',
        body: [
          '판단은 사연에 대해서만 합니다. 피고인의 인격을 공격하는 표현은 삭제 대상입니다.',
          '반박은 판결문 1건당 1단계까지만 달 수 있습니다. 논쟁이 길어지는 것을 막기 위한 구조입니다.',
          '판결문은 투표를 마친 뒤에 열람하고 작성할 수 있습니다.',
        ],
      },
      {
        h: '3. 신고와 조치',
        body: [
          '모든 사연 · 판결문 · 사용자는 신고할 수 있고, 접수 후 24시간 내 검토합니다.',
          '명예훼손 신고는 판단이 곤란한 경우 최대 30일간 블라인드 처리될 수 있습니다.',
          '반복 위반 시 투고 제한 · 판결 제한 · 계정 정지 순으로 조치합니다.',
        ],
      },
      {
        h: '4. 티켓과 결제',
        body: [
          '티켓은 앱 내 재화이며 현금으로 환급되지 않습니다.',
          '이미 소모한 티켓(판결 · 조기 열람 · 항소)은 환불되지 않습니다.',
          '구독은 스토어 계정에서 언제든 해지할 수 있고, 해지해도 다음 결제일까지 유지됩니다.',
        ],
      },
      {
        h: '5. 연령',
        body: ['만 17세 이상만 이용할 수 있습니다.'],
      },
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    updated: '2026-09-01 개정',
    intro:
      '국민재판소는 익명 서비스입니다. 사연을 판결하고 판결받는 데 필요한 최소한만 수집합니다.',
    sections: [
      {
        h: '수집하는 것',
        body: [
          '계정 식별자 — 소셜 로그인이 제공하는 고유 ID. 이름 · 이메일은 받지 않습니다.',
          '앱 내 활동 — 판결 기록, 투고한 사연, 판결문, 티켓 잔액, 신고 · 차단 내역.',
          '기기 정보 — 푸시 토큰, OS 종류. 알림을 끄면 푸시 토큰은 삭제됩니다.',
        ],
      },
      {
        h: '수집하지 않는 것',
        body: [
          '실명 · 전화번호 · 주소 · 위치 · 연락처 목록 · 사진첩.',
          '닉네임은 가입 시 자동으로 배정되며 실명과 연결되지 않습니다.',
        ],
      },
      {
        h: '보관 기간',
        body: [
          '계정 삭제 시 판결 기록과 투고한 사연은 즉시 삭제됩니다.',
          '신고 처리 이력은 분쟁 대응을 위해 3개월간 보관 후 파기합니다.',
          '알림은 30일간 보관됩니다.',
        ],
      },
      {
        h: '제3자 제공',
        body: [
          '판매하거나 제공하지 않습니다.',
          '법령에 따른 수사기관의 적법한 요청이 있는 경우에만 예외로 합니다.',
        ],
      },
      {
        h: '이용자의 권리',
        body: [
          '설정 › 계정 삭제에서 언제든 전체 삭제를 요청할 수 있습니다.',
          '내가 올린 사연은 언제든 개별 삭제할 수 있습니다.',
          '문의: help@pyegeup.app',
        ],
      },
    ],
  },
};

export default function Legal() {
  const { doc } = useLocalSearchParams();
  const d = DOCS[String(doc)] ?? DOCS.eula;

  return (
    <>
      <Stack.Screen options={{ title: d.title }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ padding: 16, paddingBottom: 48, gap: 20 }, layout.content]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          <Text style={[type.tiny, { color: colors.textFaint }]}>{d.updated}</Text>
          <Text style={[type.read, { color: colors.text }]}>{d.intro}</Text>
        </View>

        {d.sections.map((sec) => (
          <View key={sec.h} style={s.section}>
            <Text style={[type.h3, { color: colors.text }]}>{sec.h}</Text>
            <View style={{ gap: 9 }}>
              {sec.body.map((line) => (
                <View key={line} style={{ flexDirection: 'row', gap: 9 }}>
                  <View style={s.dot} />
                  <Text style={[type.body, { color: colors.textMuted, flex: 1 }]}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
          국민재판소 v1.0.0 · 문의 help@pyegeup.app
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  section: {
    gap: 11,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentDim,
    marginTop: 10,
  },
});
