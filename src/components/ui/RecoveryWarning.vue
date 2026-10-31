// src/components/ui/RecoveryWarning.vue

<template>
  <div v-if="showWarning" class="recovery-banner" role="status" aria-live="polite">
    <div class="recovery-banner__text">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        aria-hidden="true">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.7 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3l-7.9-13.3a2 2 0 0 0-3.4 0Z" />
      </svg>
      <span>{{ $t("recovery.warning") }}</span>
    </div>

    <div class="recovery-banner__actions">
      <button class="btn btn-primary btn-sm" @click="createBackup">
        {{ $t("recovery.create_backup") }}
      </button>
      <button class="btn btn-ghost btn-sm" @click="ignoreWarning">
        {{ $t("recovery.ignore") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRecovery } from "@/composables/useRecovery";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useCalendarStore } from "@/composables/useCalendarStore";
import { useTodoStore } from "@/composables/useTodoStore";
import { useProfileStore } from "@/composables/useProfileStore";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";

const MAX_BACKUP_AGE = 30 * 86400000;
const { t } = useI18n();
const { showToast } = useToast();
const { snapshots, ignoredSnapshotId, createSnapshot, ignoreWarning } = useRecovery();
const zeitwerk = useZeitwerkStore();
const calendar = useCalendarStore();
const todos = useTodoStore();
const profile = useProfileStore();

const hasData = computed(() =>
  zeitwerk.entries.length > 0
    || calendar.events.length > 0
    || todos.todos.length > 0
    || Object.values(profile.profile).some(Boolean),
);

const latestSnapshot = computed(() => snapshots.value[0] ?? null);
const isBackupOverdue = computed(() => {
  if (!latestSnapshot.value) return true;
  return Date.now() - new Date(latestSnapshot.value.createdAt).getTime() > MAX_BACKUP_AGE;
});

const showWarning = computed(() => {
  if (!hasData.value || !isBackupOverdue.value) return false;
  return ignoredSnapshotId.value !== (latestSnapshot.value?.id ?? "none");
});

function createBackup() {
  if (createSnapshot({ force: true })) {
    showToast(t("recovery.created"), "ok");
  }
}
</script>

<style scoped>
.recovery-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-gold-highlight);
  color: var(--color-gold);
  border: 1px solid color-mix(in oklch, var(--color-gold) 25%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
}

.recovery-banner__text,
.recovery-banner__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.recovery-banner__actions {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .recovery-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .recovery-banner__actions {
    width: 100%;
  }

  .recovery-banner__actions .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
