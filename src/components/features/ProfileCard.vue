<!-- src/components/features/ProfileCard.vue -->

<template>
    <div class="profile-wrapper">

        <!-- Avatar + Name Banner -->
        <div class="profile-hero">
            <div class="avatar-ring">
                <img v-if="profile.avatarUrl" :src="profile.avatarUrl" class="avatar-img" alt="Avatar" />
                <span v-else class="avatar-initials">{{ initials }}</span>
                <button class="avatar-edit-btn" @click="triggerAvatarUpload" title="Bild ändern">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13"
                        height="13">
                        <path
                            d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                </button>
                <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarChange" />
            </div>

            <div class="hero-info">
                <h1 class="hero-name">{{ profile.displayName || 'Your Name' }}</h1>
                <p class="hero-role">{{ profile.role || 'Role / Title' }}</p>
                <div class="hero-badges">
                    <span v-if="profile.location" class="badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="11"
                            height="11">
                            <path fill-rule="evenodd"
                                d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.173 15.173 0 0 0 2.046-2.082C11.81 11.235 13 9.255 13 7A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.174 15.174 0 0 0 2.046 2.082 8.597 8.597 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ profile.location }}
                    </span>
                    <span v-if="profile.status" class="badge badge--status" :class="`badge--${profile.status}`">
                        <span class="status-dot"></span>
                        {{ statusLabel }}
                    </span>
                </div>
            </div>

            <button class="btn btn-ghost btn-sm edit-hero-btn" @click="openEditModal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path
                        d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
                Edit Profile
            </button>
        </div>

        <!-- Bio -->
        <div v-if="profile.bio" class="profile-card">
            <h2 class="card-title">About</h2>
            <p class="bio-text">{{ profile.bio }}</p>
        </div>

        <!-- Contact -->
        <div class="profile-card">
            <h2 class="card-title">Contact</h2>
            <div class="contact-grid">
                <a v-if="profile.email" :href="`mailto:${profile.email}`" class="contact-item">
                    <span class="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16"
                            height="16">
                            <path
                                d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                            <path
                                d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                        </svg>
                    </span>
                    <div class="contact-info">
                        <span class="contact-label">E-Mail</span>
                        <span class="contact-value">{{ profile.email }}</span>
                    </div>
                </a>

                <a v-if="profile.phone" :href="`tel:${profile.phone}`" class="contact-item">
                    <span class="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16"
                            height="16">
                            <path fill-rule="evenodd"
                                d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                                clip-rule="evenodd" />
                        </svg>
                    </span>
                    <div class="contact-info">
                        <span class="contact-label">Phone</span>
                        <span class="contact-value">{{ profile.phone }}</span>
                    </div>
                </a>

                <a v-if="profile.website" :href="profile.website" target="_blank" class="contact-item">
                    <span class="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16"
                            height="16">
                            <path
                                d="M10 1a9 9 0 100 18A9 9 0 0010 1zM6.94 5.5a7.5 7.5 0 00-3.428 6H6.5A14.25 14.25 0 016.94 5.5zM6.5 13H3.512a7.5 7.5 0 003.428 6 14.25 14.25 0 01-.44-6zm1.5 0v6.472A7.5 7.5 0 0010 19.5a7.5 7.5 0 002-.028V13H8zm0-1.5h4V6.028A7.5 7.5 0 0010 6a7.5 7.5 0 00-2 .028V11.5zm5.5 0h2.988a7.5 7.5 0 00-3.428-6c.25 1.93.39 3.954.44 6zm0 1.5c-.05 2.046-.19 4.07-.44 6a7.5 7.5 0 003.428-6H13.5z" />
                        </svg>
                    </span>
                    <div class="contact-info">
                        <span class="contact-label">Website</span>
                        <span class="contact-value">{{ profile.website.replace(/^https?:\/\//, '') }}</span>
                    </div>
                </a>

                <a v-if="profile.github" :href="`https://github.com/${profile.github}`" target="_blank"
                    class="contact-item">
                    <span class="contact-icon contact-icon--github">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16"
                            height="16">
                            <path
                                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    </span>
                    <div class="contact-info">
                        <span class="contact-label">GitHub</span>
                        <span class="contact-value">@{{ profile.github }}</span>
                    </div>
                </a>

                <div v-if="!hasAnyContact" class="contact-empty">
                    No contact info yet. Click "Edit Profile" to add some.
                </div>
            </div>
        </div>

        <!-- Skills / Tags -->
        <div v-if="profile.skills.length" class="profile-card">
            <h2 class="card-title">Skills</h2>
            <div class="skills-list">
                <span v-for="skill in profile.skills" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
        </div>

        <!-- Edit Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="modal.open" class="modal-backdrop" @mousedown.self="closeModal">
                    <div class="modal">
                        <header class="modal-header">
                            <h2 class="modal-title">Edit Profile</h2>
                            <button class="icon-btn" @click="closeModal">✕</button>
                        </header>

                        <div class="modal-body">
                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Display Name</label>
                                    <input v-model="form.displayName" class="form-input" type="text"
                                        placeholder="John Doe" />
                                </div>
                                <div class="field">
                                    <label class="field-label">Role / Title</label>
                                    <input v-model="form.role" class="form-input" type="text"
                                        placeholder="Software Developer" />
                                </div>
                            </div>

                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Location</label>
                                    <input v-model="form.location" class="form-input" type="text"
                                        placeholder="Stuttgart, DE" />
                                </div>
                                <div class="field">
                                    <label class="field-label">Status</label>
                                    <select v-model="form.status" class="form-input form-select">
                                        <option value="">None</option>
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="away">Away</option>
                                    </select>
                                </div>
                            </div>

                            <div class="field">
                                <label class="field-label">Bio</label>
                                <textarea v-model="form.bio" class="form-input form-textarea" rows="3"
                                    placeholder="A few words about you..." />
                            </div>

                            <div class="field">
                                <label class="field-label">E-Mail</label>
                                <input v-model="form.email" class="form-input" type="email"
                                    placeholder="mail@example.com" />
                            </div>

                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Phone</label>
                                    <input v-model="form.phone" class="form-input" type="tel"
                                        placeholder="+49 123 456789" />
                                </div>
                                <div class="field">
                                    <label class="field-label">Website</label>
                                    <input v-model="form.website" class="form-input" type="url"
                                        placeholder="https://..." />
                                </div>
                            </div>

                            <div class="field">
                                <label class="field-label">GitHub Username</label>
                                <input v-model="form.github" class="form-input" type="text" placeholder="username" />
                            </div>

                            <div class="field">
                                <label class="field-label">Skills</label>
                                <div class="tag-input-wrapper">
                                    <span v-for="skill in form.skills" :key="skill" class="tag tag--removable">
                                        {{ skill }}
                                        <button class="tag-remove" @click="removeSkill(skill)">×</button>
                                    </span>
                                    <input v-model="skillInput" class="tag-input" type="text"
                                        placeholder="Enter skill + press Enter" @keydown.enter.prevent="addSkill"
                                        @keydown.comma.prevent="addSkill" />
                                </div>
                            </div>
                        </div>

                        <footer class="modal-footer">
                            <button class="btn btn-ghost" @click="closeModal">Cancel</button>
                            <button class="btn btn-primary" @click="saveModal">Save</button>
                        </footer>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useProfileStore } from '@/composables/useProfileStore'

// State
const profileStore = useProfileStore()

const stored = localStorage.getItem('profile')
const defaultProfile = {
    displayName: '',
    role: '',
    location: '',
    status: 'available',
    bio: '',
    email: '',
    phone: '',
    website: '',
    github: '',
    avatarUrl: '',
    skills: [],
}

const profile = profileStore.profile

function persist() { profileStore.persist() }

// Avatar
const avatarInput = ref(null)

function triggerAvatarUpload() { avatarInput.value?.click() }

function onAvatarChange(event) {
    const file = event.target.files?.[0]

    if (!file)
        return

    const reader = new FileReader()
    reader.onload = (ev) => {
        profile.avatarUrl = ev.target.result
        persist()
    }

    reader.readAsDataURL(file)
}

// Computed
const initials = computed(() => {
    const parts = (profile.displayName || 'U').trim().split(' ')

    return parts.length >= 2
        ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
        : parts[0][0].toUpperCase()
})

const statusLabel = computed(() => ({
    available: 'Available',
    busy: 'Busy',
    away: 'Away',
}[profile.status] ?? ''))

const hasAnyContact = computed(() =>
    !!(profile.email || profile.phone || profile.website || profile.github)
)

// Modal
const modal = reactive({ open: false })
const skillInput = ref('')
const form = reactive({ ...defaultProfile, skills: [] })

function openEditModal() {
    Object.assign(form, { ...profile, skills: [...profile.skills] })
    modal.open = true
}

function closeModal() { modal.open = false }

function saveModal() {
    Object.assign(profile, { ...form, skills: [...form.skills] })

    persist()
    closeModal()
}

// Skills
function addSkill() {
    const s = skillInput.value.trim().replace(/,$/, '')

    if (s && !form.skills.includes(s))
        form.skills.push(s)

    skillInput.value = ''
}

function removeSkill(skill) {
    form.skills = form
        .skills
        .filter(sk => sk !== skill)
}
</script>

<style scoped>
/* Profile Wrapper */
.profile-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
}

/* Hero */
.profile-hero {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 1.5rem;
    flex-wrap: wrap;
}

.avatar-ring {
    position: relative;
    flex-shrink: 0;
    width: 72px;
    height: 72px;
}

.avatar-img {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-primary, #6366f1);
}

.avatar-initials {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-primary, #6366f1);
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-primary, #6366f1);
}

.avatar-edit-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    color: var(--color-text-muted, #94a3b8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.avatar-edit-btn:hover {
    background: var(--color-primary, #6366f1);
    color: #fff;
}

.hidden-input {
    display: none;
}

.hero-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.hero-name {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text, #e2e8f0);
}

.hero-role {
    margin: 0;
    font-size: 0.88rem;
    color: var(--color-text-muted, #94a3b8);
}

.hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.edit-hero-btn {
    margin-left: auto;
    align-self: flex-start;
}

/* Badge */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--color-surface-hover, #252840);
    color: var(--color-text-muted, #94a3b8);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: 999px;
    font-size: 0.73rem;
    padding: 2px 9px;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
}

.badge--available {
    color: #22c55e;
    border-color: #22c55e44;
    background: #22c55e11;
}

.badge--busy {
    color: #ef4444;
    border-color: #ef444444;
    background: #ef444411;
}

.badge--away {
    color: #f59e0b;
    border-color: #f59e0b44;
    background: #f59e0b11;
}

/* Profile Card */
.profile-card {
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}

.card-title {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted, #94a3b8);
}

.bio-text {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text, #e2e8f0);
    line-height: 1.65;
}

/* Contact Grid */
.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--color-surface-hover, #252840);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 0.65rem 0.9rem;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
    min-width: 0;
}

.contact-item:hover {
    border-color: var(--color-primary, #6366f1);
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, var(--color-surface-hover, #252840));
}

.contact-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--color-surface, #1e2130);
    border: 1px solid var(--color-border, #2d3148);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary, #6366f1);
    flex-shrink: 0;
}

.contact-icon--github {
    color: var(--color-text, #e2e8f0);
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
}

.contact-label {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted, #94a3b8);
}

.contact-value {
    font-size: 0.82rem;
    color: var(--color-text, #e2e8f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.contact-empty {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 0.85rem;
    color: var(--color-text-muted, #94a3b8);
    padding: 0.75rem 0;
}

/* Skills */
.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.skill-tag {
    display: inline-flex;
    align-items: center;
    background: color-mix(in srgb, var(--color-primary, #6366f1) 15%, transparent);
    color: var(--color-primary, #6366f1);
    border: 1px solid color-mix(in srgb, var(--color-primary, #6366f1) 40%, transparent);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 3px 10px;
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
    max-width: 540px;
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
    gap: 0.35rem;
    flex: 1;
}

.field-row {
    display: flex;
    gap: 0.75rem;
}

.field-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-muted, #94a3b8);
}

.form-input {
    background: var(--color-surface-hover, #252840);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    color: var(--color-text, #e2e8f0);
    padding: 0.45rem 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
}

.form-input:focus {
    border-color: var(--color-primary, #6366f1);
}

.form-textarea {
    resize: vertical;
    min-height: 72px;
    font-family: inherit;
}

.form-select {
    cursor: pointer;
}

/* Tag Input */
.tag-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    background: var(--color-surface-hover, #252840);
    border: 1px solid var(--color-border, #2d3148);
    border-radius: var(--radius, 0.5rem);
    padding: 0.4rem 0.6rem;
    min-height: 40px;
    align-items: center;
    cursor: text;
}

.tag-input-wrapper:focus-within {
    border-color: var(--color-primary, #6366f1);
}

.tag-input {
    background: none;
    border: none;
    outline: none;
    color: var(--color-text, #e2e8f0);
    font-size: 0.82rem;
    flex: 1;
    min-width: 100px;
}

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
}

.tag--removable {
    background: var(--color-primary, #6366f1);
    border-color: transparent;
    color: #fff;
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
    transition: background 0.2s, opacity 0.2s;
    white-space: nowrap;
}

.btn-primary {
    background: var(--color-primary, #6366f1);
    color: #fff;
}

.btn-primary:hover {
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
    transition: background 0.15s, color 0.15s;
}

.icon-btn:hover {
    background: var(--color-surface-hover, #252840);
    color: var(--color-text, #e2e8f0);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.96);
}

/* Mobile */
@media (max-width: 767px) {
    .profile-hero {
        padding: 1rem;
        gap: 1rem;
    }

    .hero-name {
        font-size: 1.15rem;
    }

    .contact-grid {
        grid-template-columns: 1fr;
    }

    .field-row {
        flex-direction: column;
    }

    .modal-backdrop {
        align-items: flex-end;
        padding: 0;
    }

    .modal {
        border-radius: calc(var(--radius, 0.5rem) * 1.5) calc(var(--radius, 0.5rem) * 1.5) 0 0;
        max-height: 92dvh;
    }

    .modal-body {
        max-height: 60vh;
    }

    .edit-hero-btn {
        width: 100%;
        justify-content: center;
        margin-left: 0;
        margin-top: var(--space-1);
    }

    .icon-btn {
        width: 36px;
        height: 36px;
    }
}

/* Small Mobile */
@media (max-width: 420px) {
    .profile-hero {
        padding: 0.875rem;
    }

    .profile-card {
        padding: 1rem;
    }

    .avatar-ring,
    .avatar-img,
    .avatar-initials {
        width: 60px;
        height: 60px;
    }

    .avatar-initials {
        font-size: 1.2rem;
    }

    .hero-name {
        font-size: 1rem;
    }

    .hero-role {
        font-size: 0.82rem;
    }

    .contact-item {
        padding: 0.55rem 0.75rem;
    }
}
</style>
