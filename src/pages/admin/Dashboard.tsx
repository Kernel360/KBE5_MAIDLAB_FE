import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAdmin } from '@/hooks';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/apis/admin';

const Dashboard = () => {
  const { dashboard } = useAdmin();
  const [stats, setStats] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStatClick = (path: string) => {
    navigate(path);
  };

  // 로그 라인을 파싱하여 활동 정보로 변환
  const parseLogLine = (logLine: string) => {
    try {
      // 로그 형식이 정해지지 않았으므로 기본적인 파싱 시도
      // 예: "2024-01-01 12:00:00 [INFO] 사용자 가입: user123"
      const timestampMatch = logLine.match(/(\d{4}-\d{2}-\d{2}[\s\T]\d{2}:\d{2}:\d{2})/);
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString().slice(0, 19);
      
      // 로그 레벨 추출
      const levelMatch = logLine.match(/\[(INFO|WARN|ERROR|DEBUG)\]/);
      const level = levelMatch ? levelMatch[1] : 'INFO';
      
      // 메시지 부분 추출 (타임스탬프와 레벨 이후)
      let message = logLine;
      if (timestampMatch) {
        message = logLine.substring(timestampMatch.index! + timestampMatch[0].length).trim();
      }
      if (levelMatch) {
        message = message.replace(/\[(INFO|WARN|ERROR|DEBUG)\]/, '').trim();
      }
      
      return {
        timestamp: new Date(timestamp),
        level,
        message: message || logLine,
        rawLog: logLine
      };
    } catch (error) {
      // 파싱 실패 시 원본 로그를 그대로 반환
      return {
        timestamp: new Date(),
        level: 'INFO',
        message: logLine,
        rawLog: logLine
      };
    }
  };

  // 로그를 활동 유형별로 분류
  const categorizeActivity = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('user') || msg.includes('사용자') || msg.includes('가입') || msg.includes('signup')) {
      return '회원가입';
    } else if (msg.includes('reservation') || msg.includes('예약') || msg.includes('booking')) {
      return '예약';
    } else if (msg.includes('settlement') || msg.includes('정산') || msg.includes('payment')) {
      return '정산';
    } else if (msg.includes('board') || msg.includes('문의') || msg.includes('inquiry')) {
      return '문의';
    } else if (msg.includes('manager') || msg.includes('매니저')) {
      return '매니저';
    } else if (msg.includes('error') || msg.includes('에러') || msg.includes('오류')) {
      return '오류';
    } else {
      return '시스템';
    }
  }; 
  
  useEffect(() => {
    const fetchStats = async () => {
      const ManagerCount = (await dashboard.getManagerCount()).data ?? 0;
      const NewManagerCount = (await dashboard.getNewManagerCount()).data ?? 0;
      const ConsumerCount = (await dashboard.getConsumerCount()).data ?? 0;
      const TodayReservation = (await dashboard.getTodayReservationCount()).data ?? 0;
      const EventCount = (await dashboard.getEventCount()).data ?? 0;
      const BoardWithoutAnswerCount = (await dashboard.getBoardWithoutAnswerCount()).data ?? 0;
      setStats([
        { 
          label: '전체 회원 수', 
          value: Number(ManagerCount) + Number(ConsumerCount),
          path: ROUTES.ADMIN.CONSUMERS
        },
        { 
          label: '현재 활동중인 매니저 수', 
          value: ManagerCount,
          path: ROUTES.ADMIN.MANAGERS
        },
        { 
          label: '승인 대기중인 매니저 수', 
          value: NewManagerCount,
          path: ROUTES.ADMIN.MANAGERS
        },
        { 
          label: '소비자 수', 
          value: ConsumerCount,
          path: ROUTES.ADMIN.CONSUMERS
        },
        { 
          label: '오늘 예약', 
          value: TodayReservation,
          path: ROUTES.ADMIN.RESERVATIONS
        },
        { 
          label: '진행중 이벤트', 
          value: EventCount,
          path: ROUTES.ADMIN.EVENTS
        },
        { 
          label: '미답변 문의', 
          value: BoardWithoutAnswerCount,
          path: ROUTES.ADMIN.MANAGER_BOARDS
        },
      ]);
    };

    const fetchRecentLogs = async () => {
      try {
        setLogsLoading(true);
        setLogsError(null);
        const logs = await adminApi.getAdminLogs(50);
        
        // API 응답이 배열인지 확인하고, 아니면 빈 배열로 설정
        if (Array.isArray(logs)) {
          setRecentLogs(logs);
        } else {
          console.warn('API response is not an array:', logs);
          setRecentLogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch admin logs:', error);
        setLogsError('로그를 불러오는데 실패했습니다.');
        setRecentLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
  
    fetchStats();
    fetchRecentLogs();
  }, []);
  return (
    <Box>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card
            onClick={() => handleStatClick(stat.path)}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={5}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          최근 활동
        </Typography>
        <Card>
          <CardContent>
            {logsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary" ml={2}>
                  로그를 불러오는 중...
                </Typography>
              </Box>
            ) : logsError ? (
              <Box py={4} textAlign="center">
                <Typography variant="body2" color="error">
                  {logsError}
                </Typography>
              </Box>
            ) : !Array.isArray(recentLogs) || recentLogs.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  최근 활동이 없습니다.
                </Typography>
              </Box>
            ) : (
              recentLogs.slice(0, 10).map((logLine, idx) => {
                const parsedLog = parseLogLine(logLine);
                const activityType = categorizeActivity(parsedLog.message);
                const formattedTime = parsedLog.timestamp.toLocaleString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <Box key={idx}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      py={1}
                    >
                      <Box flex={1}>
                        <Typography variant="body2" component="div">
                          <Box component="span" 
                               sx={{ 
                                 color: parsedLog.level === 'ERROR' ? 'error.main' : 
                                        parsedLog.level === 'WARN' ? 'warning.main' : 
                                        'primary.main',
                                 fontWeight: 500,
                                 mr: 1
                               }}>
                            [{activityType}]
                          </Box>
                          <Box component="span" sx={{ wordBreak: 'break-word' }}>
                            {parsedLog.message.length > 80 
                              ? `${parsedLog.message.substring(0, 80)}...` 
                              : parsedLog.message}
                          </Box>
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                        {formattedTime}
                      </Typography>
                    </Box>
                    {idx < Math.min(recentLogs.length, 10) - 1 && (
                      <Divider sx={{ my: 0.5 }} />
                    )}
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
