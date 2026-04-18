import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, FileText, CreditCard, Settings, ChevronLeft, LogOut, GraduationCap as LearnIcon, Calendar, UserSquare2, ShieldAlert, X, Trophy, Pencil, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleHome, type Role } from '@/utils/routes';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';

const linkBase = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors";
const activeClass = "bg-blue-600 text-white shadow-sm";
const inactiveClass = "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

type NavItem = { to: string; label: string; icon: LucideIcon; end: boolean };

type NavLinksProps = {
  links: NavItem[];
  collapsed: boolean;
  onLinkClick?: () => void;
  alwaysExpanded?: boolean;
  navLayoutId?: string;
};

function NavLinks({ links, collapsed, onLinkClick, alwaysExpanded = false, navLayoutId = 'activeNav' }: NavLinksProps) {
  const isCollapsed = alwaysExpanded ? false : collapsed;
  return (
    <nav className="px-2 space-y-0.5 overflow-y-auto flex-1">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? activeClass : inactiveClass} ${isCollapsed ? 'justify-center px-2' : ''} group relative overflow-hidden`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId={navLayoutId}
                  className="absolute inset-0 bg-blue-600 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

type SidebarFooterProps = {
  collapsed: boolean;
  handleLogout: () => void;
  forMobile?: boolean;
};

function SidebarFooter({ collapsed, handleLogout, forMobile = false }: SidebarFooterProps) {
  const { t } = useTranslation();
  return (
    <div className="px-3 pb-6 pt-4 border-t border-slate-200/70 dark:border-slate-800">
      <div className={`flex ${!forMobile && collapsed ? 'flex-col items-center' : 'flex-col'} gap-2`}>
        <LanguageSwitcher collapsed={!forMobile && collapsed} />
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-medium transition-colors ${!forMobile && collapsed ? 'w-9 h-9 justify-center px-0' : 'h-9 px-3'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {(forMobile || !collapsed) && (
              <motion.span
                key="logout"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="ms-2 whitespace-nowrap overflow-hidden"
              >
                {t('logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [firstLoginDialogOpen, setFirstLoginDialogOpen] = useState(
    user?.role === 'Teacher' && !!user?.mustChangePassword
  );

  const isRTL = i18n.language === 'ar';

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const role = user?.role;
  const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;

  const adminLinks = [
    { to: '/admin', label: t('adminOverview'), icon: LayoutDashboard, end: true },
    { to: '/admin/teachers', label: t('adminTeachers'), icon: Users, end: false },
    { to: '/admin/teacher-requests', label: t('teacherRequests'), icon: UserSquare2, end: false },
    { to: '/admin/students', label: t('adminStudents'), icon: GraduationCap, end: false },
    { to: '/admin/subjects', label: t('stagesAndSubjects'), icon: BookOpen, end: false },
    { to: '/admin/exams', label: t('adminExams'), icon: FileText, end: false },
    { to: '/admin/payments', label: t('adminPayments'), icon: CreditCard, end: false },
    { to: '/admin/platform-config', label: t('adminPlatformConfig'), icon: Settings, end: false },
  ];

  const teacherLinks = [
    { to: '/teacher', label: t('teacherOverview'), icon: LayoutDashboard, end: true },
    { to: '/teacher/subjects', label: t('stagesAndSubjects'), icon: BookOpen, end: false },
    { to: '/teacher/students', label: t('myStudents'), icon: GraduationCap, end: false },
    { to: '/teacher/exams', label: t('teacherExams'), icon: FileText, end: false },
    { to: '/teacher/profile/edit', label: t('editProfile'), icon: Pencil, end: false },
  ];

  const studentLinks = [
    { to: '/student', label: t('studentOverview'), icon: LayoutDashboard, end: true },
    { to: '/student/learn', label: t('studentLearn'), icon: LearnIcon, end: false },
    { to: '/student/schedule', label: t('mySchedule'), icon: Calendar, end: false },
    { to: '/student/quiz-history', label: t('quizHistoryTitle'), icon: Trophy, end: false },
    { to: '/student/payments-record', label: t('paymentsRecord'), icon: CreditCard, end: false },
    { to: '/student/courses', label: t('stageCourses'), icon: BookOpen, end: false },
  ];

  const links = role === 'Admin' ? adminLinks : role === 'Teacher' ? teacherLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 dashboard-shell ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer — matches desktop style exactly ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-16 start-0 z-50 h-[calc(100vh-4rem)] w-64 flex flex-col border-e border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-sm shadow-2xl lg:hidden"
          >
            {/* Logo section — identical to desktop */}
            <div className="px-4 pt-4 pb-4 relative">
              <div className="flex flex-col items-center">
                <NavLink to={roleHome(normalizedRole)} className="flex flex-col items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <img src="/academix-logo.svg" alt={t('brandName')} className="w-10 h-10" />
                  <span className="font-semibold text-base text-center whitespace-nowrap overflow-hidden">
                    {t('brandName')}
                  </span>
                </NavLink>
              </div>
              {/* Close button overlaid in the top-end corner */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 end-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('closeMenu')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Nav links — always expanded, same component as desktop */}
            <NavLinks
              links={links}
              collapsed={collapsed}
              onLinkClick={() => setMobileOpen(false)}
              alwaysExpanded
              navLayoutId="activeNavMobile"
            />
            <SidebarFooter collapsed={collapsed} handleLogout={handleLogout} forMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile hamburger button — REMOVED: now lives in SiteNavbar ── */}

      <div className="flex h-screen overflow-hidden">
        {/* ── Desktop sidebar ── */}
        <div className="sidebar-wrapper relative hidden lg:block">
          <motion.aside
            animate={{ width: collapsed ? '5rem' : '16rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="dashboard-sidebar fixed top-16 start-0 h-[calc(100vh-4rem)] flex flex-col border-e border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden"
            style={{ width: collapsed ? '5rem' : '16rem' }}
          >
            <div className="px-4 pt-4 pb-4">
              <div className="flex flex-col items-center">
                <NavLink to={roleHome(normalizedRole)} className="flex flex-col items-center gap-2">
                  <img src="/academix-logo.svg" alt={t('brandName')} className="w-10 h-10" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        key="brand"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-semibold text-base text-center whitespace-nowrap overflow-hidden"
                      >
                        {t('brandName')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </div>
            </div>
            <NavLinks links={links} collapsed={collapsed} />
            <SidebarFooter collapsed={collapsed} handleLogout={handleLogout} />
          </motion.aside>
          <motion.button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="sidebar-toggle fixed top-20 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-md z-50"
          >
            <motion.span
              animate={{ rotate: isRTL ? (collapsed ? 0 : 180) : (collapsed ? 180 : 0) }}
              transition={{ duration: 0.25 }}
              className="flex"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </div>

        <main className="dashboard-main flex-1 min-h-[calc(100vh-4rem)] overflow-hidden pt-16">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── First-login security reminder dialog for teachers ── */}
      <Dialog open={firstLoginDialogOpen} onOpenChange={setFirstLoginDialogOpen}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="sr-only">{t('securityNotice')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center gap-5 py-2">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('firstLoginTitle')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('firstLoginMessage')}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFirstLoginDialogOpen(false)}
              >
                {t('remindMeLater')}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setFirstLoginDialogOpen(false);
                  navigate('/change-password');
                }}
              >
                {t('changePassword')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
