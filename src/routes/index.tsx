import { Routes } from 'react-router-dom';
import { CommonRoutes } from './common';
import { ConsumerRoutes } from './consumer';
import { ManagerRoutes } from './manager';
import { AdminRoutes } from './admin';
import { BoardRoutes } from './board';

export const AppRoutes = () => (
  <Routes>
    {CommonRoutes()}
    {ConsumerRoutes()}
    {ManagerRoutes()}
    {AdminRoutes()}
    {BoardRoutes()}
  </Routes>
);
