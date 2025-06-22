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
import type { EventDetailResponse } from '@/types/event';
import type { UploadResult, PresignedUrlResponse } from '@/types/admin';

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
  const [eventData, setEventData] = useState<EventDetailResponse | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // S3 presigned URL 요청 함수
  const getPresignedUrls = async (
    filenames: string[],
  ): Promise<PresignedUrlResponse[]> => {
    const response = await fetch(
      'http://localhost:8080/api/files/presigned-urls',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filenames: filenames,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Presigned URL 요청 실패');
    }

    const data = await response.json();
    return data.data;
  };

  // S3에 파일 업로드 함수
  const uploadFileToS3 = async (
    presignedUrl: string,
    file: File,
  ): Promise<Response> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('S3 업로드 실패');
    }

    return response;
  };

  // 파일 업로드 및 URL 반환 함수
  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    if (!files || files.length === 0) return [];

    const filenames = Array.from(files).map((file) => file.name);

    try {
      // 1. Presigned URL 요청
      const presignedUrls = await getPresignedUrls(filenames);

      // 2. S3에 파일 업로드
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const presignedData = presignedUrls[index];
        await uploadFileToS3(presignedData.url, file);

        return {
          originalName: file.name,
          storedKey: presignedData.key,
          size: file.size,
          type: file.type,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  };

  // 이벤트 데이터 불러오기
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;

      try {
        const eventData1 = await fetchEventDetail(Number(id));
        if (eventData1) {
          setEventData(eventData1);
          setFormData({
            title: eventData1.title,
            content: eventData1.content || '',
            mainImageUrl: eventData1.mainImageUrl || '',
            imageUrl: eventData1.imageUrl || '',
          });
          setMainImagePreview(eventData1.mainImageUrl || '');
          setImagePreview(eventData1.imageUrl || '');
        }
      } catch (error) {
        console.error('이벤트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, fetchEventDetail]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleMainImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        mainImageUpload.addFiles(e.target.files);
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setMainImagePreview(previewUrl);
      }
    },
    [mainImageUpload],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        imageUpload.addFiles(e.target.files);
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    },
    [imageUpload],
  );

  // 컴포넌트 언마운트 시 URL.createObjectURL로 생성한 URL 해제
  useEffect(() => {
    return () => {
      if (mainImagePreview && !mainImagePreview.startsWith('http')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [mainImagePreview, imagePreview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;

      try {
        setSubmitting(true);

        // 업로드할 파일들 수집
        const filesToUpload: File[] = [];
        const mainImageFile = mainImageUpload.files[0];
        const detailImageFile = imageUpload.files[0];

        if (mainImageFile) filesToUpload.push(mainImageFile);
        if (detailImageFile) filesToUpload.push(detailImageFile);

        let mainImageUrlToSend = eventData?.mainImageUrl || '';
        let imageUrlToSend = eventData?.imageUrl || '';

        // 새로운 파일이 있는 경우 S3에 업로드
        if (filesToUpload.length > 0) {
          const uploadResults = await uploadFiles(filesToUpload);

          if (mainImageFile) {
            mainImageUrlToSend =
              'https://d1llec2m3tvk5i.cloudfront.net/' +
              uploadResults[0].storedKey;
          }

          if (detailImageFile) {
            imageUrlToSend =
              'https://d1llec2m3tvk5i.cloudfront.net/' +
              uploadResults[filesToUpload.indexOf(detailImageFile)].storedKey;
          }
        }

        const result = await updateEvent(Number(id), {
          title: formData.title,
          mainImageUrl: mainImageUrlToSend,
          imageUrl: imageUrlToSend,
          content: formData.content,
        });

        if (result.success) {
          navigate(ROUTES.ADMIN.EVENTS);
        }
      } catch (error) {
        console.error('이벤트 수정 실패:', error);
        alert('이벤트 수정 중 오류가 발생했습니다.');
      } finally {
        setSubmitting(false);
      }
    },
    [
      id,
      formData,
      eventData,
      mainImageUpload,
      imageUpload,
      updateEvent,
      navigate,
    ],
  );

  const handleCancel = useCallback(() => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(ROUTES.ADMIN.EVENTS);
    }
  }, [navigate]);

  if (loading) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
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
            {mainImagePreview && (
              <ImagePreview src={mainImagePreview} alt="메인 이미지 미리보기" />
            )}
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              상세 이미지
            </Typography>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imagePreview && (
              <ImagePreview src={imagePreview} alt="상세 이미지 미리보기" />
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
              required
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={handleCancel}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
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
