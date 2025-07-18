import { useState } from 'react';
import { authApi } from '@/apis/auth';
import { tokenStorage, userStorage } from '@/utils/storage';
import { useToast } from '@/hooks/useToast';

export function useWithdraw() {
  const { showToast } = useToast();
  const [withdrawing, setWithdrawing] = useState(false);

  const withdraw = async () => {
    setWithdrawing(true);
    try {
      await authApi.withdraw();
      tokenStorage.clearTokens();
      userStorage.clearUserData();
      sessionStorage.clear();
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      showToast('회원 탈퇴가 완료되었습니다.', 'success');
      window.location.replace('/'); // 바로 이동, 모달 닫지 않음
    } catch (e) {
      // 실패 시 에러 메시지 없이
      setWithdrawing(false);
    }
  };

  return { withdraw, withdrawing };
}
