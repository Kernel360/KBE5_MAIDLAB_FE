import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// API 및 타입 import
import type { 
  ManagerListResponse, 
  ManagerListItem, 
  AdminManagerDetail
} from '@/types/admin';
import { adminApi } from '../../apis/admin';
import { MANAGER_VERIFICATION_LABELS, MANAGER_VERIFICATION_STATUS, type ManagerVerificationStatus } from '../../constants/status';

import { 
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  LOCAL_STORAGE_KEYS,
  STATUS_FILTER_OPTIONS,
  USER_TYPES
} from '../../constants/admin';

import type { ManagerStatusFilter } from '../../types/userList';

import {
  getLocalStorage,
  setLocalStorage
} from '@/utils/storage';

// MUI 컴포넌트들
import { 
  Box, 
  Container, 
  Typography, 
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

const ManagerList = () => {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ManagerStatusFilter>(() => {
    const savedStatus = getLocalStorage<ManagerStatusFilter>(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS);
    return savedStatus || 'ALL';
  });
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

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

  const handleSortClick = () => {
    if (selectedStatus !== MANAGER_VERIFICATION_STATUS.APPROVED) return;

    setSortOrder((prev) => {
      if (prev === 'asc') return 'desc';
      if (prev === 'desc') return null;
      return 'asc';
    });
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
      } else if (selectedStatus === STATUS_FILTER_OPTIONS.APPROVED && sortOrder){        
        const statusResponse = await adminApi.getManagersByStatus({ 
          page, 
          size: rowsPerPage,
          status: selectedStatus,
          sortByRating: true,
          isDescending: sortOrder === 'desc',
        });
        response = statusResponse.data;
        setManagerData(response);
      } 
      else {
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
    fetchManagers();
  }, [page, rowsPerPage, selectedStatus, sortOrder]);

  const handleRowClick = (id: number) => {
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS, selectedStatus);
    navigate(`/admin/${USER_TYPES.MANAGER}/${id}`);
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
          onClick={() => handleRowClick(manager.id)}
        >
          <TableCell>{manager.id}</TableCell>
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
        매니저 관리
      </Typography>
      
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
              <TableCell>ID</TableCell>
              <TableCell>이름</TableCell>
              <TableCell onClick={handleSortClick} sx={{ cursor: selectedStatus === MANAGER_VERIFICATION_STATUS.APPROVED ? 'pointer' : 'default' }}>
                평점 {selectedStatus === MANAGER_VERIFICATION_STATUS.APPROVED && (sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '')}
              </TableCell> 
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
    </StyledContainer>
  );
};

export default ManagerList;