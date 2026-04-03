import { useTranslation } from 'react-i18next';

/**
 * Hook to detect Right-to-Left (RTL) language direction
 * Used in 15+ components for layout and text alignment
 * 
 * @returns {boolean} true if current language is Arabic (RTL), false otherwise
 * 
 * @example
 * const isRtl = useRTL();
 * <div className={isRtl ? 'text-right' : 'text-left'}>
 */
export function useRTL(): boolean {
  const { i18n } = useTranslation();
  return i18n.language === 'ar';
}
