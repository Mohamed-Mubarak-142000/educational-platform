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
    },
  });

  // Fetch teacher data for edit mode
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && teachers.length > 0) {
      const teacher = teachers.find((t: { _id: string; name: string; email: string; phone?: string; subject?: string; status?: string; profileImage?: string }) => t._id === id);
      if (teacher) {
        const imagePreview = teacher.profileImage || '';
        setFormState({
          name: teacher.name || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          subject: teacher.subject || '',
          status: teacher.status || 'Active',
          profileImage: imagePreview,
        });
        // Note: profileImagePreview is derived from form state, avoid double setState
      }
    }
  }, [isEditMode, id, teachers, setFormState]);

  // Update preview when form profileImage changes
  useEffect(() => {
    if (formState.profileImage && !profileImageFile) {
      setProfileImagePreview(formState.profileImage);
    }
  }, [formState.profileImage, profileImageFile]);

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfileImageFile(_file);
    setProfileImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, string> = {
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      subject: formState.subject,
      status: formState.status,
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

          <FormField label={t('subject')}>
            <Input
              placeholder={t('teachingSubject')}
              value={formState.subject}
              onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
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
