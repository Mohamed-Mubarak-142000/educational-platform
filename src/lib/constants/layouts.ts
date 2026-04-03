/**
 * Page Layout Utilities
 * 
 * Reusable layout patterns for consistent page structure
 */

import { spacing, textColors } from './styles';

/**
 * Page Header Layout Pattern
 * Used across all admin and dashboard pages
 * 
 * @example
 * ```tsx
 * <PageHeader 
 *   title="Courses" 
 *   subtitle="Manage all courses"
 *   action={<Button>Add Course</Button>}
 * />
 * ```
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const pageHeaderClasses = {
  container: 'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6',
  textContainer: 'space-y-1',
  title: 'text-3xl font-bold',
  subtitle: textColors.secondary,
} as const;

/**
 * Auth Page Layout Pattern
 * Used across all authentication pages
 */
export const authPageClasses = {
  container: 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col',
  section: 'pt-32 pb-20 relative overflow-hidden',
  grid: 'max-w-6xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
  heroText: 'text-4xl md:text-5xl font-extrabold tracking-tight',
} as const;

/**
 * Dashboard Layout Pattern
 */
export const dashboardClasses = {
  container: spacing.pageContainer,
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  statsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
} as const;

/**
 * Form Layout Pattern
 */
export const formClasses = {
  container: 'space-y-4',
  field: 'space-y-2',
  label: 'text-sm font-medium',
  error: 'text-red-500 text-sm mt-1',
  actions: 'flex gap-3 justify-end pt-4',
} as const;
