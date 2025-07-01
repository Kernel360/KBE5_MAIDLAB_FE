import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Button,
  TablePagination,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { type ReservationListResponse } from '@/types/reservation';
import { type MatchingResponse } from '@/types/matching';
import { adminApi } from '../../apis/admin';
import MatchingChangeDialog from '../../components/features/admin/MatchingChangeDialog';
import type { TabPanelProps } from '@/types/userList';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ReservationList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(() => {
    // 1. localStorage에서 값을 먼저 확인
    const savedTab = localStorage.getItem('adminReservationTab');
    if (savedTab !== null) {
      localStorage.removeItem('adminReservationTab');
      return parseInt(savedTab, 10);
    }
    // 2. location.state 확인
    return (location.state as { previousTab?: number })?.previousTab ?? 0;
  });
  const [reservations, setReservations] = useState<ReservationListResponse[]>(
    [],
  );
  const [matchings, setMatchings] = useState<MatchingResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMatching, setSelectedMatching] =
    useState<MatchingResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservationsData, matchingsData] = await Promise.all([
          adminApi.getReservations(),
          adminApi.getAllMatching(),
        ]);
        setReservations(reservationsData);
        setMatchings(matchingsData);
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    handleCloseDialog();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };

  const formatPrice = (price: number | string) => {
    const numericPrice =
      typeof price === 'string' ? parseInt(price, 10) : price;
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(numericPrice);
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'matched':
        return 'info';
      case 'paid':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = (matching: MatchingResponse) => {
    setSelectedMatching(matching);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMatching(null);
  };

  const handleConfirmChange = async (managerId: number) => {
    if (!selectedMatching) return;

    try {
      // adminApi.changeManager는 객체 형태의 파라미터를 받습니다
      await adminApi.changeManager({
        reservationId: selectedMatching.reservationId,
        managerId: managerId,
      });
      // 매칭 목록 새로고침
      const matchingsData = await adminApi.getAllMatching();
      setMatchings(matchingsData);
      handleCloseDialog();
    } catch (error) {
      console.error('매니저 변경 실패:', error);
    }
  };

  const handleDetailView = (reservationId: number) => {
    // 현재 탭 상태를 localStorage에 저장
    localStorage.setItem('adminReservationTab', tabValue.toString());
    navigate(`/admin/reservations/${reservationId}`);
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1">
          예약/매칭 관리
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="예약/매칭 관리 탭"
        >
          <Tab label="예약 목록" />
          <Tab label="매칭 관리" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>예약 ID</TableCell>
                <TableCell>서비스 유형</TableCell>
                <TableCell>상세 서비스</TableCell>
                <TableCell>예약 일시</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((reservation) => (
                  <TableRow key={reservation.reservationId}>
                    <TableCell>{reservation.reservationId}</TableCell>
                    <TableCell>{reservation.serviceType}</TableCell>
                    <TableCell>{reservation.detailServiceType}</TableCell>
                    <TableCell>
                      {formatDateTime(
                        reservation.reservationDate,
                        reservation.startTime,
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(reservation.totalPrice)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleDetailView(reservation.reservationId)
                        }
                      >
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={reservations.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>예약 ID</TableCell>
                <TableCell>매니저 ID</TableCell>
                <TableCell>매칭 상태</TableCell>
                <TableCell>매니저 변경</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchings
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((matching) => (
                  <TableRow key={matching.reservationId}>
                    <TableCell>{matching.reservationId}</TableCell>
                    <TableCell>{matching.managerId}</TableCell>
                    <TableCell>
                      <Chip
                        label={matching.matchingStatus}
                        color={getStatusChipColor(matching.matchingStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={matching.matchingStatus.toLowerCase() === 'pending'}
                        onClick={() => handleOpenDialog(matching)}
                      >
                        매니저 변경
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={matchings.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />

        <MatchingChangeDialog
          open={openDialog}
          matching={selectedMatching}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmChange}
        />
      </TabPanel>
    </StyledContainer>
  );
};

export default ReservationList;
