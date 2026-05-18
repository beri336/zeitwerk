// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'
import TrackingView from '@/views/TrackingView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
    { path: '/', redirect: '/tracking' },
    { path: '/tracking', name: 'tracking', component: TrackingView },
    { path: '/settings', name: 'settings', component: SettingsView }
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
