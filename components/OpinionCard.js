import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, radius, type, inputReset, press } from '../constants/theme';
import { SENTENCES } from '../constants/domain';
import { repliesFor } from '../data/mock';
import { useApp } from '../store/useApp';
import Avatar from './Avatar';
import { Chip } from './ui';
import IconButton from './IconButton';

/**
 * 판결문 한 건. 사건 상세·법원 피드·판례집이 전부 이 컴포넌트를 쓴다.
 * 반박은 1단계까지만 — 스레드가 깊어지면 익명 커뮤니티에서 싸움만 길어진다.
 */
export default function OpinionCard({ item, rank, onMenu, compact, canReply = true }) {
  const router = useRouter();
  const liked = useApp((s) => !!s.likedOpinions[item.id]);
  const toggleLike = useApp((s) => s.toggleLike);
  const likedReplies = useApp((s) => s.likedReplies);
  const toggleReplyLike = useApp((s) => s.toggleReplyLike);
  const myReplies = useApp((s) => s.myReplies[item.id]);
  const following = useApp((s) => !!s.followed[item.author]);
  const addReply = useApp((s) => s.addReply);
  const deleteReply = useApp((s) => s.deleteReply);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  // LayoutAnimation은 New Architecture에서 무효(경고까지 뜬다). 직접 페이드·슬라이드한다.
  const reveal = useRef(new Animated.Value(0)).current;

  const seeded = repliesFor(item.id);
  const replies = [...seeded, ...(myReplies ?? []).map((r) => ({ ...r, mine: true }))];
  const sideColor = item.guilty ? colors.guilty : colors.innocent;

  const like = () => {
    Haptics.selectionAsync();
    toggleLike(item.id);
  };

  const toggleThread = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(reveal, {
      toValue: next ? 1 : 0,
      duration: next ? 220 : 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const send = () => {
    if (draft.trim().length < 2) return;
    addReply(item.id, draft);
    setDraft('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[s.card, rank === 1 && { borderColor: colors.accentDim }]}>
      {/* 유죄/무죄 측 색 띠 — 스크롤 중에도 어느 편인지 즉시 읽힌다 */}
      <View style={[s.side, { backgroundColor: sideColor }]} />

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          {rank != null && rank <= 3 ? (
            <View style={s.rank}>
              <Text style={[type.tiny, { color: colors.accent, fontSize: 10 }]}>{rank}</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${item.author} 프로필 보기`}
            onPress={() => router.push(`/u/${encodeURIComponent(item.author)}`)}
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingVertical: 8, marginVertical: -8 },
              pressed && press.control,
            ]}
          >
            <Avatar name={item.author} size={28} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text numberOfLines={1} style={[type.small, { color: colors.text, flexShrink: 1 }]}>
                  {item.author}
                </Text>
                {item.isTop ? <Ionicons name="ribbon" size={11} color={colors.accent} /> : null}
                {following ? (
                  <View style={s.followTag}>
                    <Text style={[type.tiny, { color: colors.purple, fontSize: 9 }]}>구독</Text>
                  </View>
                ) : null}
              </View>
              {item.at ? (
                <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>{item.at}</Text>
              ) : null}
            </View>
          </Pressable>
          <Chip
            label={item.guilty ? `유죄 ${item.sentence}단계` : '무죄'}
            color={sideColor}
            bg={item.guilty ? colors.guiltySoft : colors.innocentSoft}
            small
          />
        </View>

        <Text style={[type.read, { color: colors.text }]} numberOfLines={compact ? 3 : undefined}>
          {item.body}
        </Text>

        {item.guilty && item.sentence ? (
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            선고 · {SENTENCES[item.sentence - 1]?.name} ({SENTENCES[item.sentence - 1]?.nuance})
          </Text>
        ) : null}

        <View style={s.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={liked ? '추천 취소' : '판결문 추천'}
            accessibilityState={{ selected: liked }}
            onPress={like}
            hitSlop={12}
            style={({ pressed }) => [s.actionBtn, liked && s.actionOn, pressed && press.control]}
          >
            <Ionicons
              name={liked ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={16}
              color={liked ? colors.accent : colors.textFaint}
            />
            <Text style={[type.tiny, { color: liked ? colors.accent : colors.textFaint }]}>
              {(item.likeCount + (liked ? 1 : 0)).toLocaleString()}
            </Text>
          </Pressable>

          {canReply ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`반박 ${replies.length}건 보기`}
              onPress={toggleThread}
              hitSlop={12}
              style={({ pressed }) => [s.actionBtn, open && s.actionOn, pressed && press.control]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={15} color={open ? colors.accent : colors.textFaint} />
              <Text style={[type.tiny, { color: open ? colors.accent : colors.textFaint }]}>
                반박 {replies.length}
              </Text>
            </Pressable>
          ) : null}

          <View style={{ flex: 1 }} />

          {onMenu ? (
            <IconButton
              name="ellipsis-horizontal"
              size={16}
              color={colors.textFaint}
              label="판결문 메뉴"
              onPress={() => onMenu(item)}
              style={{ marginVertical: -12, marginRight: -10 }}
            />
          ) : null}
        </View>

        {open ? (
          <Animated.View
            style={[
              s.thread,
              {
                opacity: reveal,
                transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
              },
            ]}
          >
            {replies.length === 0 ? (
              <Text style={[type.tiny, { color: colors.textFaint }]}>
                아직 반박이 없습니다. 첫 반박을 남겨보세요.
              </Text>
            ) : (
              replies.map((r) => (
                <View key={r.id} style={s.reply}>
                  <Avatar name={r.mine ? '나' : r.author} size={22} me={r.mine} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={[type.tiny, { color: r.mine ? colors.accent : colors.textMuted }]}>
                        {r.mine ? '나' : r.author}
                      </Text>
                      <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>· {r.at}</Text>
                    </View>
                    <Text style={[type.body, { color: colors.textMuted, fontSize: 14, lineHeight: 22 }]}>
                      {r.body}
                    </Text>
                  </View>
                  {r.mine ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="내 반박 삭제"
                      onPress={() => deleteReply(item.id, r.id)}
                      style={s.replyAction}
                    >
                      <Ionicons name="trash-outline" size={13} color={colors.textFaint} />
                    </Pressable>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="반박 추천"
                      onPress={() => toggleReplyLike(r.id)}
                      style={[s.replyAction, { flexDirection: 'row', gap: 3 }]}
                    >
                      <Ionicons
                        name={likedReplies[r.id] ? 'heart' : 'heart-outline'}
                        size={12}
                        color={likedReplies[r.id] ? colors.guilty : colors.textFaint}
                      />
                      <Text style={[type.tiny, { color: colors.textFaint, fontSize: 10 }]}>
                        {(r.likeCount ?? 0) + (likedReplies[r.id] ? 1 : 0)}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}

            <View style={[s.replyInput, focused && { borderColor: colors.accentDim, backgroundColor: colors.paperFocus }]}>
              <TextInput
                value={draft}
                onChangeText={(t) => t.length <= 120 && setDraft(t)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="이 판결문에 반박하기 (120자)"
                placeholderTextColor={colors.textFaint}
                accessibilityLabel="반박 입력"
                style={[type.body, { color: colors.text, flex: 1, fontSize: 14, paddingVertical: 0 }, inputReset]}
                onSubmitEditing={send}
                returnKeyType="send"
              />
              <IconButton
                name="send"
                size={15}
                color={draft.trim().length < 2 ? colors.textFaint : colors.accent}
                label="반박 등록"
                disabled={draft.trim().length < 2}
                onPress={send}
                style={{ marginVertical: -10, marginRight: -10 }}
              />
            </View>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 15,
    paddingLeft: 17,
    overflow: 'hidden',
  },
  side: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  rank: {
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  followTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.purpleSoft,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40, // WCAG 2.5.5 — paddingVertical만으로는 37dp였다
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  actionOn: { borderColor: colors.accentDim, backgroundColor: colors.accentSoft },
  thread: {
    gap: 12,
    marginTop: 2,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  reply: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  // hitSlop은 RN Web에서 적용되지 않는다. 실제 박스를 잡고 음수 마진으로 흡수한다.
  replyAction: {
    minWidth: 40,
    minHeight: 40,
    marginVertical: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
