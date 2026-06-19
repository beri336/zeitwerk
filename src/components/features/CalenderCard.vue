<!-- src/components/features/CalenderCard.vue -->

<template>
    <main class="main">
        <div class="cal-wrapper">

            <!-- Header -->
            <header class="cal-header">
                <div class="cal-header-left">
                    <h1 class="cal-title">Appointments</h1>
                    <span class="cal-badge">{{ monthEvents.length }} Events</span>
                </div>
                <div class="cal-header-right">
                    <button class="btn btn-ghost btn-sm" @click="goToday">Today</button>
                    <div class="nav-group">
                        <button class="icon-btn" @click="prevMonth">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16"
                                height="16">
                                <path fill-rule="evenodd"
                                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                        <span class="cal-month-label">{{ monthLabel }}</span>
                        <button class="icon-btn" @click="nextMonth">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16"
                                height="16">
                                <path fill-rule="evenodd"
                                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openModal()">+ Add new Event</button>
                </div>
            </header>

            <!-- View Toggle -->
            <div class="view-toggle">
                <button v-for="v in views" :key="v.key" class="filter-btn" :class="{ active: activeView === v.key }"
                    @click="activeView = v.key">
                    {{ v.label }}
                </button>
            </div>

            <!-- Month View -->
            <template v-if="activeView === 'month'">
                <!-- Weekday Labels -->
                <div class="cal-grid-header">
                    <span v-for="day in weekdays" :key="day" class="cal-weekday">{{ day }}</span>
                </div>

                <!-- Day Grid -->
                <div class="cal-grid">
                    <div v-for="cell in calendarCells" :key="cell.key" class="cal-cell" :class="{
                        'cal-cell--outside': !cell.currentMonth,
                        'cal-cell--today': cell.isToday,
                        'cal-cell--selected': selectedDate && cell.dateStr === selectedDate,
                    }" @click="selectDay(cell.dateStr)">
                        <span class="cal-day-num">{{ cell.day }}</span>
                        <div class="cal-cell-events">
                            <div v-for="evt in cell.events.slice(0, 3)" :key="evt.id" class="cal-event-pill"
                                :style="{ background: evt.color + '33', borderColor: evt.color, color: evt.color }"
                                @click.stop="openModal(evt.id)" :title="evt.title">
                                <span v-if="evt.allDay" class="pill-dot"></span>
                                <span v-else class="pill-time">{{ evt.startTime }}</span>
                                {{ evt.title }}
                            </div>
                            <span v-if="cell.events.length > 3" class="cal-more">
                                +{{ cell.events.length - 3 }} mehr
                            </span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Week View -->
            <template v-else-if="activeView === 'week'">
                <div class="week-grid">
                    <div v-for="day in weekCells" :key="day.dateStr" class="week-col"
                        :class="{ 'week-col--today': day.isToday }" @click="selectDay(day.dateStr)">
                        <div class="week-col-header">
                            <span class="week-wd">{{ day.weekday }}</span>
                            <span class="week-num" :class="{ 'week-num--today': day.isToday }">{{ day.day }}</span>
                        </div>
                        <div class="week-col-events">
                            <div v-for="event in day.events" :key="event.id" class="week-event"
                                :style="{ background: event.color + '22', borderLeft: `3px solid ${event.color}` }"
                                @click.stop="openModal(event.id)">
                                <span class="week-event-time" v-if="!event.allDay">{{ event.startTime }}{{ event.endTime
                                    ? ' – ' + event.endTime : '' }}</span>
                                <span class="week-event-title">{{ event.title }}</span>
                            </div>
                            <div v-if="day.events.length === 0" class="week-empty-hint"></div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Agenda View -->
            <template v-else-if="activeView === 'agenda'">
                <div class="agenda-list">
                    <template v-if="agendaGroups.length">
                        <div v-for="group in agendaGroups" :key="group.label" class="agenda-group">
                            <div class="agenda-group-label">{{ group.label }}</div>
                            <div v-for="event in group.events" :key="event.id" class="agenda-item"
                                :style="{ borderLeftColor: event.color }" @click="openModal(event.id)">
                                <div class="agenda-item-main">
                                    <span class="agenda-item-title">{{ event.title }}</span>
                                    <span v-if="event.location" class="agenda-item-meta">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                                            width="11" height="11">
                                            <path fill-rule="evenodd"
                                                d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.173 15.173 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.174 15.174 0 0 0 2.046 2.082 8.597 8.597 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        {{ event.location }}
                                    </span>
                                    <span v-if="event.tags.length" class="agenda-item-tags">
                                        <span v-for="tag in event.tags" :key="tag" class="tag tag--sm">{{ tag }}</span>
                                    </span>
                                </div>
                                <div class="agenda-item-time">
                                    <span v-if="event.allDay">Ganztägig</span>
                                    <span v-else>{{ event.startTime }}{{ event.endTime ? ' – ' + event.endTime : ''
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else class="todo-empty">
                        <p>No appointments this month.</p>
                    </div>
                </div>
            </template>

            <!-- Day Detail Sidebar (Month + Week) -->
            <Transition name="slide-up">
                <div v-if="selectedDate && activeView !== 'agenda'" class="day-detail">
                    <div class="day-detail-header">
                        <span class="day-detail-label">{{ selectedDateLabel }}</span>
                        <button class="btn btn-primary btn-sm" @click="openModal(null, selectedDate)">+ Add new
                            Event</button>
                        <button class="icon-btn" @click="selectedDate = null">✕</button>
                    </div>
                    <div v-if="selectedEvents.length" class="day-detail-list">
                        <div v-for="event in selectedEvents" :key="event.id" class="day-detail-item"
                            :style="{ borderLeftColor: event.color }" @click="openModal(event.id)">
                            <div class="day-detail-item-main">
                                <span class="day-detail-title">{{ event.title }}</span>
                                <span v-if="event.description" class="day-detail-desc">{{ event.description }}</span>
                                <div class="day-detail-meta">
                                    <span v-if="event.location" class="meta-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                                            width="11" height="11">
                                            <path fill-rule="evenodd"
                                                d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.173 15.173 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.174 15.174 0 0 0 2.046 2.082 8.597 8.597 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        {{ event.location }}
                                    </span>
                                    <span v-if="!event.allDay" class="meta-item">
                                        🕐 {{ event.startTime }}{{ event.endTime ? ' – ' + event.endTime : '' }}
                                    </span>
                                    <span v-else class="meta-item">Ganztägig</span>
                                    <span v-for="tag in event.tags" :key="tag" class="tag tag--sm">{{ tag }}</span>
                                </div>
                            </div>
                            <div class="day-detail-actions">
                                <button class="icon-btn icon-btn--danger" @click.stop="removeEvent(event.id)">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        width="13" height="13">
                                        <path fill-rule="evenodd"
                                            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="day-detail-empty">No appointments this month.</div>
                </div>
            </Transition>

        </div>

        <!-- Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="modal.open" class="modal-backdrop" @mousedown.self="closeModal">
                    <div class="modal">
                        <header class="modal-header">
                            <h2 class="modal-title">{{ modal.editId ? 'Termin bearbeiten' : 'Neuer Termin' }}</h2>
                            <button class="icon-btn" @click="closeModal">✕</button>
                        </header>

                        <div class="modal-body">
                            <!-- Title -->
                            <div class="field">
                                <label class="field-label">Title *</label>
                                <input v-model="form.title" class="form-input" type="text"
                                    placeholder="e.g., Team Meeting" />
                            </div>

                            <!-- Description -->
                            <div class="field">
                                <label class="field-label">Description</label>
                                <textarea v-model="form.description" class="form-input form-textarea"
                                    placeholder="Optional Details..." rows="2"></textarea>
                            </div>

                            <!-- Date -->
                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Date *</label>
                                    <input v-model="form.date" class="form-input" type="date" />
                                </div>
                                <div class="field field--checkbox">
                                    <label class="field-label">All-day</label>
                                    <button class="urgent-toggle" :class="{ active: form.allDay }"
                                        @click="form.allDay = !form.allDay">
                                        {{ form.allDay ? 'Yes' : 'No' }}
                                    </button>
                                </div>
                            </div>

                            <!-- Time -->
                            <div v-if="!form.allDay" class="field-row">
                                <div class="field">
                                    <label class="field-label">From</label>
                                    <input v-model="form.startTime" class="form-input" type="time" />
                                </div>
                                <div class="field">
                                    <label class="field-label">To</label>
                                    <input v-model="form.endTime" class="form-input" type="time" />
                                </div>
                            </div>

                            <!-- Location -->
                            <div class="field">
                                <label class="field-label">Location</label>
                                <input v-model="form.location" class="form-input" type="text"
                                    placeholder="Address or Online Link" />
                            </div>

                            <!-- Color -->
                            <div class="field">
                                <label class="field-label">Color</label>
                                <div class="color-selector">
                                    <button v-for="colour in colorOptions" :key="colour" class="color-btn"
                                        :style="{ background: colour, borderColor: form.color === colour ? '#fff' : colour }"
                                        @click="form.color = colour">
                                        <svg v-if="form.color === colour" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20" fill="white" width="12" height="12">
                                            <path fill-rule="evenodd"
                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="field">
                                <label class="field-label">Tags</label>
                                <div class="tag-input-wrapper">
                                    <span v-for="tag in form.tags" :key="tag" class="tag tag--removable">
                                        {{ tag }}
                                        <button class="tag-remove" @click="removeTag(tag)">×</button>
                                    </span>
                                    <input v-model="tagInput" class="tag-input" type="text" placeholder="Tag + Enter"
                                        @keydown.enter.prevent="addTag" @keydown.188.prevent="addTag" />
                                </div>
                            </div>

                            <!-- Reminder -->
                            <div class="field">
                                <label class="field-label">Reminder</label>
                                <select v-model="form.reminder" class="form-input form-select">
                                    <option value="">None</option>
                                    <option value="0">At the time</option>
                                    <option value="5">5 minutes before</option>
                                    <option value="15">15 minutes before</option>
                                    <option value="30">30 minutes before</option>
                                    <option value="60">1 hour before</option>
                                    <option value="1440">1 day before</option>
                                </select>
                            </div>
                        </div>

                        <footer class="modal-footer">
                            <button v-if="modal.editId" class="btn btn-danger"
                                @click="removeEvent(modal.editId); closeModal()">
                                Delete
                            </button>
                            <div class="modal-footer-right">
                                <button class="btn btn-ghost" @click="closeModal">Cancel</button>
                                <button class="btn btn-primary" :disabled="!form.title.trim() || !form.date"
                                    @click="saveModal">
                                    {{ modal.editId ? 'Save' : 'Create' }}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </main>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useCalendarStore } from '@/composables/useCalendarStore'
import { storeToRefs } from 'pinia'

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

const activeView = ref('month')
const selectedDate = ref(null)
const calendarStore = useCalendarStore()
const { events } = storeToRefs(calendarStore)

const views = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'agenda', label: 'Agenda' },
]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const colorOptions = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#a855f7', '#f97316',
]

