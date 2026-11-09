<!-- src/components/icons/IconHomeoffice.vue -->

<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
        <path d="M10 20v-5h4v5" />
    </svg>
</template>

<script setup>
defineProps({
    size: { type: [Number, String], default: 16 },
});
</script>
