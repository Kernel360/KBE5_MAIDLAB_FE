import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Radio,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAdminManagers } from '@/hooks/domain/admin';
import { type MatchingResponse } from '@/types/domain/matching';
// ✅ 올바른 타입 import - 개별 매니저 아이템 타입
import { type ManagerListItem } from '@/types/domain/admin';
import { RESERVATION_STATUS } from '@/constants/status';
import { adminApi } from '@/apis/admin';
import { extractRegionIdFromAddress } from '@/utils/region';
import { getDistrictNameById } from '@/constants/region';

interface MatchingChangeDialogProps {
  open: boolean;
  matching: MatchingResponse | null;
  onClose: () => void;
  onConfirm: (managerId: number) => void;
  loading?: boolean;
}

const MatchingChangeDialog = ({
  open,
  matching,
  onClose,
  onConfirm,
  loading: externalLoading = false,
}: MatchingChangeDialogProps) => {
  const { fetchManagers: adminFetchManagers } = useAdminManagers();
  // ✅ 매니저 배열 타입 수정
  const [managers, setManagers] = useState<ManagerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [regionId, setRegionId] = useState<number | null>(null);

  // 예약 상세 정보 조회 및 지역 추출
  useEffect(() => {
    let isMounted = true;

    const fetchReservationAndRegion = async () => {
      if (!open || !matching?.reservationId || regionId !== null) return;

      try {
        const reservationDetail = await adminApi.getReservation(matching.reservationId);
        
        if (isMounted && reservationDetail?.address) {
          const extractedRegionId = extractRegionIdFromAddress(reservationDetail.address);
          setRegionId(extractedRegionId);
        }
      } catch (error) {
        console.error('Error fetching reservation details:', error);
        // 지역을 찾을 수 없는 경우 fallback으로 전체 매니저 조회
        setRegionId(-1); // -1은 전체 매니저 조회를 의미
      }
    };

    fetchReservationAndRegion();

    return () => {
      isMounted = false;
    };
  }, [open, matching?.reservationId, regionId]);

  // 매니저 목록 조회 (지역별)
  useEffect(() => {
    let isMounted = true;

    const fetchManagers = async () => {
      if (!open || isInitialized || regionId === null) return;

      setLoading(true);
      try {
        let response;
        
        if (regionId === -1) {
          // 지역을 찾을 수 없는 경우 전체 매니저 조회
          response = await adminFetchManagers({
            page: 0,
            size: 100,
          });
        } else {
          // 지역별 매니저 조회
          response = await adminApi.getManagersByRegion(regionId, {
            page: 0,
            size: 100,
          });
        }

        // ✅ response.content를 사용 (ManagerListItem 배열)
        if (isMounted && response?.content) {
          setManagers(response.content);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchManagers();

    return () => {
      isMounted = false;
    };
  }, [open, regionId, isInitialized, adminFetchManagers]);

  // 다이얼로그가 닫힐 때만 상태 초기화
  useEffect(() => {
    if (!open) {
      setSelectedManagerId(null);
      setIsInitialized(false); // 다음에 다시 열 때 매니저 목록 새로 가져오기
      setRegionId(null); // 지역 ID도 초기화
      setManagers([]); // 매니저 목록도 초기화
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedManagerId) {
      onConfirm(selectedManagerId);
    }
  };

  return (
    <Dialog
      open={open && matching?.matchingStatus !== RESERVATION_STATUS.PENDING}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>매니저 변경</DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 400, py: 2 }}>
          {matching && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                예약 정보
              </Typography>
              <Typography variant="body2" color="text.secondary">
                예약 ID: {matching.reservationId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                현재 매니저 ID: {matching.managerId}
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle1" gutterBottom>
            매니저 목록 {managers.length > 0 && `(${managers.length}명)`}
            {regionId && regionId !== -1 && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                - {getDistrictNameById(regionId)} 지역
              </Typography>
            )}
          </Typography>

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {managers.map((manager) => (
                  <ListItem
                    key={manager.id}
                    alignItems="flex-start"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => setSelectedManagerId(manager.id)}
                  >
                    <ListItemAvatar>
                      <Radio
                        checked={selectedManagerId === manager.id}
                        onChange={() => setSelectedManagerId(manager.id)}
                      />
                    </ListItemAvatar>
                    <ListItemAvatar>
                      <Avatar alt={manager.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={manager.name}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          ID: {manager.id}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={externalLoading}>
          취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={
            !selectedManagerId ||
            matching?.matchingStatus === RESERVATION_STATUS.PENDING ||
            externalLoading
          }
          startIcon={externalLoading ? <CircularProgress size={16} /> : null}
        >
          {externalLoading ? '변경 중...' : '변경'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchingChangeDialog;
