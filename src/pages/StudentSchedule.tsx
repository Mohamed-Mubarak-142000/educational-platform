/**
 * StudentSchedule Page
 *
 * Displays the student's weekly live-lesson timetable.
 * Parents can also view this via the student's dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getStudentSchedules, type TeacherSchedule } from '@/api/subjectApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Clock, GraduationCap, User2, BookOpen, Video } from 'lucide-react';
import { spacing } from '@/lib/constants';

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type DayName = (typeof DAY_ORDER)[number];

type StudentScheduleItem = TeacherSchedule & { day: DayName };

function timeLabel(t: string, locale: string) {
  const [h, m] = t.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
}

function dayColor(day: DayName) {
  const colors: Record<DayName, string> = {
    Sunday: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-200',
    Monday: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/40 text-violet-800 dark:text-violet-200',
    Tuesday: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/40 text-violet-800 dark:text-violet-200',
    Wednesday: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200',
    Thursday: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200',
    Friday: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    Saturday: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40 text-pink-800 dark:text-pink-200',
  };
  return colors[day];
}

function isDayName(day: string): day is DayName {
  return DAY_ORDER.includes(day as DayName);
}

export default function StudentSchedule() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  const { data: schedule, isLoading } = useQuery<TeacherSchedule[]>({
    queryKey: ['student-schedule', user?._id],
    queryFn: () => getStudentSchedules(user!._id),
    enabled: !!user?._id,
  });
  const resolvedSchedule = schedule ?? [];
  const showSkeleton = isLoading || schedule === undefined;

  const normalized: StudentScheduleItem[] = resolvedSchedule.filter(
    (item): item is StudentScheduleItem => isDayName(item.day)
  );

  // Group by day
  const byDay = DAY_ORDER.reduce<Partial<Record<DayName, StudentScheduleItem[]>>>((acc, day) => {
    const items = normalized.filter((s) => s.day === day);
    if (items.length > 0) acc[day] = items;
    return acc;
  }, {});

  const totalSessions = normalized.length;

  return (
    <div className={spacing.pageContainer}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          <Calendar className="w-6 h-6 text-violet-600" />
          {t('mySchedule')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('weeklyTimetableDesc')}{' '}
          {totalSessions > 0 ? t('sessionsEnrolledCount', { count: totalSessions }) : t('noLiveSessionsTitle')}
        </p>
      </div>

      {showSkeleton ? (
        <div className="space-y-6">
          {[1, 2].map((dayIdx) => (
            <div key={dayIdx}>
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-3 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border p-5 shadow-sm border-slate-200 dark:border-slate-800 animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-4 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : totalSessions === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('noLiveSessionsTitle')}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              {t('noLiveSessionsDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Object.entries(byDay) as Array<[DayName, StudentScheduleItem[]]>).map(([day, sessions]) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t(`dayName_${day}`)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`rounded-2xl border p-5 shadow-sm ${dayColor(day)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        {timeLabel(session.startTime, locale)} – {timeLabel(session.endTime, locale)}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
                        {t('live')}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 opacity-70" />
                        <span className="font-semibold truncate">{session.subjectName}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-80">
                        <User2 className="w-3.5 h-3.5" />
                        <span className="truncate">{session.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-70 text-xs">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{t('studentsSeated', { enrolled: session.enrolledStudents?.length ?? 0, max: session.maxStudents })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Weekly overview summary */}
      {totalSessions > 0 && (
        <Card className="mt-8 border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">{t('weeklySummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {DAY_ORDER.map((day) => {
                const daySessions = byDay[day];
                const dayCount = daySessions?.length ?? 0;
                const hasSessions = dayCount > 0;
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">{t(`dayAbbr_${day}`)}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                      hasSessions
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {hasSessions ? dayCount : t('notAvailableShort')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
