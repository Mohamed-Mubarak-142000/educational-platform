/**
 * CourseForm Page
 * 
 * Dedicated page for creating and editing courses
 * Replaces the dialog-based form with a full page experience
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createCourse, getCourses, getMyCourses, updateCourse, type Course, type CourseInput } from '@/api/courseApi';
import { getTeachers, type Teacher } from '@/api/adminApi';
import { getStages, getSubjectsByStage, type Stage, type Subject } from '@/api/subjectApi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import { FormPageLayout, FormField } from '@/components/shared';

export default function CourseForm() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const isTeacher = user?.role === 'Teacher';
  const backPath = isTeacher ? '/teacher/subjects' : '/admin/courses';

  const coursesQueryKey = isTeacher ? ['my-courses'] : ['courses'];
  const coursesQueryFn = isTeacher ? getMyCourses : getCourses;

  // CRUD operations
  const { createMutation, updateMutation } = useCRUDOperations({
    queryKey: coursesQueryKey,
    queryFn: coursesQueryFn,
    createFn: createCourse,
    updateFn: updateCourse,
    createSuccessMessage: t('toastCourseCreated'),
    updateSuccessMessage: t('toastCourseUpdated'),
  });

  // Form state
  const { formState, setFormState } = useFormDialog({
    initialFormState: { title: '', description: '', price: '', thumbnail: '', teacherId: '', stageId: '', subjectId: '' },
  });

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: user?.role === 'Admin',
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  // For teachers, restrict stages to the ones they are assigned to
  const availableStages = useMemo(() => {
    if (!isTeacher || !user?.stageIds?.length) return stages;
    return stages.filter((s) => user.stageIds!.includes(s._id));
  }, [stages, isTeacher, user?.stageIds]);

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', formState.stageId],
    queryFn: () => getSubjectsByStage(formState.stageId),
    enabled: !!formState.stageId,
  });

  // For teachers, further restrict subjects to their assigned ones
  const availableSubjects = useMemo(() => {
    if (!isTeacher || !user?.subjectIds?.length) return subjects;
    return subjects.filter((s) => user.subjectIds!.includes(s._id));
  }, [subjects, isTeacher, user?.subjectIds]);

  // Fetch course data for edit mode
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: coursesQueryKey,
    queryFn: () => coursesQueryFn(),
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && courses.length > 0) {
      const course = courses.find((c: Course) => c._id === id);
      if (course) {
        setFormState({
          title: course.title || '',
          description: course.description || '',
          price: String(course.price || 0),
          thumbnail: course.thumbnail || '',
          teacherId: (typeof course.teacherId === 'object' && course.teacherId ? course.teacherId._id : course.teacherId as string) || '',
          stageId: (typeof course.stageId === 'object' && course.stageId ? course.stageId._id : course.stageId as string) || '',
          subjectId: (typeof course.subjectId === 'object' && course.subjectId ? course.subjectId._id : course.subjectId as string) || '',
        });
      }
    }
  }, [isEditMode, id, courses, setFormState]);

  const subjectOptions = useMemo(() => availableSubjects, [availableSubjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CourseInput = {
      title: formState.title,
      description: formState.description,
      price: Number(formState.price || 0),
      thumbnail: formState.thumbnail,
      stageId: formState.stageId,
      subjectId: formState.subjectId,
    };

    if (user?.role === 'Admin' && formState.teacherId) {
      data.teacherId = formState.teacherId;
    }

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate(backPath),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate(backPath),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormPageLayout
      title={isEditMode ? t('editCourse') : t('addCourse')}
      subtitle={isEditMode ? t('editCourseSubtitle') : t('addCourseSubtitle')}
      backTo={backPath}
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

          <FormField label={t('stage')} required>
            <select
              value={formState.stageId}
              onChange={(e) => setFormState({ ...formState, stageId: e.target.value, subjectId: '' })}
              className={inputVariants.default}
              required
            >
              <option value="">{t('selectStage')}</option>
              {availableStages.map((stage) => (
                <option key={stage._id} value={stage._id}>
                  {getLocalizedName(stage, i18n.language)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t('subject')} required>
            <select
              value={formState.subjectId}
              onChange={(e) => setFormState({ ...formState, subjectId: e.target.value })}
              className={inputVariants.default}
              required
              disabled={!formState.stageId}
            >
              <option value="">
                {formState.stageId ? t('selectSubject') : t('selectStageFirst')}
              </option>
              {subjectOptions.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {getLocalizedName(subject, i18n.language)}
                </option>
              ))}
            </select>
          </FormField>

          {user?.role === 'Admin' && (
            <FormField label={t('assignTeacher')}>
              <select
                value={formState.teacherId}
                onChange={(e) => setFormState({ ...formState, teacherId: e.target.value })}
                className={inputVariants.default}
              >
                <option value="">{t('selectTeacher')}</option>
                {teachers.map((teacher: Teacher) => (
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
            onClick={() => navigate(backPath)}
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
