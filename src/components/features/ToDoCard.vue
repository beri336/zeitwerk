<!-- src/components/features/ToDoCard.vue -->

<template>
  <main class="main">
    <div class="todo-wrapper">

      <!-- Header -->
      <header class="todo-header">
        <h1 class="todo-title">{{ $t("todos.title") }}</h1>
        <span class="todo-badge">
          {{ badgeText }}
        </span>
        <button class="btn btn-primary btn-sm ml-auto" @click="openModal()">
          + {{ $t("todos.add_btn") }}
        </button>
      </header>

      <!-- Filter & Sort Bar -->
      <div class="toolbar">
        <div class="todo-filters">
          <button
            v-for="filter in filters"
            :key="filter.key"
            class="filter-btn"
            :class="{ active: activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="toolbar-right">
          <select v-model="sortBy" class="todo-select">
            <option value="created">{{ $t("todos.sort.created") }}</option>
            <option value="due">{{ $t("todos.sort.due") }}</option>
            <option value="priority">{{ $t("todos.sort.priority") }}</option>
          </select>
        </div>
      </div>

      <!-- Tag Filter -->
      <div v-if="allTags.length" class="tag-filter-row">
        <button
          class="tag tag--filter"
          :class="{ active: !activeTag }"
          @click="activeTag = null"
        >
          {{ $t("todos.filter.all") }}
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag tag--filter"
          :class="{ active: activeTag === tag }"
          @click="activeTag = activeTag === tag ? null : tag"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Todo List -->
      <TransitionGroup name="todo-list" tag="ul" class="todo-list">
        <li
          v-for="todo in filteredTodos"
          :key="todo.id"
          class="todo-item"
          :class="{
            done: todo.done,
            urgent: todo.urgent,
            [`priority-${todo.priority}`]: true,
          }"
        >
          <!-- Left: Checkbox -->
          <button class="todo-check" @click="toggleTodo(todo.id)">
            <svg
              v-if="todo.done"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Content -->
          <div class="todo-content">
            <div class="todo-main-row">
              <span class="todo-text">{{ todo.text }}</span>
              <span v-if="todo.urgent" class="urgent-badge" title="Urgent"
                >⚡</span
              >
              <span
                class="priority-dot"
                :class="`priority-dot--${todo.priority}`"
                :title="priorityLabel(todo.priority)"
              ></span>
            </div>

            <!-- Meta Row -->
            <div class="todo-meta">
              <span
                v-if="todo.dueDate || todo.dueTime"
                class="meta-item"
                :class="{ overdue: isOverdue(todo) }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  width="11"
                  height="11"
                >
                  <path
                    d="M5.75 7.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 10.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M4.75 1a.75.75 0 01.75.75V3h5V1.75a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115 5.75v7.5A2.75 2.75 0 0112.25 16H3.75A2.75 2.75 0 011 13.25v-7.5A2.75 2.75 0 013.75 3H4V1.75A.75.75 0 014.75 1zm-1 3.5c-.69 0-1.25.56-1.25 1.25V6h11v-.25c0-.69-.56-1.25-1.25-1.25H3.75zM2.5 7.5v5.75c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V7.5h-11z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ formatDue(todo) }}
              </span>
              <a
                v-if="todo.link"
                :href="todo.link"
                target="_blank"
                class="meta-item meta-link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  width="11"
                  height="11"
                >
                  <path
                    d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z"
                  />
                  <path
                    d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 007 4H4.75A2.75 2.75 0 002 6.75v4.5A2.75 2.75 0 004.75 14h4.5A2.75 2.75 0 0012 11.25V9a.75.75 0 00-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5z"
                  />
                </svg>
                Link
              </a>
              <span v-for="tag in todo.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>

            <!-- Subtasks -->
            <div v-if="todo.subtasks.length" class="subtasks">
              <div class="subtask-progress">
                <div
                  class="subtask-progress-bar"
                  :style="{ width: subtaskProgress(todo) + '%' }"
                ></div>
              </div>
              <span class="subtask-count">
                {{
                  $t("todos.subtask_count", {
                    done: todo.subtasks.filter((sub) => sub.done).length,
                    total: todo.subtasks.length,
                  })
                }}
              </span>
              <ul class="subtask-list" v-show="todo.expanded">
                <li
                  v-for="sub in todo.subtasks"
                  :key="sub.id"
                  class="subtask-item"
                  :class="{ done: sub.done }"
                >
                  <button
                    class="todo-check todo-check--sm"
                    @click="toggleSubtask(todo.id, sub.id)"
                  >
                    <svg
                      v-if="sub.done"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="10"
                      height="10"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <span class="subtask-text">{{ sub.text }}</span>

                  <!-- Subtask Meta -->
                  <div class="subtask-meta">
                    <span
                      v-if="sub.dueDate || sub.dueTime"
                      class="meta-item"
                      :class="{ overdue: isOverdue(sub) }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        width="10"
                        height="10"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.75 1a.75.75 0 01.75.75V3h5V1.75a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115 5.75v7.5A2.75 2.75 0 0112.25 16H3.75A2.75 2.75 0 011 13.25v-7.5A2.75 2.75 0 013.75 3H4V1.75A.75.75 0 014.75 1zm-1 3.5c-.69 0-1.25.56-1.25 1.25V6h11v-.25c0-.69-.56-1.25-1.25-1.25H3.75zM2.5 7.5v5.75c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V7.5h-11z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ formatDue(sub) }}
                    </span>
                    <a
                      v-if="sub.link"
                      :href="sub.link"
                      target="_blank"
                      class="meta-item meta-link"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        width="10"
                        height="10"
                      >
                        <path
                          d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z"
                        />
                        <path
                          d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 007 4H4.75A2.75 2.75 0 002 6.75v4.5A2.75 2.75 0 004.75 14h4.5A2.75 2.75 0 0012 11.25V9a.75.75 0 00-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5z"
                        />
                      </svg>
                      Link
                    </a>
                    <span
                      v-for="tag in sub.tags"
                      :key="tag"
                      class="tag tag--sm"
                      >{{ tag }}</span
                    >
                  </div>

                  <div class="todo-actions subtask-actions">
                    <button
                      class="icon-btn"
                      @click="openModal(todo.id, sub.id)"
                      :title="$t('common.edit')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="12"
                        height="12"
                      >
                        <path
                          d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"
                        />
                      </svg>
                    </button>
                    <button
                      class="icon-btn icon-btn--danger"
                      @click="removeSubtask(todo.id, sub.id)"
                      :title="$t('common.delete')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="12"
                        height="12"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              </ul>
              <button
                class="subtask-toggle"
                @click="todo.expanded = !todo.expanded"
              >
                {{
                  todo.expanded
                    ? "▲ " + $t("common.collapse")
                    : "▼ " + $t("common.expand")
                }}
              </button>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="todo-actions">
            <button
              class="icon-btn"
              :title="$t('todos.add_subtask')"
              @click="openModal(todo.id, null, true)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path
                  d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
                />
              </svg>
            </button>
            <button
              class="icon-btn"
              @click="openModal(todo.id)"
              :title="$t('common.edit')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path
                  d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"
                />
              </svg>
            </button>
            <button
              class="icon-btn icon-btn--danger"
              @click="removeTodo(todo.id)"
              :title="$t('common.delete')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </li>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredTodos.length === 0" class="todo-empty">
        <p>{{ emptyMessage }}</p>
      </div>

      <!-- Footer -->
      <footer v-if="todos.length > 0" class="todo-footer">
        <span>{{
          $t("todos.footer_pending", { remaining, total: todos.length })
        }}</span>
        <button
          v-if="completedCount > 0"
          class="btn btn-ghost btn-sm"
          @click="clearCompleted"
        >
          {{ $t("todos.clear_completed", { count: completedCount }) }}
        </button>
      </footer>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modal.open"
          class="modal-backdrop"
          @mousedown.self="closeModal"
        >
          <div class="modal">
            <header class="modal-header">
              <h2 class="modal-title">
                {{
                  modal.isSubtask
                    ? $t("todos.modal.type_sub")
                    : $t("todos.modal.type_task")
                }}
                {{ modal.editId ? $t("common.edit") : $t("common.create") }}
              </h2>
              <button class="icon-btn" @click="closeModal">✕</button>
            </header>

            <div class="modal-body">
              <!-- Text -->
              <div class="field">
                <label class="field-label">{{
                  $t("todos.modal.title_label")
                }}</label>
                <input
                  v-model="form.text"
                  class="todo-input"
                  type="text"
                  :placeholder="$t('todos.modal.title_hint')"
                />
              </div>

              <!-- Row: Date + Time -->
              <div class="field-row">
                <div class="field">
                  <label class="field-label">{{ $t("common.date") }}</label>
                  <input
                    v-model="form.dueDate"
                    class="todo-input"
                    type="date"
                  />
                </div>

                <div class="field">
                  <label class="field-label">{{ $t("common.time") }}</label>
                  <input
                    v-model="form.dueTime"
                    class="todo-input"
                    type="time"
                  />
                </div>
              </div>

              <!-- Link -->
              <div class="field">
                <label class="field-label">{{ $t("todos.modal.link") }}</label>
                <input
                  v-model="form.link"
                  class="todo-input"
                  type="url"
                  placeholder="https://..."
                />
              </div>

              <!-- Tags -->
              <div class="field">
                <label class="field-label">{{ $t("common.tags") }}</label>
                <div class="tag-input-wrapper">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="tag tag--removable"
                  >
                    {{ tag }}
                    <button class="tag-remove" @click="removeTag(tag)">
                      ×
                    </button>
                  </span>
                  <input
                    v-model="tagInput"
                    class="tag-input"
                    type="text"
                    :placeholder="$t('todos.modal.tags_hint')"
                    @keydown.enter.prevent="addTag"
                    @keydown.comma.prevent="addTag"
                  />
                </div>
              </div>

              <!-- Priority + Urgent (for main tasks only) -->
              <template v-if="!modal.isSubtask">
                <div class="field-row">
                  <div class="field">
                    <label class="field-label">{{
                      $t("todos.modal.priority")
                    }}</label>
                    <div class="priority-selector">
                      <button
                        v-for="priority in priorities"
                        :key="priority.key"
                        class="priority-btn"
                        :class="[
                          `priority-btn--${priority.key}`,
                          { active: form.priority === priority.key },
                        ]"
                        @click="form.priority = priority.key"
                      >
                        {{ priority.label }}
                      </button>
                    </div>
                  </div>

                  <div class="field field--center">
                    <label class="field-label">{{
                      $t("todos.modal.urgent")
                    }}</label>
                    <button
                      class="urgent-toggle"
                      :class="{ active: form.urgent }"
                      @click="form.urgent = !form.urgent"
                    >
                      {{ form.urgent ? $t("common.yes") : $t("common.no") }}
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <footer class="modal-footer">
              <button class="btn btn-ghost" @click="closeModal">
                {{ $t("common.cancel") }}
              </button>
              <button
                class="btn btn-primary"
                :disabled="!form.text.trim()"
                @click="saveModal"
              >
                {{ modal.editId ? $t("common.save") : $t("common.create") }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useTodoStore } from "@/composables/useTodoStore";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

