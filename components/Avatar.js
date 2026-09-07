import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '../constants/theme';

/**
 * 익명 커뮤니티라 사진이 없다. 대신 닉네임에서 결정적으로 뽑은 색 + 두 글자로
 * "인장(印章)" 모양 배지를 만든다. 같은 닉네임은 어느 화면에서도 같은 인장이 된다.
 */

// 인장은 종이에 찍는 것이라 색이 어둡고 채도가 낮아야 한다.
// 10색 전부 bg·surface·surfaceAlt에서 4.5:1 이상을 계산으로 확인했다.
// (이전 팔레트는 다크용 밝은 형광색이라 종이 위에서는 전부 미달이었다)
const PALETTE = [
  '#8A3324', '#2E4A7D', '#2F6B4F', '#6B4C8A',
  '#8A6114', '#1F6B72', '#A8323F', '#4A5A2E',
  '#7A4A16', '#3F5470',
];

export function seedOf(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarColor(name = '') {
  return PALETTE[seedOf(name) % PALETTE.length];
}

/** 익명의피고인_4821 → 48 / 금전지법 부장판사 → 금전 / 판결기계_0417 → 판결 */
function initialsOf(name = '') {
  const clean = String(name).trim();
  if (!clean) return '??';
  const m = clean.match(/_(\d{2,})$/);
  if (m) return m[1].slice(0, 2);
  const head = clean.replace(/[_\s].*$/, '');
  return head.slice(0, 2);
}

export default function Avatar({ name = '', size = 34, me, style, ring }) {
  const c = me ? colors.accent : avatarColor(name);
  const label = initialsOf(name);
  const fs = size * 0.36;
  return (
    <View
      accessible={false}
      style={[
        s.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.31,
          backgroundColor: c + '14',
          borderColor: ring ? c : c + '55',
          borderWidth: ring ? 1.5 : 1,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[type.tiny, { color: c, fontSize: fs, letterSpacing: -0.3, lineHeight: fs * 1.3 }]}
      >
        {label}
      </Text>
    </View>
  );
}

/** 아바타 + 닉네임 + 부가정보 한 줄. 커뮤니티 화면 어디서나 같은 모양으로 쓴다. */
export function UserLine({ name, sub, size = 32, me, right, verified, onPress, tint }) {
  const Wrap = View;
  return (
    <Wrap style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 }}>
      <Avatar name={name} size={size} me={me} ring={me} />
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text
            numberOfLines={1}
            style={[type.small, { color: tint ?? colors.text, flexShrink: 1 }]}
          >
            {name}
          </Text>
          {me ? <Text style={[type.tiny, { color: colors.accent, fontSize: 10 }]}>· 나</Text> : null}
          {verified ? <Ionicons name="shield-checkmark" size={11} color={colors.info} /> : null}
        </View>
        {sub ? (
          <Text numberOfLines={1} style={[type.tiny, { color: colors.textFaint, fontSize: 10.5 }]}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right}
    </Wrap>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
