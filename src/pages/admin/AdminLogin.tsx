import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import React from 'react';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '400px',
  margin: '0 auto',
  marginTop: theme.spacing(8),
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  backgroundColor: '#FF7F50',
  '&:hover': {
    backgroundColor: '#FF6347',
  },
}));

const AdminLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // useAdminAuth 훅에서 필요한 것들 가져오기
  const { login, loading, isAuthenticated } = useAdminAuth();

  const navigate = useNavigate();

  // 인증 성공 시 자동 이동
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 인증된 상태면 아무것도 렌더링하지 않음(무한루프 방지)
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // login 함수 호출 (async/await 사용)
      const result = await login({
        adminKey: id,
        password: password,
      });

      // 로그인 실패시 오류 출력
      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', error);
    }
  };

  return (
    <Container component="main">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h5" sx={{ color: '#333' }}>
          MAIDLAB 관리자
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <StyledForm onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={loading}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <LoginButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
};

export default AdminLogin;
