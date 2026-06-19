// src/composables/useDeviceExt.js

import { ref, computed, onMounted, onUnmounted } from 'vue'

function parseDevice() {
    const ua = navigator.userAgent

    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const isMacOS = /Macintosh|MacIntel/i.test(ua) && !isIOS
    const isWindows = /Windows NT/i.test(ua)
    const isLinux = /Linux/i.test(ua) && !isAndroid
    const isIPhone = /iPhone/i.test(ua)
    const isIPad = /iPad/i.test(ua) || (isMacOS && navigator.maxTouchPoints > 1)
    const isTablet = isIPad || (/Android/i.test(ua) && !/Mobile/i.test(ua))
    const isMobile = (isIPhone || (isAndroid && /Mobile/i.test(ua))) && !isTablet
    const isMac = isMacOS && !isIPad

    let deviceLabel = 'Unknown', deviceType = 'desktop'
    if (isIPhone) {
        deviceLabel = 'iPhone'
        deviceType = 'iphone'
    } else if (isIPad) {
        deviceLabel = 'iPad'
        deviceType = 'ipad'
    } else if (isTablet) {
        deviceLabel = 'Android Tablet'
        deviceType = 'tablet'
    } else if (isAndroid) {
        deviceLabel = 'Android Phone'
        deviceType = 'android'
    }
    else if (isMac) {
        deviceLabel = 'Mac'
        deviceType = 'mac'
    }
    else if (isWindows) {
        deviceLabel = 'Windows PC'
        deviceType = 'windows'
    }
    else if (isLinux) {
        deviceLabel = 'Linux PC'
        deviceType = 'linux'
    }

    let osLabel = 'Unknown OS'
    if (isIOS) {
        osLabel = `iOS ${(ua.match(/OS (\d+_\d+)/) || [])[1]?.replace('_', '.') ?? ''}`
    } else if (isAndroid) {
        osLabel = `Android ${(ua.match(/Android (\d+\.?\d*)/) || [])[1] ?? ''}`
    } else if (isMacOS) {
        osLabel = 'macOS'
    } else if (isWindows) {
        const v = (ua.match(/Windows NT (\d+\.\d+)/) || [])[1]
        const map = { '10.0': 'Windows 10/11', '6.3': 'Windows 8.1', '6.2': 'Windows 8', '6.1': 'Windows 7' }
        osLabel = map[v] ?? `Windows NT ${v ?? ''}`
    } else if (isLinux) {
        osLabel = 'Linux'
    }

    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua)
    const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua)
    const isFirefox = /Firefox/i.test(ua)
    const isEdge = /Edg/i.test(ua)

    let browserLabel = 'Unknown', browserVersion = ''
    if (isEdge) {
        browserLabel = 'Edge'
        browserVersion = (ua.match(/Edg\/(\d+)/) || [])[1] ?? ''
    }
    else if (isChrome) {
        browserLabel = 'Chrome';
        browserVersion = (ua.match(/Chrome\/(\d+)/) || [])[1] ?? ''
    }
    else if (isFirefox) {
        browserLabel = 'Firefox';
        browserVersion = (ua.match(/Firefox\/(\d+)/) || [])[1] ?? ''
    }
    else if (isSafari) {
        browserLabel = 'Safari';
        browserVersion = (ua.match(/Version\/(\d+)/) || [])[1] ?? ''
    }

    return {
        deviceLabel,
        deviceType,
        osLabel,
        browserLabel,
        browserVersion,
        screenW: window.screen.width,
        screenH: window.screen.height,
        pixelRatio: window.devicePixelRatio ?? 1,
        isRetina: (window.devicePixelRatio ?? 1) >= 2,
        isTouch: navigator.maxTouchPoints > 0,
        isPWA: window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone,
        isMobile,
        isTablet,
        language: navigator.language ?? 'unknown',
        deviceMemory: navigator.deviceMemory ?? null,
        cpuCores: navigator.hardwareConcurrency ?? null,
    }
}

export function useDevice() {
    return computed(() => parseDevice())
}

export function useBattery() {
    const level = ref(null)
    const charging = ref(null)
    const supported = ref(false)

    onMounted(async () => {
        if (!('getBattery' in navigator))
            return

        supported.value = true
        const battery = await navigator.getBattery()
        level.value = battery.level
        charging.value = battery.charging

        battery.addEventListener('levelchange', () => { level.value = battery.level })
        battery.addEventListener('chargingchange', () => { charging.value = battery.charging })
    })

    return {
        percent: computed(() => level.value !== null ? Math.round(level.value * 100) : null),
        charging,
        supported,
    }
}

export function useOnlineStatus() {
    const isOnline = ref(navigator.onLine)
    const onOnline = () => { isOnline.value = true }
    const onOffline = () => { isOnline.value = false }

    onMounted(() => {
        window.addEventListener('online', onOnline)
        window.addEventListener('offline', onOffline)
    })

    onUnmounted(() => {
        window.removeEventListener('online', onOnline)
        window.removeEventListener('offline', onOffline)
    })

    return { isOnline }
}
