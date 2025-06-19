## :open_file_folder: Project Structure

```markdown
src/
src/
├── apis/ # API 통신 레이어
├── components/ # React 컴포넌트 시스템
│ ├── common/ # 공통 컴포넌트
│ ├── features/ # 기능 컴포넌트
│ └── layout/ # 레이아웃 컴포넌트
├── pages/ # 페이지 컴포넌트
├── config/ # 환경 설정
├── constants/ # 상수 정의
├── hooks/ # 커스텀 훅
├── styles/ # 스타일 시스템
├── types/ # TypeScript 타입
├── utils/ # 유틸리티 함수
├── App.tsx # 앱 진입점
└── main.tsx # ReactDOM 렌더
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
