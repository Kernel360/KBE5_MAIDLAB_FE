import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks';
import { formatNumber } from '@/utils';
import type { SettlementDetailInfo } from '@/types/domain/admin';
import { getServiceTypeName } from '@/utils/format';
import type { ServiceType } from '@/constants/service';

const SettlementDetail = () => {
  const { settlementId } = useParams<{ settlementId: string }>();
  const navigate = useNavigate();
  const { loading, reservationManagement } = useAdmin();
  const [settlement, setSettlement] = useState<SettlementDetailInfo | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSettlementDetail = async () => {
      if (!settlementId) return;
      const data = await reservationManagement.fetchSettlementDetail(
        Number(settlementId),
      );
      if (data) {
        setSettlement(data);
      }
    };

    fetchSettlementDetail();
  }, [settlementId]);

  const handleApprove = async () => {
    if (!settlementId) return;
    setActionLoading(true);
    try {
      const success = await reservationManagement.approveSettlement(
        Number(settlementId),
      );
      if (success) {
        navigate(-1);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!settlementId) return;
    setActionLoading(true);
    try {
      const success = await reservationManagement.rejectSettlement(
        Number(settlementId),
      );
      if (success) {
        navigate(-1);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            승인 완료
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            승인 대기
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            승인 거부
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            {status}
          </span>
        );
    }
  };

  const SkeletonLoader = () => (
    <div className="app-container">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>

        {/* Card Skeleton */}
        <div className="card">
          <div className="space-y-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!settlement) {
    return (
      <div className="app-container">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              정산 정보를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              요청하신 정산 정보가 존재하지 않거나 삭제되었을 수 있습니다.
            </p>
            <button onClick={() => navigate(-1)} className="btn-primary">
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">정산 상세 정보</h1>
            <p className="text-gray-600 mt-1">
              정산 ID: #{settlement.settlementId}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {settlement?.status === 'PENDING' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  승인
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  거부
                </button>
              </>
            )}
            <button
              onClick={() => navigate(-1)}
              disabled={actionLoading}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              목록으로
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="mb-6">
          <div className="card bg-gradient-to-r from-orange-50 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  현재 상태
                </h3>
                <p className="text-gray-600 text-sm">
                  정산 처리 현황을 확인하세요
                </p>
              </div>
              {getStatusBadge(settlement.status)}
            </div>
          </div>
        </div>

        {/* Settlement Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                기본 정보
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  정산 ID
                </span>
                <span className="text-sm text-gray-900 font-mono">
                  #{settlement.settlementId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  서비스 유형
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {getServiceTypeName(settlement.serviceType as ServiceType)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">
                  상세 서비스
                </span>
                <span className="text-sm text-gray-900">
                  {settlement.serviceDetailType}
                </span>
              </div>
            </div>
          </div>

          {/* 금액 정보 */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                금액 정보
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  플랫폼 수수료
                </span>
                <span className="text-sm text-red-600 font-medium">
                  -{formatNumber(settlement.platformFee)}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                <span className="text-base font-semibold text-gray-900">
                  정산 금액
                </span>
                <span className="text-xl font-bold text-green-600">
                  {formatNumber(settlement.amount)}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 (필요시 확장 가능) */}
        <div className="mt-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                처리 현황
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center py-6">
                {settlement.status === 'PENDING' ? (
                  <div className="text-yellow-600">
                    <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium">
                      관리자 승인을 기다리고 있습니다
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      승인 또는 거부 처리를 진행해주세요
                    </p>
                  </div>
                ) : settlement.status === 'APPROVED' ? (
                  <div className="text-green-600">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="font-medium">정산이 완료되었습니다</p>
                    <p className="text-sm text-gray-600 mt-1">
                      정산 처리가 성공적으로 완료되었습니다
                    </p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <p className="font-medium">정산이 거부되었습니다</p>
                    <p className="text-sm text-gray-600 mt-1">
                      정산 요청이 거부 처리되었습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetail;
