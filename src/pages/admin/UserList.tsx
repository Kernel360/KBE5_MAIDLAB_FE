import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

// API 및 기존 타입 import
import type { 
  ConsumerListResponse, 
  ManagerListResponse, 
  ManagerListItem, 
  AdminManagerDetail
} from '@/types/admin';
import { adminApi } from '../../apis/admin';
import { MANAGER_VERIFICATION_LABELS, MANAGER_VERIFICATION_STATUS, type ManagerVerificationStatus } from '../../constants/status';

// 새로 분리한 파일들 import
import { 
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  LOCAL_STORAGE_KEYS,
  STATUS_FILTER_OPTIONS,
  USER_TYPES,
  TAB_INDICES
} from '../../constants/admin';

import type { 
  TabPanelProps,
  ManagerStatusFilter,
  UserType,
  LocationState
} from '../../types/userList';

import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage
} from '@/utils/storage';

// MUI 컴포넌트들
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  Chip, 
  CircularProgress, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

// 클릭 가능한 테이블 행 스타일
const ClickableTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
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
  
  // 상수를 사용한 초기화
  const [tabValue, setTabValue] = useState(() => {
    const savedTab = getLocalStorage<number>(LOCAL_STORAGE_KEYS.ADMIN_USER_TAB);
    if (savedTab !== null) {
      removeLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_USER_TAB);
      return savedTab;
    }
    return (location.state as LocationState)?.previousTab ?? TAB_INDICES.CONSUMER;
  });
  
  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ManagerStatusFilter>(() => {
    const savedStatus = getLocalStorage<ManagerStatusFilter>(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS);
    return savedStatus || 'ALL';
  });
  
  const [consumerData, setConsumerData] = useState<ConsumerListResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: DEFAULT_PAGE_SIZE,
    number: DEFAULT_PAGE_NUMBER,
    numberOfElements: 0,
    first: true,
    last: false,
    empty: true,
  });
  
  const [managerData, setManagerData] = useState<ManagerListResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: DEFAULT_PAGE_SIZE,
    number: DEFAULT_PAGE_NUMBER,
    numberOfElements: 0,
    first: true,
    last: false,
    empty: true,
  });
  
  const [managerDetails, setManagerDetails] = useState<Record<number, AdminManagerDetail>>({});

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as ManagerStatusFilter;
    setSelectedStatus(newStatus);
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS, newStatus);
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getConsumers({ 
        page, 
        size: rowsPerPage,
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
      
      if (selectedStatus === STATUS_FILTER_OPTIONS.ALL) {
        response = await adminApi.getManagers({ 
          page, 
          size: rowsPerPage,
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

      const detailsPromises = response.content
        .map(async (manager: ManagerListItem) => {
          try {
            const details = await adminApi.getManager(manager.id);
            return { id: manager.id, details };
          } catch (error) {
            console.error(`Failed to fetch manager details for ID ${manager.id}:`, error);
            return null;
          }
        });

      const details = await Promise.all(detailsPromises);
      const detailsMap = details.reduce((acc: Record<number, AdminManagerDetail>, curr: { id: number; details: AdminManagerDetail } | null) => {
        if (curr) {
          acc[curr.id] = curr.details;
        }
        return acc;
      }, {} as Record<number, AdminManagerDetail>);
      
      setManagerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === TAB_INDICES.CONSUMER) {
      fetchConsumers();
    } else {
      fetchManagers();
    }
  }, [tabValue, page, rowsPerPage, selectedStatus]);

  const handleRowClick = (type: UserType, id: number) => {
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_USER_TAB, tabValue);
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS, selectedStatus);
    navigate(`/admin/users/${type}/${id}`);
  };

  const renderConsumerRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    return consumerData.content.map((consumer) => (
      <ClickableTableRow 
        key={consumer.id}
        onClick={() => handleRowClick(USER_TYPES.CONSUMER, consumer.id)}
      >
        <TableCell>{consumer.id}</TableCell>
        <TableCell>{consumer.name}</TableCell>
        <TableCell>{consumer.phoneNumber}</TableCell>
      </ClickableTableRow>
    ));
  };

  const renderManagerRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    return managerData.content.map((manager) => {
      const details = managerDetails[manager.id];
      const verificationStatus = details?.isVerified as ManagerVerificationStatus;
      return (
        <ClickableTableRow 
          key={manager.uuid}
          onClick={() => handleRowClick(USER_TYPES.MANAGER, manager.id)}
        >
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
        </ClickableTableRow>
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

      <TabPanel value={tabValue} index={TAB_INDICES.CONSUMER}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>id</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>전화번호</TableCell>
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

      <TabPanel value={tabValue} index={TAB_INDICES.MANAGER}>
        <FilterBox>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              label="상태"
            >
              <MenuItem value={STATUS_FILTER_OPTIONS.ALL}>전체</MenuItem>
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