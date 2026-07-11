import { useTranslation } from 'react-i18next';

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 text-center transition-colors duration-300 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <img src="/academix-logo.svg" alt={t('brandLogoAlt')} className="w-8 h-8 opacity-90" />
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            {t('brandName')}
          </span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">{t('privacyPolicy')}</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">{t('termsOfService')}</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">{t('contactUs')}</a>
        </div>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">© {new Date().getFullYear()} {t('brandName')}. {t('allRightsReserved')}</p>
    </footer>
  );
}
