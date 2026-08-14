import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/Accordion';
import { Carousel } from '@/components/ui/Carousel';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, GraduationCap, Users, LayoutDashboard, ArrowRight, Activity, Star, Quote,
  TrendingUp, Play, FileText, Volume2, Layers, Award, Zap, Shield, BarChart2,
  Clock, MessageSquare, Globe, Heart, Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import TeacherApplicationSection from '@/components/TeacherApplicationSection';
import { useQuery } from '@tanstack/react-query';
import { getStages, getStageSubjectCounts, type Stage } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { ScrollToTop } from '@/components/ScrollToTop';
import { EntityCard, getEntityColor } from '@/components/shared';
import { usePlatformConfig } from '@/context/PlatformConfigContext';
import type { LandingSection, StatItem, SectionBlock } from '@/api/platformConfigApi';
import { fetchPlatformStats, type PlatformStats } from '@/api/platformConfigApi';
import type { NavLink } from '@/components/ui/SiteNavbar';

// ─── Icon registry ────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ className?: string }>;
const ICON_MAP: Record<string, LucideIcon> = {
  Users, BookOpen, TrendingUp, GraduationCap, Award, Zap, Shield, BarChart2,
  Clock, MessageSquare, Globe, Heart, CheckCircle, Lightbulb, Layers, Activity,
};
const resolveIcon = (name: string): LucideIcon => ICON_MAP[name] ?? Users;

