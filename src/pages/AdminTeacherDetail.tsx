import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeacherById } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Mail, Phone, BookOpen, User, CalendarClock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';
import { EmptyState } from '@/components/shared';

export default function AdminTeacherDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => getTeacherById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>{t('loading')}</div>;
  }

  if (!teacher) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('teacherNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/admin/teachers')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToTeachers')}
        </Button>
      </div>
    );
  }

  const fields = [
    { icon: User, label: t('name'), value: teacher.name },
    { icon: Mail, label: t('email'), value: teacher.email },
    { icon: Phone, label: t('phone'), value: teacher.phone || '-' },
    { icon: BookOpen, label: t('subject'), value: teacher.subject || '-' },
    { icon: null, label: t('status'), value: teacher.status },
    { icon: null, label: t('joined'), value: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : '-' },
  ];

  const subjects = teacher?.subjects || [];
  const schedules = teacher?.schedules || [];
  const application = teacher?.application || null;
  const cvUrl = teacher?.cvUrl || null;

  const availability = application?.availableHours
    ? Object.entries(application.availableHours)
    : [];

  return (
    <div className={spacing.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/teachers')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('backToTeachers')}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/admin/teachers/${id}/edit`)}
        >
          <Pencil className="w-4 h-4 mr-2" /> {t('edit')}
        </Button>
      </div>

      <Card className={cardVariants.default}>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          {teacher.profileImage ? (
            <img
              src={teacher.profileImage}
              alt={teacher.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0">
              {teacher.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <CardTitle className="text-2xl">{teacher.name}</CardTitle>
            <p className="text-slate-500 mt-1">{teacher.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              teacher.status === 'Active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {teacher.status}
            </span>
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
            <CardTitle className="text-lg">{t('subjectsTaught')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {subjects.length === 0 ? (
            <EmptyState description={t('noSubjects')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject: any) => (
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
                      <p className="text-xs text-slate-400 mt-2">
                        {t('students')}: {subject.studentCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-lg">{t('availabilitySchedule')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {schedules.length === 0 ? (
            <EmptyState description={t('noSchedule')} />
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule: any) => (
                <div key={schedule._id} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {schedule.day}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {schedule.subjectId?.name || t('subject')}
                  </span>
                  <span className="text-slate-400">
                    {schedule.enrolledStudents?.length ?? 0}/{schedule.maxStudents}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-lg">{t('teacherCv')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {t('viewCv')}
            </a>
          ) : (
            <EmptyState description={t('noCv')} className="py-8" />
          )}
        </CardContent>
      </Card>

      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-lg">{t('applicationDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!application ? (
            <EmptyState description={t('noApplication')} className="py-8" />
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">{t('status')}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{application.status || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">{t('phone')}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{application.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">{t('availableDays')}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {application.availableDays?.length ? application.availableDays.join(', ') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">{t('zoomLink')}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 break-all">
                    {application.zoomLink || '-'}
                  </p>
                </div>
              </div>
              {application.rejectionReason && (
                <div>
                  <p className="text-xs uppercase text-slate-500">{t('rejectionReason')}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{application.rejectionReason}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase text-slate-500">{t('availableHours')}</p>
                {availability.length === 0 ? (
                  <p className="text-slate-500">-</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {availability.map(([day, hours]: any) => (
                      <div key={day} className="text-slate-700 dark:text-slate-300">
                        {day}: {hours?.start || '-'} - {hours?.end || '-'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
