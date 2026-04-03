import { useTranslation } from 'react-i18next';

export default function TeacherDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className={isRtl ? 'text-right' : 'text-left'}>
        <h1 className="text-3xl md:text-4xl font-bold">{t('teacherDashboardTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('teacherDashboardSubtitle')}</p>
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-xl">
        <p className="text-slate-600 dark:text-slate-400">{t('teacherDashboardEmpty')}</p>
      </div>
    </div>
  );
}
