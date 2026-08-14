/**
 * StudentSubjectTeachers.tsx
 *
 * Shows all teachers who teach a specific subject in the student's grade.
 * Student picks a teacher → enters that teacher's course (units/lessons).
 *
 * Route: /student/subjects/:subjectId/teachers
 * State: { gradeId }
 */
import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSubjectById, getSubjectTeachers, type SubjectTeacherAssignment } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState, SearchInput } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Star } from 'lucide-react';
import { spacing } from '@/lib/constants';

const CARD_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

function TeacherCard({
  assignment,
  index,
  onSelect,
}: {
  assignment: SubjectTeacherAssignment;
  index: number;
  onSelect: () => void;
}) {
  const { t, i18n } = useTranslation();
  const teacher = typeof assignment.teacherId === 'object' ? assignment.teacherId : null;
  const subject = typeof assignment.subjectId === 'object' ? assignment.subjectId : null;
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const subjectPrice = assignment.subjectPrice && assignment.subjectPrice > 0 ? assignment.subjectPrice : 300;
  const currencyLabel = t('currencyEgp');

  const teacherName = teacher?.name ?? t('unknownTeacher');
  const teacherImage = teacher?.profileImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      layout
    >
      <Card
        className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group aspect-square"
        onClick={onSelect}
      >
        <CardContent className="p-0 h-full">
          <div className="flex flex-col h-full">
            <div className="relative w-full flex-1 min-h-0 overflow-hidden">
              {teacherImage ? (
                <img
                  src={teacherImage}
                  alt={teacherName}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {teacherName}
                </h3>
                {subject && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {getLocalizedName(subject, i18n.language)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  4.8
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{subjectPrice} {currencyLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TeacherCardSkeleton({ index }: { index: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse aspect-square flex flex-col">
      <div className="relative w-full flex-1 min-h-0 bg-slate-100 dark:bg-slate-800">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      </div>
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function StudentSubjectTeachers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, id } = useParams<{ subjectId?: string; id?: string }>();
  const { user } = useAuth();

  const resolvedSubjectId = subjectId ?? id;

  const gradeId = (location.state?.gradeId as string | undefined) ?? user?.gradeId ?? '';
  const stageId = (location.state?.stageId as string | undefined) ?? user?.stageId ?? '';

  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', resolvedSubjectId],
    queryFn: () => getSubjectById(resolvedSubjectId!),
    enabled: !!resolvedSubjectId,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<SubjectTeacherAssignment[]>({
    queryKey: ['subject-teachers', resolvedSubjectId],
    queryFn: () => getSubjectTeachers(resolvedSubjectId!),
    enabled: !!resolvedSubjectId && (!!gradeId || !!stageId),
  });

  // Deduplicate by teacher _id
  const uniqueAssignments = assignments.reduce<SubjectTeacherAssignment[]>((acc, a) => {
    const tid = typeof a.teacherId === 'object' ? a.teacherId._id : a.teacherId;
    if (!acc.some((x) => (typeof x.teacherId === 'object' ? x.teacherId._id : x.teacherId) === tid)) {
      acc.push(a);
    }
    return acc;
  }, []);

  const [teacherSearch, setTeacherSearch] = useState('');
  const filteredAssignments = teacherSearch.trim()
    ? uniqueAssignments.filter((a) => {
        const teacher = typeof a.teacherId === 'object' ? a.teacherId : null;
        return (teacher?.name ?? '').toLowerCase().includes(teacherSearch.trim().toLowerCase());
      })
    : uniqueAssignments;

  const isLoading = subjectLoading || assignmentsLoading || !subject || assignments === undefined;

  const handleSelectTeacher = (assignment: SubjectTeacherAssignment) => {
    const teacherId = typeof assignment.teacherId === 'object' ? assignment.teacherId._id : assignment.teacherId;
    // Navigate to teacher-scoped subject view
    navigate(`/student/subjects/${resolvedSubjectId}/teachers/${teacherId}`, {
      state: { gradeId, stageId },
    });
  };

  if (!resolvedSubjectId) {
    return (
      <div className={spacing.pageContainer}>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noSubjectsAvailable')} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gradeId && !stageId) {
    return (
      <div className={spacing.pageContainer}>
        <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="py-10 text-center space-y-4">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{t('noStageSet')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('setStageInProfile')}</p>
            <Button onClick={() => navigate('/student')} className="bg-violet-600 hover:bg-violet-700 text-white">
              {t('goToProfile')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={spacing.pageContainer}>
      {/* Back button + header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/learn')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Button>
        {subject && (
          <>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{subject.icon}</span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {getLocalizedName(subject, i18n.language)}
              </h1>
            </div>
          </>
        )}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {t('selectTeacherPrompt')}
      </p>

      {!isLoading && uniqueAssignments.length > 0 && (
        <SearchInput
          value={teacherSearch}
          onChange={setTeacherSearch}
          placeholder={t('searchTeacherPlaceholder')}
          className="w-full sm:w-72 mb-6"
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <TeacherCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : uniqueAssignments.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noTeachersForSubject')} />
          </CardContent>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noTeachersMatchSearch', { defaultValue: 'No teachers match your search.' })} />
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" initial="hidden" animate="visible">
          <AnimatePresence>
            {filteredAssignments.map((assignment, index) => (
              <TeacherCard
                key={assignment._id}
                assignment={assignment}
                index={index}
                onSelect={() => handleSelectTeacher(assignment)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
