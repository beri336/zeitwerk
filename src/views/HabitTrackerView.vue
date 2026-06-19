<!-- src/views/HabitTrackerView.vue -->

<template>
  <main class="main">
    <h1>Habit Tracker</h1>
    <HabitTrackerCard />
  </main>
</template>

<script setup>
import HabitTrackerCard from '@/components/features/HabitTrackerCard.vue'
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  gap: var(--space-5);
  min-width: 0;
  padding: var(--space-6, 2rem) var(--space-4, 1rem);
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
  width: 100%;
}

.main h1::before,
.main h1::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
}
</style>
