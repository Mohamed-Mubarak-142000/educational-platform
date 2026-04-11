import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStageById, getSubjectsByStage, createSubject, updateSubject, deleteSubject, type Subject } from '@/api/subjectApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, Eye, ArrowLeft } from 'lucide-react';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

const SUBJECT_COLORS = [
  { value: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { value: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
] as const;

type SubjectColor = typeof SUBJECT_COLORS[number]['value'];

function getColorClasses(color: string) {
  return SUBJECT_COLORS.find((c) => c.value === color) ?? SUBJECT_COLORS[1];
}

const emptyForm = { name: '', nameAr: '', description: '', icon: '📚', color: 'blue' as SubjectColor };

export default function AdminSubjects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stageId } = useParams<{ stageId: string }>();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: stage } = useQuery({
    queryKey: ['stage', stageId],
    queryFn: () => getStageById(stageId!),
    enabled: !!stageId,
  });

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId!),
    enabled: !!stageId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subjects-by-stage', stageId] });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => createSubject({ ...data, stageId }),
    onSuccess: () => { invalidate(); setFormOpen(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyForm }) => updateSubject(id, data),
    onSuccess: () => { invalidate(); setFormOpen(false); setEditId(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (subject: Subject) => {
    setEditId(subject._id);
    setForm({
      name: subject.name,
      nameAr: subject.nameAr ?? '',
      description: subject.description ?? '',
      icon: subject.icon ?? '📚',
      color: (subject.color as SubjectColor) ?? 'blue',
    });
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditId(null); setForm(emptyForm); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={spacing.pageContainer}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('/admin/subjects')}
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('stagesLabel')}
        </button>
        {stage && (
          <>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="flex items-center gap-1.5">
              <span>{stage.icon}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{getLocalizedName(stage, i18n.language)}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stage ? `${getLocalizedName(stage, i18n.language)} — ${t('subjectPlural')}` : t('subjectPlural')}
          </h1>
          {stage && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stage.description}</p>}
        </div>
        <Button onClick={openCreate} className={buttonVariants.primary}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addSubject')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState
              description={t('noSubjectsInStage')}
              action={(
                <Button onClick={openCreate} className={buttonVariants.primary}>
                  <Plus className="w-4 h-4 mr-2" /> {t('addSubject')}
                </Button>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <AnimatePresence>
            {subjects.map((subject: Subject) => {
              const colors = getColorClasses(subject.color ?? 'blue');
              return (
                <motion.div
                  key={subject._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  layout
                >
                  <Card
                    className={`${cardVariants.interactive} rounded-2xl overflow-hidden group`}
                    onClick={() => navigate(`/admin/subjects/${subject._id}`)}
                  >
                    <div className={`h-1.5 w-full ${colors.bg.replace('/30', '')}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center text-xl shadow-sm border ${colors.border}`}>
                          {subject.icon}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); openEdit(subject); }}
                            title={t('edit')}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(subject._id); }}
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <h3 className={`font-bold text-base mb-1 ${colors.text}`}>{getLocalizedName(subject, i18n.language)}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{subject.description}</p>
                      <div className={`flex items-center justify-between pt-2 border-t ${colors.border}`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {typeof subject.teacherId === 'object' ? subject.teacherId?.name : '—'}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${colors.text}`}>
                          <Eye className="w-3 h-3" /> {t('view')}
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editId ? t('editSubject') : t('addNewSubject')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <Label className="text-xs text-slate-500 mb-1 block">{t('icon')}</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="text-center text-xl"
                  maxLength={2}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs text-slate-500 mb-1 block">{t('subjectName')}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t('subjectNamePlaceholder')}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('subjectNameAr')}</Label>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                placeholder={t('subjectNameArPlaceholder')}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('description')}</Label>
              <Textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t('subjectDescPlaceholder')}
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">{t('color')}</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${form.color === c.value ? 'border-slate-700 dark:border-slate-200 scale-110' : 'border-transparent'}`}
                    title={c.value}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeForm}>{t('cancel')}</Button>
            <Button
              className={buttonVariants.primary}
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim()}
            >
              {isPending ? t('saving') : editId ? t('saveChanges') : t('createSubject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteSubject')}
        description={t('deleteSubjectDesc')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
