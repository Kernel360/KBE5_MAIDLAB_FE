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
import { type MatchingResponseDto } from '../../apis/matching';
import { type ManagerListResponseDto } from '@/apis/admin';

interface MatchingChangeDialogProps {
  open: boolean;
  matching: MatchingResponseDto | null;
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
  const [managers, setManagers] = useState<ManagerListResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);

  // 매니저 목록 조회
  useEffect(() => {
    const fetchManagers = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const response = await managerManagement.fetchManagers();
        if (response?.content) {
          setManagers(response.content);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && managers.length === 0) {
      fetchManagers();
    }

    // 다이얼로그가 닫힐 때 상태 초기화
    if (!open) {
      setManagers([]);
      setSelectedManagerId(null);
    }
  }, [open, managerManagement, managers.length]);

  const handleConfirm = () => {
    if (selectedManagerId) {
      onConfirm(selectedManagerId);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            매니저 목록
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!selectedManagerId}
        >
          변경
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchingChangeDialog; 