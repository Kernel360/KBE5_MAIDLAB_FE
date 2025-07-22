# MaidLab - 생활 서비스 매칭 플랫폼

## 📄 프로젝트 소개

MaidLab은 바쁜 현대인의 일상을 지원하기 위해 청소, 베이비시터, 반려동물 케어 등의 생활 서비스를 제공하고, 고객(수요자)과 매니저(공급자)를 스마트하게 매칭하는 종합 생활 서비스 플랫폼입니다.

고객은 필요한 서비스를 손쉽게 예약하고, 매니저는 자신의 전문성을 바탕으로 안정적인 수익을 창출할 수 있도록 도와주는 양방향 플랫폼입니다.

## 🌐 배포 사이트

**배포 URL**: https://www.maidlab.site/ 

## 🛠️ 기술 스택

| 분야         | 기술         | 버전   | 설명                        |
| ------------ | ------------ | ------ | --------------------------- |
| **Frontend** | React        | 18.2.0 | 컴포넌트 기반 UI 라이브러리 |
| **언어**     | TypeScript   | 5.8.3  | 정적 타입 검사              |
| **빌드**     | Vite         | 6.3.5  | 빠른 개발 서버 & 빌드       |
| **스타일**   | Tailwind CSS | 3.3.0  | 유틸리티 퍼스트 CSS         |
| **상태관리** | React Query  | 5.76.1 | 서버 상태 관리              |
| **라우팅**   | React Router | 6.21.3 | 클라이언트 사이드 라우팅    |
| **HTTP**     | Axios        | 1.9.0  | HTTP 클라이언트             |

### Authentication & Security

- **JWT (JSON Web Token)** - 토큰 기반 인증
- **Google OAuth 2.0** - 소셜 로그인

### Cloud & Storage

- **AWS S3** - 파일 저장소 (이미지, 문서)
- **AWS CloudFront** - CDN (콘텐츠 배포)

### API & Documentation

- **SpringDoc OpenAPI 3** - API 문서화 (Swagger)
- **Server-Sent Events (SSE)** - 실시간 알림

### DevOps & Infrastructure

- **GitHub Actions** - CI/CD 파이프라인
- **Vercel** - 배포 환경

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
- **실시간 매니저 매칭**: 데이터 기반 매니저 검색
- **가격 계산**: 서비스 타입, 평수, 추가 옵션 기반

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

## 🏗️ 아키텍처 구조

```
src/
├── apis/           # API 통신 레이어
├── components/     # React 컴포넌트 시스템
│   ├── common/     # 공통 컴포넌트
│   ├── features/   # 기능별 컴포넌트
│   └── layout/     # 레이아웃 컴포넌트
├── hooks/          # 커스텀 훅
├── pages/          # 페이지 컴포넌트
├── routes/         # 라우팅 시스템
├── types/          # TypeScript 타입 정의
├── constants/      # 상수 관리
├── utils/          # 유틸리티 함수
├── config/         # 환경 설정
└── styles/         # 스타일 시스템
```

## 📚 프로젝트 구조 상세

### 핵심 모듈

#### 1. API 레이어 (`/apis`)

- **8개 도메인**: auth, admin, board, consumer, event, manager, matching, reservation
- **중앙집중식 에러 처리**: 백엔드 에러 코드 매핑
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

## 👥 개발팀

**MAIDLAB Backend Team**  
Kernel360 5기

### 팀원 구성
- **팀장**: 이소은
- **팀원**: 김진성, 조승현, 변재호

---

**문의사항이나 버그 리포트는 [GitHub Issues](https://github.com/Kernel360/KBE5_MAIDLAB_BE/issues)를 통해 제보해 주세요.**
