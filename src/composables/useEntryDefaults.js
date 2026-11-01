// src/composables/useEntryDefaults.js

export function getDefaultWorkplace(settings) {
    return settings.defaultWorkplace === 'homeoffice'
        ? 'homeoffice'
        : 'on-site'
}