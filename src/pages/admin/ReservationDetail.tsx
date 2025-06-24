import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { adminApi } from '@/apis'; 
import type { ReservationDetailResponse } from '@/types/reservation';
import { formatDateTime } from '@/utils'

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF7F50',
  '&:hover': {
    backgroundColor: '#FF6347',
  },
}));

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box mb={2}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box mb={4}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Box>
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

  if (loading) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <StyledButton variant="contained" onClick={handleBack}>
          돌아가기
        </StyledButton>
      </StyledContainer>
    );
  }

  if (!reservation) {
    return (
      <StyledContainer>
        <Typography>예약을 찾을 수 없습니다.</Typography>
        <StyledButton variant="contained" onClick={handleBack}>
          돌아가기
        </StyledButton>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1">
          예약 상세 정보
        </Typography>
        <StyledButton variant="contained" onClick={handleBack}>
          목록으로
        </StyledButton>
      </Box>

      <StyledPaper>
        <Section title="서비스 정보">
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={3}
          >
            <Box flex={1}>
              <InfoItem label="서비스 유형" value={reservation.serviceType} />
              <InfoItem
                label="상세 서비스"
                value={reservation.serviceDetailType}
              />
              <InfoItem label="예약 날짜" value={formatDateTime(reservation.reservationDate)} />
              <InfoItem label="시작 시간" value={formatDateTime(reservation.startTime)} />
              <InfoItem label="종료 시간" value={formatDateTime(reservation.endTime)} />
              <InfoItem
                label="금액"
                value={formatPrice(reservation.totalPrice)}
              />
            </Box>
            <Box flex={1}>
              <InfoItem label="주소" value={reservation.address} />
              <InfoItem label="상세 주소" value={reservation.addressDetail} />
              <InfoItem label="주거 형태" value={reservation.housingType} />
              <InfoItem label="평수" value={`${reservation.roomSize}평`} />
              <InfoItem label="반려동물" value={reservation.pet || '없음'} />
            </Box>
          </Box>
        </Section>

        <Section title="매니저 정보">
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={3}
          >
            <Box flex={1}>
              <InfoItem
                label="매니저 이름"
                value={reservation.managerName || '-'}
              />
              <InfoItem
                label="매니저 전화번호"
                value={reservation.managerPhoneNumber || '-'}
              />
              <InfoItem
                label="평균 평점"
                value={
                  reservation.managerAverageRate != null
                    ? reservation.managerAverageRate.toFixed(1)
                    : '-'
                }
              />
            </Box>
            <Box flex={1}>
              <Box mb={2}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  활동 지역
                </Typography>
                <Typography variant="body1">
                  {Array.isArray(reservation.managerRegion)
                    ? reservation.managerRegion.join(', ')
                    : '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Section>

        {reservation.specialRequest && (
          <Section title="특별 요청사항">
            <Typography variant="body1">
              {reservation.specialRequest}
            </Typography>
          </Section>
        )}
      </StyledPaper>
    </StyledContainer>
  );
};

export default ReservationDetail;
