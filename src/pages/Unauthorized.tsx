import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { roleHome, type Role } from '@/utils/routes';
import { Button } from '@/components/ui/button';
import { ShieldOff, ArrowLeft, LayoutDashboard } from 'lucide-react';

const isRole = (v?: string): v is Role => v === 'Admin' || v === 'Teacher' || v === 'Student';

const ROLE_I18N_KEYS: Record<Role, string> = {
  Admin: 'roleAdmin',
  Teacher: 'roleTeacher',
  Student: 'roleStudent',
};

interface UnauthorizedProps {
  /** Roles that are allowed to access the page that triggered this component */
  allowedRoles?: Role[];
}

export default function Unauthorized({ allowedRoles }: UnauthorizedProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath = isRole(user?.role) ? roleHome(user!.role as Role) : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('unauthorizedTitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t('unauthorizedMessage')}
          </p>
        </div>

        {/* Allowed roles pill list */}
        {allowedRoles && allowedRoles.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 space-y-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              {t('accessibleByLabel')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {allowedRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                >
                  {t(ROLE_I18N_KEYS[role])}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('goBack')}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={() => navigate(dashboardPath)}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('backToDashboard')}
          </Button>
        </div>

        {/* HTTP status hint */}
        <p className="text-xs text-slate-300 dark:text-slate-600 font-mono">403 Forbidden</p>
      </div>
    </div>
  );
}
