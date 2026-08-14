/**
 * StudentForm Page
 *
 * Dedicated page for creating and editing students.
 * Includes: basic info, academic stage selection, and live-lessons subscription opt-in.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createStudent, getStudents, updateStudent, uploadTeacherApplicationFile, type Student, type StudentInput } from '@/api/adminApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import { FormPageLayout, FormField } from '@/components/shared';
import AvatarUpload from '@/components/AvatarUpload';
import { useToast } from '@/components/ui/ToastProvider';
import { GraduationCap, Video } from 'lucide-react';

export default function StudentForm() {
  const { t, i18n } = useTranslation();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // CRUD operations
  const { createMutation, updateMutation } = useCRUDOperations({
    queryKey: ['students'],
    queryFn: () => getStudents(),
    createFn: createStudent,
    updateFn: updateStudent,
    createSuccessMessage: t('toastStudentCreated'),
    updateSuccessMessage: t('toastStudentUpdated'),
  });

  // Form state
  const { formState, setFormState } = useFormDialog({
    initialFormState: { 
      name: '', 
      email: '', 
      phone: '',
      parentEmail: '',
      status: 'Active',
      profileImage: '',
      stageId: '',
      subscribeLiveLessons: 'false',
    },
  });

  // Stages data
  const { data: stages = [] } = useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  // Fetch student data for edit mode
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => getStudents(),
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && students.length > 0) {
      const student = students.find((s: Student) => s._id === id);
      if (student) {
        const imagePreview = student.profileImage || '';
        setFormState({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          parentEmail: student.parentEmail || '',
          status: student.status || 'Active',
          profileImage: imagePreview,
          stageId: student.stageId || '',
          subscribeLiveLessons: student.subscribeLiveLessons ? 'true' : 'false',
        });
        if (imagePreview) {
          setProfileImagePreview(imagePreview);
        }
      }
    }
  }, [isEditMode, id, students, setFormState]);

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfileImageFile(_file);
    setProfileImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: StudentInput = {
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      parentEmail: formState.parentEmail,
      status: formState.status,
      stageId: formState.stageId,
      subscribeLiveLessons: formState.subscribeLiveLessons === 'true',
    };

    if (profileImageFile) {
      setIsUploadingImage(true);
      try {
        const uploaded = await uploadTeacherApplicationFile(profileImageFile);
        data.profileImage = uploaded.url;
      } catch {
        pushToast({
          title: t('imageUploadFailed', { defaultValue: 'Image upload failed' }),
          description: t('imageUploadFailedDesc', {
            defaultValue: 'The profile picture could not be uploaded. You can try saving again.',
          }),
          type: 'error',
        });
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    } else if (formState.profileImage) {
      data.profileImage = formState.profileImage;
    }

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate('/admin/students'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/students'),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingImage;

  return (
    <FormPageLayout
      title={isEditMode ? t('editStudent') : t('addStudent')}
      subtitle={isEditMode ? t('editStudentSubtitle') : t('addStudentSubtitle')}
      backTo="/admin/students"
      backLabel={t('backToStudents')}
    >
      <form onSubmit={handleSubmit} className={formClasses.container}>
        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <AvatarUpload
            preview={profileImagePreview}
            name={formState.name}
            onChange={handleAvatarChange}
            size="lg"
          />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('name')} required>
            <Input
              placeholder={t('studentName')}
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('email')} required>
            <Input
              type="email"
              placeholder={t('studentEmail')}
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('phone')}>
            <Input
              placeholder={t('phoneNumber')}
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
            />
          </FormField>

          <FormField label={t('parentEmailLabel')} helpText={t('parentEmailHelp')}>
            <Input
              type="email"
              placeholder={t('parentEmailPlaceholder')}
              value={formState.parentEmail}
              onChange={(e) => setFormState({ ...formState, parentEmail: e.target.value })}
            />
          </FormField>

          <FormField label={t('status')} required>
            <select
              value={formState.status}
              onChange={(e) => setFormState({ ...formState, status: e.target.value })}
              className={inputVariants.default}
              required
            >
              <option value="Active">{t('active')}</option>
              <option value="Inactive">{t('inactive')}</option>
            </select>
          </FormField>

          <FormField label={t('academicStageLabel')} helpText={t('academicStageHelp')}>
            <select
              value={formState.stageId}
              onChange={(e) => setFormState({ ...formState, stageId: e.target.value })}
              className={inputVariants.default}
            >
              <option value="">{t('selectStagePlaceholder')}</option>
              {stages.map((stage: Stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.icon} {getLocalizedName(stage, i18n.language)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Live Lessons Subscription */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-violet-50/40 dark:bg-violet-900/10">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <Video className="w-4 h-4 text-violet-600" />
            {t('liveLessonsSubscriptionTitle')}
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formState.subscribeLiveLessons === 'true'}
              onChange={(e) => setFormState({ ...formState, subscribeLiveLessons: e.target.checked ? 'true' : 'false' })}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('subscribeLiveLessonsTitle')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('subscribeLiveLessonsDesc')}
              </p>
            </div>
          </label>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-slate-500 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('academicStageCoursesNotice')}
            </p>
          </div>
        </div>

        <div className={formClasses.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/students')}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" className={buttonVariants.primary} disabled={isLoading}>
            {isLoading ? t('saving') : isEditMode ? t('updateStudent') : t('createStudent')}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
