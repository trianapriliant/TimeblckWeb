
'use client';

import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

type RadarChartData = {
  subject: string;
  value: number;
  fullMark: number;
}[];

interface DevelopmentRadarCardProps {
  radarRange: '1m' | '3m' | '6m' | '1y';
  onRadarRangeChange: (range: '1m' | '3m' | '6m' | '1y') => void;
  radarChartData: RadarChartData;
  radarRangeText: string;
}

const radarChartConfig = {
  value: { label: 'Score' },
};

export function DevelopmentRadarCard({
  radarRange,
  onRadarRangeChange,
  radarChartData,
  radarRangeText,
}: DevelopmentRadarCardProps) {
  const t = useTranslations();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              {t.reports.radar_title}
            </CardTitle>
            <CardDescription>{t.reports.radar_description(radarRangeText)}</CardDescription>
          </div>
          <Tabs value={radarRange} onValueChange={(v) => onRadarRangeChange(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 items-center">
        <ChartContainer config={radarChartConfig} className="mx-auto aspect-square h-[250px]">
          <RadarChart data={radarChartData} outerRadius="70%">
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
