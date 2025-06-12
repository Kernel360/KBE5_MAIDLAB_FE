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
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import type { ConsumerBoardResponseDto } from '@/apis/admin';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

type BoardType = 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';

// 게시판 타입별 한글 이름
const BOARD_TYPE_NAMES: Record<BoardType, string> = {
  REFUND: '환불 문의',
  MANAGER: '매니저 문의',
  SERVICE: '서비스 문의',
  ETC: '기타 문의',
} as const;

// 게시판 타입별 칩 색상
const BOARD_TYPE_COLORS: Record<BoardType, 'error' | 'primary' | 'info' | 'default'> = {
  REFUND: 'error',
  MANAGER: 'primary',
  SERVICE: 'info',
  ETC: 'default',
} as const;

interface BoardWithId extends ConsumerBoardResponseDto {
  id: number;
}

// 탭 인덱스 타입
type TabType = 'consultation' | 'refund';

const BoardList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('adminBoardTab');
    if (savedTab !== null) {
      localStorage.removeItem('adminBoardTab');
      return savedTab as TabType;
    }
    return (location.state as { previousTab?: TabType })?.previousTab ?? 'consultation';
  });
  const [filteredBoards, setFilteredBoards] = useState<BoardWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();

  // 게시글 목록 조회
  const fetchBoardsByTab = async (tab: TabType) => {
    setLoading(true);
    try {
      let data: ConsumerBoardResponseDto[];
      if (tab === 'consultation') {
        data = await boardManagement.fetchConsultationBoards();
      } else if (tab === 'refund') {
        data = await boardManagement.fetchRefundBoards();
      } else {
        data = await boardManagement.fetchConsultationBoards();
      }
      setFilteredBoards(data as BoardWithId[]);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 조회
  useEffect(() => {
    fetchBoardsByTab(currentTab);
  }, [currentTab]);

  // 게시글 목록 필터링
  useEffect(() => {
    if (!filteredBoards) return;

    const filtered = filteredBoards.filter((board) => {
      return board.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredBoards(filtered);
  }, [searchTerm]);

  // 게시글 상세 페이지로 이동
  const handleViewDetail = (boardId: number) => {
    localStorage.setItem('adminBoardTab', currentTab);
    navigate(`${ROUTES.ADMIN.BOARD_DETAIL.replace(':id', boardId.toString())}`);
  };

  // 탭 변경 처리
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabType) => {
    setCurrentTab(newValue);
  };

  return (
    <StyledContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          게시판 관리
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="상담 문의" value="consultation" />
          <Tab label="환불 문의" value="refund" />
        </Tabs>
      </Box>

      <SearchBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="게시글 검색..."
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
      </SearchBox>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>유형</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>답변 상태</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredBoards.length > 0 ? (
              filteredBoards.map((board, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip
                      label={BOARD_TYPE_NAMES[board.boardType]}
                      color={BOARD_TYPE_COLORS[board.boardType]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{board.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={board.answered ? '답변 완료' : '답변 대기'}
                      color={board.answered ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="상세보기">
                      <ActionButton onClick={() => handleViewDetail(board.boardId)}>
                        <VisibilityIcon />
                      </ActionButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledContainer>
  );
};

export default BoardList; 