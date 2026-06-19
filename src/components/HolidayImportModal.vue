<!-- src/components/HolidayImportModal.vue -->

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
                        <div v-for="holiday in preview" :key="holiday.date" class="holiday-item"
                            :class="{ 'holiday-item--exists': isAlreadyImported(holiday.date) }">
                            <div class="holiday-date">
                                {{ new Date(holiday.date + 'T00:00:00').toLocaleDateString('de-DE', {
                                    weekday: 'short', day: '2-digit', month: '2-digit' }) }}
                            </div>
                            <div class="holiday-name">{{ holiday.name }}</div>
                            <div class="holiday-status">
                                <span v-if="isAlreadyImported(holiday.date)" class="badge badge-ok">✓ available</span>
                                <span v-else class="badge badge-new">new</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Auto-hint -->
                <div class="auto-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Holidays are automatically added when you change the state in the settings.
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

<script setup>
import { computed, ref } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { STATES, getHolidaysForMonth } from '@/composables/useHolidays'

const props = defineProps( { modelValue: { type: Boolean, default: false } } )
const emit = defineEmits( ['update:modelValue'] )

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

<style scoped>
/* Preview Label */
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

/* Auto Hint */
.auto-hint {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-blue-highlight);
    color: var(--color-blue);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    margin-bottom: var(--space-4);
    line-height: 1.5;
}

/* Holiday List */
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

/* Empty State */
.no-holidays {
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-faint);
    font-size: var(--text-sm);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
}
</style>
