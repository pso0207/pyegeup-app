import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type, shadow, press } from '../constants/theme';

export function Card({ style, children, onPress, ...rest }) {
  const base = [s.card, shadow.card, style];
  // View는 함수형 style을 지원하지 않는다. 누를 수 있을 때만 Pressable의 함수형을 쓴다.
  if (!onPress) {
    return (
      <View style={base} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [...base, pressed && press.surface]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

// 제목 앞 아이콘은 쓰지 않는다. 섹션마다 아이콘이 붙으면 화면이 장식처럼 보이고,
// 실제 커뮤니티 게시판은 괘선과 굵기로만 구획을 세운다.
// (호출부의 죽은 icon prop은 전부 제거했다 — 받지도 않는다)
export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={s.sectionRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }}>
        {/* 잉크 괘선 한 조각. 아이콘 없이 구획을 세우는 서류의 방식이다. */}
        <View style={s.sectionMark} />
        <Text style={[type.h2, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} ${action}`}
          onPress={onAction}
          style={({ pressed }) => [s.sectionAction, pressed && press.control]}
        >
          <Text style={[type.small, { color: colors.textMuted }]}>{action} ›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * 표(表). 라벨 왼쪽 · 값 오른쪽 · 사이에 괘선.
 *
 * 이 앱에서 "AI 느낌"의 가장 큰 원인은 **3열 대형 숫자 스탯 블록**이었다
 * (`판사 지수 3,310 / 적중률 73% / 판결 수 402`). 대시보드의 대표 부품이고,
 * AI가 만든 앱은 거의 전부 이걸 쓴다. 정보량은 세 줄인데 화면은 한 화면을 먹는다.
 *
 * 에브리타임 프로필 · 디시 갤로그 · 클리앙 회원정보는 전부 표다.
 * 서류도 표다. 숫자를 키우는 대신 **오른쪽 끝에 정렬**해서 세로로 읽히게 한다.
 *
 *   rows: [['판사 지수', '3,310'], ['적중률', '73%', colors.guilty]]
 */
export function Facts({ rows, style }) {
  const list = rows.filter(Boolean);
  return (
    <View style={style}>
      {list.map(([label, value, tint], i) => (
        <View key={label} style={[s.factRow, i === list.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={[type.small, { color: colors.textMuted, flexShrink: 1 }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[type.mono, { color: tint ?? colors.text }]} numberOfLines={1}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * 구획. 제목 + 괘선 + 내용을 **종이 위에 그대로** 놓는다.
 *
 * `Card`로 감싸면 흰 상자가 종이 위에 떠서, 화면이 정보가 아니라 위젯 묶음으로 읽힌다.
 * 상자를 쌓지 말고 괘선으로 나누는 것이 서류이자 게시판의 방식이다.
 * (`Card`는 진짜로 "떠 있어야" 하는 것 — 배너 · 알림 — 에만 남긴다)
 */
export function Section({ title, note, action, onAction, children, style }) {
  return (
    <View style={[{ gap: 10 }, style]}>
      {title ? <SectionTitle title={title} action={action} onAction={onAction} /> : null}
      <View style={s.rule} />
      {note ? <Text style={[type.small, { color: colors.textFaint }]}>{note}</Text> : null}
      {children}
    </View>
  );
}

/** 괘선 한 줄. */
export function Rule({ style }) {
  return <View style={[s.rule, style]} />;
}

export function Chip({ label, color = colors.textMuted, bg, icon, small }) {
  return (
    <View
      style={[
        s.chip,
        { backgroundColor: bg ?? colors.accentSoft, borderColor: color + '55' },
        small && { paddingVertical: 2, paddingHorizontal: 7 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={10.5} color={color} /> : null}
      <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={[type.tiny, { color, fontSize: small ? 10 : 11 }]}>
        {label}
      </Text>
    </View>
  );
}

export function Button({ title, onPress, tone = 'primary', disabled, icon, style, full }) {
  const map = {
    primary: { bg: colors.accent, fg: colors.onAccent },
    // 종이 팔레트에서는 유죄 적색 하나가 글자로도 채움으로도 통과한다 (6.52:1).
    // 다크 시절 brand/brandFill을 나눠야 했던 제약이 라이트에서는 사라졌다.
    guilty: { bg: colors.brandFill, fg: '#FFF' },
    innocent: { bg: colors.innocent, fg: colors.onAccent },
    ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
    surface: { bg: colors.surfaceAlt, fg: colors.text },
  };
  const c = map[tone] ?? map.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: c.bg, borderColor: c.border ?? 'transparent', borderWidth: c.border ? 1 : 0 },
        full && { alignSelf: 'stretch' },
        disabled && { opacity: 0.35 },
        pressed && press.cta,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={c.fg} /> : null}
      <Text style={[type.h3, { color: c.fg }]}>{title}</Text>
    </Pressable>
  );
}

/** 가로 막대 게이지 — 유죄/무죄 비율 */
export function VerdictBar({ guiltyRate, height = 8, showLabels = true, animatedWidth }) {
  const pct = Math.round(guiltyRate * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`유죄 ${pct}퍼센트, 무죄 ${100 - pct}퍼센트`}
    >
      <View style={[s.bar, { height, borderRadius: height }]}>
        <View
          style={{
            width: `${pct}%`,
            backgroundColor: colors.guilty,
            height: '100%',
            borderRadius: height,
          }}
        />
      </View>
      {showLabels ? (
        <View style={s.barLabels}>
          <Text style={[type.tiny, { color: colors.guilty }]}>유죄 {pct}%</Text>
          <Text style={[type.tiny, { color: colors.innocent }]}>무죄 {100 - pct}%</Text>
        </View>
      ) : null}
    </View>
  );
}

/** 데일리 진행 도트 ●●●○○ */
export function ProgressDots({ total = 5, done = 0 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === done ? 18 : 7,
            height: 7,
            borderRadius: 4,
            backgroundColor:
              i < done ? colors.accent : i === done ? colors.accentDim : colors.border,
          }}
        />
      ))}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.borderSoft }, style]} />;
}

export function Empty({ icon = 'file-tray', text, sub, action, onAction }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 44, gap: 10 }}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={22} color={colors.textFaint} />
      </View>
      <Text style={[type.bodyStrong, { color: colors.textMuted }]}>{text}</Text>
      {sub ? (
        <Text style={[type.small, { color: colors.textFaint, textAlign: 'center', maxWidth: 260 }]}>{sub}</Text>
      ) : null}
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={s.emptyAction}>
          <Text style={[type.small, { color: colors.accent }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
  },
  sectionMark: { width: 3, height: 15, backgroundColor: colors.accent, borderRadius: 1 },
  rule: { height: 1, backgroundColor: colors.border },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionRowFlush: { marginBottom: 0, marginTop: 0 },
  // 링크도 표적이다. 글자만 두면 높이가 20dp밖에 안 된다.
  sectionAction: { paddingVertical: 12, paddingLeft: 14, marginVertical: -12, marginRight: -4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  bar: {
    backgroundColor: colors.innocent,
    overflow: 'hidden',
    width: '100%',
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  emptyAction: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
});
