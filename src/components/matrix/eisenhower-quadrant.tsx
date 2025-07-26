
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EisenhowerTaskCard } from './eisenhower-task-card';
import type { InboxItem } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';

interface EisenhowerQuadrantProps {
  title: string;
  description: string;
  items: InboxItem[];
  onEditItem: (item: InboxItem) => void;
  quadrant: 'URGENT_IMPORTANT' | 'NOT_URGENT_IMPORTANT' | 'URGENT_NOT_IMPORTANT' | 'NOT_URGENT_NOT_IMPORTANT';
  color: string;
}

export function EisenhowerQuadrant({ title, description, items, onEditItem, quadrant, color }: EisenhowerQuadrantProps) {
  const t = useTranslations();
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-2 md:p-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: color }} />
          <div>
            <CardTitle className="text-[10px] font-bold md:text-xs">{title}</CardTitle>
            <CardDescription className="text-[10px] mt-0 md:text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 p-1.5 pt-0 md:p-2.5 md:pt-0">
        {items.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground pt-4 md:pt-8">
            <p>{t.matrix.empty_quadrant}</p>
          </div>
        ) : (
          items.map(item => (
            <EisenhowerTaskCard key={item.id} item={item} onEdit={() => onEditItem(item)} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
