// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import MonthOverviewView from '@/views/MonthOverviewView.vue'
import YearView from '@/views/YearView.vue'
import CalenderView from '@/views/CalenderView.vue'
import DiagramsView from '@/views/DiagramsView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/month-overview', name: 'month-overview', component: MonthOverviewView },
    { path: '/year-overview', name: 'year-overview', component: YearView },
    { path: '/calender', name: 'calender', component: CalenderView },
    { path: '/diagrams', name: 'diagrams', component: DiagramsView },
    { path: '/settings', name: 'settings', component: SettingsView },
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
