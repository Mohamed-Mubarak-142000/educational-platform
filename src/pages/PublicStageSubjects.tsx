/**
 * PublicStageSubjects.tsx
 *
 * Public page showing all grades within a selected stage.
 * Accessed from the Home Page → Educational Stages section.
 * No login required to browse.
 *
 * Route: /stages/:stageId
 * Flow:  Home → [this page] → PublicGradeSubjects → PublicSubjectTeachers
 */
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStages, type Stage } from '@/api/subjectApi';
import { getGrades, type Grade } from '@/api/gradeApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Layers } from 'lucide-react';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';

// ─── Stage colour palette (matching PublicAllStages) ───────────────────────
const STAGE_PALETTES = [
  { bg: 'from-blue-600 to-indigo-600', chip: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/60' },
  { bg: 'from-emerald-600 to-teal-600', chip: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-800/60' },
  { bg: 'from-violet-600 to-purple-600', chip: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-700 hover:bg-violet-200 dark:hover:bg-violet-800/60' },
  { bg: 'from-amber-500 to-orange-600', chip: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/60' },
  { bg: 'from-rose-500 to-pink-600', chip: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800/60' },
] as const;

function getStagePalette(stageColor?: string, index = 0) {
  const byName: Record<string, number> = {
    blue: 0, indigo: 0,
    emerald: 1, teal: 1, green: 1,
    violet: 2, purple: 2,
    amber: 3, orange: 3, yellow: 3,
    rose: 4, pink: 4, red: 4,
  };
  const idx = stageColor && byName[stageColor] !== undefined ? byName[stageColor] : index % STAGE_PALETTES.length;
  return STAGE_PALETTES[idx];
}

export default function PublicStageSubjects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stageId } = useParams<{ stageId: string }>();

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const stage = stages.find((s) => s._id === stageId);
  const stageName = stage ? getLocalizedName(stage, i18n.language) : '';
  const stagePalette = getStagePalette(stage?.color, 0);

  const { data: grades = [], isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ['grades', stageId],
    queryFn: () => getGrades(stageId!),
    enabled: !!stageId,
  });

  const sortedGrades = grades.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar />

      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className={`flex items-center gap-1.5 text-sm text-violet-200 mb-6 flex-wrap ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              {t('homeLabel')}
            </button>
            <span>/</span>
            <span className="text-white font-medium">{stageName || t('loading')}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={isRtl ? 'text-right' : 'text-left'}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {stageName}
            </h1>
            <p className="text-violet-200 text-lg max-w-2xl">
              {t('stageGradesSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {gradesLoading ? (
          <div className="space-y-4">
            <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        ) : !stage ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-4">
              📚
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t('stageNotFound')}</p>
          </div>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Stage header card */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${stagePalette.bg} text-white shadow-lg`}>
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
                {stage.icon || '📚'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold leading-tight">{stageName}</h2>
                <p className="text-sm text-white/80">
                  {t('gradesCountLabel', { count: sortedGrades.length })}
                </p>
              </div>
              <Layers className="w-5 h-5 text-white/60 flex-shrink-0" />
            </div>

            {/* Grade cards */}
            {sortedGrades.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 opacity-70 px-2">{t('noGradesInStage')}</p>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                <AnimatePresence>
                  {sortedGrades.map((grade) => (
                    <motion.button
                      key={grade._id}
                      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => navigate(`/stages/${stageId}/grades/${grade._id}`)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${stagePalette.chip}`}
                    >
                      <span className="text-sm font-semibold leading-snug">
                        {getLocalizedName(grade, i18n.language)}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${isRtl ? 'rotate-180' : ''}`} />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
