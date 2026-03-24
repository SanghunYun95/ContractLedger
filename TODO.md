# Project Refactoring & Stability TODO

## 완료된 작업 (Completed)
- [x] **프로젝트 구조 개편**: `backend`, `frontend` 폴더로 코드 분리 및 정리
- [x] **리프레시 토큰 및 인증 지속성**:
    - [x] Access Token 만료 기간 설정 (15분) 및 Refresh Token 도입 (30일 유효)
    - [x] `User` 엔티티에 해싱된 `refreshToken` 저장 필드 추가
    - [x] 프론트엔드 `AuthContext`에서 토큰 만료 시 자동 갱신(Silent Refresh) 로직 구현
- [x] **GCP Cloud Storage (GCS) 연동**:
    - [x] 로컬 `./uploads` 환경을 GCS 버킷으로 전환 완료
    - [x] `GcsStorageService` 구현 및 환경 변수 연동 (`GCS_BUCKET_NAME`, `cloud-storage.json`)
    - [x] **인증된 파일 프록시**: 백엔드 컨트롤러를 통한 GCS 파일 다운로드 기능 구현 (404/403 이슈 해결)
- [x] **백엔드 인프라 및 API 표준**:
    - [x] 서버 전역 `api/` 프리픽스 설정 및 프론트엔드 프록시(`next.config.ts`) 경로 일치화
    - [x] 운영 환경에서 Swagger 문서 비활성화 및 `synchronize` 옵션 제어
- [x] **성능 및 안정성**:
    - [x] Audit 로그 조회 시 페이지네이션(`limit`, `offset`) 적용
    - [x] `GlobalExceptionFilter`에서 `ValidationPipe` 에러 메시지 보존 로직 추가
    - [x] `NotificationService` 알림 전송 및 감사 로그 로직 분리

## 진행 중 / 향후 과제 (Backlog)
- [x] **GCP Cloud Run 배포**: Dockerize 후 Google Cloud Run 배포 자동화 (CI/CD) 완료
- [ ] **아키텍처 문서화**: GCP 인프라 다이어그램 및 프로젝트 아키텍처 가이드 정리
- [ ] **AI 모델 고도화 연동**: 실제 LLM 기반 계약 정밀 분석 및 PDF 텍스트 추출 고도화
- [ ] **실시간 알림**: WebSocket / Push API를 이용한 실시간 알림 시스템 구축
- [ ] **페이지네이션 메타데이터**: Audit 로그 응답에 전체 개수(`total`), 현재 페이지 등 메타 데이터 포함
- [ ] **고급 에러 핸들링**: `NotificationService` 재시도 로직이나 Dead Letter Queue 연동 검토
