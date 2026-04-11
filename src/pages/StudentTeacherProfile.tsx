import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeacherDirectoryById } from '@/api/teacherDirectoryApi';
import { getCoursesByTeacher, type Course } from '@/api/courseApi';
import { getStages, getSubjectsByStage, type Stage, type Subject } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronLeft, Filter, GraduationCap } from 'lucide-react';
import { spacing } from '@/lib/constants';

function getStageName(stageId?: string | { _id?: string; name?: string; nameAr?: string }, stages?: Stage[], language = 'en') {
  if (!stageId) return '';
  if (typeof stageId === 'object') return getLocalizedName(stageId as { name: string; nameAr?: string }, language);
  const found = stages?.find((s) => s._id === stageId);
  return found ? getLocalizedName(found, language) : '';
}

export default function StudentTeacherProfile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [stageId, setStageId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher-directory', id],
    queryFn: () => getTeacherDirectoryById(id as string),
    enabled: !!id,
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId),
    enabled: !!stageId,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['teacher-courses', id, stageId, subjectId],
    queryFn: () => getCoursesByTeacher(id as string, {
      stageId: stageId || undefined,
      subjectId: subjectId || undefined,
    }),
    enabled: !!id,
  });

  const stageName = getStageName(teacher?.stageId, stages, i18n.language);
  const subjectOptions = useMemo(() => subjects, [subjects]);

  if (teacherLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>{t('loading')}</div>;
  }

  if (!teacher) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('teacherNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/student/teachers')}>
          <ChevronLeft className="w-4 h-4 mr-2" /> {t('backToTeachers')}
        </Button>
      </div>
    );
  }

  return (
    <div className={spacing.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/student/teachers')} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> {t('backToTeachers')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border border-slate-200 dark:border-slate-800 lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              {teacher.profileImage ? (
                <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span>{(teacher.name || '?').slice(0, 1)}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{teacher.name}</h1>
              {teacher.subject && <p className="text-sm text-slate-500">{teacher.subject}</p>}
            </div>
            {stageName && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" /> {stageName}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <Filter className="w-4 h-4 text-blue-600" /> {t('filterCourses')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={stageId}
                onChange={(e) => {
                  setStageId(e.target.value);
                  setSubjectId('');
                }}
                className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
              >
                <option value="">{t('selectStage')}</option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {getLocalizedName(stage, i18n.language)}
                  </option>
                ))}
              </select>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
                disabled={!stageId}
              >
                <option value="">
                  {stageId ? t('selectSubject') : t('selectStageFirst')}
                </option>
                {subjectOptions.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {getLocalizedName(subject, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('courses')}</h2>
        <span className="text-sm text-slate-400">({courses.length})</span>
      </div>

      {coursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noCoursesForTeacher')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => {
            const courseStageName = typeof course.stageId === 'object' && course.stageId
              ? getLocalizedName(course.stageId as { name: string; nameAr?: string }, i18n.language)
              : undefined;
            const courseSubjectName = typeof course.subjectId === 'object' && course.subjectId
              ? getLocalizedName(course.subjectId as { name: string; nameAr?: string }, i18n.language)
              : undefined;
            return (
              <Card key={course._id} className="border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
                )}
                <CardContent className="p-4 space-y-2 flex flex-col flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{course.title}</p>
                  {(courseStageName || courseSubjectName) && (
                    <div className="flex flex-wrap gap-1.5">
                      {courseStageName && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                          {courseStageName}
                        </span>
                      )}
                      {courseSubjectName && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          {courseSubjectName}
                        </span>
                      )}
                    </div>
                  )}
                  {course.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {t('viewCourse')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
