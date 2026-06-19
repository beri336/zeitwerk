<!-- src/views/DiagramsView.vue -->

<template>
    <main class="main">
        <h1>Diagrams</h1>
        <DiagramsCard />
    </main>
</template>

<script setup>
import DiagramsCard from '@/components/features/DiagramsCard.vue'
</script>

<style scoped>
.main {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
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
