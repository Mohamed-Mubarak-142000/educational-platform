import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@/api/authApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => setSent(true),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
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
                <CardTitle className="text-2xl">{t('forgotPasswordTitle')}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('forgotPasswordSubtitle')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input {...form.register('email')} placeholder={t('email')} type="email" className="w-full" />
                    {form.formState.errors.email && (
                      <span className="text-red-500 text-sm">{form.formState.errors.email.message}</span>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" disabled={mutation.isPending}>
                    {mutation.isPending ? '...' : t('sendResetLink')}
                  </Button>
                  {sent && (
                    <p className="text-green-600 text-center text-sm">{t('resetEmailSent')}</p>
                  )}
                  {mutation.isError && (
                    <p className="text-red-500 text-center text-sm">{t('resetEmailSent')}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
