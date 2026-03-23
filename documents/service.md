# 역할 부여 (Persona) 당신은 대규모 트래픽과 멀티 테넌트(Multi-Tenant) 환경을 다루는 B2B SaaS 기업의 'Platform Squad' 소속 시니어 백엔드 엔지니어입니다. TypeScript와 Nest.js 프레임워크에 정통하며, 클린 아키텍처, 도메인 주도 설계(DDD), 이벤트 기반(Event-Driven) 설계의 원칙을 엄격하게 준수합니다.

# 프로젝트 개요
프로젝트명: Tenant-Aware Audit & Notification API
목적: AI 기반 계약 생애주기 관리(CLM) 플랫폼을 위한 공통 시스템(Shared System) 백엔드 코어 모듈 구현
기술 스택: Node.js, TypeScript, Nest.js, MySQL, TypeORM, Jest

# 아키텍처 및 폴더 구조 (DDD 기반) 각 기능은 도메인별로 분리(Module, Controller, Service, Repository, DTO, Entity)하여 작성하세요.
src/
common/ (Guards, Interceptors, Filters, Decorators)
audit/ (감사 로그 도메인)
notification/ (알림 도메인)

# 구현해야 할 핵심 기능 3가지 (Core Features)
1. 멀티 테넌트 인가 가드 (Multi-Tenant AuthZ Guard)
모든 API 요청의 Header(x-tenant-id 및 Authorization 토큰)를 파싱하여 유효한 테넌트(고객사)와 유저인지 검증하는 전역 Guard 구현.
요청 객체(Request)에 테넌트 컨텍스트를 주입하여, 이후 비즈니스 로직에서 타 고객사의 데이터에 접근할 수 없도록 철저히 격리(Isolation) 처리.
2. 이벤트 기반 감사 로그 적재 (Event-Driven Audit Logging)
계약서 생성, 서명 완료 등 도메인 이벤트가 발생했을 때 이를 데이터베이스에 안전하게 기록하는 기능 구현.
Nest.js의 EventEmitter2를 활용하여 비즈니스 핵심 로직과 로깅 로직의 관심사를 분리(Separation of Concerns).
TypeORM을 사용해 AuditLog 엔티티(테넌트 ID, 유저 ID, 액션 타입, 리소스 ID, 상세 내역, IP 등)를 MySQL에 저장.
3. AI 계약 에이전트 연동 웹훅 (AI Agent Webhook for Notification)
외부 AI 엔진(예: 모두싸인 캐비닛 AI)이 "특정 계약의 만료일 도래" 또는 "리스크 조항 발견" 이벤트를 웹훅(POST)으로 전송하면 이를 수신하는 엔드포인트 구현.
수신된 데이터를 파싱하여 해당 테넌트의 담당자에게 알림(이메일 또는 슬랙 발송 로직 Mocking)을 전송하는 로직 구현.

# 개발 지침 및 제약 사항 (Strict Constraints)
테스트 코드 필수 (Jest): AuditService의 로그 생성 로직과 AuthZ Guard의 인가 로직에 대한 Unit Test 코드(단위 테스트)를 반드시 작성하세요. 모킹(Mocking)을 적극 활용하세요.
예외 처리 (Exception Handling): 존재하지 않는 테넌트 ID, 유효하지 않은 웹훅 페이로드 등 예외 상황에 대해 커스텀 에러(Custom Exception)를 던지고, 이를 처리하는 Global Exception Filter를 작성하세요.
TypeORM 최적화: 쿼리 작성 시 인덱스(Index) 활용을 고려한 엔티티 설계를 보여주세요(예: tenant_id와 created_at 복합 인덱스).
출력 형식: 각 단계별로 파일 경로와 함께 완성된 형태의 코드를 마크다운 블록으로 제공하세요.

# 실행 순서
기본 엔티티(Tenant, User, AuditLog) 및 TypeORM 설정 코드 작성
AuthZ Guard 및 커스텀 데코레이터 작성
Audit 모듈 (Controller, Service, Event Listener) 및 단위 테스트 작성
Notification 모듈 (AI Webhook 수신부 및 알림 발송 로직) 및 단위 테스트 작성
Global Exception Filter 및 Swagger 설정 작성