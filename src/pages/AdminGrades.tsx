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
import { PageHeader } from '@/components/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

// ─────────────────────────────────────────────────────────────────

export default function AdminGrades() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { pushToast } = useToast();
  const { t } = useTranslation();

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

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`${t('grades')} — ${stage?.name ?? ''}`}
        subtitle={t('manageGradesSubtitle')}
        action={<Button onClick={openCreate}>{t('addGrade')}</Button>}
      />

      {isLoading ? (
        <p className="text-muted-foreground">{t('loadingGrades')}</p>
      ) : grades.length === 0 ? (
        <p className="text-muted-foreground">{t('noGradesYet')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((grade) => (
            <Card key={grade._id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{grade.name}</span>
                  <span className="text-muted-foreground text-sm font-normal">#{grade.order}</span>
                </CardTitle>
                {grade.nameAr && <p className="text-sm text-muted-foreground" dir="rtl">{grade.nameAr}</p>}
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/grades/${grade._id}/subjects`)}
                >
                  {t('subjects')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(grade)}>{t('edit')}</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(grade)}
                >
                  {t('delete')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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
