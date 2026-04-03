import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, FileText, CreditCard, Settings, ChevronLeft, LogOut, GraduationCap as LearnIcon, Calendar, UserSquare2, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleHome } from '@/components/RequireAuth';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const linkBase = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors";
const activeClass = "bg-blue-600 text-white shadow-sm";
const inactiveClass = "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  const role = user?.role;

  const adminLinks = [
    { to: '/admin', label: t('adminOverview'), icon: LayoutDashboard, end: true },
    { to: '/admin/teachers', label: t('adminTeachers'), icon: Users, end: false },
    { to: '/admin/teacher-requests', label: 'Teacher Requests', icon: UserSquare2, end: false },
    { to: '/admin/students', label: t('adminStudents'), icon: GraduationCap, end: false },
    { to: '/admin/subjects', label: t('stagesAndSubjects'), icon: BookOpen, end: false },
    { to: '/admin/exams', label: t('adminExams'), icon: FileText, end: false },
    { to: '/admin/payments', label: t('adminPayments'), icon: CreditCard, end: false },
  ];

  const teacherLinks = [
    { to: '/teacher', label: t('teacherOverview'), icon: LayoutDashboard, end: true },
    { to: '/teacher/courses', label: t('teacherCourses'), icon: BookOpen, end: false },
    { to: '/teacher/exams', label: t('teacherExams'), icon: FileText, end: false },
    { to: '/teacher/settings', label: t('teacherSettings'), icon: Settings, end: false },
  ];

  const studentLinks = [
    { to: '/student', label: t('studentOverview'), icon: LayoutDashboard, end: true },
    { to: '/student/learn', label: 'Learn', icon: LearnIcon, end: false },
    { to: '/student/schedule', label: 'My Schedule', icon: Calendar, end: false },
    { to: '/student/grades', label: 'My Grades', icon: Award, end: false },
    { to: '/student/subscriptions', label: t('studentSubscriptions'), icon: CreditCard, end: false },
    { to: '/student/courses', label: 'Stage Courses', icon: BookOpen, end: false },
  ];

  const links = role === 'Admin' ? adminLinks : role === 'Teacher' ? teacherLinks : studentLinks;


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 dashboard-shell ${collapsed ? 'collapsed' : ''}`}>
      <div className="flex h-screen overflow-hidden">
        <div className="sidebar-wrapper relative hidden lg:block">
          <motion.aside
            animate={{ width: collapsed ? '5rem' : '16rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="dashboard-sidebar fixed top-16 start-0 h-[calc(100vh-4rem)] flex flex-col border-e border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden"
            style={{ width: collapsed ? '5rem' : '16rem' }}
          >
            <div className="px-4 pt-4 pb-4">
              <div className="flex flex-col items-center">
                <NavLink to={roleHome(role)} className="flex flex-col items-center gap-2">
                  <img src="/academix-logo.svg" alt="Academix" className="w-10 h-10" />
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
            <nav className="px-2 space-y-0.5 overflow-y-auto flex-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeClass : inactiveClass} ${collapsed ? 'justify-center px-2' : ''} group relative overflow-hidden`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute inset-0 bg-blue-600 rounded-xl"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className="w-4 h-4 relative z-10 flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
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
            <div className="px-3 pb-6 pt-4 border-t border-slate-200/70 dark:border-slate-800">
              <div className={`flex ${collapsed ? 'flex-col items-center' : 'flex-col'} gap-2`}>
                <LanguageSwitcher collapsed={collapsed} />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-medium transition-colors ${collapsed ? 'w-9 h-9 justify-center px-0' : 'h-9 px-3'}`}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
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
    </div>
  );
}
