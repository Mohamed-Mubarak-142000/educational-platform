import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCourseById, getSections, getLessons } from '../api/courseApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';
import { PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/shared';

type TeacherRef = string | { _id: string; name: string };

type Course = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  teacherId?: TeacherRef;
};

type Section = {
  _id: string;
  title: string;
};

type Lesson = {
  _id: string;
  title: string;
  order: number;
  duration?: number;
  videoUrl?: string;
  pdfUrl?: string;
};

export default function CourseView() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id as string),
  });

  const { data: sections } = useQuery<Section[]>({
    queryKey: ['sections', id],
    queryFn: () => getSections(id as string),
    enabled: !!id
  });

  if (courseLoading) return <div className="p-8 max-w-5xl mx-auto flex items-center justify-center h-screen">{t('loadingCourse')}</div>;

  return (
    <div className="pb-16">
      <section className="pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[520px] h-[520px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[420px] h-[420px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {course?.thumbnail && (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={course.thumbnail}
                className="w-full lg:w-1/3 rounded-3xl shadow-2xl object-cover border border-white/20 dark:border-white/10"
                alt={course.title}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course?.title}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">{course?.description}</p>
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-medium">
                <span>{t('courseInstructorLabel')}: {typeof course?.teacherId === 'object' ? course?.teacherId?.name : course?.teacherId}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <Card className="shadow-lg border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle>{t('courseCurriculumTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue={sections?.[0]?._id} className="flex flex-col md:flex-row min-h-[500px]">
              <div className="md:w-64 border-r dark:border-slate-800">
                <ScrollArea className="h-[500px]">
                  <TabsList className="flex flex-col h-auto bg-transparent items-stretch p-0 rounded-none w-full">
                    {sections?.map((section) => (
                      <TabsTrigger 
                        key={section._id} 
                        value={section._id} 
                        className={`justify-start px-6 py-4 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:border-l-4 border-blue-600 rounded-none w-full ${isRtl ? 'text-right' : 'text-left'}`}
                      >
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </div>

              <div className="flex-1 p-6 bg-white dark:bg-slate-950">
                {sections?.map((section) => (
                  <TabsContent key={section._id} value={section._id} className="mt-0 outline-none">
                    <LessonsList sectionId={section._id} />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function LessonsList({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation();
  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons', sectionId],
    queryFn: () => getLessons(sectionId),
  });

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded"></div></div></div>;

  if (lessons?.length === 0) return <EmptyState description={t('noLessons')} className="py-8" />;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <PlayCircle className="w-5 h-5 text-blue-500"/> {t('courseLessonsTitle')}
      </h3>
      {lessons?.map((lesson) => (
        <div key={lesson._id} className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors flex items-center justify-between bg-slate-50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-inner">
               {lesson.order}
            </div>
            <div>
              <p className="font-medium text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lesson.title}</p>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                  {lesson.duration && <span>{lesson.duration} {t('minutesShort')}</span>}
                  {lesson.videoUrl && <span className="flex items-center gap-1"><PlayCircle className="w-4 h-4"/> {t('videoLabel')}</span>}
                  {lesson.pdfUrl && <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> {t('pdfLabel')}</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="group-hover:bg-blue-50 group-hover:text-blue-600 rounded-full">
            <CheckCircle className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Button>
        </div>
      ))}
    </div>
  );
}
