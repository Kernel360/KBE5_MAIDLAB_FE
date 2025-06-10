
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // login 함수 호출 (async/await 사용)
      const result = await login({
        adminKey: id,
        password: password,
      });

      // 로그인 성공시 페이지 이동
      if (result.success) {
        const from = (location.state as { from?: Location })?.from?.pathname || '/admin/users';
        navigate(from);
      } else {
        // 로그인 실패시 에러 표시 (이미 토스트로 표시되지만 추가로 표시하고 싶다면)
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // 예상치 못한 에러 처리
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