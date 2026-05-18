<!-- src/views/TrackingView.vue -->

<script setup>
import { ref, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { formatHours, getKW, today } from '@/composables/useTime'
import KpiCard from '@/components/KpiCard.vue'
import MonthTable from '@/components/MonthTable.vue'
import EntryModal from '@/components/EntryModal.vue'

const store = useZeitwerkStore()

const showModal = ref(false)
const editEntry = ref(null)

function openAdd() {
    editEntry.value = null
    showModal.value = true
}

function openEdit(entry) {
    editEntry.value = entry
    showModal.value = true
}

const currentWeekKW = computed(() => getKW(today()))

const currentWeekActual = computed(() => {
    const group = store.weekGroups.find(item => item.kw === currentWeekKW.value)

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
</script>

<template>
    <main class="main">
        <!-- KPIs -->
        <div class="kpi-grid">
            <KpiCard label="Month actual" :value="formatHours(store.monthActual)" :sub="`Planned: ${formatHours(store.monthPlanned)}`"
                :variant="monthActualVariant" />
            <KpiCard label="Month difference" :value="`${store.monthDiff >= 0 ? '+' : ''}${formatHours(store.monthDiff)}`"
                :sub="store.monthDiff >= 0 ? 'Over time' : 'Missed Hours'" :variant="monthDiffVariant" />
            <KpiCard label="Week actual" :value="formatHours(currentWeekActual)"
                :sub="`Planned: ${formatHours(store.settings.hoursPerWeek)}`" />
            <KpiCard label="Entries" :value="String(store.entriesForMonth.length)" sub="Work days" />
        </div>

        <!-- Add Button -->
        <div class="add-bar">
            <button class="btn btn-primary" @click="openAdd">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add entry
            </button>
        </div>

        <!-- Table -->
        <MonthTable @edit="openEdit" />

        <!-- Modal -->
        <EntryModal v-model="showModal" :edit-entry="editEntry" />
    </main>
</template>

<style scoped>
.main {
    grid-column: 2;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
    gap: var(--space-4);
}

.add-bar {
    display: flex;
    justify-content: flex-end;
}
</style>
