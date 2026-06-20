// src/composables/useNotifications.js
import { useNotificationStore } from '@/stores/notificationStore'

let reminderTimeout = null

export function useNotifications() {
    const store = useNotificationStore()

    // Berechtigung anfragen
    async function requestPermission() {
        if (!('Notification' in window)) return 'unsupported'

        // Direkt aufrufen — nicht als Promise-Chain verschachteln
        const result = await Notification.requestPermission()

        store.settings.permission = result
        store.settings.enabled = result === 'granted'

        return result
    }

    // Einzelne Benachrichtigung senden
    function send(title, options = {}) {
        if (store.settings.permission !== 'granted') return
        if (!store.settings.enabled) return

        new Notification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options
        })
    }

    // Vordefinierte Trigger
    function notifyOvertime(hours) {
        if (!store.settings.overtime) return
        send('⏰ Overtime Warning', {
            body: `You've been working for ${hours}h — take a break!`,
            tag: 'overtime',           // verhindert doppelte Notifications
        })
    }

    function notifyInactivity() {
        if (!store.settings.inactivity) return
        send('⏸ Auto-Paused', {
            body: 'No activity detected — your timer was paused.',
            tag: 'inactivity',
        })
    }

    function notifyHabitReminder() {
        if (!store.settings.habitReminder) return
        send('✅ Habit Check', {
            body: 'Don\'t forget your habits for today!',
            tag: 'habit-reminder',
        })
    }

    // Tägliche Habit-Erinnerung schedulen (via setTimeout bis zur Uhrzeit)
    function scheduleHabitReminder() {
        clearTimeout(reminderTimeout)
        if (!store.settings.habitReminder) return

        const [h, m] = store.settings.habitReminderTime.split(':').map(Number)
        const now = new Date()
        const target = new Date()
        target.setHours(h, m, 0, 0)

        if (target <= now) target.setDate(target.getDate() + 1) // morgen

        const ms = target - now
        reminderTimeout = setTimeout(() => {
            notifyHabitReminder()
            scheduleHabitReminder() // täglich wiederholen
        }, ms)
    }

    const isSupported = 'Notification' in window

    return {
        isSupported,
        requestPermission,
        send,
        notifyOvertime,
        notifyInactivity,
        notifyHabitReminder,
        scheduleHabitReminder,
    }
}