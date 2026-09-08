# 국민재판소 백엔드 실습 프로젝트

이 문서는 읽기만 하는 강의가 아닙니다. **12번의 실습으로 실제 Spring Boot 서버를 완성하는 작업 지시서**입니다. 사용자는 각 단계에서 한 문장만 보내면 되고, AI가 파일 생성·코드 구현·테스트 실행을 담당합니다. 사용자는 생성된 코드 중 핵심 부분을 읽고 작은 수정을 직접 합니다.

## 우리가 만들 결과

```text
Expo 앱
  └─ HTTP/JSON
      └─ Spring Boot 3.5.16 / Java 21
          └─ JPA + Flyway
              └─ 로컬 MySQL 8.0.46
```

백엔드 프로젝트 위치는 `/Users/parksangwon/Downloads/폐급재판/pyegeup-api`입니다.

| 항목 | 사용할 값 |
|---|---|
| Java | Temurin 21.0.12 LTS |
| Spring Boot | 프로젝트에서 3.5.16 지정 |
| Gradle | 프로젝트 Wrapper 사용 |
| MySQL | `/usr/local/mysql`의 8.0.46 ARM64 |
| 프론트 | `pyegeup-app` Expo 프로젝트 |

## 공통 진행 방식

1. 사용자가 `실습 N 시작해줘`라고 말합니다.
2. AI가 `AGENTS.md`, 이 문서, `PROGRESS.md`를 읽습니다.
3. AI가 해당 단계의 실제 파일과 테스트를 만듭니다.
4. AI가 가능한 명령을 직접 실행해 검증합니다.
5. 비밀번호처럼 사용자만 입력할 수 있는 작업만 사용자에게 넘깁니다.
6. 사용자가 ‘내가 할 실습’을 수행합니다.
7. AI가 코드를 리뷰하고 `REVIEW-LOG.md`와 `PROGRESS.md`를 갱신합니다.

한 실습이 끝나지 않았으면 다음 실습 코드를 미리 만들지 않습니다. 실제 구현의 전체 예시가 필요하면 [백엔드 참고서](../BACKEND-TUTORIAL.md)를 함께 사용합니다.

---

## 실습 0 — Spring Boot 프로젝트 생성

### 완성되는 것

```text
pyegeup-api/
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── gradle/wrapper/
└── src/
```

### AI가 실제로 할 일

- Spring Initializr를 이용해 Java 21, Gradle Groovy, Spring Boot 3.5.16 프로젝트 생성
- 처음에는 Spring Web과 Validation만 포함
- group `com.pyegeup`, package `com.pyegeup.api`, artifact `pyegeup-api`
- `./gradlew test` 실행
- 생성 파일과 버전 위치 설명

AI가 만들 `build.gradle`의 핵심은 다음 모양입니다.

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.5.16'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.pyegeup'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

### 내가 할 실습

`build.gradle`과 `gradle/wrapper/gradle-wrapper.properties`를 열고 Spring Boot, Java, Gradle 버전이 각각 어디에 있는지 찾습니다.

### 완료 조건

```bash
cd /Users/parksangwon/Downloads/폐급재판/pyegeup-api
./gradlew test
```

`BUILD SUCCESSFUL`이 나오고 세 버전을 직접 설명하면 완료입니다.

### 시작 명령

```text
실습 0 시작해줘
```

---

## 실습 1 — Health API와 첫 테스트

### 완성되는 것

```http
GET /api/v1/health
```

```json
{"status":"ok"}
```

### AI가 만들 파일

```text
src/main/java/com/pyegeup/api/common/HealthController.java
src/test/java/com/pyegeup/api/common/HealthControllerTest.java
```

완성될 Controller는 다음 정도로 작습니다.

```java
package com.pyegeup.api.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
```

AI는 테스트를 구현하고 서버를 실행한 뒤 `curl` 응답까지 확인합니다.

### 내가 할 실습

`/health`를 잠시 `/health-check`로 바꿔 기존 테스트가 실패하는지 확인합니다. 테스트도 같은 주소로 바꿔 다시 통과시킨 뒤 최종적으로 `/health`로 되돌립니다.

