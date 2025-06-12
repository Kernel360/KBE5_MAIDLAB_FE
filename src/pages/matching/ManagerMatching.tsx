import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useMatching } from '@/hooks/useMatching';
import { useReservation } from '@/hooks/useReservation';
// import { ROUTES } from '@/constants';
import type { RequestMatchingListResponseDto } from '@/apis/matching';
import { 
  Button, 
  Card, 
  Typography, 
  Box, 
  Stack, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { formatDateTimeWithLocale, formatPrice } from '@/utils/format';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  isAccepted: boolean;
}

const ResultModal = ({ open, onClose, isAccepted }: ResultModalProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 2,
        p: 1
      }
    }}
  >
    <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center' }}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
      {isAccepted ? (
        <>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6">예약이 승인되었습니다</Typography>
        </>
      ) : (
        <>
          <CancelIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6">예약이 거절되었습니다</Typography>
        </>
      )}
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
      <Button variant="contained" onClick={onClose} sx={{ minWidth: 100 }}>
        확인
      </Button>
    </DialogActions>
  </Dialog>
);

export const ManagerMatching = () => {
//   const navigate = useNavigate();
  const { fetchMatchings } = useMatching();
  const { respondToReservation } = useReservation();
  const [matchings, setMatchings] = useState<RequestMatchingListResponseDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    loadMatchings();
  }, []);

  const loadMatchings = async () => {
    const result = await fetchMatchings();
    setMatchings(result);
  };

  const handleAccept = async (reservationId: number) => {
    const result = await respondToReservation(reservationId, { status: true });
    if (result.success) {
      setIsAccepted(true);
      setModalOpen(true);
      setMatchings(prev => prev.filter(matching => matching.reservationId !== reservationId));
    }
  };

  const handleReject = async (reservationId: number) => {
    const result = await respondToReservation(reservationId, { status: false });
    if (result.success) {
      setIsAccepted(false);
      setModalOpen(true);
      setMatchings(prev => prev.filter(matching => matching.reservationId !== reservationId));
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.getHours()}:${String(start.getMinutes()).padStart(2, '0')} ~ ${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>예약 요청</Typography>
      <Stack spacing={2}>
        {matchings.map((matching) => (
          <Card key={matching.reservationId} sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {matching.detailServiceType} &gt; {matching.serviceType}
                </Typography>
                <Stack spacing={0.5}>
                  <Typography color="text.secondary">
                    예약일: {formatDateTimeWithLocale(matching.reservationDate)}
                  </Typography>
                  <Typography color="text.secondary">
                    서비스 시간: {formatTimeRange(matching.startTime, matching.endTime)}
                    {' '}
                    ({Math.round((new Date(matching.endTime).getTime() - new Date(matching.startTime).getTime()) / (1000 * 60 * 60))}시간)
                  </Typography>
                </Stack>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>서비스 정보</Typography>
                <Stack spacing={0.5}>
                  <Typography>
                    위치: {matching.address} {matching.addressDetail}
                  </Typography>
                  <Typography>방 크기: {matching.roomSize}평</Typography>
                  <Typography>
                    반려동물: {matching.pet === 'true' ? '있음' : '없음'}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>가격 정보</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  총 금액: {formatPrice(matching.totalPrice)}원
                </Typography>
              </Box>

              <Divider />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(matching.reservationId)}
                  startIcon={<CheckCircleIcon />}
                >
                  수락
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(matching.reservationId)}
                  startIcon={<CancelIcon />}
                >
                  거절
                </Button>
                {/* <Button
                  variant="outlined"
                  onClick={() => navigate(`${ROUTES.MANAGER.RESERVATION_DETAIL}`)}
                >
                  상세보기
                </Button> */}
              </Stack>
            </Stack>
          </Card>
        ))}
        {matchings.length === 0 && (
          <Typography textAlign="center" color="text.secondary">
            새로운 예약 요청이 없습니다.
          </Typography>
        )}
      </Stack>

      <ResultModal
        open={modalOpen}
        onClose={handleCloseModal}
        isAccepted={isAccepted}
      />
    </Box>
  );
}; 