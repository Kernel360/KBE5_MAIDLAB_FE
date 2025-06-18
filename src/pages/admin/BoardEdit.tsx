import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/hooks';
import { ROUTES } from '@/constants';
import type { BoardDetailResponse } from '@/types/board';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
}));

// 게시판 타입별 한글 이름
const BOARD_TYPE_NAMES: Record<string, string> = {
  REFUND: '환불 문의',
  MANAGER: '매니저 문의',
  SERVICE: '서비스 문의',
  ETC: '기타 문의',
} as const;

// 게시판 타입별 칩 색상
const BOARD_TYPE_COLORS: Record<
  string,
  'error' | 'primary' | 'info' | 'default'
> = {
  REFUND: 'error',
  MANAGER: 'primary',
  SERVICE: 'info',
  ETC: 'default',
} as const;

const BoardEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 게시글 상세 정보 조회
  useEffect(() => {
    const fetchBoardDetail = async () => {
      if (!id) return;
      try {
        const data = await boardManagement.fetchBoardDetail(Number(id));
        if (data) {
          setBoard(data);
          if (data.answer) {
            setAnswer(data.answer.content);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching board detail:', error);
        setLoading(false);
      }
    };

    if (loading) {
      fetchBoardDetail();
    }
  }, [id, boardManagement, loading]);

  // 답변 수정
  const handleSubmit = async () => {
    if (!id || !answer.trim()) return;
    setSubmitting(true);

    try {
      const result = await boardManagement.updateAnswer(Number(id), {
        content: answer.trim(),
      });

      if (result.success) {
        navigate(`${ROUTES.ADMIN.BOARD_DETAIL.replace(':id', id)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 취소
  const handleCancel = () => {
    navigate(`${ROUTES.ADMIN.BOARD_DETAIL.replace(':id', id || '')}`);
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

  if (!board) {
    return (
      <StyledContainer>
        <Typography variant="h6" color="error" align="center">
          게시글을 찾을 수 없습니다.
        </Typography>
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
        <Button startIcon={<ArrowBackIcon />} onClick={handleCancel}>
          돌아가기
        </Button>
      </Box>

      <StyledPaper>
        {/* 문의 유형 */}
        <Box mb={2}>
          <Chip
            label={BOARD_TYPE_NAMES[board.boardType]}
            color={BOARD_TYPE_COLORS[board.boardType]}
            size="small"
          />
        </Box>

        {/* 제목 */}
        <Typography variant="h5" component="h1" gutterBottom>
          {board.title}
        </Typography>

        <StyledDivider />

        {/* 내용 */}
        <Typography variant="body1" whiteSpace="pre-wrap" mb={3}>
          {board.content}
        </Typography>

        <StyledDivider />

        {/* 답변 수정 폼 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            답변 수정
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '저장'
              )}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              취소
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default BoardEdit;
