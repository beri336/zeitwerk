<!-- src/components/ui/NotificationSettings.vue -->

<template>
    <div class="settings-section">

        <!-- Header -->
        <div class="settings-header">
            <div class="settings-title">Notifications</div>
            <div class="settings-sub">Choose when Zeitwerk sends you alerts.</div>
        </div>

        <!-- Nicht unterstützt -->
        <div v-if="!notifications.isSupported" class="notice notice--warn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Your browser does not support notifications.
        </div>

        <template v-else>

            <!-- Permission Banner: denied -->
            <div v-if="store.settings.permission === 'denied'" class="permission-banner permission-banner--denied">
                <div class="permission-banner__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                </div>
                <div class="permission-banner__body">
                    <div class="permission-banner__title">Notifications blocked</div>
                    <div class="permission-label-err">
                            Permission: {{ store.settings.permission }}
                        </div>
                    <div class="permission-banner__sub">
                        Your browser is blocking notifications for this site. Follow the steps below to enable them,
                        then reload the page.
                    </div>

                    <!-- How-To -->
                    <div class="howto">
                        <button class="howto__toggle" @click="showHowTo = !showHowTo">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            {{ showHowTo ? 'Hide instructions' : 'How to enable notifications' }}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2"
                                :style="{ transform: showHowTo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        <Transition name="howto-expand">
                            <div v-if="showHowTo" class="howto__steps">
                                <div class="howto__browser" v-for="b in browsers" :key="b.name">
                                    <div class="howto__browser-name">{{ b.name }}</div>
                                    <ol class="howto__list">
                                        <li v-for="step in b.steps" :key="step">{{ step }}</li>
                                    </ol>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>

            <!-- Permission Banner: default (not yet asked) -->
            <div v-else-if="store.settings.permission === 'default'"
                class="permission-banner permission-banner--default">
                <div class="permission-banner__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                </div>
                <div class="permission-banner__body">
                    <div class="permission-banner__title">Allow notifications</div>
                    <div class="permission-banner__sub">
                        Zeitwerk needs permission to send you alerts for overtime, inactivity, and habit reminders.
                    </div>
                    <button class="btn btn-primary btn-sm" @click="handleAllow">
                        Allow Notifications
                    </button>
                </div>
            </div>

            <!-- Granted: Master Toggle + Options -->
            <template v-else>
                <div class="permission-granted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Notifications allowed
                    <p>|</p>
                    <div class="permission-label">
                        Permission: {{ store.settings.permission }}
                    </div>
                </div>

                <!-- Master Toggle -->
                <div class="privacy-row">
                    <div class="privacy-info">
                        <div class="privacy-label">Enable Notifications</div>
                        <div class="privacy-hint">Tick to enable your notifications</div>
                    </div>
                </div>

                <!-- Options -->
                <div class="notification-options" :class="{ disabled: !store.settings.enabled }">

                    <div class="notif-row">
                        <div>
                            <div class="privacy-label">Overtime Warning</div>
                            <div class="privacy-hint">
                                Alert when exceeding your overtime threshold
                            </div>
                        </div>

                        <button class="toggle-switch" :class="{ active: store.settings.overtime }"
                            @click="store.settings.overtime = !store.settings.overtime">
                            <span class="toggle-thumb" />
                        </button>
                    </div>

                    <div class="notif-row">
                        <div>
                            <div class="privacy-label">Overtime Warning</div>
                            <div class="privacy-hint">Alert when exceeding your overtime threshold</div>
                        </div>
                        <input type="checkbox" v-model="store.settings.overtime" class="notif-check" />
                    </div>

                    <div class="notif-row">
                        <div>
                            <div class="privacy-label">Inactivity Auto-Pause</div>
                            <div class="privacy-hint">Notify when timer is paused due to inactivity</div>
                        </div>
                        <input type="checkbox" v-model="store.settings.inactivity" class="notif-check" />
                    </div>

                    <div class="notif-row">
                        <div>
                            <div class="privacy-label">Daily Habit Reminder</div>
                            <div class="privacy-hint">Remind you to check your habits each day</div>
                        </div>
                        <input type="checkbox" v-model="store.settings.habitReminder" class="notif-check" />
                    </div>

                    <Transition name="fade">
                        <div v-if="store.settings.habitReminder" class="form-group reminder-time">
                            <label class="form-label">Reminder Time</label>
                            <input type="time" class="form-input time-input"
                                v-model="store.settings.habitReminderTime" />
                        </div>
                    </Transition>

                </div>
            </template>
        </template>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationStore } from '@/stores/notificationStore'

