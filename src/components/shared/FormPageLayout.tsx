/**
 * FormPageLayout Component
 * 
 * Reusable layout for form pages (Create/Edit)
 * Provides consistent structure with back navigation, title, and form container
 * 
 * @example
 * ```tsx
 * <FormPageLayout
 *   title={isEditMode ? 'Edit Course' : 'Create Course'}
 *   backTo="/admin/courses"
 * >
 *   <form>...</form>
 * </FormPageLayout>
 * ```
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { cardVariants, spacing } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

export interface FormPageLayoutProps {
  /** Page title (e.g., 'Create Course', 'Edit Exam') */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Path to navigate back to */
  backTo: string;
  /** Form content */
  children: React.ReactNode;
  /** Optional custom back button label */
  backLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

export function FormPageLayout({
  title,
  subtitle,
  backTo,
  children,
  backLabel,
  className = '',
}: FormPageLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedBackLabel = backLabel ?? t('back');

  return (
    <div className={`${spacing.pageContainer} ${className}`}>
      {/* Back Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {resolvedBackLabel}
        </Button>
      </div>

      {/* Form Card */}
      <Card className={`${cardVariants.default} w-full`}>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {subtitle}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
