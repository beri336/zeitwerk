<!-- src/views/SettingsView.vue -->

<template>
    <main class="main">
        <h1>Settings</h1>
        <SettingsCard />
    </main>
</template>

<script setup>
import SettingsCard from '@/components/features/SettingsCard.vue';
</script>

<style scoped>
.main {
    overscroll-behavior: contain;
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
