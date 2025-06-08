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

const UserList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 임시 데이터
  const users = [
    { id: 1, name: '홍길동', phone: '010-1234-5678', uuid: 'a1b2c3d4-e5f6-g7h8-i9j0' },
    { id: 2, name: '김철수', phone: '010-8765-4321', uuid: 'k1l2m3n4-o5p6-q7r8-s9t0' },
  ];

  const managers = [
    { id: 1, name: '이영희', phone: '010-9999-8888', rating: 4.5 },
    { id: 2, name: '박지성', phone: '010-7777-6666', rating: 4.8 },
  ];

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        회원 관리
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="수요자" />
          <Tab label="매니저" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="이름 또는 전화번호로 검색"
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
                <TableCell>이름</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{user.uuid}</TableCell>
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
            placeholder="이름 또는 전화번호로 검색"
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
                <TableCell>이름</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>평점</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>{manager.name}</TableCell>
                  <TableCell>{manager.phone}</TableCell>
                  <TableCell>{manager.rating}</TableCell>
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

export default UserList; 