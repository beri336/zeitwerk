<!-- src/views/ProfileView.vue -->

<template>
  <main class="main">
    <h1>Profile</h1>
    <ProfileCard />
  </main>
</template>

<script setup>
import ProfileCard from '@/components/features/ProfileCard.vue'
</script>

<style scoped>
.main {
  padding: var(--space-6, 2rem) var(--space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
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
