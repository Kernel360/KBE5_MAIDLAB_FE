import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider } from '@mui/material';

const mockStats = [
  { label: '전체 회원 수', value: 1234 },
  { label: '매니저 수', value: 56 },
  { label: '소비자 수', value: 1178 },
  { label: '오늘 예약', value: 23 },
  { label: '이번달 정산', value: '₩1,200,000' },
  { label: '진행중 이벤트', value: 2 },
  { label: '미답변 문의', value: 4 },
];

const recentActivities = [
  { type: '회원가입', desc: '홍길동(소비자)님이 가입했습니다.', date: '2024-06-01' },
  { type: '예약', desc: '예약 #1023이 생성되었습니다.', date: '2024-06-01' },
  { type: '정산', desc: '5월 정산이 완료되었습니다.', date: '2024-05-31' },
  { type: '문의', desc: '새 문의글이 등록되었습니다.', date: '2024-05-31' },
];

const Dashboard = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {mockStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">[{activity.type}] {activity.desc}</Typography>
                  <Typography variant="body2" color="text.secondary">{activity.date}</Typography>
                </Box>
                {idx < recentActivities.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard; 