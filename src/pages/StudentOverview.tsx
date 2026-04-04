import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getStages, getSubjectsByStage, getUnitsBySubject, getEnrolledUnitIds } from '@/api/subjectApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import {
  User,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import { spacing } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/shared';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// ── Color palette for subjects ────────────────────────────────────
const PALETTE: Record<string, { bg: string; text: string; border: string; hex: string; hexLight: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700/40', hex: '#10b981', hexLight: '#d1fae5' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-700/40',    hex: '#3b82f6', hexLight: '#dbeafe' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-700/40', hex: '#8b5cf6', hexLight: '#ede9fe' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-700/40',  hex: '#f59e0b', hexLight: '#fef3c7' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',    text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-700/40',    hex: '#f43f5e', hexLight: '#ffe4e6' },
};
function palette(c: string) { return PALETTE[c] ?? PALETTE.blue; }

// ── Subject progress card with mini doughnut ─────────────────────
function SubjectCard({ subject, enrolledUnitIds, navigate }: { subject: any; enrolledUnitIds: string[]; navigate: ReturnType<typeof useNavigate> }) {
  const { data: units = [] } = useQuery({
    queryKey: ['units', subject._id],
    queryFn: () => getUnitsBySubject(subject._id),
  });

  const total = units.length;
  const enrolled = units.filter((u: any) => enrolledUnitIds.includes(u._id)).length;
  const pct = total > 0 ? Math.round((enrolled / total) * 100) : 0;
  const pal = palette(subject.color);

  const donutData = {
    datasets: [{
      data: [enrolled, Math.max(0, total - enrolled)],
      backgroundColor: [pal.hex, '#e2e8f0'],
      borderWidth: 0,
      cutout: '72%',
    }],
  };

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onClick={() => navigate(`/student/subjects/${subject._id}`)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${pal.bg} ${pal.border}`}
    >
      {/* Mini doughnut */}
      <div className="relative w-14 h-14 flex-shrink-0">
        <Doughnut data={donutData} options={{ plugins: { tooltip: { enabled: false }, legend: { display: false } }, animation: false, responsive: true, maintainAspectRatio: true }} />
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${pal.text}`}>{pct}%</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-lg">{subject.icon}</span>
          <span className={`font-semibold text-sm truncate ${pal.text}`}>{subject.name}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subject.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pal.hex }} />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{enrolled}/{total} units</span>
        </div>
      </div>

      <ArrowRight className={`w-4 h-4 flex-shrink-0 opacity-50 ${pal.text}`} />
    </motion.button>
  );
}

export default function StudentOverview() {
  const navigate = useNavigate();
  const { user, updateProfileMutation, refreshProfile } = useAuth();
  const { t } = useTranslation();

  // ── Profile form (name + phone only; stage is read-only) ────────
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const { data: stages = [] } = useQuery({ queryKey: ['stages'], queryFn: getStages });

  const stageId = user?.stageId || '';
  const currentStage = stages.find((s: any) => s._id === stageId);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId),
    enabled: !!stageId,
  });

  const { data: enrolledUnitIds = [] } = useQuery({
    queryKey: ['enrolled-units', user?._id],
    queryFn: () => getEnrolledUnitIds(user!._id),
    enabled: !!user?._id,
  });

  const handleSave = () => {
    updateProfileMutation.mutate(
      { name: name.trim(), phone: phone.trim() },
      {
        onSuccess: () => {
          refreshProfile();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      }
    );
  };

  const isDirty = name !== (user?.name || '') || phone !== (user?.phone || '');

  // ── Stats for bar chart ─────────────────────────────────────────
  const barData = {
    labels: subjects.map((s: any) => s.name),
    datasets: [
      {
        label: 'Enrolled Units',
        data: subjects.map(() => 0), // placeholder; SubjectCards compute this individually
        backgroundColor: subjects.map((s: any) => palette(s.color).hex),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 } },
    },
  };

  return (
    <div className={spacing.pageContainer}>
      <div className="space-y-8">

        {/* ── Header banner ── */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{currentStage?.icon || '🎓'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{t('welcomeBack')}, {user?.name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              {currentStage ? `${currentStage.name} · ${subjects.length} ${t('subjectsCount')}` : t('noStageAssigned')}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold text-white">{enrolledUnitIds.length}</p>
              <p className="text-blue-100 text-xs mt-0.5">{t('enrolledUnitsCount')}</p>
            </div>
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold text-white">{subjects.length}</p>
              <p className="text-blue-100 text-xs mt-0.5">{t('subjectsCount')}</p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Profile form ── */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t('studentProfile')}</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">{t('fullNameLabel')}</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fullNameLabel')} className="h-9 text-sm" />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{t('phoneLabel')}</span>
                    </Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 ..." className="h-9 text-sm" />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{t('emailLabel')}</span>
                    </Label>
                    <Input value={user?.email || ''} disabled className="h-9 text-sm opacity-60 cursor-not-allowed" />
                  </div>

                  {/* Stage — read-only */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" />{t('educationalStageLabel')}</span>
                    </Label>
                    <div className="flex items-center gap-2 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed select-none">
                      {currentStage ? (
                        <><span>{currentStage.icon}</span><span>{currentStage.name}</span></>
                      ) : (
                        <span className="text-slate-400 italic">{t('notAssigned')}</span>
                      )}
                      <span className="ml-auto text-xs text-slate-400">{t('readOnly')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleSave}
                    disabled={!isDirty || updateProfileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs"
                  >
                    {updateProfileMutation.isPending ? t('savingLabel') : t('saveChanges')}
                  </Button>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('savedLabel')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t('progressOverview')}</h2>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />{t('enrolledUnitsLabel')}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{enrolledUnitIds.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{t('subjectsInStage')}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{subjects.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{t('stageLabel')}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{currentStage?.name || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Subjects visualization ── */}
          <div className="lg:col-span-2 space-y-5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {t('mySubjects')}
                  {currentStage && <span className="ms-2 text-sm font-normal text-slate-400">— {currentStage.name}</span>}
                </h2>
              </div>
              {subjects.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/student/learn')} className="text-blue-600 hover:text-blue-700 text-xs h-8">
                  {t('browseAll')} <ArrowRight className="w-3.5 h-3.5 ms-1" />
                </Button>
              )}
            </div>

            {!stageId ? (
              <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
                <CardContent className="py-14">
                  <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    title={t('noStageAssigned')}
                    description={t('contactAdminForStage')}
                  />
                </CardContent>
              </Card>
            ) : subjects.length === 0 ? (
              <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
                <CardContent className="py-8">
                  <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    description={t('noSubjectsForStage')}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Subject enrollment bar chart */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t('unitsPerSubject')}</p>
                    <div className="h-32">
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Subject cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map((subject: any) => (
                    <SubjectCard
                      key={subject._id}
                      subject={subject}
                      enrolledUnitIds={enrolledUnitIds as string[]}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