```bash
./gradlew test
./gradlew bootRun
curl -i http://localhost:8080/api/v1/health
```

### 리뷰할 내용

- `@RestController`가 필요한 이유
- `@GetMapping`이 URL과 메서드를 연결하는 방식
- Java 객체가 JSON으로 바뀌는 지점
- 테스트가 URL 변경을 잡아낸 이유

### 시작 명령

```text
실습 1 시작해줘
```

---

## 실습 2 — 로컬 MySQL 연결

### 완성되는 것

Spring Boot가 현재 Mac에 설치된 MySQL 8.0.46의 `pyegeup` 데이터베이스에 연결됩니다.

### AI가 할 일

- `build.gradle`에 JPA, MySQL Connector/J, Flyway 의존성 추가
- `application.yml` 작성
- 실제 비밀번호가 Git에 들어가지 않도록 환경 변수 사용
- MySQL 실행 상태와 접속 포트 확인

추가할 의존성은 다음과 같습니다. 정확한 하위 버전은 Spring Boot가 관리합니다.

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.flywaydb:flyway-core'
implementation 'org.flywaydb:flyway-mysql'
runtimeOnly 'com.mysql:mysql-connector-j'
```

### 사용자가 한 번만 할 일

root 비밀번호는 AI가 알 수 없으므로 직접 입력합니다.

```bash
/usr/local/mysql/bin/mysql -u root -p
```

MySQL 화면에서 다음 SQL을 실행합니다.

```sql
CREATE DATABASE IF NOT EXISTS pyegeup
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'pyegeup'@'localhost'
  IDENTIFIED BY 'pyegeup-local-password';

GRANT ALL PRIVILEGES ON pyegeup.* TO 'pyegeup'@'localhost';
FLUSH PRIVILEGES;

