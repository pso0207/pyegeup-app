# 03. 사건 조회 API

## 이번 단계의 결과

`GET /api/v1/cases/{id}` 요청이 Controller → Service → Repository를 지나 DTO로 응답됩니다. 전체 예시는 [백엔드 튜토리얼 9장](../BACKEND-TUTORIAL.md#9-첫-api-사건-상세-조회)에 있습니다.

## 요청 흐름

```text
GET /api/v1/cases/1
  → CaseController: 문자열·HTTP 처리
  → CaseService: 사건 조회 유스케이스
  → CaseRepository: DB 조회
  → CaseResponse: 공개할 필드만 JSON으로 변환
```

## 구현 단위

1. 존재하는 사건 조회 성공 테스트를 먼저 작성합니다.
2. 없는 ID가 들어오면 발생할 예외를 정합니다.
3. Repository 조회를 Service에서 호출합니다.
4. Entity를 `CaseResponse`로 변환합니다.
5. Controller에서 경로 변수와 응답을 연결합니다.
6. 없는 사건의 404 응답 테스트를 추가합니다.

## AI에게 요청할 범위

```text
사건 상세 조회 세로 기능 하나를 구현해줘.
Controller, Service, Repository, Response DTO, 404 예외 처리와 테스트만 포함해줘.
각 파일의 책임을 설명하고 Entity를 응답으로 직접 반환하지 마.
완료 후 내가 직접 구현할 작은 TODO 하나를 남겨줘.
```

## 코드 리뷰할 때 추적할 값

종이에 사건 ID `1`을 적고 각 메서드의 매개변수로 어떻게 이동하는지 화살표로 그립니다. 반환될 때는 Entity가 어느 줄에서 DTO로 바뀌는지 표시합니다.

## 리뷰 질문

1. Controller가 Repository를 바로 호출하면 처음에는 편한데 언제 어려워지는가?
2. 읽기 전용 트랜잭션은 어디에 두는가?
3. Entity를 그대로 반환하면 비공개 필드와 연관관계에 어떤 문제가 생기는가?
4. 없는 사건을 `null`이나 빈 JSON 대신 404로 보내는 이유는 무엇인가?
5. 단위 테스트와 통합 테스트 중 각각 무엇을 잡는가?

## 직접 재작성 과제

상세 조회를 참고하되 코드를 복사하지 않고 `GET /api/v1/cases` 목록 조회의 DTO 매핑을 직접 작성합니다. 페이지네이션은 다음 리팩터링에서 추가합니다.

