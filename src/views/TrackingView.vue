<!-- src/views/TrackingView.vue -->

<template>
    <main class="main">
        <!-- KPIs -->
        <div class="kpi-grid">
            <KpiCard label="Month actual" :value="formatHours(store.monthActual)"
                :sub="`Planned: ${formatHours(store.monthPlanned)}`" :variant="monthActualVariant" />

            <KpiCard label="Month difference"
                :value="`${store.monthDiff >= 0 ? '+' : ''}${formatHours(store.monthDiff)}`"
                :sub="store.monthDiff >= 0 ? 'Over time' : 'Missed Hours'" :variant="monthDiffVariant" />

            <KpiCard label="Week actual" :value="formatHours(currentWeekActual)"
                :sub="`Planned: ${formatHours(store.settings.hoursPerWeek)}`" />

            <KpiCard label="Entries" :value="String(store.entriesForMonth.length)" sub="Work days" />

            <!-- Only if salary is set -->
            <KpiCard v-if="store.grossHourlyRate > 0" label="Month Gross" :value="monthGrossLabel" sub="Gross earnings"
                variant="ok" :private="true" />

            <!-- Vacation -->
            <KpiCard label="Used Vacation Days" :value="String(store.usedVacationDays)" sub="Days taken" />

            <KpiCard label="Remaining Vacation Days" :value="String(store.remainingVacationDays)"
                :sub="`${store.remainingVacationDays === 1 ? 'Day left' : 'Days left'}`" />
        </div>

        <!-- Add Bar: Desktop displays the button and legend side by side -->
        <div class="add-bar">
            <button class="btn btn-primary" @click="openAdd">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add entry
            </button>
            <AbsenceLegend />
        </div>

        <!-- Table -->
        <MonthTable @edit="openEdit" />

        <!-- Modals -->
        <EntryModal v-model="showModal" :edit-entry="editEntry" />
        <HolidayImportModal v-model="showHolidayModal" />
    </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, getKW, today } from '@/composables/useTime'

import KpiCard from '@/components/ui/KpiCard.vue'
import MonthTable from '@/components/MonthTable.vue'
import EntryModal from '@/components/EntryModal.vue'
import AbsenceLegend from '@/components/AbsenceLegend.vue'
import HolidayImportModal from '@/components/HolidayImportModal.vue'

import { usePrivacy } from '@/composables/usePrivacy'

const { mask } = usePrivacy()

const store = useZeitwerkStore()
const showModal = ref(false)
const editEntry = ref(null)
const showHolidayModal = ref(false)

function openAdd() { editEntry.value = null; showModal.value = true }
function openEdit(entry) { editEntry.value = entry; showModal.value = true }

const currentWeekKW = computed(() => getKW(today()))
const currentWeekActual = computed(() => {
    const group = store
        .weekGroups
        .find(item => item.kw === currentWeekKW.value)

    return group ? group.actual : 0
})

const monthDiffVariant = computed(() => {
    if (store.monthDiff > 0.25)
        return 'ok'

    if (store.monthDiff < -0.25)
        return 'err'
    
    return ''
})

const monthActualVariant = computed(() => {
    if (store.monthDiff > 0.25)
    return 'ok'

    if (store.monthDiff < -0.25)
        return 'err'

    return ''
})

const monthGrossLabel = computed(() => {
    if (!store.grossHourlyRate)
        return ''

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
    }).format(store.monthGross)
})
</script>

<style scoped>
/* Main Layout */
.main {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    min-width: 0;
}

/* KPI Grid */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-4);
}

.kpi-grid--five {
    grid-template-columns: repeat(5, minmax(0, 1fr));
}

/* Add Bar */
.add-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
}

/* Laptop */
@media (max-width: 1024px) {
    .main    { padding: var(--space-4); gap: var(--space-4); }
    .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* Mobile */
@media (max-width: 767px) {
    .main     { padding: var(--space-3); gap: var(--space-3); }
    .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }

    .add-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .add-bar .btn {
        width: 100%;
        justify-content: center;
        min-height: 44px;
    }
}

/* Small Mobile */
@media (max-width: 420px) {
    .kpi-grid { grid-template-columns: 1fr; }
}
</style>
