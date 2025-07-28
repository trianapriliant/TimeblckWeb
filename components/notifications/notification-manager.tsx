
'use client';
import * as React from 'react';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useAppNotifications, type UpcomingReminder } from '@/hooks/app-notifications-provider';
import { format, getDay } from 'date-fns';
import { useInbox } from '@/hooks/inbox-provider';

export function NotificationManager() {
  const { blocksByDate } = useTimeBlocks();
  const { recurringBlocks } = useRecurringBlocks();
  const { items: inboxItems } = useInbox();
  const { permission } = useNotificationPermission();
  const { setUpcomingReminders } = useAppNotifications();
  const [notifiedBrowserIds, setNotifiedBrowserIds] = React.useState(new Set<string>());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const newUpcomingReminders: UpcomingReminder[] = [];

      // Check Time Block Reminders
      const dateKey = format(now, 'yyyy-MM-dd');
      const dayOfWeek = getDay(now);

      const oneOffBlocks = blocksByDate[dateKey] || [];
      const recurring = recurringBlocks
        .filter((rb) => rb.daysOfWeek.includes(dayOfWeek))
        .map((rb) => ({ ...rb, id: `recurring-${rb.id}`, isRecurring: true }));
      
      const allBlocksForToday = [...oneOffBlocks, ...recurring];

      allBlocksForToday.forEach(block => {
        const leadTime = (block as any).reminderLeadTime ?? 0;
        if (leadTime > 0) {
          const startHour = Math.floor(block.startTime / 6);
          const startMinute = (block.startTime % 6) * 10;
          const blockStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
          const timeDiffMinutes = (blockStartDate.getTime() - now.getTime()) / (1000 * 60);

          if (timeDiffMinutes > 0 && timeDiffMinutes <= leadTime) {
            newUpcomingReminders.push({
              id: block.id,
              title: block.title,
              timeToStart: Math.ceil(timeDiffMinutes),
              color: block.color,
              type: 'block'
            });
            if (permission === 'granted' && !notifiedBrowserIds.has(`block-${block.id}`)) {
              new Notification('Upcoming Time Block', {
                body: `${block.title} is starting in ${Math.ceil(timeDiffMinutes)} minutes.`,
                icon: '/icon.svg',
              });
              setNotifiedBrowserIds(prev => new Set(prev).add(`block-${block.id}`));
            }
          }
        }
      });

      // Check Inbox Item Deadline Reminders
      inboxItems.forEach(item => {
        const leadTime = item.reminderLeadTime ?? 0;
        if (item.deadline && leadTime > 0) {
            const deadlineDate = new Date(item.deadline);
            const timeDiffMinutes = (deadlineDate.getTime() - now.getTime()) / (1000 * 60);

            if (timeDiffMinutes > 0 && timeDiffMinutes <= leadTime) {
                 newUpcomingReminders.push({
                    id: item.id,
                    title: item.title,
                    timeToStart: Math.ceil(timeDiffMinutes),
                    color: 'red', // Deadlines are always red for now
                    type: 'deadline'
                 });
                 if (permission === 'granted' && !notifiedBrowserIds.has(`deadline-${item.id}`)) {
                    new Notification('Upcoming Deadline', {
                        body: `Deadline for "${item.title}" is approaching in about ${Math.ceil(timeDiffMinutes / 60)} hours.`,
                        icon: '/icon.svg',
                    });
                    setNotifiedBrowserIds(prev => new Set(prev).add(`deadline-${item.id}`));
                 }
            }
        }
      });

      // Update the global state for the UI
      setUpcomingReminders(newUpcomingReminders.sort((a,b) => a.timeToStart - b.timeToStart));

    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [permission, blocksByDate, recurringBlocks, inboxItems, notifiedBrowserIds, setUpcomingReminders]);

  // Effect to clear the notified IDs at midnight
  React.useEffect(() => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const msUntilMidnight = endOfDay.getTime() - now.getTime() + 1;

    const timeoutId = setTimeout(() => {
      setNotifiedBrowserIds(new Set());
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
