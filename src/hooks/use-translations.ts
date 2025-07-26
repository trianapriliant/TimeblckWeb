
'use client';

import { useAppSettings } from './app-settings-provider';
import { translations } from '@/lib/translations';

export function useTranslations() {
    const { settings } = useAppSettings();
    return translations[settings.language] || translations.id;
}