// Data
const todoStore = useTodoStore();
const { todos } = storeToRefs(todoStore);

// derive nextId from store data
let nextId = todos.value.length
  ? Math.max(
      ...todos.value.flatMap((t) => [t.id, ...t.subtasks.map((s) => s.id)]),
    ) + 1
  : 1;

const activeFilter = ref("all");
const activeTag = ref(null);
const sortBy = ref("created");

const filters = computed(() => [
  { key: "all", label: t("todos.filter.all") },
  { key: "open", label: t("todos.filter.open") },
  { key: "done", label: t("todos.filter.done") },
  { key: "urgent", label: t("todos.filter.urgent") },
  { key: "overdue", label: t("todos.filter.overdue") },
]);

const priorities = computed(() => [
  { key: "low", label: t("todos.priority.low") },
  { key: "middle", label: t("todos.priority.middle") },
  { key: "high", label: t("todos.priority.high") },
]);

function deleteAllEntries() {
  todoStore.deleteAllEntries();
}

// Modal State
const modal = reactive({
  open: false,
  parentId: null, // null = Main task, number = Subtask
  editId: null, // id of the item to be edited
  isSubtask: false,
});

const tagInput = ref("");

const defaultForm = () => ({
  text: "",
  dueDate: "",
  dueTime: "",
  link: "",
  tags: [],
  priority: "low",
  urgent: false,
});

