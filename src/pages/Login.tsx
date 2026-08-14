import * as z from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, Microscope } from 'lucide-react';
import { roleHome, type Role } from '@/utils/routes';
import { useRTL, useAuthForm } from '@/hooks';
import { cardVariants, buttonVariants, badgeVariants, gradients, iconContainers, textColors } from '@/lib/constants';
import type { AuthTokenResponse } from '@/api/authApi';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const otpSchema = z.object({
  otp: z.string().min(6).max(6),
});
type OtpFormData = z.infer<typeof otpSchema>;

export default function Login() {
  const { t } = useTranslation();
  const isRtl = useRTL(); // Using useRTL hook
  const { loginMutation, verifyLoginOtpMutation } = useAuth();
  const navigate = useNavigate();
  const [otpUserId, setOtpUserId] = useState<string | null>(null);

  const schema = useMemo(() => z.object({
    email: z.string().email({ message: t('emailInvalid') }),
    password: z.string().min(6, { message: t('passwordMin') }),
  }), [t]);

  type LoginFormData = z.infer<typeof schema>;

  const completeLogin = (auth: AuthTokenResponse | null) => {
    if (auth?.mustChangePassword) {
      navigate('/change-password');
      return;
    }
    const role = auth?.role;
    const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
    navigate(roleHome(normalizedRole));
  };

  // Using useAuthForm hook - Replaces manual form setup
  const { form, onSubmit, isSubmitting } = useAuthForm<LoginFormData>({
    schema,
    mutation: loginMutation,
    onSuccess: (response) => {
      const auth = response as AuthTokenResponse | null;
      if (auth?.requiresOtp && auth.userId) {
        setOtpUserId(auth.userId);
        return;
      }
      completeLogin(auth);
    },
  });

  const { register, formState: { errors } } = form;

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmitOtp = (data: OtpFormData) => {
    if (!otpUserId) return;
    verifyLoginOtpMutation.mutate(
      { userId: otpUserId, otp: data.otp },
      { onSuccess: (response) => completeLogin(response as AuthTokenResponse | null) },
    );
  };

  if (otpUserId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <section className="pt-32 pb-20 relative overflow-hidden">
            <div className={gradients.blueTopRight} />
            <div className={gradients.indigoBottomLeft} />
            <div className="max-w-md mx-auto px-6 relative z-10">
              <Card className={cardVariants.premium}>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl">{t('otpTitle')}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('loginOtpSubtitle', { defaultValue: 'Enter the verification code sent to your email to finish signing in.' })}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
                    <div>
                      <Input
                        {...otpForm.register('otp')}
                        placeholder={t('otp')}
                        className="w-full text-center tracking-[1em]"
                        maxLength={6}
                      />
                      {otpForm.formState.errors.otp && (
                        <span className="text-red-500 text-sm">{otpForm.formState.errors.otp.message}</span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className={`w-full ${buttonVariants.primaryShadow}`}
                      disabled={verifyLoginOtpMutation.isPending}
                    >
                      {verifyLoginOtpMutation.isPending ? t('loadingEllipsis') : t('verifyOTP')}
                    </Button>
                    {verifyLoginOtpMutation.isError && (
                      <p className="text-red-500 text-center text-sm">{t('otpInvalid')}</p>
                    )}
                  </form>
                  <div className="mt-4 text-center text-sm">
                    <Button variant="ghost" className="text-violet-600 dark:text-violet-400" onClick={() => setOtpUserId(null)}>
                      {t('backToLogin', { defaultValue: 'Back to login' })}
                    </Button>
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="pt-32 pb-20 relative overflow-hidden">
        <div className={gradients.blueTopRight} />
        <div className={gradients.indigoBottomLeft} />

        <div className="max-w-6xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`hidden lg:block space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}
          >
            <div className={badgeVariants.info}>
              <Activity className="w-4 h-4" /> {t('welcome')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t('loginTitle')}
            </h1>
            <p className={`text-lg ${textColors.muted} leading-relaxed`}>
              {t('loginSubtitle')}
            </p>
            <div className={`grid gap-3 ${textColors.muted}`}>
              {[t('featStudent1'), t('featStudent2'), t('featStudent3')].map((item) => (
                <div key={item} className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                  <div className={iconContainers.small}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className={cardVariants.premium}>
              <CardHeader className="space-y-2">
                <div className={iconContainers.medium}>
                  <Microscope className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">{t('login')}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('loginSubtitle')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      {...register('email')}
                      placeholder={t('email')}
                      type="email"
                      className={`w-full ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message as string}</span>}
                  </div>
                  <div>
                    <PasswordInput
                      {...register('password')}
                      placeholder={t('password')}
                      className={`w-full ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message as string}</span>}
                  </div>
                  <Button
                    type="submit"
                    className={`w-full ${buttonVariants.primaryShadow}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('loadingEllipsis') : t('login')}
                  </Button>
                  {loginMutation.isError && (
                    <p className="text-red-500 text-center text-sm">
                      {(loginMutation.error as ApiError | null)?.response?.data?.message || t('toastActionFailed')}
                    </p>
                  )}
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    <Link to="/forgot-password" className="text-violet-600 dark:text-violet-400 hover:underline">
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <div className="text-center text-xs text-slate-400">
                    <Link to="/verify-email" className="hover:underline">
                      {t('otpTitle')}
                    </Link>
                  </div>
                  <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {t('authNoAccount')} <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:underline">{t('register')}</Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
