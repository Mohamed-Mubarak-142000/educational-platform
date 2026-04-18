/**
 * AdminTeacherRequests Page
 *
 * Lists all teacher job applications submitted via the landing page.
 * Admin can Accept (provide Zoom link) or Reject (with reason).
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherApplications, reviewTeacherApplication, type TeacherApplicationRecord } from '@/api/adminApi';
import { getSubjectById } from '@/api/subjectApi';
import { getGradeById } from '@/api/gradeApi';
import { Accordion } from '@/components/ui/Accordion';
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
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { spacing } from '@/lib/constants';
import { PageHeader, SkeletonBlock, SkeletonCardGrid, EmptyState, ErrorState, PdfViewer } from '@/components/shared';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';

// ── Badge helpers that resolve IDs to names ────────────────────────

function SubjectBadges({ subjectIds, language }: { subjectIds: string[]; language: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {subjectIds.map((id) => (
        <SubjectBadge key={id} subjectId={id} language={language} />
      ))}
    </div>
  );
}

function SubjectBadge({ subjectId, language }: { subjectId: string; language: string }) {
  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubjectById(subjectId),
  });
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
      {subject?.icon} {subject ? getLocalizedName(subject, language) : subjectId.slice(-6)}
    </span>
  );
}

function GradeBadges({ gradeIds, language }: { gradeIds: string[]; language: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {gradeIds.map((id) => (
        <GradeBadge key={id} gradeId={id} language={language} />
      ))}
    </div>
  );
}

function GradeBadge({ gradeId, language }: { gradeId: string; language: string }) {
  const { data: grade } = useQuery({
    queryKey: ['grade', gradeId],
    queryFn: () => getGradeById(gradeId),
  });
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
      {grade ? getLocalizedName(grade, language) : gradeId.slice(-6)}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TeacherApplicationRecord['status'] }) {
  const { t } = useTranslation();
  switch (status) {
    case 'Pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{t('applicationStatusPending')}</span>;
    case 'Under Evaluation':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{t('applicationStatusUnderEvaluation')}</span>;
    case 'Accepted':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{t('applicationStatusAccepted')}</span>;
    case 'Rejected':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{t('applicationStatusRejected')}</span>;
  }
}

// ── Application Card ───────────────────────────────────────────────

function ApplicationDetails({
  app,
  onEvaluate,
  onAccept,
  onReject,
  onViewCv,
  isCvOpen,
}: {
  app: TeacherApplicationRecord;
  onEvaluate: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewCv: (id: string) => void;
  isCvOpen: boolean;
}) {
  const { t, i18n } = useTranslation();
  const days = app.availableDays;

  // Resolve subject names
  const subjectIds = app.subjectIds ?? [];
  const gradeIds = app.gradeIds ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('email')}</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />{app.email}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('phone')}</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />{app.phone}
          </p>
        </div>

        {/* Subjects */}
        {subjectIds.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />{t('subjectPlural') ?? 'Subjects'}
            </p>
            <SubjectBadges subjectIds={subjectIds} language={i18n.language} />
          </div>
        )}

        {/* Grades */}
        {gradeIds.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />{t('gradeLabel') ?? 'Grades'}
            </p>
            <GradeBadges gradeIds={gradeIds} language={i18n.language} />
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('availableDaysHours')}</p>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => {
              const hours = app.availableHours?.[day];
              return (
                <span
                  key={day}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                >
                  <Clock className="w-3 h-3" />
                  {t(`dayName_${day}`)} {hours ? `${hours.start}–${hours.end}` : ''}
                </span>
              );
            })}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('viewCv')}</p>
          {app.cvUrl ? (
            <button
              type="button"
              onClick={() => onViewCv(app._id)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FileText className="w-4 h-4" />
              {isCvOpen ? t('close') : t('viewCv')}
            </button>
          ) : (
            <p className="text-sm text-slate-500">-</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('zoomSession')}</p>
          {(app.status === 'Under Evaluation' || app.status === 'Accepted') && app.zoomLink ? (
            <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 dark:text-emerald-400 underline">
              {app.zoomLink}
            </a>
          ) : (
            <p className="text-sm text-slate-500">-</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('rejectionReason')}</p>
          {app.status === 'Rejected' && app.rejectionReason ? (
            <p className="text-sm text-red-600 dark:text-red-400">{app.rejectionReason}</p>
          ) : (
            <p className="text-sm text-slate-500">-</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {app.status === 'Pending' && (
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => onEvaluate(app._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            {t('startEvaluation')}
          </Button>
        </div>
      )}

      {app.status === 'Under Evaluation' && (
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

      {app.cvUrl && isCvOpen && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white">
          <PdfViewer url={app.cvUrl as string} className="border-slate-200 dark:border-slate-800" />
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function AdminTeacherRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openCvId, setOpenCvId] = useState<string | null>(null);

  const { data: applications = [], isLoading, isError, refetch } = useQuery<TeacherApplicationRecord[]>({
    queryKey: ['teacher-applications'],
    queryFn: getTeacherApplications,
  });

  // Evaluation dialog
  const [evaluateId, setEvaluateId] = useState<string | null>(null);
  const [zoomLink, setZoomLink] = useState('');

  // Accept dialog
  const [acceptId, setAcceptId] = useState<string | null>(null);

  // Reject dialog
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, payload }: { id: string; action: 'evaluate' | 'accept' | 'reject'; payload?: { zoomLink?: string; rejectionReason?: string } }) =>
      reviewTeacherApplication(id, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-applications'] });
    },
  });

  const handleEvaluateConfirm = () => {
    if (!evaluateId) return;
    reviewMutation.mutate({ id: evaluateId, action: 'evaluate', payload: { zoomLink } });
    setEvaluateId(null);
    setZoomLink('');
  };

  const handleAcceptConfirm = () => {
    if (!acceptId) return;
    reviewMutation.mutate({ id: acceptId, action: 'accept' });
    setAcceptId(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectId) return;
    reviewMutation.mutate({ id: rejectId, action: 'reject', payload: { rejectionReason: rejectReason } });
    setRejectId(null);
    setRejectReason('');
  };

  const pending = applications.filter((a: TeacherApplicationRecord) => a.status === 'Pending');
  const evaluating = applications.filter((a: TeacherApplicationRecord) => a.status === 'Under Evaluation');
  const reviewed = applications.filter((a: TeacherApplicationRecord) => a.status === 'Accepted' || a.status === 'Rejected');

  const buildItems = (items: TeacherApplicationRecord[]) =>
    items.map((app) => ({
      title: (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {app.profileImageUrl ? (
              <img
                src={app.profileImageUrl}
                alt={app.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-base font-bold text-blue-700 dark:text-blue-300 ring-2 ring-slate-200 dark:ring-slate-700">
                {app.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{app.name}</span>
          </div>
          <StatusBadge status={app.status} />
        </div>
      ),
      content: (
        <ApplicationDetails
          app={app}
          onEvaluate={(id) => { setEvaluateId(id); setZoomLink(''); }}
          onAccept={(id) => { setAcceptId(id); }}
          onReject={(id) => { setRejectId(id); setRejectReason(''); }}
          onViewCv={(id) => setOpenCvId((current) => (current === id ? null : id))}
          isCvOpen={openCvId === app._id}
        />
      ),
    }));

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('teacherApplicationsTitle')}
        subtitle={t('teacherApplicationsSubtitle')}
      />

      {isLoading ? (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBlock className="h-5 w-8 rounded-full" />
              <SkeletonBlock className="h-5 w-36" />
            </div>
            <SkeletonCardGrid variant="list" items={3} />
          </section>
          <section>
            <SkeletonBlock className="h-5 w-24 mb-3" />
            <SkeletonCardGrid variant="list" items={2} />
          </section>
        </div>
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
              <Accordion items={buildItems(pending)} />
            )}
          </section>

          {/* Under Evaluation */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{evaluating.length}</span>
              {t('underEvaluation')}
            </h2>
            {evaluating.length === 0 ? (
              <EmptyState description={t('noUnderEvaluationApplications')} />
            ) : (
              <Accordion items={buildItems(evaluating)} />
            )}
          </section>

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('reviewed')}</h2>
              <Accordion items={buildItems(reviewed)} />
            </section>
          )}
        </div>
      )}

      {/* Evaluation Dialog */}
      <Dialog open={!!evaluateId} onOpenChange={() => setEvaluateId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {t('startEvaluationTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('evaluationEmailNote')}
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
            <Button variant="outline" onClick={() => setEvaluateId(null)}>{t('cancel')}</Button>
            <Button
              onClick={handleEvaluateConfirm}
              disabled={!zoomLink.trim() || reviewMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {reviewMutation.isPending ? t('sending') : t('sendAndStartEvaluation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={!!acceptId} onOpenChange={() => setAcceptId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              {t('acceptAfterEvaluation')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('acceptAfterEvaluationNote')}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAcceptId(null)}>{t('cancel')}</Button>
            <Button
              onClick={handleAcceptConfirm}
              disabled={reviewMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {reviewMutation.isPending ? t('sending') : t('confirmAccept')}
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

