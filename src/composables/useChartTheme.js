// src/composables/useChartTheme.js

import { computed } from 'vue'

export function useChartTheme() {
    function getCSSVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    }

    const colors = computed(() => ({
        primary: getCSSVar('--color-primary'),
        success: getCSSVar('--color-success'),
        warning: getCSSVar('--color-warning'),
        error: getCSSVar('--color-error'),
        text: getCSSVar('--color-text'),
        textMuted: getCSSVar('--color-text-muted'),
        border: getCSSVar('--color-border'),
        surface: getCSSVar('--color-surface'),
        primaryHL: getCSSVar('--color-primary-highlight'),
        successHL: getCSSVar('--color-success-highlight'),
        errorHL: getCSSVar('--color-error-highlight'),
    }))

    const baseOptions = computed(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: colors.value.textMuted,
                    font: { family: 'Inter', size: 12 },
                    boxWidth: 12,
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: colors.value.surface,
                titleColor: colors.value.text,
                bodyColor: colors.value.textMuted,
                borderColor: colors.value.border,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' }
            }
        },
        scales: {
            x: {
                ticks: { color: colors.value.textMuted, font: { family: 'Inter', size: 11 } },
                grid: { color: colors.value.border, lineWidth: 0.5 }
            },
            y: {
                ticks: { color: colors.value.textMuted, font: { family: 'Inter', size: 11 } },
                grid: { color: colors.value.border, lineWidth: 0.5 }
            }
        }
    }))

    return { colors, baseOptions }
}
