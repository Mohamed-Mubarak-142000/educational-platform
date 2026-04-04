/**
 * AdminTeacherRequests Page
 *
 * Lists all teacher job applications submitted via the landing page.
 * Admin can Accept (provide Zoom link) or Reject (with reason).
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherApplications, reviewTeacherApplication } from '@/api/adminApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { spacing, cardVariants } from '@/lib/constants';
import type { MockTeacherApplication } from '@/api/mock/data';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { useTranslation } from 'react-i18next';

// ── Helpers ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MockTeacherApplication['status'] }) {
  const { t } = useTranslation();
  switch (status) {
    case 'Pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{t('applicationStatusPending')}</span>;
    case 'Accepted':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{t('applicationStatusAccepted')}</span>;
    case 'Rejected':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{t('applicationStatusRejected')}</span>;
  }
}

// ── Application Card ───────────────────────────────────────────────

function ApplicationCard({
  app,
  onAccept,
  onReject,
}: {
  app: MockTeacherApplication;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { t } = useTranslation();
  const days = app.availableDays;

  return (
    <Card className={`${cardVariants.default} overflow-hidden`}>
      <div className="flex flex-col sm:flex-row items-start gap-4 p-5">
        {/* Avatar */}
        {app.profileImageUrl ? (
          <img
            src={app.profileImageUrl}
            alt={app.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-blue-300 ring-2 ring-slate-200 dark:ring-slate-700">
            {app.name.charAt(0)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{app.name}</h3>
            <StatusBadge status={app.status} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{app.phone}</span>
          </div>

          {/* Available days */}
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              {t('availableDaysHours')}
            </p>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => {
                const hours = app.availableHours?.[day];
                return (
                  <span
                    key={day}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                  >
                    <Clock className="w-3 h-3" />
                    {day} {hours ? `${hours.start}–${hours.end}` : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* CV link */}
          {app.cvUrl && (
            <a
              href={app.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FileText className="w-4 h-4" />
              {t('viewCv')}
            </a>
          )}

          {/* Zoom link (if accepted) */}
          {app.status === 'Accepted' && app.zoomLink && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {t('zoomSession')} <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="underline">{app.zoomLink}</a>
            </p>
          )}

          {/* Rejection reason */}
          {app.status === 'Rejected' && app.rejectionReason && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t('rejectionReasonPrefix')} {app.rejectionReason}
            </p>
          )}
        </div>

        {/* Actions */}
        {app.status === 'Pending' && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => onAccept(app._id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('accept')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(app._id)}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              {t('reject')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function AdminTeacherRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-applications'],
    queryFn: getTeacherApplications,
  });

  // Accept dialog
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [zoomLink, setZoomLink] = useState('');

  // Reject dialog
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, payload }: { id: string; action: 'accept' | 'reject'; payload?: { zoomLink?: string; rejectionReason?: string } }) =>
      reviewTeacherApplication(id, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-applications'] });
    },
  });

  const handleAcceptConfirm = () => {
    if (!acceptId) return;
    reviewMutation.mutate({ id: acceptId, action: 'accept', payload: { zoomLink } });
    setAcceptId(null);
    setZoomLink('');
  };

  const handleRejectConfirm = () => {
    if (!rejectId) return;
    reviewMutation.mutate({ id: rejectId, action: 'reject', payload: { rejectionReason: rejectReason } });
    setRejectId(null);
    setRejectReason('');
  };

  const pending = applications.filter((a: MockTeacherApplication) => a.status === 'Pending');
  const reviewed = applications.filter((a: MockTeacherApplication) => a.status !== 'Pending');

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('teacherApplicationsTitle')}
        subtitle={t('teacherApplicationsSubtitle')}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{pending.length}</span>
              {t('pendingReview')}
            </h2>
            {pending.length === 0 ? (
              <EmptyState description={t('noPendingApplications')} />
            ) : (
              <div className="space-y-4">
                {pending.map((app: MockTeacherApplication) => (
                  <ApplicationCard
                    key={app._id}
                    app={app}
                    onAccept={(id) => { setAcceptId(id); setZoomLink(''); }}
                    onReject={(id) => { setRejectId(id); setRejectReason(''); }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('reviewed')}</h2>
              <div className="space-y-4">
                {reviewed.map((app: MockTeacherApplication) => (
                  <ApplicationCard key={app._id} app={app} onAccept={() => {}} onReject={() => {}} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Accept Dialog */}
      <Dialog open={!!acceptId} onOpenChange={() => setAcceptId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {t('acceptApplication')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('acceptEmailNote')}
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                {t('zoomInterviewLink')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('zoomLinkPlaceholder')}
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAcceptId(null)}>{t('cancel')}</Button>
            <Button
              onClick={handleAcceptConfirm}
              disabled={!zoomLink.trim() || reviewMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {reviewMutation.isPending ? t('sending') : t('sendAndAccept')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              {t('rejectApplication')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('rejectEmailNote')}
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                {t('rejectionReasonLabel')}
              </label>
              <Input
                placeholder={t('rejectionReasonPlaceholder')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectId(null)}>{t('cancel')}</Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={reviewMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {reviewMutation.isPending ? t('sending') : t('sendAndReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

