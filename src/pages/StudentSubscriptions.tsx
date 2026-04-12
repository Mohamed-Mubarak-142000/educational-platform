import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMyPayments, getMySubscription, submitPayment, uploadPaymentProof } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Payment = {
  _id: string;
  plan: string;
  method: string;
  status: string;
};

type Subscription = {
  plan?: string;
  status?: string;
};

export default function StudentSubscriptions() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  
  const plans = [
    { id: 'monthly', label: t('planMonthly'), amount: 120 },
    { id: 'quarterly', label: t('planQuarterly'), amount: 300 },
    { id: 'yearly', label: t('planYearly'), amount: 1000 },
  ];
  
  const paymentMethods = [
    { value: 'Vodafone Cash', label: t('vodafoneCash') },
    { value: 'InstaPay', label: t('instaPay') },
  ];
  
  const getPaymentMethodLabel = (method: string) => {
    const found = paymentMethods.find(pm => pm.value === method);
    return found ? found.label : method;
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
  
  const [plan, setPlan] = useState(plans[0]);
  const [method, setMethod] = useState(paymentMethods[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: subscription } = useQuery<Subscription>({ queryKey: ['subscription'], queryFn: getMySubscription });
  const { data: payments = [], refetch } = useQuery<Payment[]>({ queryKey: ['my-payments'], queryFn: getMyPayments });

  const uploadMutation = useMutation({
    mutationFn: uploadPaymentProof,
    onError: () => pushToast({ type: 'error', title: t('toastUploadFailed') }),
  });

  const submitMutation = useMutation({
    mutationFn: submitPayment,
    onSuccess: () => {
      pushToast({ type: 'success', title: t('toastPaymentSubmitted') });
      refetch();
      setFile(null);
    },
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const onSubmit = async () => {
    if (!file) {
      pushToast({ type: 'error', title: t('toastUploadRequired') });
      return;
    }

    const upload = await uploadMutation.mutateAsync(file);
    await submitMutation.mutateAsync({
      plan: plan.label,
      amount: plan.amount,
      method,
      screenshotUrl: upload.url,
    });
  };

  const requestSubmit = () => {
    setConfirmOpen(true);
  };

  return (
    <div className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('studentSubscriptions')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('studentSubscriptionsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('choosePlan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlan(item)}
                  className={`rounded-2xl border p-4 text-left transition-all ${plan.id === item.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-xl font-semibold mt-2">${item.amount}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('paymentMethod')}</p>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMethod(item.value)}
                    className={`rounded-full px-4 py-2 text-sm border ${method === item.value ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">{t('sendPaymentTo')}</p>
              <p className="text-lg font-semibold">01050867135</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('uploadProof')}</p>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <Button onClick={requestSubmit} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? t('loadingEllipsis') : t('submitPayment')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle>{t('subscriptionStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">{t('currentPlan')}</p>
            <p className="text-lg font-semibold">{subscription?.plan || t('noPlan')}</p>
            <p className="text-sm text-slate-500 mt-4">{t('status')}</p>
            <p className="text-lg font-semibold">{subscription?.status === 'Active' ? t('active') : subscription?.status === 'Cancelled' ? t('cancelled') : t('inactive')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 mt-8">
        <CardHeader>
          <CardTitle>{t('paymentHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left py-3">{t('plan')}</th>
                  <th className="text-left py-3">{t('paymentMethod')}</th>
                  <th className="text-left py-3">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3">{getPlanLabel(payment.plan)}</td>
                    <td className="py-3">{getPaymentMethodLabel(payment.method)}</td>
                    <td className="py-3">{getPaymentStatusLabel(payment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        title={t('confirmAction')}
        description={t('confirmActionDescription')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await onSubmit();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
