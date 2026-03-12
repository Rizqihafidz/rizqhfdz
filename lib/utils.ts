/**
 * Returns Tailwind class string for project type badges.
 *
 * @param type  - 'game' | 'web'
 * @param variant
 *   - 'overlay'  → white text on semi-transparent bg (used on card images)
 *   - 'inline'   → colored text on tinted bg (used in tables / lists)
 */
export function getTypeBadgeClass(
  type: string,
  variant: 'overlay' | 'inline' = 'inline',
): string {
  if (variant === 'overlay') {
    return type === 'game' ? 'bg-red-500/80' : 'bg-emerald-500/80'
  }
  return type === 'game'
    ? 'bg-red-500/10 text-red-500'
    : 'bg-emerald-500/10 text-emerald-500'
}

/** Human-readable label for a project type */
export function getTypeLabel(type: string): string {
  return type === 'game' ? 'Game Development' : 'Web Development'
}
