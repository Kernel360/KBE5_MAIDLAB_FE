## :open_file_folder: Project Structure

```markdown
src/
├── apis/
│ ├── auth/
│ │ └── index.ts # 인증 관련 API
│ ├── posts/
│ │ └── index.ts # 게시글 관련 API
│ └── index.ts # API 공통 설정 및 유틸리티
├── components/
│ ├── common/ # 공통 컴포넌트
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ └── Modal.tsx
│ └── layout/ # 레이아웃 컴포넌트
│ ├── Header.tsx
│ ├── Footer.tsx
│ └── Sidebar.tsx
├── pages/ # 페이지
│ ├── Home.tsx
│ ├── Login.tsx
│ └── Board.tsx
├── assets/ # 이미지, 폰트 등 정적 파일
│ ├── images/
│ └── fonts/
├── styles/  
│ ├── App.css # App 컴포넌트 스타일
│ ├── index.css # 전역 스타일
│ └── variables.css # CSS 변수
├── utils/
│ ├── date.ts # 날짜 관련 유틸리티
│ ├── validation.ts # 유효성 검사
│ └── format.ts # 포맷팅 유틸리티
├── hooks/
│ ├── useAuth.ts # 인증 관련 훅
│ └── useForm.ts # 폼 관련 훅
├── services/
│ ├── api.ts # API 설정
│ └── storage.ts # 로컬 스토리지
├── types/
│ ├── index.ts # API 응답 타입
│ └── common.ts # 공통 타입
└── constants/
│ └── index.ts # 라우트 및 설정 상수
└── App.tsx # 애플리케이션 루트 컴포넌트
└── index.tsx # React 앱의 진입점
```

<br><br>

## 💻 Getting Started

> 해당 프로젝트 설치 및 실행 방법
> <br>

### Installation

```
npm install
```

### Develop Mode

```
# 개발 서버 실행
npm run dev
# 또는
yarn dev

# 환경 변수
NODE_ENV=development
VITE_APP_ENV=development
```

### Production

```
# 프로덕션 빌드
npm run build
# 또는
yarn build

# 빌드된 결과물 미리보기
npm run preview
# 또는
yarn preview

# 환경 변수
NODE_ENV=production
VITE_APP_ENV=production
```
