import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type NavLink = { labelKey: string; id: string };

export type SiteNavbarProps = {
  variant?: 'marketing' | 'app';
  position?: 'fixed' | 'sticky';
  className?: string;
  navLinks?: NavLink[];
};

export function SiteNavbar({ variant = 'marketing', position = 'fixed', className = '', navLinks }: SiteNavbarProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { setMobileOpen } = useSidebar();

  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (!navLinks?.length) return;
    const scrollRoot = document.getElementById('root') ?? null;
    const observers = navLinks.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { root: scrollRoot, rootMargin: '-64px 0px -50% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [navLinks]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Lock scroll on #root (the actual scroll container) when mobile menu is open
  useEffect(() => {
    const el = document.getElementById('root');
    if (!el) return;
    el.style.overflow = menuOpen ? 'hidden' : '';
    return () => { el.style.overflow = ''; };
  }, [menuOpen]);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;
      // Use scrollIntoView — works with #root as the scroll container
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div ref={menuRef} className={`${position} top-0 w-full z-50`}>
      <nav
        className={`w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-colors duration-300 text-slate-900 dark:text-slate-100 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Left: Logo / App title ── */}
          {variant === 'app' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ms-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('openMenu')}
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-semibold text-lg">{t('dashboard')}</span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/academix-logo.svg" alt={t('brandLogoAlt')} className="w-9 h-9 drop-shadow-sm" />
              <span className="font-extrabold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {t('brandName')}
              </span>
            </Link>
          )}

          {/* ── Center: Desktop nav links (marketing only) ── */}
          {variant === 'marketing' && navLinks?.length ? (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(({ labelKey, id }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </nav>
          ) : <div className="flex-1" />}

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2">
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

                {/* Desktop auth CTAs */}
                {!user ? (
                  <div className="hidden lg:flex items-center gap-2">
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
                  <Link to="/dashboard" className="hidden lg:block">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all rounded-full px-6">
                      {t('dashboard')}
                    </Button>
                  </Link>
                )}

                {/* Mobile hamburger — visible below lg */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(o => !o)}
                  aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
                  aria-expanded={menuOpen}
                  className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer (marketing variant only, below lg) ── */}
      {variant === 'marketing' && (
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-16 bg-black/40 lg:hidden"
                aria-hidden
                onClick={() => setMenuOpen(false)}
              />

              {/* Drawer panel */}
              <motion.div
                key="drawer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl lg:hidden overflow-y-auto max-h-[calc(100dvh-4rem)]"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                  {/* Nav items */}
                  {navLinks?.map(({ labelKey, id }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-start px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                        activeSection === id
                          ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t(labelKey)}
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                  {/* Auth CTAs */}
                  {!user ? (
                    <div className="flex flex-col gap-2 pt-1 pb-2">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl font-medium">
                          {t('login')}
                        </Button>
                      </Link>
                      <Link to="/curriculums" onClick={() => setMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
                          {t('getStarted')}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
                          {t('dashboard')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

