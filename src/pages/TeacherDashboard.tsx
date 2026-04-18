import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocalizedName } from '@/lib/localeUtils';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/ToastProvider';
import {
  getTeacherSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  type SubscriptionRequest,
} from '@/api/subscriptionApi';
import { CheckCircle2, XCircle, FileImage } from 'lucide-react';

export default function TeacherDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const { data: requests = [], isLoading } = useQuery<SubscriptionRequest[]>({
    queryKey: ['teacher-subscription-requests', statusFilter],
    queryFn: () => getTeacherSubscriptionRequests(statusFilter),
  });

  const { data: summary } = useQuery({
    queryKey: ['teacher-subscription-requests-summary'],
    queryFn: async () => {
      const [pending, approved, rejected] = await Promise.all([
        getTeacherSubscriptionRequests('Pending'),
        getTeacherSubscriptionRequests('Approved'),
        getTeacherSubscriptionRequests('Rejected'),
      ]);
      return {
        pendingCount: pending.length,
        approvedCount: approved.length,
        rejectedCount: rejected.length,
        total: pending.length + approved.length + rejected.length,
      };
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveSubscriptionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subscription-requests', statusFilter] });
      pushToast({ type: 'success', title: t('toastApproved') });
    },
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectSubscriptionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subscription-requests', statusFilter] });
      pushToast({ type: 'success', title: t('toastRejected') });
    },
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const statusBadge = (status: string) => {
    if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40';
    if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40';
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40';
  };

  const getGradeLabel = (grade: SubscriptionRequest['gradeId']) => {
    if (!grade || typeof grade === 'string') return '-';
    return i18n.language === 'ar' ? grade.nameAr || grade.name : grade.name;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className={isRtl ? 'text-right' : 'text-left'}>
        <h1 className="text-3xl md:text-4xl font-bold">{t('teacherDashboardTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('teacherDashboardSubtitle')}</p>
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('subscriptionRequestsTitle')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subscriptionRequestsSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'default' : 'outline'}
                className={statusFilter === status ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                onClick={() => setStatusFilter(status)}
              >
                {t(status.toLowerCase())}
              </Button>
            ))}
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('totalRequests')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4">
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('pending')}</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{summary.pendingCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10 p-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{t('approved')}</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{summary.approvedCount}</p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4">
              <p className="text-xs text-red-700 dark:text-red-300">{t('rejected')}</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">{summary.rejectedCount}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState description={t('noSubscriptionRequests')} className="py-10" />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const studentName = typeof req.studentId === 'string' ? '-' : req.studentId?.name ?? '-';
              const subjectName = typeof req.subjectId === 'string'
                ? '-'
                : getLocalizedName(req.subjectId, i18n.language);
              const gradeName = getGradeLabel(req.gradeId);
              const unitTitle = typeof req.unitId === 'string' ? '-' : req.unitId?.title;
              const typeLabel = req.type === 'subject' ? t('subject') : t('unitSingular');
              const isPending = req.status === 'Pending';

              return (
                <div key={req._id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('studentName')}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{studentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('subject')}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{subjectName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('gradeLabel')}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gradeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('subscriptionTypeLabel')}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {typeLabel}{req.type === 'unit' && unitTitle ? ` — ${unitTitle}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('paymentMethod')}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{req.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('status')}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${statusBadge(req.status)}`}>
                          {t(req.status.toLowerCase())}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:justify-end">
                      {req.paymentProofUrl ? (
                        <a href={req.paymentProofUrl} target="_blank" rel="noreferrer" className="group">
                          <div className="w-28 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                            <img src={req.paymentProofUrl} alt={t('paymentProof')} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <FileImage className="w-3 h-3" /> {t('viewProof')}
                          </div>
                        </a>
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500">{t('noProof')}</div>
                      )}

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => approveMutation.mutate(req._id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> {t('approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => rejectMutation.mutate(req._id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> {t('reject')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
