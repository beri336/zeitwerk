// src/composables/useHabitStore.js

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useHabitStore = defineStore('habits', () => {
    const storedHabits = localStorage.getItem('habits')
    const habits = ref(storedHabits ? JSON.parse(storedHabits) : [])

    const storedCompletions = localStorage.getItem('habit-completions')
    const completionsRaw = storedCompletions
        ? JSON.parse(storedCompletions)
        : {}

    const completions = ref(
        Object.fromEntries(Object.entries(completionsRaw)
            .map(([k, v]) => [k, new Set(v)]))
    )

    let nextId = habits.value.length
        ? Math.max(...habits.value.map(h => h.id)) + 1
        : 1

    watch(habits, (val) => {
        localStorage.setItem('habits', JSON.stringify(val))
    }, { deep: true })

    function persistCompletions() {
        const raw = Object.fromEntries(
            Object.entries(completions.value).map(([k, v]) => [k, [...v]])
        )
        localStorage.setItem('habit-completions', JSON.stringify(raw))
    }

    function deleteAllEntries() {
        habits.value = []
        completions.value = {}
        localStorage.removeItem('habits')
        localStorage.removeItem('habit-completions')
    }

    function getNextId() {
        return nextId++
    }

    return {
        habits,
        completions,
        persistCompletions,
        deleteAllEntries,
        getNextId
    }
})
