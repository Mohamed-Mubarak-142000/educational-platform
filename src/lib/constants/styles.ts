/**
 * Design System - Styling Constants
 * 
 * Centralized styling patterns to eliminate 100+ occurrences of duplicated classes
 * All constants use Tailwind CSS utility classes for consistency
 */

/**
 * Card Variants
 * Used across 50+ components for consistent card styling
 */
export const cardVariants = {
  /** Default card style - most commonly used */
  default: 'border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70',
  
  /** Card with backdrop blur effect */
  blur: 'border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm',
  
  /** Card with shadow - for elevated elements */
  shadow: 'border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-xl',
  
  /** Card with shadow and blur - for auth pages */
  premium: 'border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-2xl rounded-3xl',
  
  /** Subtle card without border - for nested content */
  subtle: 'bg-slate-50 dark:bg-slate-900/50',
  
  /** Hoverable card - for interactive elements */
  interactive: 'border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 hover:shadow-lg transition-shadow cursor-pointer',
} as const;

/**
 * Button Variants
 * Primary, secondary, and utility button styles
 */
export const buttonVariants = {
  /** Primary action button - blue theme */
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  
  /** Primary with shadow - for CTAs */
  primaryShadow: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30',
  
  /** Primary with enhanced shadow - for hero sections */
  primaryHero: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40',
  
  /** Secondary action button */
  secondary: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-50',
  
  /** Danger/destructive action button */
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  
  /** Success action button */
  success: 'bg-green-600 hover:bg-green-700 text-white',
  
  /** Outline button */
  outline: 'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  
  /** Ghost button (transparent) */
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
} as const;

/**
 * Input/Form Variants
 * Consistent form field styling
 */
export const inputVariants = {
  /** Default input style */
  default: 'h-10 w-full rounded-md border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-100',
  
  /** Input with error state */
  error: 'h-10 w-full rounded-md border border-red-500 bg-white/80 px-3 text-sm text-slate-900 shadow-sm dark:bg-slate-900/60 dark:text-slate-100',
} as const;

/**
 * Badge/Tag Variants
 * Status badges and labels
 */
export const badgeVariants = {
  /** Info badge - blue */
  info: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm',
  
  /** Success badge - green */
  success: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold text-sm',
  
  /** Warning badge - yellow */
  warning: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-semibold text-sm',
  
  /** Danger badge - red */
  danger: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-sm',
  
  /** Neutral badge - gray */
  neutral: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm',
} as const;

/**
 * Background Gradient Patterns
 * Decorative backgrounds used across pages
 */
export const gradients = {
  /** Blue gradient blob - top right */
  blueTopRight: 'absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[700px] h-[700px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none',
  
  /** Indigo gradient blob - bottom left */
  indigoBottomLeft: 'absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[520px] h-[520px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none',
  
  /** Purple gradient blob */
  purpleCenter: 'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none',
} as const;

/**
 * Text Color Variants
 * Consistent text color patterns
 */
export const textColors = {
  /** Primary text color */
  primary: 'text-slate-900 dark:text-slate-50',
  
  /** Secondary/muted text color */
  secondary: 'text-slate-600 dark:text-slate-400',
  
  /** Tertiary/subtle text color */
  tertiary: 'text-slate-500 dark:text-slate-500',
  
  /** Muted text with higher contrast */
  muted: 'text-slate-600 dark:text-slate-300',
  
  /** Link text color */
  link: 'text-blue-600 dark:text-blue-400 hover:underline',
  
  /** Error text color */
  error: 'text-red-500 dark:text-red-400',
  
  /** Success text color */
  success: 'text-green-600 dark:text-green-400',
} as const;

/**
 * Table Variants
 * Consistent table styling
 */
export const tableVariants = {
  /** Table header */
  header: 'text-slate-500 dark:text-slate-400 font-medium',
  
  /** Table row */
  row: 'border-t border-slate-200/60 dark:border-slate-800',
  
  /** Table cell */
  cell: 'py-3',
  
  /** Table cell with bold text */
  cellBold: 'py-3 font-medium',
} as const;

/**
 * Layout Spacing
 * Consistent spacing patterns
 */
export const spacing = {
  /** Page container padding */
  pageContainer: 'px-6 py-10',
  
  /** Section spacing */
  section: 'py-20',
  
  /** Card padding */
  cardPadding: 'p-6',
  
  /** Form spacing */
  formSpacing: 'space-y-4',
} as const;

/**
 * Icon Containers
 * Consistent icon wrapper styles
 */
export const iconContainers = {
  /** Small icon container - blue theme */
  small: 'w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center',
  
  /** Medium icon container - blue theme */
  medium: 'w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30',
  
  /** Large icon container - blue theme */
  large: 'w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30',
} as const;

/**
 * Animation Classes
 * Common animation patterns
 */
export const animations = {
  /** Hover lift effect */
  hoverLift: 'hover:-translate-y-1 transition-all',
  
  /** Smooth transition */
  transition: 'transition-all duration-200',
  
  /** Fade in animation */
  fadeIn: 'animate-in fade-in duration-500',
} as const;

/**
 * Divider Variants
 */
export const dividers = {
  /** Horizontal divider */
  horizontal: 'border-t border-slate-200 dark:border-slate-800',
  
  /** Vertical divider */
  vertical: 'border-l border-slate-200 dark:border-slate-800',
} as const;

/**
 * Status Colors
 * For status indicators and badges
 */
export const statusColors = {
  active: 'text-green-600 dark:text-green-400',
  inactive: 'text-slate-500 dark:text-slate-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
} as const;

/**
 * Helper function to combine multiple style variants
 * @param styles - Array of style strings to combine
 * @returns Combined className string
 */
export function cn(...styles: (string | undefined | null | false)[]): string {
  return styles.filter(Boolean).join(' ');
}
