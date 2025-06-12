import { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useToast } from './useToast';
import type {
  ReservationRequestDto,
  ReservationResponseDto,
  ReservationIsApprovedRequestDto,
  CheckInOutRequestDto,
  ReviewRegisterRequestDto,
} from '@/apis/reservation';

// LocalDate + LocalTime → ISO DateTime 문자열로 변환하는 유틸리티 함수
const toISODateTime = (date: string, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

export const useReservation = () => {
  const [reservations, setReservations] = useState<ReservationResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // 예약 목록 조회
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await reservationApi.getAllReservations();
      setReservations(data);
    } catch (err: any) {
      setError(err.message);
      showToast('예약 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

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
        console.log("--------------------------------")
        console.log("ReservationStep3에서 받은 데이터:", reservationData);

        // serviceDetailTypeId 검증
        if (!reservationData.serviceDetailTypeId) {
          throw new Error('서비스 종류가 선택되지 않았습니다.');
        }

        // 날짜와 시간 데이터를 ISO 형식으로 변환
        const formattedData: ReservationRequestDto = {
          serviceDetailTypeId: reservationData.serviceDetailTypeId,
          address: reservationData.address,
          addressDetail: reservationData.addressDetail,
          managerUuId: reservationData.managerUuId,
          housingType: reservationData.housingType,
          roomSize: reservationData.roomSize,
          housingInformation: reservationData.housingInformation,
          reservationDate: toISODateTime(reservationData.reservationDate, reservationData.startTime),
          startTime: toISODateTime(reservationData.reservationDate, reservationData.startTime),
          endTime: toISODateTime(reservationData.reservationDate, reservationData.endTime),
          serviceAdd: reservationData.serviceAdd,
          pet: reservationData.pet,
          specialRequest: reservationData.specialRequest,
          totalPrice: reservationData.totalPrice,
        };

        console.log('서버로 전송되는 데이터:', {
          ...formattedData,
          serviceDetailTypeId: formattedData.serviceDetailTypeId,
          reservationDate: formattedData.reservationDate,
          startTime: formattedData.startTime,
          endTime: formattedData.endTime,
        });

        const result = await reservationApi.create(formattedData);

        // 예약 목록 새로고침
        await fetchReservations();
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

  // 결제 금액 확인
  const checkPrice = useCallback(
    async (reservationData: ReservationRequestDto) => {
      try {
        const result = await reservationApi.checkPrice(reservationData);
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '금액 확인에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  // 예약 취소
  const cancelReservation = useCallback(
    async (reservationId: number) => {
      try {
        const result = await reservationApi.cancel(reservationId);

        // 로컬 상태에서 제거
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
    async (reservationId: number, data: ReservationIsApprovedRequestDto) => {
      try {
        const result = await reservationApi.respondToReservation(
          reservationId,
          data,
        );

        await fetchReservations(); // 목록 새로고침

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
    async (reservationId: number, data: CheckInOutRequestDto) => {
      try {
        const result = await reservationApi.checkIn(reservationId, data);

        await fetchReservations(); // 목록 새로고침
        showToast('체크인이 완료되었습니다.', 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '체크인에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [fetchReservations, showToast],
  );

  // 체크아웃
  const checkOut = useCallback(
    async (reservationId: number, data: CheckInOutRequestDto) => {
      try {
        const result = await reservationApi.checkOut(reservationId, data);

        await fetchReservations(); // 목록 새로고침
        showToast('체크아웃이 완료되었습니다.', 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '체크아웃에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [fetchReservations, showToast],
  );

  // 리뷰 등록
  const registerReview = useCallback(
    async (reservationId: number, data: ReviewRegisterRequestDto) => {
      try {
        const result = await reservationApi.registerReview(reservationId, data);

        showToast('리뷰가 등록되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '리뷰 등록에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
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
    checkPrice,
    cancelReservation,
    respondToReservation,
    checkIn,
    checkOut,
    registerReview,
    fetchWeeklySettlements,
  };
};
