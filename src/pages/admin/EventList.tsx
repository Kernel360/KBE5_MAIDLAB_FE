import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF7F50',
  '&:hover': {
    backgroundColor: '#FF6347',
  },
}));

const EventList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 임시 이벤트 데이터
  const events = [
    {
      id: 1,
      title: '봄맞이 대청소 이벤트',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      status: '진행중',
      discount: '20%',
    },
    {
      id: 2,
      title: '신규 고객 특별 할인',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      status: '예정',
      discount: '15%',
    },
  ];

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        이벤트 관리
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <SearchBox sx={{ flex: 1, mr: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="이벤트명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <SearchButton variant="contained">
            검색
          </SearchButton>
        </SearchBox>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          새 이벤트 등록
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이벤트명</TableCell>
              <TableCell>시작일</TableCell>
              <TableCell>종료일</TableCell>
              <TableCell>할인율</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.startDate}</TableCell>
                <TableCell>{event.endDate}</TableCell>
                <TableCell>{event.discount}</TableCell>
                <TableCell>{event.status}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small">
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                    >
                      삭제
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledContainer>
  );
};

export default EventList; 