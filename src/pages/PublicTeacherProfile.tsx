/**
 * PublicTeacherProfile.tsx
 *
 * Public preview of a teacher's profile + content for a subject/grade.
 * No login required to browse: shows the teacher's full info and a preview
 * of what they offer (units, lesson titles). Only the first lesson of each
 * unit is playable — everything else stays locked until the student logs in
 * and subscribes via the private student flow (StudentSubjectDetail).
 *
 * "Request Live Lesson" uses the same modal as the student dashboard, but the
 * button only activates once the student is logged in.
 *
 * Route: /stages/:stageId/grades/:gradeId/subjects/:subjectId/teachers/:teacherId
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getGrades, getSubjectsByGrade, type Grade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getPublicAssignmentContent, type PublicAssignmentContent } from '@/api/teacherAssignmentApi';
import type { AssignmentContentLesson } from '@/api/teacherAssignmentApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import RequestLiveLessonModal from '@/components/RequestLiveLessonModal';
import {
  BookOpen, ChevronRight, Home, Lock, PlayCircle, Video, Users, Layers, FileText,
} from 'lucide-react';

function LessonPreview({ lesson }: { lesson: AssignmentContentLesson }) {
  if (lesson.videoUrl) {
    return <video controls src={lesson.videoUrl} className="w-full rounded-xl bg-black" />;
  }
  if (lesson.audioUrl) {
    return <audio controls src={lesson.audioUrl} className="w-full" />;
  }
  if (lesson.imageUrl) {
    return <img src={lesson.imageUrl} alt={lesson.title} className="w-full rounded-xl object-cover" />;
  }
  if (lesson.pdfUrl) {
    return (
      <a
        href={lesson.pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
      >
        <FileText className="w-4 h-4" />
        {lesson.title}
      </a>
    );
  }
  return null;
}

export default function PublicTeacherProfile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stageId, gradeId, subjectId, teacherId } = useParams<{
    stageId: string;
    gradeId: string;
    subjectId: string;
    teacherId: string;
  }>();

  const isRtl = i18n.language === 'ar';
  const [liveLessonOpen, setLiveLessonOpen] = useState(false);

  const { data: grades = [] } = useQuery<Grade[]>({
    queryKey: ['grades', stageId],
    queryFn: () => getGrades(stageId!),
    enabled: !!stageId,
  });
  const { data: subjects = [] } = useQuery<GradeSubjectSummary[]>({
    queryKey: ['grade-subjects', gradeId],
    queryFn: () => getSubjectsByGrade(gradeId!),
    enabled: !!gradeId,
  });

  const { data: content, isLoading: contentLoading } = useQuery<PublicAssignmentContent>({
    queryKey: ['public-assignment-content', subjectId, gradeId, teacherId],
    queryFn: () => getPublicAssignmentContent({ subjectId: subjectId!, gradeId: gradeId!, teacherId: teacherId! }),
    enabled: !!subjectId && !!gradeId && !!teacherId,
  });

  const grade = grades.find((g) => g._id === gradeId);
  const subject = subjects.find((s) => s._id === subjectId);
  const gradeName = grade ? getLocalizedName(grade, i18n.language) : '';
  const subjectName = subject ? (isRtl && subject.nameAr ? subject.nameAr : subject.name) : '';

  const teacher = content && typeof content.assignment.teacherId === 'object' ? content.assignment.teacherId : null;
  const teacherName = teacher?.name || t('unknownTeacher');
  const initial = teacherName.charAt(0).toUpperCase();
  const units = content?.units ?? [];
  const totalLessons = units.reduce((sum, u) => sum + (u.lessons?.length ?? 0), 0);

  const privateDetailPath = `/student/subjects/${subjectId}/teachers/${teacherId}`;

  const goToFullCourse = () => {
    if (user) {
      navigate(privateDetailPath, { state: { assignmentId: content?.assignment._id, stageId, gradeId } });
    } else {
      navigate(`/login?redirect=${encodeURIComponent(privateDetailPath)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
          <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <Home className="w-3.5 h-3.5" />
            {t('homeLabel')}
          </button>
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <button
            onClick={() => navigate(`/stages/${stageId}/grades/${gradeId}/subjects/${subjectId}`)}
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            {subjectName || t('subjectTeachersTitle')}
          </button>
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="font-medium text-slate-900 dark:text-slate-100">{teacherName}</span>
        </nav>

        {contentLoading ? (
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : !teacher ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t('stageNotFound')}</p>
          </div>
        ) : (
          <>
            {/* Teacher header */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-start">
                <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {teacher.profileImage ? (
                    <img src={teacher.profileImage} alt={teacherName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-500 dark:text-slate-300">{initial}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{teacherName}</h1>
                  {subjectName && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {subjectName} {gradeName && `• ${gradeName}`}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {teacher.bio || t('noBio')}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{units.length} {t(units.length === 1 ? 'unitSingular' : 'unitPlural')} • {totalLessons} {t('lessonsWord')}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white text-sm" onClick={goToFullCourse}>
                      {user ? t('viewFullCourseCta') : t('loginToAccessFullCourse')}
                    </Button>
                    {teacher.isAvailableForInstantLessons && (
                      <Button
                        variant="outline"
                        className="text-sm border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!user}
                        title={!user ? t('loginToRequestLiveLesson') : undefined}
                        onClick={() => setLiveLessonOpen(true)}
                      >
                        <Video className="w-3.5 h-3.5 me-2" />
                        {t('requestLiveLessonCta')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Units + lessons preview */}
            {units.length === 0 ? (
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardContent className="py-16 text-center text-slate-500 dark:text-slate-400">
                  {t('noTeacherContent')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {units.map((unit, uIdx) => (
                  <motion.div
                    key={unit._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: uIdx * 0.05 }}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-violet-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {unit.order ?? uIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{unit.title}</p>
                          {unit.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{unit.description}</p>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
                        {(unit.lessons ?? []).map((lesson) => (
                          <div key={lesson._id} className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {lesson.isUnlocked ? (
                                <PlayCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-medium flex-1 truncate ${lesson.isUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                {lesson.title}
                              </span>
                              {lesson.isUnlocked ? (
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex-shrink-0">
                                  {t('freePreview')}
                                </span>
                              ) : (
                                <button
                                  onClick={goToFullCourse}
                                  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                                >
                                  {t('lockedUnit')}
                                </button>
                              )}
                            </div>
                            {lesson.isUnlocked && (
                              <div className="mt-3">
                                <LessonPreview lesson={lesson} />
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {content && teacher && (
        <RequestLiveLessonModal
          isOpen={liveLessonOpen}
          onClose={() => setLiveLessonOpen(false)}
          teacherId={teacher._id}
          teacherName={teacherName}
          teacherPricePerHour={teacher.instantLessonPricePerHour ?? 100}
          subjectId={subjectId}
          subjectName={subjectName}
          gradeId={gradeId}
        />
      )}

      <SiteFooter />
    </div>
  );
}
