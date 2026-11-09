// src/composables/useAbsence.js

export const ABSENCE_TYPES = {
    'on-site': {
        // label: 'On Site',
        color: 'var(--absence-office)',
        highlight: 'var(--absence-office-bg)',
        counter: true,
    },
    homeoffice: {
        // label: 'Homeoffice',
        color: 'var(--absence-home)',
        highlight: 'var(--absence-home-bg)',
        counter: true,
    },
    vacation: {
        // label: 'Vacation',
        color: 'var(--absence-vacation)',
        highlight: 'var(--absence-vacation-bg)',
        counter: false,
    },
    sick: {
        // label: 'Sick',
        color: 'var(--absence-sick)',
        highlight: 'var(--absence-sick-bg)',
        counter: false,
    },
    publicholiday: {
        // label: 'Public Holiday',
        color: 'var(--absence-holiday)',
        highlight: 'var(--absence-holiday-bg)',
        counter: false,
    },
    other: {
        // label: 'Other',
        color: 'var(--absence-other)',
        highlight: 'var(--absence-other-bg)',
        counter: false,
    }
}

export function getAbsenceType(key) {
    return ABSENCE_TYPES[key] ?? ABSENCE_TYPES.work
}

// Helper: for absent entries without times, return planned hours when the absence type
// does not count toward actuals; otherwise return null to indicate normal calculation.
export function effectiveActualFallback(entry, defaultPlanned) {
    const type = getAbsenceType(entry.typ ?? 'on-site')
    if (!type.counter)
        return entry.plannedHours ?? defaultPlanned
    return null
}

export function countAbsenceTypes(entries) {
    return entries.reduce((counts, entry) => {
        const type = entry.typ ?? 'on-site'
        if (Object.prototype.hasOwnProperty.call(counts, type))
            counts[type] += 1
        return counts
    }, {
        'on-site': 0,
        homeoffice: 0,
        vacation: 0,
        sick: 0,
        publicholiday: 0,
        other: 0
    })
}
