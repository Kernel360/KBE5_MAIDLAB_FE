import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReservation } from '@/hooks/domain/reservation';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_OPTIONS,
  HOUSING_TYPES,
  PET_TYPES,
  FEE_CONFIG,
} from '@/constants/service';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS,
} from '@/constants/status';
import {
  getManagerReservationStatusText,
  getReservationStatusColor,
} from '@/utils/reservationStatus';
import { COLORS } from '@/constants/theme';
import { formatKoreanDate, formatTime, getKoreanWeekday } from '@/utils/date';
import {
  formatEstimatedPriceByRoomSize,
  formatMinutesToHourMinute,
  formatPrice,
  formatRoomSize,
} from '@/utils/format';
import type { ReservationDetailResponse } from '@/types/domain/reservation';
import { Header } from '@/components';
import {
  MapPin,
  Clock,
  Calendar,
  Home,
  PawPrint,
  Baby,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import { ROUTES } from '@/constants/route';
import CheckInOutModal from '@/components/features/reservation/manager/CheckInOutModal';

// 상태별 아이콘 매핑
const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  MATCHED: CheckCircle,
  WORKING: Coffee,
  COMPLETED: CheckCircle,
  CANCELED: XCircle,
  REJECTED: XCircle,
  FAILURE: XCircle,
  APPROVED: CheckCircle,
};

// 서비스별 아이콘/컬러 매핑
const SERVICE_ICONS: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  GENERAL_CLEANING: { icon: Home, color: COLORS.PRIMARY[500] },
  BABYSITTER: { icon: Baby, color: '#F472B6' },
  PET_CARE: { icon: PawPrint, color: COLORS.PRIMARY[400] },
};

function parseAdditionalOptions(serviceAdd: string) {
  if (!serviceAdd || serviceAdd === 'NONE') return [];
  return serviceAdd
    .split(',')
    .map((item) => {
      const [id, countStr] = item.split(':');
      const option = SERVICE_OPTIONS.find((opt) => opt.id === id);
      if (!option) return undefined;
      const count = countStr ? Number(countStr) : undefined;
      return {
        id,
        label: option.label,
        price: option.priceAdd,
        time: option.timeAdd,
        ...(count !== undefined ? { count } : {}),
      };
    })
    .filter(Boolean);
}

function parsePet(pet: string) {
  if (!pet || pet === 'NONE') return '없음';
  if (PET_TYPES[pet as keyof typeof PET_TYPES])
    return PET_TYPES[pet as keyof typeof PET_TYPES];
  return pet;
}

// 정산 금액 계산 함수
function calcManagerSettlement(totalPrice: number) {
  const platformFee = Math.max(
    FEE_CONFIG.MINIMUM_FEE,
    Math.min(FEE_CONFIG.MAXIMUM_FEE, totalPrice * FEE_CONFIG.PLATFORM_FEE_RATE),
  );
  const vat = totalPrice * FEE_CONFIG.VAT_RATE;
  return {
    platformFee,
    vat,
    settlement: totalPrice - platformFee - vat,
  };
}