SELECT VERSION();
SHOW DATABASES LIKE 'pyegeup';
EXIT;
```

서버는 비밀번호를 실행 시점에 받습니다.

```bash
DB_USERNAME=pyegeup DB_PASSWORD='pyegeup-local-password' ./gradlew bootRun
```

### 내가 할 실습

`application.yml`에서 `datasource.url`, `ddl-auto: validate`, `open-in-view: false`, `flyway.enabled`를 찾아 각각 한 문장으로 설명합니다.

### 완료 조건

Spring Boot 로그에 DB 연결 오류가 없고 `/api/v1/health`가 200을 반환해야 합니다.

### 시작 명령

```text
실습 2 시작해줘
```

---

## 실습 3 — Flyway 테이블과 샘플 데이터

### 완성되는 것

```text
courts
users
court_cases
daily_cases
verdicts
flyway_schema_history
```

### AI가 만들 파일

```text
src/main/resources/db/migration/V1__create_core_tables.sql
src/main/resources/db/migration/V2__seed_development_data.sql
```

V1에는 기본키·외래키·유니크 제약·인덱스를 포함하고, V2에는 사용자와 사건 한 건을 넣습니다. 전체 커뮤니티 테이블은 아직 만들지 않습니다.

### 사용자가 확인할 명령

```bash
/usr/local/mysql/bin/mysql -u pyegeup -p pyegeup
```

```sql
SHOW TABLES;
SHOW CREATE TABLE verdicts;
SELECT version, description, success FROM flyway_schema_history;
SELECT public_id, title, status FROM court_cases;
```

### 내가 할 실습

1. `verdicts`의 `UNIQUE(case_id, user_id)`를 찾습니다.
2. 같은 사용자가 같은 사건에 두 번 투표하지 못하는 이유를 설명합니다.
3. 이미 적용된 V1을 수정하지 않고 새 V3를 만들어야 하는 이유를 설명합니다.

### 완료 조건

Flyway 이력 2개가 성공이고 샘플 사건 한 건이 조회되어야 합니다.

### 시작 명령

```text
실습 3 시작해줘
```

---

## 실습 4 — 사건 상세 조회 API

### 완성되는 것

```http
GET /api/v1/cases/10000000-0000-0000-0000-000000000001
```

### AI가 만들 파일

```text
courtcase/CaseStatus.java
courtcase/Difficulty.java
courtcase/CourtCase.java
courtcase/CourtCaseRepository.java
courtcase/CourtCaseService.java
courtcase/CourtCaseController.java
courtcase/dto/CaseResponse.java
```

AI는 Entity → Repository → Service → Controller → DTO 전체를 구현하고 컴파일과 API 호출을 확인합니다. 실제 파일에는 `TODO`나 생략 기호를 넣지 않습니다.

### 내가 할 실습

종이에 아래 흐름을 쓰고 실제 코드에서 각 화살표가 어느 메서드인지 찾습니다.

```text
URL의 UUID
→ Controller 매개변수
→ Service
→ Repository SQL
→ CourtCase Entity
→ CaseResponse
→ JSON
```

그다음 `CaseResponse`에 `authorId`를 추가해 보되, 외부에 공개해도 되는 정보인지 판단하고 원상 복구합니다. DTO가 필요한 이유를 체감하는 연습입니다.

### 확인 명령

```bash
curl -i http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001
```

### 완료 조건

200 응답을 받고 Entity를 직접 반환하지 않는 이유를 설명할 수 있어야 합니다.

### 시작 명령

```text
실습 4 시작해줘
```

---

## 실습 5 — 공통 오류 응답과 조회 테스트

### 완성되는 것

없는 사건은 500이나 빈 응답이 아니라 일정한 404 JSON을 반환합니다.

```json
{
  "code": "CASE_NOT_FOUND",
  "message": "사건을 찾을 수 없습니다.",
  "path": "/api/v1/cases/..."
}
```

### AI가 만들 파일

```text
common/ApiException.java
common/GlobalExceptionHandler.java
courtcase/CourtCaseControllerTest.java
courtcase/CourtCaseServiceTest.java
```

### 내가 할 실습

1. 존재하는 ID 테스트를 실행합니다.
2. 없는 ID 테스트를 실행합니다.
3. UUID 형식이 아닌 `abc`를 보내 상태 코드를 기록합니다.
4. 예외 메시지를 바꿔 테스트가 실패하는지 확인하고 되돌립니다.

```bash
./gradlew test
curl -i http://localhost:8080/api/v1/cases/99999999-9999-9999-9999-999999999999
curl -i http://localhost:8080/api/v1/cases/abc
```

### 완료 조건

정상·없는 데이터·잘못된 URL 형식 세 사례의 차이를 설명할 수 있어야 합니다.

### 시작 명령

```text
실습 5 시작해줘
```

---

## 실습 6 — 판결 저장과 트랜잭션

### 완성되는 것

```http
POST /api/v1/cases/{caseId}/verdicts
```

서버가 다음 규칙을 직접 검사합니다.

- 열린 사건인지
- 유죄는 형량 1~5인지
- 무죄에는 형량이 없는지
- 같은 사용자가 이미 판결했는지
- 티켓이 남아 있는지
- 판결 저장과 티켓 차감이 함께 성공하는지

### AI가 만들 파일

```text
user/User.java
user/UserRepository.java
verdict/Verdict.java
verdict/VerdictRepository.java
verdict/VerdictService.java
verdict/VerdictController.java
verdict/dto/SubmitVerdictRequest.java
verdict/dto/SubmitVerdictResponse.java
verdict/VerdictServiceTest.java
```

인증 전이므로 `X-Debug-User-Id: 1`을 임시로 사용합니다. AI는 운영 전에 제거해야 한다는 테스트와 기록을 남깁니다.

### 내가 실행할 요청

```bash
curl -i -X POST \
  http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001/verdicts \
  -H 'Content-Type: application/json' \
  -H 'X-Debug-User-Id: 1' \
  -d '{"guilty":true,"sentence":3,"opinion":"절차상 잘못이 있다고 생각합니다."}'
