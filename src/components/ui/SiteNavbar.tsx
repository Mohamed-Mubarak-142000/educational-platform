import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export type SiteNavbarProps = {
  variant?: 'marketing' | 'app';
  position?: 'fixed' | 'sticky';
  className?: string;
};

export function SiteNavbar({ variant = 'marketing', position = 'fixed', className = '' }: SiteNavbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { setMobileOpen } = useSidebar();

  return (
    <nav
      className={`${position} top-0 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-50 border-b border-white/20 dark:border-white/10 shadow-sm transition-colors duration-300 text-slate-900 dark:text-slate-100 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {variant === 'app' ? (
          <div className="flex items-center gap-3">
            {/* Hamburger — only visible on mobile, opens the sidebar drawer */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ms-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-lg">{t('dashboard')}</span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <img src="/academix-logo.svg" alt="Academix Logo" className="w-10 h-10 drop-shadow-sm" />
            <span className="font-extrabold text-2xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {t('brandName')}
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2 sm:gap-4">
          {variant === 'app' ? (
            <>
              {user && (
                <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {t('hello')}, {user?.name}
                </span>
              )}
              <ThemeToggle />
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <ThemeToggle />
              {!user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="font-medium hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-slate-800 dark:text-slate-200">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to="/curriculums">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all rounded-full px-6">
                      {t('getStarted')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all rounded-full px-6">
                    {t('dashboard')}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
