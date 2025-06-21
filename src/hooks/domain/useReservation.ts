import { useState, useEffect, useCallback, useRef } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useToast } from '../useToast';
import type {
  ReservationCreateRequest,
  ReservationListResponse,
  ReservationApprovalRequest,
  CheckInOutRequest,
  ReviewRegisterRequest,
} from '@/types/reservation';

// LocalDate + LocalTime → ISO DateTime 문자열로 변환하는 유틸리티 함수
const toISODateTime = (date: string, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

export const useReservation = () => {
  const [reservations, setReservations] = useState<ReservationListResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // 마지막 업데이트 시간 추적
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 10000; // 10초

  // 예약 목록 조회 (캐시 적용)
  const fetchReservations = useCallback(
    async (force: boolean = false) => {
      const now = Date.now();

      // 강제 새로고침이 아니고, 마지막 업데이트로부터 10초가 지나지 않았다면 현재 데이터 반환
      if (!force && now - lastUpdateRef.current < UPDATE_INTERVAL) {
        return reservations;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await reservationApi.getAllReservations();
        console.log("--------------------------------------data:",data);
        setReservations(data);
        lastUpdateRef.current = now;
        return data;
      } catch (err: any) {
        setError(err.message);
        showToast('예약 목록을 불러오는데 실패했습니다.', 'error');
        return reservations;
      } finally {
        setLoading(false);
      }
    },
    [showToast, reservations],
  );

  // 로컬 상태 업데이트 함수
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
      try {
        setLoading(true);
        const data = await reservationApi.getReservationDetail(reservationId);
        return data;
      } catch (error: any) {
        showToast('예약 상세 정보를 불러오는데 실패했습니다.', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 예약 생성
  const createReservation = useCallback(
    async (reservationData: any) => {
      try {
        setLoading(true);

        if (!reservationData.serviceDetailTypeId) {
          throw new Error('서비스 종류가 선택되지 않았습니다.');
        }

        const formattedData: ReservationCreateRequest = {
          serviceDetailTypeId: reservationData.serviceDetailTypeId,
          address: reservationData.address,
          addressDetail: reservationData.addressDetail,
          managerUuId: reservationData.managerUuId,
          housingType: reservationData.housingType,
          roomSize: reservationData.roomSize,
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
          serviceAdd: reservationData.serviceAdd,
          pet: reservationData.pet,
          specialRequest: reservationData.specialRequest,
          totalPrice: reservationData.totalPrice,
        };

        const result = await reservationApi.create(formattedData);
        await fetchReservations(true); // 강제 새로고침
        showToast('예약이 완료되었습니다.', 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '예약에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchReservations, showToast],
  );

  // 예약 취소
  const cancelReservation = useCallback(
    async (reservationId: number) => {
      try {
        const result = await reservationApi.cancel(reservationId);
        setReservations((prev) =>
          prev.filter((r) => r.reservationId !== reservationId),
        );
        showToast('예약이 취소되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '예약 취소에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  // 예약 승인/거절 (매니저용)
  const respondToReservation = useCallback(
    async (reservationId: number, data: ReservationApprovalRequest) => {
      try {
        const result = await reservationApi.respondToReservation(
          reservationId,
          data,
        );
        await fetchReservations(true); // 강제 새로고침

        const message = data.status
          ? '예약을 승인했습니다.'
          : '예약을 거절했습니다.';
        showToast(message, 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '응답 처리에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [fetchReservations, showToast],
  );

  // 체크인
  const checkIn = useCallback(
    async (reservationId: number, data: CheckInOutRequest) => {
      try {
        const result = await reservationApi.checkIn(reservationId, data);
        updateLocalReservation(reservationId, { status: 'WORKING' });
        showToast('체크인이 완료되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '체크인에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast, updateLocalReservation],
  );

  // 체크아웃
  const checkOut = useCallback(
    async (reservationId: number, data: CheckInOutRequest) => {
      try {
        const result = await reservationApi.checkOut(reservationId, data);
        updateLocalReservation(reservationId, { status: 'COMPLETED' });
        showToast('체크아웃이 완료되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '체크아웃에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast, updateLocalReservation],
  );

  // 리뷰 등록
  const registerReview = useCallback(
    async (reservationId: number, data: ReviewRegisterRequest) => {
      try {
        const result = await reservationApi.registerReview(reservationId, data);
        updateLocalReservation(reservationId, { isExistReview: true });
        showToast('리뷰가 등록되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '리뷰 등록에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast, updateLocalReservation],
  );

  // 주간 정산 조회
  const fetchWeeklySettlements = useCallback(
    async (startDate: string) => {
      try {
        setLoading(true);
        const data = await reservationApi.getWeeklySettlements(startDate);
        return data;
      } catch (error: any) {
        showToast(
          error.message || '정산 정보를 불러오는데 실패했습니다.',
          'error',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    fetchReservationDetail,
    createReservation,
    cancelReservation,
    respondToReservation,
    checkIn,
    checkOut,
    registerReview,
    fetchWeeklySettlements,
  };
};
