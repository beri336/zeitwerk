<!-- src/views/CalendarView.vue -->

<template>
  <main class="main">
    <h1>{{ $t("nav.calendar") }}</h1>

    <CalendarCard />
  </main>
</template>

<script setup>
import CalendarCard from "@/components/features/CalenderCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
/* Main Layout */
.main {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

/* Page Heading */
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
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
}

/* Mobile */
@media (max-width: 767px) {
  .main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .main h1 {
    font-size: var(--text-xl, 1.25rem);
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .main {
    padding: var(--space-2);
    gap: var(--space-2);
  }
}
</style>
