// src/stores/useTodoStore.js

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useTodoStore = defineStore('todos', () => {
  const stored = localStorage.getItem('todos')
  const todos = ref(stored ? JSON.parse(stored) : [])

  watch(todos, (val) => {
    localStorage.setItem('todos', JSON.stringify(val))
  }, { deep: true })

  function deleteAllEntries() {
    todos.value = []
    localStorage.removeItem('todos')
  }

  return { todos, deleteAllEntries }
})
