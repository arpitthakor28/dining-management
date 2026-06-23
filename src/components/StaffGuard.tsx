import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface StaffGuardProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'kitchen';
}

export default function StaffGuard({ children, requiredRole }: StaffGuardProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = localStorage.getItem('staff_auth') === 'true';
  const userRole = localStorage.getItem('staff_role');
  const restaurantId = localStorage.getItem('restaurant_id');

  if (!token || !isAuthenticated || !restaurantId) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'manager') {
    // Managers can access everything, kitchen staff can only access kitchen dashboard
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
