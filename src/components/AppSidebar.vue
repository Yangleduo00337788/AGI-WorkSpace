<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ChevronRight, FileText, LayoutGrid, Pencil, Plus } from 'lucide-vue-next'
import { catalog } from '@/lib/content'
import { canCreateIn, canEditSlug, createWorkspaceDoc } from '@/lib/doc-manage'
import { pendingEditSlug } from '@/lib/doc-session'
import NavTree from '@/components/NavTree.vue'
import DocCreateDialog from '@/components/DocCreateDialog.vue'
import { useI18n } from '@/composables/useI18n'
import { useRoles } from '@/composables/useRoles'
import { SPACE_NAV_ITEMS, activeSpaceItem, isSpacePath } from '@/lib/space-nav'
import { cn } from '@/lib/utils'

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { selected, ownedSlugs } = useRoles()
const spaceOpen = ref(false)
const onSpace = computed(() => isSpacePath(route.path))
const activeId = computed(() => activeSpaceItem(route.path))
const creatingParent = ref('')
const createOpen = computed({
  get: () => creatingParent.value !== '',
  set: (value) => {
    if (!value) creatingParent.value = ''
  },
})
const actionMessage = ref('')
const anyRole = computed(() => selected.value.length > 0)

watch(
  onSpace,
  (value) => {
    if (value) spaceOpen.value = true
  },
  { immediate: true },
)

function toggleSpace() {
  spaceOpen.value = !spaceOpen.value
}

function onSpaceTitleClick(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    spaceOpen.value = true
    emit('navigate')
    return
  }
  if (spaceOpen.value && onSpace.value) {
    event.preventDefault()
    spaceOpen.value = false
    return
  }
  spaceOpen.value = true
  emit('navigate')
}

function spaceSlug(to: string) {
  return to.replace(/^\/+/, '')
}

function canEditSpace(to: string) {
  if (to === '/settings') return false
  return canEditSlug(spaceSlug(to), selected.value, ownedSlugs.value)
}

function canCreateSpace(to: string) {
  if (to === '/settings') return false
  return canCreateIn(spaceSlug(to), selected.value, ownedSlugs.value)
}

function openCreate(parentSlug: string) {
  actionMessage.value = ''
  creatingParent.value = parentSlug
}

function openEdit(slug: string) {
  pendingEditSlug.value = slug
  void router.push(slug ? `/${slug}` : '/')
  emit('navigate')
}

async function onCreate(payload: {
  title: string
  description: string
  relPath: string
  slug: string
  order: number
}) {
  actionMessage.value = ''
  try {
    await createWorkspaceDoc(payload)
    creatingParent.value = ''
    await router.push(payload.slug ? `/${payload.slug}` : '/')
    emit('navigate')
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'NEED_WORKSPACE') actionMessage.value = t.value('needWorkspace')
    else if (code === 'EXISTS') actionMessage.value = t.value('docExists')
    else actionMessage.value = t.value('settingsFail')
  }
}
</script>

<template>
  <aside class="flex h-full flex-col">
    <div class="px-6 pb-3 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {{ title }}
    </div>
    <nav class="flex-1 overflow-y-auto px-6 pr-8 pb-8 scrollbar-thin">
      <NavTree
        :nodes="catalog.docsNavTree"
        @navigate="emit('navigate')"
        @create="openCreate"
        @edit="openEdit"
      />
      <div class="mt-0.5 flex flex-col">
        <div
          class="flex items-center rounded-md transition-colors hover:bg-sidebar-accent/70"
          :class="onSpace ? 'font-medium' : ''"
        >
          <button
            type="button"
            class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
            :aria-expanded="spaceOpen"
            :aria-label="t('settingsNav')"
            @click.stop="toggleSpace"
          >
            <ChevronRight
              class="size-3.5 transition-transform duration-200"
              :class="spaceOpen ? 'rotate-90' : ''"
            />
          </button>
          <RouterLink
            to="/settings"
            :class="
              cn(
                'flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-[13px] leading-5',
                onSpace
                  ? 'text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground',
              )
            "
            @click="onSpaceTitleClick($event)"
          >
            <LayoutGrid class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="truncate">{{ t('settingsNav') }}</span>
          </RouterLink>
        </div>
        <div
          class="grid transition-[grid-template-rows] duration-200 ease-out"
          :class="spaceOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div class="mt-0.5 ml-3.5 border-l border-sidebar-border/80">
              <ul class="flex flex-col gap-0.5" style="padding-left: 0.7rem">
                <li v-for="item in SPACE_NAV_ITEMS" :key="item.id">
                  <div
                    class="group/nav ml-7 flex items-center rounded-md transition-colors"
                    :class="
                      activeId === item.id
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/70'
                    "
                  >
                    <RouterLink
                      :to="item.to"
                      :class="
                        cn(
                          'flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-[13px] leading-5',
                          activeId === item.id
                            ? 'text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/75 hover:text-sidebar-accent-foreground',
                        )
                      "
                      @click="emit('navigate')"
                    >
                      <FileText class="size-3.5 shrink-0 text-muted-foreground" />
                      <span class="truncate">{{ t(item.labelKey) }}</span>
                    </RouterLink>
                    <div
                      v-if="anyRole && (canEditSpace(item.to) || canCreateSpace(item.to))"
                      class="flex shrink-0 pr-0.5 opacity-0 transition-opacity group-hover/nav:opacity-100 group-focus-within/nav:opacity-100"
                      :class="activeId === item.id ? 'opacity-100' : ''"
                    >
                      <button
                        v-if="canEditSpace(item.to)"
                        type="button"
                        class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
                        :title="t('editDoc')"
                        :aria-label="t('editDoc')"
                        @click.stop="openEdit(spaceSlug(item.to))"
                      >
                        <Pencil class="size-3.5" />
                      </button>
                      <button
                        v-if="canCreateSpace(item.to)"
                        type="button"
                        class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
                        :title="t('newDoc')"
                        :aria-label="t('newDoc')"
                        @click.stop="openCreate(spaceSlug(item.to))"
                      >
                        <Plus class="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p v-if="actionMessage" class="mt-3 px-2 text-xs text-muted-foreground">{{ actionMessage }}</p>
    </nav>
    <DocCreateDialog v-model:open="createOpen" :parent-slug="creatingParent" @create="onCreate" />
  </aside>
</template>
