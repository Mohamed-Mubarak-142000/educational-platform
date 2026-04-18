import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeacherById, type Teacher } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Mail, Phone, BookOpen, User, CalendarClock, FileText, Download, Eye, GraduationCap, Users, Clock, AlignLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';
import { EmptyState, PdfViewer, SkeletonBlock, SkeletonDetailSection } from '@/components/shared';
import { getLocalizedName } from '@/lib/localeUtils';

type PopulatedItem = { _id: string; name: string; nameAr?: string; icon?: string; color?: string; description?: string };

function isPopulated(item: unknown): item is PopulatedItem {
  return typeof item === 'object' && item !== null && 'name' in item;
}

export default function AdminTeacherDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  const { data: teacher, isLoading } = useQuery<Teacher>({
    queryKey: ['teacher', id],
    queryFn: () => getTeacherById(id as string),
    enabled: Boolean(id),
  });

  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={spacing.pageContainer}>
        <div className="flex items-center justify-between mb-6">
          <SkeletonBlock className="h-9 w-36" />
          <SkeletonBlock className="h-9 w-28" />
        </div>

        <Card className={cardVariants.default}>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
            <SkeletonBlock className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-48" />
              <SkeletonBlock className="h-4 w-64" />
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`field-${index}`} className="space-y-2">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-6">
          <SkeletonDetailSection lines={4} />
          <SkeletonDetailSection lines={4} />
          <SkeletonDetailSection lines={2} />
          <SkeletonDetailSection lines={5} />
        </div>
      </div>
    );
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

  const teacherName = teacher.name ?? t('unknownTeacher');

  const populatedStages = ((teacher as any).assignmentStages ?? (teacher.stageIds ?? []).filter(isPopulated));
  const populatedGrades = ((teacher as any).assignmentGrades ?? []);
  const populatedSubjects = ((teacher as any).assignmentSubjects ?? (teacher.subjectIds ?? []).filter(isPopulated));
  const availableDays = Array.isArray(teacher.availableDays) ? teacher.availableDays : [];
  const availableHours = teacher.availableHours || {};
  const cvUrl = teacher?.cvUrl || null;

  const fields = [
    { icon: User,     label: t('name'),   value: teacherName },
    { icon: Mail,     label: t('email'),  value: teacher.email || '-' },
    { icon: Phone,    label: t('phone'),  value: teacher.phone || '-' },
    { icon: BookOpen, label: t('subject'), value: teacher.subject || '-' },
    { icon: Users,    label: t('totalStudents'), value: String(teacher.totalStudentCount ?? 0) },
    { icon: null,     label: t('status'),  value: teacher.status === 'Active' ? t('active') : teacher.status === 'Inactive' ? t('inactive') : '-' },
    { icon: null,     label: t('joined'),  value: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString(locale) : '-' },
  ];

  return (
    <div className={spacing.pageContainer}>
      {/* Header */}
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

      {/* Profile Card */}
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
              {teacherName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl">{teacherName}</CardTitle>
            <p className="text-slate-500 mt-1">{teacher.email || '-'}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              teacher.status === 'Active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {teacher.status === 'Active' ? t('active') : teacher.status === 'Inactive' ? t('inactive') : '-'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
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

          {/* Bio */}
          {(teacher.bio || true) && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('bio')}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {teacher.bio || <span className="italic text-slate-400">{t('noBio')}</span>}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Stages */}
        <Card className={cardVariants.default}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg">{t('assignedStages')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {populatedStages.length === 0 ? (
              <EmptyState description={t('noStages')} className="py-6" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {populatedStages.map((stage: PopulatedItem) => (
                  <span
                    key={stage._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                  >
                    {stage.icon && <span>{stage.icon}</span>}
                    {getLocalizedName(stage, i18n.language)}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Subjects */}
        <Card className={cardVariants.default}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg">{t('assignedSubjects')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {populatedSubjects.length === 0 ? (
              <EmptyState description={t('noSubjects')} className="py-6" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {populatedSubjects.map((subject: PopulatedItem) => (
                  <span
                    key={subject._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                  >
                    {subject.icon && <span>{subject.icon}</span>}
                    {getLocalizedName(subject, i18n.language)}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned Grades */}
      {populatedGrades.length > 0 && (
        <Card className={`${cardVariants.default} mt-6`}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-600" />
              <CardTitle className="text-lg">{t('assignedGrades')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {populatedGrades.map((grade: any) => (
                <span
                  key={grade._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50"
                >
                  {getLocalizedName(grade, i18n.language)}
                  {grade.stageId?.name && (
                    <span className="text-xs opacity-60 ml-1">({getLocalizedName(grade.stageId, i18n.language)})</span>
                  )}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects Taught (from assignments) */}
      {teacher.subjects && teacher.subjects.length > 0 && (
        <Card className={`${cardVariants.default} mt-6`}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg">{t('subjectsTaught')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teacher.subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
                >
                  <span className="text-xl">{subject.icon || '📘'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {getLocalizedName(subject, i18n.language)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subject.studentCount ?? 0} {t('students')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Schedule */}
      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-lg">{t('availabilitySchedule')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {availableDays.length === 0 ? (
            <EmptyState description={t('noSchedule')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {availableDays.map((day) => {
                const hours = availableHours?.[day];
                return (
                  <div
                    key={day}
                    className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-4 space-y-2"
                  >
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t(`dayName_${day}`)}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{hours?.start || '--:--'}</span>
                      <span>–</span>
                      <span>{hours?.end || '--:--'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Schedules (live lessons) */}
      {teacher.schedules && teacher.schedules.length > 0 && (
        <Card className={`${cardVariants.default} mt-6`}>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg">{t('scheduledLiveLessons')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teacher.schedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-1"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t(`dayName_${schedule.day}`)}</p>
                  {typeof schedule.subjectId === 'object' && schedule.subjectId && (
                    <p className="text-xs text-slate-500">
                      {getLocalizedName(schedule.subjectId as { name: string; nameAr?: string }, i18n.language)}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <Clock className="w-3 h-3" />
                    <span>{schedule.startTime} – {schedule.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV */}
      <Card className={`${cardVariants.default} mt-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-lg">{t('teacherCv')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {cvUrl ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCvPreviewOpen((prev) => !prev)}>
                  <Eye className="w-4 h-4" />
                  {cvPreviewOpen ? t('close') : t('viewCv')}
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={cvUrl} download>
                    <Download className="w-4 h-4" />
                    {t('downloadCv')}
                  </a>
                </Button>
              </div>
              {cvPreviewOpen && <PdfViewer url={cvUrl} className="border-slate-200 dark:border-slate-800" />}
            </div>
          ) : (
            <EmptyState description={t('noCv')} className="py-8" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
