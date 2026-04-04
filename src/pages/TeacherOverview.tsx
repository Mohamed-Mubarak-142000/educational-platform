import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/api/courseApi';
import { getExams } from '@/api/examApi';
import { getStudents } from '@/api/adminApi';
import { useTranslation } from 'react-i18next';
import { LoadingState, PageHeader, StatsCard } from '@/components/shared';
import { spacing } from '@/lib/constants';

export default function TeacherOverview() {
  const { t } = useTranslation();

  const { data: courses = [], isLoading: coursesLoading } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
  const { data: exams = [], isLoading: examsLoading } = useQuery({ queryKey: ['exams'], queryFn: getExams });
  const { data: students = [], isLoading: studentsLoading } = useQuery({ queryKey: ['students'], queryFn: getStudents });

  const isLoading = coursesLoading || examsLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className={spacing.pageContainer}>
        <PageHeader title={t('teacherOverview')} subtitle={t('teacherOverviewSubtitle')} />
        <LoadingState variant="fullpage" />
      </div>
    );
  }

  return (
    <div className={spacing.pageContainer}>
      <PageHeader title={t('teacherOverview')} subtitle={t('teacherOverviewSubtitle')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatsCard title={t('teacherCourses')} value={courses.length} />
        <StatsCard title={t('teacherExams')} value={exams.length} />
        <StatsCard title={t('teacherStudents')} value={students.length} />
      </div>
    </div>
  );
}
