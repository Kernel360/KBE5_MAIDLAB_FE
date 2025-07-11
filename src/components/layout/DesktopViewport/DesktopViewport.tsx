import React, { useEffect, useState } from 'react';

interface DesktopViewportProps {
  children: React.ReactNode;
}

export const DesktopViewport: React.FC<DesktopViewportProps> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // DOM에서 실제 적용된 테마 확인
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();

    // MutationObserver로 DOM 클래스 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const backgroundImage = isDarkMode
    ? `url('/maid-dogs-background-dark.png')`
    : `url('/maid-dogs-background.png')`;

  const viewportStyles = isDarkMode
    ? {
        // 위치
        top: '1%',
        right: '1%',
        // 크기
        width: '450px',
        height: '762px',
        // 다크모드 스타일
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
      }
    : {
        // 위치
        top: '1%',
        right: '1%',
        // 크기
        width: '450px',
        height: '762px',
        // 라이트모드 스타일
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      };

  return (
    <div className="w-screen h-screen relative">
      {/* 데스크톱 (lg 이상): 배경화면 + 작은 뷰포트 */}
      <div className="hidden lg:block w-full h-full">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: backgroundImage,
            zIndex: 1,
          }}
        />

        {/* 작은 뷰포트 - 그냥 크기만 줄인 일반적인 웹사이트 */}
        <div
          className="absolute bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-y-auto overflow-x-hidden desktop-viewport transition-all duration-300"
          style={viewportStyles}
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
