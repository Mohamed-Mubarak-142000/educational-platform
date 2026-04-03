import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeachers } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Mail, Phone, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spacing, cardVariants } from '@/lib/constants';

export default function AdminTeacherDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
  });

  const teacher = teachers.find((t: any) => t._id === id);

  if (isLoading) {
    return <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>Loading...</div>;
  }

  if (!teacher) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('teacherNotFound') || 'Teacher not found'}</p>
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
    </div>
  );
}
