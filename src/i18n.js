// src/i18n.js

import { createI18n } from 'vue-i18n'
import de from './locales/de.json'
import en from './locales/en.json'

const savedLocale = localStorage.getItem('locale') || 'de'

export const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'en',
    messages: { de, en }
})