// Navigation
function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
    } else {
        currentMonth.value--
    }
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
    } else {
        currentMonth.value++
    }
}

function goToday() {
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth()
    selectedDate.value = toDateStr(today)
}

// Helpers
function toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr() { return toDateStr(today) }

function eventsForDate(dateStr) {
    return events
        .value
        .filter(e => e.date === dateStr)
        .sort((a, b) => (a.allDay ? -1 : 1) || a.startTime.localeCompare(b.startTime))
}

// Calendar Grid
const calendarCells = computed(() => {
    const year = currentYear.value
    const month = currentMonth.value
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)

    // Monday-first: 0=Mo ... 6=So
    const startDow = (first.getDay() + 6) % 7
    const cells = []

    // days from previous month
    for (let index = startDow - 1; index >= 0; index--) {
        const date = new Date(year, month, -index)
        const dateStr = toDateStr(date)

        cells.push({
            key: dateStr,
            day: date.getDate(), dateStr,
            currentMonth: false,
            isToday: false,
            events: eventsForDate(dateStr)
        })
    }

    // current month
    for (let index = 1; index <= last.getDate(); index++) {
        const date = new Date(year, month, index)
        const dateStr = toDateStr(date)

        cells.push({
            key: dateStr,
            day: index,
            dateStr,
            currentMonth: true,
            isToday: dateStr === todayStr(),
            events: eventsForDate(dateStr)
        })
    }

    // Fill to 42 cells (6 rows)
    const remaining = 42 - cells.length
    for (let index = 1; index <= remaining; index++) {
        const date = new Date(year, month + 1, index)
        const dateStr = toDateStr(date)

        cells.push({
            key: dateStr,
            day: date.getDate(),
            dateStr,
            currentMonth: false,
            isToday: false,
            events: eventsForDate(dateStr)
        })
    }

    return cells
})

