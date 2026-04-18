import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStages, getSubjectsByStage, type Stage, type Subject } from '@/api/subjectApi';
import { getMyAssignments } from '@/api/teacherAssignmentApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, PageHeader } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';
import { cardVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

const STAGE_COLORS = [
  { value: 'emerald', bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'blue', bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'violet', bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
] as const;

function getStageColor(color: string) {
  return STAGE_COLORS.find((c) => c.value === color) ?? STAGE_COLORS[1];
}

function StageSubjectCount({ stageId }: { stageId: string }) {
  const { t } = useTranslation();
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId),
  });
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
      <BookOpen className="w-3.5 h-3.5" />
      {subjects.length} {t(subjects.length === 1 ? 'subjectSingular' : 'subjectPlural')}
    </span>
  );
}

export default function TeacherStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: allStages = [], isLoading: stagesLoading } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
  });

  // Derive assigned stage IDs from the teacher's assignments via gradeId.stageId
  const assignedStageIds = new Set<string>(
    assignments
      .map((a) => {
        const grade = a.gradeId;
        return typeof grade === 'object' ? grade.stageId ?? null : null;
      })
      .filter((id): id is string => !!id)
  );

  const isLoading = stagesLoading || assignmentsLoading;
  const stages = allStages.filter((s) => assignedStageIds.has(s._id));

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('educationStages')}
        subtitle={t('manageStagesSubtitle')}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noAssignedStages')} />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <AnimatePresence>
            {stages.map((stage: Stage) => {
              const colors = getStageColor(stage.color ?? 'blue');
              return (
                <motion.div
                  key={stage._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  <Card
                    className={`${cardVariants.interactive} rounded-2xl overflow-hidden group cursor-pointer`}
                    onClick={() => navigate(`/teacher/stages/${stage._id}/subjects`)}
                  >
                    {/* Gradient header */}
                    <div className={`h-3 w-full bg-gradient-to-r ${colors.bg}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center text-2xl shadow-sm border ${colors.border}`}>
                            {stage.icon}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${colors.text}`}>{getLocalizedName(stage, i18n.language)}</h3>
                            <StageSubjectCount stageId={stage._id} />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{stage.description || ''}</p>
                      <div className={`flex items-center justify-between pt-3 border-t ${colors.border}`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {t('stageOrder', { n: stage.order ?? 0 })}
                        </span>
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${colors.text} group-hover:gap-2.5 transition-all`}>
                          {t('viewSubjects')}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
