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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';

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

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const EventList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const { events, loading, fetchEvents, deleteEvent } = useEvent();
  const navigate = useNavigate();

  // 이벤트 목록 필터링
  useEffect(() => {
    if (!events) return;
    
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  // 이벤트 삭제 처리
  const handleDelete = useCallback(async (eventId: number) => {
    if (window.confirm('이벤트를 삭제하시겠습니까?')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        await fetchEvents();
      }
    }
  }, [deleteEvent, fetchEvents]);

  // 이벤트 수정 페이지로 이동
  const handleEdit = useCallback((eventId: number) => {
    navigate(`${ROUTES.ADMIN.EVENT_EDIT.replace(':id', String(eventId))}`);
  }, [navigate]);

  // 이벤트 생성 페이지로 이동
  const handleCreate = useCallback(() => {
    navigate(ROUTES.ADMIN.EVENT_CREATE);
  }, [navigate]);

  return (
    <StyledContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          이벤트 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ backgroundColor: '#FF7F50', '&:hover': { backgroundColor: '#FF6347' } }}
        >
          이벤트 생성
        </Button>
      </Box>

      <SearchBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="이벤트 검색..."
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
              <TableCell>제목</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell>수정일</TableCell>
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
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.eventId}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{formatDate(event.createdAt)}</TableCell>
                  <TableCell>{event.updatedAt ? formatDate(event.updatedAt) : '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="수정">
                      <ActionButton onClick={() => handleEdit(event.eventId)}>
                        <EditIcon />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <ActionButton onClick={() => handleDelete(event.eventId)}>
                        <DeleteIcon />
                      </ActionButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  이벤트가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledContainer>
  );
};

export default EventList; 