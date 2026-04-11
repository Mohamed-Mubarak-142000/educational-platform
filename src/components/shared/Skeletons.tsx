import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cardVariants } from '@/lib/constants';

export interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-100 dark:bg-slate-800', className)}
    />
  );
}

export interface SkeletonTableProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({
  columns,
  rows = 6,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  const widths = ['w-16', 'w-24', 'w-28', 'w-20', 'w-32', 'w-12'];

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800',
        className,
      )}
    >
      <table className="w-full text-sm">
        {showHeader && (
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={`header-${index}`} className="px-4 py-3">
                  <SkeletonBlock className={cn('h-3', widths[index % widths.length])} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className="border-t border-slate-200/60 dark:border-slate-800"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={`cell-${rowIndex}-${colIndex}`} className="px-4 py-3">
                  <SkeletonBlock className={cn('h-4', widths[colIndex % widths.length])} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface SkeletonCardGridProps {
  items?: number;
  variant?: 'grid' | 'list';
  className?: string;
}

export function SkeletonCardGrid({
  items = 3,
  variant = 'grid',
  className,
}: SkeletonCardGridProps) {
  const wrapperClass =
    variant === 'list'
      ? 'space-y-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';

  return (
    <div className={cn(wrapperClass, className)}>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={`card-${index}`} className={`${cardVariants.default} overflow-hidden`}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <SkeletonBlock className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <SkeletonBlock className="h-3 w-32" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-3 w-48" />
                <div className="flex gap-2">
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface SkeletonStatsGridProps {
  items?: number;
  className?: string;
}

export function SkeletonStatsGrid({ items = 3, className }: SkeletonStatsGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
        className,
      )}
    >
      {Array.from({ length: items }).map((_, index) => (
        <Card key={`stat-${index}`} className={cardVariants.default}>
          <CardContent className="p-6 space-y-3">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface SkeletonDetailSectionProps {
  lines?: number;
  className?: string;
}

export function SkeletonDetailSection({ lines = 4, className }: SkeletonDetailSectionProps) {
  return (
    <Card className={`${cardVariants.default} ${className ?? ''}`.trim()}>
      <CardHeader className="border-b border-slate-200 dark:border-slate-800">
        <SkeletonBlock className="h-4 w-40" />
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock key={`line-${index}`} className="h-3 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