const form = reactive(defaultForm());

function openModal(parentId = null, editSubId = null, addSubtask = false) {
  Object.assign(form, defaultForm());
  tagInput.value = "";

  modal.parentId = parentId;
  modal.isSubtask = addSubtask || editSubId !== null;
  modal.editId = null;

  if (editSubId !== null) {
    // edit subtask
    const parent = todos.value.find((t) => t.id === parentId);
    const sub = parent?.subtasks.find((s) => s.id === editSubId);

    if (sub) {
      modal.editId = editSubId;
      Object.assign(form, {
        text: sub.text,
        dueDate: sub.dueDate,
        dueTime: sub.dueTime,
        link: sub.link,
        tags: [...sub.tags],
        priority: "low",
        urgent: false,
      });
    }
  } else if (parentId !== null && !addSubtask) {
    // edit main task
    const todo = todos.value.find((t) => t.id === parentId);
    if (todo) {
      modal.editId = parentId;
      modal.parentId = null;
      Object.assign(form, {
        text: todo.text,
        dueDate: todo.dueDate,
        dueTime: todo.dueTime,
        link: todo.link,
        tags: [...todo.tags],
        priority: todo.priority,
        urgent: todo.urgent,
      });
    }
  }

  modal.open = true;
}

function closeModal() {
  modal.open = false;
}

