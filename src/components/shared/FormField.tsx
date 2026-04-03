/**
 * FormField Component
 * 
 * Reusable form field with label and error handling
 * Provides consistent form field styling across the application
 * 
 * @example
 * ```tsx
 * <FormField
 *   label={t('email')}
 *   error={errors.email?.message}
 * >
 *   <Input {...register('email')} type="email" />
 * </FormField>
 * ```
 */

import React from 'react';
import { formClasses, textColors } from '@/lib/constants';

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Child input element */
  children: React.ReactNode;
  /** Mark field as required */
  required?: boolean;
  /** Additional help text */
  helpText?: string;
  /** Additional CSS classes */
  className?: string;
}

export function FormField({
  label,
  error,
  children,
  required = false,
  helpText,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`${formClasses.field} ${className}`}>
      {label && (
        <label className={formClasses.label}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className={formClasses.error}>{error}</p>}
      {helpText && !error && (
        <p className={`text-sm ${textColors.tertiary}`}>{helpText}</p>
      )}
    </div>
  );
}
