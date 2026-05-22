// src/composables/usePrivacy.js

import { ref } from 'vue'

// Globaler Singleton — gleicher State überall in der App
const privacyMode = ref(
    localStorage.getItem('zeitwerk_privacy') === 'true'
)

export function usePrivacy() {
    function toggle() {
        privacyMode.value = !privacyMode.value
        localStorage.setItem('zeitwerk_privacy', privacyMode.value)
    }

    // Maskiert einen Wert wenn Privacy aktiv
    function mask(value) {
        if (!privacyMode.value) return value
        return '••••'
    }

    return { privacyMode, toggle, mask }
}
