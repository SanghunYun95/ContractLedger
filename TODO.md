# Project Refactoring & Stability TODO

## 완료된 작업 (Completed)
- [x] **Project Restructuring**: `backend`, `frontend` 폴더로 코드 분리 및 정리
- [x] **Documentation Clean up**: `AGENT.md`, `frontend/AGENTS.md` 등 프로젝트 가이드 내 오탈자 및 부적절한 경로 수정
- [x] **Markdown Lint Compliance**: `documents/` 내 마크다운 파일들의 서식 수정 (MD040, MD058 등)
- [x] **Backend Core Security**:
    - `synchronize` 옵션 환경 변수 제어 (`process.env.NODE_ENV`)
    - 운영 환경에서 Swagger 문서 비활성화
    - `TenantAuthGuard` 보안 강화 (Bearer 토큰 형식 검증 및 Spoofing 방지 TODO 추가)
- [x] **Database Schema Optimizations**:
    - `AuditLog` 엔티티 Nullable 타입 명시 (Strict 모드 지원)
    - `Tenant` 엔티티 `name` 유니크 제어
    - `User` 엔티티 `email`, `tenantId` 복합 유니크 인덱스 추가
- [x] **Performance & Reliability**:
    - Audit 로그 조회 시 페이지네이션(`limit`, `offset`) 적용
    - `GlobalExceptionFilter`에서 `ValidationPipe` 에러 메시지 보존 로직 추가
    - `NotificationService`에서 알림 전송과 감사 로그 기록 로직 분리 (알림 실패가 로그 기록을 방해하지 않도록 개선)

## 향후 과제 (Backlog)
- [ ] **Auth Context verification**: `TenantAuthGuard`에서 실제 JWT 서명 검증 로직 구현
- [ ] **Pagination Metadata**: Audit 로그 응답에 전체 개수(`total`), 현재 페이지 등 메타 데이터 포함
- [ ] **Advanced Error Handling**: `NotificationService`에서 알림 전송 실패 시 재시도 로직이나 Dead Letter Queue 연동 검토
- [ ] **Frontend Integration**: 백엔드 변경 사항(페이지네이션 등)을 프론트엔드 UI에 반영
- [ ] **Production DB Migration**: SQLite에서 PostgreSQL/MySQL 등으로의 전환 및 마이그레이션 도구 설정
