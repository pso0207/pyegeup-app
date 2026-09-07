# 서버 연동 가이드

백엔드는 **아직 없습니다**. 기획서 09가 지정한 스택은 Spring Boot 3 · PostgreSQL · Redis입니다.
목업의 필드명을 기획서 08 데이터 모델과 맞춰뒀으니, 아래 지점만 갈아끼우면 됩니다.

## 교체 지점

| 지금 | 바꿀 것 |
|---|---|
| `data/mock.js` | TanStack Query 훅 |
| `store/useApp.js`의 `submitVerdict` | `POST /cases/{id}/verdicts` |
| `app/case/result.js`의 지수 산식 | 서버 응답값 (현재 클라이언트에서 계산 중) |
| `store/useApp.js`의 `pushNotif` | 소켓 수신부 |
| `app/write/index.js`의 `PATTERNS` 정규식 | 서버 필터와 **동일 규칙 유지** (OTA로 고칠 수 있는 위치라 남겨둠) |

`store/useApp.js`는 그대로 두고 서버 상태만 Query로 옮기는 것을 권합니다 —
티켓·구독·스크랩 같은 로컬 UI 상태는 이미 `persist`로 잘 돌아갑니다.

## 엔드포인트 제안

목업 구조에서 자연스럽게 나오는 형태입니다.

```
GET   /daily                        오늘의 5건 (09:00 회차 기준)
GET   /cases/{id}                   사건 상세
POST  /cases/{id}/verdicts          { guilty, sentence, opinion } → 지수 정산 결과 반환
GET   /cases/{id}/opinions          ?side=guilty|innocent&sort=top|harsh
POST  /cases/{id}/opinions          판결문 등록 (투표 완료자만)
POST  /opinions/{id}/likes          추천 토글
GET   /opinions/{id}/replies        반박 (1단계까지)
POST  /opinions/{id}/replies        반박 등록
POST  /cases/{id}/peek              티켓 3 소모 → 중간 집계
POST  /cases/{id}/appeal            티켓 50 소모
POST  /cases/{id}/statement         최후진술 (확정 후 48h 내 1회)
POST  /cases                        사연 투고 → 검수 대기열

GET   /me                           프로필 · 두 지수 · 티켓 잔액
GET   /me/verdicts                  판결 이력
GET   /me/cases                     내 사건
GET   /users/{nickname}             공개 프로필 (폐급 지수 숫자는 빼고 계급만)
POST  /users/{nickname}/follow      구독 토글
POST  /users/{nickname}/block       차단
POST  /reports                      { targetId, reason, kind }

GET   /courts/standings             주간 대항전
GET   /courts/{id}/feed             법원 전용 사건
PATCH /me/court                     이적 (시즌당 1회)
GET   /leaderboard                  시즌 리더보드
GET   /notifications                알림함
POST  /notifications/read           읽음 처리
```

## 서버가 반드시 지켜야 할 것

1. **판결 전 판결문 비공개** — 투표 안 한 사용자에게 `/opinions`를 내려주지 마세요.
   클라이언트에서 가리는 것만으로는 의미가 없습니다.
2. **폐급 지수 숫자 비공개** — `/users/{nickname}`에 지수 숫자를 담지 마세요. 계급 문자열만.
   본인 조회(`/me`)에서만 숫자를 내려줍니다.
3. **계급은 점수에서 파생** — 계급 문자열을 따로 저장하면 계급표와 어긋납니다.
4. **09:00 회차** — 데일리 배정 기준일은 09:00입니다. 클라이언트의 `courtDay()`와 맞추세요.
5. **오답 감점 없음** — 소수의견을 겁내면 재판이 재미없어집니다. 기획 의도입니다.
6. **20표 미달 무효** — 표가 모자란 사건은 `void`로 두고 지수에 반영하지 않습니다.

## 미구현 (의도적)

백엔드 전체, 어드민 웹, 실제 광고·결제 SDK, 소셜 로그인, 푸시 발송,
이미지 업로드(기획서상 텍스트 전용).
