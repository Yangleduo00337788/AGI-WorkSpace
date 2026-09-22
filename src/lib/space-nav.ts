import type { MessageKey } from '@/i18n/messages'

export const SPACE_NAV_ITEMS = [
  { id: 'roles', labelKey: 'settingsNavRoles' },
  { id: 'folder', labelKey: 'settingsNavFolder' },
  { id: 'remote', labelKey: 'settingsNavRemote' },
  { id: 'copy', labelKey: 'settingsNavCopy' },
] as const satisfies readonly { id: string; labelKey: MessageKey }[]

export type SpaceNavId = (typeof SPACE_NAV_ITEMS)[number]['id']

export function spaceHash(routeHash: string): SpaceNavId {
  const value = routeHash.replace(/^#/, '')
  if (SPACE_NAV_ITEMS.some((item) => item.id === value)) return value as SpaceNavId
  return 'roles'
}
