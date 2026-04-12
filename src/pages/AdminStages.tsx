import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStages, createStage, updateStage, deleteStage, getSubjectsByStage, type Stage, type StageInput, type Subject } from '@/api/subjectApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { EmptyState, PageHeader } from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, ChevronRight, BookOpen } from 'lucide-react';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

const STAGE_COLORS = [
  { value: 'emerald', bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'blue', bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'violet', bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
] as const;

type StageColor = typeof STAGE_COLORS[number]['value'];

type StageForm = {
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  color: StageColor;
};

function getStageColor(color: string) {
  return STAGE_COLORS.find((c) => c.value === color) ?? STAGE_COLORS[1];
}

const emptyForm: StageForm = { name: '', nameAr: '', description: '', icon: '📚', color: 'blue' };

function StageSubjectCount({ stageId }: { stageId: string }) {
  const { t } = useTranslation();
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId),
  });
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
      <BookOpen className="w-3.5 h-3.5" />
      {subjects.length} {t(subjects.length === 1 ? 'subjectSingular' : 'subjectPlural')}
    </span>
  );
}

export default function AdminStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: stages = [], isLoading } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stages'] });

  const createMutation = useMutation({
    mutationFn: (data: StageForm) => createStage(data as StageInput),
    onSuccess: () => { invalidate(); setFormOpen(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StageForm }) => updateStage(id, data as StageInput),
    onSuccess: () => { invalidate(); setFormOpen(false); setEditId(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStage(id),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (stage: Stage) => {
    setEditId(stage._id);
    setForm({
      name: stage.name,
      nameAr: stage.nameAr ?? '',
      description: stage.description ?? '',
      icon: stage.icon ?? '📚',
      color: (stage.color as StageColor) ?? 'blue',
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
      <PageHeader
        title={t('educationStages')}
        subtitle={t('manageStagesSubtitle')}
        action={
          <Button onClick={openCreate} className={buttonVariants.primary}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addStage')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState
              description={t('noStagesYet')}
              action={(
                <Button onClick={openCreate} className={buttonVariants.primary}>
                  <Plus className="w-4 h-4 mr-2" /> {t('addStage')}
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
            {stages.map((stage: Stage) => {
              const colors = getStageColor(stage.color ?? 'blue');
              return (
                <motion.div
                  key={stage._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  <Card
                    className={`${cardVariants.interactive} rounded-2xl overflow-hidden group cursor-pointer`}
                    onClick={() => navigate(`/admin/stages/${stage._id}/grades`)}
                  >
                    {/* Gradient header */}
                    <div className={`h-3 w-full bg-gradient-to-r ${colors.bg}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center text-2xl shadow-sm border ${colors.border}`}>
                            {stage.icon}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${colors.text}`}>{getLocalizedName(stage, i18n.language)}</h3>
                            <StageSubjectCount stageId={stage._id} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); openEdit(stage); }}
                            title={t('edit')}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(stage._id); }}
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{stage.description || ''}</p>
                      <div className={`flex items-center justify-between pt-3 border-t ${colors.border}`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {t('stageOrder', { n: stage.order ?? 0 })}
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

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editId ? t('editStage') : t('addNewStage')}</DialogTitle>
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
                <Label className="text-xs text-slate-500 mb-1 block">{t('stageName')}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t('stageNamePlaceholder')}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('stageNameAr')}</Label>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                placeholder={t('stageNameArPlaceholder')}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('description')}</Label>
              <Textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t('stageDescPlaceholder')}
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">{t('color')}</Label>
              <div className="flex flex-wrap gap-2">
                {STAGE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.bg} border-2 transition-all ${form.color === c.value ? 'border-slate-700 dark:border-slate-200 scale-110 shadow-md' : 'border-transparent opacity-60'}`}
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
              {isPending ? t('saving') : editId ? t('saveChanges') : t('createStage')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteStage')}
        description={t('deleteStageDesc')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={async () => { if (deleteId) await deleteMutation.mutateAsync(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
