/**
 * AdminGradeSubjects.tsx
 *
 * Admin page for managing subjects within a specific grade.
 * Route: /admin/stages/:stageId/grades/:gradeId/subjects
 * Flow: Admin Stages → Admin Grades → [this page] → Subject Detail
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjectsByGrade, assignSubjectToGrade, removeSubjectFromGrade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getGradeById } from '@/api/gradeApi';
import { getStageById } from '@/api/subjectApi';
import { getSubjects, createSubject, type Subject } from '@/api/subjectApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Eye, BookOpen } from 'lucide-react';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';
import { ENTITY_COLORS } from '@/components/shared';

type SubjectColor = typeof ENTITY_COLORS[number]['value'];

const emptyForm = { 
  name: '', 
  nameAr: '', 
  description: '', 
  descriptionAr: '', 
  icon: '📚', 
  color: 'blue' as SubjectColor,
  category: 'general' as string,
};

export default function AdminGradeSubjects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stageId, gradeId } = useParams<{ stageId: string; gradeId: string }>();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [assignFormOpen, setAssignFormOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: stage } = useQuery({
    queryKey: ['stage', stageId],
    queryFn: () => getStageById(stageId!),
    enabled: !!stageId,
  });

  const { data: grade } = useQuery({
    queryKey: ['grade', gradeId],
    queryFn: () => getGradeById(gradeId!),
    enabled: !!gradeId,
  });

  const { data: gradeSubjects = [], isLoading } = useQuery<GradeSubjectSummary[]>({
    queryKey: ['grade-subjects', gradeId],
    queryFn: () => getSubjectsByGrade(gradeId!),
    enabled: !!gradeId,
  });

  // ══════════════════════════════════════════════════════════════
  // Fetch subjects for current stage (auto-detected from route)
  // Dialog uses stage context automatically - no manual selection needed
  // ══════════════════════════════════════════════════════════════
  const { data: stageFilteredSubjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['subjects', stageId],
    queryFn: () => getSubjects({ stageId: stageId! }),
    enabled: assignFormOpen && !!stageId, // Only fetch when dialog is open (stage is always known from route)
  });

  // ══════════════════════════════════════════════════════════════
  // Filter out subjects already assigned to this grade
  // AND remove general/shared subjects (only show stage-specific)
  // ══════════════════════════════════════════════════════════════
  const availableSubjects = stageFilteredSubjects.filter(s => {
    // Remove if already assigned to this grade
    if (gradeSubjects.find(gs => gs._id === s._id)) return false;
    
    // Remove general/shared subjects - only show subjects specific to selected stage
    if (s.category === 'general') return false;
    
    return true;
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['grade-subjects', gradeId] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const subject = await createSubject(data);
      await assignSubjectToGrade(gradeId!, subject._id);
      return subject;
    },
    onSuccess: () => { invalidate(); setFormOpen(false); setForm(emptyForm); },
  });

  const assignMutation = useMutation({
    mutationFn: (subjectId: string) => assignSubjectToGrade(gradeId!, subjectId),
    onSuccess: () => { 
      invalidate(); 
      setAssignFormOpen(false); 
      setSelectedSubjectId(''); 
    },
  });

  const removeMutation = useMutation({
    mutationFn: (subjectId: string) => removeSubjectFromGrade(gradeId!, subjectId),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const openCreate = () => { setForm(emptyForm); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setForm(emptyForm); };

  const openAssign = () => { 
    setSelectedSubjectId(''); 
    setAssignFormOpen(true); 
  };
  const closeAssign = () => { 
    setAssignFormOpen(false); 
    setSelectedSubjectId(''); 
  };

  const handleCreate = () => {
    if (!form.nameAr.trim()) return; // Arabic name is required (marked with * in UI)
    createMutation.mutate(form);
  };

  const handleAssign = () => {
    if (!selectedSubjectId) return;
    assignMutation.mutate(selectedSubjectId);
  };

  const isPending = createMutation.isPending || assignMutation.isPending;

  return (
    <div className={spacing.pageContainer}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('/admin/subjects')}
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {t('stages')}
        </button>
        <span>/</span>
        <button
          onClick={() => navigate(`/admin/stages/${stageId}/grades`)}
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {stage ? getLocalizedName(stage, i18n.language) : '...'}
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">
          {grade ? getLocalizedName(grade, i18n.language) : '...'}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('subjects')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {grade ? getLocalizedName(grade, i18n.language) : ''} • {stage ? getLocalizedName(stage, i18n.language) : ''}
          </p>
          {/* Context helper - shows which stage this grade belongs to */}
          {stage && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <span>💡</span>
              <span>
                {i18n.language === 'ar' 
                  ? `المواد المعروضة تتناسب مع ${getLocalizedName(stage, i18n.language)}`
                  : `Subjects shown are relevant to ${getLocalizedName(stage, i18n.language)}`}
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={openAssign} variant="outline" className={buttonVariants.secondary}>
            <Plus className="w-4 h-4 mr-2" />
            {t('assignExisting')}
          </Button>
          <Button onClick={openCreate} className={buttonVariants.primary}>
            <Plus className="w-4 h-4 mr-2" />
            {t('createNew')}
          </Button>
        </div>
      </div>

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : gradeSubjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">{t('noSubjectsInGrade')}</p>
          <Button onClick={openCreate} className={buttonVariants.primary}>
            {t('createFirstSubject')}
          </Button>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <AnimatePresence>
            {gradeSubjects.map(subject => {
              const colorConfig = ENTITY_COLORS.find(c => c.value === subject.color) || ENTITY_COLORS[0];
              return (
                <motion.div
                  key={subject._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  <Card className={`${cardVariants.interactive} rounded-2xl overflow-hidden group cursor-pointer`}>
                    <div className={`h-3 w-full bg-gradient-to-r ${colorConfig.bg}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${colorConfig.bg} flex items-center justify-center text-2xl shadow-sm border ${colorConfig.border}`}>
                            {subject.icon || '📚'}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${colorConfig.text}`}>
                              {getLocalizedName(subject, i18n.language)}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('subject')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/admin/subjects/${subject._id}`, { 
                              state: { gradeId, stageId } 
                            })}
                            title={t('view')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            onClick={() => setDeleteId(subject._id)}
                            title={t('remove')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {getLocalizedName({ name: subject.description, nameAr: subject.descriptionAr }, i18n.language)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create New Subject Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('createNewSubject')}</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {i18n.language === 'ar' 
                ? 'إنشاء مادة جديدة وإضافتها للصف الحالي تلقائياً' 
                : 'Create a new subject and automatically add it to the current grade'}
            </p>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Educational Stage / Category */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                <span className="text-red-500">*</span>
                {i18n.language === 'ar' ? 'المرحلة التعليمية' : 'Educational Stage'}
              </Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="general">
                  {i18n.language === 'ar' ? '📌 عام - مشترك بين جميع المراحل' : '📌 General - Common across all stages'}
                </option>
                <option value="primary">
                  {i18n.language === 'ar' ? '🌱 المرحلة الابتدائية (الصف 1-6)' : '🌱 Primary Stage (Grades 1-6)'}
                </option>
                <option value="preparatory">
                  {i18n.language === 'ar' ? '📖 المرحلة الإعدادية (الصف 1-3)' : '📖 Preparatory Stage (Grades 1-3)'}
                </option>
                <option value="secondary-science">
                  {i18n.language === 'ar' ? '🔬 الثانوية - القسم العلمي' : '🔬 Secondary - Science Track'}
                </option>
                <option value="secondary-literary">
                  {i18n.language === 'ar' ? '📜 الثانوية - القسم الأدبي' : '📜 Secondary - Literary Track'}
                </option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {i18n.language === 'ar'
                  ? 'تحدد المرحلة التعليمية المناسبة لهذه المادة'
                  : 'Determines which educational stage this subject belongs to'}
              </p>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Subject Names (Bilingual) */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-red-500">*</span>
                  {t('nameAr')}
                </Label>
                <Input
                  id="nameAr"
                  dir="rtl"
                  value={form.nameAr}
                  onChange={(e) => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="مثال: الرياضيات، الفيزياء"
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{t('nameEn')}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mathematics, Physics"
                  className="text-base"
                />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Visual Identity */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium">{t('icon')}</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="📚"
                  maxLength={2}
                  className="text-center text-2xl h-12"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label className="text-sm font-medium">{t('color')}</Label>
                <div className="flex gap-2 flex-wrap items-center pt-1">
                  {ENTITY_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.value as SubjectColor }))}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.bg} transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : 'hover:scale-105'}`}
                      title={c.value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={closeForm}>{t('cancel')}</Button>
            <Button 
              onClick={handleCreate} 
              disabled={isPending || !form.nameAr.trim()}
              className={buttonVariants.primary}
            >
              {isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Existing Subject Dialog */}
      <Dialog open={assignFormOpen} onOpenChange={setAssignFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('assignExistingSubject')}</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {stage && (
                <span>
                  {i18n.language === 'ar' 
                    ? `المواد المتاحة لـ ${getLocalizedName(stage, i18n.language)}` 
                    : `Available subjects for ${getLocalizedName(stage, i18n.language)}`}
                </span>
              )}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Subject Selector (Stage auto-detected from context) */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                {t('selectSubject')} {/* المادة */}
              </Label>
              <select
                id="subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              >
                <option value="">
                  {isLoadingSubjects
                    ? (i18n.language === 'ar' ? '⏳ جارٍ التحميل...' : '⏳ Loading...')
                    : availableSubjects.length === 0
                    ? (i18n.language === 'ar' ? 'لا توجد مواد متاحة' : 'No subjects available')
                    : (i18n.language === 'ar' ? 'اختر مادة' : 'Select a subject')}
                </option>
                
                {!isLoadingSubjects && availableSubjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.icon} {getLocalizedName(s, i18n.language)}
                  </option>
                ))}
              </select>
              
              {/* Helper text */}
              {isLoadingSubjects && (
                <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <span className="animate-spin">⏳</span>
                  <span>{i18n.language === 'ar' ? 'جارٍ تحميل المواد...' : 'Loading subjects...'}</span>
                </p>
              )}
            </div>
            
            {/* Status messages */}
            {!isLoadingSubjects && (
              <div className={`text-sm p-3 rounded-md border ${
                availableSubjects.length === 0 
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              }`}>
                {availableSubjects.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>{t('allSubjectsAssigned')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>
                      {availableSubjects.length} {i18n.language === 'ar' ? 'مادة متاحة للربط' : 'subjects available for assignment'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeAssign}>{t('cancel')}</Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedSubjectId || isPending}
            >
              {t('assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title={t('removeSubjectConfirm')}
        description={t('removeSubjectConfirmDesc')}
        confirmLabel={t('remove')}
        onConfirm={() => { if (deleteId) removeMutation.mutate(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
