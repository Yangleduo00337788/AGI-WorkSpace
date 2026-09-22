import { computed, ref } from 'vue'
import { ROLES, slugsForRoles, type RoleId } from '@/lib/roles'

const STORAGE_KEY = 'agi-roles'

function readRoles(): RoleId[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown
    if (!Array.isArray(raw)) return []
    const allowed = new Set(ROLES.map((role) => role.id))
    return raw.filter((id): id is RoleId => typeof id === 'string' && allowed.has(id as RoleId))
  } catch {
    return []
  }
}

const selected = ref<RoleId[]>(readRoles())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selected.value))
}

export function useRoles() {
  const ownedSlugs = computed(() => slugsForRoles(selected.value))

  function toggle(id: RoleId) {
    if (selected.value.includes(id)) {
      selected.value = selected.value.filter((item) => item !== id)
    } else {
      selected.value = [...selected.value, id]
    }
    persist()
  }

  return { selected, ownedSlugs, toggle }
}
