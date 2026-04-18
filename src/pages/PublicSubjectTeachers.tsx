/**
 * PublicSubjectTeachers.tsx
 *
 * Public page showing all teachers for a selected subject + grade.
 * Accessed from PublicGradeSubjects (Home → Stage → Grade → Subject → this page).
 * No login required to browse; "View Full Profile" requires login.
 *
 * Route: /stages/:stageId/grades/:gradeId/subjects/:subjectId
 * Teachers are filtered by: stageId (via gradeId), gradeId, and subjectId
 */
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStages, type Stage } from '@/api/subjectApi';
import { getGrades, getSubjectsByGrade, type Grade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getPublicAssignments, type TeacherAssignment } from '@/api/teacherAssignmentApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Home, Star, User, Users } from 'lucide-react';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { useAuth } from '@/context/AuthContext';

const CARD_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

function getPopulatedTeacher(assignment: TeacherAssignment) {
  return typeof assignment.teacherId === 'object' ? assignment.teacherId : null;
}

function getPopulatedSubject(assignment: TeacherAssignment) {
  return typeof assignment.subjectId === 'object' ? assignment.subjectId : null;
}

export default function PublicSubjectTeachers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stageId, gradeId, subjectId } = useParams<{
    stageId: string;
    gradeId: string;
    subjectId: string;
  }>();

  const isRtl = i18n.language === 'ar';

  // Breadcrumb data
  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

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

  const { data: assignments = [], isLoading } = useQuery<TeacherAssignment[]>({
    queryKey: ['public-assignments', subjectId, gradeId],
    queryFn: () => getPublicAssignments({ subjectId, gradeId }),
    enabled: !!subjectId && !!gradeId,
  });

  const stage = stages.find((s) => s._id === stageId);
  const grade = grades.find((g) => g._id === gradeId);
  const subject = subjects.find((s) => s._id === subjectId);

  const stageName = stage ? getLocalizedName(stage, i18n.language) : '';
  const gradeName = grade ? getLocalizedName(grade, i18n.language) : '';
  const subjectName = subject
    ? (i18n.language === 'ar' && subject.nameAr ? subject.nameAr : subject.name)
    : '';

  // Deduplicate assignments by teacher _id
  const uniqueAssignments = assignments.reduce<TeacherAssignment[]>((acc, a) => {
    const tid = typeof a.teacherId === 'object' ? a.teacherId._id : a.teacherId;
    if (!acc.some((x) => (typeof x.teacherId === 'object' ? x.teacherId._id : x.teacherId) === tid)) {
      acc.push(a);
    }
    return acc;
  }, []);

  // When user clicks a teacher card, require login if not authenticated
  const handleViewProfile = (assignment: TeacherAssignment) => {
    const teacherId = typeof assignment.teacherId === 'object' ? assignment.teacherId._id : assignment.teacherId;
    if (!teacherId || !subjectId) return;

    const target = `/student/subjects/${subjectId}/teachers/${teacherId}`;
    if (user) {
      navigate(target, { state: { assignmentId: assignment._id, stageId } });
    } else {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      <SiteNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            {t('homeLabel')}
          </button>
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <button
            onClick={() => navigate('/stages')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t('allStagesPageTitle')}
          </button>
          {stageName && (
            <>
              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              <button
                onClick={() => navigate(`/stages/${stageId}`)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {stageName}
              </button>
            </>
          )}
          {gradeName && (
            <>
              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              <button
                onClick={() => navigate(`/stages/${stageId}/grades/${gradeId}`)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {gradeName}
              </button>
            </>
          )}
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {subjectName || t('subjectTeachersTitle')}
          </span>
        </nav>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {subjectName
                ? (isRtl ? `${t('teachersWord')} — ${subjectName}` : `${subjectName} — ${t('teachersWord')}`)
                : t('subjectTeachersTitle')}
            </h1>
            {gradeName && (
              <p className="text-slate-500 dark:text-slate-400">
                {t('forGradeLabel')}: <span className="font-medium text-slate-700 dark:text-slate-300">{gradeName}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/stages/${stageId}/grades/${gradeId}`)}
            className={`flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors self-start ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t('backToSubjects')}
          </button>
        </div>

        {/* Subject info badge */}
        {subject && (
          <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-xl flex-shrink-0">
              {subject.icon || '📖'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{subjectName}</p>
              {subject.description && (
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{subject.description}</p>
              )}
            </div>
            {gradeName && (
              <span className="ms-auto text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300 whitespace-nowrap flex-shrink-0">
                {gradeName}
              </span>
            )}
          </div>
        )}

        {/* Teachers grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : uniqueAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">{t('noTeachersForSubject')}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">{t('checkBackSoon')}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            <AnimatePresence>
              {uniqueAssignments.map((assignment, idx) => {
                const teacher = getPopulatedTeacher(assignment);
                const subjectPopulated = getPopulatedSubject(assignment);
                if (!teacher) return null;

                const teacherName = teacher.name || t('unknownTeacher');
                const initial = teacherName.charAt(0).toUpperCase();
                const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

                return (
                  <motion.div
                    key={assignment._id}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.28 }}
                    layout
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 rounded-2xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      {/* Gradient header */}
                      <div className={`h-20 bg-gradient-to-r ${gradient} relative`}>
                        {assignment.isPrimary && (
                          <div className="absolute top-3 end-3 flex items-center gap-1 bg-white/25 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            {t('primaryTeacher')}
                          </div>
                        )}
                      </div>

                      <CardContent className="p-5">
                        {/* Avatar + name row */}
                        <div className="flex items-center gap-3 -mt-12 mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {teacher.profileImage ? (
                              <img
                                src={teacher.profileImage}
                                alt={teacherName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-slate-500 dark:text-slate-300">
                                {initial}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 pt-9">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{teacherName}</p>
                            {subjectPopulated && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                {getLocalizedName(subjectPopulated as { name: string; nameAr?: string }, i18n.language)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        {teacher.bio ? (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-5 min-h-[3.5rem] leading-relaxed">
                            {teacher.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-5 min-h-[3.5rem]">
                            {t('noBio')}
                          </p>
                        )}

                        {/* Action */}
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          onClick={() => handleViewProfile(assignment)}
                        >
                          <User className="w-3.5 h-3.5 me-2" />
                          {user ? t('viewTeacherProfile') : t('loginToViewProfile')}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
