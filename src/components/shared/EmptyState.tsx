import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { InboxIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface EmptyStateProps {
  /** Custom icon — defaults to InboxIcon */
  icon?: ReactNode;
  /** Main heading */
  title?: string;
  /** Short descriptive paragraph */
  description?: string;
  /** Optional call-to-action button/link */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const { t } = useTranslation();
  const heading = title ?? t('emptyStateTitle');
  const body = description ?? t('emptyStateDescription');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 gap-4 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        {icon ?? <InboxIcon className="w-8 h-8" />}
      </div>
      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{heading}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
