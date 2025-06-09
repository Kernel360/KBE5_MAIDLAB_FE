import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { type MatchingResponseDto } from '../../apis/matching';

interface MatchingChangeDialogProps {
  open: boolean;
  matching: MatchingResponseDto | null;
  onClose: () => void;
  onConfirm: () => void;
}

const MatchingChangeDialog = ({
  open,
  matching,
  onClose,
  onConfirm,
}: MatchingChangeDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>매니저 변경</DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 400, py: 2 }}>
          {matching && (
            <Typography>
              예약 ID: {matching.reservationId}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          변경
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchingChangeDialog; 