const STAT_PALETTES = [
  { text: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { text: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { text: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40' },
  { text: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  { text: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  { text: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/40' },
];

// ─── Scroll-triggered animation variants ─────────────────────────────────────
// Applied via whileInView so each section animates in as it enters the viewport.
const fadeInLeft = { hidden: { opacity: 0, x: -70 }, visible: { opacity: 1, x: 0 } };
const fadeInRight = { hidden: { opacity: 0, x: 70 }, visible: { opacity: 1, x: 0 } };
const zoomIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
const zoomOut = { hidden: { opacity: 0, scale: 1.2 }, visible: { opacity: 1, scale: 1 } };
const fadeInUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
/** Alternates left/right by index — used for side-by-side items so they converge from both edges. */
const sideVariant = (i: number) => (i % 2 === 0 ? fadeInLeft : fadeInRight);
// once: false — replays every time a section crosses the viewport threshold, scrolling either direction.
const SECTION_VIEWPORT = { once: false, amount: 0.3 } as const;
const EASE_OUT = { duration: 0.9, ease: 'easeInOut' as const };

// ─── Section renderers ────────────────────────────────────────────────────────

// Keys that map a stat's `key` field to a live DB metric in PlatformStats.
const LIVE_STAT_MAP: Partial<Record<string, keyof PlatformStats>> = {
  students: 'students',
  teachers: 'teachers',
  lessons: 'lessons',
  units: 'units',
  subjects: 'subjects',
};

function StatSkeleton() {
  return <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mx-auto" />;
}

function StatsSection({ section, isRtl, liveStats }: { section: LandingSection; isRtl: boolean; liveStats?: PlatformStats }) {
  const stats: StatItem[] = section.stats ?? [];
  const isResolved = liveStats !== undefined;
  return (
    <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid gap-8 ${
          stats.length <= 2 ? 'grid-cols-2' :
          stats.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {stats.map((stat, i) => {
            const palette = STAT_PALETTES[i % STAT_PALETTES.length];
            const Icon = resolveIcon(stat.iconName);
            return (
              <motion.div key={stat.key} variants={sideVariant(i)} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={{ ...EASE_OUT, delay: i * 0.18 }} className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`p-4 rounded-2xl ${palette.bg} ${palette.text} shadow-inner`}><Icon className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight" dir="ltr">
                    {isResolved ? (() => {
                      const liveKey = LIVE_STAT_MAP[stat.key];
                      const liveValue = liveKey && liveStats ? liveStats[liveKey] : undefined;
                      const value = liveValue !== undefined && liveValue !== null ? liveValue : stat.value;
                      return <AnimatedCounter value={value} suffix={isRtl && stat.suffix === '%' ? '٪' : stat.suffix} decimals={stat.decimals} />;
                    })() : <StatSkeleton />}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{isRtl ? stat.labelAr : stat.labelEn}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ section, isRtl }: { section: LandingSection; isRtl: boolean }) {
  const { t } = useTranslation();
  const title = isRtl ? section.titleAr : section.titleEn;
  const description = isRtl ? section.descriptionAr : section.descriptionEn;
  const studentItems = [
    { title: t('featStudent1'), content: t('featStudent1Desc') },
    { title: t('featStudent2'), content: t('featStudent2Desc') },
    { title: t('featStudent3'), content: t('featStudent3Desc') },
    { title: t('featStudent4'), content: t('featStudent4Desc') },
  ];
  const teacherItems = [
    { title: t('featTeacher1'), content: t('featTeacher1Desc') },
    { title: t('featTeacher2'), content: t('featTeacher2Desc') },
    { title: t('featTeacher3'), content: t('featTeacher3Desc') },
    { title: t('featTeacher4'), content: t('featTeacher4Desc') },
  ];
  const adminItems = [
    { title: t('featAdmin1'), content: t('featAdmin1Desc') },
    { title: t('featAdmin2'), content: t('featAdmin2Desc') },
    { title: t('featAdmin3'), content: t('featAdmin3Desc') },
    { title: t('featAdmin4'), content: t('featAdmin4Desc') },
  ];
  const contentTypes = [
    { Icon: Play, label: t('lessonTypeVideo'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { Icon: FileText, label: t('lessonTypePdf'), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { Icon: Volume2, label: t('lessonTypeAudio'), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { Icon: Layers, label: t('lessonType3D'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  ];
  return (
    <section id="features" className="scroll-mt-20 py-24 relative overflow-hidden bg-slate-50/80 dark:bg-slate-900/40">
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[520px] h-[520px] bg-violet-400/20 dark:bg-violet-900/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[520px] h-[520px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {(title || description) && (
          <motion.div variants={zoomIn} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT} className="text-center max-w-4xl mx-auto">
            {title && <h2 className="text-3xl md:text-5xl font-bold dark:text-white mb-6">{title}</h2>}
            {description && <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>}
          </motion.div>
        )}

        {/* Three-column feature cards — left / zoom / right, so the row converges from both edges plus a centered zoom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Features */}
          <motion.div variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT}>
            <Card className="h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className={`p-7 space-y-6 flex flex-col h-full ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-13 h-13 w-14 h-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/30 shrink-0">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('studentFeatures')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('unlockPotential')}</p>
                </div>
                <div className="flex-1">
                  <Accordion items={studentItems} isRtl={isRtl} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Teacher Features */}
          <motion.div variants={zoomIn} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={{ ...EASE_OUT, delay: 0.18 }}>
            <Card className="h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className={`p-7 space-y-6 flex flex-col h-full ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('teacherFeatures')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('createExperiences')}</p>
                </div>
                <div className="flex-1">
                  <Accordion items={teacherItems} isRtl={isRtl} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Features */}
          <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={{ ...EASE_OUT, delay: 0.36 }}>
            <Card className="h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className={`p-7 space-y-6 flex flex-col h-full ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('adminFeatures')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('manageAllPlatform')}</p>
                </div>
                <div className="flex-1">
                  <Accordion items={adminItems} isRtl={isRtl} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lesson Content Types — full-width showcase */}
        <motion.div variants={zoomOut} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT}>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <p className={`text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t('lessonContentTypes')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {contentTypes.map(({ Icon, label, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-5 flex flex-col items-center gap-3 text-center`}>
                    <div className={`${color} w-10 h-10 flex items-center justify-center`}><Icon className="w-8 h-8" /></div>
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function StagesSection({ section, isRtl }: { section: LandingSection; isRtl: boolean }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const title = isRtl ? section.titleAr : section.titleEn;
  const description = isRtl ? section.descriptionAr : section.descriptionEn;

  const { data: apiStages = [], isLoading: stagesLoading, isError: stagesError } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  const { data: subjectCounts, isLoading: countsLoading } = useQuery<Record<string, number>>({
    queryKey: ['stage-subject-counts'],
    queryFn: getStageSubjectCounts,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return (
    <section id="educational-stages" className="scroll-mt-20 py-24 bg-slate-50 dark:bg-slate-900/50 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div variants={zoomIn} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT}>
            <h2 className="text-3xl md:text-5xl font-bold dark:text-white mb-6">{title || t('stagesTitle')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{description || t('stagesSubtitle')}</p>
          </motion.div>
        </div>
        {stagesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : stagesError ? (
          <div className="flex flex-col items-center py-16 text-center">
            <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t('errorLoadingStages')}</p>
          </div>
        ) : apiStages.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t('noStagesYet')}</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
            {apiStages.map((stage: Stage, i: number) => {
              const colors = getEntityColor(stage.color ?? 'blue');
              const count = subjectCounts?.[stage._id];
              const subjectLabel = countsLoading || count === undefined
                ? t('stageCardSubtitle')
                : count === 1
                  ? t('subjectCountSingular', { count })
                  : t('subjectCountPlural', { count });
              return (
                <EntityCard key={stage._id} icon={stage.icon || '📚'} title={getLocalizedName(stage, i18n.language)} description={subjectLabel} color={colors} animationDelay={i * 0.07} onClick={() => navigate(`/stages/${stage._id}`)} footer={
                  <div className={`flex items-center gap-2 text-xs font-medium ${colors.text} w-full justify-end`}>
                    {t('viewStage')}
                    <ArrowRight className={`w-3 h-3 transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                } />
              );
            })}
            <motion.div variants={zoomIn} transition={{ duration: 0.6, ease: 'easeInOut', delay: apiStages.length * 0.07 }}>
              <div className="block h-full cursor-pointer" onClick={() => navigate('/stages')}>
                <Card className="h-full border border-dashed border-violet-300 dark:border-violet-700/60 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-violet-950/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group rounded-2xl overflow-hidden">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center mb-3 border border-violet-200 dark:border-violet-800 shadow-sm"><GraduationCap className="w-5 h-5" /></div>
                    <h3 className="font-bold text-base mb-1 text-violet-700 dark:text-violet-300">{t('viewAllStages')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex-1 line-clamp-2">{t('viewAllStagesDesc')}</p>
                    <div className="mt-3 pt-2 border-t border-violet-200 dark:border-violet-800 flex items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300 justify-end">
                      {t('exploreNow')}
                      <ArrowRight className={`w-3 h-3 transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection({ section, isRtl }: { section: LandingSection; isRtl: boolean }) {
  const { t } = useTranslation();
  const title = isRtl ? section.titleAr : section.titleEn;
  const testimonials = section.testimonials ?? [];
  if (testimonials.length === 0) return null;
  const cards = testimonials.map((testi, idx) => (
    <Card key={idx} className="h-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 rounded-3xl relative">
      <Quote className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} w-12 h-12 text-violet-100 dark:text-slate-800/50`} />
      <CardContent className="p-8 relative z-10 flex flex-col h-full">
        <div className="flex gap-1 mb-6">{[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}</div>
        <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-8 flex-1 leading-relaxed">"{isRtl ? testi.textAr : testi.textEn}"</p>
        <div className="flex items-center gap-4 mt-auto">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testi.author)}&background=2563eb&color=fff&rounded=true`} alt={testi.author} className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-md" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{testi.author}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isRtl ? testi.roleAr : testi.roleEn}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ));
  return (
    <section id="testimonials" className="scroll-mt-20 py-24 relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-100/50 dark:bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-bold dark:text-white mb-6">
            {title || t('testiTitle')}
          </motion.h2>
        </div>
        <motion.div variants={zoomOut} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT}>
          <Carousel items={cards} isRtl={isRtl} autoplayMs={5000} perView={{ base: 1, md: 1, lg: 1 }} className="max-w-3xl mx-auto" ariaPrevLabel={t('previous')} ariaNextLabel={t('next')} ariaSlideLabel={t('slide')} />
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection({ section, isRtl }: { section: LandingSection; isRtl: boolean }) {
  const { t } = useTranslation();
  const title = isRtl ? section.titleAr : section.titleEn;
  const description = isRtl ? section.descriptionAr : section.descriptionEn;
  const faqItems = section.faqItems ?? [];

  // Static defaults — 16 comprehensive FAQ entries (always rendered in full).
  // Platform-config items only take over when the admin has configured at least
  // as many items as the defaults, preventing a partial DB set from hiding questions.
  const defaultItems = [
    { title: t('faqQ1'), content: t('faqA1') },
    { title: t('faqQ2'), content: t('faqA2') },
    { title: t('faqQ3'), content: t('faqA3') },
    { title: t('faqQ4'), content: t('faqA4') },
    { title: t('faqQ5'), content: t('faqA5') },
    { title: t('faqQ6'), content: t('faqA6') },
    { title: t('faqQ7'), content: t('faqA7') },
    { title: t('faqQ8'), content: t('faqA8') },
    { title: t('faqQ9'), content: t('faqA9') },
    { title: t('faqQ10'), content: t('faqA10') },
    { title: t('faqQ11'), content: t('faqA11') },
    { title: t('faqQ12'), content: t('faqA12') },
    { title: t('faqQ13'), content: t('faqA13') },
    { title: t('faqQ14'), content: t('faqA14') },
    { title: t('faqQ15'), content: t('faqA15') },
    { title: t('faqQ16'), content: t('faqA16') },
  ];
  // Only use platform-config FAQ items when the admin has intentionally configured
  // a full set (≥ default count). Partial DB entries must not silently truncate the list.
  const configItems = faqItems.map(f => ({ title: isRtl ? f.questionAr : f.questionEn, content: isRtl ? f.answerAr : f.answerEn }));
  const accordionItems = configItems.length >= defaultItems.length ? configItems : defaultItems;

  // Split into two columns for desktop
  const mid = Math.ceil(accordionItems.length / 2);
  const col1 = accordionItems.slice(0, mid);
  const col2 = accordionItems.slice(mid);

  return (
    <section id="contact" className="scroll-mt-20 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-900 dark:to-purple-900 transition-colors duration-500" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <motion.div variants={zoomIn} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title || t('ctaTitle')}</h2>
          {description && <p className="text-xl text-violet-100 dark:text-purple-200 max-w-2xl mx-auto">{description}</p>}
        </motion.div>

        {accordionItems.length > 0 && (
          <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 — slides in from the left */}
            <motion.div variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 space-y-1">
              <div className="[&_button]:text-white [&_*]:border-white/20 [&_p]:text-violet-100">
                <Accordion items={col1} isRtl={isRtl} />
              </div>
            </motion.div>
            {/* Column 2 — slides in from the right */}
            <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={{ ...EASE_OUT, delay: 0.15 }} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 space-y-1">
              <div className="[&_button]:text-white [&_*]:border-white/20 [&_p]:text-violet-100">
                <Accordion items={col2} isRtl={isRtl} />
              </div>
            </motion.div>
          </div>
        )}

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT} className="flex justify-center">
          <Link to="/stages" className="w-full sm:w-auto">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-violet-600 hover:bg-slate-50 shadow-xl rounded-full w-full shadow-white/10 group">
              {t('getStarted')}
              <ArrowRight className={`ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'mr-2 ml-0 rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Block-based custom section renderer ────────────────────────────────────

const BLOCK_PADDING_MAP: Record<string, string> = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-16',
};

const BLOCK_TEXT_SIZE_MAP: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl md:text-4xl',
};

const BLOCK_ALIGN_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function BlockRenderer({ block, isRtl }: { block: SectionBlock; isRtl: boolean }) {
  const text = isRtl ? block.textAr : block.textEn;
  const alt = isRtl ? block.altAr : block.altEn;
  const padding = BLOCK_PADDING_MAP[block.style?.padding ?? 'md'];
  const alignment = BLOCK_ALIGN_MAP[block.style?.alignment ?? 'left'];
  const textSize = BLOCK_TEXT_SIZE_MAP[block.style?.size ?? 'md'];

  if (block.type === 'title') {
    return (
      <div className={`${padding} ${alignment}`}>
        <h2 className={`font-bold text-slate-900 dark:text-white ${textSize}`}>{text}</h2>
      </div>
    );
  }

  if (block.type === 'text') {
    return (
      <div className={`${padding} ${alignment}`}>
        <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${textSize}`}>{text}</p>
      </div>
    );
  }

  if (block.type === 'image' && block.url) {
    return (
      <div className={`${padding} flex ${block.style?.alignment === 'center' ? 'justify-center' : block.style?.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
        <img
          src={block.url}
          alt={alt ?? ''}
          className="max-w-full rounded-2xl shadow-md object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (block.type === 'video' && block.url) {
    // Support both embed URLs (iframe) and direct video files
    const isEmbed = block.url.includes('youtube.com/embed') || block.url.includes('player.vimeo.com');
    return (
      <div className={`${padding}`}>
        {isEmbed ? (
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-md">
            <iframe
              src={block.url}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={alt ?? 'Video'}
            />
          </div>
        ) : (
          <video
            src={block.url}
            controls
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-md"
          />
        )}
      </div>
    );
  }

  return null;
}

function CustomSection({ section, isRtl }: { section: LandingSection; isRtl: boolean }) {
  const title = isRtl ? section.titleAr : section.titleEn;
  const description = isRtl ? section.descriptionAr : section.descriptionEn;
  const blocks = section.blocks ?? [];

  if (!title && !description && blocks.length === 0) return null;

  return (
    <section id={section.key} className="scroll-mt-20 py-16">
      <div className="max-w-4xl mx-auto px-6">
        {(title || description) && (
          <motion.div variants={zoomIn} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={EASE_OUT} className="text-center mb-10">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>}
            {description && <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>}
          </motion.div>
        )}
        {blocks.length > 0 && (
          <div className="space-y-2">
            {blocks.map((block, idx) => (
              <motion.div key={block.key} variants={sideVariant(idx)} initial="hidden" whileInView="visible" viewport={SECTION_VIEWPORT} transition={{ ...EASE_OUT, delay: idx * 0.15 }}>
                <BlockRenderer block={block} isRtl={isRtl} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TeacherAppSection({ section: _section, isRtl: _isRtl }: { section: LandingSection; isRtl: boolean }) {
  return <div id="join-as-teacher" className="scroll-mt-20"><TeacherApplicationSection /></div>;
}

function SectionRenderer({ section, isRtl, liveStats }: { section: LandingSection; isRtl: boolean; liveStats?: PlatformStats }) {
  if (!section.isVisible) return null;
  switch (section.type) {
    case 'stats': return <StatsSection section={section} isRtl={isRtl} liveStats={liveStats} />;
    case 'stages': return <StagesSection section={section} isRtl={isRtl} />;
    case 'features': return <FeaturesSection section={section} isRtl={isRtl} />;
    case 'testimonials': return <TestimonialsSection section={section} isRtl={isRtl} />;
    case 'teacher-application': return <TeacherAppSection section={section} isRtl={isRtl} />;
    case 'faq': return <FaqSection section={section} isRtl={isRtl} />;
    case 'custom': return <CustomSection section={section} isRtl={isRtl} />;
    default: return null;
  }
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRtl = i18n.language === 'ar';
  const { config } = usePlatformConfig();

  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
    staleTime: 5 * 60 * 1000,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, x: isRtl ? 40 : -40 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  const navLinks: NavLink[] = config
    ? config.navbar.items
        .filter((item) => item.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          labelKey: '',
          label: isRtl ? item.label.ar : item.label.en,
          id: item.isAnchor ? item.href : item.key,
          href: item.isAnchor ? undefined : item.href,
        }))
    : [
        { labelKey: 'navHome', id: 'home' },
        { labelKey: 'navStages', id: 'educational-stages' },
        { labelKey: 'navFeatures', id: 'features' },
        { labelKey: 'navTeachers', id: 'join-as-teacher' },
        { labelKey: 'navContact', id: 'contact' },
      ];

  const hero = config?.landing.hero;
  const heroTitle = hero ? (isRtl ? hero.titleAr : hero.titleEn) : t('heroTitle');
  const heroSubtitle = hero ? (isRtl ? hero.descriptionAr : hero.descriptionEn) : t('heroSubtitle');
  const heroImage = hero?.heroImageUrl ?? '/hero-illustration.png';
  const primaryLabel = hero ? (isRtl ? hero.primaryButtonLabelAr : hero.primaryButtonLabelEn) : t('exploreStages');
  const primaryHref = hero?.primaryButtonHref ?? '/stages';
  const showSecondary = hero?.showSecondaryButton ?? true;
  const secondaryLabel = hero ? (isRtl ? hero.secondaryButtonLabelAr : hero.secondaryButtonLabelEn) : t('login');
  const secondaryHref = hero?.secondaryButtonHref ?? '/login';
  const sections = config
    ? [...config.landing.sections].sort((a, b) => a.order - b.order)
    : [];



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar navLinks={navLinks} />
      <ScrollToTop />
      <main className="flex-1">

      {/* Hero Section */}
      <section id="home" className="relative pt-16 pb-20 lg:pt-20 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-violet-400/20 dark:bg-violet-900/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="text-center lg:text-start order-2 lg:order-1"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold text-sm mb-6 transition-colors duration-300 ${isRtl ? 'ml-auto lg:ml-0 lg:mr-auto' : 'mr-auto lg:mr-0 lg:ml-0'}`}>
                <Activity className="w-4 h-4" /> {t('nextGenLearning')}
              </motion.div>
              
              <motion.h1 variants={itemVariants} className={`text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.15] ${isRtl ? 'text-start lg:text-right' : 'text-start'}`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 transition-colors duration-300 drop-shadow-sm">
                  {heroTitle}
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className={`text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isRtl ? 'text-start lg:text-right' : 'text-start'}`}>
                {heroSubtitle}
              </motion.p>
              
              <motion.div variants={itemVariants} className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
                <Link to={primaryHref} className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-8 text-lg bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 hover:shadow-violet-600/40 hover:-translate-y-1 transition-all rounded-full w-full group border-0">
                    {primaryLabel}
                    <ArrowRight className={`ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'mr-2 ml-0 rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </Button>
                </Link>
                {showSecondary && !user && (
                    <Link to={secondaryHref} className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm">
                        {secondaryLabel}
                      </Button>
                    </Link>
                )}
              </motion.div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
               className="relative lg:h-[600px] flex items-center justify-center p-4 lg:p-0 order-1 lg:order-2"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 rounded-[3rem] blur-3xl transform -rotate-6 scale-105 transition-colors duration-500 pointer-events-none" />

               <motion.img
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  src={heroImage}
                  alt={config ? (isRtl ? config.platformName.ar : config.platformName.en) : t('brandName')}
                  className="relative z-10 w-full max-w-md drop-shadow-2xl rounded-[2rem] object-contain"
               />
               
               {/* Students Card */}
               <motion.div
                 animate={{ y: [0, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                 className="absolute top-4 -left-2 lg:top-12 lg:-left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-xl text-violet-600 dark:text-violet-400 transition-colors duration-300">
                   <Users className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1" dir="ltr">
                     {statsLoading ? <span className="inline-block h-5 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /> : platformStats ? <AnimatedCounter value={platformStats.students} suffix="+" /> : null}
                   </p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('statStudents')}</p>
                 </div>
               </motion.div>

               {/* Teachers Card */}
               <motion.div
                 animate={{ y: [0, 15, 0] }}
                 transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
                 className="absolute top-1/3 -right-4 lg:top-1/4 lg:-right-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl text-green-600 dark:text-green-400 transition-colors duration-300">
                   <GraduationCap className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1" dir="ltr">
                     {statsLoading ? <span className="inline-block h-5 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /> : platformStats ? <AnimatedCounter value={platformStats.teachers} suffix="+" /> : null}
                   </p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('statTeachers')}</p>
                 </div>
               </motion.div>

               {/* Subjects Card */}
               <motion.div
                 animate={{ y: [0, 20, 0] }}
                 transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 2 }}
                 className="absolute bottom-10 -left-6 lg:bottom-1/4 lg:-left-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400 transition-colors duration-300">
                   <BookOpen className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1" dir="ltr">
                     {statsLoading ? <span className="inline-block h-5 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /> : platformStats ? <AnimatedCounter value={platformStats.subjects} suffix="+" /> : null}
                   </p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('statSubjects')}</p>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>









      {sections.map((section) => (
        <SectionRenderer key={section.key} section={section} isRtl={isRtl} liveStats={platformStats} />
      ))}

      </main>
      <SiteFooter />
    </div>
  );
}
