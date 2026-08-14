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
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStages, type Stage } from '@/api/subjectApi';
import { getGrades, getSubjectsByGrade, type Grade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getPublicAssignments, type TeacherAssignment } from '@/api/teacherAssignmentApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Home, Star, User, Users, Video } from 'lucide-react';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { useAuth } from '@/context/AuthContext';
import RequestLiveLessonModal from '@/components/RequestLiveLessonModal';

// A dangling assignment (its teacher/subject User or Subject document was
// deleted) populates as null rather than a string id — typeof null is
// 'object' too, so every check here must exclude null explicitly.
function getPopulatedTeacher(assignment: TeacherAssignment) {
  return assignment.teacherId && typeof assignment.teacherId === 'object' ? assignment.teacherId : null;
}

function getPopulatedSubject(assignment: TeacherAssignment) {
  return assignment.subjectId && typeof assignment.subjectId === 'object' ? assignment.subjectId : null;
}

function getTeacherId(assignment: TeacherAssignment): string | null {
  const { teacherId } = assignment;
  if (!teacherId) return null;
  return typeof teacherId === 'object' ? teacherId._id : teacherId;
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
  const [liveLessonAssignment, setLiveLessonAssignment] = useState<TeacherAssignment | null>(null);

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

  // Deduplicate assignments by teacher _id — assignments whose teacher was
  // deleted (no resolvable id) are dropped rather than shown broken.
  const uniqueAssignments = assignments.reduce<TeacherAssignment[]>((acc, a) => {
    const tid = getTeacherId(a);
    if (!tid) return acc;
    if (!acc.some((x) => getTeacherId(x) === tid)) {
      acc.push(a);
    }
    return acc;
  }, []);

  const [teacherSearch, setTeacherSearch] = useState('');
  const filteredAssignments = teacherSearch.trim()
    ? uniqueAssignments.filter((a) => {
        const teacher = getPopulatedTeacher(a);
        return (teacher?.name ?? '').toLowerCase().includes(teacherSearch.trim().toLowerCase());
      })
    : uniqueAssignments;

  // Teacher profiles are public — no login required to browse them.
  const handleViewProfile = (assignment: TeacherAssignment) => {
    const teacherId = getTeacherId(assignment);
    if (!teacherId || !subjectId || !gradeId) return;

    navigate(`/stages/${stageId}/grades/${gradeId}/subjects/${subjectId}/teachers/${teacherId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            {t('homeLabel')}
          </button>
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <button
            onClick={() => navigate('/stages')}
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            {t('allStagesPageTitle')}
          </button>
          {stageName && (
            <>
              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              <button
                onClick={() => navigate(`/stages/${stageId}`)}
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
            className={`flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors self-start ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t('backToSubjects')}
          </button>
        </div>

        {/* Subject info badge */}
        {subject && (
          <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-700 flex items-center justify-center text-xl flex-shrink-0">
              {subject.icon || '📖'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-violet-800 dark:text-violet-200 text-sm">{subjectName}</p>
              {subject.description && (
                <p className="text-xs text-violet-600 dark:text-violet-400 truncate">{subject.description}</p>
              )}
            </div>
            {gradeName && (
              <span className="ms-auto text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-800/60 text-violet-700 dark:text-violet-300 whitespace-nowrap flex-shrink-0">
                {gradeName}
              </span>
            )}
          </div>
        )}

        {/* Search */}
        {!isLoading && uniqueAssignments.length > 0 && (
          <SearchInput
            value={teacherSearch}
            onChange={setTeacherSearch}
            placeholder={t('searchTeacherPlaceholder')}
            className="w-full sm:w-72 mb-6"
          />
        )}

        {/* Teachers grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {t('noTeachersMatchSearch', { defaultValue: 'No teachers match your search.' })}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            <AnimatePresence>
              {filteredAssignments.map((assignment) => {
                const teacher = getPopulatedTeacher(assignment);
                const subjectPopulated = getPopulatedSubject(assignment);
                if (!teacher) return null;

                const teacherName = teacher.name || t('unknownTeacher');
                const initial = teacherName.charAt(0).toUpperCase();

                return (
                  <motion.div
                    key={assignment._id}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.28 }}
                    layout
                  >
                    <Card className="relative border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 rounded-2xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      {assignment.isPrimary && (
                        <div className="absolute top-3 end-3 z-10 flex items-center gap-1 bg-violet-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          {t('primaryTeacher')}
                        </div>
                      )}

                      <CardContent className="p-6 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 mb-4">
                          {teacher.profileImage ? (
                            <img
                              src={teacher.profileImage}
                              alt={teacherName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-bold text-slate-500 dark:text-slate-300">
                              {initial}
                            </span>
                          )}
                        </div>

                        {/* Name + subject */}
                        <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate w-full">{teacherName}</p>
                        {subjectPopulated && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 truncate w-full mt-1">
                            <BookOpen className="w-3 h-3 flex-shrink-0" />
                            {getLocalizedName(subjectPopulated as { name: string; nameAr?: string }, i18n.language)}
                          </p>
                        )}

                        {/* Bio */}
                        {teacher.bio ? (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mt-4 mb-5 min-h-[3.5rem] leading-relaxed">
                            {teacher.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic mt-4 mb-5 min-h-[3.5rem]">
                            {t('noBio')}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="w-full space-y-2">
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm"
                            onClick={() => handleViewProfile(assignment)}
                          >
                            <User className="w-3.5 h-3.5 me-2" />
                            {t('viewTeacherProfile')}
                          </Button>
                          {teacher.isAvailableForInstantLessons && (
                            <Button
                              variant="outline"
                              className="w-full text-sm border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                              disabled={!user}
                              title={!user ? t('loginToRequestLiveLesson') : undefined}
                              onClick={() => setLiveLessonAssignment(assignment)}
                            >
                              <Video className="w-3.5 h-3.5 me-2" />
                              {t('requestLiveLessonCta')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {liveLessonAssignment && (() => {
        const teacher = getPopulatedTeacher(liveLessonAssignment);
        const subjectPopulated = getPopulatedSubject(liveLessonAssignment);
        if (!teacher) return null;
        return (
          <RequestLiveLessonModal
            isOpen={!!liveLessonAssignment}
            onClose={() => setLiveLessonAssignment(null)}
            teacherId={teacher._id}
            teacherName={teacher.name || t('unknownTeacher')}
            teacherPricePerHour={teacher.instantLessonPricePerHour ?? 100}
            subjectId={subjectId}
            subjectName={subjectPopulated ? getLocalizedName(subjectPopulated as { name: string; nameAr?: string }, i18n.language) : subjectName}
            gradeId={gradeId}
          />
        );
      })()}

      <SiteFooter />
    </div>
  );
}
