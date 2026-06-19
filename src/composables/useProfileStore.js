// src/composables/useProfileStore.js

import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

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

export const useProfileStore = defineStore('profile', () => {
    const stored = localStorage.getItem('profile')
    const profile = reactive(stored ? JSON.parse(stored) : { ...defaultProfile })

    function persist() {
        localStorage.setItem('profile', JSON.stringify(profile))
    }

    function resetProfile() {
        Object.assign(profile, { ...defaultProfile, skills: [] })
        localStorage.removeItem('profile')
    }

    return {
        profile,
        persist,
        resetProfile
    }
})
