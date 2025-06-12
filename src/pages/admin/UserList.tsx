import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import type { 
  ConsumerListResponseDto, 
  PageConsumerListResponseDto, 
  PageManagerListResponseDto, 
  ManagerResponseDto,
  ManagerListResponseDto 
} from '../../apis/admin';
import { adminApi } from '../../apis/admin';
import { MANAGER_VERIFICATION_LABELS, MANAGER_VERIFICATION_STATUS, type ManagerVerificationStatus } from '../../constants/status';
import { Box, Container, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Button, TextField, InputAdornment, Chip, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(() => {
    const savedTab = localStorage.getItem('adminUserTab');
    if (savedTab !== null) {
      localStorage.removeItem('adminUserTab');
      return parseInt(savedTab, 10);
    }
    return (location.state as { previousTab?: number })?.previousTab ?? 0;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [consumerData, setConsumerData] = useState<PageConsumerListResponseDto>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true,
  });
  const [managerData, setManagerData] = useState<PageManagerListResponseDto>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true,
  });
  const [managerDetails, setManagerDetails] = useState<Record<number, ManagerResponseDto>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // 탭 변경 시 페이지 초기화
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getConsumers({ page, size: rowsPerPage });
      setConsumerData(response);
    } catch (error) {
      console.error('Failed to fetch consumers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getManagers({ page, size: rowsPerPage });
      setManagerData(response);

      // 각 매니저의 상세 정보를 가져옵니다
      const detailsPromises = response.content.map(async (manager) => {
        try {
          const details = await adminApi.getManager(manager.id);
          return { id: manager.id, details };
        } catch (error) {
          console.error(`Failed to fetch manager details for ID ${manager.id}:`, error);
          return null;
        }
      });

      const details = await Promise.all(detailsPromises);
      const detailsMap = details.reduce((acc, curr) => {
        if (curr) {
          acc[curr.id] = curr.details;
        }
        return acc;
      }, {} as Record<number, ManagerResponseDto>);
      
      setManagerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchConsumers();
    } else {
      fetchManagers();
    }
  }, [tabValue, page, rowsPerPage]);

  // 검색어에 따른 필터링 함수
  const getFilteredData = () => {
    if (!searchTerm) {
      return tabValue === 0 ? consumerData.content : managerData.content;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    if (tabValue === 0) {
      return consumerData.content.filter(
        (consumer) => 
          consumer.name.toLowerCase().includes(searchTermLower) ||
          consumer.phoneNumber.includes(searchTerm)
      );
    } else {
      return managerData.content.filter(
        (manager) => 
          manager.name.toLowerCase().includes(searchTermLower)
      );
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // 검색 시 첫 페이지로 이동
  };

  const filteredData = getFilteredData();
  const totalFilteredCount = filteredData.length;

  const handleDetailView = (type: 'consumer' | 'manager', id: number) => {
    localStorage.setItem('adminUserTab', tabValue.toString());
    navigate(`/admin/users/${type}/${id}`);
  };

  const renderConsumerRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    return (filteredData as ConsumerListResponseDto[])
      .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
      .map((consumer) => (
        <TableRow key={consumer.uuid}>
          <TableCell>{consumer.name}</TableCell>
          <TableCell>{consumer.phoneNumber}</TableCell>
          <TableCell>{consumer.uuid}</TableCell>
          <TableCell>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDetailView('consumer', consumer.id)}
            >
              상세보기
            </Button>
          </TableCell>
        </TableRow>
      ));
  };

  const renderManagerRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    return (filteredData as ManagerListResponseDto[])
      .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
      .map((manager) => {
        const details = managerDetails[manager.id];
        const verificationStatus = details?.isVerified as ManagerVerificationStatus;
        return (
          <TableRow key={manager.uuid}>
            <TableCell>{manager.name}</TableCell>
            <TableCell>
              {details?.averageRate ?? '-'}
            </TableCell>
            <TableCell>
              <Chip
                label={details ? MANAGER_VERIFICATION_LABELS[verificationStatus] : '불명'}
                color={verificationStatus === MANAGER_VERIFICATION_STATUS.APPROVED ? 'success' : 'default'}
                size="small"
              />
            </TableCell>
            <TableCell>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDetailView('manager', manager.id)}
              >
                상세보기
              </Button>
            </TableCell>
          </TableRow>
        );
      });
  };

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        회원 관리
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
            placeholder="이름으로 검색"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
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
              {renderConsumerRows()}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalFilteredCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="이름으로 검색"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </SearchBox>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>평점</TableCell>
                <TableCell>가입상태</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderManagerRows()}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalFilteredCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>
    </StyledContainer>
  );
};

export default UserList; 
