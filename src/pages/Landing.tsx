import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/Accordion';
import { Carousel } from '@/components/ui/Carousel';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, GraduationCap, Users, LayoutDashboard, ArrowRight, Activity, Star, Quote, TrendingUp, Play, FileText, Volume2, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import TeacherApplicationSection from '@/components/TeacherApplicationSection';
import { useQuery } from '@tanstack/react-query';
import { getStages, type Stage } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { ScrollToTop } from '@/components/ScrollToTop';
import { EntityCard, getEntityColor } from '@/components/shared';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Fetch real stages from the public API
  const { data: apiStages = [], isLoading: stagesLoading } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const stats = [
    { id: 1, label: t('statStudents'), value: 12000, suffix: "+", decimals: 0, icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { id: 2, label: t('statCourses'), value: 350, suffix: "+", decimals: 0, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
    { id: 3, label: t('statSuccess'), value: 98.5, suffix: "%", decimals: 1, icon: TrendingUp, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/40" },
    { id: 4, label: t('statTeachers'), value: 150, suffix: "+", decimals: 0, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/40" },
  ];

  const testimonials = [
    { id: 1, text: t('testi1'), author: t('testiName1'), role: t('role1') },
    { id: 2, text: t('testi2'), author: t('testiName2'), role: t('role2') },
    { id: 3, text: t('testi3'), author: t('testiName3'), role: t('role3') },
    { id: 4, text: t('testi4'), author: t('testiName4'), role: t('role4') },
    { id: 5, text: t('testi5'), author: t('testiName5'), role: t('role5') },
    { id: 6, text: t('testi6'), author: t('testiName6'), role: t('role6') },
  ];


  const studentAccordionItems = [
    { title: t('featStudent1'), content: t('featStudent1Desc') },
    { title: t('featStudent2'), content: t('featStudent2Desc') },
    { title: t('featStudent3'), content: t('featStudent3Desc') },
    { title: t('featStudent4'), content: t('featStudent4Desc') },
  ];

  const teacherAccordionItems = [
    { title: t('featTeacher1'), content: t('featTeacher1Desc') },
    { title: t('featTeacher2'), content: t('featTeacher2Desc') },
    { title: t('featTeacher3'), content: t('featTeacher3Desc') },
    { title: t('featTeacher4'), content: t('featTeacher4Desc') },
  ];
  const testimonialCards = testimonials.map((testi) => (
    <Card key={testi.id} className="h-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 rounded-3xl relative">
      <Quote className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} w-12 h-12 text-blue-100 dark:text-slate-800/50`} />
      <CardContent className="p-8 relative z-10 flex flex-col h-full">
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-8 flex-1 leading-relaxed">
          "{testi.text}"
        </p>
        <div className="flex items-center gap-4 mt-auto">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testi.author)}&background=2563eb&color=fff&rounded=true`}
            alt={testi.author}
            className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-md"
          />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{testi.author}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{testi.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  const organFacts = [t('organFact1'), t('organFact2'), t('organFact3')];

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAudioToggle = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(t('organAudioText'));
    utterance.lang = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.cancel();
    synth.speak(utterance);
    setIsSpeaking(true);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      <SiteNavbar navLinks={[
        { labelKey: 'navHome', id: 'home' },
        { labelKey: 'navStages', id: 'educational-stages' },
        { labelKey: 'navFeatures', id: 'features' },
        { labelKey: 'navTeachers', id: 'join-as-teacher' },
        { labelKey: 'navContact', id: 'contact' },
      ]} />
      <ScrollToTop />
      <main className="flex-1">

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="text-center lg:text-start"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-6 transition-colors duration-300 ${isRtl ? 'ml-auto lg:ml-0 lg:mr-auto' : 'mr-auto lg:mr-0 lg:ml-0'}`}>
                <Activity className="w-4 h-4" /> {t('nextGenLearning')}
              </motion.div>
              
              <motion.h1 variants={itemVariants} className={`text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.15] ${isRtl ? 'text-start lg:text-right' : 'text-start'}`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 transition-colors duration-300 drop-shadow-sm">
                  {t('heroTitle')}
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className={`text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isRtl ? 'text-start lg:text-right' : 'text-start'}`}>
                {t('heroSubtitle')}
              </motion.p>
              
              <motion.div variants={itemVariants} className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
                <Link to="/stages" className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all rounded-full w-full group border-0">
                    {t('exploreStages')}
                    <ArrowRight className={`ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'mr-2 ml-0 rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </Button>
                </Link>
                {!user && (
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm">
                        {t('login')}
                      </Button>
                    </Link>
                )}
              </motion.div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
               className="relative lg:h-[600px] flex items-center justify-center p-4 lg:p-0"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[3rem] blur-3xl transform -rotate-6 scale-105 transition-colors duration-500 pointer-events-none" />

               <motion.img 
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  src="/hero-illustration.png" 
                  alt="Academix Platform Illustration" 
                  className="relative z-10 w-full max-w-lg drop-shadow-2xl rounded-[2rem] object-contain" 
               />
               
               {/* Students Card */}
               <motion.div
                 animate={{ y: [0, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                 className="absolute top-4 -left-2 lg:top-12 lg:-left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-blue-600 dark:text-blue-400 transition-colors duration-300">
                   <Users className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">12K+</p>
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
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">150+</p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('statTeachers')}</p>
                 </div>
               </motion.div>

               {/* Success Rate Card */}
               <motion.div
                 animate={{ y: [0, 20, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute -bottom-2 -right-2 lg:-bottom-8 lg:-right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                   <CheckCircle className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">{t('successRate')}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{t('passRate')}</p>
                 </div>
               </motion.div>

               {/* Courses Card */}
               <motion.div
                 animate={{ y: [0, 20, 0] }}
                 transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 2 }}
                 className="absolute bottom-10 -left-6 lg:bottom-1/4 lg:-left-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400 transition-colors duration-300">
                   <BookOpen className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">350+</p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('statCourses')}</p>
                 </div>
               </motion.div>

               {/* Interactive Labs Card */}
               <motion.div
                 animate={{ y: [0, -20, 0] }}
                 transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut", delay: 0.8 }}
                 className="absolute -top-4 right-4 lg:-top-6 lg:right-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 z-20 transition-colors duration-300"
               >
                 <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl text-orange-600 dark:text-orange-400 transition-colors duration-300">
                   <Layers className="w-6 h-6" />
                 </div>
                 <div className={isRtl ? 'text-right' : 'text-left'}>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">500+</p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('interactiveLabs')}</p>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-b border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div 
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight" dir="ltr">
                     <AnimatedCounter value={stat.value} suffix={isRtl && stat.suffix === '%' ? '٪' : stat.suffix} decimals={stat.decimals} />
                   </h3>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Learning Section */}
      <section id="features" className="scroll-mt-20 py-24 relative overflow-hidden bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[520px] h-[520px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[520px] h-[520px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold dark:text-white mb-6">
              {t('interactiveLearningTitle')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t('interactiveLearningSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-3xl blur-2xl" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="relative"
              >
                <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
                  <CardContent className="p-8">
                    <p className={`text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {t('lessonContentTypes')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { Icon: Play, label: t('lessonTypeVideo'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                        { Icon: FileText, label: t('lessonTypePdf'), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
                        { Icon: Volume2, label: t('lessonTypeAudio'), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
                        { Icon: Layers, label: t('lessonType3D'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                      ].map(({ Icon, label, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-5 flex flex-col items-center gap-3 text-center`}>
                          <div className={`${color} w-10 h-10 flex items-center justify-center`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <span className={`text-sm font-semibold ${color}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}
            >
              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {t('organName')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t('organDescription')}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      {t('organFactsTitle')}
                    </h4>
                    <div className="space-y-3">
                      {organFacts.map((fact) => (
                        <div key={fact} className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {fact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5">
                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      {t('organImportanceTitle')}
                    </h4>
                    <p className="text-blue-700/90 dark:text-blue-200/80">
                      {t('organImportance')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      type="button"
                      onClick={handleAudioToggle}
                      disabled={!canSpeak}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                    >
                      {isSpeaking ? t('stopAudio') : t('playAudio')}
                    </Button>
                    {!canSpeak && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {t('audioNotSupported')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
             <h2 className="text-3xl md:text-5xl font-bold dark:text-white mb-6 transition-colors duration-300">{t('designedForEveryone')}</h2>
             <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors duration-300">{t('designedDesc')}</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {/* Student Card */}
            <div className="relative group perspective-[1000px]">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 dark:from-blue-600/10 dark:to-blue-800/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
               <Card className="relative h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden rounded-3xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                 <CardContent className="p-10 space-y-8">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform group-hover:scale-110 duration-300">
                       <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{t('studentFeatures')}</h3>
                      <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">{t('unlockPotential')}</p>
                    </div>
                    <Accordion items={studentAccordionItems} isRtl={isRtl} />
                 </CardContent>
               </Card>
            </div>

            {/* Teacher Card */}
            <div className="relative group perspective-[1000px]">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 dark:from-indigo-600/10 dark:to-indigo-800/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
               <Card className="relative h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden rounded-3xl">
                 <div className="absolute top-0 opacity-100 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                 <CardContent className="p-10 space-y-8">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-110 duration-300">
                       <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{t('teacherFeatures')}</h3>
                      <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">{t('createExperiences')}</p>
                    </div>
                    <Accordion items={teacherAccordionItems} isRtl={isRtl} />
                 </CardContent>
               </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Educational Stages Section */}
      <section id="educational-stages" className="scroll-mt-20 py-24 bg-slate-50 dark:bg-slate-900/50 relative z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center max-w-3xl mx-auto mb-16`}>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               <h2 className="text-3xl md:text-5xl font-bold dark:text-white mb-6">{t('stagesTitle')}</h2>
               <p className="text-lg text-slate-600 dark:text-slate-400">{t('stagesSubtitle')}</p>
             </motion.div>
          </div>

          {stagesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : apiStages.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">{t('noStagesYet')}</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {apiStages.map((stage: Stage, i) => {
                const colors = getEntityColor(stage.color ?? 'blue');
                return (
                  <EntityCard
                    key={stage._id}
                    icon={stage.icon || '📚'}
                    title={getLocalizedName(stage, i18n.language)}
                    description={t('stageCardSubtitle')}
                    color={colors}
                    animationDelay={i * 0.07}
                    onClick={() => navigate(`/stages/${stage._id}`)}
                    footer={
                      <div className={`flex items-center gap-2 text-xs font-medium ${colors.text} w-full justify-end`}>
                        {t('viewStage')}
                        <ArrowRight className={`w-3 h-3 transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                      </div>
                    }
                  />
                );
              })}

              {/* "View All Stages" card — always last */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.22, delay: apiStages.length * 0.07 }}
              >
                <div className="block h-full cursor-pointer" onClick={() => navigate('/stages')}>
                  <Card className="h-full border border-dashed border-blue-300 dark:border-blue-700/60 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group rounded-2xl overflow-hidden">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 border border-blue-200 dark:border-blue-800 shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">{t('viewAllStages')}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex-1 line-clamp-2">{t('viewAllStagesDesc')}</p>
                      <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300 justify-end">
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

      {/* Testimonials Section */}
      <section id="testimonials" className="scroll-mt-20 py-24 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
         <div className="relative max-w-7xl mx-auto px-6 z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <motion.h2 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="text-3xl md:text-5xl font-bold dark:text-white mb-6"
               >
                 {t('testiTitle')}
               </motion.h2>
            </div>
            
            <Carousel
              items={testimonialCards}
              isRtl={isRtl}
              autoplayMs={5000}
              perView={{ base: 2, md: 2, lg: 2 }}
              ariaPrevLabel={t('previous')}
              ariaNextLabel={t('next')}
              ariaSlideLabel={t('slide')}
            />
         </div>
      </section>

      {/* Teacher Application Section */}
      <TeacherApplicationSection />

      {/* CTA Section */}
      <section id="contact" className="scroll-mt-20 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 transition-colors duration-500" />
        
        {/* Decorative background elements for CTA */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 dark:text-indigo-200 mb-10 max-w-2xl mx-auto">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/curriculums" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-blue-600 hover:bg-slate-50 shadow-xl rounded-full w-full shadow-white/10 group">
                  {t('getStarted')}
                  <ArrowRight className={`ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'mr-2 ml-0 rotate-180 group-hover:-translate-x-1' : ''}`} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer Details */}
      </main>
      <SiteFooter />
    </div>
  );
}
