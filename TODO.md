# Project Refactoring & Stability TODO

## 완료된 작업 (Completed)
- [x] **프로젝트 구조 개편**: `backend`, `frontend` 폴더로 코드 분리 및 정리
- [x] **리프레시 토큰 및 인증 지속성**:
    - [x] Access Token 만료 기간 설정 (15분) 및 Refresh Token 도입 (30일 유효)
    - [x] 프론트엔드 `AuthContext`에서 401 에러 감지 시 자동 토큰 갱신(Silent Refresh) 로직 구현 (`AuditTable`, `ContractList` 연동)
- [x] **대시보드 UI 최적화 및 한글화**:
    - [x] 불필요한 사이드바 메뉴 제거 및 대시보드 레이아웃 확장
    - [x] 로그인 페이지, 계약 보관함, 대시보드 전 영역에 걸친 한국어 현지화 완료 (UX 개선)
    - [x] 산업 표준 암호화(Industry-Standard) 배지 적용 및 비현실적 문구 제거
- [x] **로그 필터링 시스템**:
    - [x] Audit Ledger에서 '동작(Action)' 기반의 실시간 드롭다운 필터링 기능 구현
- [x] **실시간 알림 (WebSocket)**:
    - [x] `Socket.io`를 활용하여 AI 분석 완료 시 클라이언트에 실시간 알림 전송 및 목록 자동 갱신 연동
- [x] **AI 모델 연동 및 PDF 처리 고도화**:
    - [x] `pdf-parse`를 활용한 PDF 텍스트 추출 로직 복구
    - [x] `gpt-4o` 기반 계약 정밀 리스크 분석 및 분석 결과 시각화(Risk Matrix) 구현
- [x] **GCP 인프라 연동 및 배포**:
    - [x] Cloud Storage (GCS) 연동 및 백엔드 프록시를 통한 보안 다운로드 구현
    - [x] Dockerfile 최적화 및 Google Cloud Run (CI/CD) 배포 자동화 완료

## 진행 중 / 향후 과제 (Backlog)
- [ ] **페이지네이션 메타데이터**: Audit 로그 응답에 전체 개수(`total`), 현재 페이지 등 상세 메타 데이터 포함하는 백엔드 리팩토링
- [ ] **아키텍처 문서화**: GCP 인프라 다이어그램 및 프로젝트 아키텍처 가이드(Markdown) 정리
- [ ] **고급 에러 핸들링**: `NotificationService` 재시도 로직이나 Dead Letter Queue 연동 검토
- [ ] **테넌트 관리 어드민**: 시스템 관리자용 전체 테넌트 모니터링 및 리소스 제어 패널
- [ ] **PDF 뷰어 고도화**: 보관함 내 PDF를 외부 뷰어 없이 브라우저에서 즉시 미리보기 기능 추가
