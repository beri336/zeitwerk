// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import LiveTrackingView from '@/views/LiveTrackingView.vue'
import OverviewView from '@/views/OverviewView.vue'
import WeekOverview from '@/components/features/WeekOverview.vue'
import MonthOverviewCard from '@/components/features/MonthOverviewCard.vue'
import YearOverviewCard from '@/components/features/YearOverviewCard.vue'
import CalendarView from '@/views/CalendarView.vue'
import ToDoView from '@/views/ToDoView.vue'
import DiagramsView from '@/views/DiagramsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import HabitTrackerView from '@/views/HabitTrackerView.vue'
import ExportView from '@/views/ExportView.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/livetracking', name: 'livetracking', component: LiveTrackingView },
    {
        path: '/overview',
        component: OverviewView,
        children: [
            { path: '', redirect: '/overview/month' },
            { path: 'week', name: 'overview-week', component: WeekOverview },
            { path: 'month', name: 'overview-month', component: MonthOverviewCard },
            { path: 'year', name: 'overview-year', component: YearOverviewCard },
        ],
    },
    { path: '/week-overview', redirect: '/overview/week' },
    { path: '/month-overview', redirect: '/overview/month' },
    { path: '/year-overview', redirect: '/overview/year' },
    { path: '/calendar', name: 'calendar', component: CalendarView },
    { path: '/todo', name: 'todo', component: ToDoView },
    { path: '/diagrams', name: 'diagrams', component: DiagramsView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/habit-tracker', name: 'habit-tracker', component: HabitTrackerView },
    { path: '/export', name: 'export', component: ExportView },
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
