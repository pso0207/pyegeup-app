#!/usr/bin/env node
/**
 * DESIGN.md ↔ constants/theme.js 동기화 검사.
 *
 * DESIGN.md 같은 파일의 전형적 실패는 "코드를 고치고 문서를 안 고치는 것"이다.
 * 그러면 에이전트가 옛 색으로 UI를 만든다. 이 검사가 그걸 막는다.
 *
 *   node scripts/check-design.mjs
 */
import { readFileSync } from 'node:fs';

const md = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const theme = readFileSync(new URL('../constants/theme.js', import.meta.url), 'utf8');

const fm = md.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
if (!fm) fail('DESIGN.md에 YAML front matter가 없습니다');

const problems = [];
function fail(m) { problems.push(m); }

// ── 1) 규격이 정한 섹션 순서
const ORDER = ['Overview', 'Colors', 'Typography', 'Layout', 'Elevation & Depth', 'Shapes', 'Components', "Do's and Don'ts"];
const heads = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const known = heads.filter((h) => ORDER.includes(h));
const expected = ORDER.filter((h) => known.includes(h));
if (known.join('|') !== expected.join('|')) {
  fail(`섹션 순서가 규격과 다릅니다\n     현재: ${known.join(' → ')}\n     규격: ${expected.join(' → ')}`);
}

// ── 2) 토큰 그룹 파싱
const groups = {};
let cur = null;
for (const line of fm.split('\n')) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  if (!line.startsWith(' ')) { cur = line.split(':')[0].trim(); groups[cur] = groups[cur] || []; }
  else if (cur && /^ {2}[\w-]+:/.test(line)) groups[cur].push(line.trim().split(':')[0]);
}

// ── 3) {group.token} 참조가 실제로 존재하는가
for (const m of fm.matchAll(/\{([a-z]+)\.([\w-]+)\}/g)) {
  if (!groups[m[1]]?.includes(m[2])) fail(`토큰 참조가 깨졌습니다: {${m[1]}.${m[2]}}`);
}

// ── 4) 색이 코드와 같은가
//
// theme.js에는 팔레트가 둘이다: `colors`(종이, 앱 전역)와 `dark`(개표 화면 전용).
// 두 파일을 통째로 정규식으로 훑으면 나중에 선언된 dark가 colors를 덮어써
// "문서가 전부 틀렸다"는 거짓 실패가 난다. 블록을 잘라서 각각 읽는다.
function paletteOf(name) {
  const start = theme.indexOf(`export const ${name} = {`);
  if (start < 0) fail(`theme.js에 ${name} 팔레트가 없습니다`);
  const end = theme.indexOf('\n};', start);
  const block = theme.slice(start, end);
  return Object.fromEntries(
    [...block.matchAll(/^\s*([a-zA-Z]+): '(#[0-9A-Fa-f]{6})',/gm)].map((m) => [m[1], m[2].toLowerCase()])
  );
}
const codeColors = paletteOf('colors');
const darkColors = paletteOf('dark');
const mdColors = Object.fromEntries(
  [...fm.matchAll(/^ {2}([\w-]+): "(#[0-9A-Fa-f]{6})"/gm)].map((m) => [m[1], m[2].toLowerCase()])
);
const ALIAS = {
  canvas: 'bg', 'surface-raised': 'bgElevated', surface: 'surface', 'surface-alt': 'surfaceAlt',
  border: 'border', 'border-soft': 'borderSoft', ink: 'text', 'ink-muted': 'textMuted',
  'ink-subtle': 'textFaint', accent: 'accent', 'accent-dim': 'accentDim', 'on-accent': 'onAccent',
  brand: 'brand', 'brand-fill': 'brandFill', guilty: 'guilty', innocent: 'innocent',
  close: 'close', info: 'info', purple: 'purple', ticket: 'ticket',
  gold: 'gold', silver: 'silver', bronze: 'bronze',
};
for (const [mdKey, codeKey] of Object.entries(ALIAS)) {
  const a = mdColors[mdKey], b = codeColors[codeKey];
  if (a && b && a !== b) fail(`색이 코드와 다릅니다: ${mdKey}=${a} vs theme.${codeKey}=${b}`);
  if (b && !a) fail(`DESIGN.md에 ${mdKey}(theme.${codeKey})이 빠졌습니다`);
}

// ── 5) 글자색·채움색 대비 (WCAG AA 4.5:1)
const lum = (h) => {
  const [r, g, b] = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const cr = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// 라이트에서 가장 까다로운 배경은 canvas가 아니라 surface-alt다 —
// 칩·빈 상태·입력 배경이 이 색이라 여기서 통과하지 않으면 실사용에서 깨진다.
const BACKDROPS = [mdColors.canvas, mdColors.surface, mdColors['surface-alt']].filter(Boolean);
const TEXT_ON_BG = [
  'ink', 'ink-muted', 'ink-subtle', 'guilty', 'innocent', 'close', 'info', 'purple', 'ticket',
  'gold', 'silver', 'bronze',
  'court-love', 'court-work', 'court-family', 'court-friend', 'court-money', 'court-online',
];
for (const k of TEXT_ON_BG) {
  if (!mdColors[k]) continue;
  const worst = Math.min(...BACKDROPS.map((b) => cr(mdColors[k], b)));
  if (worst < 4.5) fail(`대비 미달(글자): ${k} ${worst.toFixed(2)}:1 — 4.5:1 필요`);
}
const FILLS = [['brand-fill', '#ffffff'], ['accent', mdColors['on-accent']], ['innocent', mdColors['on-accent']]];
for (const [fill, fg] of FILLS) {
  if (!mdColors[fill] || !fg) continue;
  const r = cr(mdColors[fill], fg);
  if (r < 4.5) fail(`대비 미달(채움): ${fill} 위 ${fg} = ${r.toFixed(2)}:1 — 4.5:1 필요`);
}

// ── 6) 개표 화면 전용 다크 팔레트도 실제로 쓰이는 화면이다.
//      DESIGN.md에는 적지 않지만(문서는 종이 시스템을 설명한다) 대비는 지켜야 한다.
for (const k of ['text', 'textMuted', 'textFaint', 'guilty', 'innocent', 'close', 'ticket']) {
  const v = darkColors[k];
  if (!v) continue;
  const worst = Math.min(cr(v, darkColors.bg), cr(v, darkColors.surface), cr(v, darkColors.surfaceAlt));
  if (worst < 4.5) fail(`대비 미달(다크 팔레트): ${k} ${worst.toFixed(2)}:1 — 4.5:1 필요`);
}
if (darkColors.brandFill && cr(darkColors.brandFill, '#ffffff') < 4.5) {
  fail(`대비 미달(다크 채움): brandFill 위 흰 글자 ${cr(darkColors.brandFill, '#ffffff').toFixed(2)}:1`);
}

// ── 결과
if (problems.length) {
  console.error('DESIGN.md 검사 실패\n');
  problems.forEach((p) => console.error('  ✗ ' + p));
  process.exit(1);
}
console.log(
  `ok: DESIGN.md — 색 ${groups.colors?.length ?? 0} · 타이포 ${groups.typography?.length ?? 0} · ` +
  `라운드 ${groups.rounded?.length ?? 0} · 간격 ${groups.spacing?.length ?? 0} · 컴포넌트 ${groups.components?.length ?? 0}\n` +
  `    섹션 순서 · 토큰 참조 · 코드 일치 · WCAG AA 대비 전부 통과`
);
