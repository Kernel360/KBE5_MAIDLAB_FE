import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBoard } from '@/hooks';
import { ROUTES } from '@/constants';
import type { ConsumerBoardDetailResponseDto } from '@/apis/admin';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ImagePreview = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// 게시판 타입별 한글 이름
const BOARD_TYPE_NAMES = {
  REFUND: '환불 문의',
  MANAGER: '매니저 문의',
  SERVICE: '서비스 문의',
  ETC: '기타 문의',
} as const;

// 게시판 타입별 칩 색상
const BOARD_TYPE_COLORS = {
  REFUND: 'error',
  MANAGER: 'primary',
  SERVICE: 'info',
  ETC: 'default',
} as const;

const BoardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBoardDetail, answerBoard } = useBoard();
  const [board, setBoard] = useState<ConsumerBoardDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 게시글 상세 정보 조회
  useEffect(() => {
    const loadBoardDetail = async () => {
      if (!id) return;
      
      try {
        const data = await fetchBoardDetail(Number(id));
        if (data) {
          setBoard(data);
          if (data.answer) {
            setAnswer(data.answer.content);
          }
        }
      } catch (error) {
        console.error('Failed to load board detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBoardDetail();
  }, [id, fetchBoardDetail]);

  // 목록으로 돌아가기
  const handleBack = () => {
    navigate(ROUTES.ADMIN.BOARD_LIST);
  };

  // 이미지 모달 열기
  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  // 이미지 모달 닫기
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // 답변 등록 처리
  const handleSubmitAnswer = async () => {
    if (!id || !answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const success = await answerBoard(Number(id), answer);
      if (success) {
        // 게시글 상세 정보 새로고침
        const updatedBoard = await fetchBoardDetail(Number(id));
        if (updatedBoard) {
          setBoard(updatedBoard);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (!board) {
    return (
      <StyledContainer>
        <Typography variant="h6" color="error">
          게시글을 찾을 수 없습니다.
        </Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          게시글 상세
        </Typography>
      </Box>

      <ContentPaper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{board.title}</Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={BOARD_TYPE_NAMES[board.boardType]}
              color={BOARD_TYPE_COLORS[board.boardType]}
              size="small"
            />
            <Chip
              label={board.answered ? '답변 완료' : '답변 대기'}
              color={board.answered ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </Box>

        <Typography variant="body1" whiteSpace="pre-wrap" mb={3}>
          {board.content}
        </Typography>

        {board.images && board.images.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              첨부 이미지
            </Typography>
            <ImageList cols={3} gap={8}>
              {board.images.map((image, index) => (
                <ImageListItem
                  key={index}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleImageClick(image.imagePath)}
                >
                  <ImagePreview
                    src={image.imagePath}
                    alt={image.name}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            답변
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            disabled={board?.answered || submitting}
          />
          {!board?.answered && (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
              >
                {submitting ? '등록 중...' : '답변 등록'}
              </Button>
            </Box>
          )}
        </Box>
      </ContentPaper>

      <Dialog open={!!selectedImage} onClose={handleCloseImage} maxWidth="md" fullWidth>
        <DialogTitle>이미지 보기</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box display="flex" justifyContent="center">
              <img
                src={selectedImage}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage}>닫기</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default BoardDetail; 