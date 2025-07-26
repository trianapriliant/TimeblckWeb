
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Check, Lock, Palette, Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useCountdowns } from '@/hooks/countdown-provider';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type Countdown, type BlockColor, type HabitIconName } from '@/lib/types';
import { habitIconNames, Icon } from '@/components/shared/icon-map';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor } from '@/lib/utils';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTranslations } from '@/hooks/use-translations';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  targetDate: z.date({ required_error: 'A target date is required.' }),
  color: z.string(),
  icon: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditCountdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countdown: Countdown | null;
}

export function AddEditCountdownSheet({ open, onOpenChange, countdown }: AddEditCountdownSheetProps) {
  const t = useTranslations();
  const { addCountdown, updateCountdown } = useCountdowns();
  const { settings } = useAppSettings();
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      color: 'lime',
      icon: 'Target',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (countdown) {
        form.reset({
          title: countdown.title,
          targetDate: new Date(countdown.targetDate),
          color: countdown.color,
          icon: countdown.icon,
        });
      } else {
        form.reset({
          title: '',
          targetDate: undefined,
          color: 'lime',
          icon: 'Target',
        });
      }
    }
  }, [open, countdown, form]);

  const onSubmit = (data: FormValues) => {
    const countdownData = {
      title: data.title,
      targetDate: data.targetDate.toISOString(),
      color: data.color as BlockColor,
      icon: data.icon as HabitIconName,
    };
    
    if (countdown) {
      updateCountdown(countdown.id, countdownData);
    } else {
      addCountdown(countdownData);
    }

    onOpenChange(false);
  };

  const content = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1 flex-1">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.countdown.form_title_label}</FormLabel>
                <FormControl>
                  <Input placeholder={t.countdown.form_title_placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t.countdown.form_date_label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t.inbox.pick_a_date}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-2">
                      {habitIconNames.map((iconName) => (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => field.onChange(iconName)}
                          className={cn(
                            'h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-accent/50',
                            field.value === iconName ? 'border-primary' : 'border-transparent'
                          )}
                          aria-label={`Select ${iconName} icon`}
                        >
                          <Icon name={iconName} className={cn('h-5 w-5', field.value === iconName ? 'text-primary' : 'text-muted-foreground')} />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-8 gap-2">
                    {Object.keys(BLOCK_COLORS).map((colorKey) => {
                      const color = BLOCK_COLORS[colorKey as keyof typeof BLOCK_COLORS];
                      if (!color) return null;
                      return (
                        <button
                          type="button"
                          key={colorKey}
                          onClick={() => field.onChange(colorKey)}
                          className={cn(
                            'h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all',
                            color.solid,
                            field.value === colorKey ? 'border-primary' : 'border-transparent'
                          )}
                          aria-label={`Select ${colorKey} color`}
                        >
                          {field.value === colorKey && (
                            <Check className={cn('h-5 w-5', color.foreground)} />
                          )}
                        </button>
                      );
                    })}
                    {settings.isPremium ? (
                      (() => {
                        const isCustomColorSelected = field.value.startsWith('#');
                        return (
                            <button
                            type="button"
                            onClick={() => colorInputRef.current?.click()}
                            className={cn(
                              'relative h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all',
                              !isCustomColorSelected && 'bg-muted/50',
                              isCustomColorSelected ? 'border-primary' : 'border-transparent'
                            )}
                            style={isCustomColorSelected ? { backgroundColor: field.value } : {}}
                            aria-label="Select custom color"
                          >
                            {isCustomColorSelected ? (
                              <Check 
                                className='h-5 w-5'
                                style={{ color: getContrastingTextColor(field.value) }}
                              />
                            ) : (
                              <Palette className="h-5 w-5 text-muted-foreground" />
                            )}
                            <input
                              ref={colorInputRef}
                              type="color"
                              className="absolute h-0 w-0 opacity-0"
                              value={isCustomColorSelected ? field.value : '#a855f7'}
                              onInput={(e) => field.onChange((e.target as HTMLInputElement).value)}
                              tabIndex={-1}
                            />
                          </button>
                        )
                      })()
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPremiumDialogOpen(true)}
                        className="relative h-10 w-10 rounded-lg border flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted"
                        aria-label="Upgrade to unlock custom colors"
                      >
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
  );

  const footer = (
    <DialogFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
      <DialogClose asChild>
        <Button type="button" variant="secondary" className="w-full sm:w-auto">
          {t.common.cancel}
        </Button>
      </DialogClose>
      <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">{countdown ? t.common.edit : t.countdown.add_button}</Button>
    </DialogFooter>
  )

  if (isMobile === undefined) return null;
  
  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader className="text-left">
              <SheetTitle>{countdown ? t.countdown.edit_button : t.countdown.add_button}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[70vh] -mx-6 px-4">
              {content}
            </ScrollArea>
            {footer}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{countdown ? t.countdown.edit_button : t.countdown.add_button}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] -mx-6 px-4">
                {content}
              </ScrollArea>
              {footer}
            </DialogContent>
        </Dialog>
      )}
      <PremiumOfferDialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen} />
    </>
  );
}

    
