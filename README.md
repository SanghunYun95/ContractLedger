# ContractLedger (계약 원장 관리 시스템)
<img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white"><img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"><img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"><img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white"><img src="https://img.shields.io/badge/Google%20Cloud-4285F4?style=flat-square&logo=googlecloud&logoColor=white">

> **상세 가이드**: [ContractLedger Overview](https://deepwiki.com/SanghunYun95/ContractLedger/1-contractledger-overview)

📄 **ContractLedger (AI 기반 멀티 테넌시 계약 리스크 분석 플랫폼)**
ContractLedger는 B2B SaaS 환경에서 계약서를 효율적이고 안전하게 관리하기 위한 통합 플랫폼입니다. 멀티 테넌트 격리, 감사 로그, AI 기반 실시간 알림 시스템을 핵심 기능으로 제공하며, Clean Architecture와 DDD(도메인 주도 설계) 원칙을 준수하여 개발되었습니다.

**도입 배경: 고비용·고위험의 아날로그식 결재 프로세스 한계 도달**
싱가포르 법인 운영에 필수적인 주요 계약(사무실/숙소 임대, 인테리어, 법인차량 등 수천만~수억 원 규모) 체결 시, 기존 대면 보고 방식의 치명적인 비효율이 존재함.
- **과도한 실무 낭비**: 수십 장의 영문 계약서를 실무자가 직접 번역하고 1장으로 수기 요약하는 데 막대한 업무 시간 소요
- **형식적 결재로 인한 리스크**: 바쁜 임원진의 일정 탓에, 회사 근처 차량 등에서 단 1분 만에 쫓기듯 요약본만 훑어보고 결재가 이루어지는 등 고액 계약에 대한 검토 부실 및 위험성 상존

**해결 방안: AI를 활용해 계약서를 요약하고, 조항 내 잠재적 리스크를 분석해 내는 멀티 테넌시 기반 스마트 계약 플랫폼을 개발.**

---

## 🌐 라이브 데모 (GCP & Firebase)

배포된 서비스의 실시간 주소입니다:
- **URL**: [https://contract-ledger.web.app](https://contract-ledger.web.app)

---

## 🧪 테스트 시나리오 및 기능 검증 가이드

처음 프로젝트를 실행하거나 데모 사이트에 접속한 경우, 아래 순서에 따라 핵심 기능을 검증할 수 있습니다.

샘플 파일

<a href="https://github.com/user-attachments/files/26522947/26.04.06.pdf"><img src="https://img.shields.io/badge/다운로드-불공정비밀유지계약서(26.04.06)-FF0000?style=flat-square&logo=adobearcrobatreader&logoColor=white"></a>

<a href="https://github.com/user-attachments/files/26522948/default.pdf"><img src="https://img.shields.io/badge/다운로드-표준비밀유지계약서-FF0000?style=flat-square&logo=adobearcrobatreader&logoColor=white"></a>

1. **로그인 및 인증**: `test@example.com` / `password123` 계정으로 접속하여 테넌트 컨텍스트(`test-tenant`) 활성화 확인 (실패 시 '보안 인증 정보 등록' 후 재시도)
2. **PDF 업로드 및 AI 분석**: '계약 보관함'에서 영문 계약서(PDF) 업로드 후 **'분석 실행'** 버튼을 클릭하면 AI 분석이 시작되며, 진행 상태가 실시간으로 업데이트됨
3. **실시간 알림 수신**: 분석이 완료되면 화면 상단에 실시간 토스트 알림이 표시되며 목록이 자동 갱신됨
4. **인라인 미리보기**: 업로드된 계약서의 '미리보기' 버튼 클릭 시 별도 탭 이동 없이 브라우저에서 즉시 내용 확인 가능
5. **감사 추적**: 모든 업로드, 분석, 조회 행위가 'Audit Ledger'에 서버사이드 페이지네이션과 함께 실시간으로 기록됨

---

## 🚀 주요 기능

### Backend (Nest.js & TypeORM)
- **멀티 테넌트 격리**: 테넌트 간 데이터를 철저히 분리하며, 유효한 JWT 토큰 및 테넌트 식별자를 통한 인가 처리
- **실시간 알림 (WebSocket)**: Socket.io 기반의 `NotificationGateway`를 통해 AI 분석 완료 등 중요 이벤트를 실시간 푸시
- **서버사이드 페이지네이션**: 감사 로그 조회 시 대용량 데이터를 효율적으로 처리하기 위한 `limit/offset` 기반 페이징 최적화
- **AI 분석 파이프라인**: `pdf-parse`를 활용한 텍스트 추출 및 OpenAI 연동을 통한 계약 조항 자동 요약 및 리스크 분석
- **이벤트 기반 아키텍처**: `EventEmitter2`를 사용하여 비즈니스 도메인과 로깅/알림 관심사를 분리

### Frontend (Next.js & Tailwind CSS)
- **인라인 PDF 뷰어**: 계약서를 다운로드하지 않고 브라우저 내에서 즉시 미리보기 가능한 Blob 기반 뷰어 구현
- **실시간 토스트 알림**: 백엔드와 연동된 실시간 이벤트를 수신하여 사용자에게 즉각적인 시각적 피드백 제공
- **반응형 대시보드**: Next.js 15와 "The Architectural Vault" 디자인 시스템을 활용한 프리미엄 다크 테마 UI
- **고급 데이터 그리드**: 서버사이드 페이징과 연동된 감사 로그 테이블로 원활한 활동 추적 가능
- **테넌트 스위처**: 동적으로 활성 테넌트 컨텍스트를 전환하여 데이터 조회 범위 변경

---

## 🛠 기술 스택

- **Frontend**: Next.js 15+, React 19, Tailwind CSS
- **Backend**: Node.js, TypeScript, Nest.js, TypeORM, Socket.io
- **Database**: SQLite (기본)
- **Infrastructure**: Google Cloud Platform (Cloud Run, Cloud Storage, Firebase Hosting)

## 📦 시작하기

### 사전 준비 사항
- Node.js >= 18
- SQLite (기본 내장)

### 설치 및 실행

1. 저장소 클론:
   ```bash
   git clone git@github.com:SanghunYun95/ContractLedger.git
   cd ContractLedger
   ```

2. 백엔드 및 프론트엔드 의존성 설치:
   ```bash
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install
   ```

3. 로컬 실행:
   - 백엔드: `npm run start:dev` (3001 포트)
   - 프론트엔드: `npm run dev` (3000 포트)

---

## 📄 라이선스

본 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
