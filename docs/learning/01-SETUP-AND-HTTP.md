# 01. 서버 실행과 HTTP 흐름

## 이번 단계의 결과

`GET /api/v1/health`를 호출하면 다음 JSON을 받습니다.

```json
{"status":"ok"}
```

상세 설치와 Gradle 코드는 [전체 튜토리얼 2~3장](../BACKEND-TUTORIAL.md#2-사용할-버전과-도구)을 따릅니다.

## 먼저 알아둘 개념

- JVM은 컴파일된 Java 프로그램을 실행합니다.
- Spring Boot는 웹 서버 설정과 객체 생성을 도와줍니다.
- Controller는 HTTP 요청을 Java 메서드 호출로 바꿉니다.
- JSON은 프론트와 서버가 데이터를 주고받는 표현 형식입니다.
- 포트는 한 컴퓨터에서 프로그램을 구분하는 번호입니다. 기본값은 `8080`입니다.

## 내가 먼저 할 일

- [ ] `java -version` 결과를 기록한다.
- [ ] Spring Initializr에서 생성한 프로젝트를 실행한다.
- [ ] `HealthResponse`가 가져야 할 필드를 직접 적는다.
- [ ] `curl http://localhost:8080/api/v1/health`를 실행한다.

## AI에게 요청할 범위

```text
docs/learning/AI-COLLABORATION.md 규칙을 따라줘.
health API 하나만 구현해줘. Controller와 응답 DTO를 만들고 테스트도 작성해줘.
구현 전에 요청 흐름과 바꿀 파일을 먼저 알려줘.
```

## 리뷰 질문

1. `@RestController`와 `@Controller`의 차이는 무엇인가?
2. URL과 Java 메서드는 어디에서 연결되는가?
3. Java 객체가 JSON으로 바뀌는 시점은 언제인가?
4. 서버가 이미 실행 중일 때 같은 포트를 쓰면 왜 실패하는가?
5. Controller 테스트가 확인하는 것은 무엇인가?

## 직접 재작성 과제

코드를 보지 않고 `GET /api/v1/version`이 `{"version":"0.1.0"}`을 반환하도록 작성합니다. 실제 서비스 기능은 아니므로 연습 후 삭제해도 됩니다.

## 완료 기준

정상 응답, 존재하지 않는 경로의 404, 테스트 결과를 모두 확인하고 Controller의 책임을 한 문장으로 설명할 수 있으면 다음 단계로 갑니다.

