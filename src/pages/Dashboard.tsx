import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCourses, enrollCourse, type Course } from '../api/courseApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/shared';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: courses = [], isLoading, refetch } = useQuery<Course[]>({ queryKey: ['courses'], queryFn: () => getCourses() });
  
  const enrollMutation = useMutation({ 
    mutationFn: enrollCourse, 
    onSuccess: () => { 
      refetch(); 
      alert(t('enrollSuccess')); 
    },
    onError: (err: unknown) => {
      const typedError = err as { response?: { data?: { message?: string } } };
      alert(typedError.response?.data?.message || t('enrollFailed'));
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center items-center h-full">{t('loadingCourses')}</div>;

  return (
    <div className="pb-16">
      <section className="pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[520px] h-[520px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[420px] h-[420px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                <BookOpen className="w-4 h-4" /> {t('courses')}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {t('dashboardTitle')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                {t('dashboardSubtitle')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        {courses.length === 0 && (
          <EmptyState description={t('dashboardEmpty')} className="py-10" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: Course, index: number) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="hover:shadow-2xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 overflow-hidden flex flex-col h-full">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-400">{t('noImage')}</span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    {t('courseInstructorLabel')}: {typeof course.teacherId === 'object' ? course.teacherId?.name : course.teacherId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between mt-auto pt-6 border-t dark:border-slate-800">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    ${course.price}
                  </span>
                  <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Button variant="secondary" onClick={() => enrollMutation.mutate(course._id)} disabled={enrollMutation.isPending}>
                      {t('enrollAction')}
                    </Button>
                    <Link to={`/courses/${course._id}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                        {t('viewCourseAction')}
                        <ArrowRight className={`w-4 h-4 ml-2 ${isRtl ? 'mr-2 ml-0 rotate-180' : ''}`} />
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
