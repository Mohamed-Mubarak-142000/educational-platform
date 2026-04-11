/**
 * Returns the localized name of a stage or subject.
 * Falls back to `name` (English) if `nameAr` is absent or the language is not Arabic.
 */
export function getLocalizedName(
  item: { name: string; nameAr?: string } | null | undefined,
  language: string
): string {
  if (!item) return '';
  return language === 'ar' && item.nameAr ? item.nameAr : item.name;
}
