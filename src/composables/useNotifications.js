// src/composables/useNotifications.js
import { useNotificationStore } from '@/stores/notificationStore'

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

    const isSupported = 'Notification' in window

    return {
        isSupported,
        requestPermission,
        send,
        notifyOvertime,
        notifyInactivity,
    }
}