const notifications = useNotifications()
const store = useNotificationStore()
const showHowTo = ref(false)
const { settings } = store

async function handleAllow() {
    await notifications.requestPermission()
}

watch(
    () => [
        store.settings.habitReminder,
        store.settings.habitReminderTime
    ],
    () => {
        notifications.scheduleHabitReminder()
    }
)

const browsers = [
    {
        name: 'Chrome / Edge',
        steps: [
            'Click the lock icon in the address bar',
            'Click "Site settings"',
            'Set "Notifications" to "Allow"',
            'Reload the page',
        ]
    },
    {
        name: 'Firefox',
        steps: [
            'Click the lock icon in the address bar',
            'Click the arrow next to "Connection secure"',
            'Click "More information" → "Permissions"',
            'Remove the block on notifications',
            'Reload the page',
        ]
    },
    {
        name: 'Safari (Mac)',
        steps: [
            'Open Safari → Settings → Websites',
            'Select "Notifications" in the sidebar',
            'Find this site and set it to "Allow"',
            'Reload the page',
        ]
    },
]
</script>

<style scoped>
/* Section Header */
.settings-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    margin-top: 1px;
}

.settings-sub {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: 1px;
}

.privacy-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.privacy-hint {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
}

.permission-label {
    font-size: var(--text-xs);
    color: var(--color-success);
    padding: 4px;
}

.permission-label-err {
    font-size: var(--text-xs);
    color: var(--color-error);
    font-weight: 600;
    padding: 4px;
}

.settings-section {
    margin: 0 var(--space-6) var(--space-6) var(--space-6);
    padding-top: var(--space-6);
    padding-bottom: var(--space-4);
    border-top: none; /* ← weg */
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

/* Permission Banners */
.permission-banner {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid;
}

.permission-banner--denied {
    background: var(--color-error-highlight);
    border-color: color-mix(in oklch, var(--color-error) 25%, transparent);
    color: var(--color-error);
}

.permission-banner--default {
    background: var(--color-primary-highlight);
    border-color: color-mix(in oklch, var(--color-primary) 25%, transparent);
    color: var(--color-primary);
}

.permission-banner__icon {
    flex-shrink: 0;
    margin-top: 2px;
}

.permission-banner__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
}

.permission-banner__title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
}

.permission-banner__sub {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
}

/* Permission Granted */
.permission-granted {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-success);
}

/* How-To */
.howto__toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.howto__toggle:hover {
    color: var(--color-text);
}

.howto__steps {
    margin-top: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
}

.howto__browser-name {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--space-1);
}

.howto__list {
    padding-left: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.howto__list li {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
}

/* Notification Options */
.notification-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    transition: opacity 0.2s;
}

.notification-options.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.notif-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
}

/* Checkbox */
.notif-check {
    appearance: none;
    -webkit-appearance: none;

    position: relative;

    width: 18px;
    height: 18px;

    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);

    background: var(--color-surface-2);

    cursor: pointer;
    flex-shrink: 0;

    transition:
        background var(--transition),
        border-color var(--transition),
        box-shadow var(--transition);
}

.notif-check:hover {
    border-color: var(--color-primary);
}

.notif-check:checked {
    background: var(--color-primary);
    border-color: var(--color-primary);
}

.notif-check::after {
    content: "";

    position: absolute;

    width: 4px;
    height: 8px;

    border: solid white;
    border-width: 0 2px 2px 0;

    left: 50%;
    top: 50%;

    transform:
        translate(-50%, -60%) rotate(45deg);

    opacity: 0;

    transition: opacity var(--transition);
}

.notif-check:checked::after {
    opacity: 1;
}

.notif-check:focus-visible {
    outline: none;

    box-shadow:
        0 0 0 2px color-mix(in oklch,
            var(--color-primary) 20%,
            transparent);
}

.reminder-time {
    padding-top: var(--space-2);
}

.time-input {
    max-width: 140px;
}

/* Notice */
.notice--warn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-warning);
    background: var(--color-warning-highlight);
    border-radius: var(--radius-md);
    padding: var(--space-3);
}

/* Animations */
.howto-expand-enter-active,
.howto-expand-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.howto-expand-enter-from,
.howto-expand-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>