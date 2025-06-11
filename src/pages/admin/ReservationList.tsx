import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { type ReservationResponseDto } from '../../apis/reservation';
import { type MatchingResponseDto } from '../../apis/matching';
import { adminApi } from '../../apis/admin';
import MatchingChangeDialog from '../../components/admin/MatchingChangeDialog';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
  const [matchings, setMatchings] = useState<MatchingResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMatching, setSelectedMatching] = useState<MatchingResponseDto | null>(null);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFilteredReservations = () => {
    if (!searchTerm) return reservations;

    const searchTermLower = searchTerm.toLowerCase();
    return reservations.filter(
      (reservation) =>
        reservation.serviceType.toLowerCase().includes(searchTermLower) ||
        reservation.detailServiceType.toLowerCase().includes(searchTermLower)
    );
  };

  const getFilteredMatchings = () => {
    if (!searchTerm) return matchings;

    const searchTermLower = searchTerm.toLowerCase();
    return matchings.filter(
      (matching) =>
        matching.matchingStatus.toLowerCase().includes(searchTermLower)
    );
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'matched':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = (matching: MatchingResponseDto) => {
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
      await adminApi.changeManager(selectedMatching.reservationId, managerId);
      // 매칭 목록 새로고침
      const matchingsData = await adminApi.getAllMatching();
      setMatchings(matchingsData);
      handleCloseDialog();
    } catch (error) {
      console.error('매니저 변경 실패:', error);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          예약/매칭 관리
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="예약/매칭 관리 탭">
          <Tab label="예약 목록" />
          <Tab label="매칭 관리" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <StyledSearchField
          fullWidth
          variant="outlined"
          placeholder="서비스 유형으로 검색"
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
              {getFilteredReservations()
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((reservation) => (
                  <TableRow key={reservation.reservationId}>
                    <TableCell>{reservation.reservationId}</TableCell>
                    <TableCell>{reservation.serviceType}</TableCell>
                    <TableCell>{reservation.detailServiceType}</TableCell>
                    <TableCell>
                      {formatDateTime(reservation.reservationDate, reservation.startTime)}
                    </TableCell>
                    <TableCell>{formatPrice(reservation.totalPrice)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/admin/reservations/${reservation.reservationId}`)}
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
          count={getFilteredReservations().length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <StyledSearchField
          fullWidth
          variant="outlined"
          placeholder="매칭 상태로 검색"
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
              {getFilteredMatchings()
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
          count={getFilteredMatchings().length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수"
        />
      </TabPanel>

      <MatchingChangeDialog
        open={openDialog}
        matching={selectedMatching}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmChange}
      />
    </StyledContainer>
  );
};

export default ReservationList; 