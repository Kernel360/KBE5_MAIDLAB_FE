// src/components/features/consumer/ReservationStep1.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useToast, useConsumer } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { SERVICE_DETAIL_TYPES } from '@/constants/service';
import { ROUTES } from '@/constants';
import { Header } from '@/components';
interface Props {
  onNext: (data: {
    serviceType: string;
    serviceDetailType: string;
    address: string;
    addressDetail: string;
  }) => void;
  onBack?: () => void;
}

const TABS = [
  { key: '생활청소', label: '생활 청소' },
  { key: '부분청소', label: '부분 청소' },
];

const ReservationStep1: React.FC<Props> = ({ onNext, onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'생활청소' | '부분청소'>(
    '생활청소',
  );
  const [FetchAddress, setAdresss] = useState('');
  const [FetchAddressDetail, setDetailAddress] = useState('');
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const detail = SERVICE_DETAIL_TYPES[selectedTab];
  const { fetchProfile } = useConsumer();

  useEffect(() => {
    fetchProfile().then((profile) => {
      if (profile && profile.address) {
        setAdresss(profile.address);
        if (profile.detailAddress) {
          setDetailAddress(profile.detailAddress);
        }
      }
    });
  }, []);

  const handleNext = () => {
    if (selectedTab === '부분청소') {
      showToast('서비스 준비중입니다.');
      return;
    }
    onNext({
      serviceType: 'GENERAL_CLEANING',
      serviceDetailType: selectedTab,
      address: FetchAddress,
      addressDetail: FetchAddressDetail,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="서비스 상세 옵션 선택"
        backRoute={ROUTES.CONSUMER.RESERVATION_CREATE}
        showMenu={false}
      />
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-lg font-bold mb-2 mt-2 text-center text-gray-900 dark:text-white">
            하위 옵션을 선택해 주세요.
          </h2>

          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <div className="w-full flex gap-2 mt-4 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`flex-1 py-2 rounded-lg font-semibold border transition text-base ${
                    selectedTab === tab.key
                      ? 'bg-orange-50 border-orange-500 text-orange-500 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-400'
                      : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() =>
                    setSelectedTab(tab.key as '생활청소' | '부분청소')
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="card mt-2 mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                {detail.options?.map((opt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✔</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between w-full mt-4">
              <button
                onClick={onBack || (() => window.history.back())}
                className="btn btn-secondary w-1/3"
              >
                이전
              </button>
              <button onClick={handleNext} className="btn btn-primary w-1/2">
                다음
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ReservationStep1;
