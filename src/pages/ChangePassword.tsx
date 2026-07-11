import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/api/authApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleHome, type Role } from '@/utils/routes';

export default function ChangePassword() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const schema = useMemo(() => z
    .object({
      currentPassword: z.string().min(6, { message: t('passwordMin') }),
      newPassword: z.string().min(6, { message: t('passwordMin') }),
      confirmPassword: z.string().min(6, { message: t('passwordMin') }),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    }), [t]);
  type FormValues = z.infer<typeof schema>;

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      refreshProfile();
      const role = user?.role;
      const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
      navigate(roleHome(normalizedRole));
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  useEffect(() => {
    if (!user) return;
    if (!user.mustChangePassword) {
      const role = user.role;
      const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
      navigate(roleHome(normalizedRole));
    }
  }, [user, navigate]);

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
                <CardTitle className="text-2xl">{t('changePasswordTitle')}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('changePasswordSubtitle')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <PasswordInput {...form.register('currentPassword')} placeholder={t('currentPassword')} className={`w-full ${form.formState.errors.currentPassword ? 'border-red-500' : ''}`} />
                    {form.formState.errors.currentPassword && (
                      <span className="text-red-500 text-xs mt-1 block">{form.formState.errors.currentPassword.message}</span>
                    )}
                  </div>
                  <div>
                    <PasswordInput {...form.register('newPassword')} placeholder={t('newPassword')} className={`w-full ${form.formState.errors.newPassword ? 'border-red-500' : ''}`} />
                    {form.formState.errors.newPassword && (
                      <span className="text-red-500 text-xs mt-1 block">{form.formState.errors.newPassword.message}</span>
                    )}
                  </div>
                  <div>
                    <PasswordInput {...form.register('confirmPassword')} placeholder={t('confirmPassword')} className={`w-full ${form.formState.errors.confirmPassword ? 'border-red-500' : ''}`} />
                    {form.formState.errors.confirmPassword && (
                      <span className="text-red-500 text-xs mt-1 block">{form.formState.errors.confirmPassword.message}</span>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30" disabled={mutation.isPending}>
                    {mutation.isPending ? t('loadingEllipsis') : t('changePasswordAction')}
                  </Button>
                  {mutation.isError && (
                    <p className="text-red-500 text-center text-sm">{t('changePasswordFailed')}</p>
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
