# 02. MySQL과 JPA

## 이번 단계의 결과

현재 Mac의 MySQL 8.0.46에 `pyegeup` DB를 만들고, Flyway가 테이블을 생성하며 Spring Boot가 데이터를 한 건 읽습니다. 실제 작업은 [실습 프로젝트 2~4](PRACTICE-PROJECT.md#실습-2--로컬-mysql-연결)를 따라갑니다. Docker 방식은 [전체 튜토리얼 4장](../BACKEND-TUTORIAL.md#4-mysql을-docker로-실행하기)의 대안입니다.

## 핵심 개념 지도

```text
Flyway SQL → 테이블 구조의 변경 이력
Entity      → 테이블 한 행을 Java 객체로 표현
Repository  → Entity를 저장하고 조회
JPA         → 객체 작업을 SQL로 변환
MySQL       → 실제 데이터를 보존
```

## 공부 순서

1. 시스템 설정의 MySQL 인스턴스가 활성 상태인지 확인합니다.
2. `/usr/local/mysql/bin/mysql -u root -p`로 접속합니다.
3. `pyegeup` DB와 로컬 개발 사용자를 만듭니다.
4. Flyway V1 SQL을 한 줄씩 읽습니다.
5. 테이블을 직접 조회해 컬럼과 인덱스를 확인합니다.
6. Entity의 필드와 DB 컬럼을 표로 대응시킵니다.
7. Repository 테스트에서 저장 후 다시 조회합니다.

## 반드시 이해할 것

- `nullable = false`와 Java의 null 검사는 서로 다른 층입니다.
- 기본키는 한 행을 식별하고, 외래키는 행 사이 관계를 지킵니다.
- 인덱스는 조회를 빠르게 하지만 저장 비용과 공간을 사용합니다.
- `ddl-auto=create`는 학습 데이터도 지울 수 있으므로 Flyway와 함께 사용하지 않습니다.
- Entity는 DB 모델이므로 외부 API 모양과 분리합니다.

## AI에게 요청할 범위

```text
사건 테이블과 CaseEntity, CaseRepository까지만 구현해줘.
Flyway SQL과 Entity 필드가 어떻게 대응되는지 표로 설명해줘.
Repository 저장/조회 테스트를 작성하고 실제 실행 결과를 알려줘.
Controller는 아직 만들지 마.
```

## 리뷰 질문

1. Flyway 파일을 이미 실행한 뒤 내용을 고치면 왜 위험한가?
2. `GenerationType.IDENTITY`는 언제 ID를 알 수 있는가?
3. Entity에 setter를 전부 열어두면 어떤 문제가 생기는가?
4. 사건 목록에 어떤 인덱스가 필요하고 왜 필요한가?
5. Repository 테스트를 H2가 아니라 MySQL로 할 이유는 무엇인가?

## 직접 재작성 과제

사건 상태를 문자열 세 개로 흩어 쓰지 말고 `CaseStatus` enum으로 만듭니다. DB에 어떤 값으로 저장되는지 테스트합니다.