function saveModal() {
  if (!form.text.trim()) return;

  if (modal.editId !== null && modal.isSubtask) {
    // update subtask
    const parent = todos.value.find((t) => t.id === modal.parentId);
    const sub = parent?.subtasks.find((s) => s.id === modal.editId);

    if (sub) {
      sub.text = form.text.trim();
      sub.dueDate = form.dueDate;
      sub.dueTime = form.dueTime;
      sub.link = form.link;
      sub.tags = [...form.tags];
    }
  } else if (modal.editId !== null) {
    // update main task
    const todo = todos.value.find((t) => t.id === modal.editId);

    if (todo) {
      todo.text = form.text.trim();
      todo.dueDate = form.dueDate;
      todo.dueTime = form.dueTime;
      todo.link = form.link;
      todo.tags = [...form.tags];
      todo.priority = form.priority;
      todo.urgent = form.urgent;
    }
  } else if (modal.parentId !== null) {
    // new subtask
    const parent = todos.value.find((t) => t.id === modal.parentId);

    if (parent) {
      parent.subtasks.push({
        id: nextId++,
        text: form.text.trim(),
        done: false,
        dueDate: form.dueDate,
        dueTime: form.dueTime,
        link: form.link,
        tags: [...form.tags],
      });
      parent.expanded = true;
    }
  } else {
    // new Main Task
    todos.value.unshift({
      id: nextId++,
      text: form.text.trim(),
      done: false,
      dueDate: form.dueDate,
      dueTime: form.dueTime,
      link: form.link,
      tags: [...form.tags],
      priority: form.priority,
      urgent: form.urgent,
      subtasks: [],
      expanded: true,
      createdAt: Date.now(),
    });
  }

  closeModal();
}

// Tags
function addTag() {
  const tag = tagInput.value.trim().replace(/,$/, "");

  if (tag && !form.tags.includes(tag)) form.tags.push(tag);

  tagInput.value = "";
}

function removeTag(tag) {
  form.tags = form.tags.filter((t) => t !== tag);
}

