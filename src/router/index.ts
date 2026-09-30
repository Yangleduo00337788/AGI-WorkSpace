import { createRouter, createWebHistory } from 'vue-router'
import DocsLayout from '@/layouts/DocsLayout.vue'
import DocView from '@/views/DocView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { confirmLeaveIfUnsaved } from '@/lib/editor-session'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 80 }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: DocsLayout,
      children: [
        { path: '', name: 'home', component: DocView },
        { path: 'roles', redirect: '/settings#roles' },
        { path: 'settings', name: 'settings', component: SettingsView },
        { path: ':slug(.*)', name: 'doc', component: DocView },
      ],
    },
  ],
})

router.beforeEach((to, from) => {
  if (to.path === from.path) return true
  if (!confirmLeaveIfUnsaved()) return false
  return true
})

export default router
