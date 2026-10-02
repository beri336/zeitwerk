<!-- src/views/OverviewView.vue -->

<template>
  <main class="main">
    <header class="overview-header">
      <h1>{{ $t("nav.overview") }}</h1>

      <nav class="overview-tabs" :aria-label="$t('nav.overview')">
        <RouterLink to="/overview/week" class="overview-tab"
          :class="{ 'overview-tab--active': route.path === '/overview/week' }">
          {{ $t("nav.week") }}
        </RouterLink>

        <RouterLink to="/overview/month" class="overview-tab"
          :class="{ 'overview-tab--active': route.path === '/overview/month' }">
          {{ $t("nav.month") }}
        </RouterLink>

        <RouterLink to="/overview/year" class="overview-tab"
          :class="{ 'overview-tab--active': route.path === '/overview/year' }">
          {{ $t("nav.year") }}
        </RouterLink>
      </nav>
    </header>

    <RouterView />
  </main>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
useI18n();
</script>

<style scoped>
.main {
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.overview-header h1 {
  min-width: 0;
  margin: 0;
  color: var(--color-text);
  font-size: var(--text-2xl, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.overview-tabs {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.overview-tab {
  min-width: 76px;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}

.overview-tab:hover {
  color: var(--color-text);
}

.overview-tab--active {
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 767px) {
  .main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  :deep(.main) {
    padding: 0;
  }

  .overview-header {
    align-items: stretch;
    flex-direction: column;
    gap: var(--space-3);
  }

  .overview-header h1 {
    font-size: var(--text-xl, 1.25rem);
  }

  .overview-tabs {
    width: 100%;
  }

  .overview-tab {
    flex: 1;
  }
}

@media (max-width: 420px) {
  .main {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  :deep(.main) {
    padding: 0;
  }
}
</style>
