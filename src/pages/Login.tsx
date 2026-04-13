import * as z from 'zod';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function Login() {
  const { t } = useTranslation();
  const isRtl = useRTL(); // Using useRTL hook
  const { loginMutation } = useAuth();
  const navigate = useNavigate();

  const schema = useMemo(() => z.object({
    email: z.string().email({ message: t('emailInvalid') }),
    password: z.string().min(6, { message: t('passwordMin') }),
  }), [t]);

  type LoginFormData = z.infer<typeof schema>;

  // Using useAuthForm hook - Replaces manual form setup
  const { form, onSubmit, isSubmitting } = useAuthForm<LoginFormData>({
    schema,
    mutation: loginMutation,
    onSuccess: (response) => {
      const auth = response as AuthTokenResponse | null;
      if (auth?.mustChangePassword) {
        navigate('/change-password');
        return;
      }
      const role = auth?.role;
      const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
      navigate(roleHome(normalizedRole));
    },
  });

  const { register, formState: { errors } } = form;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
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
            className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}
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
                    <Input
                      {...register('password')}
                      placeholder={t('password')}
                      type="password"
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
                    <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <div className="text-center text-xs text-slate-400">
                    <Link to="/verify-email" className="hover:underline">
                      {t('otpTitle')}
                    </Link>
                  </div>
                  <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {t('authNoAccount')} <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">{t('register')}</Link>
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
