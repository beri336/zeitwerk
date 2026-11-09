<!-- src/components/icons/AbsenceIcon.vue -->

<template>
    <component :is="icon" class="absence-icon" :size="size" />
</template>

<script setup>
import { computed } from "vue";
import IconOnSite from "./IconOnSite.vue";
import IconHomeoffice from "./IconHomeoffice.vue";
import IconVacation from "./IconVacation.vue";
import IconSick from "./IconSick.vue";
import IconHoliday from "./IconHoliday.vue";
import IconOther from "./IconOther.vue";

const icons = {
    "on-site": IconOnSite,
    homeoffice: IconHomeoffice,
    vacation: IconVacation,
    sick: IconSick,
    publicholiday: IconHoliday,
    other: IconOther,
};

const props = defineProps({
    type: { type: String, default: "other" },
    size: { type: [Number, String], default: 16 },
});

const icon = computed(() => icons[props.type] ?? icons.other);
</script>

<style scoped>
.absence-icon {
    display: block;
    flex-shrink: 0;
}
</style>