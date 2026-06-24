<!-- src/components/ExportCsvModal.vue -->

<template>

  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-export-title"
        @click.stop
      >
        <div class="modal-header">
          <div>
            <h2 id="csv-export-title" class="modal-title">
              {{ $t("csv.title") }}
            </h2>
            <p class="modal-subtitle">{{ $t("csv.subtitle") }}</p>
          </div>

          <button
            class="icon-btn"
            type="button"
            @click="close"
            :aria-label="$t('csv.close_aria')"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <label class="field">
            <span class="field-label">{{ $t("csv.from_month") }}</span>
            <input v-model="fromMonth" class="field-input" type="month" />
          </label>

          <label class="checkbox-row">
            <input v-model="singleMonth" type="checkbox" />
            <span>{{ $t("csv.only_this_month") }}</span>
          </label>

          <label v-if="!singleMonth" class="field">
            <span class="field-label">{{ $t("csv.to_month") }}</span>
            <input
              v-model="toMonth"
              class="field-input"
              type="month"
              :min="fromMonth"
            />
          </label>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="close">
            {{ $t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ $t("csv.submit") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);
const store = useZeitwerkStore();

const singleMonth = ref(true);
const fromMonth = ref("");
const toMonth = ref("");

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

function pad(num) {
  return String(num).padStart(2, "0");
}

function close() {
  isOpen.value = false;
}

function resetToCurrentMonth() {
  const current = `${store.currYear}-${pad(store.currMonth + 1)}`;
  fromMonth.value = current;
  toMonth.value = current;
  singleMonth.value = true;
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetToCurrentMonth();
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  if (!fromMonth.value) return false;
  if (singleMonth.value) return true;
  if (!toMonth.value) return false;
  return toMonth.value >= fromMonth.value;
});

function submit() {
  if (!canSubmit.value) return;

  emit("confirm", {
    from: fromMonth.value,
    to: singleMonth.value ? fromMonth.value : toMonth.value,
  });

  close();
}
</script>

<style scoped>
/* Backdrop */
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

/* Card */
.modal-card {
  width: min(100%, 460px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--text-base);
  font-weight: 700;
}

.modal-subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Body */
.modal-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Form Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.field-input {
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text);
  padding: 0 var(--space-3);
  font-family: inherit;
}

/* Checkbox */
.checkbox-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text);
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}

/* Icon Button */
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn:hover {
  background: var(--color-surface-offset);
  color: var(--color-text);
}

/* Mobile */
@media (max-width: 767px) {
  .modal-backdrop {
    padding: var(--space-3);
  }

  .modal-card {
    width: 100%;
    max-width: 480px;
    margin-top: auto;
    margin-bottom: env(safe-area-inset-bottom);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  /* iOS: Inputs >= 16px to prevent zoom */
  .field-input,
  input[type="month"] {
    font-size: 16px;
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .modal-backdrop {
    padding: var(--space-2);
  }

  .modal-card {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-3);
  }
}
</style>
