import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function TeacherOverview() {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('teacherOverview')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('teacherOverviewSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle>{t('teacherCourses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle>{t('teacherExams')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle>{t('teacherStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
