import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'info',
  icon,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const iconStyles: Record<string, { bg: string; text: string; node: ReactNode }> = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      node: <Info className="w-7 h-7" />,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      node: <CheckCircle2 className="w-16 h-16" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      node: <AlertTriangle className="w-7 h-7" />,
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      node: <XCircle className="w-7 h-7" />,
    },
  };
  const toneKey = iconStyles[tone] ? tone : 'info';
  const toneConfig = iconStyles[toneKey];
  const confirmClassName =
    toneKey === 'success'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : toneKey === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : toneKey === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div className={`rounded-full p-3 ${toneConfig.bg} ${toneConfig.text}`}>
            {icon || toneConfig.node}
          </div>
          <DialogTitle className="mt-2 text-center">{title}</DialogTitle>
          {description && <DialogDescription className="text-center">{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
