<!-- src/views/DashboardView.vue -->

<template>
  <main class="main">
    <h1>Dashboard</h1>

    <!-- PWA Banner -->
    <div v-if="isPWA" class="pwa-banner">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      PWA Mode
    </div>

    <Dashboard />
  </main>
</template>

<script setup>
import Dashboard from '@/components/features/DashboardCard.vue'
import { computed } from 'vue'

const isPWA = computed(() =>
  window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone
)
</script>

<style scoped>
.main {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

/* Page Headings */
.main h1 {
  font-size: var(--text-2xl, 1.5rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.main h1::before,
.main h1::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
}

/* PWA Banner */
.pwa-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-gold-highlight);
  color: var(--color-gold);
  border: 1px solid color-mix(in oklch, var(--color-gold) 25%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
}
</style>
