# ContractLedger (계약 원장 관리 시스템)

ContractLedger는 B2B SaaS 환경에서 계약서를 효율적이고 안전하게 관리하기 위한 통합 플랫폼입니다. 멀티 테넌트 격리, 감사 로그, AI 기반 알림 시스템을 핵심 기능으로 제공하며, Clean Architecture와 DDD(도메인 주도 설계) 원칙을 준수하여 개발되었습니다.

---

## 📝 프로젝트 진행 현황 (TODO)

현재 프로젝트의 주요 개발 완료 사항 및 향후 계획입니다. 구체적인 내용은 `TODO.md` 파일에서 확인하실 수 있습니다.

- [x] **프로젝트 구조 개편**: `backend`, `frontend` 폴더 분리 및 정리 완료
- [x] **인증 및 보안**: JWT 기반 로그인 및 Refresh Token(30일) 도입, Silent Refresh 구현
- [x] **GCP 스토리지 연동**: Google Cloud Storage(GCS)를 통한 파일 업로드/다운로드 프록시 구현
- [x] **백엔드 핵심 모듈**: 멀티 테넌트 인가 가드, 이벤트 기반 감사 로그(Audit Log) 적재 완료
- [x] **프리미엄 대시보드 UI**: Next.js (App Router) 기반 다크 모드 및 Glassmorphism 디자인 적용
- [x] **GCP 배포 자동화**: Dockerize 후 Cloud Run 배포 파이프라인(CI/CD) 구축 완료
- [ ] **AI 모델 고도화**: **gpt-4o** 기반 계약서 정밀 분석 및 리스크 조항 추출 기능 연동 예정

---

## 🌐 라이브 데모 (GCP & Firebase)

배포된 서비스의 실시간 주소입니다:
- **Frontend**: [https://contract-ledger.web.app](https://contract-ledger.web.app) (Firebase)
- **Backend (API)**: [https://backend-1007750315482.asia-northeast3.run.app](https://backend-1007750315482.asia-northeast3.run.app)

---

## 🚀 주요 기능

### Backend (Nest.js & TypeORM)
- **멀티 테넌트 인가 가드**: 테넌트 간 데이터를 철저히 격리하며 유효한 JWT 토큰 소유자만 접근 허용
- **이벤트 기반 감사 로그**: `EventEmitter2`를 활용하여 비즈니스 로직과 로깅 로직을 분리, 모든 중요 작업 기록
- **AI 알림 웹훅**: 외부 AI 엔진으로부터 이벤트를 수신하여 담당자에게 즉각적인 알림 전송
- **계약서 관리 CRUD**: 테넌트 격리가 보장된 계약 데이터 생성, 조회, 수정, 삭제 기능
- **GCS 연동 파일 관리**: 보안을 위해 GCS 직접 접근 대신 백엔드 프록시를 통한 파일 다운로드 지원

### Frontend (Next.js & Tailwind CSS)
- **프리미엄 UI/UX**: "The Architectural Vault" 디자인 시스템 기반의 고품질 다크 테마 대시보드
- **테넌트 스위처**: 동적으로 활성 테넌트 컨텍스트를 전환하여 데이터 조회 범위 변경
- **감사 로그 데이터 그리드**: 페이지네이션이 적용된 테이블을 통해 테넌트별 활동 내역 실시간 모니터링
- **웹훅 시뮬레이터**: 프론트엔드에서 직접 AI 리스크 알림 발생을 테스트할 수 있는 기능 제공

## 🛠 기술 스택

- **Frontend**: Next.js 15+, React 19, Tailwind CSS
- **Backend**: Node.js, TypeScript, Nest.js, TypeORM
- **Database**: SQLite (기본)
- **Infrastructure**: Google Cloud Platform (Cloud Run, Cloud Storage, Artifact Registry)

## 📦 시작하기

### 사전 준비 사항
- Node.js >= 18
- SQLite (기본 내장)
- GCP 계정 및 프로젝트 (배포 시 필요)

### 설치 및 실행

1. 저장소 클론:
   ```bash
   git clone git@github.com:SanghunYun95/ContractLedger.git
   cd ContractLedger
   ```

2. 백엔드 및 프론트엔드 의존성 설치 (프로젝트 루트 기준):
   ```bash
   # Backend 의존성 설치
   cd backend && npm install
   
   # Frontend 의존성 설치 (루트 폴더로 돌아가서 이동하거나 전 단계에서 바로 이동)
   cd ../frontend && npm install
   ```

3. 환경 변수 설정 (`.env` 파일 생성 필수)
   - `backend/.env`: DB 설정, JWT_SECRET, GCS 관련 설정 등
   - `frontend/.env.local`: `NEXT_PUBLIC_API_URL` 등

4. 로컬 실행:
   - 백엔드: `npm run start:dev` (3001 포트)
   - 프론트엔드: `npm run dev` (3000 포트)

## ☁️ 배포 전략 (GCP + GitHub Actions)

본 프로젝트는 확장성과 유지보수성을 위해 Google Cloud Platform(GCP) 상에 컨테이너 기반으로 배포됩니다.

1. **컨테이너화**: Docker를 사용하여 프론트엔드(standalone 빌드)와 백엔드를 각각 패키징합니다.
2. **CI/CD 파이프라인**: GitHub Actions를 통해 `main` 브랜치 머지 시 자동으로 이미지를 빌드하고 `Artifact Registry`에 푸시합니다.
3. **Cloud Run**: 구글의 서버리스 컨테이너 환경인 Cloud Run을 통해 서비스를 배포하며, 트래픽에 따라 자동으로 스케일링됩니다.
4. **환경 변수 관리**: 보안이 필요한 설정은 GCP Secret Manager나 GitHub Secrets를 통해 관리합니다.

## 📄 라이선스

본 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.