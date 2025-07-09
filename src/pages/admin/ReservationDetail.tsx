import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '@/apis';
import type { ReservationDetailResponse } from '@/types/domain/reservation';
import { formatDateTime } from '@/utils';
import { getServiceTypeName } from '@/constants/admin';
import {
  User,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Star,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) => {
  const isProfileImage = label === '프로필 이미지';

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900">
        {isProfileImage ? (
          <div className="flex items-center space-x-3">
            {value ? (
              <img
                src={value}
                alt={`${label}`}
                className="w-16 h-16 rounded-full object-cover border-3 border-orange-200 shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`w-16 h-16 rounded-full bg-orange-50 border-3 border-orange-200 flex items-center justify-center shadow-lg ${value ? 'hidden' : 'flex'}`}
            >
              <User className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        ) : (
          <span className="text-gray-900 font-semibold">{value || '-'}</span>
        )}
      </dd>
    </div>
  );
};

const Section = ({
  title,
  children,
  onClick,
  priority = false,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  priority?: boolean;
  icon?: React.ReactNode;
}) => (
  <div
    className={`
      bg-white border-2 border-gray-200
      ${priority ? 'ring-2 ring-orange-200 border-orange-300' : ''} 
      rounded-xl p-6 shadow-sm transition-all duration-300
      ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-orange-300 hover:scale-[1.02]' : ''}
    `}
    onClick={onClick}
  >
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="text-orange-500">{icon}</div>}
      <h3
        className={`text-xl font-bold ${priority ? 'text-orange-700' : 'text-gray-800'}`}
      >
        {title}
      </h3>
      {onClick && (
        <div className="ml-auto">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

const ReservationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const previousTab =
    (location.state as { previousTab?: number })?.previousTab ?? 0;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] =
    useState<ReservationDetailResponse | null>(null);

  useEffect(() => {
    const fetchReservationDetail = async () => {
      try {
        if (!id) return;
        const data = await adminApi.getReservation(parseInt(id));
        if (!data) {
          throw new Error('데이터가 없습니다.');
        }
        setReservation(data);
      } catch (err) {
        console.error('예약 상세 조회 에러:', err);
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetail();
  }, [id]);

  const formatPrice = (price: string | number) => {
    const numericPrice =
      typeof price === 'string' ? parseInt(price, 10) : price;
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(numericPrice);
  };

  const handleBack = () => {
    navigate('/admin/reservations', { state: { previousTab } });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      예약완료: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Calendar className="w-4 h-4" />,
      },
      진행중: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      완료: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      취소: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: <AlertCircle className="w-4 h-4" />,
    };

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text} shadow-sm`}
      >
        {config.icon}
        {status}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
              <p className="text-orange-600 font-medium">
                데이터를 불러오는 중...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-red-200">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-semibold mb-6">{error}</p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              onClick={handleBack}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center bg-white rounded-xl p-8 shadow-lg">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold mb-6">
              예약을 찾을 수 없습니다.
            </p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              onClick={handleBack}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="w-8 h-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-800">
                  예약 상세 정보
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {getStatusBadge(reservation.status)}
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm font-medium">예약 ID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-orange-600">
                    #{id}
                  </code>
                </div>
              </div>
            </div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              onClick={handleBack}
            >
              ← 목록으로
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* 예약 기본 정보 - Priority Section */}
          <Section title="예약 정보" icon={<Calendar className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                label="서비스 유형"
                value={getServiceTypeName(reservation.serviceType)}
                icon={<Home className="w-4 h-4" />}
              />
              <InfoItem
                label="상세 서비스"
                value={reservation.serviceDetailType}
                icon={<Star className="w-4 h-4" />}
              />
              <InfoItem
                label="예약 날짜"
                value={formatDateTime(reservation.reservationDate)}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem
                label="시작 시간"
                value={formatDateTime(reservation.startTime)}
                icon={<Clock className="w-4 h-4" />}
              />
              <InfoItem
                label="종료 시간"
                value={formatDateTime(reservation.endTime)}
                icon={<Clock className="w-4 h-4" />}
              />
              <InfoItem
                label="총 금액"
                value={formatPrice(reservation.totalPrice)}
                icon={<DollarSign className="w-4 h-4" />}
              />
              {reservation.serviceAdd && (
                <InfoItem
                  label="추가 서비스"
                  value={reservation.serviceAdd}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {reservation.canceledAt && (
                <InfoItem
                  label="취소 일시"
                  value={formatDateTime(reservation.canceledAt)}
                  icon={<XCircle className="w-4 h-4" />}
                />
              )}
            </div>
          </Section>

          {/* 서비스 장소 정보 */}
          <Section title="서비스 장소" icon={<MapPin className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                label="주소"
                value={reservation.address}
                icon={<MapPin className="w-4 h-4" />}
              />
              <InfoItem
                label="상세 주소"
                value={reservation.addressDetail}
                icon={<MapPin className="w-4 h-4" />}
              />
              <InfoItem
                label="주거 형태"
                value={reservation.housingType}
                icon={<Home className="w-4 h-4" />}
              />
              <InfoItem
                label="평수"
                value={`${reservation.roomSize}평`}
                icon={<Home className="w-4 h-4" />}
              />
              {reservation.housingInformation && (
                <InfoItem
                  label="주거 정보"
                  value={reservation.housingInformation}
                  icon={<Home className="w-4 h-4" />}
                />
              )}
              {reservation.pet && (
                <InfoItem
                  label="반려동물"
                  value={reservation.pet}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
            </div>
          </Section>

          {/* 서비스 이용 기록 */}
          {(reservation.checkinTime || reservation.checkoutTime) && (
            <Section
              title="서비스 이용 기록"
              icon={<CheckCircle className="w-6 h-6" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservation.checkinTime && (
                  <InfoItem
                    label="체크인 시간"
                    value={formatDateTime(reservation.checkinTime)}
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                )}
                {reservation.checkoutTime && (
                  <InfoItem
                    label="체크아웃 시간"
                    value={formatDateTime(reservation.checkoutTime)}
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                )}
              </div>
            </Section>
          )}

          {/* 특별 요청사항 */}
          {reservation.specialRequest && (
            <Section
              title="특별 요청사항"
              icon={<AlertCircle className="w-6 h-6" />}
            >
              <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-100">
                <p className="text-gray-800 leading-relaxed font-medium">
                  {reservation.specialRequest}
                </p>
              </div>
            </Section>
          )}

          {/* 매니저 정보 - Clickable */}
          <Section
            title="매니저 정보"
            onClick={() => navigate(`/admin/manager/${reservation.managerId}`)}
            icon={<User className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                label="프로필 이미지"
                value={reservation.managerProfileImage}
              />
              <InfoItem
                label="매니저 이름"
                value={reservation.managerName}
                icon={<User className="w-4 h-4" />}
              />
              <InfoItem
                label="전화번호"
                value={reservation.managerPhoneNumber}
                icon={<Phone className="w-4 h-4" />}
              />
              <InfoItem
                label="평균 평점"
                value={reservation.managerRate}
                icon={<Star className="w-4 h-4" />}
              />
            </div>
          </Section>

          {/* 수요자 정보 - Clickable */}
          <Section
            title="수요자 정보"
            onClick={() =>
              navigate(`/admin/consumer/${reservation.consumerId}`)
            }
            icon={<User className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                label="프로필 이미지"
                value={reservation.consumerProfileImage}
              />
              <InfoItem
                label="수요자 이름"
                value={reservation.consumerName}
                icon={<User className="w-4 h-4" />}
              />
              <InfoItem
                label="전화번호"
                value={reservation.consumerPhoneNumber}
                icon={<Phone className="w-4 h-4" />}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;
