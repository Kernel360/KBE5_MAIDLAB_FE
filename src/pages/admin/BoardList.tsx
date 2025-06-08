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
  Chip,
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

const BoardList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 임시 환불 게시글 데이터
  const refundPosts = [
    {
      id: 1,
      title: '예약금 환불 요청',
      author: '홍길동',
      date: '2024-03-20',
      status: '처리중',
      amount: '50,000원',
    },
    {
      id: 2,
      title: '서비스 불만족으로 인한 환불',
      author: '김철수',
      date: '2024-03-19',
      status: '완료',
      amount: '100,000원',
    },
  ];

  // 임시 상담 게시글 데이터
  const consultPosts = [
    {
      id: 1,
      title: '서비스 이용 문의',
      author: '이영희',
      date: '2024-03-20',
      status: '답변대기',
      category: '이용방법',
    },
    {
      id: 2,
      title: '매니저 변경 요청',
      author: '박지성',
      date: '2024-03-19',
      status: '답변완료',
      category: '매니저',
    },
  ];

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case '처리중':
      case '답변대기':
        color = 'warning';
        break;
      case '완료':
      case '답변완료':
        color = 'success';
        break;
      default:
        color = 'default';
    }

    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        게시판 관리
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="환불" />
          <Tab label="상담" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="제목 또는 작성자로 검색"
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
                <TableCell>제목</TableCell>
                <TableCell>작성자</TableCell>
                <TableCell>환불금액</TableCell>
                <TableCell>작성일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refundPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.amount}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{getStatusChip(post.status)}</TableCell>
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
            placeholder="제목 또는 작성자로 검색"
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
                <TableCell>제목</TableCell>
                <TableCell>작성자</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell>작성일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{getStatusChip(post.status)}</TableCell>
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

export default BoardList; 