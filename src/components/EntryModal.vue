<!-- src/components/EntryModal.vue -->

<template>

  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">
            {{ editEntry ? $t("entry.title_edit") : $t("entry.title_new") }}
          </div>
          <button class="btn btn-ghost" @click="close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Type selector -->
          <div class="typ-selector">
            <button
              v-for="(type, key) in ABSENCE_TYPES"
              :key="key"
              class="typ-btn"
              :class="{ active: form.typ === key }"
              :style="
                form.typ === key
                  ? `background:${type.highlight};color:${type.color};border-color:${type.color}`
                  : ''
              "
              @click="form.typ = key"
            >
              <span>{{ type.icon }}</span>
              <span>{{ type.label }}</span>
              <!-- <span>{{ $t(type.labelKey) }}</span> -->
            </button>
          </div>

          <div class="form-grid" style="margin-top: var(--space-4)">
            <!-- Date + Actual -->
            <div class="form-group">
              <label class="form-label">{{ $t("entry.date_label") }}</label>
              <input class="form-input" type="date" v-model="form.date" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ $t("entry.planned_label") }}</label>
              <input
                class="form-input"
                type="number"
                step="0.5"
                min="0"
                max="24"
                v-model.number="form.plannedHours"
              />
            </div>

            <!-- Gross Preview -->
            <div
              v-if="
                showTimeFields &&
                form.timeEntries?.some((entry) => entry.start && entry.end) &&
                store.grossHourlyRate > 0
              "
              class="preview-bar"
            >
              <span class="form-label">{{ $t("entry.preview_salary") }}</span>
              <strong class="preview-salary">
                {{
                  mask(
                    grossPreview.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }),
                  )
                }}
              </strong>
            </div>

            <!-- TimeEntry - only on Work/ Homeoffice -->
            <template v-if="showTimeFields">
              <div class="form-group full">
                <label class="form-label">{{ $t("entry.time_entries") }}</label>

                <div class="time-blocks">
                  <div
                    v-for="(block, index) in form.timeEntries"
                    :key="index"
                    class="time-block"
                  >
                    <span class="block-label">{{
                      $t("entry.block_label", { index: index + 1 })
                    }}</span>

                    <div class="block-fields">
                      <div class="form-group">
                        <label class="form-label">{{
                          $t("entry.start")
                        }}</label>
                        <input
                          class="form-input"
                          type="time"
                          v-model="block.start"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">{{ $t("entry.end") }}</label>
                        <input
                          class="form-input"
                          type="time"
                          v-model="block.end"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">{{
                          $t("entry.pause")
                        }}</label>
                        <input
                          class="form-input"
                          type="number"
                          min="0"
                          max="240"
                          v-model.number="block.pause"
                        />
                      </div>
                    </div>

                    <button
                      v-if="form.timeEntries.length > 1"
                      class="btn btn-ghost btn-sm block-remove"
                      @click="removeBlock(index)"
                      :title="$t('entry.remove_block')"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  class="btn btn-secondary btn-sm add-block-btn"
                  @click="addBlock"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {{ $t("entry.add_block") }}
                </button>
              </div>
            </template>

            <!-- Out-of-Office Message -->
            <div v-else class="form-group full">
              <div class="absence-hint">
                <span>{{ currentType.icon }}</span>
                <span>{{
                  $t("entry.absence_hint", {
                    label: currentType.label,
                    hours: form.plannedHours,
                  })
                }}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group full">
              <label class="form-label">{{ $t("entry.notes") }}</label>
              <input
                class="form-input"
                type="text"
                maxlength="200"
                v-model="form.notes"
                :placeholder="
                  form.typ === 'vacation'
                    ? $t('entry.notes_placeholder_vac', {
                        label: currentType.label,
                      })
                    : $t('entry.notes_placeholder', {
                        label: currentType.label,
                      })
                "
              />
            </div>

            <!-- Remarks -->
            <div class="form-group full">
              <label class="form-label">{{ $t("entry.remarks") }}</label>
              <textarea
                class="form-input form-textarea"
                v-model="form.remarks"
                rows="4"
                maxlength="2000"
                :placeholder="$t('entry.remarks_placeholder')"
              />
            </div>

            <!-- Preview Total-Actual -->
            <div v-if="showTimeFields && previewActual > 0" class="preview-bar">
              <span class="form-label">{{
                $t("entry.preview_actual_label")
              }}</span>
              <strong>{{ formatHours(previewActual) }}</strong>
              <span class="preview-hint">
                {{
                  $t("entry.preview_actual_hint", {
                    count: form.timeEntries.filter(
                      (entry) => entry.start && entry.end,
                    ).length,
                  })
                }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <template v-if="editEntry">
              <!-- Confirmation status -->
              <template v-if="pendingDelete">
                <span class="delete-confirm-label">{{
                  $t("entry.delete_confirm")
                }}</span>
                <button class="btn btn-danger btn-sm" @click="deleteAndClose">
                  {{ $t("common.delete_confirm_yes") }}
                </button>
                <button class="btn btn-secondary btn-sm" @click="cancelDelete">
                  {{ $t("common.cancel") }}
                </button>
              </template>

              <!-- Normal condition -->
              <button
                v-else
                class="btn btn-ghost btn-sm delete-btn"
                @click="askDelete"
                style="margin-right: auto"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
                {{ $t("common.delete") }}
              </button>
            </template>

            <template v-if="!pendingDelete">
              <button class="btn btn-secondary" @click="close">
                {{ $t("common.cancel") }}
              </button>
              <button class="btn btn-primary" @click="save">
                {{ editEntry ? $t("common.update") : $t("common.add") }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useZeitwerkStore } from "@/stores/zeitwerk";
import { useToast } from "@/composables/useToast";
import { calcActualHours, formatHours, today } from "@/composables/useTime";
import { ABSENCE_TYPES, getAbsenceType } from "@/composables/useAbsence";
import { usePrivacy } from "@/composables/usePrivacy";
import { useI18n } from "vue-i18n";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editEntry: { type: Object, default: null },
  prefillDate: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue"]);
const store = useZeitwerkStore();
const { showToast } = useToast();
const { mask } = usePrivacy();
const { t } = useI18n();

const defaultForm = () => ({
  date: today(),
  typ: "on-site",
  timeEntries: [
    {
      start: "08:00",
      end: "17:00",
      pause: 30,
    },
  ],
  plannedHours: store.settings.hoursPerDay,
  notes: "",
  remarks: "",
});
const form = ref(defaultForm());

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.editEntry) {
      form.value = {
        ...props.editEntry,
        timeEntries: props.editEntry.timeEntries
          ? props.editEntry.timeEntries.map((block) => ({ ...block }))
          : [],
      };
    } else {
      form.value = {
        ...defaultForm(),
        date: props.prefillDate ?? today(),
      };
    }
  },
);

