<!-- src/components/EntryModal.vue -->

<script setup>
import { ref, watch, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { calcActualHours, formatHours, today } from '@/composables/useTime'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    editEntry: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const store = useZeitwerkStore()
const { showToast } = useToast()

const defaultForm = () => ({
    date: today(),
    start: '',
    end: '',
    defaultBreak: store.settings.defaultBreak,
    additionalBreaks: 0,
    plannedHours: store.settings.hoursPerDay,
    notes: ''
})

const form = ref(defaultForm())

watch(() => props.modelValue, open => {
    if (open)
        form.value = props.editEntry ? { ...props.editEntry } : defaultForm()
})

const previewIst = computed(() => formatHours(calcActualHours(form.value)))

const showPreview = computed(() => form.value.start && form.value.end)

function close() { emit('update:modelValue', false) }

function save() {
    if (!form.value.date) { showToast('Date is required.', 'err'); return }
    if (props.editEntry) {
        store.updateEntry(props.editEntry.id, form.value)
        showToast('Entry updated.', 'ok')
    } else {
        store.addEntry(form.value)
        showToast('Entry added.', 'ok')
    }
    close()
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue" class="modal-backdrop" @click.self="close">
            <div class="modal" role="dialog" aria-modal="true">
                <div class="modal-header">
                    <div class="modal-title">{{ editEntry ? 'Edit Entry' : 'New Entry' }}</div>
                    <button class="btn btn-ghost" @click="close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Date *</label>
                            <input class="form-input" type="date" v-model="form.date" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Planned Hours (h/Day)</label>
                            <input class="form-input" type="number" step="0.5" min="0" max="24"
                                v-model.number="form.plannedHours" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Start Time</label>
                            <input class="form-input" type="time" v-model="form.start" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">End Time</label>
                            <input class="form-input" type="time" v-model="form.end" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Default Break (min)</label>
                            <input class="form-input" type="number" min="0" max="120"
                                v-model.number="form.defaultBreak" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Additional Breaks (min)</label>
                            <input class="form-input" type="number" min="0" max="240"
                                v-model.number="form.additionalBreaks" />
                        </div>
                        <div class="form-group full">
                            <label class="form-label">Notes</label>
                            <input class="form-input" type="text" maxlength="200" v-model="form.notes"
                                placeholder="e.g. Homeoffice, Vacation, Illness…" />
                        </div>
                    </div>

                    <div v-if="showPreview" class="preview-bar">
                        <span class="form-label">Preview Actual:</span>
                        <strong>{{ previewIst }}</strong>
                        <span class="preview-hint">incl. {{ form.value.defaultBreak + form.value.additionalBreaks }}min Break</span>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="close">Cancel</button>
                    <button class="btn btn-primary" @click="save">{{ editEntry ? 'Update' : 'Add'
                    }}</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.preview-bar {
    margin-top: var(--space-4);
    padding: var(--space-3);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.preview-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
}
</style>
