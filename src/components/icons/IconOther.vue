<!-- src/components/icons/IconOther.vue -->

<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
    </svg>
</template>

<script setup>
defineProps({
    size: { type: [Number, String], default: 16 },
});
</script>
