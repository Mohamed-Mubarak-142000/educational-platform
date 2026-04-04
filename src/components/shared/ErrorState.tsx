import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  /** Custom icon — defaults to AlertTriangle */
  icon?: ReactNode;
  /** Main heading */
  title?: string;
  /** Short descriptive paragraph */
  description?: string;
  /** Callback for the retry button; omit to hide the button */
  onRetry?: () => void;
  /** Label for the retry button — defaults to t('retry') */
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  icon,
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const heading = title ?? t('errorStateTitle');
  const body = description ?? t('errorStateDescription');
  const btnLabel = retryLabel ?? t('retry');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 gap-4 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400">
        {icon ?? <AlertTriangle className="w-8 h-8" />}
      </div>
      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{heading}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 gap-2">
          {btnLabel}
        </Button>
      )}
    </div>
  );
}
