# MaidLab Frontend - 가사서비스 플랫폼

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 프로젝트 개요

**MaidLab**은 가사도우미 및 돌봄서비스 플랫폼으로, **React 18 + TypeScript + Vite**로 구축된 웹 애플리케이션입니다.

### 🎯 주요 특징

- **🔐 멀티롤 아키텍처**: 소비자(수요자), 매니저, 관리자 역할 분리
- **🚀 모던 기술스택**: React 18, TypeScript, Vite, Tailwind CSS
- **🎨 반응형 디자인**: 모바일 퍼스트, 다크모드 지원
- **🔒 보안 강화**: JWT 기반 인증, 소셜 로그인, 권한 기반 접근제어

## 🏗️ 아키텍처 구조

```
src/
├── 🔌 apis/           # API 통신 레이어 (8개 도메인)
├── 🧩 components/     # React 컴포넌트 시스템
│   ├── common/        # 공통 컴포넌트
│   ├── features/      # 기능별 컴포넌트
│   └── layout/        # 레이아웃 컴포넌트
├── 🪝 hooks/          # 커스텀 훅 (20+ 훅)
├── 📄 pages/          # 페이지 컴포넌트
├── 🗺️ routes/         # 라우팅 시스템 (5개 모듈)
├── 🏷️ types/          # TypeScript 타입 정의
├── 🔧 constants/      # 상수 관리 (15+ 파일)
├── 🛠️ utils/          # 유틸리티 함수 (12+ 모듈)
├── ⚙️ config/         # 환경 설정
└── 🎨 styles/         # 스타일 시스템
```

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **npm** 8.0.0 이상 또는 **yarn** 1.22.0 이상

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저에서 확인
# http://localhost:5173
```

### 환경 변수 설정

```bash
# .env.development
NODE_ENV=development
VITE_APP_ENV=development
VITE_API_BASE_URL=https://api-maidlab.duckdns.org
VITE_APP_NAME=MaidLab
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎨 기술 스택

### 핵심 기술

| 분야         | 기술         | 버전   | 설명                        |
| ------------ | ------------ | ------ | --------------------------- |
| **Frontend** | React        | 18.2.0 | 컴포넌트 기반 UI 라이브러리 |
| **언어**     | TypeScript   | 5.8.3  | 정적 타입 검사              |
| **빌드**     | Vite         | 6.3.5  | 빠른 개발 서버 & 빌드       |
| **스타일**   | Tailwind CSS | 3.3.0  | 유틸리티 퍼스트 CSS         |
| **상태관리** | React Query  | 5.76.1 | 서버 상태 관리              |
| **라우팅**   | React Router | 6.21.3 | 클라이언트 사이드 라우팅    |
| **HTTP**     | Axios        | 1.9.0  | HTTP 클라이언트             |

### UI/UX 라이브러리

- **Material-UI (MUI)** 5.14.19 - 컴포넌트 라이브러리
- **React Hot Toast** 2.5.2 - 알림 시스템
- **Lucide React** & **React Icons** - 아이콘 시스템
- **Date-fns** 3.6.0 & **Dayjs** 1.11.13 - 날짜/시간 처리

## 🔧 주요 기능

### 1. 🔐 인증 시스템

- **JWT 기반 인증**: 액세스 토큰 + 리프레시 토큰
- **소셜 로그인**: Google 연동
- **멀티롤 지원**: 소비자, 매니저, 관리자 역할 분리
- **자동 토큰 갱신**: 백그라운드 토큰 관리

### 2. 📱 예약 시스템

- **다단계 예약 프로세스**: 서비스 선택 → 매니저 선택 → 예약 확정
- **실시간 매니저 매칭**: 위치 기반 매니저 검색
- **가격 계산**: 서비스 타입, 평수, 추가 옵션 기반
- **체크인/체크아웃**: GPS 기반 위치 확인

### 3. 👥 사용자 관리

#### 소비자 (수요자)

- **프로필 관리**: 개인정보, 선호도 설정
- **예약 관리**: 예약 생성, 취소, 내역 조회
- **리뷰 시스템**: 매니저 평가 및 리뷰 작성
- **찜하기**: 선호 매니저 관리

#### 매니저

- **프로필 설정**: 서비스 지역, 가능 시간 설정
- **예약 관리**: 예약 수락/거절, 스케줄 관리
- **정산 관리**: 수익 조회, 정산 내역
- **리뷰 관리**: 받은 리뷰 조회

#### 관리자

- **사용자 관리**: 매니저 승인, 사용자 관리
- **예약 모니터링**: 전체 예약 현황 관리
- **정산 관리**: 매니저 정산 승인/거절
- **콘텐츠 관리**: 게시판, 이벤트 관리

### 4. 💬 게시판 시스템

- **Q&A 게시판**: 사용자 질문 및 답변
- **상담 게시판**: 서비스 상담 요청
- **환불 게시판**: 환불 요청 및 처리
- **이미지 업로드**: 파일 첨부 지원

## 🔒 보안 기능

### 인증 및 권한

