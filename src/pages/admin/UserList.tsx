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
import { Box, Container, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Button, TextField, InputAdornment, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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

const FilterBox = styled(Box)(({ theme }) => ({
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

type ManagerStatusFilter = ManagerVerificationStatus | 'ALL';

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
  const [selectedStatus, setSelectedStatus] = useState<ManagerStatusFilter>(() => {
    const savedStatus = localStorage.getItem('adminManagerStatus');
    return (savedStatus as ManagerStatusFilter) || 'ALL';
  });
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
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as ManagerStatusFilter;
    setSelectedStatus(newStatus);
    localStorage.setItem('adminManagerStatus', newStatus);
    setPage(0);
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getConsumers({ 
        page, 
        size: rowsPerPage,
        search: searchTerm
      });
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
      let response;
      
      if (selectedStatus === 'ALL') {
        response = await adminApi.getManagers({ 
          page, 
          size: rowsPerPage,
          search: searchTerm
        });
        setManagerData(response);
      } else {
        const statusResponse = await adminApi.getManagersByStatus({ 
          page, 
          size: rowsPerPage,
          status: selectedStatus
        });
        response = statusResponse.data;
        setManagerData(response);
      }

      // 각 매니저의 상세 정보를 가져옵니다
      const detailsPromises = response.content
        .map(async (manager: ManagerListResponseDto) => {
          try {
            const details = await adminApi.getManager(manager.id);
            return { id: manager.id, details };
          } catch (error) {
            console.error(`Failed to fetch manager details for ID ${manager.id}:`, error);
            return null;
          }
        });

      const details = await Promise.all(detailsPromises);
      const detailsMap = details.reduce((acc: Record<number, ManagerResponseDto>, curr: { id: number; details: ManagerResponseDto } | null) => {
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
  }, [tabValue, page, rowsPerPage, searchTerm, selectedStatus]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleDetailView = (type: 'consumer' | 'manager', id: number) => {
    localStorage.setItem('adminUserTab', tabValue.toString());
    localStorage.setItem('adminManagerStatus', selectedStatus);
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

    return consumerData.content.map((consumer) => (
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

    return managerData.content.map((manager) => {
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
          count={consumerData.totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FilterBox>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              label="상태"
            >
              <MenuItem value="ALL">전체</MenuItem>
              {Object.entries(MANAGER_VERIFICATION_STATUS).map(([key, value]) => (
                <MenuItem key={value} value={value}>
                  {MANAGER_VERIFICATION_LABELS[value as ManagerVerificationStatus]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FilterBox>

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
          count={managerData.totalElements}
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
