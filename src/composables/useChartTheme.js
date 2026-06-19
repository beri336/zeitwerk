// src/composables/useChartTheme.js

import { computed } from 'vue'

function getCSSVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim()
}

export function useChartTheme() {
    const colors = computed(() => ({
        primary: getCSSVar('--color-primary') || '#6366f1',
        primaryHL: getCSSVar('--color-primary-highlight') || 'rgba(99,102,241,0.15)',
        success: getCSSVar('--color-success') || '#22c55e',
        successHL: 'rgba(34,197,94,0.15)',
        warning: getCSSVar('--color-warning') || '#f59e0b',
        warningHL: 'rgba(245,158,11,0.15)',
        error: getCSSVar('--color-error') || '#ef4444',
        errorHL: 'rgba(239,68,68,0.15)',
        text: getCSSVar('--color-text') || '#e2e8f0',
        textMuted: getCSSVar('--color-text-muted') || '#94a3b8',
        border: getCSSVar('--color-border') || '#2d3148',
        divider: getCSSVar('--color-divider') || '#1e2130',
        surface: getCSSVar('--color-surface') || '#1e2130',
    }))

    const baseOptions = computed(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    padding: 16,
                    color: colors.value.textMuted,
                    font: { family: 'Inter', size: 12 }
                }
            },
            tooltip: {
                backgroundColor: colors.value.surface,
                borderColor: colors.value.border,
                borderWidth: 1,
                titleColor: colors.value.text,
                bodyColor: colors.value.textMuted,
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: colors.value.textMuted,
                    font: { family: 'Inter', size: 11 }
                }
            },
            y: {
                grid: {
                    color: colors.value.border,
                    drawBorder: false,
                },
                border: { display: false, dash: [4, 4] },
                ticks: {
                    color: colors.value.textMuted,
                    font: { family: 'Inter', size: 11 },
                    padding: 8
                }
            }
        }
    }))

    return { colors, baseOptions }
}
