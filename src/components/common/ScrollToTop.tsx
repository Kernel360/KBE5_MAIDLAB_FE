import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // 페이지 변경 시 스크롤을 맨 위로
  useEffect(() => {
    // 현재 화면 크기에 맞는 스크롤 컨테이너 찾기
    const getScrollContainer = () => {
      // 모든 뷰포트 컨테이너 확인
      const desktopViewports = document.querySelectorAll('.desktop-viewport');
      
      // 현재 보이는 뷰포트 찾기 (display: none이 아닌 것)
      for (const viewport of desktopViewports) {
        const styles = window.getComputedStyle(viewport);
        if (styles.display !== 'none') {
          return viewport;
        }
      }
      
      // 뷰포트가 없으면 window 사용
      return null;
    };

    const scrollContainer = getScrollContainer();
    
    if (scrollContainer) {
      scrollContainer.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    const getScrollContainer = () => {
      const desktopViewports = document.querySelectorAll('.desktop-viewport');
      
      for (const viewport of desktopViewports) {
        const styles = window.getComputedStyle(viewport);
        if (styles.display !== 'none') {
          return viewport;
        }
      }
      
      return null;
    };

    const toggleVisibility = () => {
      const scrollContainer = getScrollContainer();
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
      
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollContainer = getScrollContainer();
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility);
      return () => scrollContainer.removeEventListener('scroll', toggleVisibility);
    } else {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const getScrollContainer = () => {
      const desktopViewports = document.querySelectorAll('.desktop-viewport');
      
      for (const viewport of desktopViewports) {
        const styles = window.getComputedStyle(viewport);
        if (styles.display !== 'none') {
          return viewport;
        }
      }
      
      return null;
    };

    const scrollContainer = getScrollContainer();
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-50 w-10 h-10 bg-gray-500 hover:bg-gray-600 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="맨 위로 가기"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;