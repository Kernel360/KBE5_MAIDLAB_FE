import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import { useAdmin } from '@/hooks';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';

const recentActivities = [
  {
    type: '회원가입',
    desc: '홍길동(소비자)님이 가입했습니다.',
    date: '2024-06-01',
  },
  { type: '예약', desc: '예약 #1023이 생성되었습니다.', date: '2024-06-01' },
  { type: '정산', desc: '5월 정산이 완료되었습니다.', date: '2024-05-31' },
  { type: '문의', desc: '새 문의글이 등록되었습니다.', date: '2024-05-31' },
];

const Dashboard = () => {
  const { dashboard } = useAdmin();
  const [stats, setStats] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleStatClick = (path: string) => {
    navigate(path);
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
          path: ROUTES.ADMIN.USERS
        },
        { 
          label: '현재 활동중인 매니저 수', 
          value: ManagerCount,
          path: ROUTES.ADMIN.USERS
        },
        { 
          label: '승인 대기중인 매니저 수', 
          value: NewManagerCount,
          path: ROUTES.ADMIN.USERS
        },
        { 
          label: '소비자 수', 
          value: ConsumerCount,
          path: ROUTES.ADMIN.USERS
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
          path: ROUTES.ADMIN.BOARDS
        },
      ]);
    };
  
    fetchStats();
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
            {recentActivities.map((activity, idx) => (
              <Box key={idx}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1">
                    [{activity.type}] {activity.desc}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.date}
                  </Typography>
                </Box>
                {idx < recentActivities.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
