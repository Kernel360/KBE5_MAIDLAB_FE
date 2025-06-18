import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { adminApi } from '../../apis/admin';
import type { ConsumerProfileResponse } from '@/types/consumer';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF7F50',
  '&:hover': {
    backgroundColor: '#FF6347',
  },
}));

const ConsumerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consumerData, setConsumerData] =
    useState<ConsumerProfileResponse | null>(null);

  useEffect(() => {
    const fetchConsumerData = async () => {
      try {
        if (!id) return;
        const data = await adminApi.getConsumer(parseInt(id));
        setConsumerData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConsumerData();
  }, [id]);

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

  if (error) {
    return (
      <StyledContainer>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <StyledButton variant="contained" onClick={() => navigate(-1)}>
          돌아가기
        </StyledButton>
      </StyledContainer>
    );
  }

  if (!consumerData) {
    return (
      <StyledContainer>
        <Typography>소비자를 찾을 수 없습니다.</Typography>
        <StyledButton variant="contained" onClick={() => navigate(-1)}>
          돌아가기
        </StyledButton>
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
          소비자 상세 정보
        </Typography>
        <StyledButton variant="contained" onClick={() => navigate(-1)}>
          목록으로
        </StyledButton>
      </Box>

      <StyledPaper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  이름
                </Typography>
                <Typography variant="body1">{consumerData.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  전화번호
                </Typography>
                <Typography variant="body1">
                  {consumerData.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  성별
                </Typography>
                <Typography variant="body1">
                  {consumerData.gender === 'MALE' ? '남성' : '여성'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  생년월일
                </Typography>
                <Typography variant="body1">{consumerData.birth}</Typography>
              </Grid>
              {consumerData.address && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    주소
                  </Typography>
                  <Typography variant="body1">
                    {consumerData.address}
                    {consumerData.detailAddress &&
                      ` ${consumerData.detailAddress}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </StyledPaper>
    </StyledContainer>
  );
};

export default ConsumerDetail;
