import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radius, type, layout, shadow, inputReset, press } from '../../constants/theme';
import { COURTS } from '../../constants/domain';
import { useApp } from '../../store/useApp';
import { Chip } from '../../components/ui';
import Confirm from '../../components/Confirm';

const FIELDS = [
  {
    key: 'situation',
    label: '상황',
    ask: '언제, 어디서 있었던 일인가요?',
    placeholder: '그날의 배경부터 편하게 적어보세요.',
    example: '지난주 금요일 밤 10시, 팀 회식 2차 노래방이었습니다. 다음날 오전에 개인 일정이 있었고 1차에서 이미 세 시간을 앉아 있었습니다.',
    min: 50,
    max: 500,
  },
  {
    key: 'action',
    label: '내 행동',
    ask: '내가 한 행동을 그대로 적어주세요',
    placeholder: '잘 보이려 다듬지 않아도 됩니다. 있었던 그대로가 판결에 유리합니다.',
    example: '팀장님이 화장실 간 사이에 아무에게도 말하지 않고 코트만 챙겨서 나왔습니다.',
    min: 20,
    max: 500,
  },
  {
    key: 'reaction',
    label: '상대 반응',
    ask: '상대는 어떻게 반응했나요?',
    placeholder: '그 뒤에 벌어진 일을 적어주세요.',
    example: '단톡방은 조용했고, 사수 선배가 개인 톡으로 "어제 그렇게 가면 어떡하냐"고 했습니다.',
    min: 10,
    max: 300,
  },
  {
    key: 'issue',
    label: '쟁점',
    ask: '무엇을 심판받고 싶나요?',
    placeholder: '한 문장으로 줄여주세요.',
    example: '말없이 회식 자리를 이탈한 것이 유죄인가요?',
    min: 5,
    max: 100,
  },
];

// 실시간 필터 — 실명 · 회사명 · 학교명 · 연락처
const PATTERNS = [
  { name: '전화번호', re: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g },
  { name: '이메일', re: /[\w.+-]+@[\w-]+\.[\w.]+/g },
  { name: 'SNS 아이디', re: /@[A-Za-z0-9_]{3,}/g },
  { name: '회사명', re: /(삼성|엘지|LG|네이버|카카오|현대|SK|쿠팡|배민|토스)\s?(전자|모빌리티|주식회사|㈜)?/g },
  { name: '학교명', re: /[가-힣]{2,6}(대학교|고등학교|중학교|초등학교)/g },
  { name: '실명 추정', re: /[가-힣]{2,3}\s?(씨|님|과장|대리|부장|팀장|선배|교수)/g },
];

