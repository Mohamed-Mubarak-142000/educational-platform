/**
 * StudentGrades Page
 *
 * Displays quiz grade history for a student.
 * Visible to the student, parent (via admin delegation), and admin.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getGradesByStudent } from '@/api/subjectApi';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Calendar,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { spacing } from '@/lib/constants';

function ScoreBadge({ score }: { score: number }) {
  const pass = score >= 60;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        pass
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/60'
      }`}
    >
      {pass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {score}%
    </span>
  );
}

function GradeRow({ grade, index }: { grade: { _id: string; quizId: string; score: number; correctCount: number; totalQuestions: number; completedAt: string }; index: number }) {
  const quizLabel = `Quiz ${grade.quizId.slice(-5)}`;

  const date = new Date(grade.completedAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
    >
      <td className="py-3.5 px-4 text-sm font-medium text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-500 flex-shrink-0" />
          {quizLabel}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <ScoreBadge score={grade.score} />
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-400 text-center">
        {grade.correctCount} / {grade.totalQuestions}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {dateStr}
          <span className="text-slate-400 dark:text-slate-500 text-xs">{timeStr}</span>
        </div>
      </td>
    </motion.tr>
  );
}

export default function StudentGrades() {
  const { user } = useAuth();

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['student-grades', user?._id],
    queryFn: () => getGradesByStudent(user!._id),
    enabled: !!user?._id,
  });

  // Summary stats
  const total = grades.length;
  const passed = grades.filter((g) => g.score >= 60).length;
  const avg =
    total > 0
      ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / total)
      : 0;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className={spacing.pageContainer}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          <Award className="w-6 h-6 text-amber-500" />
          My Grades
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View your quiz results and performance history.
        </p>
      </div>

      {/* Summary Cards */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Quizzes Taken', value: total, icon: ClipboardList, color: 'text-blue-600' },
            { label: 'Passed', value: passed, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Average Score', value: `${avg}%`, icon: TrendingUp, color: 'text-violet-600' },
            { label: 'Pass Rate', value: `${passRate}%`, icon: BarChart2, color: 'text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
            >
              <Icon className={`w-5 h-5 mb-2 ${color}`} />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mr-3" />
            Loading grades…
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No quiz results yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Complete quizzes in your lessons to see your grades here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Correct
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, i) => (
                  <GradeRow key={grade._id} grade={grade} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