// Todo Actions
function toggleTodo(id) {
  const todo = todos.value.find((t) => t.id === id);

  if (todo) todo.done = !todo.done;
}

function removeTodo(id) {
  todos.value = todos.value.filter((t) => t.id !== id);
}

function toggleSubtask(parentId, subId) {
  const parent = todos.value.find((t) => t.id === parentId);
  const sub = parent?.subtasks.find((s) => s.id === subId);

  if (sub) sub.done = !sub.done;
}

function removeSubtask(parentId, subId) {
  const parent = todos.value.find((t) => t.id === parentId);

  if (parent) parent.subtasks = parent.subtasks.filter((s) => s.id !== subId);
}

function clearCompleted() {
  todos.value = todos.value.filter((t) => !t.done);
}

// Helpers
function isOverdue(item) {
  if (!item.dueDate || item.done) return false;

  const due = new Date(
    `${item.dueDate}${item.dueTime ? "T" + item.dueTime : "T23:59"}`,
  );

  return due < new Date();
}

function formatDue(item) {
  if (!item.dueDate) return item.dueTime || "";

  const date = new Date(`${item.dueDate}T00:00`);
  const formatted = date.toLocaleDateString(currentLocale.value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return item.dueTime ? `${formatted} ${item.dueTime}` : formatted;
}

function subtaskProgress(todo) {
  if (!todo.subtasks.length) return 0;

  return (
    (todo.subtasks.filter((s) => s.done).length / todo.subtasks.length) * 100
  );
}

function priorityLabel(p) {
  return (
    {
      low: t("todos.priority.low"),
      middle: t("todos.priority.middle"),
      high: t("todos.priority.high"),
    }[p] ?? ""
  );
}

// Computed
const allTags = computed(() => {
  const set = new Set();

  todos.value.forEach((todo) => {
    todo.tags.forEach((tag) => set.add(tag));
    todo.subtasks.forEach((s) => s.tags.forEach((tag) => set.add(tag)));
  });
  return [...set];
});

const filteredTodos = computed(() => {
  let list = todos.value;

  if (activeFilter.value === "open") {
    list = list.filter((todo) => !todo.done);
  } else if (activeFilter.value === "done") {
    list = list.filter((todo) => todo.done);
  } else if (activeFilter.value === "urgent") {
    list = list.filter((todo) => todo.urgent);
  } else if (activeFilter.value === "overdue") {
    list = list.filter((todo) => isOverdue(todo));
  }

  if (activeTag.value) {
    list = list.filter(
      (todo) =>
        todo.tags.includes(activeTag.value) ||
        todo.subtasks.some((s) => s.tags.includes(activeTag.value)),
    );
  }

  return [...list].sort((a, b) => {
    if (sortBy.value === "priority") {
      const order = { high: 0, middle: 1, low: 2 };

      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    }
    if (sortBy.value === "due") {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

      return da - db;
    }

    return b.createdAt - a.createdAt;
  });
});

const remaining = computed(() => todos.value.filter((t) => !t.done).length);
const completedCount = computed(() => todos.value.filter((t) => t.done).length);

const emptyMessage = computed(() => {
  if (activeFilter.value === "done") return t("todos.empty.done");
  if (activeFilter.value === "open") return t("todos.empty.open");
  if (activeFilter.value === "urgent") return t("todos.empty.urgent");
  if (activeFilter.value === "overdue") return t("todos.empty.overdue");
  return t("todos.empty.all");
});

const badgeText = computed(() =>
  remaining.value > 0
    ? t("todos.badge_pending", { count: remaining.value })
    : t("todos.badge_done"),
);
</script>

<style scoped>
/* Layout */
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  gap: var(--space-5);
  min-width: 0;
  padding: var(--space-6, 2rem) var(--space-4, 1rem);
}

.todo-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.ml-auto {
  margin-left: auto;
}

/* Header */
.todo-header {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
}

.todo-title {
  font-size: var(--font-size-xl, 1.5rem);
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
  margin: 0;
}

