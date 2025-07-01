import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// API 및 타입 import
import type { ConsumerListResponse } from '@/types/admin';
import { adminApi } from '../../apis/admin';
import { 
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  USER_TYPES
} from '../../constants/admin';

// MUI 컴포넌트들
import { 
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
  CircularProgress
} from '@mui/material';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

// 클릭 가능한 테이블 행 스타일
const ClickableTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ConsumerList = () => {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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

  useEffect(() => {
    fetchConsumers();
  }, [page, rowsPerPage]);

  const handleRowClick = (id: number) => {
    navigate(`/admin/${USER_TYPES.CONSUMER}/${id}`);
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
        onClick={() => handleRowClick(consumer.id)}
      >
        <TableCell>{consumer.id}</TableCell>
        <TableCell>{consumer.name}</TableCell>
        <TableCell>{consumer.phoneNumber}</TableCell>
      </ClickableTableRow>
    ));
  };

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        수요자 관리
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
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
    </StyledContainer>
  );
};

export default ConsumerList;