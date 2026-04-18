/**
 * TeacherProfileEdit — /teacher/profile/edit
 * Allows the logged-in teacher to update:
 *  - Personal info (name, phone, bio)
 *  - Profile image (upload to Cloudinary via /upload endpoint)
 *  - Availability (days + time ranges)
 *  - Academic structure (stages → grades → subjects, dynamic chained selects)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, type UpdateProfilePayload } from '@/api/authApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { getGrades, getSubjectsByGrade, type Grade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getMyAssignments } from '@/api/teacherAssignmentApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormPageLayout } from '@/components/shared';
import {
  User, Phone, FileText, Camera, Clock,
  ArrowLeft, BookOpen, Layers, Upload, X, Loader2,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type Day = typeof DAYS_OF_WEEK[number];

const DAYS_AR: Record<Day, string> = {
  Sunday: 'الأحد', Monday: 'الاثنين', Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت',
};

// ── Multi-select pill component ───────────────────────────────────
function MultiPill<T extends { _id: string; name: string; nameAr?: string }>({
  items,
  selected,
  onChange,
  isAr,
  placeholder,
  disabled,
}: {
  items: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
  isAr: boolean;
  placeholder: string;
  disabled?: boolean;
}) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">{placeholder}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item._id);
        const label = isAr && item.nameAr ? item.nameAr : item.name;
        return (
          <button
            key={item._id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(item._id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
              active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function TeacherProfileEdit() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAr = i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  // Image: file or existing URL
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.profileImage ?? '');

  // Availability
  const [selectedDays, setSelectedDays] = useState<Day[]>((user?.availableDays as Day[]) ?? []);
  const [hours, setHours] = useState<Record<Day, { start: string; end: string }>>(() => {
    const h: Record<string, { start: string; end: string }> = {};
    for (const day of DAYS_OF_WEEK) {
      const existing = (user?.availableHours as any)?.[day];
      h[day] = { start: existing?.start ?? '', end: existing?.end ?? '' };
    }
    return h as Record<Day, { start: string; end: string }>;
  });

  // Academic
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>(user?.stageIds ?? []);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(user?.subjectIds ?? []);
  const gradeInitDone = useRef(false);

  // Stable keys to detect when profile academic data freshens (e.g., after a save).
  // Computed outside effects so they can be used as dependencies.
  const stageIdsKey = (user?.stageIds ?? []).join(',');
  const subjectIdsKey = (user?.subjectIds ?? []).join(',');

  // Sync personal fields when user account changes (login/logout).
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setPhone(user.phone ?? '');
    setBio(user.bio ?? '');
    setAvatarPreview(user.profileImage ?? '');
    setSelectedDays((user.availableDays as Day[]) ?? []);
    const h: Record<string, { start: string; end: string }> = {};
    for (const day of DAYS_OF_WEEK) {
      const existing = (user.availableHours as any)?.[day];
      h[day] = { start: existing?.start ?? '', end: existing?.end ?? '' };
    }
    setHours(h as Record<Day, { start: string; end: string }>);
  }, [user?._id]);

  // Sync academic selections whenever the profile's stageIds/subjectIds change.
  // Uses stringified keys so updates after a profile save are detected even though _id stays the same.
  useEffect(() => {
    if (!user) return;
    setSelectedStageIds(user.stageIds ?? []);
    setSelectedSubjectIds(user.subjectIds ?? []);
    gradeInitDone.current = false; // allow grade re-initialization with fresh assignment data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIdsKey, subjectIdsKey]);

  // ── Academic data queries ───────────────────────────────────────
  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  // Fetch existing assignments to determine which grades the teacher actually teaches
  const { data: myAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
  });

  // Load grades for ALL selected stages in parallel then merge
  const { data: allGrades = [], isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ['grades-for-stages', selectedStageIds],
    queryFn: async () => {
      if (selectedStageIds.length === 0) return [];
      const results = await Promise.all(selectedStageIds.map((sid) => getGrades(sid)));
      return results.flat();
    },
    enabled: selectedStageIds.length > 0,
  });

  // Pre-select grades from teacher's actual assignments on initial load only.
  // On subsequent stage changes, prune grades that are no longer valid.
  useEffect(() => {
    if (assignmentsLoading) return;

    const validGradeIds = new Set(allGrades.map((g) => g._id));

    if (!gradeInitDone.current) {
      if (allGrades.length === 0) return; // wait for grades to load
      const assignedGradeIds = new Set<string>(
        myAssignments
          .map((a) => (typeof a.gradeId === 'object' ? a.gradeId._id : a.gradeId))
          .filter(Boolean)
      );
      const preselected = allGrades.filter((g) => assignedGradeIds.has(g._id)).map((g) => g._id);
      // Use actual assigned grades; fall back to all grades only if teacher has no assignments yet
      setSelectedGradeIds(preselected.length > 0 ? preselected : allGrades.map((g) => g._id));
      gradeInitDone.current = true;
    } else {
      // Prune grades that no longer belong to a selected stage (stage was removed)
      setSelectedGradeIds((prev) => prev.filter((id) => validGradeIds.has(id)));
    }
  }, [allGrades, myAssignments, assignmentsLoading]);

  // Load subjects for ALL selected grades in parallel then merge (dedup by _id)
  const { data: allSubjects = [], isLoading: subjectsLoading } = useQuery<GradeSubjectSummary[]>({
    queryKey: ['subjects-for-grades', selectedGradeIds],
    queryFn: async () => {
      if (selectedGradeIds.length === 0) return [];
      const results = await Promise.all(selectedGradeIds.map((gid) => getSubjectsByGrade(gid)));
      const flat = results.flat();
      const seen = new Set<string>();
      return flat.filter((s) => {
        if (seen.has(s._id)) return false;
        seen.add(s._id);
        return true;
      });
    },
    enabled: selectedGradeIds.length > 0,
  });

  // Prune subject selection when the available subjects change — but only once
  // subjects have actually finished loading (guard against clearing on empty allSubjects).
  useEffect(() => {
    if (selectedGradeIds.length === 0 || subjectsLoading) return;
    const validSubjectIds = allSubjects.map((s) => s._id);
    setSelectedSubjectIds((prev) => prev.filter((id) => validSubjectIds.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSubjects, subjectsLoading]);

  // ── Image handling ──────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const toggleDay = (day: Day) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const setHourField = (day: Day, field: 'start' | 'end', value: string) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  // ── Submit ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      // Refresh the user profile so AuthContext reflects updated values immediately
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Invalidate all teacher-facing data caches so every page reflects the new profile values
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['my-unit-students'] });
      // Prefix-match invalidations: clear all grade/subject caches regardless of their dynamic key segments
      queryClient.invalidateQueries({ queryKey: ['grades-for-stages'] });
      queryClient.invalidateQueries({ queryKey: ['subjects-for-grades'] });
      // Clear stage-subject lists so TeacherSubjects and TeacherStages show fresh data
      queryClient.invalidateQueries({ queryKey: ['subjects-by-stage'] });
      navigate('/teacher');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const availableHours: Record<string, { start: string; end: string }> = {};
    for (const day of selectedDays) availableHours[day] = hours[day];

    mutation.mutate({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      availableDays: selectedDays,
      availableHours,
      stageIds: selectedStageIds,
      subjectIds: selectedSubjectIds,
      ...(avatarFile ? { avatarFile } : {}),
    });
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <FormPageLayout
      title={t('editProfile')}
      subtitle={t('editProfileSubtitle')}
      backTo="/teacher"
      backLabel={t('back')}
    >
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Profile Image ── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-5">
            <Camera className="w-4 h-4" />
            {t('profileImage')}
          </h2>

          <div className="flex items-start gap-6">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={clearAvatar}
                    title={t('remove')}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                id="avatar-file"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t('uploadImage')}
              </Button>
              <p className="text-xs text-slate-400">
                {t('imageUploadHint')}
              </p>
              {avatarFile && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {avatarFile.name}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Personal Info ── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <User className="w-4 h-4" />
            {t('personalInfo')}
          </h2>

          <FormField label={t('name')}>
            <Input
              id="prof-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="max-w-md"
            />
          </FormField>

          <FormField label={t('email')}>
            <Input
              id="prof-email"
              value={user?.email ?? ''}
              disabled
              className="max-w-md opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">{t('emailReadOnly')}</p>
          </FormField>

          <FormField label={t('phone')}>
            <div className="relative max-w-md">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="prof-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+201xxxxxxxxx"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label={t('bio')}>
            <div className="relative max-w-2xl">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea
                id="prof-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder={t('bioPlaceholder')}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>
        </section>

        {/* ── Academic Structure ── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <BookOpen className="w-4 h-4" />
            {t('academicStructure')}
          </h2>

          {/* Stages */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('assignedStages')}
            </p>
            <MultiPill
              items={stages}
              selected={selectedStageIds}
              onChange={setSelectedStageIds}
              isAr={isAr}
              placeholder={t('noStagesAvailable')}
            />
          </div>

          {/* Grades */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {t('assignedGrades')}
              {gradesLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </p>
            {selectedStageIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('selectStageFirst')}</p>
            ) : (
              <MultiPill
                items={allGrades}
                selected={selectedGradeIds}
                onChange={setSelectedGradeIds}
                isAr={isAr}
                placeholder={t('noGradesForStages')}
                disabled={gradesLoading}
              />
            )}
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {t('assignedSubjects')}
              {subjectsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </p>
            {selectedGradeIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('selectGradeFirst')}</p>
            ) : (
              <MultiPill
                items={allSubjects}
                selected={selectedSubjectIds}
                onChange={setSelectedSubjectIds}
                isAr={isAr}
                placeholder={t('noSubjectsForGrades')}
                disabled={subjectsLoading}
              />
            )}
          </div>
        </section>

        {/* ── Availability ── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            {t('availability')}
          </h2>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('availableDays')}</p>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {isAr ? DAYS_AR[day] : day}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('availableHours')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedDays.map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 flex-shrink-0">
                      {isAr ? DAYS_AR[day] : day}
                    </span>
                    <Input
                      type="time"
                      value={hours[day].start}
                      onChange={(e) => setHourField(day, 'start', e.target.value)}
                      className="w-28 text-sm"
                    />
                    <span className="text-slate-400 text-sm">–</span>
                    <Input
                      type="time"
                      value={hours[day].end}
                      onChange={(e) => setHourField(day, 'end', e.target.value)}
                      className="w-28 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Actions ── */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('saving')}
              </span>
            ) : (
              t('saveChanges')
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/teacher')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('cancel')}
          </Button>

        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">{t('toastActionFailed')}</p>
        )}
      </form>
    </FormPageLayout>
  );
}


