import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStageById, getSubjectsByStage, type Subject } from '@/api/subjectApi';
import { getMyAssignments } from '@/api/teacherAssignmentApi';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, EntityCard, getEntityColor } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { cardVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

export default function TeacherSubjects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stageId } = useParams<{ stageId: string }>();
  const { user } = useAuth();

  const { data: stage } = useQuery({
    queryKey: ['stage', stageId],
    queryFn: () => getStageById(stageId!),
    enabled: !!stageId,
  });

  const { data: allSubjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId!),
    enabled: !!stageId,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
  });

  // Build a map: subjectId → first matching assignment (for this stage)
  const subjectToAssignment = new Map<string, (typeof assignments)[0]>();
  assignments
    .filter((a) => {
      const grade = a.gradeId;
      // Use String() to ensure ObjectId and string values compare correctly
      return typeof grade === 'object' && String(grade.stageId) === stageId;
    })
    .forEach((a) => {
      const subId = typeof a.subjectId === 'object' ? a.subjectId._id : a.subjectId;
      if (!subjectToAssignment.has(subId)) subjectToAssignment.set(subId, a);
    });

  // Show subjects from TeacherAssignment records OR from the teacher's profile subjectIds.
  // This covers both admin-assigned teachers and self-registered teachers using profile-level selections.
  const profileSubjectIds = user?.subjectIds ?? [];

  const isLoading = subjectsLoading || assignmentsLoading;
  const subjects = allSubjects.filter((s: Subject) =>
    subjectToAssignment.has(s._id) || profileSubjectIds.includes(s._id)
  );

  return (
    <div className={spacing.pageContainer}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('/teacher/subjects')}
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('stagesLabel')}
        </button>
        {stage && (
          <>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="flex items-center gap-1.5">
              <span>{stage.icon}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{getLocalizedName(stage, i18n.language)}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stage ? `${getLocalizedName(stage, i18n.language)} — ${t('subjectPlural')}` : t('subjectPlural')}
          </h1>
          {stage && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stage.description}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noSubjectsInStage')} />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <AnimatePresence>
            {subjects.map((subject: Subject, index) => {
              const colors = getEntityColor(subject.color ?? 'blue');
              const assignment = subjectToAssignment.get(subject._id);
              const gradeId = assignment ? (typeof assignment.gradeId === 'object' ? assignment.gradeId._id : assignment.gradeId) : undefined;
              return (
                <EntityCard
                  key={subject._id}
                  icon={subject.icon}
                  title={getLocalizedName(subject, i18n.language)}
                  description={subject.description}
                  color={colors}
                  animationDelay={index * 0.07}
                  onClick={() => navigate(`/teacher/subjects/${subject._id}`, {
                    state: { gradeId, assignmentId: assignment?._id },
                  })}
                  footer={
                    <>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {typeof subject.teacherId === 'object' ? subject.teacherId?.name : '—'}
                      </span>
                      <div className={`flex items-center gap-1 text-xs font-medium ${colors.text}`}>
                        <Eye className="w-3 h-3" /> {t('view')}
                      </div>
                    </>
                  }
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
