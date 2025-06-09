## :open_file_folder: Project Structure

```markdown
src/
├── apis/
│ ├── auth/
│ │ └── index.ts # 인증 관련 API
│ └── index.ts # API 공통 설정 및 유틸리티
├── assets/ # 이미지, 폰트 등 정적 파일
│ ├── images/
│ └── fonts/
├── components/
│ ├── common/ # 공통 컴포넌트
│ │ ├── index.ts
│ │ ├── Button/
│ │ ├── Input/
│ │ └── Modal/
│ ├── features/ # 기능 컴포넌트
│ │ │── index.ts
│ │ ├── auth/
│ │ ├── admin/
│ │ └── manager/
│ └── layout/ # 레이아웃 컴포넌트
│ ├── index.ts
│ ├── Header/
│ ├── Footer/
│ └── Sidebar/
└── constants/ # 라우트 및 설정 상수
│ └── index.ts
├── config/
│ ├── env.ts # env.ts 이동
│ ├── api.ts # api.ts 이동
│ └── index.ts # config 통합 export
├── hooks/ # 훅
│ └── index.ts
├── pages/ # 페이지
│ ├── Home.tsx
│ ├── Login.tsx
│ └── Board.tsx
├── styles/
│ ├── App.css # App 컴포넌트 스타일
│ ├── index.css # 전역 스타일
│ └── variables.css # CSS 변수
├── types/
│ ├── index.ts # API 응답 타입
│ └── common.ts # 공통 타입
├── utils/
│ └── index.ts # 유틸 함수
└── App.tsx # 애플리케이션 루트 컴포넌트
└── main.tsx # React 앱의 진입점
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
