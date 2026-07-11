import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { resendOTP } from '@/api/authApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { useNavigate } from 'react-router-dom';
import { roleHome, type Role } from '@/utils/routes';
import { useAuth } from '@/context/AuthContext';
import type { AuthTokenResponse } from '@/api/authApi';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

const pendingEmailKey = 'pendingVerificationEmail';

type FormValues = z.infer<typeof schema>;

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function VerifyEmail() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();
  const [resendMessage, setResendMessage] = useState('');
  const { verifyMutation } = useAuth();

  const resendMutation = useMutation({
    mutationFn: resendOTP,
    onSuccess: (data) => setResendMessage(data?.message || t('otpResent')),
    onError: (error: ApiError) => {
      setResendMessage(error?.response?.data?.message || t('otpResendFailed'));
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: localStorage.getItem(pendingEmailKey) || '',
      otp: '',
    },
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem(pendingEmailKey);
    if (storedEmail && !form.getValues('email')) {
      form.setValue('email', storedEmail);
    }
  }, [form]);

  const onSubmit = (data: FormValues) => {
    localStorage.setItem(pendingEmailKey, data.email);
    verifyMutation.mutate(
      { email: data.email, otp: data.otp },
      {
        onSuccess: (response) => {
          const auth = response as AuthTokenResponse | null;
          localStorage.removeItem(pendingEmailKey);
          if (auth?.mustChangePassword) {
            navigate('/change-password');
            return;
          }
          const role = auth?.role;
          const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
          navigate(roleHome(normalizedRole));
        },
      }
    );
  };

  const onResend = () => {
    const email = form.getValues('email');
    if (!email) return;
    localStorage.setItem(pendingEmailKey, email);
    resendMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="pt-28 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[640px] h-[640px] bg-violet-400/20 dark:bg-violet-900/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[460px] h-[460px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[110px] pointer-events-none" />

          <div className="max-w-2xl mx-auto px-6 relative z-10">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-2xl rounded-3xl">
              <CardHeader className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <CardTitle className="text-2xl">{t('otpTitle')}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('otpSubtitle')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input {...form.register('email')} placeholder={t('email')} type="email" className="w-full" />
                    {form.formState.errors.email && (
                      <span className="text-red-500 text-sm">{form.formState.errors.email.message}</span>
                    )}
                  </div>
                  <div>
                    <Input {...form.register('otp')} placeholder={t('otp')} className="w-full text-center tracking-[1em]" maxLength={6} />
                    {form.formState.errors.otp && (
                      <span className="text-red-500 text-sm">{form.formState.errors.otp.message}</span>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30" disabled={verifyMutation.isPending}>
                    {verifyMutation.isPending ? t('loadingEllipsis') : t('verifyOTP')}
                  </Button>
                  {verifyMutation.isError && (
                    <p className="text-red-500 text-center text-sm">{t('otpInvalid')}</p>
                  )}
                </form>
                <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                  <Button variant="ghost" className="text-violet-600 dark:text-violet-400" onClick={onResend} disabled={resendMutation.isPending}>
                    {resendMutation.isPending ? t('loadingEllipsis') : t('resendOtp')}
                  </Button>
                  {resendMessage && <p className="text-slate-500 dark:text-slate-400">{resendMessage}</p>}
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
