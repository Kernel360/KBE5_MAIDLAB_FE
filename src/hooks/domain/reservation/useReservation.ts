import { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useApiCall } from '../../useApiCall';
import { useReservationCache } from './useReservationCache';
import { formatPrice } from '@/utils/format'; // 🔧 utils 활용
import { formatDate, formatTime, toISODateTime } from '@/utils/date'; // 🔧 utils 활용
import type {
  ReservationCreateRequest,
  ReservationListResponse,
  ReservationApprovalRequest,
  PaymentRequestBody,
  CheckInOutRequest,
} from '@/types/domain/reservation';

export const useReservation = () => {
  const [reservations, setReservations] = useState<ReservationListResponse[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const { executeApi, loading } = useApiCall();
  const { shouldUpdate, updateTime } = useReservationCache();

  // 🔧 의존성 순환 문제 해결
  const fetchReservations = useCallback(
    async (force: boolean = false) => {
      // 캐시 체크
      if (!shouldUpdate(force)) {
        return reservations;
      }

      const result = await executeApi(
        () => reservationApi.getAllReservations(),
        {
          successMessage: null,
          errorMessage: '예약 목록을 불러오는데 실패했습니다.',
        },
      );

      if (result.success) {
        setReservations(result.data ?? []);
        updateTime();
        setError(null);
        return result.data;
      } else {
        setError(result.error || null);
        return reservations;
      }
    },
    [executeApi, shouldUpdate, updateTime],
  ); // 🔧 reservations 의존성 제거

  // 로컬 상태 업데이트 함수 (낙관적 UI 업데이트용)
  const updateLocalReservation = useCallback(
    (reservationId: number, updates: Partial<ReservationListResponse>) => {
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.reservationId === reservationId
            ? { ...reservation, ...updates }
            : reservation,
        ),
      );
    },
    [],
  );

  // 예약 상세 조회
  const fetchReservationDetail = useCallback(
    async (reservationId: number) => {
      const result = await executeApi(
        () => reservationApi.getReservationDetail(reservationId),
        {
          successMessage: null,
          errorMessage: '예약 상세 정보를 불러오는데 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 예약 생성
  const createReservation = useCallback(
    async (reservationData: any) => {
      // 데이터 검증
      if (!reservationData.serviceDetailTypeId) {
        throw new Error('서비스 종류가 선택되지 않았습니다.');
      }

      const formattedData: ReservationCreateRequest = {
        serviceDetailTypeId: reservationData.serviceDetailTypeId,
        address: reservationData.address,
        addressDetail: reservationData.addressDetail,
        managerUuid: reservationData.managerUuid,
        housingType: reservationData.housingType,
        lifeCleaningRoomIdx: reservationData.lifeCleaningRoomIdx,
        housingInformation: reservationData.housingInformation,
        reservationDate: toISODateTime(
          reservationData.reservationDate,
          reservationData.startTime,
        ),
        startTime: toISODateTime(
          reservationData.reservationDate,
          reservationData.startTime,
        ),
        endTime: toISODateTime(
          reservationData.reservationDate,
          reservationData.endTime,
        ),
        serviceOptions: reservationData.serviceOptions,
        pet: reservationData.pet,
        specialRequest: reservationData.specialRequest,
        totalPrice: reservationData.totalPrice,
      };

      const result = await executeApi(
        () => reservationApi.create(formattedData),
        {
          successMessage: null,
          errorMessage: '예약에 실패했습니다.',
        },
      );
      if (result.success) {
        await fetchReservations(true); // 강제 새로고침
      }

      return result;
    },
    [executeApi, fetchReservations],
  );

  // 예약 취소
  const cancelReservation = useCallback(
    async (reservationId: number) => {
      const result = await executeApi(
        () => reservationApi.cancel(reservationId),
        {
          successMessage: '예약이 취소되었습니다.',
          errorMessage: '예약 취소에 실패했습니다.',
        },
      );

      if (result.success) {
        setReservations((prev) =>
          prev.filter((r) => r.reservationId !== reservationId),
        );
      }

      return result;
    },
    [executeApi],
  );

  // 예약 결제
  const payReservation = useCallback(
    async (reservationId: number) => {
      const paymentData: PaymentRequestBody = {
        reservationId: reservationId,
      };

      const result = await executeApi(
        () => reservationApi.payment(paymentData as any),
        {
          successMessage: '결제가 완료되었습니다.',
          errorMessage: '결제에 실패했습니다.',
        },
      );

      if (result.success) {
        updateLocalReservation(reservationId, {
          status: 'PAID',
        });
      }

      return result;
    },
    [executeApi, updateLocalReservation],
  );

  // 예약 승인/거절 (매니저용)
  const respondToReservation = useCallback(
    async (reservationId: number, data: ReservationApprovalRequest) => {
      const message = data.status
        ? '예약을 승인했습니다.'
        : '예약을 거절했습니다.';

      const result = await executeApi(
        () => reservationApi.respondToReservation(reservationId, data),
        {
          successMessage: message,
          errorMessage: '응답 처리에 실패했습니다.',
        },
      );

      if (result.success) {
        await fetchReservations(true);
      }

      return result;
    },
    [executeApi, fetchReservations],
  );

  // 체크인
  const checkIn = useCallback(
    async (reservationId: number, data: CheckInOutRequest) => {
      const result = await executeApi(
        () => reservationApi.checkIn(reservationId, data),
        {
          successMessage: '체크인이 완료되었습니다.',
          errorMessage: '체크인에 실패했습니다.',
        },
      );

      if (result.success) {
        updateLocalReservation(reservationId, {
          status: 'WORKING',
        });
      }

      return result;
    },
    [executeApi, updateLocalReservation],
  );

  // 체크아웃
  const checkOut = useCallback(
    async (reservationId: number, data: CheckInOutRequest) => {
      const result = await executeApi(
        () => reservationApi.checkOut(reservationId, data),
        {
          successMessage: '체크아웃이 완료되었습니다.',
          errorMessage: '체크아웃에 실패했습니다.',
        },
      );

      if (result.success) {
        updateLocalReservation(reservationId, {
          status: 'COMPLETED',
        });
      }

      return result;
    },
    [executeApi, updateLocalReservation],
  );

  // 주간 정산 조회
  const fetchWeeklySettlements = useCallback(
    async (startDate: string) => {
      const result = await executeApi(
        () => reservationApi.getWeeklySettlements(startDate),
        {
          successMessage: null,
          errorMessage: '정산 정보를 불러오는데 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 🔧 utils/format.ts와 utils/date.ts 활용한 포맷팅 함수들
  const formatReservationData = useCallback(
    (reservation: ReservationListResponse) => {
      return {
        ...reservation,
        formattedPrice: formatPrice(reservation.totalPrice),
        formattedDate: formatDate(reservation.reservationDate),
        formattedStartTime: formatTime(reservation.startTime),
        formattedEndTime: formatTime(reservation.endTime),
      };
    },
    [],
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchReservations();
  }, []); // 🔧 빈 의존성 배열

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    fetchReservationDetail,
    createReservation,
    cancelReservation,
    payReservation,
    respondToReservation,
    checkIn,
    checkOut,
    fetchWeeklySettlements,
    formatReservationData, // 🔧 포맷팅 유틸리티 제공
  };
};
