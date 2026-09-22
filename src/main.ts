import '@/lib/buffer-polyfill'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyTheme, readTheme } from './composables/useTheme'
import { useI18n } from './composables/useI18n'
import { hydrateDocOverrides } from './lib/doc-store'
import { hydrateWorkspaceFs } from './lib/workspace-fs'
import { hydrateRemoteGit } from './lib/remote-git'
import { hydratePushCopy } from './lib/push-copy'
import './styles/globals.css'

applyTheme(readTheme())
const { locale } = useI18n()
document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'

void (async () => {
  await hydrateDocOverrides()
  await hydrateWorkspaceFs()
  await hydrateRemoteGit()
  await hydratePushCopy()
  createApp(App).use(router).mount('#app')
})()
