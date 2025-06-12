import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '@/hooks';
import { ROUTES } from '@/constants';
import { useFileUpload } from '@/hooks';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ImagePreview = styled('img')({
  width: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
});

const EventEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEvent, fetchEventDetail } = useEvent();
  const mainImageUpload = useFileUpload(1);
  const imageUpload = useFileUpload(1);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mainImageUrl: '',
    imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 이벤트 데이터 불러오기
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      
      try {
        const eventData = await fetchEventDetail(Number(id));
        if (eventData) {
          setFormData({
            title: eventData.title,
            content: eventData.content || '',
            mainImageUrl: eventData.mainImageUrl || '',
            imageUrl: eventData.imageUrl || '',
          });
        }
      } catch (error) {
        console.error('이벤트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, fetchEventDetail]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleMainImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      mainImageUpload.addFiles(e.target.files);
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, mainImageUrl: url }));
    }
  }, [mainImageUpload]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      imageUpload.addFiles(e.target.files);
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }
  }, [imageUpload]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);

      const result = await updateEvent(Number(id), {
        title: formData.title,
        mainImageUrl: formData.mainImageUrl,
        imageUrl: formData.imageUrl,
        content: formData.content,
      });

      if (result.success) {
        navigate(ROUTES.ADMIN.EVENTS);
      }
    } catch (error) {
      console.error('이벤트 수정 실패:', error);
    } finally {
      setSubmitting(false);
    }
  }, [id, formData, updateEvent, navigate]);

  const handleCancel = useCallback(() => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(ROUTES.ADMIN.EVENTS);
    }
  }, [navigate]);

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          이벤트 수정
        </Typography>
      </Box>

      <StyledPaper>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="이벤트 제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              메인 이미지
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
            />
            {formData.mainImageUrl && (
              <ImagePreview src={formData.mainImageUrl} alt="메인 이미지 미리보기" />
            )}
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              상세 이미지
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {formData.imageUrl && (
              <ImagePreview src={formData.imageUrl} alt="상세 이미지 미리보기" />
            )}
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="이벤트 내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: '#FF7F50',
                '&:hover': { backgroundColor: '#FF6347' },
              }}
            >
              {submitting ? <CircularProgress size={24} /> : '수정'}
            </Button>
          </Box>
        </form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default EventEdit; 