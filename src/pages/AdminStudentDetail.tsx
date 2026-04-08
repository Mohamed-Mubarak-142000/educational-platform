import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentById, getSubscriptions } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Mail, Phone, User, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';
import { EmptyState } from '@/components/shared';

export default function AdminStudentDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudentById(id as string),
    enabled: Boolean(id),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  const subscription: any = subscriptions.find((sub: any) => {
    const subId = sub.studentId?._id || sub.studentId;
    return subId === id;
  });

  if (isLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>{t('loading')}</div>;
  }

  if (!student) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('studentNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToStudents')}
        </Button>
      </div>
    );
  }

  const fields = [
    { icon: User, label: t('name'), value: student.name },
    { icon: Mail, label: t('email'), value: student.email },
    { icon: Phone, label: t('phone'), value: student.phone || '-' },
    { icon: null, label: t('status'), value: student.status },
    { icon: null, label: t('plan'), value: subscription?.plan || t('noPlan') },
    { icon: null, label: t('subscription'), value: subscription?.status || t('inactive') },
    { icon: null, label: t('joined'), value: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-' },
  ];

  const subscribedSubjects = student?.subscribedSubjects || [];

  return (
    <div className={spacing.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/students')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('backToStudents')}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/admin/students/${id}/edit`)}
        >
          <Pencil className="w-4 h-4 mr-2" /> {t('edit')}
        </Button>
      </div>

      <Card className={cardVariants.default}>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0">
              {student.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <p className="text-slate-500 mt-1">{student.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                student.status === 'Active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {student.status}
              </span>
              {subscription && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  subscription.status === 'Active'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {subscription.plan}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-lg">
              {t('subscribedSubjects')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {subscribedSubjects.length === 0 ? (
            <EmptyState description={t('noSubjects')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribedSubjects.map((subject: any) => (
                <div
                  key={subject._id}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-sm transition"
                  onClick={() => navigate(`/admin/subjects/${subject._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/admin/subjects/${subject._id}`);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg">
                      {subject.icon || '📘'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {subject.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {subject.description || t('noDescription')}
                      </p>
                      {subject.teacherId?.name && (
                        <p className="text-xs text-slate-400 mt-2">{subject.teacherId.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
