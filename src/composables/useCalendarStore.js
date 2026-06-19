// src/composables/useCalendarStore.js

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useCalendarStore = defineStore('calendar', () => {
  const stored = localStorage.getItem('calendar-events')
  const events = ref(stored ? JSON.parse(stored) : [])

  let nextId = events.value.length
    ? Math.max(...events.value.map(e => e.id)) + 1
    : 1

  watch(events, (val) => {
    localStorage.setItem('calendar-events', JSON.stringify(val))
  }, { deep: true })

  function deleteAllEntries() {
    events.value = []
    localStorage.removeItem('calendar-events')
  }

  function getNextId() {
    return nextId++
  }

  return { events, deleteAllEntries, getNextId }
})
