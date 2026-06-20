// src/stores/notificationStore.js

import { defineStore } from 'pinia'
import { ref, watch, reactive } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
    const stored = localStorage.getItem('zeitwerk_notifications')
    const parsed = stored ? JSON.parse(stored) : {}

    const settings = reactive({
        enabled: parsed.enabled ?? false,
        permission: parsed.permission ?? 'default',
        overtime: parsed.overtime ?? true,
        inactivity: parsed.inactivity ?? true,
        habitReminder: parsed.habitReminder ?? false,
        habitReminderTime: parsed.habitReminderTime ?? '20:00',
        workStart: parsed.workStart ?? false,
        workStartTime: parsed.workStartTime ?? '09:30',
    })

    // Browser-Permission immer syncen
    if (typeof window !== 'undefined' && 'Notification' in window) {
        settings.permission = Notification.permission
        settings.enabled = Notification.permission === 'granted'
    }

    watch(settings, val => {
        localStorage.setItem('zeitwerk_notifications', JSON.stringify(val))
    }, { deep: true })

    return { settings }
})