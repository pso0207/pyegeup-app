# 검증

## 1. 세 플랫폼 번들

```bash
npx expo export --platform ios     --output-dir /tmp/x-ios --clear
npx expo export --platform android --output-dir /tmp/x-and --clear
npx expo export --platform web     --output-dir /tmp/web   --clear
```

## 2. 웹 — 헤드리스 브라우저

```bash
pkill -f http-server                      # ← 반드시 먼저. 아래 지뢰 참고
cd /tmp/web && npx http-server -p 8842 -s -c-1 --proxy "http://localhost:8842?"
```

- `--proxy` 없으면 `/write` 같은 직접 URL이 404입니다 (SPA 폴백용)
- `-c-1` 없으면 `index.html`이 캐시돼 옛 번들을 가리킵니다

그 다음 `browser-automation` 스킬로 라우트를 순회하며 콘솔 에러와 DOM을 확인합니다.

### 지뢰 — 유령 http-server

이전 세션의 `http-server`가 같은 포트를 잡고 **옛 빌드 폴더**를 계속 서빙해서,
새로 만든 라우트가 `Unmatched Route`로 뜨고 수정이 반영 안 된 것처럼 보인 적이 있습니다.
앱 버그가 아니었습니다. 이상하면 먼저 확인하세요:

```bash
curl -s http://localhost:8842/ | grep -o 'entry-[a-z0-9]*\.js'   # 디스크의 index.html과 같은지
```

### 지뢰 — 테스트 셀렉터

`strict mode violation`(스택에 이전 화면이 남아 2개 매칭)이나
`Element is not visible`(스택에 가려진 화면)로 자주 실패합니다.
**앱 버그가 아니라 하네스 문제**이므로 `.first()` / `.last()` / `getByRole`로 좁히거나
`page.evaluate`로 DOM 클릭하세요.

## 3. 네이티브 — Android 에뮬레이터

**웹만으로는 못 잡는 버그가 있습니다.** `LayoutAnimation` 경고가 그 예로,
웹에서는 20개 라우트가 전부 깨끗했는데 에뮬레이터에서만 떴습니다.
UI를 바꿨으면 한 번은 에뮬레이터로 확인하세요.

```bash
export PATH="$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
emulator -list-avds                                    # Pixel_9_API_34 등 3개
emulator -avd Pixel_9_API_34 -no-snapshot-load &
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 3; done

cd ~/Downloads/폐급재판/pyegeup-app
npx expo start --android          # Expo Go가 없으면 자동 설치됩니다
```

이미 `npx expo start`가 웹으로 떠 있다면 새로 띄우지 말고 붙이면 됩니다:

```bash
adb reverse tcp:8081 tcp:8081     # ← 이게 없으면 에뮬레이터가 dev 서버를 못 찾습니다
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

**`force-stop` 직후에 딥링크를 던지면 홈 화면으로 떨어집니다.** 프로세스가 아직 정리되는
중이라 인텐트가 씹힙니다. 런처로 먼저 띄우고 몇 초 뒤에 딥링크를 보내세요:

```bash
adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1
sleep 8
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

떴는지 확인:

```bash
adb shell dumpsys window | grep -m1 mCurrentFocus   # ExperienceActivity면 앱이 떠 있는 것
```

**`CI=1`을 붙이지 마세요.** Metro가 파일 감시를 끄기 때문에("reloads are disabled"),
소스를 고쳐도 에뮬레이터에는 시작 시점의 번들이 계속 나옵니다.
반영이 안 되는 것 같으면 로그에서 `Android Bundled ... (1 module)`인지 확인하세요 —
전체 재번들이면 `(1920 modules)`처럼 나옵니다.

화면 캡처와 조작:

```bash
adb exec-out screencap -p > s.png                     # sdcard 경유보다 간단합니다
adb shell input tap <x> <y>
adb shell input swipe 540 1800 540 700 300           # 위로 스크롤
adb shell am start -a android.intent.action.VIEW \
  -d "exp://127.0.0.1:8081/--/case/c6"               # 특정 화면 바로 열기
adb shell am force-stop host.exp.exponent            # 완전 리로드 (모듈 최상위 코드까지)
```

**iOS 시뮬레이터는 이 맥에서 안 됩니다** (Xcode 미설치). 번들만 확인 가능합니다.

## 4. 디자인 시스템 검사

```bash
npm run check:design
```

`DESIGN.md`(프로젝트 루트)와 `constants/theme.js`가 어긋나지 않는지 봅니다.
**색을 고쳤으면 반드시 돌리세요** — 문서가 옛 색을 들고 있으면 에이전트가 옛 색으로 UI를 만듭니다.

