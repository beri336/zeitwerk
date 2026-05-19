<!-- src/components/MonthTable.vue -->

<script setup>
import { ref } from 'vue'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useToast } from '@/composables/useToast'
import { calcActualHours, formatHours, formatDate } from '@/composables/useTime'
import { getAbsenceType } from '@/composables/useAbsence'

const emit = defineEmits(['edit'])

const store = useZeitwerkStore()
const { showToast } = useToast()

const editCell = ref(null)

function startEdit(entry, field) {
    editCell.value = { id: entry.id, field, value: entry[field] }
}

function saveEdit(entry) {
    if (!editCell.value)
        return
    
    store.patchEntryField(entry.id, editCell.value.field, editCell.value.value)
    editCell.value = null
}

function cancelEdit() { editCell.value = null }

function rowStyle(entry) {
    const type = getAbsenceType(entry.typ ?? 'work')
    if (entry.typ && entry.typ !== 'work') {
        return `border-left: 3px solid ${type.color}`
    }
    
    return ''
}

function actualVariant(entry) {
    const Actual = store.effectiveActualHours(entry)
    const planned = entry.plannedHours || store.settings.hoursPerDay

    if (Actual >= planned - 0.1)
        return 'cell-ok'
    if (Actual > 0)
        return 'cell-warn'
    
    return ''
}

// Delete handler with confirmation
const pendingDelete = ref(null)

function askDelete(id) {
    pendingDelete.value = id
}

function confirmDelete() {
    store.deleteEntry(pendingDelete.value)
    showToast('Entry deleted.', 'ok')
    pendingDelete.value = null
}

function cancelDelete() {
    pendingDelete.value = null
}

// v-focus directive via defineOptions
</script>

<template>
    <!-- Month Table -->
    <div class="table-wrap">
        <div class="table-header">
            <div class="table-title">Working time {{ store.currMonthLabel }}</div>
            <div class="table-badges">
                <span class="badge badge-ok">{{ formatHours(store.monthActual) }} Actual</span>
                <span class="badge badge-neu">{{ formatHours(store.monthPlanned) }} Planned</span>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="store.entriesForMonth.length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01" />
            </svg>
            <h3>No entries for {{ store.currMonthLabel }}</h3>
            <p>Add your first time entry.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-scroll">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time Entries</th>
                        <th>Pauses</th>
                        <th class="num">Actual (Day)</th>
                        <th class="num">Planned (Day)</th>
                        <th>Notes</th>
                        <th class="actions-header">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(group, gi) in store.weekGroups" :key="group.kw">
                        <!-- Entry rows -->
                        <tr v-for="(entry, ei) in group.entries"
                            :key="entry.id"
                            :class="{ 'week-separator': ei === 0 && gi > 0 }"
                            :style="rowStyle(entry)">
                            <td>
                                <div style="display:flex;align-items:center;gap:var(--space-2);">
                                    <span v-if="entry.typ && entry.typ !== 'work'" class="typ-chip"
                                        :style="`background:${getAbsenceType(entry.typ).highlight};color:${getAbsenceType(entry.typ).color}`">
                                        {{ getAbsenceType(entry.typ).icon }} {{ getAbsenceType(entry.typ).label }}
                                    </span>
                                    <span>{{ formatDate(entry.date) }}</span>
                                </div>
                            </td>

                            <!-- Inline editable cells -->
                            <td>
                                <div class="time-stack">
                                    <span v-for="(b, i) in (entry.timeEntries ?? [])" :key="i" class="time-line">
                                        {{ b.start || '—' }}–{{ b.end || '—' }}
                                    </span>
                                    <span v-if="!entry.timeEntries?.length">—</span>
                                </div>
                            </td>

                            <!-- Pauses: sum of all entries -->
                            <td>
                                {{entry.timeEntries?.length
                                    ? entry.timeEntries.reduce((s, b) => s + (b.pause ?? 0), 0) + 'min'
                                : '—'
                                }}
                            </td>

                            <!-- Actual Hours -->
                            <td class="num"><span :class="actualVariant(entry)">{{ formatHours(store.effectiveActualHours(entry)) }}</span></td>
                            <td class="num">{{ formatHours(entry.plannedHours || store.settings.hoursPerDay) }}</td>

                            <!-- Notes -->
                            <td class="editable" @click="startEdit(entry, 'notes')" style="max-width:180px">
                                <input v-if="editCell?.id === entry.id && editCell?.field === 'notes'" type="text"
                                    class="inline-input" v-model="editCell.value" @blur="saveEdit(entry)"
                                    @keyup.enter="saveEdit(entry)" @keyup.escape="cancelEdit" autofocus
                                    style="min-width:120px" />
                                <span v-else class="cell-truncate">{{ entry.notes || '—' }}</span>
                            </td>

                            <!-- Row actions -->
                            <td class="actions-cell">
                                <div class="row-actions">
                                    <button class="btn btn-ghost btn-sm" @click="emit('edit', entry)"
                                        title="Edit">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>

                                    <!-- Delete: normal button or confirmation -->
                                    <template v-if="pendingDelete === entry.id">
                                        <button class="btn btn-danger btn-sm" @click="confirmDelete" title="Confirm">
                                            ✓
                                        </button>
                                        <button class="btn btn-ghost btn-sm" @click="cancelDelete" title="Cancel">
                                            ✕
                                        </button>
                                    </template>
                                    <button v-else class="btn btn-ghost btn-sm" @click="askDelete(entry.id)"
                                        title="Delete" style="color:var(--color-text-faint)">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14H6L5 6" />
                                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <!-- Week total row -->
                        <tr class="week-total-row">
                            <td colspan="5" style="padding-left:var(--space-3)">
                                <span class="week-label">KW {{ group.kw }} · Week Total</span>
                            </td>
                            <td class="num" :class="group.ActualDiff >= 0 ? 'cell-ok' : 'cell-warn'">{{ formatHours(group.actual) }}
                            </td>
                            <td class="num">{{ formatHours(group.planned) }}</td>
                            <td colspan="2" class="num" :class="group.ActualDiff >= 0 ? 'cell-ok' : 'cell-warn'">
                                {{ group.ActualDiff >= 0 ? '+' : '' }}{{ formatHours(group.ActualDiff) }}
                            </td>
                        </tr>
                    </template>
                </tbody>

                <!-- Month total row -->
                <tfoot>
                    <tr class="month-total-row">
                        <td colspan="5">Month Total</td>
                        <td class="num" :class="store.monthDiff >= 0 ? 'cell-ok' : 'cell-err'">{{ formatHours(store.monthActual) }}</td>
                        <td class="num">{{ formatHours(store.monthPlanned) }}</td>
                        <td colspan="2" class="num" :class="store.monthDiff >= 0 ? 'cell-ok' : 'cell-err'">
                            {{ store.monthDiff >= 0 ? '+' : '' }}{{ formatHours(store.monthDiff) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<style scoped>
.table-wrap {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-divider);
}

.table-title {
    font-size: var(--text-base);
    font-weight: 600;
}

.table-badges {
    display: flex;
    gap: var(--space-2);
}

.table-scroll {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    font-size: var(--text-xs);
}

.data-table thead {
    background: var(--color-surface-offset);
}

.data-table th {
    padding: var(--space-2) var(--space-3);
    text-align: left;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
}

.data-table th.actions-header {
    text-align: center;
    min-width: 100px;
    position: sticky;
    right: 0;
    background: var(--color-surface-offset);
    border-left: 1px solid var(--color-border);
    z-index: 3;
}

.data-table td {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-divider);
    font-variant-numeric: tabular-nums lining-nums;
    vertical-align: middle;
}

