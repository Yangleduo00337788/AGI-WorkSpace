<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import { navTree } from '@/lib/content'
import NavTree from '@/components/NavTree.vue'
import { useI18n } from '@/composables/useI18n'
import { cn } from '@/lib/utils'

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
</script>

<template>
  <aside class="flex h-full flex-col">
    <div class="px-6 pb-3 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {{ title }}
    </div>
    <nav class="flex-1 overflow-y-auto px-6 pr-8 pb-8 scrollbar-thin">
      <NavTree :nodes="navTree" @navigate="emit('navigate')" />
      <RouterLink
        to="/settings"
        :class="
          cn(
            'mt-0.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] leading-5 transition-colors',
            $route.path === '/settings'
              ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
          )
        "
        @click="emit('navigate')"
      >
        <Settings class="size-3.5 shrink-0 text-muted-foreground" />
        {{ t('settingsNav') }}
      </RouterLink>
    </nav>
  </aside>
</template>
