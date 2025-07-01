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
        const logs: any = await adminApi.getAdminLogs(50);
        console.log('Admin logs API response:', typeof logs, 'isArray:', Array.isArray(logs), 'length:', logs?.length);
        
        // API 응답 처리: 배열이면 그대로 사용, 문자열이면 줄바꿈으로 분리
        if (Array.isArray(logs)) {
          setRecentLogs(logs as string[]);
        } else if (typeof logs === 'string') {
          // 문자열인 경우 줄바꿈으로 분리하여 배열로 변환
          const logLines: string[] = logs.split('\n').filter((line: string) => line.trim() !== '');
          setRecentLogs(logLines);
        } else {
          console.warn('API response is neither array nor string:', logs);
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
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => handleStatClick(stat.path)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="text-sm text-gray-500 mb-2">
              {stat.label}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          최근 활동
        </h2>
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {logsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-500">
                  로그를 불러오는 중...
                </span>
              </div>
            ) : logsError ? (
              <div className="text-center py-8">
                <span className="text-sm text-red-600">
                  {logsError}
                </span>
              </div>
            ) : !Array.isArray(recentLogs) || recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-sm text-gray-500">
                  최근 활동이 없습니다.
                </span>
              </div>
            ) : (
              recentLogs
                .slice(0, 20) // 더 많은 로그를 가져와서 필터링 후에도 충분한 항목 확보
                .map(logLine => {
                  const parsedLog = parseLogLine(logLine);
                  const activityType = categorizeActivity(parsedLog.message);
                  return { ...parsedLog, activityType };
                })
                .filter(log => log.activityType !== '시스템') // 시스템 로그 제거
                .slice(0, 10) // 필터링 후 10개로 제한
                .map((parsedLog, idx) => {
                  const formattedTime = parsedLog.timestamp.toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                  <div key={idx}>
                    <div className="flex justify-between items-start py-2">
                      <div className="flex-1">
                        <div className="text-sm">
                          <span 
                            className={`font-medium mr-2 ${
                              parsedLog.level === 'ERROR' ? 'text-red-600' : 
                              parsedLog.level === 'WARN' ? 'text-yellow-600' : 
                              'text-blue-600'
                            }`}
                          >
                            [{parsedLog.activityType}]
                          </span>
                          <span className="break-words text-gray-700">
                            {parsedLog.message}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                        {formattedTime}
                      </span>
                    </div>
                    {idx < Math.min(recentLogs.length, 10) - 1 && (
                      <hr className="my-2 border-gray-200" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
