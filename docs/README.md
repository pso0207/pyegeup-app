# 국민재판소 — 문서

앱 개발 명칭은 「폐급재판」, 스토어 노출명은 「국민재판소」입니다.
새 세션이나 새 사람이 합류하면 **[HANDOFF.md](HANDOFF.md)부터** 읽으세요.

| 문서 | 언제 읽나 |
|---|---|
| **[../DESIGN.md](../DESIGN.md)** | UI 코드를 쓰기 전. Google DESIGN.md 포맷의 토큰 원본 (에이전트용) |
| **[HANDOFF.md](HANDOFF.md)** | 작업을 이어받을 때. 현재 상태 · 실행법 · 지뢰 · 다음 할 일 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 코드를 처음 열 때. 파일 지도 · 라우팅 · 상태 관리 |
| [DOMAIN.md](DOMAIN.md) | 기획 수치를 확인할 때. 계급 · 형량 · 티켓 · 점수 규칙 |
| [DESIGN.md](DESIGN.md) | UI를 고치기 전에. 토큰 · 한글 타이포 · 컴포넌트 규약 |
| [TESTING.md](TESTING.md) | 변경 후 검증할 때. 번들 · 헤드리스 · 에뮬레이터 |
| [BACKEND.md](BACKEND.md) | 서버를 붙일 때. 엔드포인트 제안 · 목업 교체 지점 |
| **[learning/PRACTICE-PROJECT.md](learning/PRACTICE-PROJECT.md)** | 실제 서버를 12회 실습으로 만들며 Spring·Java·MySQL을 공부할 때 |
| [BACKEND-TUTORIAL.md](BACKEND-TUTORIAL.md) | Java 21 · Spring Boot · MySQL 전체 코드와 설정을 찾을 때 |

## 목적별 분류

### 처음 프로젝트를 열었을 때

- [HANDOFF.md](HANDOFF.md): 현재 구현 상태와 실행법
- [ARCHITECTURE.md](ARCHITECTURE.md): 프론트 파일 지도와 상태 흐름

### 백엔드를 배우고 만들 때

- [learning/PRACTICE-PROJECT.md](learning/PRACTICE-PROJECT.md): `실습 N 시작해줘`로 진행하는 실제 프로젝트
- [learning/PROGRESS.md](learning/PROGRESS.md): 현재 완료 단계와 다음 명령
- [learning/README.md](learning/README.md): 학습 문서 전체 안내
- [learning/AI-COLLABORATION.md](learning/AI-COLLABORATION.md): AI 요청문과 협업 규칙
- [learning/REVIEW-CHECKLIST.md](learning/REVIEW-CHECKLIST.md): 코드 리뷰 기준
- [learning/REVIEW-LOG.md](learning/REVIEW-LOG.md): 기능별 학습 기록
- [BACKEND-TUTORIAL.md](BACKEND-TUTORIAL.md): 전체 구현 참고서
- [BACKEND.md](BACKEND.md): API와 서버 책임

### 기획과 UI를 확인할 때

- [DOMAIN.md](DOMAIN.md): 점수·티켓·마감 등 도메인 규칙
- [DESIGN.md](DESIGN.md): UI 토큰과 컴포넌트 규약
- [HOME-REDESIGN.md](HOME-REDESIGN.md), [UI-READABILITY.md](UI-READABILITY.md): UI 변경 근거

### 검증하고 배포할 때

- [TESTING.md](TESTING.md): 번들·브라우저·에뮬레이터 검증

기획 원본은 `~/Downloads/폐급재판/폐급재판_기획서_v1.0.pdf`입니다.
텍스트로 다시 읽으려면 `pdftotext -layout <경로> out.txt` (pdftotext 설치되어 있음).
