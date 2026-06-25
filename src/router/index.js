// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import LiveTrackingView from '@/views/LiveTrackingView.vue'
import MonthOverviewView from '@/views/MonthOverviewView.vue'
import YearOverviewView from '@/views/YearOverviewView.vue'
import CalendarView from '@/views/CalendarView.vue'
import ToDoView from '@/views/ToDoView.vue'
import DiagramsView from '@/views/DiagramsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SettingsView from '@/views/SettingsView.vue'
import HabitTrackerView from '@/views/HabitTrackerView.vue'
import ExportView from '@/views/ExportView.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/livetracking', name: 'livetracking', component: LiveTrackingView },
    { path: '/month-overview', name: 'month-overview', component: MonthOverviewView },
    { path: '/year-overview', name: 'year-overview', component: YearOverviewView },
    { path: '/calendar', name: 'calendar', component: CalendarView },
    { path: '/todo', name: 'todo', component: ToDoView },
    { path: '/diagrams', name: 'diagrams', component: DiagramsView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/habit-tracker', name: 'habit-tracker', component: HabitTrackerView },
    { path: '/export', name: 'export', component: ExportView },
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
