<!-- src/views/ToDoView.vue -->

<template>
  <main class="main">
    <h1>To-Do List</h1>
    <ToDoCard />
  </main>
</template>

<script setup>
import ToDoCard from '@/components/features/ToDoCard.vue'
</script>

<style scoped>
.main {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
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
</style>
