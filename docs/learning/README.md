# 백엔드 학습 코스

이 폴더는 AI가 코드를 대신 끝내는 문서가 아니라, **AI가 작은 초안을 만들고 내가 이해·수정·재작성하는 과정**을 위한 안내서입니다.

긴 코드가 필요할 때는 [전체 백엔드 튜토리얼](../BACKEND-TUTORIAL.md)을 참고하고, 실제 공부는 아래 순서로 진행합니다. 한 회차는 60~90분을 권장합니다.

## 시작하기

1. [00-STUDY-WORKFLOW.md](00-STUDY-WORKFLOW.md) — AI와 공부하는 규칙
2. [01-SETUP-AND-HTTP.md](01-SETUP-AND-HTTP.md) — 서버 실행과 첫 요청
3. [02-MYSQL-AND-JPA.md](02-MYSQL-AND-JPA.md) — DB, 테이블, Entity
4. [03-CASE-READ-API.md](03-CASE-READ-API.md) — 사건 조회 API 한 줄 완성
5. [04-VERDICT-TRANSACTION.md](04-VERDICT-TRANSACTION.md) — 판결 저장과 트랜잭션
6. [05-AUTH-AND-SECURITY.md](05-AUTH-AND-SECURITY.md) — 로그인과 권한
7. [06-TEST-AND-REFACTOR.md](06-TEST-AND-REFACTOR.md) — 테스트와 리팩터링
8. [07-CONNECT-FRONTEND.md](07-CONNECT-FRONTEND.md) — Expo 목업을 실제 API로 교체
9. [08-DEPLOY-AND-OPERATE.md](08-DEPLOY-AND-OPERATE.md) — 환경 분리와 배포 준비

함께 사용할 문서:

- [AI-COLLABORATION.md](AI-COLLABORATION.md): AI에게 복사해서 사용할 요청문
- [REVIEW-CHECKLIST.md](REVIEW-CHECKLIST.md): 코드를 읽을 때 확인할 항목
- [REVIEW-LOG.md](REVIEW-LOG.md): 기능별 학습 기록
- [BACKEND.md](../BACKEND.md): 전체 API 설계
- [DOMAIN.md](../DOMAIN.md): 점수·티켓·마감 규칙

## 권장 진도표

| 주차 | 결과물 | 직접 할 부분 |
|---|---|---|
| 1주 | 서버 실행, health API | Controller를 직접 다시 작성 |
| 2주 | MySQL 연결, 마이그레이션 | SQL을 손으로 읽고 샘플 INSERT 작성 |
| 3주 | 사건 단건·목록 조회 | DTO 매핑 하나 직접 구현 |
| 4주 | 판결 저장 | 중복 판결 테스트 직접 작성 |
| 5주 | 인증과 내 정보 | 권한 실패 테스트 직접 작성 |
| 6주 | 프론트 연결 | 목업 한 기능을 실제 API로 교체 |
| 7주 | 리팩터링 | 중복 제거 전후 테스트 비교 |
| 8주 | 배포 준비 | 환경 변수와 운영 체크리스트 작성 |

학기 중에는 일주일에 3회, 한 번에 60분이면 충분합니다. 밀린 날을 한 번에 몰아서 채우지 말고 다음 기능의 범위를 줄이세요.

## 한 기능의 완료 조건

- [ ] 브라우저나 HTTP 클라이언트에서 정상 응답을 확인했다.
- [ ] 실패하는 입력 한 가지 이상을 확인했다.
- [ ] Controller → Service → Repository 흐름을 말로 설명할 수 있다.
- [ ] 실행된 SQL 또는 저장 결과를 확인했다.
- [ ] 테스트가 무엇을 보장하는지 설명할 수 있다.
- [ ] 코드 일부를 보지 않고 다시 작성해 봤다.
- [ ] `REVIEW-LOG.md`에 배운 점과 모르는 점을 적었다.

체크가 5개 미만이면 다음 기능으로 넘어가지 않습니다. 완벽하게 외울 필요는 없지만, 어디를 찾아봐야 하는지는 알아야 합니다.

## 첫날 바로 사용할 요청

새 대화에서 아래 문장을 그대로 보내면 됩니다.

```text
AGENTS.md와 docs/learning/README.md를 읽어줘.
오늘은 01-SETUP-AND-HTTP만 진행할 거야.
먼저 내 개발 환경을 읽기 전용으로 확인하고, 한 번에 한 단계씩 안내해줘.
health API는 내가 먼저 시도할 수 있게 뼈대와 테스트 조건만 알려줘.
내가 20분 이상 막히거나 '구현해줘'라고 하면 그때 구현해줘.
마지막에 REVIEW-LOG.md도 함께 작성해줘.
```
