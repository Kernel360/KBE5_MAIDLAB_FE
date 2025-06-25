import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { adminApi } from '../../apis/admin';
import type { AdminManagerDetail } from '@/types/admin'

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

const ManagerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerData, setManagerData] =
    useState<AdminManagerDetail | null>(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        if (!id) return;
        const response = await adminApi.getManager(parseInt(id));
        setManagerData(response as unknown as AdminManagerDetail);
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

    fetchManagerData();
  }, [id]);

  const handleApprove = async () => {
    try {
      if (!id) return;
      await adminApi.approveManager(parseInt(id));
      // 데이터 새로고침
      const response = await adminApi.getManager(parseInt(id));
      setManagerData(response as unknown as AdminManagerDetail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '승인 처리에 실패했습니다.',
      );
    }
  };

  const handleReject = async () => {
    try {
      if (!id) return;
      await adminApi.rejectManager(parseInt(id));
      // 데이터 새로고침
      const response = await adminApi.getManager(parseInt(id));
      setManagerData(response as unknown as AdminManagerDetail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '거절 처리에 실패했습니다.',
      );
    }
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

  if (!managerData) {
    return (
      <StyledContainer>
        <Typography>매니저를 찾을 수 없습니다.</Typography>
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
          매니저 상세 정보
        </Typography>
        <StyledButton variant="contained" onClick={() => navigate(-1)}>
          목록으로
        </StyledButton>
      </Box>

      <StyledPaper>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  이름
                </Typography>
                <Typography variant="body1">{managerData.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  전화번호
                </Typography>
                <Typography variant="body1">
                  {managerData.phoneNumber}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  승인 상태
                </Typography>
                <Chip
                  label={
                    managerData.isVerified === 'PENDING'
                      ? '승인 대기'
                      : managerData.isVerified === 'APPROVED'
                        ? '승인됨'
                        : '거절됨'
                  }
                  color={
                    managerData.isVerified === 'PENDING'
                      ? 'warning'
                      : managerData.isVerified === 'APPROVED'
                        ? 'success'
                        : 'error'
                  }
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  평점
                </Typography>
                <Typography variant="body1">
                  {managerData.averageRate.toFixed(1)}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="subtitle2" color="textSecondary">
                  활동 지역
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {managerData.region.map((region) => (
                    <Chip key={region} label={region} size="small" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {managerData.isVerified === 'PENDING' && (
            <Box display="flex" gap={2}>
              <StyledButton variant="contained" onClick={handleApprove}>
                승인
              </StyledButton>
              <Button variant="outlined" color="error" onClick={handleReject}>
                거절
              </Button>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default ManagerDetail;
