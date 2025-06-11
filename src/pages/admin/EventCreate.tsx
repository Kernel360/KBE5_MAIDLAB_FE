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
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

const EventCreate = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvent();
  const mainImageUpload = useFileUpload(1);
  const imageUpload = useFileUpload(1);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mainImageUpload.files.length === 0) {
      alert('메인 이미지를 업로드해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // 이미지 업로드 로직은 실제 서버 구현에 맞게 수정 필요
      const mainImageUrl = mainImageUpload.files[0] ? URL.createObjectURL(mainImageUpload.files[0]) : '';
      const imageUrl = imageUpload.files[0] ? URL.createObjectURL(imageUpload.files[0]) : '';

      const result = await createEvent({
        title: formData.title,
        mainImageUrl,
        imageUrl,
        content: formData.content,
      });

      if (result.success) {
        navigate(ROUTES.ADMIN.EVENTS);
      }
    } catch (error) {
      console.error('이벤트 생성 실패:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData, mainImageUpload.files, imageUpload.files, createEvent, navigate]);

  const handleCancel = useCallback(() => {
    if (window.confirm('작성을 취소하시겠습니까?')) {
      navigate(ROUTES.ADMIN.EVENTS);
    }
  }, [navigate]);

  return (
    <StyledContainer maxWidth="md">
      <Box mb={4}>
        <Typography variant="h5" component="h1">
          이벤트 생성
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
              메인 이미지 *
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && mainImageUpload.addFiles(e.target.files)}
            />
            {mainImageUpload.previews[0] && (
              <ImagePreview src={mainImageUpload.previews[0]} alt="메인 이미지 미리보기" />
            )}
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              상세 이미지 (선택)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && imageUpload.addFiles(e.target.files)}
            />
            {imageUpload.previews[0] && (
              <ImagePreview src={imageUpload.previews[0]} alt="상세 이미지 미리보기" />
            )}
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              label="이벤트 내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
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
              {submitting ? <CircularProgress size={24} /> : '생성'}
            </Button>
          </Box>
        </form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default EventCreate; 