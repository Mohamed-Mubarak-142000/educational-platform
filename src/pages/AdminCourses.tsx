import CoursesPage from '@/components/CoursesPage';
import { getCourses } from '@/api/courseApi';
import { useTranslation } from 'react-i18next';

export default function AdminCourses() {
  const { t } = useTranslation();
  return (
    <CoursesPage
      basePath="/admin/courses"
      queryKey={['courses']}
      queryFn={getCourses}
      title={t('adminCourses')}
      subtitle={t('adminCoursesSubtitle')}
      showTeacher
    />
  );
}