.todo-badge {
  background: var(--color-primary, #6366f1);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  flex-wrap: wrap;
}

.toolbar-right {
  margin-left: auto;
}

.todo-filters {
  display: flex;
  gap: 3px;
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  white-space: nowrap;
  min-height: 32px;
}

.filter-btn.active {
  background: var(--color-primary, #6366f1);
  color: #fff;
}

.todo-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.35rem 2rem 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  min-height: 32px;
}

/* Tag Filter Row */
.tag-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Tags */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--color-surface-hover, #252840);
  color: var(--color-text-muted, #94a3b8);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: 999px;
  font-size: 0.72rem;
  padding: 2px 8px;
  white-space: nowrap;
}

.tag--sm {
  font-size: 0.65rem;
  padding: 1px 6px;
}

.tag--removable {
  background: var(--color-primary, #6366f1);
  border-color: transparent;
  color: #fff;
}

.tag--filter {
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.tag--filter.active {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
  color: #fff;
}

.tag--filter:hover:not(.active) {
  border-color: var(--color-primary, #6366f1);
  color: var(--color-text, #e2e8f0);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
  line-height: 1;
  opacity: 0.8;
}

.tag-remove:hover {
  opacity: 1;
}

/* Todo List */
.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3, 0.75rem);
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 0.75rem 0.875rem;
  transition: border-color 0.2s;
}

.todo-item:hover {
  border-color: var(--color-primary, #6366f1);
}

.todo-item.done {
  opacity: 0.6;
}

.todo-item.priority-middle {
  border-left: 3px solid #f59e0b;
}

.todo-item.priority-high {
  border-left: 3px solid #ef4444;
}

.todo-item.urgent {
  border-color: #d97706;
  box-shadow:
    0 0 0 1px #d9770640,
    0 0 12px 1px #d9770620;
}

/* Checkbox */
.todo-check {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--color-border, #2d3148);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  color: #fff;
  margin-top: 2px;
}

.todo-item.done .todo-check {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
}

.todo-check--sm {
  width: 20px;
  height: 20px;
}

/* Content */
.todo-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.todo-main-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.todo-text {
  font-size: 0.9rem;
  color: var(--color-text, #e2e8f0);
  word-break: break-word;
}

.todo-item.done .todo-text {
  text-decoration: line-through;
  color: var(--color-text-muted, #94a3b8);
}

.urgent-badge {
  font-size: 0.85rem;
}

/* Priority Dot */
.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot--low {
  background: #22c55e;
}

.priority-dot--middle {
  background: #f59e0b;
}

.priority-dot--high {
  background: #ef4444;
}

/* Meta */
.todo-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-text-muted, #94a3b8);
}

.meta-item.overdue {
  color: #ef4444;
}

.meta-link {
  text-decoration: none;
  color: var(--color-primary, #6366f1);
  transition: opacity 0.15s;
}

.meta-link:hover {
  opacity: 0.75;
}

/* Subtasks */
.subtasks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border, #2d3148);
}

.subtask-progress {
  height: 3px;
  background: var(--color-border, #2d3148);
  border-radius: 999px;
  overflow: hidden;
}

.subtask-progress-bar {
  height: 100%;
  background: var(--color-primary, #6366f1);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.subtask-count {
  font-size: 0.72rem;
  color: var(--color-text-muted, #94a3b8);
}

.subtask-toggle {
  background: none;
  border: none;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
  width: fit-content;
}

.subtask-toggle:hover {
  color: var(--color-text, #e2e8f0);
}

.subtask-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subtask-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid var(--color-border, #2d3148);
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  padding: 0.5rem 0.65rem;
  transition: border-color 0.2s;
}

.subtask-item:hover {
  border-color: var(--color-primary, #6366f1);
}

.subtask-item.done .subtask-text {
  text-decoration: line-through;
  color: var(--color-text-muted, #94a3b8);
}

.subtask-item.done .todo-check--sm {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
}

.subtask-text {
  flex: 1;
  font-size: 0.82rem;
  color: var(--color-text, #e2e8f0);
  word-break: break-word;
}

.subtask-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.subtask-actions {
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.subtask-item:hover .subtask-actions {
  opacity: 1;
}

/* Actions */
.todo-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  padding-top: 2px;
}

.todo-item:hover > .todo-actions {
  opacity: 1;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.icon-btn:hover {
  background: var(--color-surface-hover, #252840);
  color: var(--color-text, #e2e8f0);
}

.icon-btn--danger:hover {
  color: #f87171;
}

/* Footer */
.todo-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  padding: var(--space-6, 2rem) 0;
  font-size: 0.9rem;
}

.todo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.8rem;
  padding-top: var(--space-2, 0.5rem);
  border-top: 1px solid var(--color-border, #2d3148);
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: var(--radius, 0.5rem);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary, #6366f1);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #4f46e5);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  border: 1px solid var(--color-border, #2d3148);
}

.btn-ghost:hover {
  background: var(--color-surface-hover, #252840);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface, #1e2130);
  border: 1px solid var(--color-border, #2d3148);
  border-radius: calc(var(--radius, 0.5rem) * 1.5);
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border, #2d3148);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 65vh;
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border, #2d3148);
}

/* Form Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field--center {
  align-items: flex-start;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.todo-input {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.55rem 0.875rem;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.todo-input:focus {
  border-color: var(--color-primary);
}

/* Tag Input */
.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  padding: 0.4rem 0.75rem;
  min-height: 40px;
  cursor: text;
  transition: border-color 0.2s;
}

.tag-input-wrapper:focus-within {
  border-color: var(--color-primary, #6366f1);
}

.tag-input {
  background: none;
  border: none;
  outline: none;
  color: var(--color-text, #e2e8f0);
  font-size: 0.85rem;
  flex: 1;
  min-width: 80px;
}

/* Priority Selector */
.priority-selector {
  display: flex;
  gap: 6px;
}

.priority-btn {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
}

.priority-btn--low.active {
  background: #16a34a22;
  border-color: #22c55e;
  color: #22c55e;
}

.priority-btn--middle.active {
  background: #d9770622;
  border-color: #f59e0b;
  color: #f59e0b;
}

.priority-btn--high.active {
  background: #dc262622;
  border-color: #ef4444;
  color: #ef4444;
}

.priority-btn:hover:not(.active) {
  border-color: var(--color-primary, #6366f1);
  color: var(--color-text, #e2e8f0);
}

/* Urgent Toggle */
.urgent-toggle {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border, #2d3148);
  border-radius: var(--radius, 0.5rem);
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
}

.urgent-toggle.active {
  background: #d9770622;
  border-color: #d97706;
  color: #d97706;
}

/* Animations */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.25s ease;
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* Mobile */
@media (max-width: 767px) {
  .main {
    padding: var(--space-3) var(--space-3, 0.75rem);
    gap: var(--space-3);
  }

  .todo-wrapper {
    gap: var(--space-3, 0.75rem);
  }

  .todo-header {
    gap: var(--space-2);
  }

  .todo-title {
    font-size: 1.1rem;
  }

  .todo-actions {
    opacity: 1;
  }

  .subtask-actions {
    opacity: 1;
  }

  .todo-item {
    padding: 0.65rem 0.75rem;
    gap: 0.6rem;
  }

  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    border-radius: calc(var(--radius, 0.5rem) * 1.5)
      calc(var(--radius, 0.5rem) * 1.5) 0 0;
    max-height: 92dvh;
  }

  .modal-body {
    max-height: 55vh;
  }

  .field-row {
    flex-direction: column;
  }

  .toolbar {
    gap: var(--space-1);
  }

  .todo-filters {
    width: 100%;
  }

  .toolbar-right {
    margin-left: 0;
    width: 100%;
  }

  .todo-select {
    width: 100%;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
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
  .main {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .todo-item {
    padding: 0.5rem 0.6rem;
  }

  .filter-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .todo-check {
    width: 24px;
    height: 24px;
  }
}
</style>