잡아내는 것:
- 규격이 정한 섹션 순서 (Overview → Colors → Typography → Layout → Elevation → Shapes → Components → Do's/Don'ts)
- `{colors.x}` 같은 토큰 참조가 실제로 존재하는지
- 문서의 색과 코드의 색이 같은지
- 글자색 4.5:1, 채움색 위 글자 4.5:1 (WCAG AA)

## 5. 접근성 자동 검사

눈으로는 못 잡습니다. 렌더된 DOM에서 실제로 재세요.

```js
// tap.mjs — 40dp 미만 터치 표적 찾기
// 20개 경로 전부. 화면을 추가하면 여기에도 넣으세요 — 검사에 없는 화면은 안 고쳐집니다.
const ROUTES = ['/','/archive','/court','/ranking','/profile','/case/c1','/case/c6','/write',
                '/notifications','/settings','/tickets','/onboarding','/u/무죄추정','/legal?doc=eula',
                '/blocked','/reports','/court/select','/case/appeal?id=c8','/case/statement?id=c8',
                '/nonexistent-route'];
export default async function run(page) {
  await page.setViewportSize({ width: 420, height: 940 });
  const small = [];
  for (const r of ROUTES) {
    await page.goto('http://localhost:8842' + r, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
    small.push(...await page.evaluate((route) =>
      // `a`를 빼면 안 됩니다. 이전 검사가 role 속성만 봐서 "40dp 미만 0곳"이라고
      // 적어뒀는데, 렌더된 <button>/<a>까지 넣으니 9곳이 새로 나왔습니다.
      [...document.querySelectorAll('[role="button"],[role="tab"],[role="link"],[role="checkbox"],[role="radio"],button,a')]
        .map(e => ({ r: e.getBoundingClientRect(), label: (e.getAttribute('aria-label') || e.innerText || '').trim().slice(0,26) }))
        .filter(b => b.r.width > 0 && b.r.height > 0 && b.r.top < 900)
        .filter(b => b.r.height < 40 || b.r.width < 40)
        .map(b => `${route} ${b.label} ${Math.round(b.r.width)}x${Math.round(b.r.height)}`), r));
  }
  return { under40: small.length, items: [...new Set(small)] };
}
```

**기준: `under40`이 0이어야 합니다.** (마지막 검사 결과 0 — 20개 경로 전부)

### 같이 보는 것 — 중첩 버튼 · 백지

한 번 도는 김에 두 가지를 같이 셉니다. 셋 다 0이어야 합니다.

```js
// 누를 수 있는 것 안에 누를 수 있는 것 → 웹 콘솔 경고 + 스크린리더가 하나로만 읽음
document.querySelectorAll('button button, a a, button a, a button').length   // 0

// 콘솔 에러 없는 백지 (이 앱의 대표 실패 모드 — 6절)
document.body.innerText.length                                              // > 60
```

`page.on('console')`과 `page.on('pageerror')`도 함께 걸어 두세요.
**경고까지 0**이어야 합니다 — 실제로 `<button>` 중첩이 경고로만 떠 있었습니다.

대비는 계산으로 확인합니다 — 기준과 현재 값은 [DESIGN.md](DESIGN.md) 참고.

## 6. 손상된 저장본

**이 앱에서 가장 고약한 실패는 "콘솔 에러 없는 백지"입니다.** 두 번 겪었습니다
(자동 높이 입력 루프 · 저장본 타입 오류). 저장 구조를 건드렸으면 반드시 확인하세요.

```js
// 브라우저 콘솔에서
localStorage.setItem('pyegeup-app-v1', '{"state":{"judged":null},"version":1}');
location.reload();
```

앱이 정상 렌더되면 통과. **백지면 `merge` 검증이 빠진 필드가 있는 것입니다.**
깨진 JSON은 zustand가 잡으니 **타입만 틀린 유효한 JSON**으로 시험해야 합니다.

## 7. 무엇을 확인하나

- 20개 라우트 렌더 + 콘솔 에러 0 + **경고 0** (경고까지 봐야 합니다)
- 판결 플로우: 유죄 → 형량 → 판결문 → 의사봉 → 개표
- 반박 등록 / 구독 → 판례집 코너 반영 / 스크랩 → 코너 반영
- 확인 대화상자 (설정 → 계정 삭제)
- 차단 → 해제 → 새로고침 후에도 유지
- 데일리 회차 롤오버: `localStorage`의 `judgedDay`를 과거로 바꾸고 리로드
- 40dp 미만 표적 0 · `<button>` 중첩 0 · 백지 0 (5절 스크립트)
- **상태바 글자색** — 종이 배경 위에서 어둡게 보이는지. 웹에서는 확인되지 않습니다
- **개표 암전** — 판결을 확정해 개표에 들어갔을 때 화면이 검게 내려앉고,
  확정과 함께 종이로 돌아오는지. 그 구간만 상태바가 `style="light"`로 바뀝니다
