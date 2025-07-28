
'use client';

import * as React from 'react';
import { useCountdowns } from '@/hooks/countdown-provider';
import { usePageActions } from '@/hooks/page-actions-provider';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownCard } from '@/components/countdown/countdown-card';
import { Plus, Timer } from 'lucide-react';
import { AddEditCountdownSheet } from '@/components/countdown/add-edit-countdown-sheet';
import type { Countdown } from '@/lib/types';

export default function CountdownPage() {
    const t = useTranslations();
    const { setPageActions } = usePageActions();
    const { countdowns } = useCountdowns();

    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedCountdown, setSelectedCountdown] = React.useState<Countdown | null>(null);

    const handleAdd = React.useCallback(() => {
        setSelectedCountdown(null);
        setSheetOpen(true);
    }, []);

    React.useEffect(() => {
        setPageActions({
            title: t.nav.countdown,
            description: t.countdown.description,
            fab: {
                label: t.countdown.add_button,
                action: handleAdd,
            },
        });
        return () => setPageActions(null);
    }, [setPageActions, t, handleAdd]);

    const handleEdit = (countdown: Countdown) => {
        setSelectedCountdown(countdown);
        setSheetOpen(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="space-y-4">
                {countdowns.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <Timer className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-medium mt-4">{t.countdown.empty_title}</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                   {t.countdown.empty_description}
                                </p>
                                <Button onClick={handleAdd} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" /> {t.countdown.add_button}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {countdowns.map((countdown) => (
                            <CountdownCard
                                key={countdown.id}
                                countdown={countdown}
                                onEdit={() => handleEdit(countdown)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AddEditCountdownSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                countdown={selectedCountdown}
            />
        </div>
    );
}