const currentType = computed(() =>
  getAbsenceType(form.value?.typ ?? "on-site"),
);
const showTimeFields = computed(() => currentType.value.counter);
const previewActual = computed(() =>
  form.value ? calcActualHours(form.value) : 0,
);

// show salary
const grossPreview = computed(() => {
  if (!showTimeFields.value) return 0;
  return store.grossEarnedForEntry(form.value);
});

// timeEntries helper
function addBlock() {
  form.value.timeEntries.push({
    start: "08:00",
    end: "17:00",
    pause: 30,
  });
}

function removeBlock(index) {
  if (form.value.timeEntries.length <= 1) return;
  form.value.timeEntries.splice(index, 1);
}

// delete with confirmation + Toast
const pendingDelete = ref(false);

function askDelete() {
  pendingDelete.value = true;
}
function cancelDelete() {
  pendingDelete.value = false;
}

function deleteAndClose() {
  if (!props.editEntry) return;
  store.deleteEntry(props.editEntry.id);
  showToast(t("entry.toast_deleted"), "ok");
  close();
}

// reset on closing
function close() {
  pendingDelete.value = false;
  emit("update:modelValue", false);
}

// save new or updated entry
function save() {
  if (!form.value.date) {
    showToast(t("entry.error_no_date"), "error");
    return;
  }

  if (props.editEntry) {
    store.updateEntry(props.editEntry.id, form.value);
    showToast(t("entry.toast_updated"), "ok");
  } else {
    store.addEntry(form.value);
    showToast(t("entry.toast_added"), "ok");
  }
  close();
}
</script>

<style scoped>
/* Modal Content Scroll Container */
.modal-content {
  max-height: calc(
    100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px
  );
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Type Selector */
.typ-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.typ-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 500;
  background: var(--color-surface-offset);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  min-height: 36px;
  -webkit-tap-highlight-color: transparent;
}

.typ-btn:hover {
  background: var(--color-surface-dynamic);
  color: var(--color-text);
}

.typ-btn.active {
  font-weight: 600;
}

/* Preview Bar */
.preview-bar {
  grid-column: 1 / -1;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-offset);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.preview-salary {
  color: var(--color-gold);
  font-variant-numeric: tabular-nums;
}

.preview-hint {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* Out-of-Office Hint */
.absence-hint {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-offset);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

/* Time Blocks */
.time-blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.time-block {
  position: relative;
  padding: var(--space-4);
  background: var(--color-surface-offset);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
}

.block-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.block-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-3);
}

.block-remove {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: var(--color-text-faint);
}

.block-remove:hover {
  color: var(--color-error);
}

/* Add Block Button */
.add-block-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-style: dashed;
}

/* Delete Button */
.delete-btn {
  color: var(--color-text-faint);
}

.delete-btn:hover {
  color: var(--color-error);
}

.delete-confirm-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-error);
  margin-right: auto;
}

/* Remarks */
.form-textarea {
  min-height: 110px;
  resize: vertical;
  font-family: inherit;
}

/* Mobile */
@media (max-width: 767px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 92dvh;
  }

  .block-fields {
    grid-template-columns: 1fr 1fr;
  }

  .typ-btn {
    min-height: 40px;
  }

  /* iOS zoom prevention - inputs under 16px trigger auto-zoom */
  .form-input,
  input[type="date"],
  input[type="time"],
  input[type="number"],
  input[type="text"],
  textarea.form-input {
    font-size: 16px;
  }
}

/* Small Mobile */
@media (max-width: 420px) {
  .block-fields {
    grid-template-columns: 1fr;
  }

  .typ-selector {
    gap: var(--space-1);
  }

  .typ-btn {
    padding: var(--space-2);
    font-size: 10px;
  }

  .absence-hint {
    font-size: var(--text-xs);
  }
}
</style>
