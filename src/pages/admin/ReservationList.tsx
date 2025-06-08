import { useState } from 'react';
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
  Tabs,
  Tab,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReservationList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 임시 예약 데이터
  const reservations = [
    {
      id: 1,
      customerName: '홍길동',
      date: '2024-03-20',
      time: '14:00',
      status: '예약 완료',
      address: '서울시 강남구',
    },
    {
      id: 2,
      customerName: '김철수',
      date: '2024-03-21',
      time: '10:00',
      status: '예약 대기',
      address: '서울시 서초구',
    },
  ];

  // 임시 매칭 데이터
  const matchings = [
    {
      id: 1,
      customerName: '홍길동',
      managerName: '이영희',
      date: '2024-03-20',
      time: '14:00',
      status: '매칭 완료',
    },
    {
      id: 2,
      customerName: '김철수',
      managerName: '박지성',
      date: '2024-03-21',
      time: '10:00',
      status: '매칭 진행중',
    },
  ];

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        예약 관리
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="예약" />
          <Tab label="매칭" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="고객명 또는 주소로 검색"
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>고객명</TableCell>
                <TableCell>날짜</TableCell>
                <TableCell>시간</TableCell>
                <TableCell>주소</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.customerName}</TableCell>
                  <TableCell>{reservation.date}</TableCell>
                  <TableCell>{reservation.time}</TableCell>
                  <TableCell>{reservation.address}</TableCell>
                  <TableCell>{reservation.status}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small">
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="고객명 또는 매니저명으로 검색"
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>고객명</TableCell>
                <TableCell>매니저명</TableCell>
                <TableCell>날짜</TableCell>
                <TableCell>시간</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchings.map((matching) => (
                <TableRow key={matching.id}>
                  <TableCell>{matching.customerName}</TableCell>
                  <TableCell>{matching.managerName}</TableCell>
                  <TableCell>{matching.date}</TableCell>
                  <TableCell>{matching.time}</TableCell>
                  <TableCell>{matching.status}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small">
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </StyledContainer>
  );
};

export default ReservationList; 