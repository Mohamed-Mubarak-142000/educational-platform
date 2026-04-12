/**
 * RenderIfExists Component
 * 
 * A reusable wrapper that conditionally renders children or an empty state
 * based on whether a value exists (is truthy and not empty).
 * 
 * Usage:
 *   <RenderIfExists value={lesson.description} emptyMessage="No description">
 *     <p>{lesson.description}</p>
 *   </RenderIfExists>
 */

import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

interface RenderIfExistsProps {
  /** The value to check for existence */
  value: unknown;
  /** Content to render when value exists */
  children: ReactNode;
  /** Optional custom empty message */
  emptyMessage?: string;
  /** Optional custom empty icon */
  emptyIcon?: ReactNode;
  /** Optional className for empty state container */
  emptyClassName?: string;
  /** If true, shows nothing instead of EmptyState when value is missing */
  hideWhenEmpty?: boolean;
}

/**
 * Helper function to check if a value exists and is not empty
 */
function valueExists(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export function RenderIfExists({
  value,
  children,
  emptyMessage,
  emptyIcon,
  emptyClassName = 'py-8',
  hideWhenEmpty = false,
}: RenderIfExistsProps) {
  // Check if value exists and is not empty
  if (!valueExists(value)) {
    if (hideWhenEmpty) return null;
    return (
      <EmptyState
        description={emptyMessage}
        icon={emptyIcon}
        className={emptyClassName}
      />
    );
  }

  return <>{children}</>;
}