- **JWT 토큰 기반 인증**
- **자동 토큰 갱신 시스템**
- **역할 기반 접근제어 (RBAC)**
- **라우트 보호 및 권한 검증**

### 데이터 보호

- **개인정보 마스킹**: 이름, 전화번호, 이메일
- **HTTPS 통신**: 모든 API 통신 암호화
- **XSS 방지**: 입력값 검증 및 sanitization
- **CSRF 보호**: 토큰 기반 요청 검증

## 📊 성능 최적화

### 번들 최적화

- **코드 분할**: 라우트 기반 lazy loading
- **트리 쉐이킹**: 불필요한 코드 제거
- **이미지 최적화**: WebP 형식 지원
- **압축**: Terser 기반 minification

### 로딩 성능

- **React Query**: 데이터 캐싱 및 백그라운드 업데이트
- **Suspense**: 컴포넌트 lazy loading
- **프리로딩**: 중요 리소스 우선 로딩

## 📱 모바일 지원

### 반응형 디자인

- **모바일 퍼스트**: 320px ~ 1920px 대응
- **터치 최적화**: 44px 최소 터치 영역
- **iOS Safari 호환**: 100vh 문제 해결
- **PWA 준비**: 서비스 워커 설정

### 접근성 (A11Y)

- **키보드 네비게이션**: 모든 기능 키보드 접근 가능
- **스크린 리더**: ARIA 라벨 및 역할 정의
- **색상 대비**: WCAG 2.1 AA 준수
- **포커스 관리**: 명확한 포커스 표시

## 🔄 API 연동

### API 구조

```typescript
// API 클라이언트 예시
const apiClient = {
  auth: {
    login: (data: LoginRequest) => Promise<LoginResponse>,
    refresh: () => Promise<TokenResponse>,
  },
  reservation: {
    create: (data: ReservationRequest) => Promise<ReservationResponse>,
    list: () => Promise<ReservationListResponse>,
  },
  // ... 기타 API 모듈
};
```

### 에러 처리

- **통합 에러 핸들링**: 모든 API 에러 중앙 처리
- **한국어 에러 메시지**: 사용자 친화적 메시지
- **재시도 로직**: 네트워크 오류 자동 재시도
- **오프라인 지원**: 네트워크 상태 감지

## 📚 프로젝트 구조 상세

### 핵심 모듈

#### 1. API 레이어 (`/apis`)

- **8개 도메인**: auth, admin, board, consumer, event, manager, matching, reservation
- **중앙집중식 에러 처리**: 15가지 백엔드 에러 코드 매핑
- **토큰 관리**: 자동 갱신 및 재시도 로직

#### 2. 컴포넌트 시스템 (`/components`)

- **Common**: 재사용 가능한 공통 컴포넌트
- **Features**: 기능별 특화 컴포넌트
- **Layout**: 레이아웃 및 네비게이션 컴포넌트

#### 3. 커스텀 훅 (`/hooks`)

- **도메인별 훅**: useAuth, useReservation, useManager
- **UI 훅**: useModal, useToast, usePagination
- **유틸리티 훅**: useLocalStorage, useValidation

#### 4. 타입 시스템 (`/types`)

- **API 타입**: 모든 요청/응답 인터페이스
- **도메인 타입**: 비즈니스 로직 타입
- **공통 타입**: 페이지네이션, 에러 응답

#### 5. 상수 관리 (`/constants`)

- **API 설정**: 엔드포인트, 에러 코드, 메시지
- **서비스 설정**: 가격표, 지역 정보, 서비스 타입
- **검증 규칙**: 한국 특화 검증 패턴

## 🌟 주요 하이라이트

### 기술적 혁신

1. **동시성 토큰 갱신**: 여러 API 요청 시 토큰 갱신 중복 방지
2. **스마트 인터셉터**: 공개/비공개 엔드포인트 자동 구분
3. **타입 안전 API**: 제네릭 기반 타입 안전 보장
4. **한국 특화 검증**: 윤년 고려 생년월일, 한국 전화번호 형식

### 사용자 경험

1. **직관적 UI**: 한국 사용자 친화적 인터페이스
2. **빠른 로딩**: 코드 분할 및 지연 로딩
3. **오프라인 지원**: 네트워크 상태 기반 UX
4. **접근성**: 키보드 네비게이션, 스크린 리더 지원

### 개발 효율성

1. **강력한 타입 시스템**: 컴파일 타임 에러 방지
2. **자동화된 워크플로우**: 빌드, 테스트, 배포 자동화
3. **일관된 코드 스타일**: ESLint + Prettier 통합
4. **개발자 도구**: 개발 서버, 핫 리로드, 디버깅 지원

## 📞 지원 및 문의

### 개발팀 연락처

- **이메일**: dev@maidlab.kr
- **Slack**: #maidlab-dev
- **이슈 트래커**: [GitHub Issues](https://github.com/maidlab/frontend/issues)

### 문서 및 리소스

- **API 문서**: [https://docs.maidlab.site](https://docs.maidlab.kr)
- **디자인 시스템**: [https://design.maidlab.site](https://design.maidlab.kr)
- **개발 가이드**: [https://dev.maidlab.site](https://dev.maidlab.kr)
