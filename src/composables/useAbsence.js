// src/composables/useAbsence.js

export const ABSENCE_TYPES = {
    work: {
        label: 'Work',
        color: 'var(--color-primary)',
        highlight: 'var(--color-primary-highlight)',
        counter: true,   // counts as actual time
        icon: '💼'
    },
    vacation: {
        label: 'Vacation',
        color: 'var(--color-gold, #d19900)',
        highlight: 'var(--color-gold-highlight, #e9e0c6)',
        counter: false,  // actual = planned (auto-filled)
        icon: '🏖️'
    },
    sick: {
        label: 'Sick',
        color: 'var(--color-error)',
        highlight: 'var(--color-error-highlight)',
        counter: false,
        icon: '🤒'
    },
    publicholiday: {
        label: 'Public Holiday',
        color: 'var(--color-blue)',
        highlight: 'var(--color-blue-highlight)',
        counter: false,
        icon: '🎉'
    },
    homeoffice: {
        label: 'Homeoffice',
        color: 'var(--color-success)',
        highlight: 'var(--color-success-highlight)',
        counter: true,
        icon: '🏠'
    },
    other: {
        label: 'Other',
        color: 'var(--color-text-muted)',
        highlight: 'var(--color-surface-offset)',
        counter: false,
        icon: '📋'
    }
}

export function getAbsenceType(key) {
    return ABSENCE_TYPES[key] ?? ABSENCE_TYPES.work
}

// Helper: for absent entries without times, return planned hours when the absence type
// does not count toward actuals; otherwise return null to indicate normal calculation.
export function effectiveActualFallback(entry, defaultPlanned) {
    const type = getAbsenceType(entry.typ ?? 'work')
    if (!type.counter)
        return entry.plannedDay ?? defaultPlanned
    return null
}
