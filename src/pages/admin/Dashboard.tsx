import { useAdmin } from '@/hooks';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/apis/admin';

const Dashboard = () => {
  const { dashboard } = useAdmin();
  const [stats, setStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [heartbeatInterval, setHeartbeatInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleStatClick = (path: string) => {
    navigate(path);
  };

  // 로그 라인을 파싱하여 활동 정보로 변환
  const parseLogLine = (logLine: string) => {
    try {
      // 로그 형식: "2025-07-03 14:51:34.354 [http-nio-8080-exec-2] INFO k.maidlab.service.PaymentService - Payment processed"
      const timestampMatch = logLine.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString().slice(0, 19);
      
      // 로그 레벨 추출
      const levelMatch = logLine.match(/(INFO|WARN|ERROR|DEBUG)\s+/);
      const level = levelMatch ? levelMatch[1] : 'INFO';
      
      // 클래스명과 " - " 이후의 메시지만 추출
      let message = logLine;
      const messageMatch = logLine.match(/[A-Za-z0-9.]+\s+-\s+(.+)$/);
      if (messageMatch) {
        message = messageMatch[1];
      } else {
        // Fallback: remove timestamp, thread info, level, and class name
        message = logLine
          .replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\s+/, '') // Remove timestamp with milliseconds
          .replace(/\[[\w-]+\]\s+/, '') // Remove thread info
          .replace(/(INFO|WARN|ERROR|DEBUG)\s+/, '') // Remove log level
          .replace(/^[A-Za-z0-9.]+\s+-\s+/, ''); // Remove class name
      }
      
      return {
        timestamp: new Date(timestamp),
        level,
        message: message.trim() || logLine,
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

  const connectWebSocket = () => {
    try {
      const newSocket = new WebSocket('ws://localhost:8080/admin/logs/stream');
      
      newSocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setLogsError(null);
        
        // Request initial logs
        try {
          newSocket.send(JSON.stringify({ 
            type: 'getInitialLogs', 
            filter: 'service',
            limit: 50 
          }));
        } catch (error) {
          console.error('Failed to send initial request:', error);
        }
        
        // Start heartbeat
        const interval = setInterval(() => {
          if (newSocket.readyState === WebSocket.OPEN) {
            try {
              newSocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch (error) {
              console.error('Failed to send heartbeat:', error);
              clearInterval(interval);
            }
          } else {
            clearInterval(interval);
          }
        }, 30000); // Send ping every 30 seconds
        
        setHeartbeatInterval(interval);
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let logContent = '';
          
          if (Array.isArray(data)) {
            // Handle array of JSON strings
            logContent = data.map(item => {
              try {
                const parsedItem = JSON.parse(item);
                return parsedItem.content || parsedItem.message || item;
              } catch {
                return item;
              }
            }).join('\n');
          } else if (typeof data === 'string') {
            logContent = data;
          } else if (data.content) {
            logContent = data.content;
          } else if (data.message) {
            logContent = data.message;
          } else if (data.logs) {
            logContent = Array.isArray(data.logs) ? data.logs.join('\n') : data.logs;
          } else {
            logContent = JSON.stringify(data);
          }
          
          // Clean up escape characters
          logContent = logContent.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
          
          const logLines = logContent.split('\n').filter((line: string) => line.trim() !== '');
          
          // Filter for ServiceImpl logs only
          const serviceLogs = logLines.filter((line: string) => {
            const classMatch = line.match(/\b\w+ServiceImpl\b/i);
            return classMatch;
          });
          
          if (serviceLogs.length > 0) {
            setRecentLogs(prev => {
              const newLogs = [...serviceLogs].reverse();
              const uniqueLogs = newLogs.filter(newLog => 
                !prev.some(existingLog => existingLog.trim() === newLog.trim())
              );
              return [...uniqueLogs, ...prev].slice(0, 50);
            });
          }
        } catch (error) {
          // Handle plain text
          const logLines = event.data.split('\n').filter((line: string) => line.trim() !== '');
          const serviceLogs = logLines.filter((line: string) => {
            const classMatch = line.match(/\b\w+ServiceImpl\b/i);
            return classMatch;
          });
          
          if (serviceLogs.length > 0) {
            setRecentLogs(prev => {
              const newLogs = [...serviceLogs].reverse();
              const uniqueLogs = newLogs.filter(newLog => 
                !prev.some(existingLog => existingLog.trim() === newLog.trim())
              );
              return [...uniqueLogs, ...prev].slice(0, 50);
            });
          }
        }
      };
      
      newSocket.onclose = () => {
        setIsConnected(false);
        
        // Clear heartbeat interval
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          setHeartbeatInterval(null);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
    
    // Clear heartbeat interval
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
  };
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        // Run all API calls in parallel for faster loading
        const [
          managerCountResult,
          newManagerCountResult,
          consumerCountResult,
          todayReservationResult,
          eventCountResult,
          refundBoardCountResult,
          counselBoardCountResult
        ] = await Promise.all([
          dashboard.getManagerCount(),
          dashboard.getNewManagerCount(),
          dashboard.getConsumerCount(),
          dashboard.getTodayReservationCount(),
          dashboard.getEventCount(),
          dashboard.getRefundBoardCount(),
          dashboard.getCounselBoardCount()
        ]);

        const ManagerCount = managerCountResult.data ?? 0;
        const NewManagerCount = newManagerCountResult.data ?? 0;
        const ConsumerCount = consumerCountResult.data ?? 0;
        const TodayReservation = todayReservationResult.data ?? 0;
        const EventCount = eventCountResult.data ?? 0;
        const RefundBoardCount = refundBoardCountResult.data ?? 0;
        const CounselBoardCount = counselBoardCountResult.data ?? 0;
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
          label: '미답변 환불문의', 
          value: RefundBoardCount,
          path: ROUTES.ADMIN.CONSUMER_BOARDS
        },
        { 
          label: '미답변 상담문의', 
          value: CounselBoardCount,
          path: ROUTES.ADMIN.MANAGER_BOARDS
        },
      ]);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set default values on error
        setStats([
          { label: '전체 회원 수', value: '-', path: ROUTES.ADMIN.CONSUMERS },
          { label: '현재 활동중인 매니저 수', value: '-', path: ROUTES.ADMIN.MANAGERS },
          { label: '승인 대기중인 매니저 수', value: '-', path: ROUTES.ADMIN.MANAGERS },
          { label: '소비자 수', value: '-', path: ROUTES.ADMIN.CONSUMERS },
          { label: '오늘 예약', value: '-', path: ROUTES.ADMIN.RESERVATIONS },
          { label: '진행중 이벤트', value: '-', path: ROUTES.ADMIN.EVENTS },
          { label: '미답변 환불문의', value: '-', path: ROUTES.ADMIN.CONSUMER_BOARDS },
          { label: '미답변 상담문의', value: '-', path: ROUTES.ADMIN.MANAGER_BOARDS },
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchRecentLogs = async () => {
      try {
        setLogsLoading(true);
        setLogsError(null);
        const logs: any = await adminApi.getAdminLogs(50);
        console.log('Admin logs API response:', typeof logs, 'isArray:', Array.isArray(logs), 'length:', logs?.length);
        
        // API 응답 처리: ServiceImpl 로그만 필터링
        let logLines: string[] = [];
        if (Array.isArray(logs)) {
          logLines = logs as string[];
        } else if (typeof logs === 'string') {
          logLines = logs.split('\n').filter((line: string) => line.trim() !== '');
        }
        
        // ServiceImpl 로그만 필터링
        const serviceImplLogs = logLines.filter((line: string) => {
          return line.match(/\b\w+ServiceImpl\b/i);
        });
        
        setRecentLogs(serviceImplLogs);
      } catch (error) {
        console.error('Failed to fetch admin logs:', error);
        setLogsError('로그를 불러오는데 실패했습니다.');
        setRecentLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
  
    // Run stats and logs fetch in parallel
    Promise.all([fetchStats(), fetchRecentLogs()]);
  }, []);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statsLoading ? (
          // Show loading skeleton cards
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-300 mb-2 bg-gray-200 h-4 rounded animate-pulse">
              </div>
              <div className="text-2xl font-semibold bg-gray-200 h-8 rounded animate-pulse">
              </div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
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
          ))
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            최근 활동
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'WebSocket 연결됨' : 'WebSocket 연결 끊김'}
            </span>
          </div>
        </div>
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
                .slice() // Create copy
                .sort((a, b) => {
                  // Extract timestamp from log line for proper sorting
                  const timeA = parseLogLine(a).timestamp.getTime();
                  const timeB = parseLogLine(b).timestamp.getTime();
                  return timeB - timeA; // Newest first
                })
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
