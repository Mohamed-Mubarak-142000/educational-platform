/**
 * AdminGrades.tsx
 *
 * Admin page for managing grades within a stage.
 * Route: /admin/stages/:stageId/grades
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  type Grade,
  type GradeInput,
} from '@/api/gradeApi';
import { getStageById } from '@/api/subjectApi';
import { EmptyState, PageHeader } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, ChevronRight, GraduationCap } from 'lucide-react';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

// Grade color palette (matching stage design system)
const GRADE_COLORS = [
  { value: 'blue', bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'emerald', bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'violet', bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { value: 'cyan', bg: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
] as const;

function getGradeColor(index: number) {
  return GRADE_COLORS[index % GRADE_COLORS.length];
}

export default function AdminGrades() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { pushToast } = useToast();
  const { t, i18n } = useTranslation();

  // Error message extractor with localized fallback
  type AxiosLikeError = { response?: { data?: { message?: string } }; message?: string };
  const errMsg = (e: unknown) => {
    const ae = e as AxiosLikeError;
    return ae.response?.data?.message ?? ae.message ?? t('unknownError');
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [form, setForm] = useState<GradeInput>({ stageId: stageId!, name: '', nameAr: '', order: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);

  const { data: stage } = useQuery({
    queryKey: ['stage', stageId],
    queryFn: () => getStageById(stageId!),
    enabled: !!stageId,
  });

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades', stageId],
    queryFn: () => getGrades(stageId),
    enabled: !!stageId,
  });

  const createMut = useMutation({
    mutationFn: createGrade,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grades', stageId] }); closeModal(); pushToast({ type: 'success', title: t('toastGradeCreated') }); },
    onError: (e: unknown) => pushToast({ type: 'error', title: t('error'), description: errMsg(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GradeInput> }) => updateGrade(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grades', stageId] }); closeModal(); pushToast({ type: 'success', title: t('toastGradeUpdated') }); },
    onError: (e: unknown) => pushToast({ type: 'error', title: t('error'), description: errMsg(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteGrade(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grades', stageId] }); setDeleteTarget(null); pushToast({ type: 'success', title: t('toastGradeDeleted') }); },
    onError: (e: unknown) => pushToast({ type: 'error', title: t('error'), description: errMsg(e) }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ stageId: stageId!, name: '', nameAr: '', order: (grades.length + 1) * 10 });
    setOpen(true);
  }

  function openEdit(grade: Grade) {
    setEditing(grade);
    setForm({ stageId: stageId!, name: grade.name, nameAr: grade.nameAr, order: grade.order });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditing(null); }

  function handleSubmit() {
    if (!form.name) { pushToast({ type: 'error', title: t('toastNameRequired') }); return; }
    if (editing) {
      updateMut.mutate({ id: editing._id, data: form });
    } else {
      createMut.mutate(form);
    }
  }

  const sortedGrades = grades.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={`${t('grades')} — ${stage ? getLocalizedName(stage, i18n.language) : ''}`}
        subtitle={t('manageGradesSubtitle')}
        action={
          <Button onClick={openCreate} className={buttonVariants.primary}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addGrade')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : sortedGrades.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState
              description={t('noGradesYet')}
              action={(
                <Button onClick={openCreate} className={buttonVariants.primary}>
                  <Plus className="w-4 h-4 mr-2" /> {t('addGrade')}
                </Button>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <AnimatePresence>
            {sortedGrades.map((grade, index) => {
              const colors = getGradeColor(index);
              return (
                <motion.div
                  key={grade._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  <Card
                    className={`${cardVariants.interactive} rounded-2xl overflow-hidden group cursor-pointer`}
                    onClick={() => navigate(`/admin/stages/${stageId}/grades/${grade._id}/subjects`)}
                  >
                    {/* Gradient header */}
                    <div className={`h-3 w-full bg-gradient-to-r ${colors.bg}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center text-2xl shadow-sm border ${colors.border} flex-shrink-0`}>
                            <GraduationCap className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-bold text-lg truncate ${colors.text}`} title={getLocalizedName(grade, i18n.language)}>
                              {getLocalizedName(grade, i18n.language)}
                            </h3>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {t('gradeLabel')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); openEdit(grade); }}
                            title={t('edit')}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(grade); }}
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {grade.nameAr && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3" dir="rtl">
                          {grade.nameAr}
                        </p>
                      )}
                      <div className={`flex items-center justify-between pt-3 border-t ${colors.border}`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {t('displayOrder')}: {grade.order}
                        </span>
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${colors.text} group-hover:gap-2.5 transition-all`}>
                          {t('viewSubjects')}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('editGrade') : t('newGrade')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">{t('nameEn')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("gradePlaceholderEn")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nameAr">{t('nameAr')}</Label>
              <Input
                id="nameAr"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                placeholder={t("gradePlaceholderAr")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order">{t('displayOrder')}</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>{t('cancel')}</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? t('save') : t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('deleteGradeConfirmTitle', { name: deleteTarget?.name })}
        description={t('deleteGradeConfirmDesc')}
        confirmLabel={t('delete')}
        onConfirm={async () => { if (deleteTarget) deleteMut.mutate(deleteTarget._id); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
