import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useScrollToTop } from 'expo-router';
import { colors, radius, type, layout, inputReset, press } from '../../constants/theme';
import { COURTS } from '../../constants/domain';
import { caseList, archiveSections, cases, extraOpinions, opinions } from '../../data/mock';
import CaseCard, { CaseList } from '../../components/CaseCard';
import OpinionCard from '../../components/OpinionCard';
import { ListSkeleton } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';
import useRefresh from '../../components/useRefresh';
import { SectionTitle, Empty} from '../../components/ui';
import { useApp } from '../../store/useApp';

export default function ArchiveScreen() {
  // 활성 탭을 다시 누르면 맨 위로. iOS·Android 공통 관습인데 빠져 있었다.
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const { refreshing, onRefresh } = useRefresh('판례집을 새로 불러왔습니다');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [courtFilter, setCourtFilter] = useState(null);
  const [section, setSection] = useState('hot');
  const [sort, setSort] = useState('votes');
  const [recent, setRecent] = useState(['축의금', '읽씹', '더치페이']);
  const bookmarks = useApp((st) => st.bookmarks);
  const scrapCount = Object.values(bookmarks).filter(Boolean).length;

  // 검색어를 확정할 때만 최근 목록에 남긴다 (한 글자씩 쌓이면 쓸모가 없다)
  const commitSearch = (text) => {
    const t = text.trim();
    if (t.length < 2) return;
    setRecent((r) => [t, ...r.filter((x) => x !== t)].slice(0, 6));
  };

  const active = archiveSections.find((s) => s.id === section);
  const searching = q.trim().length > 0 || courtFilter;

  const results = caseList
    .filter((c) => {
      const okCourt = !courtFilter || c.courtId === courtFilter;
      const okQ =
        !q.trim() ||
        (c.title + c.issue + c.situation + c.action).includes(q.trim());
      return okCourt && okQ;
    })
    .sort((a, b) =>
      sort === 'votes'
        ? b.voteCount - a.voteCount
        : sort === 'guilty'
        ? b.guiltyRate - a.guiltyRate
        : Math.abs(0.5 - a.guiltyRate) - Math.abs(0.5 - b.guiltyRate)
    );

  const SORTS = [
    { key: 'votes', label: '투표 많은순' },
    { key: 'guilty', label: '유죄율 높은순' },
    { key: 'close', label: '박빙순' },
  ];

  // caseIds가 null인 코너는 로컬 상태에서 목록을 만든다 (스크랩)
  const sectionCases =
    active?.id === 'scrap'
      ? Object.keys(bookmarks).filter((id) => bookmarks[id]).map((id) => cases[id]).filter(Boolean)
      : (active?.caseIds ?? []).map((id) => cases[id]).filter(Boolean);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        { paddingTop: insets.top + 10, paddingBottom: 36, paddingHorizontal: 16, gap: 16 },
        layout.content,
      ]}
      ref={listRef}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <ScreenHeader
        eyebrow="확정 사건 아카이브"
        title="판례집"
        action="스크랩"
        actionLabel="내 스크랩 코너로 이동"
        onAction={() => {
          setQ('');
          setCourtFilter(null);
          setSection('scrap');
        }}
      />

      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={colors.textFaint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="사건 검색 (키워드 · 쟁점 · 사연 본문)"
          placeholderTextColor={colors.textFaint}
          accessibilityLabel="사건 검색"
          returnKeyType="search"
          onSubmitEditing={() => commitSearch(q)}
          style={[type.body, { color: colors.text, flex: 1, paddingVertical: 0 }, inputReset]}
        />
        {q ? (
          <Pressable accessibilityRole="button" accessibilityLabel="검색어 지우기" onPress={() => setQ('')} hitSlop={12}>
            <Ionicons name="close-circle" size={16} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
        <Pressable
          onPress={() => setCourtFilter(null)}
          style={[s.filterChip, !courtFilter && { backgroundColor: colors.accentSoft, borderColor: colors.accentDim }]}
        >
          <Text style={[type.small, { color: !courtFilter ? colors.accent : colors.textFaint }]}>전체</Text>
        </Pressable>
        {COURTS.map((c) => {
          const on = courtFilter === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCourtFilter(on ? null : c.id)}
              style={[s.filterChip, on && { backgroundColor: c.color + '22', borderColor: c.color }]}
            >
              <Text style={[type.small, { color: on ? c.color : colors.textFaint }]}>{c.short}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {searching ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[type.h2, { color: colors.text }]}>검색 결과 {results.length}건</Text>
            {results.length ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`정렬 ${SORTS.find((x) => x.key === sort).label}`}
                onPress={() => setSort((v) => SORTS[(SORTS.findIndex((x) => x.key === v) + 1) % SORTS.length].key)}
                hitSlop={12}
                style={s.sortBtn}
              >
                <Text style={[type.tiny, { color: colors.textMuted }]}>
                  {SORTS.find((x) => x.key === sort).label} ⇅
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View style={{ gap: 10 }}>
            {results.length ? (
              <CaseList>
                {results.map((c) => (
                  <CaseCard key={c.id} item={c} compact onPress={() => router.push(`/case/${c.id}`)} />
                ))}
              </CaseList>
            ) : (
              <Empty
                icon="search"
                text="일치하는 사건이 없습니다"
                sub={`"${q.trim()}"에 해당하는 확정 사건을 찾지 못했습니다. 다른 키워드로 검색하거나 필터를 풀어보세요.`}
                action="필터 초기화"
                onAction={() => {
                  setQ('');
                  setCourtFilter(null);
                }}
              />
            )}
          </View>
        </View>
      ) : (
        <>
          {recent.length ? (
            <View style={{ gap: 8 }}>
              <Text style={[type.label, { color: colors.accentDim }]}>최근 검색어</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
                {recent.map((r) => (
                  <Pressable
                    key={r}
                    accessibilityRole="button"
                    accessibilityLabel={`${r} 검색`}
                    onPress={() => setQ(r)}
                    style={({ pressed }) => [s.recentChip, pressed && press.surface]}
                  >
                    <Text style={[type.tiny, { color: colors.textMuted }]}>{r}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* 코너 선택.
              이전에는 아이콘 + 제목 + 설명이 붙은 2열 카드 격자였다. 격자는 대시보드의
              문법이라 "코너 7개"가 위젯 7개로 읽혔고, 첫 화면의 절반을 먹었다.
              게시판은 상단 말머리 줄에서 코너를 고른다 — 한 줄로 접고, 고른 코너의
              설명만 아래에 한 줄 남긴다. */}
          <View style={{ gap: 10 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 2 }}
            >
              {archiveSections.map((sec) => {
                const on = section === sec.id;
                const n = sec.id === 'scrap' ? scrapCount : null;
                return (
                  <Pressable
                    key={sec.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${sec.title} 코너, ${sec.desc}`}
                    onPress={() => setSection(sec.id)}
                    style={({ pressed }) => [s.cornerTab, on && s.cornerTabOn, pressed && press.control]}
                  >
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={[type.bodyStrong, { color: on ? colors.text : colors.textFaint, fontSize: 14 }]}
                    >
                      {sec.title}
                      {n ? <Text style={{ color: colors.brand }}> {n}</Text> : null}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={s.cornerRule} />
          </View>

          <View>
            <SectionTitle title={active.title} />
            <Text style={[type.small, { color: colors.textFaint, marginTop: -6, marginBottom: 10 }]}>
              {active.desc}
            </Text>
            {refreshing ? (
              <ListSkeleton count={2} />
            ) : (
            <View style={{ gap: 10 }}>
              {sectionCases.length ? (
                <CaseList>
                  {sectionCases.map((c) => (
                    <CaseCard key={c.id} item={c} compact onPress={() => router.push(`/case/${c.id}`)} />
                  ))}
                </CaseList>
              ) : active?.id === 'scrap' ? (
                <Empty
                  icon="bookmark-outline"
                  text="스크랩한 사건이 없습니다"
                  sub="사건 카드 오른쪽 아래의 책갈피를 누르면 여기에 모입니다."
                  action="화제의 재판 보기"
                  onAction={() => setSection('hot')}
                />
              ) : active?.id === 'follow' ? (
                <FollowedOpinions />
              ) : active?.id === 'best' ? (
                <BestOpinions />
              ) : (
                <Empty
                  icon="file-tray-outline"
                  text="아직 이 코너에 사건이 없습니다"
                  sub="확정된 사건이 쌓이면 여기에 모입니다."
                  action="화제의 재판 보기"
                  onAction={() => setSection('hot')}
                />
              )}
            </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

/** 구독한 배심원의 판결문만 모은 코너. 구독이 실제로 무언가를 바꾸게 만든다. */
function FollowedOpinions() {
  const router = useRouter();
  const followed = useApp((st) => st.followed);
  const names = Object.keys(followed).filter((n) => followed[n]);
  const all = [...Object.values(extraOpinions).flat(), ...Object.values(opinions).flat()];
  const list = all.filter((o) => names.includes(o.author)).sort((a, b) => b.likeCount - a.likeCount);

  if (!names.length) {
    return (
      <Empty
        icon="people-outline"
        text="구독한 배심원이 없습니다"
        sub="판결문 작성자를 눌러 프로필에서 구독하면 그 사람의 의견이 여기 모입니다."
        action="랭킹에서 찾아보기"
        onAction={() => router.push('/ranking')}
      />
    );
  }

  if (!list.length) {
    return (
      <Empty
        icon="document-text-outline"
        text={`구독한 ${names.length}명이 아직 판결문을 남기지 않았습니다`}
        sub="새 판결문이 올라오면 이 코너에 먼저 보입니다."
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {list.map((o) => (
        <OpinionCard key={o.id} item={o} canReply={false} />
      ))}
    </View>
  );
}

function BestOpinions() {
  // 역대 최다 추천 판결문 — 사건을 가로질러 상위 추천만 모은다.
  const list = Object.values(extraOpinions)
    .flat()
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 6);

  return (
    <View style={{ gap: 10 }}>
      {list.map((o, i) => (
        <OpinionCard key={o.id} item={o} rank={i + 1} canReply={false} />
      ))}
      <Text style={[type.tiny, { color: colors.textFaint, textAlign: 'center' }]}>
        추천 수는 매일 자정에 집계됩니다
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  // 말머리 탭. 활성 항목만 잉크 밑줄로 표시한다 — 배경 알약을 쓰면
  // 7개가 나란히 있을 때 화면이 알약밭이 된다.
  cornerTab: {
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  cornerTabOn: { borderBottomColor: colors.accent },
  cornerRule: { height: 1, backgroundColor: colors.borderSoft, marginTop: -1 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
  },
});