```

같은 요청을 한 번 더 보내 `409 Conflict`가 나오는지 확인합니다.

### 내가 할 실습

`@Transactional`이 없다면 판결 저장은 실패했지만 티켓만 줄어드는 상황이 어떻게 생기는지 흐름으로 설명합니다. 실제 DB를 망가뜨릴 필요는 없습니다. 그리고 중복 판결 테스트 하나를 보지 않고 다시 작성합니다.

### 완료 조건

정상 201, 잘못된 형량 400, 중복 409, 티켓 부족 409 테스트가 통과해야 합니다.

### 시작 명령

```text
실습 6 시작해줘
```

---

## 실습 7 — 오늘의 사건 목록

### 완성되는 것

```http
GET /api/v1/daily
```

한국 시간 오전 9시를 하루의 시작으로 계산해 오늘의 사건을 순서대로 반환합니다.

### AI가 만들 파일

```text
daily/CourtDayProvider.java
daily/DailyCaseRepository.java
daily/DailyCaseService.java
daily/DailyCaseController.java
daily/dto/DailyCasesResponse.java
daily/CourtDayProviderTest.java
```

AI는 정확히 08:59:59와 09:00:00의 경계 테스트를 작성하고 사용자의 완료 수와 `hasVoted`를 응답에 포함합니다.

### 내가 할 실습

테스트 날짜를 하루 바꾸고 기대값을 직접 계산합니다. 시스템 기본 시간대를 사용하지 않고 `Asia/Seoul`을 코드에 명시한 이유를 설명합니다.

### 확인 명령

```bash
./gradlew test --tests '*CourtDayProviderTest'
curl -i http://localhost:8080/api/v1/daily
```

### 완료 조건

두 경계 테스트가 통과하고 `/daily`에서 샘플 사건이 반환되어야 합니다.

### 시작 명령

```text
실습 7 시작해줘
```

---

## 실습 8 — 인증과 사용자 식별

### 범위

인증은 선택에 따라 구조가 크게 달라집니다. 처음 30분에 현재 앱에 맞는 방식 하나를 결정하고, 같은 실습의 나머지 시간에는 회원가입과 로그인까지만 구현합니다. 소셜 로그인과 토큰 재발급은 후속 실습으로 나눌 수 있습니다.

기본 학습 경로는 이메일/비밀번호와 짧은 액세스 토큰입니다. 실제 출시에서 카카오·Apple 로그인을 사용할 경우 공급자 토큰 검증 방식으로 교체합니다.

### AI가 실제로 할 일

- 현재 코드에 맞는 인증 선택지와 보안 차이 설명
- 선택 후 필요한 Spring Security 의존성 추가
- 비밀번호 해시와 사용자 테이블 마이그레이션
- 회원가입·로그인 성공 및 실패 테스트
- 비밀키를 코드와 Git에서 분리
- `X-Debug-User-Id`를 제거하고 Security Context에서 사용자 식별

### 내가 할 실습

다른 사용자 ID를 요청 body에 넣어도 그 사용자로 행동할 수 없어야 합니다. 인증 없음 401과 다른 사용자 자원 접근 403 테스트를 실행하고 차이를 설명합니다.

### 완료 조건

- 비밀번호 원문이 DB와 로그에 없음
- 토큰 비밀값이 Git에 없음
- Controller가 사용자 ID를 body나 디버그 헤더에서 받지 않음
- 인증된 사용자 ID가 Security Context에서 옴

### 시작 명령

```text
실습 8 시작해줘. 먼저 인증 방식 결정부터 같이 하자.
```

---

## 실습 9 — Expo 프론트 연결

### 완성되는 것

목업 사건 상세 한 화면이 실제 API 데이터를 사용합니다. 다른 화면은 목업을 유지해 문제 범위를 줄입니다.

### AI가 만들거나 바꿀 파일

```text
pyegeup-app/.env.local
pyegeup-app/lib/api.js
pyegeup-app/app/case/[id].js
```

AI는 프론트 필드와 API 응답 필드를 표로 비교한 뒤 로딩·성공·404·네트워크 오류 상태를 구현합니다. `.env.local`은 Git에 올라가지 않게 하고, 실제 비밀값은 `EXPO_PUBLIC_` 변수에 넣지 않습니다.

환경별 API 주소는 다를 수 있습니다.

| 실행 위치 | 주소 예시 |
|---|---|
| 같은 Mac의 웹 | `http://localhost:8080/api/v1` |
| iOS Simulator | `http://localhost:8080/api/v1` |
| Android Emulator | `http://10.0.2.2:8080/api/v1` |
| 실제 휴대폰 | `http://Mac의-로컬-IP:8080/api/v1` |

