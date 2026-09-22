<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronRight, FileText, LayoutGrid } from 'lucide-vue-next'
import { docsNavTree } from '@/lib/content'
import NavTree from '@/components/NavTree.vue'
import { useI18n } from '@/composables/useI18n'
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
const spaceOpen = ref(false)
const onSpace = computed(() => isSpacePath(route.path))
const activeId = computed(() => activeSpaceItem(route.path))

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
</script>

<template>
  <aside class="flex h-full flex-col">
    <div class="px-6 pb-3 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {{ title }}
    </div>
    <nav class="flex-1 overflow-y-auto px-6 pr-8 pb-8 scrollbar-thin">
      <NavTree :nodes="docsNavTree" @navigate="emit('navigate')" />
      <div class="mt-0.5 flex flex-col">
        <div class="flex items-center">
          <button
            type="button"
            class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] leading-5 transition-colors',
                onSpace
                  ? 'font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/70'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
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
                  <RouterLink
                    :to="item.to"
                    :class="
                      cn(
                        'ml-7 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] leading-5 transition-colors',
                        activeId === item.id
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                      )
                    "
                    @click="emit('navigate')"
                  >
                    <FileText class="size-3.5 shrink-0 text-muted-foreground" />
                    <span class="truncate">{{ t(item.labelKey) }}</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>
