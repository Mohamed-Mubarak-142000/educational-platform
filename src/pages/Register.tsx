import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, Microscope, Video } from 'lucide-react';
import { getStages } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';

const pendingEmailKey = 'pendingVerificationEmail';

type Stage = {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Register() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { registerMutation } = useAuth();
  const navigate = useNavigate();

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const registerSchema = useMemo(() => z.object({
    name: z.string().min(2, { message: t('nameTooShort') }),
    email: z.string().email({ message: t('emailInvalid') }),
    password: z.string().min(6, { message: t('passwordMin') }),
    phone: z.string().optional(),
    parentEmail: z.string().email({ message: t('emailInvalid') }).optional().or(z.literal('')),
    stageId: z.string().optional(),
    subscribeLiveLessons: z.boolean().optional(),
  }), [t]);

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { subscribeLiveLessons: false },
  });

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        localStorage.setItem(pendingEmailKey, data.email);
        navigate('/verify-email');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[720px] h-[720px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[520px] h-[520px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
              <Activity className="w-4 h-4" /> {t('nextGenLearning')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t('registerTitle')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('registerSubtitle')}
            </p>
            <div className="grid gap-3 text-slate-600 dark:text-slate-300">
              {[t('featStudent2'), t('featStudent3'), t('featStudent4')].map((item) => (
                <div key={item} className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
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
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-2xl rounded-3xl">
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Microscope className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">
                  {t('register')}
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('registerSubtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <Input {...registerForm.register('name')} placeholder={t('name')} className="w-full" />
                    {registerForm.formState.errors.name && (
                      <span className="text-red-500 text-sm">{registerForm.formState.errors.name.message}</span>
                    )}
                  </div>
                  <div>
                    <Input {...registerForm.register('email')} placeholder={t('email')} type="email" className="w-full" />
                    {registerForm.formState.errors.email && (
                      <span className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</span>
                    )}
                  </div>
                  <div>
                    <PasswordInput {...registerForm.register('password')} placeholder={t('password')} className="w-full" />
                    {registerForm.formState.errors.password && (
                      <span className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</span>
                    )}
                  </div>
                  <div>
                    <Input {...registerForm.register('phone')} placeholder={t('phoneNumber')} className="w-full" />
                  </div>
                  <div>
                    <Input {...registerForm.register('parentEmail')} placeholder={t('parentEmail')} type="email" className="w-full" />
                    {registerForm.formState.errors.parentEmail && (
                      <span className="text-red-500 text-sm mt-1 block">{registerForm.formState.errors.parentEmail.message}</span>
                    )}
                  </div>
                  <div>
                    <select
                      {...registerForm.register('stageId')}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">{t('academicStage')}</option>
                      {stages.map((stage) => (
                        <option key={stage._id} value={stage._id}>
                          {stage.icon} {getLocalizedName(stage, i18n.language)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-blue-50/40 dark:bg-blue-900/10">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...registerForm.register('subscribeLiveLessons')}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-blue-600" /> {t('subscribeLiveLessonsLabel')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('subscribeLiveLessonsDesc')}
                        </p>
                      </div>
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? t('loadingEllipsis') : t('register')}
                  </Button>
                  {registerMutation.isError && (
                    <p className="text-red-500 text-center text-sm">
                      {(registerMutation.error as ApiError | null)?.response?.data?.message || t('registrationFailed')}
                    </p>
                  )}
                </form>

                <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {t('authHaveAccount')} <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">{t('login')}</Link>
                </div>
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
