// src/composables/useStorageSize.js

import { ref, onMounted } from 'vue'

export function useStorageSize() {
    const bytes = ref(0)

    function calculate() {
        let total = 0

        for (const key in localStorage) {
            if (!Object.prototype.hasOwnProperty.call(localStorage, key))
                continue

            total += (localStorage.getItem(key)?.length ?? 0) * 2 // UTF-16: 2 bytes/char
        }

        bytes.value = total
    }

    function formatted() {
        const b = bytes.value

        if (b < 1024)
            return `${b} B`

        if (b < 1024 * 1024)
            return `${(b / 1024).toFixed(1)} KB`

        return `${(b / (1024 * 1024)).toFixed(2)} MB`
    }

    onMounted(calculate)

    return {
        bytes,
        formatted,
        calculate
    }
}
