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
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { BOARD_TYPE_NAMES, BOARD_TYPE_COLORS } from '@/constants/admin';
import type { BoardResponse, BoardWithId } from '@/types/board';
import type { TabType } from '@/types/admin';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const ClickableTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.short,
  }),
}));

const BoardList = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('adminBoardTab');
    if (savedTab !== null) {
      localStorage.removeItem('adminBoardTab');
      return savedTab as TabType;
    }
    return (
      (location.state as { previousTab?: TabType })?.previousTab ??
      'consultation'
    );
  });
  const [filteredBoards, setFilteredBoards] = useState<BoardWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();

  // 게시글 목록 조회
  const fetchBoardsByTab = async (tab: TabType) => {
    setLoading(true);
    try {
      let data: BoardResponse[];
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>유형</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>작성자</TableCell>
              <TableCell>작성일</TableCell>
              <TableCell>답변 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredBoards.length > 0 ? (
              filteredBoards.map((board, index) => (
                <ClickableTableRow 
                  key={index}
                  onClick={() => handleViewDetail(board.boardId)}
                >
                  <TableCell>
                    <Chip
                      label={BOARD_TYPE_NAMES[board.boardType]}
                      color={BOARD_TYPE_COLORS[board.boardType]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{board.title}</TableCell>
                  <TableCell>
                    {currentTab === 'consultation' 
                      ? (board.managerName || '익명')
                      : (board.consumerName || '익명')
                    }
                  </TableCell>
                  <TableCell>
                    {board.createdAt.split('T')[0] + ' ' + board.createdAt.split('T')[1].split('.')[0]}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={board.answered ? '답변 완료' : '답변 대기'}
                      color={board.answered ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </ClickableTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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