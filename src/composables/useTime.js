// src/composables/useTime.js

export function timeToMin(time) {
    if (!time)
        return null
    
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
}

export function minToHour(min) {
    if (min === null || min === undefined || isNaN(min))
        return null
    return min / 60
}

export function calcActualMin(entry) {
    const start = timeToMin(entry.start)
    const end = timeToMin(entry.end)

    if (start === null || end === null)
        return 0
    
    let diff = end - start
    if (diff < 0)
        diff += 24 * 60 // overnight
    
    diff -= entry.defaultBreak || 0
    diff -= entry.additionalBreaks || 0
    
    return Math.max(0, diff)
}

// Calculates actual hours from time entries
export function calcActualHours(entry) {
    if (!Array.isArray(entry.timeEntries) || entry.timeEntries.length === 0)
        return 0

    return entry.timeEntries.reduce((sum, block) => {
        if (!block.start || !block.end)
            return sum
        const [sh, sm] = block.start.split(':').map(Number)
        const [eh, em] = block.end.split(':').map(Number)
        const mins = (eh * 60 + em) - (sh * 60 + sm) - (block.pause ?? 0)

        return sum + Math.max(0, mins / 60)
    }, 0)
}

export function formatHours(h) {
    if (h === null || h === undefined || isNaN(h))
        return '—'
    
    const sign = h < 0 ? '-' : ''
    const abs = Math.abs(h)
    const hh = Math.floor(abs)
    const mm = Math.round((abs - hh) * 60)
    
    return `${sign}${hh}:${String(mm).padStart(2, '0')}h`
}

export function formatDate(day) {
    if (!day)
        return '—'

    const date = new Date(day + 'T00:00:00')
    const days = ['So', 'Mo', 'Tu', 'Wed', 'Thu', 'Fr', 'Sa']
    const pad = n => String(n).padStart(2, '0')
    
    return `${days[date.getDay()]}, ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

export function getKW(dateStr) {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + 4 - (date.getDay() || 7))
    const y = new Date(date.getFullYear(), 0, 1)
    
    return Math.ceil((((date - y) / 86400000) + 1) / 7)
}

export function today() {
    const date = new Date()
    const pad = n => String(n).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]