function isToday(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

const ManagerReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchReservationDetail, checkIn, checkOut } = useReservation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] =
    useState<ReservationDetailResponse | null>(null);
  const [checkInOutModal, setCheckInOutModal] = useState({
    isOpen: false,
    isCheckIn: true,
  });

  useEffect(() => {
    const loadReservationDetail = async () => {
      try {
        if (!id) return;
        const data = await fetchReservationDetail(Number(id));
        if (!data) throw new Error('예약 정보를 찾을 수 없습니다.');
        setReservation(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '예약 정보를 불러오는데 실패했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };
    loadReservationDetail();
  }, [id, fetchReservationDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }
  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-red-500 mb-4">
            {error || '예약 정보를 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 상태/서비스 정보
  const status = (reservation.status ||
    'PENDING') as keyof typeof RESERVATION_STATUS_LABELS;
  const statusLabel = getManagerReservationStatusText(
    status,
    reservation.reservationDate,
  );
  const statusColor = getReservationStatusColor(
    status,
    reservation.reservationDate,
  );
  const StatusIcon = STATUS_ICONS[status] || Clock;
  const serviceType =
    reservation.serviceType as keyof typeof SERVICE_TYPE_LABELS;
  const serviceInfo =
    SERVICE_ICONS[serviceType] || SERVICE_ICONS.GENERAL_CLEANING;
  const ServiceIcon = serviceInfo.icon;

  const additionalOptions = parseAdditionalOptions(
    reservation.serviceAdd || '',
  );
  const petLabel = parsePet(reservation.pet || '');
  const roomSizeLabel = reservation
    ? formatRoomSize(reservation.roomSize)
    : '-';
  const housingTypeLabel =
    (reservation &&
      HOUSING_TYPES[reservation.housingType as keyof typeof HOUSING_TYPES]) ||
    reservation.housingType ||
    '-';

  const handleCheckInOut = (isCheckIn: boolean) =>
    setCheckInOutModal({ isOpen: true, isCheckIn });
  const handleCheckInOutClose = () =>
    setCheckInOutModal({ ...checkInOutModal, isOpen: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        variant="sub"
        title="예약 상세"
        backRoute={ROUTES.MANAGER.RESERVATIONS}
        showMenu={true}
      />
      <div className="max-w-md mx-auto">
        {/* 상태 카드 */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: serviceInfo.color }}
                >
                  <ServiceIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {reservation.serviceDetailType}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {SERVICE_TYPE_LABELS[serviceType]}
                  </p>
                </div>
              </div>
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: statusColor, color: '#fff' }}
              >
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusLabel}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 일정 정보 */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            서비스 일정
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {formatKoreanDate(reservation.reservationDate)} (
                  {getKoreanWeekday(reservation.reservationDate)})
                </p>
                <p className="text-sm text-gray-500">예약 날짜</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {formatTime(reservation.startTime)} -{' '}
                  {formatTime(reservation.endTime)}
                </p>
                <p className="text-sm text-gray-500">서비스 시간</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {reservation.address}
                </p>
                <p className="text-sm text-gray-500">
                  {reservation.addressDetail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 서비스 상세 정보 */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            서비스 정보
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">평수</span>
              <span className="font-medium text-gray-900">{roomSizeLabel}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">주거형태</span>
              <span className="font-medium text-gray-900">
                {housingTypeLabel}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">반려동물</span>
              <span className="font-medium text-gray-900">{petLabel}</span>
            </div>
          </div>
          {reservation.specialRequest && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">특별 요청사항</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {reservation.specialRequest}
              </p>
            </div>
          )}
        </div>

        {/* 추가 옵션 */}
        {additionalOptions.length > 0 && (
          <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              추가 옵션
            </h3>
            <div className="space-y-3">
              {additionalOptions.map((option: any, idx: number) => (
                <div
                  key={option.id + idx}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex-1">
                    <span className="text-gray-700">{option.label}</span>
                    {option.count && (
                      <span className="text-sm text-gray-500 ml-2">
                        x{option.count}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    +
                    {formatMinutesToHourMinute(
                      option.time * (option.count ?? 1),
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 결제 정보 */}
        <div className="mx-4 mt-4 bg-orange-50 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            서비스 금액 정보
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">서비스 기본 요금</span>
              <span className="text-gray-900">
                {formatEstimatedPriceByRoomSize(reservation.roomSize)}
              </span>
            </div>
            {additionalOptions.length > 0 &&
              additionalOptions.map((option: any, idx: number) => (
                <div
                  key={option.id + idx}
                  className="flex justify-between items-center py-1"
                >
                  <div className="flex-1">
                    <span className="text-gray-700">{option.label}</span>
                    {option.count && (
                      <span className="text-sm text-gray-500 ml-2">
                        x{option.count}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    +{formatPrice(option.price * (option.count || 1))}
                  </span>
                </div>
              ))}
            <div className="border-t border-gray-200 pt-3 mt-3 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  총 금액
                </span>
                <span className="text-xl font-bold text-orange-500">
                  {formatPrice(reservation.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">
                  플랫폼 수수료 ({FEE_CONFIG.PLATFORM_FEE_RATE * 100}%)
                </span>
                <span className="text-base font-bold text-red-500">
                  -
                  {formatPrice(
                    calcManagerSettlement(reservation.totalPrice).platformFee,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">
                  부가세 ({FEE_CONFIG.VAT_RATE * 100}%)
                </span>
                <span className="text-base font-bold text-red-500">
                  -
                  {formatPrice(
                    calcManagerSettlement(reservation.totalPrice).vat,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-lg font-semibold text-green-700">
                  정산 금액
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(
                    calcManagerSettlement(reservation.totalPrice).settlement,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mx-4 mt-4 pb-28 flex flex-row gap-3">
          {/* 체크인/체크아웃/관리자문의 버튼 노출 조건 */}
          {reservation.status === RESERVATION_STATUS.PAID &&
            isToday(reservation.reservationDate) && (
              <button
                className="flex-1 py-4 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-colors shadow-none"
                onClick={() => handleCheckInOut(true)}
              >
                체크인
              </button>
            )}
          {reservation.status === RESERVATION_STATUS.WORKING && (
            <button
              className="flex-1 py-4 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-colors shadow-none"
              onClick={() => handleCheckInOut(false)}
            >
              체크아웃
            </button>
          )}
          {/* 관리자 문의 버튼은 항상 노출 */}
          <button
            className="flex-1 py-4 bg-gray-200 text-gray-800 font-semibold rounded-2xl hover:bg-gray-400 transition-colors shadow"
            onClick={() => navigate(ROUTES.BOARD.LIST)}
          >
            관리자 문의
          </button>
        </div>
        <CheckInOutModal
          isOpen={checkInOutModal.isOpen}
          onClose={handleCheckInOutClose}
          onConfirm={async (reservationId, isCheckIn) => {
            if (!reservationId) return;
            if (isCheckIn) {
              await checkIn(reservationId, {
                checkTime: new Date().toISOString(),
              });
              setCheckInOutModal({ ...checkInOutModal, isOpen: false });
              window.location.reload();
            } else {
              await checkOut(reservationId, {
                checkTime: new Date().toISOString(),
              });
              setCheckInOutModal({ ...checkInOutModal, isOpen: false });
              navigate(
                ROUTES.MANAGER.REVIEW_REGISTER.replace(
                  ':id',
                  String(reservationId),
                ),
              );
            }
          }}
          isCheckIn={checkInOutModal.isCheckIn}
          reservationInfo={{
            serviceType: SERVICE_TYPE_LABELS[serviceType],
            detailServiceType: reservation.serviceDetailType,
            time: `${formatKoreanDate(reservation.reservationDate)} ${formatTime(reservation.startTime)} ~ ${formatTime(reservation.endTime)}`,
            reservationId: Number(id),
          }}
        />
      </div>
    </div>
  );
};

export default ManagerReservationDetail;
