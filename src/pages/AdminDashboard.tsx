import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createTeacher } from '@/api/authApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const mutation = useMutation({
    mutationFn: createTeacher,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl md:text-4xl font-bold">{t('adminDashboardTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('adminDashboardSubtitle')}</p>
      </div>
      <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl">{t('createTeacherTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input {...form.register('name')} placeholder={t('name')} className="w-full" />
              {form.formState.errors.name && (
                <span className="text-red-500 text-sm">{form.formState.errors.name.message}</span>
              )}
            </div>
            <div>
              <Input {...form.register('email')} placeholder={t('email')} type="email" className="w-full" />
              {form.formState.errors.email && (
                <span className="text-red-500 text-sm">{form.formState.errors.email.message}</span>
              )}
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" disabled={mutation.isPending}>
              {mutation.isPending ? '...' : t('createTeacherAction')}
            </Button>
            {mutation.isSuccess && (
              <p className="text-green-600 text-sm">{t('createTeacherSuccess')}</p>
            )}
            {mutation.isError && (
              <p className="text-red-500 text-sm">{t('createTeacherFailed')}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
