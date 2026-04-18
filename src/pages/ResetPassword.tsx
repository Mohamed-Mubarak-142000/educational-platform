import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/api/authApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

type FormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const schema = useMemo(() => z
    .object({
      newPassword: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('passwordsDoNotMatchValidation'),
      path: ['confirmPassword'],
    }), [t]);

  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const canSubmit = useMemo(() => token.length > 0 && email.length > 0, [token, email]);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      navigate('/login');
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    if (!canSubmit) return;
    mutation.mutate({
      email,
      token,
      password: data.newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="pt-28 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[640px] h-[640px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[460px] h-[460px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />

          <div className="max-w-2xl mx-auto px-6 relative z-10">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-2xl rounded-3xl">
              <CardHeader className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('resetPasswordSubtitle')}</p>
              </CardHeader>
              <CardContent>
                {!canSubmit && (
                  <p className="text-sm text-red-500">{t('resetPasswordInvalid')}</p>
                )}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <PasswordInput {...form.register('newPassword')} placeholder={t('newPassword')} className="w-full" />
                    {form.formState.errors.newPassword && (
                      <span className="text-red-500 text-sm">{form.formState.errors.newPassword.message}</span>
                    )}
                  </div>
                  <div>
                    <PasswordInput {...form.register('confirmPassword')} placeholder={t('confirmPassword')} className="w-full" />
                    {form.formState.errors.confirmPassword && (
                      <span className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</span>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" disabled={mutation.isPending || !canSubmit}>
                    {mutation.isPending ? t('loadingEllipsis') : t('resetPasswordAction')}
                  </Button>
                  {mutation.isError && (
                    <p className="text-red-500 text-center text-sm">{t('resetPasswordFailed')}</p>
                  )}
                </form>
                <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                  <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {t('requestNewReset')}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