.data-table td.actions-cell {
    position: sticky;
    right: 0;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    z-index: 2;
}

.data-table tr:last-child td {
    border-bottom: none;
}

.data-table tr:hover td {
    background: var(--color-surface-offset);
}

.row-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
    min-width: 100px;
}

.actions-cell {
    min-width: 100px;
    text-align: center;
}

.row-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.row-actions button:hover {
    background: var(--color-surface-offset);
    border-color: var(--color-border);
}

.row-actions button svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-muted);
}

.row-actions button:hover svg {
    color: var(--color-text);
}

.row-actions button.btn-danger {
    color: var(--color-error);
}

.row-actions button.btn-danger svg {
    color: var(--color-error);
}

.editable {
    cursor: pointer;
}

.editable:hover {
    background: var(--color-primary-highlight) !important;
}

.num {
    text-align: right;
}

.cell-ok {
    color: var(--color-success);
    font-weight: 500;
}

.cell-warn {
    color: var(--color-warning);
    font-weight: 500;
}

.cell-err {
    color: var(--color-error);
}

.cell-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 180px;
}

.inline-input {
    width: 100%;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface-2);
    color: var(--color-text);
    font-size: var(--text-xs);
    outline: none;
    min-width: 70px;
}

.inline-input:focus {
    box-shadow: 0 0 0 2px var(--color-primary-highlight);
}

.week-separator td {
    border-top: 2px solid var(--color-primary-highlight);
}

.week-total-row td {
    font-weight: 600;
    background: var(--color-surface-2);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
}

.week-label {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
}

.month-total-row td {
    background: var(--color-surface-offset);
    border-top: 2px solid var(--color-border);
    font-weight: 700;
    font-size: var(--text-sm);
    padding: var(--space-3);
}

.row-actions {
    display: flex;
    gap: var(--space-1);
    opacity: 0;
    transition: opacity var(--transition);
}

:deep(tr:hover) .row-actions {
    /* Force :deep() so that scoped CSS matches the tr selector */
    opacity: 1;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-12) var(--space-8);
    color: var(--color-text-muted);
}

.empty-icon {
    width: 48px;
    height: 48px;
    color: var(--color-text-faint);
    margin-bottom: var(--space-4);
}

.empty-state h3 {
    color: var(--color-text);
    margin-bottom: var(--space-2);
    font-size: var(--text-base);
}

.empty-state p {
    max-width: 36ch;
    font-size: var(--text-sm);
}

/* Absence type chip */
.typ-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px var(--space-2);
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
}

/* Button delete confirmation */
.btn-danger {
    background: var(--color-error-highlight);
    color: var(--color-error);
}

.btn-danger:hover {
    background: var(--color-error);
    color: var(--color-text-inverse);
}

/* Time entries stack */
.time-stack {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.time-line {
    display: block;
    font-variant-numeric: tabular-nums;
    font-size: var(--text-xs);
    white-space: nowrap;
}
</style>
