<!-- src/components/HolidayImportModal.vue -->

<script setup>
import { computed, ref } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { STATES, getHolidaysForMonth } from '@/composables/useHolidays'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])

const store = useZeitwerkStore()
const { showToast } = useToast()

const selectedState = ref(store.settings.state ?? 'BW')

const preview = computed(() =>
    getHolidaysForMonth(store.currYear, store.currMonth, selectedState.value)
)

const existingDates = computed(() =>
    new Set(store.entries.map(entry => entry.date))
)

function isAlreadyImported(date) {
    return existingDates.value.has(date)
}

function close() { emit('update:modelValue', false) }

function doImport() {
    // Save state in Settings
    store.saveSettings({ state: selectedState.value })

    const result = store.importHolidays(store.currYear, store.currMonth)

    if (result.added === 0 && result.skipped > 0) {
        showToast(`All ${result.skipped} holidays already exist.`, 'ok')
    } else {
        showToast(
            `${result.added} holiday${result.added !== 1 ? 's' : ''} added` +
            (result.skipped ? `, ${result.skipped} skipped` : '') + '.',
            'ok'
        )
    }
    close()
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue" class="modal-backdrop" @click.self="close">
            <div class="modal" role="dialog" aria-modal="true">

                <div class="modal-header">
                    <div class="modal-title">🎉 Holidays</div>
                    <button class="btn btn-ghost" @click="close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- State selection -->
                    <div class="form-group" style="margin-bottom:var(--space-5)">
                        <label class="form-label">State</label>
                        <select class="form-input" v-model="selectedState">
                            <option v-for="(name, code) in STATES" :key="code" :value="code">
                                {{ name }}
                            </option>
                        </select>
                        <span class="form-hint">Will be saved in the settings</span>
                    </div>

                    <!-- Preview -->
                    <div class="preview-label">
                        Holidays in {{ store.currMonthLabel }}
                        <span class="preview-count">{{ preview.length }} found</span>
                    </div>

                    <div v-if="preview.length === 0" class="no-holidays">
                        No public holidays this month for {{ STATES[selectedState] }}.
                    </div>

                    <div v-else class="holiday-list">
                        <div v-for="h in preview" :key="h.date" class="holiday-item"
                            :class="{ 'holiday-item--exists': isAlreadyImported(h.date) }">
                            <div class="holiday-date">
                                {{ new Date(h.date + 'T00:00:00').toLocaleDateString('de-DE', {
                                    weekday: 'short', day: '2-digit', month: '2-digit' }) }}
                            </div>
                            <div class="holiday-name">{{ h.name }}</div>
                            <div class="holiday-status">
                                <span v-if="isAlreadyImported(h.date)" class="badge badge-ok">✓ available</span>
                                <span v-else class="badge badge-new">new</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="close">Cancel</button>
                    <button class="btn btn-primary" :disabled="preview.length === 0" @click="doImport">
                        🎉 Import Holidays
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.preview-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: var(--space-3);
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.preview-count {
    background: var(--color-blue-highlight);
    color: var(--color-blue);
    padding: 1px var(--space-2);
    border-radius: var(--radius-full);
    font-weight: 600;
}

.no-holidays {
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-faint);
    font-size: var(--text-sm);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
}

.holiday-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-height: 320px;
    overflow-y: auto;
}

.holiday-item {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-divider);
    transition: opacity var(--transition);
}

.holiday-item--exists {
    opacity: 0.5;
}

.holiday-date {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
}

.holiday-name {
    font-size: var(--text-sm);
    color: var(--color-text);
    font-weight: 500;
}

.holiday-status {
    display: flex;
    justify-content: flex-end;
}
</style>
