import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ArrowRight, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';

export default function Curriculums() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const stages = [
    { id: 1, title: t('stagePrimary6'), icon: BookOpen },
    { id: 2, title: t('stagePrep1'), icon: BookOpen },
    { id: 3, title: t('stagePrep2'), icon: Activity },
    { id: 4, title: t('stagePrep3'), icon: Users },
    { id: 5, title: t('stageSec1'), icon: GraduationCap },
    { id: 6, title: t('stageSec2'), icon: TrendingUp },
    { id: 7, title: t('stageSec3'), icon: GraduationCap },
  ];

  const curriculums = [
    { id: 1, title: t('curriculumBioBasics'), icon: BookOpen },
    { id: 2, title: t('curriculumCellBiology'), icon: Activity },
    { id: 3, title: t('curriculumGenetics'), icon: TrendingUp },
    { id: 4, title: t('curriculumAnatomy'), icon: GraduationCap },
    { id: 5, title: t('curriculumHumanBody'), icon: Users },
    { id: 6, title: t('curriculumEcology'), icon: BookOpen },
    { id: 7, title: t('curriculumMicrobiology'), icon: GraduationCap },
    { id: 8, title: t('curriculumLabSkills'), icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[520px] h-[520px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[420px] h-[420px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl md:text-5xl font-bold mb-4"
                >
                  {t('curriculumsTitle')}
                </motion.h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                  {t('curriculumsSubtitle')}
                </p>
              </div>
              <Link to="/">
                <Button variant="outline" className="rounded-full px-6">
                  {t('backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-4xl font-bold">{t('allStagesTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-5">
                      <stage.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stage.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      {t('stageCardSubtitle')}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                      {t('viewStage')}
                      <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold">{t('allCurriculumsTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t('allCurriculumsSubtitle')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curriculums.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className="border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('stageCardSubtitle')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
