import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { approvePayment, getPayments, rejectPayment } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from 'react-i18next';

export default function AdminPayments() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: payments = [], refetch } = useQuery({
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

  const requestAction = (id: string, action: 'approve' | 'reject') => {
    setSelectedId(id);
    setConfirmAction(action);
  };

  const onConfirm = () => {
    if (!selectedId || !confirmAction) return;
    if (confirmAction === 'approve') {
      approveMutation.mutate(selectedId);
    }
    if (confirmAction === 'reject') {
      rejectMutation.mutate(selectedId);
    }
    setConfirmAction(null);
  };

  return (
    <div className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('adminPayments')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('adminPaymentsSubtitle')}</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>{t('pendingPayments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left py-3">{t('studentName')}</th>
                  <th className="text-left py-3">{t('plan')}</th>
                  <th className="text-left py-3">{t('paymentMethod')}</th>
                  <th className="text-left py-3">{t('screenshot')}</th>
                  <th className="text-left py-3">{t('status')}</th>
                  <th className="text-right py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium">{payment.studentId?.name}</td>
                    <td className="py-3">{payment.plan}</td>
                    <td className="py-3">{payment.method}</td>
                    <td className="py-3">
                      <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {t('view')}
                      </a>
                    </td>
                    <td className="py-3">{payment.status}</td>
                    <td className="py-3 text-right space-x-2">
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
