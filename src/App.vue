<!-- src/App.vue -->

<template>
  <div class="app-shell">
    <AppSidebar />
    <AppTopbar :is-dark="isDark" @toggle-theme="toggleTheme" />

    <!-- Router content gets its own explicit wrapper -->
    <div class="app-content">
      <RouterView />
    </div>

    <AppBottomNav />
    <ToastList />
    <PwaUpdatePrompt />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import ToastList from '@/components/ui/ToastList.vue'
import PwaUpdatePrompt from '@/components/ui/PwaUpdatePrompt.vue'
import { useNotifications } from '@/composables/useNotifications'

const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('zeitwerk_theme')

  isDark.value = saved
    ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches

  applyTheme()
})

const notifications = useNotifications()
onMounted(() => {
  notifications.scheduleHabitReminder()
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

<style>
/* Base */
html,
body,
#app {
  height: 100%;
  margin: 0;
}

/* App Shell */
.app-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
}

.app-shell>.sidebar {
  grid-column: 1;
  grid-row: 1 / span 2;
  min-height: 0;
}

.app-shell>.topbar {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.app-content {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Mobile */
@media (max-width: 767px) {
  .app-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .app-shell>.sidebar {
    display: none;
  }

  .app-shell>.topbar {
    grid-column: 1;
    grid-row: 1;
  }

  .app-content {
    grid-column: 1;
    grid-row: 2;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
}
</style>
