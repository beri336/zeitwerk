// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'
import TrackingView from '@/views/TrackingView.vue'
import CalenderView from '@/views/CalenderView.vue'
import DiagramsView from '@/views/DiagramsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import YearView from '@/views/YearView.vue'

const routes = [
    { path: '/', redirect: '/month-overview' },
    { path: '/month-overview', name: 'month-overview', component: TrackingView },
    { path: '/calender', name: 'calender', component: CalenderView },
    { path: '/diagrams', name: 'diagrams', component: DiagramsView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/year-overview', name: 'year-overview', component: YearView },
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
