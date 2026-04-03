/**
 * PageHeader Component
 * 
 * Reusable page header with title, subtitle, and action button
 * Replaces repeated header patterns across 10+ pages
 * 
 * @example
 * ```tsx
 * <PageHeader 
 *   title={t('adminCourses')} 
 *   subtitle={t('adminCoursesSubtitle')}
 *   action={<Button onClick={openCreate}>{t('addCourse')}</Button>}
 * />
 * ```
 */

import React from 'react';
import { pageHeaderClasses } from '@/lib/constants';

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional action button or element (typically a Button) */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`${pageHeaderClasses.container} ${className}`}>
      <div className={pageHeaderClasses.textContainer}>
        <h1 className={pageHeaderClasses.title}>{title}</h1>
        {subtitle && <p className={pageHeaderClasses.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
