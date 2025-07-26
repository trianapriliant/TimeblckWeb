
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DisciplineMeter } from './DisciplineMeter';
import { useTranslations } from '@/hooks/use-translations';
import { Gauge } from 'lucide-react';

interface DisciplineMeterCardProps {
  score: number;
  range: '1w' | '1m';
}

export function DisciplineMeterCard({ score, range }: DisciplineMeterCardProps) {
  const t = useTranslations();
  const rangeText = range === '1w' ? t.reports.this_week : t.reports.this_month;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5" />
            {t.reports.discipline_meter_title}
        </CardTitle>
        <CardDescription>{t.reports.discipline_meter_description(rangeText)}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <DisciplineMeter score={score} />
      </CardContent>
    </Card>
  );
}
