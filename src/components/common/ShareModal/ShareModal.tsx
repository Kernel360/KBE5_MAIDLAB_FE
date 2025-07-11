import React from 'react';
import { X, Copy, Share } from 'lucide-react';
import { copyToClipboard } from '@/utils/browser';
import { useToast } from '@/hooks';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  text?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  text,
}) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      const success = await copyToClipboard(url);
      if (success) {
        showToast('링크가 복사되었습니다!', 'success');
        onClose();
      } else {
        showToast('링크 복사에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('링크 복사에 실패했습니다.', 'error');
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title,
      text: text || title,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onClose();
      } else {
        showToast('이 기기에서는 지원되지 않는 기능입니다.', 'info');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        showToast('공유에 실패했습니다.', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">공유하기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          {/* 링크 복사 */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Copy className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">링크 복사</div>
              <div className="text-sm text-gray-500">
                링크를 복사해서 원하는 곳에 공유하세요
              </div>
            </div>
          </button>

          {/* 기타 공유 (네이티브) */}
          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Share className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">기타</div>
                <div className="text-sm text-gray-500">
                  다른 앱으로 공유하기
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
