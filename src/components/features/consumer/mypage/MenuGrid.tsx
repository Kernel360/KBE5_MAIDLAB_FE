// src/components/features/consumer/mypage/MenuGrid.tsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-color: #F97316;
  }
`;

const MenuIcon = styled.span`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
`;

const menuItems = [
  { id: 'payment', label: '결제수단 관리', icon: '💳', path: '/consumers/payment' },
  { id: 'coupon', label: '프로모션 코드/쿠폰', icon: '🎟️', path: '/consumers/coupon' },
  { id: 'point', label: '포인트', icon: '💰', path: '/consumer/point' },
  {
    id: 'helpers',
    label: '찜한 도우미',
    icon: '❤️',
    path: ROUTES.CONSUMER.LIKED_MANAGERS
  },
  { 
    id: 'blacklist', 
    label: '블랙리스트 도우미', 
    icon: '🚫', 
    path: ROUTES.CONSUMER.BLACKLIST 
  },
  { id: 'invite', label: '친구 초대하기', icon: '👥', path: '/consumer/invite' },
  { id: 'settings', label: '설정', icon: '⚙️', path: '/consumer/settings' },
];

export default function MenuGrid() {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <Grid>
      {menuItems.map((item) => (
        <MenuButton
          key={item.id}
          onClick={() => {
            console.log('Button clicked:', item.id, item.path);
            handleMenuClick(item.path);
          }}
        >
          <MenuIcon>{item.icon}</MenuIcon>
          <MenuLabel>{item.label}</MenuLabel>
        </MenuButton>
      ))}
    </Grid>
  );
}