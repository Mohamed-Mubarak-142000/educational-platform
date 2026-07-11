import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { roleHome, type Role } from '@/utils/routes';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft, LayoutDashboard } from 'lucide-react';

const isRole = (v?: string): v is Role => v === 'Admin' || v === 'Teacher' || v === 'Student';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const homePath = isRole(user?.role) ? roleHome(user!.role as Role) : '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Compass className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('notFoundTitle', { defaultValue: 'Page not found' })}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t('notFoundMessage', {
              defaultValue: "The page you're looking for doesn't exist or has moved.",
            })}
          </p>
        </div>

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
            className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
            onClick={() => navigate(homePath)}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('backToDashboard')}
          </Button>
        </div>

        <p className="text-xs text-slate-300 dark:text-slate-600 font-mono">404 Not Found</p>
      </div>
    </div>
  );
}
