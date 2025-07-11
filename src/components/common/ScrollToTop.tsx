import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // 페이지 변경 시 스크롤을 맨 위로
  useEffect(() => {
    const mainContainer = document.querySelector('.main-container');

    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      const mainContainer = document.querySelector('.main-container');
      const scrollTop = mainContainer
        ? mainContainer.scrollTop
        : window.pageYOffset;

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 초기 실행
    toggleVisibility();

    const mainContainer = document.querySelector('.main-container');

    if (mainContainer) {
      mainContainer.addEventListener('scroll', toggleVisibility);
      return () =>
        mainContainer.removeEventListener('scroll', toggleVisibility);
    } else {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const mainContainer = document.querySelector('.main-container');

    if (mainContainer) {
      mainContainer.scrollTo({
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
