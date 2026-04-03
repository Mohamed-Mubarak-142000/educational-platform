/**
 * Theme Configuration
 * 
 * Semantic color tokens and theme-specific configurations
 */

/**
 * Semantic Color Tokens
 * Brand-specific color naming for consistency
 */
export const colors = {
  // Primary brand color
  primary: {
    DEFAULT: 'blue-600',
    hover: 'blue-700',
    light: 'blue-100',
    dark: 'blue-900',
  },
  
  // Secondary colors
  secondary: {
    DEFAULT: 'slate-600',
    hover: 'slate-700',
    light: 'slate-100',
    dark: 'slate-900',
  },
  
  // Semantic colors
  success: {
    DEFAULT: 'green-600',
    hover: 'green-700',
    light: 'green-100',
    dark: 'green-900',
  },
  
  warning: {
    DEFAULT: 'yellow-600',
    hover: 'yellow-700',
    light: 'yellow-100',
    dark: 'yellow-900',
  },
  
  danger: {
    DEFAULT: 'red-600',
    hover: 'red-700',
    light: 'red-100',
    dark: 'red-900',
  },
  
  info: {
    DEFAULT: 'blue-600',
    hover: 'blue-700',
    light: 'blue-100',
    dark: 'blue-900',
  },
} as const;

/**
 * Border Radius Tokens
 */
export const radius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '1.75rem',
  full: '9999px',
} as const;

/**
 * Shadow Tokens
 */
export const shadows = {
  sm: 'shadow-sm',
  DEFAULT: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
} as const;

/**
 * Z-Index Layers
 * Consistent stacking order
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Breakpoint Tokens
 * For responsive design consistency
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
