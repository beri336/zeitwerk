<!-- src/App.vue -->

<template>
  <div class="app-shell">
    <AppSidebar />
    <AppTopbar :is-dark="isDark" @toggle-theme="toggleTheme" />

    <!-- Router content gets its own explicit wrapper -->
    <div ref="contentRef" class="app-content">
      <RouterView />
    </div>

    <AppBottomNav :is-dark="isDark" @toggle-theme="toggleTheme" />
    <ToastList />
    <PwaStatusBanner />
    <ShortcutHelp />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import ToastList from '@/components/ui/ToastList.vue'
import PwaStatusBanner from '@/components/ui/PwaStatusBanner.vue'
import ShortcutHelp from '@/components/ui/ShortcutHelp.vue'
import { useAutoRecovery } from '@/composables/useRecovery'
import { useExtraVacationNotice } from '@/composables/useExtraVacationNotice'

const isDark = ref(false)
const contentRef = ref(null)
const route = useRoute()

// the app scrolls inside .app-content, so the router's scrollBehavior never applies
watch(() => route.path, () => {
  contentRef.value?.scrollTo({ top: 0 })
})

useAutoRecovery()
useExtraVacationNotice()

onMounted(() => {
  localStorage.removeItem('habits')
  localStorage.removeItem('habit-completions')

  const saved = localStorage.getItem('zeitwerk_theme')

  isDark.value = saved
    ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches

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
    /* clears the bottom nav plus the floating add button */
    padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + 88px);
    overscroll-behavior-y: contain;
    scrollbar-width: none;
  }

  .app-content::-webkit-scrollbar {
    display: none;
  }

  /* The topbar already names the page */
  .app-shell .app-content>main.main>h1 {
    display: none;
  }

  /* One consistent floating add button across pages */
  .app-shell .app-content .dashboard-add-btn,
  .app-shell .app-content .overview-add-btn {
    position: fixed;
    right: max(var(--space-4), env(safe-area-inset-right));
    bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + var(--space-4));
    z-index: 30;
    width: 56px;
    height: 56px;
    min-height: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: var(--color-primary);
    color: var(--color-text-inverse);
    box-shadow: 0 6px 20px color-mix(in oklch, var(--color-primary) 40%, transparent), var(--shadow-md);
    font-size: 1.75rem;
    font-weight: 500;
    line-height: 1;
    transition: transform 0.15s ease;
  }

  .app-shell .app-content .dashboard-add-btn:active,
  .app-shell .app-content .overview-add-btn:active {
    transform: scale(0.94);
  }

  .app-shell .app-content .overview-add-btn>span[aria-hidden] {
    font-size: 1.75rem;
  }
}

:root {
  --bottom-nav-height: 64px;
}
</style>
