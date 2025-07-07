import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReservation } from '@/hooks/domain/useReservation';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_OPTIONS,
  HOUSING_TYPES,
  PET_TYPES,
} from '@/constants/service';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  RESERVATION_STATUS,
} from '@/constants/status';
import { COLORS } from '@/constants/theme';
import { formatKoreanDate, formatTime, getKoreanWeekday } from '@/utils/date';
import {
  formatEstimatedPriceByRoomSize,
  formatPrice,
  formatMinutesToHourMinute,
  formatRoomSize,
  formatPhoneNumber,
} from '@/utils/format';
import type { ReservationDetailResponse } from '@/types/reservation';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageCircle,
  Phone,
  Star,
  MapPin,
  Clock,
  Calendar,
  User,
  Home,
  PawPrint,
  Baby,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import { ROUTES } from '@/constants/route';
import { Header } from '@/components';
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

const ConsumerReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchReservationDetail, cancelReservation, payReservation } =
    useReservation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] =
    useState<ReservationDetailResponse | null>(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

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

  // 예약 취소 핸들러
  const handleCancel = async () => {
    if (!reservation) return;
    if (window.confirm('정말 예약을 취소하시겠습니까?')) {
      await cancelReservation(Number(id));
      alert('예약이 취소되었습니다.');
      navigate(-1);
    }
  };

  // 결제 핸들러
  const handlePayment = async () => {
    if (!reservation) return;
    await payReservation(Number(id));
  };

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
  const statusLabel = RESERVATION_STATUS_LABELS[status] || '-';
  const statusColor = RESERVATION_STATUS_COLORS[status] || COLORS.PRIMARY[500];
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
  const phoneNumber = reservation.managerPhoneNumber
    ? formatPhoneNumber(reservation.managerPhoneNumber)
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        variant="sub"
        title="예약 상세"
        backRoute={ROUTES.CONSUMER.RESERVATIONS}
        showMenu={true}
      />

      <div className="max-w-md mx-auto pt-20">
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
                <span className="text-sm">
                  {RESERVATION_STATUS_LABELS[status]}
                </span>
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

        {/* 도우미 정보 */}
        {reservation.managerName && (
          <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              담당 도우미
            </h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
                {reservation.managerProfileImageUrl ? (
                  <img
                    src={reservation.managerProfileImageUrl}
                    alt={reservation.managerName}
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove(
                        'hidden',
                      );
                    }}
                  />
                ) : null}
                <User
                  className={`w-8 h-8 text-white ${reservation.managerProfileImageUrl ? 'hidden' : ''}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {reservation.managerName}
                  </h4>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {reservation.managerRate
                      ? parseFloat(reservation.managerRate).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    연락처
                  </span>
                </div>
                <button
                  onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  <span>{showPhoneNumber ? phoneNumber : '연락처 보기'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
            결제 정보
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">서비스 기본 요금</span>
              <span className="text-gray-900">
                {formatEstimatedPriceByRoomSize(reservation.roomSize)}
              </span>
            </div>
            {additionalOptions.length > 0 &&
              additionalOptions.map((option: any, idx: number) => (
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
                    +{formatPrice(option.price * (option.count || 1))}
                  </span>
                </div>
              ))}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  총 결제금액
                </span>
                <span className="text-xl font-bold text-orange-500">
                  {formatPrice(reservation.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mx-4 mt-4 pb-28 flex flex-row gap-3">
          {/* MATCHED 상태일 때 결제하기 버튼 */}
          {reservation.status === RESERVATION_STATUS.MATCHED && (
            <button
              className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"
              onClick={handlePayment}
            >
              결제하기
            </button>
          )}
          {/* 예약 취소 버튼: 예약 가능 상태일 때만 노출 */}
          {(
            [
              RESERVATION_STATUS.PENDING,
              RESERVATION_STATUS.MATCHED,
              RESERVATION_STATUS.PAID,
              RESERVATION_STATUS.APPROVED,
            ] as string[]
          ).includes(reservation.status) && (
            <button
              className="flex-1 py-4 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-colors shadow-lg"
              onClick={handleCancel}
            >
              예약 취소
            </button>
          )}
          {/* 관리자 문의 버튼 */}
          <button
            className="flex-1 py-4 bg-gray-200 text-gray-800 font-semibold rounded-2xl hover:bg-gray-400 transition-colors shadow"
            onClick={() => navigate(ROUTES.BOARD.LIST)}
          >
            관리자 문의
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumerReservationDetail;
