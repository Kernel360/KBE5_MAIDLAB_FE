import React from 'react';

interface DesktopViewportProps {
  children: React.ReactNode;
}

export const DesktopViewport: React.FC<DesktopViewportProps> = ({ children }) => {
  return (
    <div className="w-screen h-screen relative">
      {/* 데스크톱 (lg 이상): 배경화면 + 작은 뷰포트 */}
      <div className="hidden lg:block w-full h-full">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/maid-dogs-background.png')`,
            zIndex: 1,
          }}
        />

        {/* 작은 뷰포트 - 그냥 크기만 줄인 일반적인 웹사이트 */}
        <div
          className="absolute bg-white rounded-lg shadow-2xl overflow-y-auto overflow-x-hidden desktop-viewport"
          style={{
            // 위치
            top: '1%',
            right: '1%',

            // 크기
            width: '450px',
            height: '762px',

            // 기본 스타일만
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        >
          {children}
        </div>
      </div>

      {/* 태블릿 (md ~ lg): 전체 화면 */}
      <div className="hidden md:block lg:hidden w-full h-full bg-white overflow-y-auto overflow-x-hidden desktop-viewport">
        {children}
      </div>

      {/* 모바일 (sm 이하): 전체 화면 */}
      <div className="block md:hidden w-full h-full bg-white overflow-y-auto overflow-x-hidden desktop-viewport">
        {children}
      </div>
    </div>
  );
};