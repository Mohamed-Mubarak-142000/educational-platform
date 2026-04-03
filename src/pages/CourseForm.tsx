/**
 * CourseForm Page
 * 
 * Dedicated page for creating and editing courses
 * Replaces the dialog-based form with a full page experience
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createCourse, getCourses, updateCourse } from '@/api/courseApi';
import { getTeachers } from '@/api/adminApi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import { FormPageLayout, FormField } from '@/components/shared';

export default function CourseForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // CRUD operations
  const { createMutation, updateMutation } = useCRUDOperations({
    queryKey: ['courses'],
    queryFn: getCourses,
    createFn: createCourse,
    updateFn: updateCourse,
    createSuccessMessage: t('toastCourseCreated'),
    updateSuccessMessage: t('toastCourseUpdated'),
  });

  // Form state
  const { formState, setFormState } = useFormDialog({
    initialFormState: { title: '', description: '', price: '', thumbnail: '', teacherId: '' },
  });

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: user?.role === 'Admin',
  });

  // Fetch course data for edit mode
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && courses.length > 0) {
      const course = courses.find((c: any) => c._id === id);
      if (course) {
        setFormState({
          title: course.title || '',
          description: course.description || '',
          price: String(course.price || 0),
          thumbnail: course.thumbnail || '',
          teacherId: (typeof course.teacherId === 'object' && course.teacherId ? course.teacherId._id : course.teacherId as string) || '',
        });
      }
    }
  }, [isEditMode, id, courses, setFormState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      title: formState.title,
      description: formState.description,
      price: Number(formState.price || 0),
      thumbnail: formState.thumbnail,
    };

    if (user?.role === 'Admin' && formState.teacherId) {
      data.teacherId = formState.teacherId;
    }

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate('/admin/courses'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/courses'),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormPageLayout
      title={isEditMode ? t('editCourse') : t('addCourse')}
      subtitle={isEditMode ? t('editCourseSubtitle') : t('addCourseSubtitle')}
      backTo="/admin/courses"
      backLabel={t('backToCourses')}
    >
      <form onSubmit={handleSubmit} className={formClasses.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('title')} required>
            <Input
              placeholder={t('title')}
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('price')} required>
            <Input
              type="number"
              placeholder={t('price')}
              value={formState.price}
              onChange={(e) => setFormState({ ...formState, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </FormField>

          <FormField label={t('thumbnailUrl')}>
            <Input
              placeholder={t('thumbnailUrl')}
              value={formState.thumbnail}
              onChange={(e) => setFormState({ ...formState, thumbnail: e.target.value })}
            />
          </FormField>

          {user?.role === 'Admin' && (
            <FormField label={t('assignTeacher')}>
              <select
                value={formState.teacherId}
                onChange={(e) => setFormState({ ...formState, teacherId: e.target.value })}
                className={inputVariants.default}
              >
                <option value="">{t('selectTeacher')}</option>
                {teachers.map((teacher: any) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label={t('description')} required className="md:col-span-2">
            <textarea
              placeholder={t('description')}
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              required
              rows={4}
              className={`${inputVariants.default} h-auto py-2`}
            />
          </FormField>
        </div>

        <div className={formClasses.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/courses')}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" className={buttonVariants.primary} disabled={isLoading}>
            {isLoading ? t('saving') : isEditMode ? t('updateCourse') : t('createCourse')}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
