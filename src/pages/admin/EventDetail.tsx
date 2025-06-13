import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import type { EventResponseDto } from '@/apis/event';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
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

const ContentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  whiteSpace: 'pre-wrap',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
}));

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchEventDetail } = useEvent();
  const [event, setEvent] = useState<EventResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      
      try {
        const eventData = await fetchEventDetail(Number(id));
        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('이벤트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, fetchEventDetail]);

  const handleEdit = () => {
    if (id) {
      navigate(ROUTES.ADMIN.EVENT_EDIT.replace(':id', id));
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (!event) {
    return (
      <StyledContainer>
        <Typography variant="h6" align="center">
          이벤트를 찾을 수 없습니다.
        </Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.ADMIN.EVENTS)}
        >
          목록으로
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{
            backgroundColor: '#FF7F50',
            '&:hover': { backgroundColor: '#FF6347' },
          }}
        >
          수정
        </Button>
      </Box>

      <StyledPaper>
        <Typography variant="h5" component="h1" gutterBottom>
          {event.title}
        </Typography>

        <StyledDivider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Typography variant="body2" color="text.secondary">
            생성일: {formatDate(event.createdAt)}
          </Typography>
          {event.updatedAt && (
            <Typography variant="body2" color="text.secondary">
              수정일: {formatDate(event.updatedAt)}
            </Typography>
          )}
        </Stack>

        <StyledDivider />

        {event.mainImageUrl && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              메인 이미지
            </Typography>
            <ImageContainer>
              <img src={event.mainImageUrl} alt="이벤트 메인 이미지" />
            </ImageContainer>
          </Box>
        )}

        {event.imageUrl && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              상세 이미지
            </Typography>
            <ImageContainer>
              <img src={event.imageUrl} alt="이벤트 상세 이미지" />
            </ImageContainer>
          </Box>
        )}

        {(event.mainImageUrl || event.imageUrl) && <StyledDivider />}

        <Box>
          <ContentSection>
            <Typography variant="body1">
              {event.content || '이벤트 내용이 없습니다.'}
            </Typography>
          </ContentSection>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default EventDetail; 