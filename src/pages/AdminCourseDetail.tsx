import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/api/courseApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, DollarSign, User, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';

export default function AdminCourseDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const course: any = courses.find((c: any) => c._id === id);

  if (isLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>Loading...</div>;
  }

  if (!course) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('courseNotFound') || 'Course not found'}</p>
        <Button variant="outline" onClick={() => navigate('/admin/courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToCourses')}
        </Button>
      </div>
    );
  }

  const teacherName = course.teacherId?.name || course.teacherId || '-';

  const fields = [
    { icon: BookOpen, label: t('title'), value: course.title },
    { icon: DollarSign, label: t('price'), value: `$${course.price}` },
    { icon: User, label: t('teacher'), value: teacherName },
    { icon: null, label: t('createdAt'), value: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '-' },
  ];

  return (
    <div className={spacing.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/courses')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('backToCourses')}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/admin/courses/${id}/edit`)}
        >
          <Pencil className="w-4 h-4 mr-2" /> {t('edit')}
        </Button>
      </div>

      <Card className={cardVariants.default}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <CardTitle className="text-2xl">{course.title}</CardTitle>
          {course.description && (
            <p className="text-slate-500 mt-2 leading-relaxed">{course.description}</p>
          )}
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
    </div>
  );
}
