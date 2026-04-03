import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getExams, getExamResults } from '@/api/examApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';

export default function AdminExamDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams,
  });

  const { data: results = [] } = useQuery({
    queryKey: ['exam-results', id],
    queryFn: () => getExamResults(id || ''),
    enabled: !!id,
  });

  const exam: any = exams.find((e: any) => e._id === id);

  if (isLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>Loading...</div>;
  }

  if (!exam) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('examNotFound') || 'Exam not found'}</p>
        <Button variant="outline" onClick={() => navigate('/admin/exams')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToExams')}
        </Button>
      </div>
    );
  }

  const lessonId = typeof exam.lessonId === 'string' ? exam.lessonId : exam.lessonId?._id || '-';

  const fields = [
    { icon: FileText, label: t('title'), value: exam.title },
    { icon: Clock, label: t('timeLimit'), value: `${exam.timeLimit} ${t('minutesShort') || 'min'}` },
    { icon: null, label: t('lessonId'), value: lessonId },
    { icon: null, label: t('createdAt'), value: exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : '-' },
  ];

  return (
    <div className={spacing.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/exams')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('backToExams')}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/admin/exams/${id}/edit`)}
        >
          <Pencil className="w-4 h-4 mr-2" /> {t('edit')}
        </Button>
      </div>

      <div className="space-y-6">
        <Card className={cardVariants.default}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-1">
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />}
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={cardVariants.default}>
          <CardHeader>
            <CardTitle>{t('examResults') || 'Results'}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">{t('noResultsYet') || 'No results yet'}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">{t('studentName')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">{t('email')}</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">{t('score')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result: any) => (
                      <tr key={result._id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">{result.studentId?.name || '-'}</td>
                        <td className="py-3 px-4">{result.studentId?.email || '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold">{result.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
