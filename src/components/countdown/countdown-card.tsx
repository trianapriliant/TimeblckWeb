
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { cn, getContrastingTextColor } from '@/lib/utils';
import type { Countdown } from '@/lib/types';
import { Icon } from '@/components/shared/icon-map';
import { BLOCK_COLORS } from '@/lib/types';
import { format, differenceInSeconds } from 'date-fns';
import { MoreVertical, Pen, Trash2 } from 'lucide-react';
import { useCountdowns } from '@/hooks/countdown-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

interface CountdownCardProps {
  countdown: Countdown;
  onEdit: () => void;
}

const TimeValue = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl lg:text-5xl font-bold font-mono tracking-tighter">{String(value).padStart(2, '0')}</span>
    <span className="text-xs uppercase tracking-wider text-inherit opacity-75">{label}</span>
  </div>
);

export function CountdownCard({ countdown, onEdit }: CountdownCardProps) {
  const t = useTranslations();
  const { deleteCountdown } = useCountdowns();
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(countdown.targetDate);
      const now = new Date();
      const totalSeconds = differenceInSeconds(target, now);

      if (totalSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [countdown.targetDate]);

  const isCustomColor = countdown.color.startsWith('#');
  const colorClasses = !isCustomColor ? BLOCK_COLORS[countdown.color as keyof typeof BLOCK_COLORS] : null;
  const style = isCustomColor ? { 
    backgroundColor: countdown.color, 
    color: getContrastingTextColor(countdown.color) 
  } : {};

  return (
    <>
      <Card 
        className={cn('flex flex-col', !isCustomColor && colorClasses?.solid, !isCustomColor && colorClasses?.foreground)}
        style={style}
      >
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <Icon name={countdown.icon} className="w-6 h-6" />
            <div className="flex-1">
              <CardTitle>{countdown.title}</CardTitle>
              <CardDescription className={cn('opacity-80', isCustomColor && 'text-inherit')}>
                {format(new Date(countdown.targetDate), 'PPP')}
              </CardDescription>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pen className="mr-2 h-4 w-4" />
                  <span>{t.common.edit}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsConfirmingDelete(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t.common.delete}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="grid grid-cols-4 gap-2 text-center w-full">
            <TimeValue value={timeLeft.days} label={t.countdown.days} />
            <TimeValue value={timeLeft.hours} label={t.countdown.hours} />
            <TimeValue value={timeLeft.minutes} label={t.countdown.minutes} />
            <TimeValue value={timeLeft.seconds} label={t.countdown.seconds} />
          </div>
        </CardContent>
      </Card>
       <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.are_you_sure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.countdown.delete_confirmation.replace('{title}', countdown.title)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmingDelete(false)}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteCountdown(countdown.id)}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
