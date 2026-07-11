/**
 * TeacherForm Page
 * 
 * Dedicated page for creating and editing teachers
 * Replaces the dialog-based form with a full page experience
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createTeacher, getTeachers, updateTeacher, uploadTeacherApplicationFile, type Teacher, type TeacherInput } from '@/api/adminApi';
import { getStages, getSubjectsByStage, type Stage, type Subject } from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import { FormPageLayout, FormField, PdfViewer } from '@/components/shared';
import AvatarUpload from '@/components/AvatarUpload';
import { CheckCircle2, Clock, Download, Eye, Plus, Upload, X } from 'lucide-react';
import type { DayOfWeek } from '@/api/adminApi';

const ALL_DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type HourEntry = { start: string; end: string };

export default function TeacherForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

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
      bio: '',
      stageId: '',
      subjectIds: [] as string[],
      profileImage: '',
      cvUrl: '',
      availableDays: [] as DayOfWeek[],
      availableHours: {} as Partial<Record<DayOfWeek, HourEntry>>,
    },
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const { data: subjectsByStage = [] } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', formState.stageId],
    queryFn: () => getSubjectsByStage(formState.stageId),
    enabled: Boolean(formState.stageId),
  });

  // Fetch teacher data for edit mode
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (!isEditMode || teachers.length === 0) return;

    const teacher = teachers.find((t: Teacher) => t._id === id);
    if (!teacher) return;

    const imagePreview = teacher.profileImage || '';
    setFormState({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      stageId: (() => {
        const s = teacher.stageIds?.[0] ?? teacher.stageId;
        return (typeof s === 'object' && s !== null ? s._id : s) || '';
      })(),
      subjectIds: (teacher.subjectIds || []).map((s) =>
        typeof s === 'object' && s !== null ? s._id : s
      ),
      profileImage: imagePreview,
      cvUrl: teacher.cvUrl || '',
      availableDays: (teacher.availableDays || []) as DayOfWeek[],
      availableHours: (teacher.availableHours || {}) as Partial<Record<DayOfWeek, HourEntry>>,
    });
    // Reset CV preview state — intentional single setState call inside effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCvPreviewOpen(false);
  }, [isEditMode, id, teachers, setFormState]);

  useEffect(() => {
    if (!formState.stageId) return;
    setFormState((prev) => ({ ...prev, subjectIds: [] }));
  }, [formState.stageId, setFormState]);

  const displayPreview = profileImageFile ? profileImagePreview : formState.profileImage;

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfileImageFile(_file);
    setProfileImagePreview(previewUrl);
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormState((prev) => {
      const has = prev.availableDays.includes(day);
      if (has) {
        const newDays = prev.availableDays.filter((d) => d !== day);
        const newHours = { ...prev.availableHours };
        delete newHours[day];
        return { ...prev, availableDays: newDays, availableHours: newHours };
      }
      if (prev.availableDays.length >= 4) return prev;
      return {
        ...prev,
        availableDays: [...prev.availableDays, day],
        availableHours: { ...prev.availableHours, [day]: { start: '09:00', end: '11:00' } },
      };
    });
  };

  const setHour = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
    setFormState((prev) => ({
      ...prev,
      availableHours: { ...prev.availableHours, [day]: { ...prev.availableHours[day], [field]: value } },
    }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!formState.name.trim()) errs.push(t('errorNameRequired'));
    if (!formState.email.trim() || !/\S+@\S+\.\S+/.test(formState.email)) errs.push(t('errorEmailRequired'));
    if (!formState.phone.trim()) errs.push(t('errorPhoneRequired'));
    if (!formState.stageId) errs.push(t('errorStageRequired'));
    if (!formState.subjectIds.length) errs.push(t('errorSubjectRequired'));
    if (formState.availableDays.length < 2) errs.push(t('errorSelectDays'));
    for (const day of formState.availableDays) {
      const h = formState.availableHours[day];
      if (!h || !h.start || !h.end || h.start >= h.end) {
        errs.push(t('errorInvalidHours', { day: t(`dayName_${day}`) }));
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    const data: TeacherInput = {
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      bio: formState.bio,
      availableDays: formState.availableDays,
      availableHours: formState.availableHours as Record<DayOfWeek, HourEntry>,
    };

    const selectedSubject = subjectsByStage.find((s) => formState.subjectIds.includes(s._id));
    data.stageId = formState.stageId;
    data.stageIds = formState.stageId ? [formState.stageId] : [];
    data.subjectIds = formState.subjectIds;
    data.subject = selectedSubject?.name || undefined;

    if (profileImageFile) {
      const upload = await uploadTeacherApplicationFile(profileImageFile);
      data.profileImage = upload.url;
    } else if (formState.profileImage) {
      data.profileImage = formState.profileImage;
    }

    if (cvFile) {
      const upload = await uploadTeacherApplicationFile(cvFile);
      data.cvUrl = upload.url;
    } else if (formState.cvUrl) {
      data.cvUrl = formState.cvUrl;
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

  const toggleSubject = (subjectId: string) => {
    setFormState((prev) => {
      const has = prev.subjectIds.includes(subjectId);
      return {
        ...prev,
        subjectIds: has
          ? prev.subjectIds.filter((id) => id !== subjectId)
          : [...prev.subjectIds, subjectId],
      };
    });
  };

  return (
    <FormPageLayout
      title={isEditMode ? t('editTeacher') : t('addTeacher')}
      subtitle={isEditMode ? t('editTeacherSubtitle') : t('addTeacherSubtitle')}
      backTo="/admin/teachers"
      backLabel={t('backToTeachers')}
    >
      <form onSubmit={handleSubmit} className={formClasses.container}>
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}
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

          <FormField label={t('phone')} required>
            <Input
              placeholder={t('phoneNumber')}
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              required
            />
          </FormField>
        </div>

        <FormField label={t('bio')}>
          <Textarea
            placeholder={t('bioPlaceholder')}
            value={formState.bio}
            onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('stageLabel')} required>
            <select
              value={formState.stageId}
              onChange={(e) => setFormState({ ...formState, stageId: e.target.value })}
              className={inputVariants.default}
              required
            >
              <option value="">{t('selectStagePlaceholder')}</option>
              {stages.map((stage: Stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.icon} {getLocalizedName(stage, i18n.language)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t('subject')} required>
            {!formState.stageId ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic py-2">{t('selectStageFirst')}</p>
            ) : subjectsByStage.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic py-2">{t('noSubjectsInStage')}</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {subjectsByStage.map((subject: Subject) => {
                  const checked = formState.subjectIds.includes(subject._id);
                  return (
                    <button
                      key={subject._id}
                      type="button"
                      onClick={() => toggleSubject(subject._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        checked
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-violet-400'
                      }`}
                    >
                      {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {subject.icon} {getLocalizedName(subject, i18n.language)}
                    </button>
                  );
                })}
              </div>
            )}
          </FormField>
        </div>

        <FormField label={t('cvResume')}>
          <div className="space-y-2">
            <div
              onClick={() => cvInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-violet-500 transition bg-slate-50 dark:bg-slate-800"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">
                {cvFile ? cvFile.name : formState.cvUrl ? t('viewCv') : t('uploadCvPlaceholder')}
              </span>
              {cvFile && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                  className="ml-auto text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {formState.cvUrl && !cvFile && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCvPreviewOpen((prev) => !prev)}
                >
                  <Eye className="w-4 h-4" />
                  {cvPreviewOpen ? t('close') : t('viewCv')}
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={formState.cvUrl} download>
                    <Download className="w-4 h-4" />
                    {t('downloadCv')}
                  </a>
                </Button>
              </div>
            )}
            {formState.cvUrl && !cvFile && cvPreviewOpen && (
              <PdfViewer url={formState.cvUrl} className="border-slate-200 dark:border-slate-800" />
            )}
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCvFile(file);
              }}
            />
          </div>
        </FormField>

        <FormField label={t('availableDays')} required helpText={t('select2To4Days')}>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const selected = formState.availableDays.includes(day);
              const disabled = !selected && formState.availableDays.length >= 4;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? 'bg-violet-600 text-white border-violet-600'
                      : disabled
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-violet-400'
                  }`}
                >
                  {selected ? <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" /> : <Plus className="inline w-3.5 h-3.5 mr-1" />}
                  {t(`dayName_${day}`)}
                </button>
              );
            })}
          </div>
        </FormField>

        {formState.availableDays.length > 0 && (
          <FormField label={t('availableHoursPerDay')} required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formState.availableDays.map((day) => (
                <div key={day} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-4 h-4" />{t(`dayName_${day}`)}
                  </span>
                  <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
                    <input
                      type="time"
                      value={formState.availableHours[day]?.start || '09:00'}
                      onChange={(e) => setHour(day, 'start', e.target.value)}
                      className={inputVariants.default}
                    />
                    <span className="text-slate-400 text-sm flex-shrink-0">–</span>
                    <input
                      type="time"
                      value={formState.availableHours[day]?.end || '11:00'}
                      onChange={(e) => setHour(day, 'end', e.target.value)}
                      className={inputVariants.default}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FormField>
        )}

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