// Week Grid
const weekCells = computed(() => {
    // use selectedDate or today as anchor
    const anchor = selectedDate.value
        ? new Date(selectedDate.value + 'T00:00')
        : today

    const dow = (anchor.getDay() + 6) % 7 // 0=Mo
    const monday = new Date(anchor)
    monday.setDate(anchor.getDate() - dow)

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + index)
        const dateStr = toDateStr(date)
        return {
            dateStr,
            day: date.getDate(),
            weekday: weekdays[index],
            isToday: dateStr === todayStr(),
            events: eventsForDate(dateStr),
        }
    })
})

// Agenda Groups
const agendaGroups = computed(() => {
    if (!events.value) // guard
        return []

    const year = currentYear.value
    const month = currentMonth.value
    const map = new Map()

    events.value
        .filter(entry => {
            const date = new Date(entry.date + 'T00:00')
            return date.getFullYear() === year && date.getMonth() === month
        })
        .sort((first, second) => first.date.localeCompare(second.date) || first.startTime.localeCompare(second.startTime))
        .forEach(entry => {
            const label = new Date(entry.date + 'T00:00').toLocaleDateString('de-DE', {
                weekday: 'long', day: '2-digit', month: 'long'
            })
            if (!map.has(label))
                map.set(label, [])

            map.get(label).push(entry)
        })

    return [...map.entries()]
        .map(([label, evts]) => ({ label, events: evts }))
})

