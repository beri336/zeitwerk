<!-- src/views/YearOverviewView.vue -->

<template>
    <main class="main">
        <h1>Year Overview</h1>
        <YearOverviewCard />
    </main>
</template>

<script setup>
import YearOverviewCard from '@/components/features/YearOverviewCard.vue';
</script>

<style scoped>
.main {
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
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