### 내가 할 실습

1. 백엔드를 끄고 네트워크 오류 화면을 확인합니다.
2. 없는 사건 ID로 404 화면을 확인합니다.
3. 백엔드를 켜고 정상 화면을 확인합니다.
4. 새로고침 후에도 정상인지 확인합니다.

### 완료 조건

성공·로딩·404·서버 중단 네 상태가 구분되고 기존 목업 화면이 깨지지 않아야 합니다.

### 시작 명령

```text
실습 9 시작해줘
```

---

## 실습 10 — 실제 MySQL 통합 테스트와 리팩터링

### AI가 할 일

- Testcontainers 또는 격리된 테스트 DB 중 현재 환경에 맞는 방식 선택
- Flyway부터 Repository와 Service까지 통합 테스트
- 중복 요청과 롤백 테스트
- 전체 테스트 실행
- 가장 큰 코드 냄새 한 가지만 리팩터링

Testcontainers를 선택하면 테스트가 사용할 MySQL 버전도 명시합니다.

```java
@Container
@ServiceConnection
static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.46");
```

### 내가 할 실습

리팩터링 전 테스트가 무엇을 보장했는지 적고, 리팩터링 후에도 같은 테스트가 통과하는 이유를 설명합니다. 테스트 하나를 삭제하면 어떤 위험이 보이지 않게 되는지도 적습니다.

### 완료 조건

```bash
./gradlew test
./gradlew build
```

두 명령이 성공하고 테스트 DB가 개발 DB 데이터를 변경하지 않아야 합니다.

### 시작 명령

```text
실습 10 시작해줘
```

---

## 실습 11 — 운영 설정과 배포 준비

### AI가 할 일

- 로컬과 운영 환경 설정 분리
- Dockerfile 또는 선택한 배포 환경의 빌드 설정
- CORS, HTTPS, health check 점검
- DB가 외부 인터넷에 노출되지 않는지 점검
- 비밀값과 로그 점검
- 배포·백업·롤백 체크리스트 작성

외부 유료 서비스를 만들거나 결제 가능한 작업은 사용자가 선택한 뒤 진행합니다.

### 내가 할 실습

운영 환경 변수의 이름과 용도만 표로 적습니다. 실제 비밀번호는 적지 않습니다. 장애가 나면 확인할 순서를 다섯 단계로 작성합니다.

### 완료 조건

새 환경에서 JAR이 실행되고 health, 조회, 오류 응답을 확인할 수 있어야 합니다. `X-Debug-User-Id`와 전체 API `permitAll`이 남아 있으면 완료가 아닙니다.

### 시작 명령

```text
실습 11 시작해줘. 먼저 배포 전 점검만 해줘.
```

---

## 시간이 30분밖에 없을 때

새 실습을 시작하지 말고 다음 중 하나를 합니다.

- 마지막 `REVIEW-LOG.md`의 질문 한 개 답하기
- 테스트 하나를 가리고 다시 작성하기
- Controller에서 DB까지 요청 흐름 그리기
- SQL 로그를 보고 어떤 Repository 메서드가 실행했는지 찾기
- AI에게 `현재 코드를 수정하지 말고 20분 리뷰 문제를 내줘`라고 요청하기

프로젝트를 빨리 완성하는 것보다, 완성된 코드에서 문제를 찾아 직접 고칠 수 있는 상태가 목표입니다.
