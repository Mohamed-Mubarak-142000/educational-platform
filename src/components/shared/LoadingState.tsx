import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
  /** Display message override — defaults to t('loading') */
  message?: string;
  /** 'fullpage' fills the whole container; 'section' is a compact inline block */
  variant?: 'fullpage' | 'section';
  className?: string;
}

export function LoadingState({ message, variant = 'section', className }: LoadingStateProps) {
  const { t } = useTranslation();
  const text = message ?? t('loading');

  if (variant === 'fullpage') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[50vh] gap-4 text-slate-500 dark:text-slate-400',
          className,
        )}
      >
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-sm font-medium">{text}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
