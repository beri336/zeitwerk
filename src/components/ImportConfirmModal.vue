<!-- src/components/ImportConfirmModal.vue -->

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @click.self="cancel">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="import-confirm-title">
        <div class="modal-header">
          <div>
            <h2 id="import-confirm-title" class="modal-title">{{ $t("import.title") }}</h2>
            <p class="modal-subtitle">{{ $t("import.warning") }}</p>
          </div>
          <button class="icon-btn" type="button" @click="cancel" :aria-label="$t('common.cancel')">×</button>
        </div>

        <div class="modal-body">
          <div class="import-counts">
            <div>
              <span>{{ $t("import.current_entries") }}</span>
              <strong>{{ currentCount }}</strong>
            </div>
            <div>
              <span>{{ $t("import.file_entries") }}</span>
              <strong>{{ importCount }}</strong>
            </div>
          </div>
          <p class="import-danger">{{ $t("import.replaces_data") }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" type="button" @click="cancel">
            {{ $t("common.cancel") }}
          </button>
          <button class="btn btn-secondary" type="button" @click="confirm(true)">
            {{ $t("import.backup_and_import") }}
          </button>
          <button class="btn btn-danger" type="button" @click="confirm(false)">
            {{ $t("import.import_now") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps({
  modelValue: { type: Boolean, default: false },
  currentCount: { type: Number, default: 0 },
  importCount: { type: Number, default: 0 },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

function cancel() {
  emit("update:modelValue", false);
}

function confirm(createBackup) {
  emit("confirm", { createBackup });
}

function handleKeydown(event) {
  if (event.key === "Escape") cancel();
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: color-mix(in oklch, black 32%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-card {
  width: min(100%, 520px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: var(--text-base);
}

.modal-subtitle {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.modal-body {
  padding: var(--space-4);
}

.import-counts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.import-counts div {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.import-counts span {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.import-counts strong {
  color: var(--color-text);
  font-size: var(--text-xl);
}

.import-danger {
  margin: var(--space-4) 0 0;
  color: var(--color-error);
  font-size: var(--text-sm);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
