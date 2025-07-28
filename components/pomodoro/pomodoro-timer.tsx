
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePomodoro } from '@/hooks/pomodoro-provider';
import type { PomodoroMode, PomodoroTechnique } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DotGrid = ({ count, elapsed, colorClass, breakCount, breakColorClass }: { count: number; elapsed: number; colorClass: string; breakCount: number; breakColorClass: string }) => {
  return (
    <div className="flex flex-col gap-1.5 items-center">
       <div className="flex flex-wrap gap-1.5 justify-center w-full max-w-sm">
        {Array.from({ length: count }).map((_, i) => (
            <div 
                key={`work-${i}`}
                className={cn(
                    "h-3 w-3 rounded-full transition-colors duration-500",
                    i < elapsed ? 'bg-muted/50' : colorClass
                )}
            />
        ))}
      </div>
      {breakCount > 0 && (
         <div className="flex flex-wrap gap-1.5 justify-center w-full max-w-sm">
           {Array.from({ length: breakCount }).map((_, i) => (
                <div 
                    key={`break-${i}`}
                    className={cn(
                        "h-2 w-2 rounded-full",
                        breakColorClass
                    )}
                />
            ))}
        </div>
      )}
    </div>
  )
};


export function PomodoroTimer() {
  const t = useTranslations();
  const {
    settings,
    mode,
    secondsLeft,
    isActive,
    sessionsCompleted,
    isLoaded,
    technique,
    customSettings,
    audioRef,
    handleStartPause,
    handleReset,
    setMode,
    saveSettings,
    setTechnique,
  } = usePomodoro();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [tempSettings, setTempSettings] = React.useState(customSettings);

  React.useEffect(() => {
    setTempSettings(customSettings);
  }, [customSettings]);

  const handleSettingsChange = (field: 'work' | 'shortBreak' | 'longBreak' | 'longBreakInterval', value: string) => {
    if (value === '') {
      setTempSettings(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue) && numValue >= 0 && numValue < 1000) {
      setTempSettings(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSaveSettings = () => {
    const newSettings = {
      work: Math.max(1, Number(tempSettings.work) || 1),
      shortBreak: Math.max(1, Number(tempSettings.shortBreak) || 1),
      longBreak: Math.max(1, Number(tempSettings.longBreak) || 1),
      longBreakInterval: Math.max(1, Number(tempSettings.longBreakInterval) || 1),
    };
    
    saveSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const openSettingsDialog = () => {
    setTempSettings(customSettings); // Load latest custom settings on open
    setIsSettingsOpen(true);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const modeDetails = {
    work: {
        title: t.pomodoro.focus_time,
        color: 'bg-primary',
        totalMinutes: settings.work,
        breakMinutes: (sessionsCompleted + 1) % settings.longBreakInterval === 0 ? settings.longBreak : settings.shortBreak,
        breakColor: (sessionsCompleted + 1) % settings.longBreakInterval === 0 ? 'bg-blue-500/50' : 'bg-green-500/50'
    },
    short_break: {
        title: t.pomodoro.short_break,
        color: 'bg-green-500',
        totalMinutes: settings.shortBreak,
        breakMinutes: 0,
        breakColor: '',
    },
    long_break: {
        title: t.pomodoro.long_break,
        color: 'bg-blue-500',
        totalMinutes: settings.longBreak,
        breakMinutes: 0,
        breakColor: '',
    }
  };
  
  const techniqueDetails = {
    pomodoro: "Pomodoro (25/5)",
    '52_17': "52/17 Rule",
    ultradian: "Ultradian (90/20)",
    custom: "Custom"
  };

  const { title, color, totalMinutes, breakMinutes, breakColor } = modeDetails[mode];
  const elapsedMinutes = totalMinutes > 0 ? totalMinutes - Math.ceil(secondsLeft / 60) : 0;

  if (!isLoaded) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
            <div className="h-20 w-48 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-md mx-auto">
        <CardHeader className="items-center text-center">
          <Tabs value={technique} onValueChange={(val) => setTechnique(val as PomodoroTechnique)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="52_17">52/17</TabsTrigger>
              <TabsTrigger value="ultradian">Ultradian</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
           <CardTitle className="text-2xl mt-4">{title}</CardTitle>
           <CardDescription>{t.pomodoro.sessions_completed.replace('{count}', String(sessionsCompleted))} &bull; {techniqueDetails[technique]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="font-mono text-7xl md:text-8xl font-bold tracking-tighter">
              {timeDisplay}
          </div>

          <DotGrid 
            count={totalMinutes}
            elapsed={elapsedMinutes}
            colorClass={color}
            breakCount={mode === 'work' ? breakMinutes : 0}
            breakColorClass={breakColor}
          />
          
          <div className="flex items-center gap-2">
              <Button onClick={handleStartPause} size="lg" className="px-12">
                {isActive ? t.pomodoro.pause : t.pomodoro.start}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                {t.pomodoro.reset}
              </Button>
              <Button onClick={openSettingsDialog} variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="h-6 w-6" />
              </Button>
          </div>
        </CardContent>
        <CardFooter>
          {typeof window !== 'undefined' && <audio ref={audioRef} src="data:audio/mp3;base64,SUQzBAAAAAAAIVRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXAzAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAASsAAADIQNLVAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-AahgAABUAAAAAAAADSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMhZgAAEAAD//+8ANgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4WloAASAALP//+8WQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADtrWgAAGQAf//34wSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-AahgAAGQAw///88WQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8aGgAAZgD//4///40AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" />}
        </CardFooter>
      </Card>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
            <DialogDescription>
              Adjust the durations for your Pomodoro sessions (in minutes). This will set the technique to "Custom".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="work-duration" className="text-right">
                Work
              </Label>
              <Input
                id="work-duration"
                type="number"
                value={tempSettings.work}
                onChange={(e) => handleSettingsChange('work', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="short-break-duration" className="text-right">
                Short Break
              </Label>
              <Input
                id="short-break-duration"
                type="number"
                value={tempSettings.shortBreak}
                onChange={(e) => handleSettingsChange('shortBreak', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="long-break-duration" className="text-right">
                Long Break
              </Label>
              <Input
                id="long-break-duration"
                type="number"
                value={tempSettings.longBreak}
                onChange={(e) => handleSettingsChange('longBreak', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="long-break-interval" className="text-right">
                Interval
              </Label>
              <Input
                id="long-break-interval"
                type="number"
                value={tempSettings.longBreakInterval}
                onChange={(e) => handleSettingsChange('longBreakInterval', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
