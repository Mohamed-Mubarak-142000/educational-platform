/**
 * FilterDialog Component
 *
 * Reusable "Filters" button + dialog shell for table pages. Each page passes
 * its own filter controls as children (subject/status selects, date ranges,
 * etc.) — only the trigger button, dialog chrome, and Apply/Reset actions
 * are shared.
 *
 * @example
 * ```tsx
 * <FilterDialog activeCount={selectedSubjectIds.length} onReset={() => setSelectedSubjectIds([])}>
 *   <SubjectMultiSelect ... />
 * </FilterDialog>
 * ```
 */
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface FilterDialogProps {
  /** Number of currently-active filters, shown as a badge on the trigger button */
  activeCount?: number;
  /** Dialog title; defaults to the translated "Filters" */
  title?: string;
  /** Called when the user clicks Reset — should clear this table's filter state */
  onReset: () => void;
  /** Filter controls specific to the table this dialog belongs to */
  children: ReactNode;
}

export function FilterDialog({ activeCount = 0, title, onReset, children }: FilterDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {t('filters')}
          {activeCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('filters')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">{children}</div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onReset}>
            {t('resetFilters')}
          </Button>
          <Button
            type="button"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => setOpen(false)}
          >
            {t('applyFilters')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
