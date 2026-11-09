<!-- src/components/icons/IconHoliday.vue -->

<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3.5 14.2 8l4.8.7-3.5 3.4.8 4.8L12 14.6 7.7 16.9l.8-4.8L5 8.7 9.8 8z" />
    </svg>
</template>

<script setup>
defineProps({
    size: { type: [Number, String], default: 16 },
});
</script>
