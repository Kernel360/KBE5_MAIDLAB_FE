import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/hooks';
import { ROUTES } from '@/constants';
import { BOARD_TYPE_NAMES, BOARD_TYPE_COLORS } from '@/constants/admin';
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

const ImageContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  '& img': {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
  },
});

const BoardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // 목록으로 돌아가기
  const handleBack = () => {
    navigate(ROUTES.ADMIN.BOARDS);
  };

  // 이미지 모달 열기
  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  // 이미지 모달 닫기
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // 답변 등록/수정
  const handleSubmitAnswer = async () => {
    if (!id || !answer.trim()) return;
    setSubmitting(true);

    try {
      let result;
      if (isEditing && board?.answer) {
        // 답변 수정
        result = await boardManagement.updateAnswer(Number(id), {
          content: answer.trim(),
        });
      } else {
        // 답변 등록
        result = await boardManagement.createAnswer(Number(id), {
          content: answer.trim(),
        });
      }

      if (result.success) {
        // 답변 등록/수정 후 게시글 정보 새로고침
        const data = await boardManagement.fetchBoardDetail(Number(id));
        if (data) {
          setBoard(data);
          setIsEditing(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 답변 수정 취소
  const handleCancelEdit = () => {
    if (board?.answer) {
      setAnswer(board.answer.content);
    }
    setIsEditing(false);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 작성자 정보 구분 함수
  const getAuthorInfo = () => {
    if (board?.consumerName) {
      return {
        name: board.consumerName,
        type: '사용자',
        color: 'primary' as const,
      };
    } else if (board?.managerName) {
      return {
        name: board.managerName,
        type: '매니저',
        color: 'secondary' as const,
      };
    }
    return {
      name: '익명',
      type: '',
      color: 'default' as const,
    };
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
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          목록으로
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

        {/* 제목과 작성자/시간 */}
        <Box mb={2}>
          <Typography variant="h5" component="h1" gutterBottom>
            {board.title}
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                작성자:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {getAuthorInfo().name}
              </Typography>
              {getAuthorInfo().type && (
                <Chip
                  label={getAuthorInfo().type}
                  color={getAuthorInfo().color}
                  size="small"
                  variant="outlined"
                  sx={{ height: '20px', fontSize: '0.7rem' }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {board.createdAt ? formatDate(board.createdAt) : '날짜 정보 없음'}
            </Typography>
          </Box>
        </Box>

        <StyledDivider />

        {/* 내용 */}
        <Typography variant="body1" whiteSpace="pre-wrap">
          {board.content}
        </Typography>

        {/* 이미지가 있는 경우 표시 */}
        {board.images && board.images.length > 0 && (
          <>
            <StyledDivider />
            <Box>
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
                    <ImageContainer>
                      <img src={image.imagePath} alt={image.name} />
                    </ImageContainer>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          </>
        )}

        <StyledDivider />

        {/* 답변 섹션 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            답변
          </Typography>

          {board.answer && !isEditing ? (
            // 답변이 있고 수정 모드가 아닌 경우
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box />
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() =>
                    navigate(
                      `${ROUTES.ADMIN.BOARD_EDIT.replace(':id', id || '')}`,
                    )
                  }
                >
                  수정
                </Button>
              </Box>
              <Typography variant="body1" whiteSpace="pre-wrap">
                {board.answer.content}
              </Typography>
            </>
          ) : (
            // 답변이 없거나 수정 모드인 경우
            <Box>
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
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEditing ? (
                    '수정'
                  ) : (
                    '등록'
                  )}
                </Button>
                {isEditing && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelEdit}
                  >
                    취소
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </StyledPaper>

      {/* 이미지 모달 */}
      <Dialog open={!!selectedImage} onClose={handleCloseImage} maxWidth="lg">
        <DialogTitle>이미지 보기</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="확대된 이미지"
              style={{ width: '100%', height: 'auto' }}
            />
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