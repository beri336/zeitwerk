// src/composables/useExtraVacationNotice.js

import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZeitwerkStore } from '@/stores/zeitwerk'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from '@/composables/useToast'
import { getExtraVacationNotice, parseIsoDate } from '@/composables/extraVacationNotice'
import { todayIso } from '@/composables/employments'

const STORAGE_KEY = 'zeitwerk_extra_vacation_notice'

function localDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDeadline(value, locale) {
    const date = parseIsoDate(value)
    if (!date)
        return value

    return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export function useExtraVacationNotice() {
    const store = useZeitwerkStore()
    const { send } = useNotifications()
    const { showToast } = useToast()
    const { t, locale } = useI18n()

    function employmentForNotice() {
        return store.employmentForDate(todayIso()) || store.employments[0] || null
    }

    function usedDaysForDeadline(deadline, employment) {
        const year = Number(String(deadline).slice(0, 4))
        if (!Number.isInteger(year))
            return store.usedVacationDays

        return store.countVacationDays(year, employment)
    }

    function check() {
        const employment = employmentForNotice()
        const deadline = employment?.extraVacationDeadline || ''
        const today = new Date()
        const notice = getExtraVacationNotice({
            extraDays: employment?.extraVacationDays,
            usedDays: usedDaysForDeadline(deadline, employment),
            deadline,
            noticeDays: employment?.extraVacationNoticeDays,
            today,
        })

        if (!notice)
            return

        const signature = `${localDateKey(today)}|${deadline}|${notice.remaining}|${notice.daysUntil}`
        if (localStorage.getItem(STORAGE_KEY) === signature)
            return

        const dateLabel = formatDeadline(deadline, locale.value)
        const message = notice.daysUntil < 0
            ? t('notifications.extra_vacation.overdue', { remaining: notice.remaining, date: dateLabel })
            : notice.daysUntil === 0
                ? t('notifications.extra_vacation.today', { remaining: notice.remaining })
                : t('notifications.extra_vacation.upcoming', {
                    remaining: notice.remaining,
                    date: dateLabel,
                    days: notice.daysUntil,
                })

        showToast(message, 'ok')
        send(t('notifications.extra_vacation.title'), {
            body: message,
            tag: 'extra-vacation',
        })
        localStorage.setItem(STORAGE_KEY, signature)
    }

    watch(
        () => [
            store.employments.map(employment =>
                `${employment.id}:${employment.extraVacationDays}:${employment.extraVacationDeadline}:${employment.extraVacationNoticeDays}`
            ).join('|'),
            store.entries
                .filter(entry => entry.typ === 'vacation')
                .map(entry => entry.date)
                .join(','),
        ],
        () => check(),
        { immediate: true },
    )
}
