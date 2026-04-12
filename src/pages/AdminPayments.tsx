import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { approvePayment, getPayments, rejectPayment, type Payment } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from 'react-i18next';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared';
import { spacing, cardVariants } from '@/lib/constants';
import { PageHeader } from '@/components/shared';

export default function AdminPayments() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: payments = [], refetch, isLoading, isError } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getPayments('Pending'),
  });

  const approveMutation = useMutation({
    mutationFn: approvePayment,
    onSuccess: () => {
      pushToast({ type: 'success', title: t('toastPaymentApproved') });
      refetch();
    },
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectPayment,
    onSuccess: () => {
      pushToast({ type: 'success', title: t('toastPaymentRejected') });
      refetch();
    },
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const getPaymentMethodLabel = (method: string) => {
    if (method === 'Vodafone Cash') return t('vodafoneCash');
    if (method === 'InstaPay') return t('instaPay');
    return method;
  };
  
  const getPaymentStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'approved') return t('paymentStatusApproved');
    if (normalized === 'pending') return t('paymentStatusPending');
    if (normalized === 'rejected') return t('paymentStatusRejected');
    return status;
  };
  
  const getPlanLabel = (plan: string) => {
    if (plan === 'Monthly') return t('planMonthly');
    if (plan === 'Quarterly') return t('planQuarterly');
    if (plan === 'Yearly') return t('planYearly');
    return plan;
  };

  const requestAction = (id: string, action: 'approve' | 'reject') => {
    setSelectedId(id);
    setConfirmAction(action);
  };

  const onConfirm = async () => {
    if (!selectedId || !confirmAction) return;
    if (confirmAction === 'approve') {
      await approveMutation.mutateAsync(selectedId);
    }
    if (confirmAction === 'reject') {
      await rejectMutation.mutateAsync(selectedId);
    }
    setConfirmAction(null);
  };

  return (
    <div className={spacing.pageContainer}>
      <PageHeader title={t('adminPayments')} subtitle={t('adminPaymentsSubtitle')} />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('pendingPayments')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable columns={6} rows={6} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : payments.length === 0 ? (
            <EmptyState />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-start py-3 px-2">{t('studentName')}</th>
                  <th className="text-start py-3 px-2">{t('plan')}</th>
                  <th className="text-start py-3 px-2">{t('paymentMethod')}</th>
                  <th className="text-start py-3 px-2">{t('screenshot')}</th>
                  <th className="text-start py-3 px-2">{t('status')}</th>
                  <th className="text-end py-3 px-2">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: Payment) => (
                  <tr key={payment._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 px-2 font-medium">
                      {typeof payment.studentId === 'object' ? payment.studentId?.name : '-'}
                    </td>
                    <td className="py-3 px-2">{getPlanLabel(payment.plan)}</td>
                    <td className="py-3 px-2">{getPaymentMethodLabel(payment.method)}</td>
                    <td className="py-3 px-2">
                      <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {t('view')}
                      </a>
                    </td>
                    <td className="py-3 px-2">{getPaymentStatusLabel(payment.status)}</td>
                    <td className="py-3 px-2 text-end space-x-2">
                      <Button variant="ghost" onClick={() => requestAction(payment._id, 'approve')}>
                        {t('approve')}
                      </Button>
                      <Button variant="ghost" className="text-red-500" onClick={() => requestAction(payment._id, 'reject')}>
                        {t('reject')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction !== null}
        title={t('confirmAction')}
        description={t('confirmActionDescription')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onCancel={() => setConfirmAction(null)}
        onConfirm={onConfirm}
      />
    </div>
  );
}
