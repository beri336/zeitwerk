<!-- src/App.vue -->

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import ToastList from '@/components/ToastList.vue'

const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('zeitwerk_theme')
  isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme()
})

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('zeitwerk_theme', isDark.value ? 'dark' : 'light')
}
</script>

<template>
  <AppSidebar />
  <AppTopbar :is-dark="isDark" @toggle-theme="toggleTheme" />
  <RouterView />
  <ToastList />
</template>
