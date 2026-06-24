<!-- src/components/ui/NotificationSettings.vue -->

<template>
  <div class="settings-section">
    <!-- Header -->
    <div class="settings-header">
      <div class="settings-title">{{ $t("notifications.title") }}</div>
      <div class="settings-sub">{{ $t("notifications.sub") }}</div>
    </div>

    <!-- Nicht unterstützt -->
    <div v-if="!notifications.isSupported" class="notice notice--warn">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {{ $t("notifications.unsupported") }}
    </div>

    <template v-else>
      <!-- Permission Banner: denied -->
      <div
        v-if="store.settings.permission === 'denied'"
        class="permission-banner permission-banner--denied"
      >
        <div class="permission-banner__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <div class="permission-banner__body">
          <div class="permission-banner__title">
            {{ $t("notifications.denied.title") }}
          </div>
          <div class="permission-label-err">
            {{
              $t("notifications.permission_label", {
                status: store.settings.permission,
              })
            }}
          </div>
          <div class="permission-banner__sub">
            {{ $t("notifications.denied.sub") }}
          </div>

          <!-- How-To -->
          <div class="howto">
            <button class="howto__toggle" @click="showHowTo = !showHowTo">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {{
                showHowTo
                  ? $t("notifications.denied.hide")
                  : $t("notifications.denied.show")
              }}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :style="{
                  transform: showHowTo ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }"
              >
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
      <div
        v-else-if="store.settings.permission === 'default'"
        class="permission-banner permission-banner--default"
      >
        <div class="permission-banner__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div class="permission-banner__body">
          <div class="permission-banner__title">
            {{ $t("notifications.default.title") }}
          </div>
          <div class="permission-banner__sub">
            {{ $t("notifications.default.sub") }}
          </div>
          <button class="btn btn-primary btn-sm" @click="handleAllow">
            {{ $t("notifications.default.btn") }}
          </button>
        </div>
      </div>

      <!-- Granted: Master Toggle + Options -->
      <template v-else>
        <div class="permission-granted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ $t("notifications.granted.title") }}
          <p>|</p>
          <div class="permission-label">
            {{
              $t("notifications.permission_label", {
                status: store.settings.permission,
              })
            }}
          </div>
        </div>

        <!-- Master Toggle -->
        <div class="privacy-row">
          <div class="privacy-info">
            <div class="privacy-label">
              {{ $t("notifications.master.label") }}
            </div>
            <div class="privacy-hint">
              {{ $t("notifications.master.hint") }}
            </div>
          </div>
        </div>

        <!-- Options -->
        <div
          class="notification-options"
          :class="{ disabled: !store.settings.enabled }"
        />
        <!-- <div class="notif-row">
          <div>
            <div class="privacy-label">
              {{ $t("notifications.overtime.label") }}
            </div>
            <div class="privacy-hint">
              {{ $t("notifications.overtime.hint") }}
            </div>
          </div>

          <button
            class="toggle-switch"
            :class="{ active: store.settings.overtime }"
            @click="store.settings.overtime = !store.settings.overtime"
          >
            <span class="toggle-thumb" />
          </button>
        </div> -->

        <div class="notif-row">
          <div>
            <div class="privacy-label">
              {{ $t("notifications.overtime.label") }}
            </div>
            <div class="privacy-hint">
              {{ $t("notifications.overtime.hint") }}
            </div>
          </div>
          <input
            type="checkbox"
            v-model="store.settings.overtime"
            class="notif-check"
          />
        </div>

        <div class="notif-row">
          <div>
            <div class="privacy-label">
              {{ $t("notifications.inactivity.label") }}
            </div>
            <div class="privacy-hint">
              {{ $t("notifications.inactivity.hint") }}
            </div>
          </div>
          <input
            type="checkbox"
            v-model="store.settings.inactivity"
            class="notif-check"
          />
        </div>

        <div class="notif-row">
          <div>
            <div class="privacy-label">
              {{ $t("notifications.habit.label") }}
            </div>
            <div class="privacy-hint">
              {{ $t("notifications.habit.hint") }}
            </div>
          </div>
          <input
            type="checkbox"
            v-model="store.settings.habitReminder"
            class="notif-check"
          />
        </div>

        <Transition name="fade">
          <div
            v-if="store.settings.habitReminder"
            class="form-group reminder-time"
          >
            <label class="form-label">{{
              $t("notifications.habit.time")
            }}</label>
            <input
              type="time"
              class="form-input time-input"
              v-model="store.settings.habitReminderTime"
            />
          </div>
        </Transition>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useNotifications } from "@/composables/useNotifications";
import { useNotificationStore } from "@/stores/notificationStore";
import { useI18n } from "vue-i18n";

const notifications = useNotifications();
const store = useNotificationStore();
const showHowTo = ref(false);
const { settings } = store;
const { t } = useI18n();

async function handleAllow() {
  await notifications.requestPermission();
}

watch(
  () => [store.settings.habitReminder, store.settings.habitReminderTime],
  () => {
    notifications.scheduleHabitReminder();
  },
);

const browsers = computed(() => [
  {
    name: t("notifications.howto.chrome.name"),
    steps: [
      t("notifications.howto.chrome.step1"),
      t("notifications.howto.chrome.step2"),
      t("notifications.howto.chrome.step3"),
      t("notifications.howto.chrome.step4"),
    ],
  },
  {
    name: t("notifications.howto.firefox.name"),
    steps: [
      t("notifications.howto.firefox.step1"),
      t("notifications.howto.firefox.step2"),
      t("notifications.howto.firefox.step3"),
      t("notifications.howto.firefox.step4"),
      t("notifications.howto.firefox.step5"),
    ],
  },
  {
    name: t("notifications.howto.safari.name"),
    steps: [
      t("notifications.howto.safari.step1"),
      t("notifications.howto.safari.step2"),
      t("notifications.howto.safari.step3"),
      t("notifications.howto.safari.step4"),
    ],
  },
]);
</script>

<style scoped>
/* Settings Section */
.settings-section {
  margin: 0 var(--space-6) var(--space-6) var(--space-6);
  padding-top: var(--space-6);
  padding-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

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

/* Labels */
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
  margin-top: 2px;
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

/* Permission Banners */
.permission-banner {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  flex-wrap: wrap;
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
  min-width: 0;
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
  flex-wrap: wrap;
}

/* Privacy Row (Master Toggle) */
.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.privacy-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  min-height: 32px;
  -webkit-tap-highlight-color: transparent;
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
  flex-wrap: wrap;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background var(--transition);
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(18px);
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
  transform: translate(-50%, -60%) rotate(45deg);
  opacity: 0;
  transition: opacity var(--transition);
}

.notif-check:checked::after {
  opacity: 1;
}

.notif-check:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px
    color-mix(in oklch, var(--color-primary) 20%, transparent);
}

/* Reminder Time */
.reminder-time {
  padding-top: var(--space-2);
}

.time-input {
  max-width: 140px;
}

/* Animations */
.howto-expand-enter-active,
.howto-expand-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
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

/* Mobile */
@media (max-width: 767px) {
  .settings-section {
    margin: 0 var(--space-4) var(--space-4) var(--space-4);
    padding-top: var(--space-4);
  }

  .permission-banner {
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .notif-row {
    gap: var(--space-2);
  }

  .howto__steps {
    padding: var(--space-2);
    gap: var(--space-2);
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .settings-section {
    margin: 0 var(--space-3) var(--space-3) var(--space-3);
  }
}
</style>
