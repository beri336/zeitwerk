// src/composables/extraVacationNotice.js
// Decides whether leftover vacation days are inside their reminder window.

function finiteOr(value, fallback) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}

export function parseIsoDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return null

    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
        return null

    return date
}

export function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * @returns {{ remaining: number, daysUntil: number, overdue: boolean } | null}
 */
export function getExtraVacationNotice({
    extraDays,
    usedDays = 0,
    deadline,
    noticeDays,
    today = new Date(),
}) {
    const extra = Math.max(0, finiteOr(extraDays, 0))
    const used = Math.max(0, finiteOr(usedDays, 0))
    const remaining = Math.max(0, extra - used)

    if (remaining <= 0)
        return null

    const deadlineDate = parseIsoDate(deadline)
    if (!deadlineDate)
        return null

    const lead = Math.max(0, Math.floor(finiteOr(noticeDays, 30)))
    const todayDate = startOfLocalDay(today)
    const noticeStart = new Date(deadlineDate)
    noticeStart.setDate(noticeStart.getDate() - lead)

    if (todayDate < noticeStart)
        return null

    const daysUntil = Math.round((deadlineDate.getTime() - todayDate.getTime()) / 86400000)

    return {
        remaining,
        daysUntil,
        overdue: daysUntil < 0,
    }
}
