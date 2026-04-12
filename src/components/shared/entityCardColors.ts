/**
 * Entity Card Color Configuration
 * 
 * Color palette for entity cards (stages, subjects, etc.)
 */

/**
 * Color configuration for entity cards
 */
export interface ColorConfig {
  /** Color value identifier (e.g., 'blue', 'emerald') */
  value: string;
  /** Background classes */
  bg: string;
  /** Text classes */
  text: string;
  /** Border classes */
  border: string;
}

/**
 * Default color configurations for common use cases
 */
export const ENTITY_COLORS: readonly ColorConfig[] = [
  { value: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { value: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { value: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { value: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { value: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  { value: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  { value: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
] as const;

/**
 * Helper function to get color configuration by value
 */
export function getEntityColor(color?: string): ColorConfig {
  if (!color) return ENTITY_COLORS[1]; // default to blue
  return ENTITY_COLORS.find((c) => c.value === color) ?? ENTITY_COLORS[1];
}
