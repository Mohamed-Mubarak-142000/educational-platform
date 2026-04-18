import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AccessRestrictedProps {
  /** Override the title key (default: 'accessRestrictedTitle') */
  titleKey?: string;
  /** Override the description key (default: 'accessRestrictedDescription') */
  descriptionKey?: string;
  /** Additional CSS classes applied to the root element */
  className?: string;
}

/**
 * AccessRestricted
 *
 * Full-screen replacement rendered when the authenticated user lacks write
 * permissions for a page they can technically navigate to.
 *
 * Usage:
 *   if (!canEdit) return <AccessRestricted />;
 */
export function AccessRestricted({
  titleKey = 'accessRestrictedTitle',
  descriptionKey = 'accessRestrictedDescription',
  className,
}: AccessRestrictedProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      {/* Icon */}
      <div className="w-28 h-28 rounded-3xl bg-amber-100 dark:bg-amber-900/25 flex items-center justify-center mb-8 shadow-sm">
        <ShieldAlert className="w-14 h-14 text-amber-500 dark:text-amber-400" />
      </div>

      {/* Text */}
      <div className="max-w-sm space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {t(titleKey)}
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>

      {/* Action */}
      <div className="mt-10">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('goBack')}
        </Button>
      </div>
    </div>
  );
}
