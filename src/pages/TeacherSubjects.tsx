import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStageById, getSubjectsByStage, type Subject } from '@/api/subjectApi';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { cardVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

const SUBJECT_COLORS = [
  { value: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { value: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
] as const;

function getColorClasses(color: string) {
  return SUBJECT_COLORS.find((c) => c.value === color) ?? SUBJECT_COLORS[1];
}

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

  const { data: allSubjects = [], isLoading } = useQuery({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId!),
    enabled: !!stageId,
  });

  // Filter to only subjects assigned to the teacher
  const assignedSubjectIds = new Set<string>(user?.subjectIds ?? []);
  const subjects = allSubjects.filter((s: Subject) => assignedSubjectIds.has(s._id));

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
            {subjects.map((subject: Subject) => {
              const colors = getColorClasses(subject.color ?? 'blue');
              return (
                <motion.div
                  key={subject._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  layout
                >
                  <Card
                    className={`${cardVariants.interactive} rounded-2xl overflow-hidden group`}
                    onClick={() => navigate(`/teacher/subjects/${subject._id}`)}
                  >
                    <div className={`h-1.5 w-full ${colors.bg.replace('/30', '')}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center text-xl shadow-sm border ${colors.border}`}>
                          {subject.icon}
                        </div>
                      </div>
                      <h3 className={`font-bold text-base mb-1 ${colors.text}`}>{getLocalizedName(subject, i18n.language)}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{subject.description}</p>
                      <div className={`flex items-center justify-between pt-2 border-t ${colors.border}`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {typeof subject.teacherId === 'object' ? subject.teacherId?.name : '—'}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${colors.text}`}>
                          <Eye className="w-3 h-3" /> {t('view')}
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