const monthEvents = computed(() => {
    if (!events.value) // guard
        return []

    const year = currentYear.value, month = currentMonth.value

    return events.value.filter(entry => {
        const date = new Date(entry.date + 'T00:00')

        return date.getFullYear() === year && date.getMonth() === month
    })
})

// Selected Day
function selectDay(dateStr) {
    selectedDate.value = selectedDate.value === dateStr
        ? null
        : dateStr
}

const selectedEvents = computed(() =>
    selectedDate.value
        ? eventsForDate(selectedDate.value)
        : []
)

const selectedDateLabel = computed(() => {
    if (!selectedDate.value)
        return ''

    return new Date(selectedDate.value + 'T00:00').toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
})

const monthLabel = computed(() =>
    new Date(currentYear.value, currentMonth.value, 1)
        .toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
)

// Modal
const modal = reactive({ open: false, editId: null })
const tagInput = ref('')

const defaultForm = () => ({
    title: '',
    description: '',
    date: toDateStr(today),
    allDay: false,
    startTime: '08:00',
    endTime: '16:00',
    location: '',
    color: '#6366f1',
    tags: [],
    reminder: '',
})

const form = reactive(defaultForm())

function openModal(editId = null, prefillDate = null) {
    Object.assign(form, defaultForm())
    tagInput.value = ''
    modal.editId = editId

    if (editId) {
        const event = events.value.find(e => e.id === editId)

        if (event)
            Object.assign(form, {
                ...event,
                tags: [...event.tags]
            })
    } else if (prefillDate) {
        form.date = prefillDate
    } else if (selectedDate.value) {
        form.date = selectedDate.value
    }

    modal.open = true
}

function closeModal() { modal.open = false }

function saveModal() {
    if (!form.title.trim() || !form.date)
        return

    if (modal.editId) {
        const index = events.value.findIndex(e => e.id === modal.editId)
        if (index !== -1)
            events.value[index] = {
                ...events.value[index],
                ...form,
                tags: [...form.tags]
            }
    } else {
        events.value.push({
            id: calendarStore.getNextId(),
            title: form.title.trim(),
            description: form.description,
            date: form.date,
            allDay: form.allDay,
            startTime: form.allDay ? '' : form.startTime,
            endTime: form.allDay ? '' : form.endTime,
            location: form.location,
            color: form.color,
            tags: [...form.tags],
            reminder: form.reminder,
        })
    }
    closeModal()
}

function removeEvent(id) {
    events.value = events.value.filter(e => e.id !== id)
}

// Tag helpers
function addTag() {
    const tag = tagInput.value.trim().replace(/,$/, '')
    if (tag && !form.tags.includes(tag))
        form.tags.push(tag)

    tagInput.value = ''
}

