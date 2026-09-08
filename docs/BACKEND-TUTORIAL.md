# 국민재판소 백엔드 입문 튜토리얼

> Java 21 + Spring Boot 3.5 + MySQL 8.4로, 현재 Expo 프론트엔드에 실제 API를 붙이는 순서입니다.

처음 공부한다면 이 긴 문서를 처음부터 복사하지 말고 [회차별 학습 코스](learning/README.md)부터 시작하세요. 이 문서는 구현 중 설정이나 전체 예시를 찾아보는 참고서로 사용합니다.

이 문서는 백엔드를 처음 만드는 사람도 위에서 아래로 그대로 따라갈 수 있도록 작성했습니다.
한 번에 모든 기능을 만들지 않고, **서버 실행 → DB 연결 → 사건 조회 → 판결 저장 → 프론트 연결 → 인증·배포** 순서로 진행합니다.

작성·검증 기준일은 **2026-09-07**입니다. Spring Initializr에 더 새로운 버전이 보이더라도 이 문서는 안정적인 Spring Boot 3.5 계열을 기준으로 합니다.

---

## 0. 완성하면 무엇이 생기나

완성 후 구조는 다음과 같습니다.

```text
브라우저 / Expo 앱
        │ HTTPS + JSON
        ▼
Spring Boot API 서버
        │ JPA / SQL
        ▼
MySQL 8.4
```

최소 목표는 아래 네 가지입니다.

- `GET /api/v1/health`로 서버 상태 확인
- `GET /api/v1/daily`로 오늘의 사건 5건 조회
- `GET /api/v1/cases/{id}`로 사건 상세 조회
- `POST /api/v1/cases/{id}/verdicts`로 판결 저장

처음에는 로컬 개발용 사용자 ID를 사용하고, 기능이 정상 작동한 뒤 인증을 붙입니다. 인증부터 시작하면 DB 문제와 인증 문제를 동시에 디버깅하게 되어 초보자에게 어렵습니다.

---

## 1. 이 프로젝트에서 지켜야 하는 핵심 규칙

코드를 쓰기 전에 이 규칙을 기억하세요. UI에서만 숨기면 보안 규칙이 아닙니다. 서버가 직접 검사해야 합니다.

1. 판결하지 않은 사용자는 다른 사람의 판결문을 볼 수 없습니다.
2. 다른 사용자의 폐급 지수 숫자는 공개하지 않고 계급만 공개합니다.
3. 계급은 저장하지 않고 점수에서 계산합니다.
4. 하루 기준은 자정이 아니라 **한국 시간 오전 9시**입니다.
5. 오답은 점수를 깎지 않지만 연속 적중 콤보는 끊깁니다.
6. 마감 시 20표 미만이면 사건은 `VOID`가 되고 점수를 정산하지 않습니다.
7. 티켓 차감, 판결 저장, 점수 정산은 반드시 서버 트랜잭션 안에서 처리합니다.
8. 유죄율과 평균 형량은 클라이언트가 보내는 값을 믿지 않고 서버가 판결 데이터로 계산합니다.

전체 기획 수치는 [DOMAIN.md](DOMAIN.md), API 목록은 [BACKEND.md](BACKEND.md)를 함께 보세요.

---

## 2. 사용할 버전과 도구

이 튜토리얼의 권장 조합입니다.

| 항목 | 선택 | 이유 |
|---|---|---|
| Java | 21 LTS | 오래 지원되고 Spring Boot 3.5와 잘 맞음 |
| Spring Boot | 3.5.x | 안정적인 3.x 계열, 기존 프로젝트 문서와 일치 |
| 빌드 | Gradle Groovy | Wrapper로 팀원이 같은 버전을 사용 가능 |
| DB | MySQL 8.4 LTS | 장기 지원 계열 |
| DB 실행 | Docker Compose | 설치 상태 차이를 줄이고 초기화가 쉬움 |
| ORM | Spring Data JPA | 반복 SQL과 매핑 코드 감소 |
| 스키마 변경 | Flyway | DB 변경 이력을 코드로 관리 |
| 테스트 | JUnit 5 + Testcontainers | 실제 MySQL과 같은 환경으로 통합 테스트 |

Spring Boot 3.5는 Java 17 이상을 요구하므로 Java 21을 사용하면 됩니다. MySQL 문자열은 `utf8` 별칭 대신 `utf8mb4`를 사용합니다.

### 2-1. 설치 여부 확인

터미널에서 아래 명령을 한 줄씩 실행합니다.

```bash
java -version
docker --version
docker compose version
git --version
```

예상 결과:

```text
openjdk version "21..."
Docker version ...
Docker Compose version ...
git version ...
```

`java -version`이 17 미만이면 Java 21을 설치하세요. macOS에서 Homebrew를 사용한다면 다음과 같습니다.

```bash
brew install --cask temurin@21
```

설치 후에도 이전 Java가 나오면 터미널을 완전히 닫았다가 다시 열고 확인합니다.

Docker는 Docker Desktop을 설치한 뒤 앱을 한 번 실행해야 `docker compose`가 동작합니다.

---

## 3. 백엔드 프로젝트 만들기

### 3-1. Spring Initializr 설정

[start.spring.io](https://start.spring.io/)를 열고 다음과 같이 선택합니다.

| 항목 | 값 |
|---|---|
| Project | Gradle - Groovy |
| Language | Java |
| Spring Boot | 최신 `3.5.x` 안정 버전 |
| Group | `com.pyegeup` |
| Artifact | `pyegeup-api` |
| Name | `pyegeup-api` |
| Package name | `com.pyegeup.api` |
| Packaging | Jar |
| Java | 21 |

Dependencies에서 다음을 추가합니다.

- Spring Web
- Spring Data JPA
- MySQL Driver
- Validation
- Flyway Migration
- Spring Security
- Spring Boot Actuator
- Docker Compose Support

처음에는 Lombok을 넣지 않습니다. 자동 생성되는 코드를 줄여주지만, 초반에는 생성자와 getter가 어디서 오는지 직접 보는 편이 이해하기 쉽습니다.

`GENERATE`를 눌러 받은 압축 파일을 현재 프론트와 나란히 둡니다.

```text
폐급재판/
├── pyegeup-app/       # 현재 Expo 프론트
└── pyegeup-api/       # 새 Spring Boot 서버
```

### 3-2. 프로젝트를 열고 첫 실행

```bash
cd ~/Downloads/폐급재판/pyegeup-api
./gradlew bootRun
```

아직 MySQL 설정이 없으므로 DB 연결 오류가 날 수 있습니다. 이 단계의 목적은 Gradle이 실행되는지 확인하는 것입니다.

`Permission denied`가 나오면 한 번만 실행합니다.

```bash
chmod +x gradlew
```

### 3-3. `build.gradle` 확인

`build.gradle`의 핵심 부분이 아래와 비슷한지 확인하세요. Initializr가 생성한 더 최신 패치 버전은 그대로 써도 됩니다.

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

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'

    implementation 'org.flywaydb:flyway-core'
    implementation 'org.flywaydb:flyway-mysql'
    runtimeOnly 'com.mysql:mysql-connector-j'

    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    developmentOnly 'org.springframework.boot:spring-boot-docker-compose'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.boot:spring-boot-testcontainers'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:mysql'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

의존성을 바꾼 뒤에는 다음 명령으로 정상 다운로드되는지 봅니다.

```bash
./gradlew dependencies
```

---

## 4. MySQL을 Docker로 실행하기

백엔드 루트의 `compose.yaml`을 다음처럼 만듭니다.

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: pyegeup-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: pyegeup
      MYSQL_USER: pyegeup
      MYSQL_PASSWORD: pyegeup-local-password
      MYSQL_ROOT_PASSWORD: root-local-password
      TZ: Asia/Seoul
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_0900_ai_ci
    ports:
      - "3306:3306"
    volumes:
      - pyegeup_mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot-local-password"]
      interval: 5s
      timeout: 3s
      retries: 20

volumes:
  pyegeup_mysql_data:
```

위 비밀번호는 **내 컴퓨터 개발용 예시**입니다. 운영 서버에서는 절대 그대로 쓰지 않습니다.

### 4-1. 실행과 확인

```bash
docker compose up -d
docker compose ps
docker compose logs -f mysql
```

로그에 `ready for connections`가 보이면 `Ctrl+C`로 로그 보기만 종료합니다. DB 컨테이너는 계속 실행 중입니다.

MySQL에 직접 들어가 확인합니다.

```bash
docker compose exec mysql mysql -upyegeup -ppyegeup-local-password pyegeup
```

MySQL 프롬프트에서:

```sql
SELECT VERSION();
SELECT DATABASE();
SHOW VARIABLES LIKE 'character_set_server';
EXIT;
```

### 4-2. 자주 쓰는 Docker 명령

```bash
# DB 중지. 데이터는 남아 있음
docker compose stop

# 다시 시작
docker compose start

# 컨테이너 제거. 데이터 볼륨은 남아 있음
docker compose down

# 개발 DB 데이터까지 완전히 초기화
docker compose down -v
```

마지막 명령은 로컬 DB 데이터를 모두 지웁니다. Flyway를 처음부터 다시 실행하고 싶을 때만 사용하세요.

---

## 5. Spring Boot와 MySQL 연결하기

`src/main/resources/application.yml`을 만듭니다.

```yaml
spring:
  application:
    name: pyegeup-api

  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:pyegeup}?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&rewriteBatchedStatements=true
    username: ${DB_USERNAME:pyegeup}
    password: ${DB_PASSWORD:pyegeup-local-password}

  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
        format_sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration

  jackson:
    default-property-inclusion: non_null

