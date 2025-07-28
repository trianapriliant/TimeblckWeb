
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface DisciplineMeterProps {
  score: number;
  size?: 'sm' | 'default';
}

const getLevelLabel = (score: number, t: any) => {
    if (score <= 15) return t.reports.discipline_level_1;
    if (score <= 35) return t.reports.discipline_level_2;
    if (score <= 65) return t.reports.discipline_level_3;
    if (score <= 85) return t.reports.discipline_level_4;
    return t.reports.discipline_level_5;
};

export function DisciplineMeter({ score, size = 'default' }: DisciplineMeterProps) {
  const t = useTranslations();
  const levelLabel = getLevelLabel(score, t);
  const isSmall = size === 'sm';

  return (
    <div className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-xs mx-auto",
        isSmall ? 'py-0 space-y-2' : 'py-4 space-y-3'
    )}>
       {/* Score and level text */}
       <div className="flex flex-col items-center text-center">
        <span className={cn(
            "font-bold tracking-tight",
            isSmall ? 'text-3xl' : 'text-4xl'
        )}>{score}</span>
        <span 
            className={cn(
                "font-semibold uppercase tracking-widest rounded-md border text-foreground/80",
                isSmall ? 'text-xs px-1.5 py-0.5 mt-1' : 'text-sm px-2 py-1'
            )}
        >
            {levelLabel}
        </span>
      </div>

      {/* Meter blocks visualization */}
      <div className="w-full">
        <div className="flex w-full gap-1">
          {Array.from({ length: 12 }).map((_, index) => {
            const step = 100 / 12;
            const isActive = (index + 1) * step <= score;
            return (
              <div 
                key={index} 
                className={cn(
                  "flex-1 rounded-sm",
                  isSmall ? 'h-3' : 'h-4',
                  isActive ? 'bg-foreground' : 'bg-muted'
                )} 
              />
            );
          })}
        </div>
      </div>
     
      {/* Labels at the bottom */}
      <div className={cn(
          "flex justify-between w-full text-muted-foreground",
          isSmall ? 'mt-2 text-[10px]' : 'mt-2 text-xs'
      )}>
        <span>{t.reports.discipline_lazy}</span>
        <span>{t.reports.discipline_disciplined}</span>
      </div>
    </div>
  );
}
