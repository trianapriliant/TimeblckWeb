
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { Lock, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppSettings } from '@/hooks/use-app-settings';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';

const presetHours = [0, 3, 4, 5];
const allHours = Array.from({ length: 24 }, (_, i) => i);

const BlockStylePreview = ({ shape }: { shape: AppSettings['blockShape'] }) => {
  if (shape === 'solid') {
    return (
      <div className="w-full h-24 bg-muted/50 rounded-lg p-2 flex gap-1">
        <div className="w-4 bg-background rounded-sm" />
        <div className="flex-1 relative">
          <div className="absolute top-2 left-2 w-1/2 h-8 bg-blue-500 rounded" />
          <div className="absolute top-12 left-4 w-2/3 h-10 bg-orange-500 rounded" />
        </div>
      </div>
    );
  }

  const isRounded = shape === 'rounded';
  return (
    <div className="w-full h-24 bg-muted/50 rounded-lg p-2 flex flex-col gap-1">
      <div className="h-1/3 flex items-center gap-1">
        <div className={cn("h-4 w-1/4 bg-blue-500", isRounded && "rounded-sm")} />
        <div className={cn("h-4 w-1/3 bg-blue-500", isRounded && "rounded-sm")} />
      </div>
      <div className="h-1/3 flex items-center gap-1">
        <div className={cn("h-4 w-1/2 ml-4 bg-orange-500", isRounded && "rounded-sm")} />
      </div>
      <div className="h-1/3 flex items-center gap-1">
         <div className={cn("h-4 w-1/3 ml-8 bg-fuchsia-500", isRounded && "rounded-sm")} />
      </div>
    </div>
  );
};


export default function AppearanceSettingsPage() {
  const t = useTranslations();
  const { settings, updateSettings, isLoaded } = useAppSettings();
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);
  
  const isCustomHour = isLoaded && !presetHours.includes(settings.startHour);
  const radioValue = isCustomHour ? 'custom' : settings.startHour.toString();

  const handleRadioChange = (value: string) => {
    if (value === 'custom') {
      if (!settings.isPremium) {
        setPremiumDialogOpen(true);
      } else {
        updateSettings({ startHour: 6 });
      }
    } else {
      updateSettings({ startHour: parseInt(value, 10) });
    }
  };

  const handleCustomHourChange = (value: string) => {
    updateSettings({ startHour: parseInt(value, 10) });
  };
  
  const handleLanguageChange = (value: 'id' | 'en') => {
    updateSettings({ language: value });
  };

  const handleTimeFormatChange = (value: '12h' | '24h') => {
    updateSettings({ timeFormat: value });
  };

  const handleBlockShapeChange = (value: AppSettings['blockShape']) => {
    updateSettings({ blockShape: value });
  };

  const formatHour = (hour: number, timeFormat: '12h' | '24h') => {
    const date = new Date();
    date.setHours(hour, 0);
    if (timeFormat === '24h') {
      return `${String(hour).padStart(2, '0')}:00`;
    }
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{t.appearance.title}</h1>
        <p className="text-muted-foreground mb-6">
          {t.appearance.description}
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.appearance.block_style_title}</CardTitle>
              <CardDescription>{t.appearance.block_style_description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['rounded', 'sharp', 'solid'] as const).map((shape) => (
                      <div
                        key={shape}
                        onClick={() => handleBlockShapeChange(shape)}
                        className={cn(
                          "rounded-lg border-2 p-4 cursor-pointer transition-all relative",
                          settings.blockShape === shape ? "border-primary shadow-lg" : "border-muted hover:border-muted-foreground/50"
                        )}
                      >
                          {settings.blockShape === shape && (
                              <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4" />
                              </div>
                          )}
                        <BlockStylePreview shape={shape} />
                        <p className="font-medium text-center mt-3 capitalize">{shape}</p>
                      </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.appearance.start_time_title}</CardTitle>
              <CardDescription>{t.appearance.start_time_description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-36" />
                </div>
              ) : (
                <>
                  <RadioGroup
                    value={radioValue}
                    onValueChange={handleRadioChange}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="h-0" />
                      <Label htmlFor="h-0">{t.appearance.midnight}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="h-3" />
                      <Label htmlFor="h-3">3:00 AM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="h-4" />
                      <Label htmlFor="h-4">4:00 AM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="h-5" />
                      <Label htmlFor="h-5">5:00 AM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="h-custom" />
                      <Label 
                        htmlFor="h-custom" 
                        onClick={(e) => { if (!settings.isPremium) e.preventDefault(); }} 
                        className={cn('flex items-center', !settings.isPremium && 'text-muted-foreground cursor-pointer')}
                      >
                        {t.appearance.custom_time}
                        {!settings.isPremium && <Lock className="inline h-3 w-3 ml-1.5" />}
                      </Label>
                    </div>
                  </RadioGroup>
                  {radioValue === 'custom' && settings.isPremium && (
                    <div className="pl-8 pt-4">
                      <Select
                          value={settings.startHour.toString()}
                          onValueChange={handleCustomHourChange}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select an hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {allHours.map(hour => (
                              <SelectItem key={hour} value={hour.toString()}>
                                {formatHour(hour, settings.timeFormat)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t.appearance.time_format_title}</CardTitle>
              <CardDescription>{t.appearance.time_format_description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : (
                <RadioGroup
                  value={settings.timeFormat}
                  onValueChange={handleTimeFormatChange as (value: string) => void}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12h" id="tf-12h" />
                    <Label htmlFor="tf-12h">{t.appearance.time_format_12h}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="tf-24h" />
                    <Label htmlFor="tf-24h">{t.appearance.time_format_24h}</Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.appearance.language_title}</CardTitle>
              <CardDescription>{t.appearance.language_description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : (
                <RadioGroup
                  value={settings.language}
                  onValueChange={handleLanguageChange as (value: string) => void}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="id" id="lang-id" />
                    <Label htmlFor="lang-id">Bahasa Indonesia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en">English</Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <PremiumOfferDialog
          open={premiumDialogOpen}
          onOpenChange={setPremiumDialogOpen}
      />
    </>
  );
}
