
'use client';

import * as React from 'react';
import { Bell, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppNotifications } from '@/hooks/app-notifications-provider';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';

export function NotificationBell() {
    const t = useTranslations();
    const { upcomingReminders } = useAppNotifications();
    const reminderCount = upcomingReminders.length;

    const formatTimeLeft = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
        return `${Math.round(minutes / 1440)} d`;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-6 w-6" />
                    {reminderCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {reminderCount}
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{t.notifications.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {t.notifications.description}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {reminderCount > 0 ? (
                            upcomingReminders.map(reminder => {
                                const isCustomColor = reminder.color.startsWith('#');
                                const colorClass = !isCustomColor ? BLOCK_COLORS[reminder.color as keyof typeof BLOCK_COLORS]?.solid || BLOCK_COLORS.slate.solid : '';
                                const style = isCustomColor ? { backgroundColor: reminder.color } : {};

                                const Icon = reminder.type === 'deadline' ? Flag : Clock;
                                const text = reminder.type === 'deadline' 
                                    ? t.notifications.deadline_in
                                    : t.notifications.starting_in;
                                
                                return (
                                    <div key={reminder.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0 last:border-b-0 border-b">
                                        <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', colorClass)} style={style} />
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium leading-none">
                                                {reminder.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Icon className="h-3 w-3" />
                                                {text.replace('{minutes}', formatTimeLeft(reminder.timeToStart))}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                {t.notifications.all_caught_up}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
