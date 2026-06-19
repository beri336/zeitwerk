<!-- src/components/EntryModal.vue -->

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
                    <!-- Type selector -->
                    <div class="typ-selector">
                        <button v-for="(type, key) in ABSENCE_TYPES" :key="key" class="typ-btn"
                            :class="{ active: form.typ === key }" :style="form.typ === key
                                ? `background:${type.highlight};color:${type.color};border-color:${type.color}`
                                : ''" @click="form.typ = key">
                            <span>{{ type.icon }}</span>
                            <span>{{ type.label }}</span>
                        </button>
                    </div>

                    <div class="form-grid" style="margin-top:var(--space-4)">
                        <!-- Date + Actual -->
                        <div class="form-group">
                            <label class="form-label">Date *</label>
                            <input class="form-input" type="date" v-model="form.date" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Planned Hours (h/Day)</label>
                            <input class="form-input" type="number" step="0.5" min="0" max="24"
                                v-model.number="form.plannedHours" />
                        </div>

                        <!-- Gross Preview -->
                        <div v-if="showTimeFields
                            && form.timeEntries?.some(entry => entry.start && entry.end)
                            && store.grossHourlyRate > 0" class="preview-bar">
                            <span class="form-label">Preview Salary</span>
                            <strong class="preview-salary">
                                {{ mask(grossPreview.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })) }}
                            </strong>
                        </div>

                        <!-- TimeEntry - only on Work/ Homeoffice -->
                        <template v-if="showTimeFields">
                            <div class="form-group full">
                                <label class="form-label">Time Entries</label>

                                <div class="time-blocks">
                                    <div v-for="(block, index) in form.timeEntries" :key="index" class="time-block">
                                        <span class="block-label">Block {{ index + 1 }}</span>

                                        <div class="block-fields">
                                            <div class="form-group">
                                                <label class="form-label">Start</label>
                                                <input class="form-input" type="time" v-model="block.start" />
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">End</label>
                                                <input class="form-input" type="time" v-model="block.end" />
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">Pause (min)</label>
                                                <input class="form-input" type="number" min="0" max="240"
                                                    v-model.number="block.pause" />
                                            </div>
                                        </div>

                                        <button v-if="form.timeEntries.length > 1"
                                            class="btn btn-ghost btn-sm block-remove" @click="removeBlock(index)"
                                            title="Remove Entry">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <button class="btn btn-secondary btn-sm add-block-btn" @click="addBlock">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add new time entry
                                </button>
                            </div>
                        </template>

                        <!-- Out-of-Office Message -->
                        <div v-else class="form-group full">
                            <div class="absence-hint">
                                <span>{{ currentType.icon }}</span>
                                <span>{{ currentType.label }} — Actual is automatically interpreted as Planned ({{
                                    form.plannedDay }}h)</span>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div class="form-group full">
                            <label class="form-label">Notes</label>
                            <input class="form-input" type="text" maxlength="200" v-model="form.notes"
                                :placeholder="`e.g., ${currentType.label}${form.typ === 'vacation' ? ', approved' : ''}`" />
                        </div>

                        <!-- Remarks -->
                        <div class="form-group full">
                            <label class="form-label">Remarks</label>
                            <textarea class="form-input form-textarea" v-model="form.remarks" rows="4" maxlength="2000"
                                placeholder="Longer daily notes, observations, notable events ..." />
                        </div>

                        <!-- Preview Total-Actual -->
                        <div v-if="showTimeFields && previewIst > 0" class="preview-bar">
                            <span class="form-label">Preview Actual total:</span>
                            <strong>{{ formatHours(previewActual) }}</strong>
                            <span class="preview-hint">
                                over {{form.timeEntries.filter(entry => entry.start && entry.end).length}} entries
                            </span>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <template v-if="editEntry">
                            <!-- Confirmation status -->
                            <template v-if="pendingDelete">
                                <span class="delete-confirm-label">Are you sure you want to delete this?</span>
                                <button class="btn btn-danger btn-sm" @click="deleteAndClose">Yes, delete</button>
                                <button class="btn btn-secondary btn-sm" @click="cancelDelete">Cancel</button>
                            </template>

                            <!-- Normal condition -->
                            <button v-else class="btn btn-ghost btn-sm delete-btn" @click="askDelete"
                                style="margin-right:auto">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                </svg>
                                Delete
                            </button>
                        </template>

                        <template v-if="!pendingDelete">
                            <button class="btn btn-secondary" @click="close">Cancel</button>
                            <button class="btn btn-primary" @click="save">
                                {{ editEntry ? 'Update' : 'Add' }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { calcActualHours, formatHours, today } from '@/composables/useTime'
import { ABSENCE_TYPES, getAbsenceType } from '@/composables/useAbsence'
import { usePrivacy } from '@/composables/usePrivacy'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    editEntry: { type: Object, default: null },
    prefillDate: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue'])
const store = useZeitwerkStore()
const { showToast } = useToast()
const { mask } = usePrivacy()

const defaultForm = () => ({
    date: today(),
    typ: 'on-site',
    timeEntries: [{ start: '', end: '', pause: store.settings.defaultBreak }],
    plannedHours: store.settings.hoursPerDay,
    notes: '',
    remarks: '',
})
const form = ref(defaultForm())

watch(() => props.modelValue, open => {
    if (!open)
        return

    form.value = props.editEntry
        ? { ...props.editEntry }
        : { ...defaultForm(), date: props.prefillDate ?? today() }
})

const currentType = computed( () => getAbsenceType(form.value.typ ?? 'on-site') )
const showTimeFields = computed( () => currentType.value.counter )
const previewActual = computed( () => calcActualHours(form.value) )

// show salary
const grossPreview = computed(() => {
    if (!showTimeFields.value)
        return 0
    return store.grossEarnedForEntry(form.value)
})

// timeEntries helper
function addBlock() {
    form.value.timeEntries.push({ start: '', end: '', pause: 0 })
}

function removeBlock(index) {
    if (form.value.timeEntries.length <= 1)
        return
    form.value.timeEntries.splice(index, 1)
}

// delete with confirmation + Toast
const pendingDelete = ref(false)

function askDelete() { pendingDelete.value = true }
function cancelDelete() { pendingDelete.value = false }

function deleteAndClose() {
    if (!props.editEntry)
        return
    store.deleteEntry(props.editEntry.id)
    showToast('Deleted entry.', 'ok')
    close()
}

// reset on closing
function close() {
    pendingDelete.value = false
    emit('update:modelValue', false)
}

// save new or updated entry
function save() {
    if (!form.value.date) {
        showToast('Please select a date.', 'error')
        return
    }

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

<style scoped>
/* Modal */
.modal-content {
    max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}

/* Preview Bar */
.preview-bar {
    margin-top: var(--space-4);
    padding-top: var(--space-1);
    padding-bottom: var(--space-2);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
    display: flex;
    gap: var(--space-3);
}

.preview-salary {
    color: var(--color-gold);
}

.preview-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
}

/* Type Selector */
.typ-selector {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.typ-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    font-size: var(--text-xs);
    font-weight: 500;
    background: var(--color-surface-offset);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all var(--transition);
}

.typ-btn:hover {
    background: var(--color-surface-dynamic);
    color: var(--color-text);
}

.typ-btn.active {
    font-weight: 600;
}

/* Out-of-Office Message */
.absence-hint {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-offset);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
}

/* Time Blocks */
.time-blocks {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
}

.time-block {
    position: relative;
    padding: var(--space-4);
    background: var(--color-surface-offset);
    border: 1px solid var(--color-divider);
    border-radius: var(--radius-md);
}

.block-label {
    display: block;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-3);
}

.block-fields {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-3);
}

.block-remove {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    color: var(--color-text-faint);
}

.block-remove:hover {
    color: var(--color-error);
}

/* Add Block Button */
.add-block-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border-style: dashed;
}

/* Delete Button */
.delete-btn {
    color: var(--color-text-faint);
}

.delete-btn:hover {
    color: var(--color-error);
}

.delete-confirm-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-error);
    margin-right: auto;
}

/* Remarks */
.form-textarea {
    min-height: 110px;
    resize: vertical;
}

/* Mobile */
@media (max-width: 767px) {
    .modal-content {
        width: 100%;
        max-width: 100%;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 92dvh;
    }
}
</style>
