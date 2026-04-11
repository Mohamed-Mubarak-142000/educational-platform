import CoursesPage from '@/components/CoursesPage';
import { getMyCourses } from '@/api/courseApi';
import { useTranslation } from 'react-i18next';

export default function TeacherCourses() {
  const { t } = useTranslation();
  return (
    <CoursesPage
      basePath="/teacher/courses"
      queryKey={['my-courses']}
      queryFn={getMyCourses}
      title={t('adminCourses')}
      subtitle={t('adminCoursesSubtitle')}
    />
  );
}
