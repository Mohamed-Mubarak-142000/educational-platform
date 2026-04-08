import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

type Role = 'Admin' | 'Teacher' | 'Student';

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles?: Role[];
};

const roleHome = (role?: Role) => {
  if (role === 'Admin') return '/admin';
  if (role === 'Teacher') return '/teacher';
  return '/student';
};

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

  if (user.mustChangePassword && user.role !== 'Teacher' && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <>{children}</>;
}

export { roleHome };
