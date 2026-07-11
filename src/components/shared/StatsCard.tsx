/**
 * StatsCard Component
 * 
 * Reusable metric/statistics display card
 * Used across dashboard and overview pages
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Courses"
 *   value={courses.length}
 *   icon={<BookOpen className="w-6 h-6" />}
 *   trend={+12.5}
 * />
 * ```
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cardVariants, textColors } from '@/lib/constants';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional trend percentage (positive or negative) */
  trend?: number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Additional CSS classes */
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'default',
  className = '',
}: StatsCardProps) {
  const variantColors = {
    default: 'text-slate-600 dark:text-slate-400',
    primary: 'text-violet-600 dark:text-violet-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const iconColor = variantColors[variant];

  return (
    <Card className={`${cardVariants.default} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className={textColors.secondary}>{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend !== undefined && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
            {subtitle && <p className={`text-sm ${textColors.tertiary}`}>{subtitle}</p>}
          </div>
          {icon && <div className={`${iconColor} opacity-80`}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
