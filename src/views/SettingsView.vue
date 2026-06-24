<!-- src/views/SettingsView.vue -->

<template>
    <main class="main">
        <h1>{{ $t('nav.settings') }}</h1>
        <SettingsCard />

        <div class="settings-about">
            <span>{{ $t('settings.source_code') }}</span>

            <a href="https://github.com/beri336/zeitwerk" target="_blank" rel="noopener noreferrer"
                class="settings-about-link">
                <span class="settings-about-link-inner">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                        <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.36 7.86 10.88.58.11.79-.25.79-.56
                    0-.28-.01-1.02-.02-2-3.19.69-3.87-1.54-3.87-1.54-.53-1.33-1.3-1.68-1.3-1.68
                    -1.06-.72.08-.71.08-.71 1.17.08 1.78 1.22 1.78 1.22 1.04 1.78 2.73 1.27
                    3.4.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.69
                    0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18
                    .92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39C17.9 4.2 18.87 4.5 18.87 4.5
                    c.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1
                    0 4.42-2.68 5.4-5.24 5.68.42.36.8 1.08.8 2.18
                    0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56C20.21 21.36 23.5 17.09 23.5 12
                    23.5 5.65 18.35.5 12 .5Z" />
                    </svg>

                    <span class="settings-about-link-text">
                        github.com/beri336/zeitwerk
                    </span>
                </span>
            </a>
        </div>
    </main>
</template>

<script setup>
import SettingsCard from '@/components/features/SettingsCard.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
/* Main Layout */
.main {
    overscroll-behavior: contain;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

/* Page Heading */
.main h1 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.main h1::before,
.main h1::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
    opacity: 0.6;
}

/* About Section */
.settings-about {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    align-items: center;
    justify-content: center;
    text-align: center;
}

.settings-about a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
}

/* Icon + text as a separate Flex row */
.settings-about-link-inner {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
}

/* Only the text should wrap - not before the icon */
.settings-about-link-text {
    white-space: nowrap;
}

/* If space becomes very limited, the entire link may wrap to the next line */
@media (max-width: 400px) {
    .settings-about {
        flex-direction: column;
        align-items: flex-start;
    }
}

/* Mobile */
@media (max-width: 767px) {
    .main {
        padding: var(--space-3);
        gap: var(--space-3);
    }

    .main h1 {
        font-size: var(--text-xl, 1.25rem);
    }

    .settings-about {
        font-size: var(--text-xs);
    }
}

/* Small Mobile */
@media (max-width: 420px) {
    .main {
        padding: var(--space-2);
        gap: var(--space-2);
    }
}
</style>
