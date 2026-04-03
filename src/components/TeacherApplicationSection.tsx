/**
 * TeacherApplicationSection
 *
 * Landing-page section where prospective teachers can submit an application.
 * Includes: name, email, phone, profile picture, CV upload,
 * available days (2-4 required), and available hours per day.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitTeacherApplication } from '@/api/adminApi';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Upload,
  CheckCircle2,
  X,
  Plus,
  Clock,
  Phone,
  Mail,
  User,
  FileText,
} from 'lucide-react';
import type { DayOfWeek } from '@/api/mock/data';

const ALL_DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type HourEntry = { start: string; end: string };

interface AppForm {
  name: string;
  email: string;
  phone: string;
  profileImageFile: File | null;
  cvFile: File | null;
  selectedDays: DayOfWeek[];
  hours: Partial<Record<DayOfWeek, HourEntry>>;
}

const emptyForm: AppForm = {
  name: '',
  email: '',
  phone: '',
  profileImageFile: null,
  cvFile: null,
  selectedDays: [],
  hours: {},
};

export default function TeacherApplicationSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState<AppForm>(emptyForm);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const profileRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((p) => ({ ...p, profileImageFile: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((p) => ({ ...p, cvFile: file }));
  };

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev) => {
      const has = prev.selectedDays.includes(day);
      if (has) {
        const newDays = prev.selectedDays.filter((d) => d !== day);
        const newHours = { ...prev.hours };
        delete newHours[day];
        return { ...prev, selectedDays: newDays, hours: newHours };
      }
      if (prev.selectedDays.length >= 4) return prev; // max 4
      return {
        ...prev,
        selectedDays: [...prev.selectedDays, day],
        hours: { ...prev.hours, [day]: { start: '09:00', end: '11:00' } },
      };
    });
  };

  const setHour = (day: DayOfWeek, field: 'start' | 'end', val: string) => {
    setForm((p) => ({
      ...p,
      hours: { ...p.hours, [day]: { ...p.hours[day]!, [field]: val } },
    }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push(t('errorNameRequired'));
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.push(t('errorEmailRequired'));
    if (!form.phone.trim()) errs.push(t('errorPhoneRequired'));
    if (form.selectedDays.length < 2) errs.push(t('errorSelectDays'));
    for (const day of form.selectedDays) {
      const h = form.hours[day];
      if (!h || h.start >= h.end) errs.push(t('errorInvalidHours', { day }));
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setIsSubmitting(true);
    try {
      // In real app: upload files first, get URLs
      const profileImageUrl = profilePreview || undefined;
      const cvUrl = form.cvFile ? `https://placeholder.cv/${form.cvFile.name}` : undefined;

      await submitTeacherApplication({
        name: form.name,
        email: form.email,
        phone: form.phone,
        profileImageUrl,
        cvUrl,
        availableDays: form.selectedDays,
        availableHours: form.hours as Record<DayOfWeek, HourEntry>,
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="join-as-teacher" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900/80">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('applicationSubmitted')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {t('applicationThankYou')}
            </p>
            <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSubmitted(false); setForm(emptyForm); setProfilePreview(''); }}>
              {t('submitAnotherApp')}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="join-as-teacher" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900/80">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            {t('joinAsTeacher')}
          </span>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {t('teachWithAcademix')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {t('teacherAppDesc')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error list */}
            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4"
                >
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((err, i) => (
                      <li key={i} className="text-sm text-red-700 dark:text-red-400">{err}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile picture */}
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => profileRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden bg-slate-50 dark:bg-slate-800"
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Photo</span>
                  </div>
                )}
              </div>
              <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
              <p className="text-xs text-slate-500">Click to upload profile picture</p>
            </div>

            {/* Name / Email / Phone row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <User className="inline w-4 h-4 mr-1" />
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Dr. Ahmed Hassan"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Phone className="inline w-4 h-4 mr-1" />
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+20 100 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail className="inline w-4 h-4 mr-1" />
                  {t('emailAddress')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="yourname@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <FileText className="inline w-4 h-4 mr-1" />
                {t('cvResume')}
              </label>
              <div
                onClick={() => cvRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition bg-slate-50 dark:bg-slate-800"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {form.cvFile ? form.cvFile.name : t('uploadCvPlaceholder')}
                </span>
                {form.cvFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, cvFile: null })); }}
                    className="ml-auto text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
            </div>

            {/* Day Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('availableDays')} <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-slate-500">{t('select2To4Days')}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const selected = form.selectedDays.includes(day);
                  const disabled = !selected && form.selectedDays.length >= 4;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : disabled
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {selected ? <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" /> : <Plus className="inline w-3.5 h-3.5 mr-1" />}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hour Pickers for selected days */}
            <AnimatePresence>
              {form.selectedDays.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {t('availableHoursPerDay')} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {form.selectedDays.map((day) => (
                      <div key={day} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 flex-shrink-0">{day}</span>
                        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
                          <input
                            type="time"
                            value={form.hours[day]?.start || '09:00'}
                            onChange={(e) => setHour(day, 'start', e.target.value)}
                            className="flex-1 min-w-[110px] text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-slate-400 text-sm flex-shrink-0">–</span>
                          <input
                            type="time"
                            value={form.hours[day]?.end || '11:00'}
                            onChange={(e) => setHour(day, 'end', e.target.value)}
                            className="flex-1 min-w-[110px] text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-base font-semibold transition-all"
            >
              {isSubmitting ? t('submitting') : t('submitApplication')}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
