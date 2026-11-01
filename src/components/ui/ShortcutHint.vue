<!-- src/components/ui/ShortcutHint.vue -->

<template>
    <span class="shortcut-hint" aria-hidden="true">{{ label }}</span>
</template>

<script setup>
defineProps({
    label: { type: String, required: true },
})
</script>

<style scoped>
.shortcut-hint {
    color: var(--color-text-faint);
    font-size: 0.68rem;
    font-weight: 500;
    white-space: nowrap;
}

@media (max-width: 767px) {
    .shortcut-hint {
        display: none;
    }
}
</style>
