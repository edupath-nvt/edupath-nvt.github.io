import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
    en: { translation: en },
    vi: { translation: vi },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: localStorage.getItem('i18nextLng') || 'vi',
        supportedLngs: ['en', 'vi'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;