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
import { useAdmin } from '@/hooks';
import { type MatchingResponse } from '@/types/matching';
// ✅ 올바른 타입 import - 개별 매니저 아이템 타입
import { type ManagerListItem } from '@/types/admin';
import { RESERVATION_STATUS } from '@/constants/status';

interface MatchingChangeDialogProps {
  open: boolean;
  matching: MatchingResponse | null;
  onClose: () => void;
  onConfirm: (managerId: number) => void;
}

const MatchingChangeDialog = ({
  open,
  matching,
  onClose,
  onConfirm,
}: MatchingChangeDialogProps) => {
  const { managerManagement } = useAdmin();
  // ✅ 매니저 배열 타입 수정
  const [managers, setManagers] = useState<ManagerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // 매니저 목록 조회
  useEffect(() => {
    let isMounted = true;

    const fetchManagers = async () => {
      if (!open || isInitialized) return;

      setLoading(true);
      try {
        const response = await managerManagement.fetchManagers({
          page: 0,
          size: 100,
        });

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
  }, [open, managerManagement, isInitialized]);

  // 다이얼로그가 닫힐 때만 상태 초기화
  useEffect(() => {
    if (!open) {
      setSelectedManagerId(null);
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
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={
            !selectedManagerId ||
            matching?.matchingStatus === RESERVATION_STATUS.PENDING
          }
        >
          변경
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchingChangeDialog;
