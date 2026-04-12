import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cardVariants } from '@/lib/constants';
import type { ReactNode } from 'react';
import type { ColorConfig } from './entityCardColors';

/**
 * EntityCard Props
 */
export interface EntityCardProps {
  /** Icon emoji or JSX element */
  icon: string | ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Color configuration */
  color?: ColorConfig;
  /** Footer content (optional) */
  footer?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Action buttons that appear on hover (optional) */
  actions?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Animation delay for stagger effects (in seconds) */
  animationDelay?: number;
}

/**
 * EntityCard Component
 * 
 * A standardized card design used across admin and public pages.
 * Features:
 * - Color-coded top stripe
 * - Icon with themed background
 * - Title and description
 * - Optional footer with border
 * - Hover effects and animations
 * - Action buttons that appear on hover
 * 
 * @example
 * ```tsx
 * <EntityCard
 *   icon="🎓"
 *   title="Biology"
 *   description="Learn about living organisms"
 *   color={{
 *     value: 'blue',
 *     bg: 'bg-blue-100 dark:bg-blue-900/30',
 *     text: 'text-blue-700 dark:text-blue-300',
 *     border: 'border-blue-200 dark:border-blue-800'
 *   }}
 *   onClick={() => navigate('/subjects/123')}
 *   footer={<span>View Details</span>}
 * />
 * ```
 */
export function EntityCard({
  icon,
  title,
  description,
  color,
  footer,
  onClick,
  actions,
  className = '',
  animationDelay = 0,
}: EntityCardProps) {
  // Default color if none provided
  const defaultColor: ColorConfig = {
    value: 'blue',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  };

  const colors = color || defaultColor;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, delay: animationDelay }}
      layout
      className={className}
    >
      <Card
        className={`${cardVariants.interactive} rounded-2xl overflow-hidden group`}
        onClick={onClick}
      >
        {/* Color stripe at top */}
        <div className={`h-1.5 w-full ${colors.bg.replace('/30', '')}`} />
        
        <CardContent className="p-5">
          {/* Header: Icon + Actions */}
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center text-xl shadow-sm border ${colors.border}`}>
              {icon}
            </div>
            
            {actions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {actions}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-bold text-base mb-1 ${colors.text}`}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Footer with border */}
          {footer && (
            <div className={`flex items-center justify-between pt-2 border-t ${colors.border}`}>
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