function removeTag(tag) {
    form.tags = form.tags.filter(t => t !== tag)
}
</script>

<style scoped>
/* Layout */
.main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    min-width: 0;
    padding: var(--space-6, 2rem) var(--space-4, 1rem);
    gap: var(--space-4, 1rem);
}

.cal-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
}

/* Header */
.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.cal-header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.cal-header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.cal-title {
    font-size: var(--font-size-xl, 1.5rem);
    font-weight: 600;
    color: var(--color-text, #e2e8f0);
    margin: 0;
}

.cal-badge {
    background: var(--color-primary, #6366f1);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
}

.nav-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 3px;
}

.cal-month-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text, #e2e8f0);
    padding: 0 0.5rem;
    min-width: 140px;
    text-align: center;
}

/* View Toggle */
.view-toggle {
    display: flex;
    gap: 3px;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 4px;
    width: fit-content;
}

.filter-btn {
    padding: 0.3rem 0.85rem;
    border: none;
    border-radius: calc(var(--radius, 0.5rem) - 2px);
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.filter-btn.active {
    background: var(--color-primary, #6366f1);
    color: #fff;
}

/* Month: Weekday Header */
.cal-grid-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.cal-weekday {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.4rem 0;
}

/* Month Grid */
.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.cal-cell {
    min-height: 96px;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 6px;
    cursor: pointer;
    transition: border-color 0.15s;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
}

.cal-cell:hover {
    border-color: var(--color-primary, #6366f1);
}

.cal-cell--outside {
    opacity: 0.35;
}

.cal-cell--today {
    border-color: var(--color-gold, #6366f1);
    background: color-mix(in srgb, var(--color-gold, #6366f1) 8%, var(--color-surface, #1e2130));
}

.cal-cell--selected {
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 0 0 2px var(--color-primary, #6366f1);
}

.cal-day-num {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-muted, #94a3b8);
    line-height: 1;
}

.cal-cell--today .cal-day-num {
    background: var(--color-gold, #6366f1);
    color: #fff;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
}

.cal-cell-events {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
}

/* Event Pill */
.cal-event-pill {
    font-size: 0.68rem;
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: opacity 0.15s;
}

.cal-event-pill:hover {
    opacity: 0.8;
}

.pill-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
}

.pill-time {
    font-weight: 600;
    flex-shrink: 0;
}

.cal-more {
    font-size: 0.65rem;
    color: var(--color-text-muted, #94a3b8);
    padding: 0 3px;
}

/* Week View */
.week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.week-col {
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    display: flex;
    flex-direction: column;
    min-height: 240px;
    cursor: pointer;
    transition: border-color 0.15s;
    overflow: hidden;
}

.week-col:hover {
    border-color: var(--color-primary, #6366f1);
}

.week-col--today {
    border-color: var(--color-primary, #6366f1);
    background: color-mix(in srgb, var(--color-primary, #6366f1) 6%, var(--color-surface, #1e2130));
}

.week-col-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px 6px;
    border-bottom: 1px solid var(--color-border, #2d3148);
}

.week-wd {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-muted, #94a3b8);
    letter-spacing: 0.05em;
}

.week-num {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-text, #e2e8f0);
}

.week-num--today {
    background: var(--color-primary, #6366f1);
    color: #fff;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
}

.week-col-events {
    flex: 1;
    padding: 6px 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
}

.week-event {
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.15s;
    overflow: hidden;
}

.week-event:hover {
    opacity: 0.8;
}

.week-event-time {
    display: block;
    font-size: 0.65rem;
    color: var(--color-text-muted, #94a3b8);
    font-weight: 500;
}

.week-event-title {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text, #e2e8f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Agenda */
.agenda-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.agenda-group-label {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #94a3b8);
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--color-border, #2d3148);
    margin-bottom: 0.4rem;
}

.agenda-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-left: 3px solid;
    border-radius: var(--radius, 0.5rem);
    padding: 0.7rem 0.9rem;
    cursor: pointer;
    transition: border-color 0.15s;
}

.agenda-item:hover {
    filter: brightness(1.05);
}

.agenda-item-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
}

.agenda-item-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text, #e2e8f0);
}

.agenda-item-meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--color-text-muted, #94a3b8);
}

.agenda-item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.agenda-item-time {
    font-size: 0.78rem;
    color: var(--color-text-muted, #94a3b8);
    white-space: nowrap;
    flex-shrink: 0;
}

/* Day Detail */
.day-detail {
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.day-detail-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.day-detail-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text, #e2e8f0);
    flex: 1;
}

.day-detail-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.day-detail-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    border: 1px solid var(--color-border, #2d3148);
    border-left: 3px solid;
    border-radius: calc(var(--radius, 0.5rem) - 2px);
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    transition: border-color 0.15s;
}

.day-detail-item:hover {
    filter: brightness(1.07);
}

.day-detail-item-main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
}

.day-detail-title {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--color-text, #e2e8f0);
}

.day-detail-desc {
    font-size: 0.78rem;
    color: var(--color-text-muted, #94a3b8);
}

.day-detail-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
}

.day-detail-actions {
    flex-shrink: 0;
}

.day-detail-empty {
    font-size: 0.85rem;
    color: var(--color-text-muted, #94a3b8);
    text-align: center;
    padding: 1rem 0;
}

/* Tags */
.tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--color-surface-hover, #252840);
    color: var(--color-text-muted, #94a3b8);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: 999px;
    font-size: 0.72rem;
    padding: 2px 8px;
    white-space: nowrap;
}

.tag--sm {
    font-size: 0.65rem;
    padding: 1px 6px;
}

.tag--removable {
    background: var(--color-primary, #6366f1);
    border-color: transparent;
    color: #fff;
}

.tag-remove {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    font-size: 0.85rem;
    line-height: 1;
    opacity: 0.8;
}

.tag-remove:hover {
    opacity: 1;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 1rem;
    border: none;
    border-radius: var(--radius, 0.5rem);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
    white-space: nowrap;
}

.btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-primary {
    background: var(--color-primary, #6366f1);
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover, #4f46e5);
}

.btn-ghost {
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    border: 1px solid var(--color-border, #2d3148);
}

.btn-ghost:hover {
    color: var(--color-text, #e2e8f0);
}

.btn-danger {
    background: #dc262622;
    color: #ef4444;
    border: 1px solid #ef444444;
}

.btn-danger:hover {
    background: #dc262644;
}

.btn-sm {
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
}

.icon-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: calc(var(--radius, 0.5rem) - 2px);
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.icon-btn:hover {
    background: var(--color-surface-hover, #252840);
    color: var(--color-text, #e2e8f0);
}

.icon-btn--danger:hover {
    color: #f87171;
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--color-text-muted, #94a3b8);
}

/* Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal {
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: calc(var(--radius, 0.5rem) * 1.5);
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border, #2d3148);
}

.modal-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text, #e2e8f0);
}

.modal-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    max-height: 65vh;
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--color-border, #2d3148);
}

.modal-footer-right {
    display: flex;
    gap: 0.5rem;
}

/* Form Fields */
.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
}

.field--checkbox {
    align-items: flex-start;
}

.field-row {
    display: flex;
    gap: 0.75rem;
}

.field-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--color-text-muted, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.form-input {
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    color: var(--color-text, #e2e8f0);
    padding: 0.55rem 0.875rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
}

.form-input:focus {
    border-color: var(--color-primary, #6366f1);
}

.form-textarea {
    resize: vertical;
    min-height: 60px;
}

.form-select {
    cursor: pointer;
}

/* Color Selector */
.color-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.color-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s;
}

.color-btn:hover {
    transform: scale(1.15);
}

/* Tag Input */
.tag-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 0.4rem 0.75rem;
    min-height: 40px;
    transition: border-color 0.2s;
}

.tag-input-wrapper:focus-within {
    border-color: var(--color-primary, #6366f1);
}

.tag-input {
    background: none;
    border: none;
    outline: none;
    color: var(--color-text, #e2e8f0);
    font-size: 0.85rem;
    flex: 1;
    min-width: 80px;
}

/* Urgent Toggle */
.urgent-toggle {
    padding: 0.4rem 1rem;
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
}

.urgent-toggle.active {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 15%, transparent);
    border-color: var(--color-primary, #6366f1);
    color: var(--color-primary, #6366f1);
}

.todo-empty {
    text-align: center;
    color: var(--color-text-muted, #94a3b8);
    padding: 2rem 0;
    font-size: 0.9rem;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.96);
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
