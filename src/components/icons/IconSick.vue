<!-- src/components/icons/IconSick.vue -->

<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
</template>

<script setup>
defineProps({
    size: { type: [Number, String], default: 16 },
});
</script>
