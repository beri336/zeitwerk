    // src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
import '@/assets/main.css'
import { i18n } from './i18n'

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)
app.mount('#app')
