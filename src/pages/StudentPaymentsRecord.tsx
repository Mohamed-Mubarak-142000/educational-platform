import { useQuery } from '@tanstack/react-query';
import { getMyPayments } from '@/api/adminApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonTable, EmptyState, ErrorState, PageHeader } from '@/components/shared';
import { spacing, cardVariants } from '@/lib/constants';

type PaymentRecord = {
  _id: string;
  plan: string;
  amount: number;
  method: string;
  status: string;
  screenshotUrl?: string;
  createdAt?: string;
};

export default function StudentPaymentsRecord() {
  const { t } = useTranslation();

  const { data: payments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  });

  return (
    <div className={spacing.pageContainer}>
      <PageHeader title={t('paymentsRecord')} subtitle={t('paymentsRecordSubtitle')} />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('paymentHistory')}</CardTitle>
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
                    <th className="text-start py-3 px-2">{t('plan')}</th>
                    <th className="text-start py-3 px-2">{t('amount')}</th>
                    <th className="text-start py-3 px-2">{t('paymentMethod')}</th>
                    <th className="text-start py-3 px-2">{t('status')}</th>
                    <th className="text-start py-3 px-2">{t('paymentDate')}</th>
                    <th className="text-start py-3 px-2">{t('screenshot')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments as PaymentRecord[]).map((payment) => (
                    <tr key={payment._id} className="border-t border-slate-200/60 dark:border-slate-800">
                      <td className="py-3 px-2 font-medium">{payment.plan}</td>
                      <td className="py-3 px-2">{payment.amount}</td>
                      <td className="py-3 px-2">{payment.method}</td>
                      <td className="py-3 px-2">{payment.status}</td>
                      <td className="py-3 px-2">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-2">
                        {payment.screenshotUrl ? (
                          <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {t('view')}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
