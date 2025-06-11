// src/components/features/consumer/mypage/MenuGrid.tsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const MenuButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 120px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    border-color: #007bff;
  }
`;

const MenuIcon = styled.span`
  font-size: 24px;
  margin-bottom: 8px;
`;

const MenuLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const menuItems = [
  { id: 'payment', label: '결제수단 관리', icon: '💳', path: '/consumers/payment' },
  { id: 'coupon', label: '프로모션 코드/쿠폰', icon: '🎟️', path: '/consumers/coupon' },
  { id: 'point', label: '포인트', icon: '', path: '/consumer/point' },
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
    navigate(path);
  };

  return (
    <Grid>
      {menuItems.map((item) => (
        <MenuButton
          key={item.id}
          onClick={() => handleMenuClick(item.path)}
        >
          <MenuIcon>{item.icon}</MenuIcon>
          <MenuLabel>{item.label}</MenuLabel>
        </MenuButton>
      ))}
    </Grid>
  );
}