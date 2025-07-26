
'use client';

import * as React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { usePageActions } from '@/hooks/page-actions-provider';
import { useAchievements } from '@/hooks/achievements-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AchievementsPage() {
    const t = useTranslations();
    const { setPageActions } = usePageActions();
    const { achievements, isLoaded } = useAchievements();

    React.useEffect(() => {
        setPageActions({
            title: t.achievements.title,
            description: t.achievements.description,
        });

        return () => setPageActions(null);
    }, [setPageActions, t]);

    if (!isLoaded) {
      return (
        <div className="container mx-auto p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 25 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6 pb-2 flex flex-col items-center justify-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
                <CardFooter className="pb-4 justify-center">
                   <Skeleton className="h-4 w-1/2" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {achievements.map((ach) => {
                    const Icon = ach.icon;
                    return (
                        <Card 
                            key={ach.id} 
                            className={cn(
                                'flex flex-col items-center justify-center text-center transition-all',
                                !ach.unlockedDate && 'bg-muted/50 text-muted-foreground'
                            )}
                        >
                            <CardContent className="p-6 pb-2">
                                <div className={cn(
                                    'mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all',
                                    ach.unlockedDate 
                                        ? 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 text-white'
                                        : 'bg-background/50 border'
                                )}>
                                    <Icon className="h-10 w-10" />
                                </div>
                                <CardTitle className={cn("text-base", ach.unlockedDate && 'text-foreground')}>{ach.title}</CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    {ach.description}
                                </CardDescription>
                            </CardContent>
                             <CardFooter className="pb-4">
                                {ach.unlockedDate ? (
                                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        <span>{t.achievements.unlocked_on} {format(new Date(ach.unlockedDate), 'yyyy-MM-dd')}</span>
                                    </div>
                                ) : (
                                     <div className="flex items-center text-xs text-muted-foreground">
                                        <Lock className="h-3 w-3 mr-1" />
                                        <span>{t.achievements.locked}</span>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