export default function WriteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const submitPost = useApp((s) => s.submitPost);
  const showToast = useApp((s) => s.showToast);
  const myCourt = useApp((s) => s.me.courtId);

  const [courtId, setCourtId] = useState(myCourt);
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState({ situation: '', action: '', reaction: '', issue: '' });
  const [focused, setFocused] = useState(null);
  const [showExample, setShowExample] = useState(null);
  const [agree, setAgree] = useState(false);
  const [heights, setHeights] = useState({});

  const all = Object.values(form).join(' ');
  const flags = useMemo(() => {
    const found = [];
    for (const p of PATTERNS) {
      const m = all.match(p.re);
      if (m) found.push({ name: p.name, sample: m[0] });
    }
    return found;
  }, [all]);

  const doneCount = FIELDS.filter((f) => form[f.key].trim().length >= f.min).length;
  const lengthOk = doneCount === FIELDS.length;
  const canSubmit = lengthOk && flags.length === 0 && agree;
  const totalChars = all.replace(/\s/g, '').length;

  const submit = () => setConfirm(true);

  const reallySubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // 제목은 "내 행동" 첫 문장에서 뽑는다. 사용자가 제목을 따로 쓰지 않는 템플릿이라서.
    const title = (form.action.trim().split(/[.!?\n]/)[0] || form.situation.trim()).slice(0, 40);
    submitPost({ title, courtId, body: form });
    showToast('검수 대기열에 등록되었습니다 · 티켓 +25', 'ok');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 배경 글로우 — 어두운 화면이 밋밋해지지 않게 */}
      <View style={s.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ padding: 16, paddingBottom: 28, gap: 18 }, layout.content]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={{ gap: 10 }}>
            <Text style={[type.h1, { color: colors.text }]}>당신의 사연을{'\n'}법정에 올립니다</Text>
            <Text style={[type.body, { color: colors.textMuted }]}>
              잘 쓴 글보다 솔직한 글이 좋은 판결을 받습니다. 네 칸을 채우면 24시간 공판이 시작됩니다.
            </Text>

            {/* 진행 표시 */}
            <View style={s.progressRow}>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${(doneCount / 4) * 100}%` }]} />
              </View>
              <Text style={[type.tiny, { color: doneCount === 4 ? colors.accent : colors.textFaint }]}>
                {doneCount} / 4
              </Text>
            </View>
          </View>

          {/* 관할 법원 */}
          <View style={{ gap: 9 }}>
            <Text style={[type.label, { color: colors.textFaint }]}>관할 법원</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {COURTS.map((c) => {
                const on = courtId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={c.name}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCourtId(c.id);
                    }}
                    style={({ pressed }) => [
                      s.courtChip,
                      on && { borderColor: c.color, backgroundColor: c.color + '1A' },
                      pressed && press.surface,
                    ]}
                  >
                    <Ionicons name={c.icon} size={13} color={on ? c.color : colors.textFaint} />
                    <Text style={[type.small, { color: on ? c.color : colors.textFaint }]}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4칸 템플릿 */}
          {FIELDS.map((f, i) => {
            const v = form[f.key];
            const len = v.trim().length;
            const isFocus = focused === f.key;
            const done = len >= f.min;
            const short = len > 0 && !done;
            return (
              <View key={f.key} style={{ gap: 8 }}>
                <View style={s.fieldHead}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={[s.stepDot, done && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                      {done ? (
                        <Ionicons name="checkmark" size={11} color={colors.onAccent} />
                      ) : (
                        <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>{i + 1}</Text>
                      )}
                    </View>
                    <Text style={[type.h3, { color: colors.text }]}>{f.label}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${f.label} 예시 보기`}
                    onPress={() => setShowExample(showExample === f.key ? null : f.key)}
                    style={{ paddingVertical: 12, paddingLeft: 14, marginVertical: -12, marginRight: -2 }}
                  >
                    <Text style={[type.tiny, { color: colors.textFaint }]}>
                      {showExample === f.key ? '예시 닫기' : '예시 보기'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[type.small, { color: colors.textMuted, marginLeft: 27 }]}>{f.ask}</Text>

                {showExample === f.key ? (
                  <View style={s.example}>
                    <Ionicons name="bulb" size={13} color={colors.accent} style={{ marginTop: 3 }} />
                    <Text style={[type.small, { color: colors.textMuted, flex: 1, lineHeight: 21 }]}>
                      {f.example}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={[
                    s.paper,
                    isFocus && [s.paperFocus, shadow.focus],
                    short && { borderColor: colors.close + '88' },
                  ]}
                >
                  <View style={[s.rule, isFocus && { backgroundColor: colors.accent }]} />
                  <TextInput
                    value={v}
                    onChangeText={(t) => t.length <= f.max && setForm({ ...form, [f.key]: t })}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused(null)}
                    onContentSizeChange={(e) => {
                      // 측정값을 그대로 높이로 쓴다. 여기에 여백을 더하면
                      // 높이 → 재측정 → 높이 증가가 반복되며 렌더 루프에 빠진다.
                      const h = Math.ceil(e.nativeEvent.contentSize.height);
                      setHeights((prev) =>
                        Math.abs((prev[f.key] ?? 0) - h) > 1 ? { ...prev, [f.key]: h } : prev
                      );
                    }}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textFaint}
                    multiline
                    accessibilityLabel={`${f.label} — ${f.ask}`}
                    style={[
                      type.read,
                      {
                        color: colors.text,
                        flex: 1,
                        minHeight: f.key === 'issue' ? 46 : 96,
                        height: Math.max(f.key === 'issue' ? 46 : 96, heights[f.key] ?? 0),
                        textAlignVertical: 'top',
                        paddingLeft: 14,
                        paddingVertical: 2,
                      },
                      inputReset,
                    ]}
                  />
                </View>

                <View style={s.fieldFoot}>
                  <Text style={[type.tiny, { color: short ? colors.close : colors.textFaint }]}>
                    {short ? `${f.min - len}자 더 쓰면 됩니다` : done ? '충분합니다' : `${f.min}자 이상`}
                  </Text>
                  <Text style={[type.tiny, { color: colors.textFaint }]}>
                    {v.length} / {f.max}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* 실시간 필터 */}
          <View
            style={[
              s.filter,
              flags.length
                ? { borderColor: colors.guilty + '99', backgroundColor: colors.guiltySoft }
                : { borderColor: colors.borderSoft, backgroundColor: colors.surface },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={flags.length ? 'warning' : 'shield-checkmark'}
                size={16}
                color={flags.length ? colors.guilty : colors.innocent}
              />
              <Text style={[type.h3, { color: colors.text, flex: 1 }]}>
                {flags.length ? '지워야 게시할 수 있습니다' : '자동 필터 통과'}
              </Text>
            </View>
            {flags.length ? (
              <View style={{ gap: 7 }}>
                {flags.map((f) => (
                  <View key={f.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Chip label={f.name} color={colors.guilty} bg={colors.guiltySoft} small />
                    <Text style={[type.small, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
                      "{f.sample}"
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[type.small, { color: colors.textFaint }]}>
                실명 · 회사명 · 학교명 · 연락처는 자동으로 걸러집니다. 상대는 "사수 선배", "팀장님"처럼 관계로만 적어주세요.
              </Text>
            )}
          </View>

          {/* 동의 */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agree }}
            onPress={() => {
              Haptics.selectionAsync();
              setAgree(!agree);
            }}
            style={({ pressed }) => [s.agreeRow, pressed && press.surface]}
          >
            <Ionicons
              name={agree ? 'checkbox' : 'square-outline'}
              size={20}
              color={agree ? colors.accent : colors.textFaint}
            />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              본인이 직접 겪은 일이며, 제3자를 특정하지 않았음을 확인합니다
            </Text>
          </Pressable>
        </ScrollView>

        {/* 하단 고정 바 — 스크롤 위치와 무관하게 항상 보인다 */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[layout.content, { gap: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                {totalChars > 0 ? `${totalChars}자 작성 중` : '아직 비어 있습니다'}
              </Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>승인 시 티켓 25장 · 1일 2건</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={submit}
              style={({ pressed }) => [
                s.submit,
                !canSubmit && { opacity: 0.32 },
                pressed && press.cta,
              ]}
            >
              <Ionicons name="paper-plane" size={16} color={colors.onAccent} />
              <Text style={[type.h3, { color: colors.onAccent }]}>
                {flags.length
                  ? '차단 표현을 지워주세요'
                  : !lengthOk
                  ? `${4 - doneCount}칸 더 채워주세요`
                  : !agree
                  ? '확인란에 체크해주세요'
                  : '검수 요청하기'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Confirm
        visible={confirm}
        icon="send"
        title="이 사연을 법정에 올릴까요?"
        message="등록 후에는 수정할 수 없고 삭제만 가능합니다. 운영자 검수까지 최대 12시간이 걸리며, 승인되면 티켓 25장이 지급되고 24시간 공판이 시작됩니다."
        confirmLabel="투고하기"
        onConfirm={reallySubmit}
        onClose={() => setConfirm(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  courtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  fieldHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  example: {
    flexDirection: 'row',
    gap: 9,
    padding: 12,
    marginLeft: 27,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim + '55',
  },
  paper: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  paperFocus: { backgroundColor: colors.paperFocus, borderColor: colors.accentDim },
  rule: { width: 2, borderRadius: 2, backgroundColor: colors.paperLine },
  fieldFoot: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  filter: { gap: 10, padding: 15, borderRadius: radius.lg, borderWidth: 1 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
});
