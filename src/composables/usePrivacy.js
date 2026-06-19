// src/composables/usePrivacy.js

import { ref } from 'vue'

// Global Singleton — Consistent State Throughout the App
const privacyMode = ref(
    localStorage.getItem('zeitwerk_privacy') === 'true'
)

export function usePrivacy() {
    function toggleOffIfOn() {
        if (privacyMode.value === true) toggle()
    }

    function toggle() {
        privacyMode.value = !privacyMode.value
        localStorage.setItem('zeitwerk_privacy', privacyMode.value)
    }

    // Masks a value when Privacy is enabled
    function mask(value) {
        if (!privacyMode.value)
            return value
        
        return '••••'
    }

    return { privacyMode, toggle, mask, toggleOffIfOn }
}