server:
  port: ${SERVER_PORT:8080}
  forward-headers-strategy: framework
  shutdown: graceful

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: never

app:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:8081,http://localhost:19006,http://localhost:3000,https://pso0207.github.io}
```

중요한 설정:

- `ddl-auto: validate`: JPA가 테이블을 몰래 수정하지 않고 코드와 DB가 맞는지만 검사합니다.
- `open-in-view: false`: Controller에서 지연 로딩이 우연히 발생하지 않게 합니다.
- `time_zone: UTC`: DB에는 절대 시각을 UTC로 저장합니다.
- `Flyway`: `V1__...sql`, `V2__...sql` 순서로 스키마를 변경합니다.
- `CORS_ALLOWED_ORIGINS`: 로컬 Expo 웹과 배포된 GitHub Pages의 요청만 허용합니다.

운영 환경에서는 기본값에 기대지 말고 DB 설정을 환경 변수로 넘깁니다.

```bash
export DB_HOST=your-db-host
export DB_PORT=3306
export DB_NAME=pyegeup
export DB_USERNAME=pyegeup_app
export DB_PASSWORD='아주-긴-운영용-비밀번호'
```

`.env`, `application-local.yml`, 인증서, 운영 비밀번호는 Git에 올리지 않습니다. `.gitignore`에 다음을 추가하세요.

```gitignore
.env
.env.*
!.env.example
src/main/resources/application-local.yml
*.pem
*.key
```

---

## 6. DB 테이블 만들기: Flyway V1

다음 폴더를 만듭니다.

```text
src/main/resources/db/migration/
```

그 안에 `V1__create_core_tables.sql`을 만듭니다. 파일 이름의 `V1__`에는 밑줄이 두 개입니다.

```sql
CREATE TABLE courts (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(30) NOT NULL UNIQUE,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id           CHAR(36) NOT NULL UNIQUE,
    nickname            VARCHAR(24) NOT NULL UNIQUE,
    court_id            VARCHAR(20) NULL,
    juror_score         INT NOT NULL DEFAULT 0,
    guilt_index         DECIMAL(5,2) NULL,
    guilt_case_count    INT NOT NULL DEFAULT 0,
    ticket_balance      INT NOT NULL DEFAULT 10,
    correct_streak      INT NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_users_court FOREIGN KEY (court_id) REFERENCES courts(id),
    CONSTRAINT chk_users_ticket CHECK (ticket_balance >= 0),
    CONSTRAINT chk_users_guilt CHECK (guilt_index IS NULL OR (guilt_index >= 0 AND guilt_index <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE court_cases (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id           CHAR(36) NOT NULL UNIQUE,
    case_no             VARCHAR(30) NOT NULL UNIQUE,
    court_id            VARCHAR(20) NOT NULL,
    author_id           BIGINT NOT NULL,
    title               VARCHAR(80) NOT NULL,
    situation           TEXT NOT NULL,
    action_text         TEXT NOT NULL,
    reaction            TEXT NOT NULL,
    issue_text          VARCHAR(200) NOT NULL,
    difficulty          VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'REVIEW',
    opens_at            DATETIME(6) NULL,
    closes_at           DATETIME(6) NULL,
    finalized_at        DATETIME(6) NULL,
    vote_count          INT NOT NULL DEFAULT 0,
    guilty_rate         DECIMAL(5,4) NULL,
    average_sentence    DECIMAL(3,2) NULL,
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_cases_court FOREIGN KEY (court_id) REFERENCES courts(id),
    CONSTRAINT fk_cases_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT chk_cases_vote_count CHECK (vote_count >= 0),
    CONSTRAINT chk_cases_guilty_rate CHECK (guilty_rate IS NULL OR (guilty_rate >= 0 AND guilty_rate <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_cases_status_closes ON court_cases(status, closes_at);
CREATE INDEX idx_cases_court_created ON court_cases(court_id, created_at DESC);

CREATE TABLE daily_cases (
    court_day       DATE NOT NULL,
    slot_no         TINYINT NOT NULL,
    case_id         BIGINT NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (court_day, slot_no),
    CONSTRAINT uq_daily_case UNIQUE (court_day, case_id),
    CONSTRAINT fk_daily_case FOREIGN KEY (case_id) REFERENCES court_cases(id),
    CONSTRAINT chk_daily_slot CHECK (slot_no BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE verdicts (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_id             BIGINT NOT NULL,
    user_id             BIGINT NOT NULL,
    guilty              BOOLEAN NOT NULL,
    sentence_level      TINYINT NULL,
    submitted_at        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    was_correct         BOOLEAN NULL,
    points_awarded      INT NULL,
    settled_at          DATETIME(6) NULL,
    CONSTRAINT uq_verdict_case_user UNIQUE (case_id, user_id),
    CONSTRAINT fk_verdict_case FOREIGN KEY (case_id) REFERENCES court_cases(id),
    CONSTRAINT fk_verdict_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_verdict_sentence CHECK (
        (guilty = FALSE AND sentence_level IS NULL)
        OR (guilty = TRUE AND sentence_level BETWEEN 1 AND 5)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_verdict_case_guilty ON verdicts(case_id, guilty);
CREATE INDEX idx_verdict_user_date ON verdicts(user_id, submitted_at DESC);

CREATE TABLE opinions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id       CHAR(36) NOT NULL UNIQUE,
    case_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    guilty_side     BOOLEAN NOT NULL,
    sentence_level  TINYINT NULL,
    body            VARCHAR(1000) NOT NULL,
    like_count      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_opinion_case_user UNIQUE (case_id, user_id),
    CONSTRAINT fk_opinion_case FOREIGN KEY (case_id) REFERENCES court_cases(id),
    CONSTRAINT fk_opinion_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_opinion_like CHECK (like_count >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_opinion_case_side_likes ON opinions(case_id, guilty_side, like_count DESC);

CREATE TABLE opinion_likes (
    opinion_id      BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (opinion_id, user_id),
    CONSTRAINT fk_like_opinion FOREIGN KEY (opinion_id) REFERENCES opinions(id),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE replies (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id       CHAR(36) NOT NULL UNIQUE,
    opinion_id      BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    body            VARCHAR(500) NOT NULL,
    like_count      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_reply_opinion FOREIGN KEY (opinion_id) REFERENCES opinions(id),
    CONSTRAINT fk_reply_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ticket_ledger (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    amount          INT NOT NULL,
    reason          VARCHAR(40) NOT NULL,
    reference_type  VARCHAR(30) NULL,
    reference_id    VARCHAR(40) NULL,
    balance_after   INT NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_ticket_balance_after CHECK (balance_after >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_ticket_user_date ON ticket_ledger(user_id, created_at DESC);

CREATE TABLE notifications (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    kind            VARCHAR(30) NOT NULL,
    title           VARCHAR(100) NOT NULL,
    body            VARCHAR(300) NOT NULL,
    href            VARCHAR(200) NULL,
    read_at         DATETIME(6) NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_notification_user_date ON notifications(user_id, created_at DESC);
```

### 왜 `cases`가 아니라 `court_cases`인가

`case`는 Java의 예약어이고, DB 제품에 따라 SQL 문맥에서도 혼동을 일으킬 수 있습니다. Java 패키지도 `case` 대신 `courtcase`를 사용합니다.

### 왜 ID가 두 개인가

- `id BIGINT`: DB 내부 조인과 인덱스에 효율적입니다.
- `public_id UUID`: API에 노출합니다. 사용자가 순차 ID로 전체 데이터를 추측하기 어렵습니다.

외래키는 내부 `BIGINT`를 사용하고, API 응답과 URL에는 `public_id`만 사용합니다.

### 왜 판결에 UNIQUE 제약이 필요한가

`UNIQUE(case_id, user_id)`가 있으면 같은 사용자가 버튼을 빠르게 두 번 눌러도 DB가 두 번째 판결을 거부합니다. 프론트에서 버튼을 잠그는 것만으로는 중복 요청을 완전히 막을 수 없습니다.

---

## 7. 초기 데이터 넣기: Flyway V2

`src/main/resources/db/migration/V2__seed_development_data.sql`:

```sql
INSERT INTO courts (id, name) VALUES
    ('love', '연애지법'),
    ('work', '직장지법'),
    ('family', '가족지법'),
    ('friend', '우정지법'),
    ('money', '금전지법'),
    ('online', '온라인지법');

INSERT INTO users (
    id, public_id, nickname, court_id, juror_score,
    guilt_index, guilt_case_count, ticket_balance
) VALUES (
    1, '00000000-0000-0000-0000-000000000001',
    '익명의피고인_4821', 'love', 3240, 78.00, 7, 46
);

INSERT INTO court_cases (
    id, public_id, case_no, court_id, author_id, title,
    situation, action_text, reaction, issue_text, difficulty,
    status, opens_at, closes_at
) VALUES (
    1,
    '10000000-0000-0000-0000-000000000001',
    '2026고합1174',
    'work',
    1,
    '팀 회식 중간에 말없이 집에 갔습니다',
    '지난주 금요일 밤 10시, 팀 회식 2차 노래방에서 있었던 일입니다.',
    '팀장님이 화장실 간 사이 아무에게도 말하지 않고 먼저 나왔습니다.',
    '다음 날 팀 분위기가 서늘했고 사수에게 연락이 왔습니다.',
    '말없이 회식 자리를 이탈한 것이 유죄인가요?',
    'EASY',
    'OPEN',
    UTC_TIMESTAMP(6),
    DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 24 HOUR)
);

INSERT INTO daily_cases (court_day, slot_no, case_id)
VALUES (DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 9 HOUR)), 1, 1);
```

개발 중에는 사건을 1건만 넣고 API를 먼저 완성하세요. 정상 조회된 뒤 5건으로 늘리는 편이 오류를 찾기 쉽습니다.

이제 서버를 실행합니다.

```bash
./gradlew bootRun
```

성공 로그의 핵심은 다음입니다.

```text
Successfully applied ... migrations
Started PyegeupApiApplication
```

DB에서 테이블을 확인합니다.

```bash
docker compose exec mysql mysql -upyegeup -ppyegeup-local-password pyegeup -e "SHOW TABLES;"
```

`flyway_schema_history`도 보여야 정상입니다.

> 이미 적용된 `V1` 파일은 수정하지 마세요. 변경이 필요하면 `V3__add_something.sql`처럼 새 마이그레이션을 만듭니다. 팀원이나 운영 DB에는 이미 V1이 적용되어 있을 수 있기 때문입니다.

---

## 8. 패키지 구조 만들기

처음부터 모든 도메인을 만들 필요는 없습니다. 먼저 사건 조회와 판결 저장만 만듭니다.

```text
src/main/java/com/pyegeup/api/
├── PyegeupApiApplication.java
├── common/
│   ├── ApiException.java
│   ├── GlobalExceptionHandler.java
│   └── config/
│       └── SecurityConfig.java
├── courtcase/
│   ├── CourtCase.java
│   ├── CourtCaseController.java
│   ├── CourtCaseRepository.java
│   ├── CourtCaseService.java
│   └── dto/
│       └── CaseResponse.java
├── verdict/
│   ├── Verdict.java
│   ├── VerdictController.java
│   ├── VerdictRepository.java
│   ├── VerdictService.java
│   └── dto/
│       ├── SubmitVerdictRequest.java
│       └── SubmitVerdictResponse.java
└── user/
    ├── User.java
    └── UserRepository.java
```

도메인별로 Controller, Service, Repository를 가까이 두는 구조입니다. 파일 수가 늘어도 사건 코드는 `courtcase` 안에서 찾을 수 있습니다.

역할은 다음과 같습니다.

- Controller: HTTP 요청을 받고 응답 형식을 정함
- Service: 티켓 차감, 중복 판결 검사 같은 업무 규칙을 실행
- Repository: DB를 조회하고 저장
- Entity: DB 테이블과 연결되는 객체
- DTO: API가 받거나 내보내는 JSON 모양

Entity를 API 응답으로 직접 반환하지 마세요. DB 구조 변경이 API에 새고, 지연 로딩과 개인정보 노출 문제가 생길 수 있습니다.

---

## 9. 첫 API: 사건 상세 조회

### 9-1. 사건 상태 enum

`courtcase/CaseStatus.java`:

```java
package com.pyegeup.api.courtcase;

public enum CaseStatus {
    REVIEW,
    OPEN,
    COUNTING,
    CLOSED,
    STATEMENT,
    APPEAL,
    VOID
}
```

`courtcase/Difficulty.java`:

```java
package com.pyegeup.api.courtcase;

public enum Difficulty {
    EASY,
    NORMAL,
    CLOSE,
    TWIST
}
```

### 9-2. Entity

`courtcase/CourtCase.java`:

```java
package com.pyegeup.api.courtcase;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "court_cases")
public class CourtCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private String publicId;

    @Column(name = "case_no", nullable = false, unique = true)
    private String caseNo;

    @Column(name = "court_id", nullable = false)
    private String courtId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String situation;

    @Column(name = "action_text", nullable = false, columnDefinition = "TEXT")
    private String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reaction;

    @Column(name = "issue_text", nullable = false)
    private String issue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    @Column(name = "opens_at")
    private Instant opensAt;

    @Column(name = "closes_at")
    private Instant closesAt;

    @Column(name = "vote_count", nullable = false)
    private int voteCount;

    @Column(name = "guilty_rate", precision = 5, scale = 4)
    private BigDecimal guiltyRate;

    @Column(name = "average_sentence", precision = 3, scale = 2)
    private BigDecimal averageSentence;

    @Version
    private long version;

    protected CourtCase() {}

    public Long getId() { return id; }
    public String getPublicId() { return publicId; }
    public String getCaseNo() { return caseNo; }
    public String getCourtId() { return courtId; }
    public Long getAuthorId() { return authorId; }
    public String getTitle() { return title; }
    public String getSituation() { return situation; }
    public String getAction() { return action; }
    public String getReaction() { return reaction; }
    public String getIssue() { return issue; }
    public Difficulty getDifficulty() { return difficulty; }
    public CaseStatus getStatus() { return status; }
    public Instant getOpensAt() { return opensAt; }
    public Instant getClosesAt() { return closesAt; }
    public int getVoteCount() { return voteCount; }
    public BigDecimal getGuiltyRate() { return guiltyRate; }
    public BigDecimal getAverageSentence() { return averageSentence; }

    public void increaseVoteCount() {
        this.voteCount += 1;
    }
}
```

UUID 문자열은 초보 단계에서 MySQL의 `CHAR(36)`과 정확히 맞도록 Java `String`으로 매핑합니다. Controller의 `UUID` 타입이 URL 형식을 먼저 검증하고, 조회할 때 `toString()`으로 바꿉니다.

### 9-3. Repository

`courtcase/CourtCaseRepository.java`:

```java
package com.pyegeup.api.courtcase;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CourtCaseRepository extends JpaRepository<CourtCase, Long> {
    Optional<CourtCase> findByPublicId(String publicId);
}
```

### 9-4. 응답 DTO

`courtcase/dto/CaseResponse.java`:

```java
package com.pyegeup.api.courtcase.dto;

import com.pyegeup.api.courtcase.CourtCase;
import java.math.BigDecimal;
import java.time.Instant;

public record CaseResponse(
    String id,
    String caseNo,
    String courtId,
    String title,
    String situation,
    String action,
    String reaction,
    String issue,
    String difficulty,
    String status,
    int voteCount,
    BigDecimal guiltyRate,
    BigDecimal avgSentence,
    Instant closesAt
) {
    public static CaseResponse from(CourtCase value, boolean canSeeResult) {
        return new CaseResponse(
            value.getPublicId(),
            value.getCaseNo(),
            value.getCourtId(),
            value.getTitle(),
            value.getSituation(),
            value.getAction(),
            value.getReaction(),
            value.getIssue(),
            value.getDifficulty().name().toLowerCase(),
            value.getStatus().name().toLowerCase(),
            value.getVoteCount(),
            canSeeResult ? value.getGuiltyRate() : null,
            canSeeResult ? value.getAverageSentence() : null,
            value.getClosesAt()
        );
    }
}
```

여기서 중요한 점은 `canSeeResult`가 거짓이면 중간 유죄율과 평균 형량을 `null`로 내린다는 것입니다. 실제 구현에서는 “내가 판결했거나 티켓으로 조기 열람했는지”를 서버가 검사합니다.

### 9-5. Service와 Controller

`courtcase/CourtCaseService.java`:

```java
package com.pyegeup.api.courtcase;

import com.pyegeup.api.common.ApiException;
import com.pyegeup.api.courtcase.dto.CaseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CourtCaseService {
    private final CourtCaseRepository caseRepository;

    public CourtCaseService(CourtCaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    public CaseResponse getCase(UUID publicId) {
        CourtCase value = caseRepository.findByPublicId(publicId.toString())
            .orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "CASE_NOT_FOUND", "사건을 찾을 수 없습니다."
            ));

        // 첫 단계에서는 결과를 숨긴다. 인증을 붙인 뒤 판결 여부를 조회한다.
        return CaseResponse.from(value, false);
    }
}
```

`courtcase/CourtCaseController.java`:

```java
package com.pyegeup.api.courtcase;

import com.pyegeup.api.courtcase.dto.CaseResponse;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases")
public class CourtCaseController {
    private final CourtCaseService caseService;

    public CourtCaseController(CourtCaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping("/{caseId}")
    public CaseResponse getCase(@PathVariable UUID caseId) {
        return caseService.getCase(caseId);
    }
}
```

---

## 10. 오류 응답을 한 모양으로 만들기

`common/ApiException.java`:

```java
package com.pyegeup.api.common;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
}
```

`common/GlobalExceptionHandler.java`:

```java
package com.pyegeup.api.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(
        ApiException error,
        HttpServletRequest request
    ) {
        return ResponseEntity.status(error.getStatus()).body(body(
            error.getCode(), error.getMessage(), request.getRequestURI()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
        MethodArgumentNotValidException error,
        HttpServletRequest request
    ) {
        String message = error.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(field -> field.getField() + ": " + field.getDefaultMessage())
            .orElse("입력값을 확인해 주세요.");

        return ResponseEntity.badRequest().body(body(
            "INVALID_INPUT", message, request.getRequestURI()
        ));
    }

    private Map<String, Object> body(String code, String message, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("code", code);
        body.put("message", message);
        body.put("path", path);
        return body;
    }
}
```

오류 JSON은 다음처럼 일정해집니다.

```json
{
  "timestamp": "2026-09-07T08:00:00Z",
  "code": "CASE_NOT_FOUND",
  "message": "사건을 찾을 수 없습니다.",
  "path": "/api/v1/cases/00000000-0000-0000-0000-000000000000"
}
```

프론트는 HTTP 상태와 `code`로 분기하고, 사용자에게는 `message`를 보여줄 수 있습니다.

---

## 11. 개발 단계의 Security와 CORS

Spring Security 의존성을 넣으면 기본적으로 모든 API가 잠깁니다. 첫 기능을 확인하는 동안만 전체 API를 열고, 허용할 웹 주소를 명시합니다.

`common/config/SecurityConfig.java`:

```java
package com.pyegeup.api.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/api/v1/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/cases/**", "/api/v1/daily").permitAll()
                // 학습 단계 임시 설정. 운영 전 authenticated()로 교체할 것.
                .requestMatchers("/api/v1/**").permitAll()
                .anyRequest().denyAll())
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
        @Value("${app.cors.allowed-origins}") String allowedOrigins
    ) {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .toList();

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Debug-User-Id"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

`allowedOrigins("*")`는 쓰지 않는 편이 좋습니다. 특히 쿠키 인증에서 `allowCredentials(true)`와 전체 origin 허용을 섞으면 보안 문제가 되고 브라우저도 제한합니다.

### 상태 확인 API

`common/HealthController.java`:

```java
package com.pyegeup.api.common;

import org.springframework.web.bind.annotation.*;
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

실행하고 확인합니다.

```bash
./gradlew bootRun
```

새 터미널에서:

```bash
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8080/api/v1/health
curl -i http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001
```

세 요청이 모두 `HTTP/1.1 200`이면 서버, DB, Flyway, JPA, Controller가 연결된 것입니다.

---

## 12. 판결 저장 API 만들기

이 기능은 다음을 한 트랜잭션으로 처리해야 합니다.

1. 사건이 `OPEN`인지 확인
2. 마감 시간이 지나지 않았는지 확인
3. 같은 사용자의 기존 판결이 없는지 확인
4. 유죄면 형량 1~5, 무죄면 형량 없음인지 확인
5. 사용자 티켓 1장 차감
6. 판결 저장
7. 사건 투표 수 증가
8. 티켓 장부 저장

중간에 하나라도 실패하면 전부 취소되어야 합니다.

### 12-1. 요청과 응답 DTO

`verdict/dto/SubmitVerdictRequest.java`:

```java
package com.pyegeup.api.verdict.dto;

import jakarta.validation.constraints.*;

public record SubmitVerdictRequest(
    @NotNull Boolean guilty,
    @Min(1) @Max(5) Integer sentence,
    @Size(max = 1000) String opinion
) {}
```

`verdict/dto/SubmitVerdictResponse.java`:

```java
package com.pyegeup.api.verdict.dto;

import java.time.Instant;

public record SubmitVerdictResponse(
    String caseId,
    boolean guilty,
    Integer sentence,
    int ticketBalance,
    String status,
    Instant submittedAt
) {}
```

판결 직후에는 `correct`와 `points`를 반환하지 않습니다. 사건이 마감되기 전에는 다수 의견이 정해지지 않았기 때문입니다.

### 12-2. User Entity와 잠금 Repository

`user/User.java`의 핵심 부분:

```java
package com.pyegeup.api.user;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_balance", nullable = false)
    private int ticketBalance;

    @Version
    private long version;

    protected User() {}

    public Long getId() { return id; }
    public int getTicketBalance() { return ticketBalance; }

    public void spendTickets(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        if (ticketBalance < amount) throw new IllegalStateException("not enough tickets");
        ticketBalance -= amount;
    }
}
```

실제 Entity에는 `users` 테이블의 `nullable = false` 필드를 모두 매핑하거나, 쓰지 않는 필드도 적절히 매핑해야 합니다. 위 코드는 핵심만 보여준 예시입니다.

`user/UserRepository.java`:

```java
package com.pyegeup.api.user;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);
}
```

동시에 두 요청이 티켓을 차감할 때 잔액이 음수가 되지 않도록 사용자 행을 쓰기 잠금합니다.

### 12-3. Verdict Entity와 Repository

`verdict/Verdict.java`:

```java
package com.pyegeup.api.verdict;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "verdicts",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_verdict_case_user",
        columnNames = {"case_id", "user_id"}
    )
)
public class Verdict {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private boolean guilty;

    @Column(name = "sentence_level")
    private Integer sentenceLevel;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    protected Verdict() {}

    public Verdict(Long caseId, Long userId, boolean guilty, Integer sentenceLevel) {
        this.caseId = caseId;
        this.userId = userId;
        this.guilty = guilty;
        this.sentenceLevel = sentenceLevel;
        this.submittedAt = Instant.now();
    }

    public Instant getSubmittedAt() { return submittedAt; }
}
```

`verdict/VerdictRepository.java`:

```java
package com.pyegeup.api.verdict;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerdictRepository extends JpaRepository<Verdict, Long> {
    boolean existsByCaseIdAndUserId(Long caseId, Long userId);
}
```

### 12-4. Service

`verdict/VerdictService.java`:

```java
package com.pyegeup.api.verdict;

import com.pyegeup.api.common.ApiException;
import com.pyegeup.api.courtcase.*;
import com.pyegeup.api.user.*;
import com.pyegeup.api.verdict.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service
public class VerdictService {
    private final CourtCaseRepository caseRepository;
    private final VerdictRepository verdictRepository;
    private final UserRepository userRepository;

    public VerdictService(
        CourtCaseRepository caseRepository,
        VerdictRepository verdictRepository,
        UserRepository userRepository
    ) {
        this.caseRepository = caseRepository;
        this.verdictRepository = verdictRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SubmitVerdictResponse submit(
        UUID casePublicId,
        Long userId,
        SubmitVerdictRequest request
    ) {
        CourtCase courtCase = caseRepository.findByPublicId(casePublicId.toString())
            .orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "CASE_NOT_FOUND", "사건을 찾을 수 없습니다."
            ));

        if (courtCase.getStatus() != CaseStatus.OPEN
            || courtCase.getClosesAt() == null
            || !courtCase.getClosesAt().isAfter(Instant.now())) {
            throw new ApiException(
                HttpStatus.CONFLICT, "CASE_CLOSED", "이미 마감된 사건입니다."
            );
        }

        validateSentence(request);

        if (verdictRepository.existsByCaseIdAndUserId(courtCase.getId(), userId)) {
            throw new ApiException(
                HttpStatus.CONFLICT, "VERDICT_ALREADY_EXISTS", "이미 판결한 사건입니다."
            );
        }

        User user = userRepository.findByIdForUpdate(userId)
            .orElseThrow(() -> new ApiException(
                HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "사용자를 확인할 수 없습니다."
            ));

        if (user.getTicketBalance() < 1) {
            throw new ApiException(
                HttpStatus.CONFLICT, "NOT_ENOUGH_TICKETS", "티켓이 부족합니다."
            );
        }

        user.spendTickets(1);

        Verdict verdict = verdictRepository.save(new Verdict(
            courtCase.getId(), userId, request.guilty(), request.sentence()
        ));

        courtCase.increaseVoteCount();

        // 다음 단계에서 opinion 저장과 ticket_ledger 저장을 같은 트랜잭션에 추가합니다.
        return new SubmitVerdictResponse(
            courtCase.getPublicId(),
            request.guilty(),
            request.sentence(),
            user.getTicketBalance(),
            "accepted",
            verdict.getSubmittedAt()
        );
    }

    private void validateSentence(SubmitVerdictRequest request) {
        if (request.guilty() && request.sentence() == null) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST, "SENTENCE_REQUIRED", "유죄 판결에는 형량이 필요합니다."
            );
        }
        if (!request.guilty() && request.sentence() != null) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST, "SENTENCE_NOT_ALLOWED", "무죄 판결에는 형량을 보낼 수 없습니다."
            );
        }
    }
}
```

`Boolean guilty`는 요청 DTO에서 `@NotNull`이므로 Service에서는 자동 unboxing해도 됩니다. 이 검증을 빼면 `null`에서 예외가 날 수 있습니다.

### 12-5. 개발용 Controller

`verdict/VerdictController.java`:

```java
package com.pyegeup.api.verdict;

import com.pyegeup.api.verdict.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases/{caseId}/verdicts")
public class VerdictController {
    private final VerdictService verdictService;

    public VerdictController(VerdictService verdictService) {
        this.verdictService = verdictService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubmitVerdictResponse submit(
        @PathVariable UUID caseId,
        @RequestHeader(name = "X-Debug-User-Id", defaultValue = "1") Long userId,
        @Valid @RequestBody SubmitVerdictRequest request
    ) {
        return verdictService.submit(caseId, userId, request);
    }
}
```

`X-Debug-User-Id`는 로컬 개발 전용입니다. 운영 배포 전 반드시 제거하고 인증 토큰에서 사용자 ID를 가져와야 합니다. 사용자가 보낸 ID를 운영 서버가 그대로 믿으면 다른 사람으로 행동할 수 있습니다.

### 12-6. curl로 판결 테스트

```bash
curl -i -X POST \
  http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001/verdicts \
  -H 'Content-Type: application/json' \
  -H 'X-Debug-User-Id: 1' \
  -d '{"guilty":true,"sentence":3,"opinion":"말없이 나간 절차는 잘못이라고 봅니다."}'
```

예상 응답:

```json
{
  "caseId": "10000000-0000-0000-0000-000000000001",
  "guilty": true,
  "sentence": 3,
  "ticketBalance": 45,
  "status": "accepted",
  "submittedAt": "2026-09-07T08:30:00Z"
}
```

같은 명령을 다시 실행하면 `409 Conflict`와 `VERDICT_ALREADY_EXISTS`가 나와야 합니다.

DB도 확인합니다.

```bash
docker compose exec mysql mysql -upyegeup -ppyegeup-local-password pyegeup \
  -e "SELECT case_id,user_id,guilty,sentence_level FROM verdicts; SELECT id,ticket_balance FROM users;"
```

---

## 13. 오늘의 사건 5건 조회

한국 시간 오전 9시 이전이면 전날을 회차 날짜로 사용합니다.

```java
package com.pyegeup.api.daily;

import org.springframework.stereotype.Component;
import java.time.*;

@Component
public class CourtDayProvider {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final LocalTime RESET_TIME = LocalTime.of(9, 0);

    public LocalDate currentCourtDay(Instant now) {
        ZonedDateTime seoulNow = now.atZone(SEOUL);
        LocalDate date = seoulNow.toLocalDate();
        return seoulNow.toLocalTime().isBefore(RESET_TIME)
            ? date.minusDays(1)
            : date;
    }
}
```

반드시 경계값을 테스트하세요.

```java
package com.pyegeup.api.daily;

import org.junit.jupiter.api.Test;
import java.time.*;
import static org.assertj.core.api.Assertions.assertThat;

class CourtDayProviderTest {
    private final CourtDayProvider provider = new CourtDayProvider();

    @Test
    void eightFiftyNineBelongsToPreviousDay() {
        Instant now = ZonedDateTime.of(
            2026, 9, 7, 8, 59, 59, 0, ZoneId.of("Asia/Seoul")
        ).toInstant();

        assertThat(provider.currentCourtDay(now))
            .isEqualTo(LocalDate.of(2026, 9, 6));
    }

    @Test
    void nineOClockStartsNewDay() {
        Instant now = ZonedDateTime.of(
            2026, 9, 7, 9, 0, 0, 0, ZoneId.of("Asia/Seoul")
        ).toInstant();

        assertThat(provider.currentCourtDay(now))
            .isEqualTo(LocalDate.of(2026, 9, 7));
    }
}
```

`daily_cases`와 `court_cases`를 조인하는 Repository 메서드를 만들고 `slot_no` 순서로 반환하세요.

API 응답 예시는 다음처럼 권장합니다.

```json
{
  "courtDay": "2026-09-07",
  "resetsAt": "2026-09-08T00:00:00Z",
  "completedCount": 1,
  "totalCount": 5,
  "cases": [
    {
      "id": "10000000-0000-0000-0000-000000000001",
      "caseNo": "2026고합1174",
      "courtId": "work",
      "title": "팀 회식 중간에 말없이 집에 갔습니다",
      "difficulty": "easy",
      "status": "open",
      "voteCount": 1,
      "closesAt": "2026-09-08T08:00:00Z",
      "hasVoted": true
    }
  ]
}
```

`closesInMin`처럼 계속 변하는 숫자를 DB에 저장하지 마세요. `closesAt`만 저장하고, 서버 또는 프론트에서 현재 시각과의 차이를 계산합니다.

---

## 14. 판결문 조회 권한

`GET /api/v1/cases/{caseId}/opinions`에서는 목록을 조회하기 전에 다음 조건을 검사합니다.

```java
boolean hasVoted = verdictRepository.existsByCaseIdAndUserId(caseId, userId);
boolean isClosed = courtCase.getStatus() == CaseStatus.CLOSED;

if (!hasVoted && !isClosed) {
    throw new ApiException(
        HttpStatus.FORBIDDEN,
        "VERDICT_REQUIRED",
        "판결을 마친 뒤 다른 판결문을 볼 수 있습니다."
    );
}
```

서비스 정책이 “마감 후에는 누구나 열람”이 아니라 “판결한 사람만 항상 열람”이라면 `isClosed` 조건도 빼세요. 중요한 것은 이 결정을 Controller UI가 아니라 서버 한 곳에서 강제하는 것입니다.

목록 정렬 쿼리 예시:

```text
GET /api/v1/cases/{caseId}/opinions?side=guilty&sort=top&page=0&size=20
```

- `side`: `guilty` 또는 `innocent`
- `sort=top`: 추천 많은 순
- `sort=recent`: 최신 순
- `size`: 최대 50으로 제한
- 삭제·차단된 사용자의 글은 서버에서 제외

페이지 응답에는 `items`, `page`, `size`, `hasNext`를 넣습니다. 전체 건수 계산이 비싸질 때를 대비해 모바일 피드는 `totalPages`보다 `hasNext`가 단순합니다.

---

## 15. 사건 마감과 점수 정산

사건 마감은 앱이 열려 있을 때만 실행하면 안 됩니다. 서버 스케줄러 또는 작업 큐가 처리해야 합니다.

메인 클래스에 스케줄링을 켭니다.

```java
@SpringBootApplication
@EnableScheduling
public class PyegeupApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(PyegeupApiApplication.class, args);
    }
}
```

1분마다 마감 대상을 찾는 예시:

```java
@Scheduled(cron = "0 * * * * *", zone = "UTC")
public void finalizeDueCases() {
    finalizationService.finalizeDueCases(Instant.now());
}
```

정산 순서:

1. `status = OPEN AND closes_at <= now` 사건을 작은 묶음으로 조회
2. 사건 행을 `PESSIMISTIC_WRITE`로 잠금
3. 이미 상태가 바뀌었으면 건너뜀
4. 판결 수를 다시 `COUNT(*)`하여 신뢰할 수 있는 집계 생성
5. 20표 미만이면 `VOID`
6. 20표 이상이면 유죄율과 유죄표의 평균 형량 계산
7. 사건을 `CLOSED`, `finalized_at = now`로 변경
8. 각 판결의 적중·점수 계산
9. 사용자 점수, 콤보, 티켓 보상 업데이트
10. 알림 생성

정산은 **멱등성**이 있어야 합니다. 같은 사건을 두 번 실행해도 점수를 두 번 주면 안 됩니다. 최소한 아래 조건을 함께 사용하세요.

- 사건 상태가 `OPEN`일 때만 `CLOSED`로 전환
- `verdicts.settled_at IS NULL`인 판결만 정산
- 점수 장부에 `UNIQUE(reason, reference_id, user_id)` 같은 중복 방지 키 추가

유죄 여부는 `guilty_rate >= 0.5`처럼 경계 규칙을 명시해야 합니다. 정확히 50%일 때 무효인지 유죄인지 기획 결정을 받고 테스트로 고정하세요.

---

## 16. 동시성에서 꼭 막아야 할 문제

모바일 네트워크는 응답이 늦으면 같은 요청을 재전송할 수 있습니다.

### 중복 판결

- Service에서 `exists` 검사
- DB에서 `UNIQUE(case_id, user_id)` 보장
- `DataIntegrityViolationException`도 잡아 `409 VERDICT_ALREADY_EXISTS`로 변환

Service 검사만으로는 두 요청이 거의 동시에 들어왔을 때 둘 다 “없음”을 볼 수 있으므로 DB 제약이 최종 방어선입니다.

### 티켓 이중 차감

- 사용자 행을 `PESSIMISTIC_WRITE`로 조회
- 잔액 확인과 차감을 같은 `@Transactional` 메서드에서 처리
- `ticket_ledger`에도 사용 기록 저장

### 추천 수 어긋남

`opinion_likes`에 복합 PK를 두고, 좋아요 삽입 성공 후에만 `like_count + 1`을 합니다. 취소는 삭제 성공 후 `like_count - 1`을 합니다. 또는 매번 `COUNT(*)`하여 정합성을 복구하는 관리 작업을 둡니다.

### 요청 재시도

결제, 광고 보상, 티켓 지급에는 `Idempotency-Key` 헤더를 받는 방식을 권장합니다.

```text
Idempotency-Key: 76fdfd5a-32fb-4cd5-9ef4-c266f86bd650
```

서버는 사용자와 키 조합을 저장하고 같은 키가 다시 오면 기존 응답을 반환합니다.

---

## 17. 인증 붙이기

조회·판결 저장이 정상 작동한 다음 인증을 붙입니다.

### 권장 흐름

1. 앱이 카카오·애플 같은 로그인 공급자에서 로그인
2. 프론트가 공급자 토큰을 백엔드에 전달
3. 백엔드가 공급자 서버에서 토큰을 검증
4. 백엔드가 자체 access token과 refresh token 발급
5. 프론트는 `Authorization: Bearer <token>`으로 API 호출
6. Spring Security가 토큰을 검증하고 `Authentication`에 사용자 ID를 넣음

초보 단계에서는 소셜 로그인을 바로 만들기보다, 검증된 OIDC 공급자를 사용하고 Spring Security Resource Server로 JWT를 검증하는 방법이 안전합니다.

필요 의존성:

```groovy
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
```

외부 인증 서버가 `issuer-uri`를 제공한다면:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER_URI}
```

Security 설정을 다음 방향으로 바꿉니다.

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/actuator/health", "/api/v1/health").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/v1/cases/**").permitAll()
    .requestMatchers("/api/v1/**").authenticated()
    .anyRequest().denyAll())
.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}))
```

그리고 `X-Debug-User-Id`를 없애고 토큰의 `sub` 또는 자체 claim에서 사용자 ID를 가져옵니다.

토큰 저장 주의사항:

- 웹: 가능하면 짧은 access token + `HttpOnly`, `Secure`, `SameSite` refresh cookie
- Expo 네이티브: refresh token은 SecureStore 사용
- AsyncStorage와 localStorage에 장기 refresh token을 평문 저장하지 않기
- access token은 짧게, refresh token은 회전시키고 서버에서 폐기 가능하게 만들기

직접 비밀번호 로그인을 만든다면 비밀번호 원문은 절대 저장하지 않고 `PasswordEncoder`로 해시합니다.

---

## 18. Expo 프론트 연결하기

현재 프론트는 `data/mock.js`와 `store/useApp.js`가 서버 역할을 대신합니다. 모든 코드를 한 번에 바꾸지 말고 조회부터 순서대로 교체하세요.

### 18-1. API 주소 설정

프론트 루트 `pyegeup-app/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

환경별 주소:

| 실행 위치 | API 주소 예시 |
|---|---|
| 같은 Mac의 웹 브라우저 | `http://localhost:8080/api/v1` |
| iOS Simulator | `http://localhost:8080/api/v1` |
| Android Emulator | `http://10.0.2.2:8080/api/v1` |
| 실제 휴대폰 | `http://맥의-같은-Wi-Fi-IP:8080/api/v1` |
| 배포 웹 | `https://api.example.com/api/v1` |

실제 휴대폰에서는 `localhost`가 휴대폰 자신을 뜻합니다. Mac의 IP는 `ipconfig getifaddr en0`으로 확인할 수 있습니다. Mac과 휴대폰이 같은 Wi-Fi에 있어야 하며 방화벽이 8080 포트를 막지 않아야 합니다.

`.env.local`을 바꾼 뒤 Expo 개발 서버를 다시 시작하세요.

### 18-2. 공통 fetch 함수

`lib/api.js`:

```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function api(path, options = {}) {
  if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL이 설정되지 않았습니다.');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Debug-User-Id': '1', // 로컬 개발용. 인증 후 제거
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(body?.message || `요청 실패 (${response.status})`);
    error.code = body?.code;
    error.status = response.status;
    throw error;
  }

  return body;
}

export function getCase(caseId) {
  return api(`/cases/${caseId}`);
}

export function submitVerdict(caseId, verdict) {
  return api(`/cases/${caseId}/verdicts`, {
    method: 'POST',
    body: JSON.stringify(verdict),
  });
}
```

### 18-3. 교체 순서

1. 사건 상세 한 화면만 `getCase()`로 교체
2. 로딩, 빈 화면, 서버 오류 UI 확인
3. 오늘의 사건 목록을 `/daily`로 교체
4. `store/useApp.js`의 `submitVerdict`를 API mutation으로 교체
5. 판결문, 프로필, 랭킹 순으로 교체
6. 서버 데이터는 TanStack Query, 순수 UI 상태는 Zustand에 남김

서버 데이터와 로컬 UI 데이터를 구분하세요.

| 서버가 원본 | Zustand에 남겨도 됨 |
|---|---|
| 사건, 판결, 판결문, 티켓 잔액 | 현재 열려 있는 모달 |
| 프로필 점수, 알림, 랭킹 | 토스트 |
| 차단, 신고, 구독, 스크랩 | 판결 입력 중 임시 단계 |

티켓 잔액을 API 응답으로 받은 뒤 Zustand 값도 갱신할 수 있지만, 장기적으로는 `/me` 응답이 단일 원본이 되게 하세요.

### 18-4. CORS 오류 구분법

브라우저 콘솔에 `blocked by CORS policy`가 보이면:

1. 백엔드 `CORS_ALLOWED_ORIGINS`에 현재 웹 origin이 정확히 있는지 확인
2. `https://pso0207.github.io`처럼 origin만 넣고 `/pyegeup-app` 경로는 넣지 않음
3. `http`와 `https`, 포트 번호가 일치하는지 확인
4. 서버를 재시작했는지 확인
5. `OPTIONS` 요청이 Security에서 막히지 않는지 확인

React Native 네이티브 요청에는 브라우저 CORS 제한이 없지만 Expo 웹에는 있습니다.

---

## 19. 테스트하기

### 19-1. 빠른 테스트

```bash
./gradlew test
./gradlew bootRun
curl http://localhost:8080/actuator/health
```

### 19-2. 반드시 있어야 할 Service 테스트

- 유죄인데 형량이 없으면 400
- 무죄인데 형량이 있으면 400
- 형량 0 또는 6이면 400
- 마감된 사건 판결 시 409
- 중복 판결 시 409
- 티켓 0장일 때 판결 불가
- 성공 시 티켓 1장 차감과 판결 1개 저장이 함께 됨
- 저장 중 오류가 나면 티켓 차감도 롤백됨
- 20표 미만 사건은 무효
- 정확히 08:59:59와 09:00:00의 회차가 다름
- 다른 사용자의 폐급 지수 숫자가 공개 응답에 없음
- 미판결 사용자의 판결문 조회가 403

### 19-3. 실제 MySQL 통합 테스트

H2는 MySQL과 문법, 정렬, 제약 처리 방식이 다릅니다. DB 관련 테스트는 Testcontainers의 MySQL을 사용합니다.

```java
package com.pyegeup.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@SpringBootTest
class PyegeupApiApplicationTests {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @Test
    void contextLoads() {}
}
```

Docker Desktop이 켜져 있어야 테스트 컨테이너가 실행됩니다.

### 19-4. API 수동 점검표

```bash
# 1. 상태
curl -i http://localhost:8080/actuator/health

# 2. 존재하는 사건
curl -i http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001

# 3. 없는 사건
curl -i http://localhost:8080/api/v1/cases/99999999-9999-9999-9999-999999999999

# 4. 정상 판결
curl -i -X POST http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001/verdicts \
  -H 'Content-Type: application/json' -H 'X-Debug-User-Id: 1' \
  -d '{"guilty":true,"sentence":3}'

# 5. 잘못된 유죄 형량
curl -i -X POST http://localhost:8080/api/v1/cases/10000000-0000-0000-0000-000000000001/verdicts \
  -H 'Content-Type: application/json' -H 'X-Debug-User-Id: 1' \
  -d '{"guilty":true,"sentence":9}'
```

---

## 20. 로그와 디버깅

로컬에서 SQL을 보고 싶을 때만 `application-local.yml`에 추가합니다.

```yaml
logging:
  level:
    org.hibernate.SQL: debug
    org.hibernate.orm.jdbc.bind: trace
```

운영 환경에서 bind 값을 `trace`로 출력하면 사용자 입력과 개인정보가 로그에 남을 수 있으므로 사용하지 않습니다.

요청 로그에는 다음을 남기면 좋습니다.

- request ID
- HTTP method와 path
- 응답 상태
- 처리 시간
- 인증된 내부 user ID
- 예외 code

남기지 말아야 할 것:

- 비밀번호와 토큰
- Authorization 헤더
- 사연 원문 전체
- 주민번호, 전화번호 같은 개인정보
- DB 접속 비밀번호

---

## 21. 운영 배포 준비

프론트가 GitHub Pages에 있어도 Spring Boot와 MySQL은 GitHub Pages에 올릴 수 없습니다. GitHub Pages는 정적 파일 호스팅이므로 API 서버와 DB는 별도 서비스가 필요합니다.

### 21-1. Dockerfile

백엔드 루트 `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon
COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /app/build/libs/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

`.dockerignore`:

```text
.git
.gradle
build
.idea
.env*
```

로컬 이미지 확인:

```bash
docker build -t pyegeup-api:local .
docker run --rm -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=pyegeup \
  -e DB_USERNAME=pyegeup \
  -e DB_PASSWORD=pyegeup-local-password \
  pyegeup-api:local
```

### 21-2. 운영 서비스에 필요한 환경 변수

```text
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
CORS_ALLOWED_ORIGINS=https://pso0207.github.io
JWT_ISSUER_URI
SERVER_PORT
```

### 21-3. 배포 체크리스트

- API 주소가 `https://`인지 확인
- MySQL 3306 포트를 인터넷 전체에 공개하지 않기
- 앱 서버만 DB에 접근하도록 네트워크 제한
- DB 자동 백업과 복구 테스트
- `/actuator/health`만 공개하고 환경 변수·beans 같은 Actuator endpoint는 비공개
- 운영 CORS origin을 정확히 제한
- `X-Debug-User-Id` 제거
- `.requestMatchers("/api/v1/**").permitAll()` 제거
- 운영 비밀번호를 GitHub 저장소에 커밋하지 않기
- Flyway migration 실패 시 새 앱 버전을 트래픽에 연결하지 않기
- 서버 시간대와 무관하게 DB는 UTC, 회차 계산만 `Asia/Seoul`
- 로그와 오류 응답에 stack trace, SQL, 개인정보를 노출하지 않기

---

## 22. 기능 구현 권장 순서

각 단계가 끝날 때 테스트하고 커밋하세요.

### 1단계: 기반

- [ ] Spring Boot 프로젝트 생성
- [ ] MySQL Docker 실행
- [ ] Flyway V1/V2 적용
- [ ] `/actuator/health` 확인
- [ ] 공통 오류 응답 작성

### 2단계: 읽기 API

- [ ] 사건 상세
- [ ] 오늘의 사건 5건
- [ ] 법원 목록
- [ ] 페이지네이션
- [ ] 프론트 사건 상세 한 화면 연결

### 3단계: 판결

- [ ] 티켓 1장 차감
- [ ] 판결 저장
- [ ] 중복 요청 방지
- [ ] 판결문 저장
- [ ] 판결한 사용자만 판결문 조회

### 4단계: 마감과 정산

- [ ] 사건 마감 스케줄러
- [ ] 20표 미만 무효
- [ ] 유죄율·평균 형량 계산
- [ ] 점수와 콤보 계산
- [ ] 알림 생성
- [ ] 정산 멱등성 테스트

### 5단계: 사용자 기능

- [ ] 내 프로필
- [ ] 공개 프로필 개인정보 제한
- [ ] 스크랩, 구독, 차단, 신고
- [ ] 알림 읽음 처리
- [ ] 법원과 랭킹

### 6단계: 운영 준비

- [ ] 실제 인증
- [ ] rate limit
- [ ] 관리자 검수 API
- [ ] 운영 MySQL과 백업
- [ ] API 배포
- [ ] 프론트 환경 변수 변경
- [ ] 모니터링과 장애 알림

---

## 23. 자주 생기는 오류

| 증상 | 원인 | 해결 |
|---|---|---|
| `Connection refused: localhost:3306` | MySQL 미실행 | `docker compose up -d`, `docker compose ps` |
| `Access denied for user` | 계정·비밀번호 불일치 | Compose와 `application.yml` 값을 비교 |
| `Unknown database 'pyegeup'` | DB 생성 전 또는 볼륨 꼬임 | 컨테이너 로그 확인, 개발 데이터가 필요 없으면 `down -v` 후 재생성 |
| `Flyway checksum mismatch` | 적용된 migration 파일 수정 | 기존 파일을 되돌리고 새 `V3__...sql` 생성 |
| `Schema-validation: missing table` | Flyway 실패 또는 다른 DB 접속 | `flyway_schema_history`, 현재 DB 이름 확인 |
| 모든 API가 401 | Spring Security 기본 잠금 | `SecurityConfig`가 스캔되는 패키지 아래인지 확인 |
| 브라우저만 CORS 오류 | 허용 origin 불일치 | protocol, host, port를 정확히 등록 |
| 휴대폰에서 서버 연결 실패 | `localhost` 사용 | Mac의 LAN IP 사용, 같은 Wi-Fi와 방화벽 확인 |
| JSON 형량 검증이 안 됨 | `@Valid` 누락 | Controller 요청에 `@Valid` 추가 |
| 판결 두 번 저장됨 | DB UNIQUE 없음 | `(case_id,user_id)` UNIQUE 추가 |
| 티켓이 음수가 됨 | 동시 요청 잠금 없음 | 사용자 행 잠금 + 트랜잭션 + CHECK 제약 |
| 한글이 깨짐 | 문자셋 불일치 | DB/table/connection 모두 `utf8mb4` 확인 |
| 날짜가 9시간 어긋남 | UTC와 KST 혼용 | 저장은 `Instant`/UTC, 표시와 회차만 Seoul 변환 |
| Entity를 찾지 못함 | 패키지 위치 문제 | 메인 클래스 `com.pyegeup.api` 아래에 Entity 배치 |
| 포트 8080 사용 중 | 다른 프로세스 실행 중 | 해당 프로세스를 종료하거나 `SERVER_PORT=8082` 사용 |

문제가 생기면 오류의 마지막 한 줄만 보지 말고, 로그에서 첫 `Caused by:`부터 읽으세요. 대개 실제 원인은 그 줄 근처에 있습니다.

---

## 24. 처음 시작하는 날의 정확한 작업 순서

오늘 바로 시작한다면 이 순서만 따라가세요.

1. Java 21, Docker 확인
2. Spring Initializr에서 프로젝트 생성
3. `compose.yaml` 작성 후 `docker compose up -d`
4. `application.yml` 작성
5. Flyway `V1`, `V2` 작성
6. `./gradlew bootRun`
7. `/actuator/health`가 `UP`인지 확인
8. 사건 Entity, Repository, DTO 작성
9. 사건 상세 Service, Controller 작성
10. curl로 사건 한 건 조회
11. 이 시점에 첫 Git 커밋
12. 다음 날 판결 저장 API 진행

서버가 켜지지 않는 상태에서 프론트 연결부터 시도하지 마세요. 먼저 curl로 API를 검증하고, 그 다음 브라우저, 마지막으로 실제 휴대폰 순서로 확인하면 문제 범위를 빠르게 줄일 수 있습니다.

---

## 25. 참고한 공식 문서

- [Spring Boot 프로젝트와 현재 버전](https://spring.io/projects/spring-boot/)
- [Spring Boot 시스템 요구사항](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring 공식 MySQL 입문 가이드](https://spring.io/guides/gs/accessing-data-mysql/)
- [MySQL 8.4 문자셋 설명](https://dev.mysql.com/doc/refman/8.4/en/charset.html)
- [MySQL utf8mb4 권장 사항](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8.html)
- [Flyway와 Spring Boot 연동](https://documentation.red-gate.com/flyway/reference/usage/community-plugins-and-integrations/community-plugins-and-integrations-spring-boot)
- [Spring Framework CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [Spring Security Bearer Token](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/bearer-tokens.html)
- [Spring Data JPA Locking](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html)
- [Spring Boot Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html)
- [Spring Boot Actuator Health](https://docs.spring.io/spring-boot/api/rest/actuator/health.html)

---

## 26. 다음에 만들 파일

이 튜토리얼을 따라 최소 API가 실행되면 다음 문서를 별도로 만드는 것이 좋습니다.

- `API-SPEC.md`: 모든 요청·응답·오류 코드
- `ERD.md`: 테이블 관계와 인덱스
- `AUTH.md`: 로그인, 토큰 갱신, 로그아웃
- `DEPLOY.md`: 선택한 클라우드 기준 실제 배포 절차
- `ADMIN.md`: 사연 검수와 신고 처리

처음부터 문서 다섯 개를 완벽하게 만들 필요는 없습니다. API 하나를 완성할 때마다 요청·응답 예시와 예외를 `API-SPEC.md`에 추가하는 방식이 가장 유지하기 쉽습니다.
