import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function TeacherSettings() {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-10">
      <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>{t('teacherSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">{t('teacherSettingsSubtitle')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
