import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Chip,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useAdmin } from '@/hooks';
import type { AdminSettlementResponseDto } from '@/apis/admin';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const TotalAmountBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

const SettlementList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(dayjs().startOf('week'));
  const [settlements, setSettlements] = useState<AdminSettlementResponseDto[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const { reservationManagement } = useAdmin();

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const data = await reservationManagement.fetchWeeklySettlements(
        startDate.format('YYYY-MM-DD'),
        { page, size: rowsPerPage }
      );
      if (data) {
        setSettlements(data.settlements.content);
        setTotalAmount(data.totalAmount);
        setTotalElements(data.settlements.totalElements);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [page, rowsPerPage, startDate]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Typography variant="h5" component="h1" gutterBottom>
        정산 관리
      </Typography>

      <StyledPaper>
        <Box mb={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="시작 날짜 선택"
              value={startDate}
              onChange={(newValue) => newValue && setStartDate(newValue)}
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
        </Box>

        <TotalAmountBox>
          <Typography variant="h6">이번 주 총 정산 금액</Typography>
          <Typography variant="h4">{formatPrice(totalAmount)}</Typography>
        </TotalAmountBox>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>매니저</TableCell>
                <TableCell>서비스 유형</TableCell>
                <TableCell>상세 서비스</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">금액</TableCell>
                <TableCell>생성일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settlements.map((settlement) => (
                <TableRow key={settlement.settlementId}>
                  <TableCell>{settlement.managerName}</TableCell>
                  <TableCell>{settlement.serviceType}</TableCell>
                  <TableCell>{settlement.serviceDetailType}</TableCell>
                  <TableCell>
                    <Chip
                      label={settlement.status}
                      color={getStatusChipColor(settlement.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{formatPrice(settlement.amount)}</TableCell>
                  <TableCell>{settlement.createdAt}</TableCell>
                </TableRow>
              ))}
              {settlements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    정산 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={totalElements === 0 ? 0 : page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
          disabled={totalElements === 0}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default SettlementList; 