import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button, Card, Skeleton, Typography } from '@mui/material';
import { formatNumber } from '@/utils';

interface SettlementDetail {
  settlementId: number;
  serviceType: 'HOUSEKEEPING';
  serviceDetailType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  platformFee: number;
  amount: number;
}

const SettlementDetail = () => {
  const { settlementId } = useParams<{ settlementId: string }>();
  const navigate = useNavigate();
  const { loading, reservationManagement } = useAdmin();
  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);

  useEffect(() => {
    const fetchSettlementDetail = async () => {
      if (!settlementId) return;
      const data = await reservationManagement.fetchSettlementDetail(Number(settlementId));
      if (data) {
        setSettlement(data);
      }
    };

    fetchSettlementDetail();
  }, [settlementId]);

  const handleApprove = async () => {
    if (!settlementId) return;
    const success = await reservationManagement.approveSettlement(Number(settlementId));
    if (success) {
      navigate(-1);
    }
  };

  const handleReject = async () => {
    if (!settlementId) return;
    const success = await reservationManagement.rejectSettlement(Number(settlementId));
    if (success) {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
        <Card>
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={200} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="p-4">
        <Typography variant="h4">정산 정보를 찾을 수 없습니다.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">정산 상세 정보</Typography>
        <div className="space-x-2">
          {settlement?.status === 'PENDING' && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApprove}
                disabled={loading}
              >
                승인
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={loading}
              >
                거부
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
            목록으로
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <Typography>정산 ID</Typography>
            <Typography>{settlement.settlementId}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>서비스 유형</Typography>
            <Typography>{settlement.serviceType}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>상세 서비스</Typography>
            <Typography>{settlement.serviceDetailType}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>상태</Typography>
            <Typography>{settlement.status}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>플랫폼 수수료</Typography>
            <Typography>{formatNumber(settlement.platformFee)}원</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>정산 금액</Typography>
            <Typography variant="h6" className="font-bold">
              {formatNumber(settlement.amount)}원
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettlementDetail; 