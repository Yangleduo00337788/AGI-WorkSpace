<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { breadcrumbs, slugFromPath } from '@/lib/content'

const route = useRoute()
const crumbs = computed(() => breadcrumbs(slugFromPath(route.path)))
</script>

<template>
  <nav
    v-if="crumbs.length"
    class="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden text-[13px] text-muted-foreground sm:flex"
  >
    <template v-for="(crumb, index) in crumbs" :key="`${crumb.title}-${index}`">
      <ChevronRight v-if="index" class="size-3.5 shrink-0 opacity-50" />
      <RouterLink
        v-if="crumb.slug !== undefined && index !== crumbs.length - 1"
        :to="crumb.slug ? `/${crumb.slug}` : '/'"
        class="truncate transition-colors hover:text-foreground"
      >
        {{ crumb.title }}
      </RouterLink>
      <span
        v-else
        class="truncate"
        :class="index === crumbs.length - 1 ? 'font-medium text-foreground' : ''"
      >
        {{ crumb.title }}
      </span>
    </template>
  </nav>
</template>
