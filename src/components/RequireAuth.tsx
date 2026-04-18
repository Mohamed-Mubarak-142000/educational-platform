import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { type Role } from '@/utils/routes';
import Unauthorized from '@/pages/Unauthorized';

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles?: Role[];
};

const isRole = (value?: string): value is Role => value === 'Admin' || value === 'Teacher' || value === 'Student';

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-600">
        {t('loading')}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = isRole(user.role) ? user.role : undefined;

  if (user.mustChangePassword && role !== 'Teacher' && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Show Unauthorized page in-place — user is authenticated but lacks permission
    return <Unauthorized allowedRoles={allowedRoles} />;
  }

  if (allowedRoles && !role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
