import { Platform } from 'react-native';

/**
 * 웹에서만 실행되는 포커스 스타일 주입.
 *
 * 왜 필요한가 — 브라우저 기본 포커스 링이 종이 배경(#F4F2EC) 위에서
 * 충분히 또렷하지 않고, 링 색이 유죄 적색·무죄 녹색과 겹치면 의미로 오독된다.
 * 키보드로 앱을 쓰면 지금 어디에 있는지 보여야 한다.
 *
 * `app/+html.js`는 정적 렌더링(web.output: "static")에서만 적용되므로
 * SPA 모드인 지금은 런타임에 넣는다. 네이티브에서는 아무 일도 하지 않는다.
 *
 * color-scheme을 light로 선언해야 브라우저가 스크롤바·기본 폼 컨트롤을
 * 밝은 쪽으로 그린다. dark로 두면 종이 배경에 검은 스크롤바가 붙는다.
 */
const CSS = `
:root { color-scheme: light; }
html, body { background-color: #F4F2EC; }

/* 마우스 클릭에는 링을 그리지 않고 키보드 이동에만 그린다. */
*:focus { outline: none !important; }
*:focus-visible {
  outline: 2px solid #1A4C8F !important;   /* 종이 배경 8.1:1 · 흰 서류 9.1:1 */
  outline-offset: 2px !important;
  border-radius: 4px;
}
`;

export function installWebFocusStyle() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('pyegeup-focus')) return;
  const el = document.createElement('style');
  el.id = 'pyegeup-focus';
  el.textContent = CSS;
  document.head.appendChild(el);
  document.documentElement.lang = 'ko';
}
