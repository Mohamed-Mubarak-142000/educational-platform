/**
 * TeacherForm Page
 * 
 * Dedicated page for creating and editing teachers
 * Replaces the dialog-based form with a full page experience
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createTeacher, getTeachers, updateTeacher } from '@/api/adminApi';
import { getStages, getSubjectsByStage } from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import { FormPageLayout, FormField } from '@/components/shared';
import AvatarUpload from '@/components/AvatarUpload';

export default function TeacherForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  // CRUD operations
  const { createMutation, updateMutation } = useCRUDOperations({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    createFn: createTeacher,
    updateFn: updateTeacher,
    createSuccessMessage: t('toastTeacherCreated'),
    updateSuccessMessage: t('toastTeacherUpdated'),
  });

  // Form state
  const { formState, setFormState } = useFormDialog({
    initialFormState: { 
      name: '', 
      email: '', 
      phone: '', 
      subject: '', 
      status: 'Active',
      profileImage: '',
      stageId: '',
    },
  });

  // Fetch teacher data for edit mode
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: isEditMode,
  });

  // Fetch all stages for the stage dropdown
  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  // Fetch subjects for the selected stage only
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects-by-stage', formState.stageId],
    queryFn: () => getSubjectsByStage(formState.stageId),
    enabled: !!formState.stageId,
  });

  // Populate form in edit mode — also try to restore the stage selection
  useEffect(() => {
    if (isEditMode && teachers.length > 0 && stages.length > 0) {
      const teacher = teachers.find((t: { _id: string; name: string; email: string; phone?: string; subject?: string; stageId?: string; status?: string; profileImage?: string }) => t._id === id);
      if (teacher) {
        const imagePreview = teacher.profileImage || '';
        setFormState({
          name: teacher.name || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          subject: teacher.subject || '',
          status: teacher.status || 'Active',
          profileImage: imagePreview,
          stageId: teacher.stageId || '',
        });
      }
    }
  }, [isEditMode, id, teachers, stages, setFormState]);

  const displayPreview = profileImageFile ? profileImagePreview : formState.profileImage;

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfileImageFile(_file);
    setProfileImagePreview(previewUrl);
  };

  const handleStageChange = (stageId: string) => {
    setFormState({ ...formState, stageId, subject: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, string> = {
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      subject: formState.subject,
      status: formState.status,
      ...(formState.stageId && { stageId: formState.stageId }),
    };

    // TODO: Implement image upload to cloudinary
    // For now, use the URL from form state
    if (profileImageFile) {
      // When upload is implemented, upload the file and get URL
      // const uploadedUrl = await uploadToCloudinary(profileImageFile);
      // data.profileImage = uploadedUrl;
      data.profileImage = profileImagePreview;
    } else if (formState.profileImage) {
      data.profileImage = formState.profileImage;
    }

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate('/admin/teachers'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/teachers'),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormPageLayout
      title={isEditMode ? t('editTeacher') : t('addTeacher')}
      subtitle={isEditMode ? t('editTeacherSubtitle') : t('addTeacherSubtitle')}
      backTo="/admin/teachers"
      backLabel={t('backToTeachers')}
    >
      <form onSubmit={handleSubmit} className={formClasses.container}>
        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <AvatarUpload
            preview={displayPreview}
            name={formState.name}
            onChange={handleAvatarChange}
            size="lg"
          />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('name')} required>
            <Input
              placeholder={t('teacherName')}
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('email')} required>
            <Input
              type="email"
              placeholder={t('teacherEmail')}
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

          <FormField label={t('stage') || 'Stage'}>
            <select
              value={formState.stageId}
              onChange={(e) => handleStageChange(e.target.value)}
              className={inputVariants.default}
              disabled={stagesLoading}
            >
              <option value="">
                {stagesLoading ? (t('loadingStages') || 'Loading stages…') : (t('selectStage') || 'Select stage')}
              </option>
              {stages.map((stage: any) => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t('subject')}>
            <select
              value={formState.subject}
              onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
              className={inputVariants.default}
              disabled={!formState.stageId || subjectsLoading}
            >
              <option value="">
                {!formState.stageId
                  ? (t('selectStageFirst') || 'Select a stage first')
                  : subjectsLoading
                  ? (t('loadingSubjects') || 'Loading subjects…')
                  : subjects.length === 0
                  ? (t('noSubjectsInStage') || 'No subjects in this stage')
                  : (t('selectSubject') || 'Select subject')}
              </option>
              {subjects.map((s: any) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
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
        </div>

        <div className={formClasses.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/teachers')}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" className={buttonVariants.primary} disabled={isLoading}>
            {isLoading ? t('saving') : isEditMode ? t('updateTeacher') : t('createTeacher')}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
