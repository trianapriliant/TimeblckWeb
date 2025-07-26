
'use client';

import * as React from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer';
import { usePageActions } from '@/hooks/page-actions-provider';

export default function PomodoroPage() {
    const t = useTranslations();
    const { setPageActions } = usePageActions();

    React.useEffect(() => {
        setPageActions({
            title: t.pomodoro.title,
            description: t.pomodoro.description,
        });

        return () => setPageActions(null);
    }, [setPageActions, t]);

    return (
        <div className="container mx-auto p-4 md:p-6">
            <PomodoroTimer />
        </div>
    );
}
