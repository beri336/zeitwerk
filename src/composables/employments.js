// src/composables/employments.js

export const CONTRACT_KEYS = [
    'hoursPerDay',
    'hoursPerWeek',
    'defaultBreak',
    'workDays',
    'defaultWorkplace',
    'state',
    'grossMonthlySalary',
    'vacationDaysPerYear',
    'extraVacationDays',
    'extraVacationDeadline',
    'extraVacationNoticeDays',
]

export function todayIso(date = new Date()) {
    const pad = value => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function finite(value, fallback) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}

export function createEmploymentId() {
    return `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function normalizeEmployment(raw = {}, fallback = {}) {
    const source = { ...fallback, ...raw }

    return {
        id: source.id || createEmploymentId(),
        name: String(source.name ?? '').trim().slice(0, 80),
        start: isIsoDate(source.start) ? source.start : '',
        end: isIsoDate(source.end) ? source.end : '',
        hoursPerDay: finite(source.hoursPerDay, 8),
        hoursPerWeek: finite(source.hoursPerWeek, 40),
        defaultBreak: finite(source.defaultBreak, 30),
        workDays: finite(source.workDays, 5),
        defaultWorkplace: source.defaultWorkplace === 'homeoffice' ? 'homeoffice' : 'on-site',
        state: source.state || 'BW',
        grossMonthlySalary: Math.max(0, finite(source.grossMonthlySalary, 0)),
        vacationDaysPerYear: Math.max(0, finite(source.vacationDaysPerYear, 30)),
        extraVacationDays: Math.max(0, finite(source.extraVacationDays, 0)),
        extraVacationDeadline: isIsoDate(source.extraVacationDeadline) ? source.extraVacationDeadline : '',
        extraVacationNoticeDays: Math.max(0, finite(source.extraVacationNoticeDays, 30)),
    }
}

export function contractFrom(source = {}) {
    const employment = normalizeEmployment(source)
    return Object.fromEntries(CONTRACT_KEYS.map(key => [key, employment[key]]))
}

// A dated employment covers [start, end). An end date already belongs to the next one.
export function employmentCoversDate(employment, isoDate) {
    if (!employment?.start || !isIsoDate(isoDate))
        return false
    if (isoDate < employment.start)
        return false
    if (employment.end && isoDate >= employment.end)
        return false
    return true
}

export function employmentForDate(employments, isoDate) {
    const list = Array.isArray(employments) ? employments : []
    const dated = list.filter(employment => employment.start)
    const match = dated.find(employment => employmentCoversDate(employment, isoDate))
    if (match)
        return match
    if (dated.length === 0)
        return list[0] ?? null
    return null
}

export function earliestEmploymentStart(employments) {
    const starts = (employments ?? [])
        .map(employment => employment.start)
        .filter(isIsoDate)
        .sort()
    return starts[0] ?? ''
}

export function rangesOverlap(first, second) {
    if (!first?.start || !second?.start || first.id === second.id)
        return false

    const firstEnd = first.end || '9999-12-31'
    const secondEnd = second.end || '9999-12-31'
    return first.start < secondEnd && second.start < firstEnd
}

export function findOverlap(employments, candidate) {
    return (employments ?? []).find(employment => rangesOverlap(employment, candidate)) ?? null
}

export function employmentOverlapsYear(employment, year) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    if (!employment?.start)
        return true
    if (employment.start > yearEnd)
        return false
    if (employment.end && employment.end <= yearStart)
        return false
    return true
}

export function employmentsInYear(employments, year) {
    const list = employments ?? []
    const dated = list
        .filter(employment => employment.start && employmentOverlapsYear(employment, year))
        .sort((first, second) => first.start.localeCompare(second.start))

    if (dated.length)
        return dated

    return list.slice(0, 1)
}

export function employmentForYear(employments, year, today = todayIso()) {
    const list = employments ?? []
    if (String(today).startsWith(String(year))) {
        const current = employmentForDate(list, today)
        if (current)
            return current
    }

    const atYearEnd = employmentForDate(list, `${year}-12-31`)
    if (atYearEnd)
        return atYearEnd

    const overlapping = list
        .filter(employment => employmentOverlapsYear(employment, year))
        .sort((first, second) => (second.start || '').localeCompare(first.start || ''))
    return overlapping[0] ?? null
}

export function vacationBalance(employment, usedDays) {
    const yearly = Math.max(0, finite(employment?.vacationDaysPerYear, 30))
    const extra = Math.max(0, finite(employment?.extraVacationDays, 0))
    const used = Math.max(0, finite(usedDays, 0))
    const remainingExtra = Math.max(0, extra - used)
    const usedRegular = Math.max(0, used - extra)

    return {
        used,
        extra,
        remainingExtra,
        remainingRegular: Math.max(0, yearly - usedRegular),
        remaining: remainingExtra + Math.max(0, yearly - usedRegular),
    }
}

export function hourlyRate(monthly, weeklyHours) {
    const salary = Number(monthly) || 0
    const hours = Number(weeklyHours) || 0
    if (!salary || !hours)
        return 0
    return (salary * 12) / (hours * 52)
}

export function entryIsBeforeStart(entry, start) {
    if (!start || !entry?.date)
        return false
    return String(entry.date).slice(0, 10) < start
}

// Without an employment id, every day from the first start onward belongs.
// With an id, only that job's half-open range [start, end) belongs.
export function dateBelongsToEmployment(employments, isoDate, employmentId = '') {
    if (!isIsoDate(isoDate))
        return false

    if (!employmentId)
        return !entryIsBeforeStart({ date: isoDate }, earliestEmploymentStart(employments))

    const employment = (employments ?? []).find(item => item.id === employmentId)

    if (!employment)
        return false

    if (!employment.start)
        return employmentForDate(employments, isoDate)?.id === employment.id

    return employmentCoversDate(employment, isoDate)
}

export function employmentFileSlug(name) {
    const slug = String(name || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40)

    return slug || 'employment'
}

export function managedHolidayYears(employments, today = todayIso()) {
    const currentYear = Number(String(today).slice(0, 4))
    const dated = (employments ?? []).filter(employment => employment.start)
    if (!dated.length)
        return [currentYear]

    const years = new Set()
    dated.forEach(employment => {
        const from = Number(employment.start.slice(0, 4))
        const to = employment.end
            ? Number(employment.end.slice(0, 4))
            : currentYear
        const last = Math.max(from, Math.min(Math.max(to, from), currentYear))
        for (let year = from; year <= last; year++)
            years.add(year)
    })
    return [...years]
}
