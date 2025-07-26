
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, YAxis, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowDown, ArrowUp, Minus, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

interface CumulativeTrendData {
  date: string;
  score: number;
}

interface CumulativeTrendCardProps {
  cumulativeTrendData: CumulativeTrendData[];
  dailyCumulativeChange: number;
  yAxisMax: number;
}

export function CumulativeTrendCard({
  cumulativeTrendData,
  dailyCumulativeChange,
  yAxisMax,
}: CumulativeTrendCardProps) {
  const t = useTranslations();

  const cumulativeTrendConfig = {
    score: { label: t.reports.score, color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const DailyChangeIcon = dailyCumulativeChange > 0.01 ? ArrowUp : dailyCumulativeChange < -0.01 ? ArrowDown : Minus;
  const dailyChangeColor = dailyCumulativeChange > 0.01 ? 'text-green-500' : dailyCumulativeChange < -0.01 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {t.reports.cumulative_trend_title}
            </CardTitle>
            <CardDescription className="mt-1">{t.reports.cumulative_trend_description}</CardDescription>
          </div>
          <div className={cn('flex items-center text-sm font-semibold shrink-0', dailyChangeColor)}>
            <DailyChangeIcon className="h-4 w-4" />
            <span className="ml-1">{Math.abs(dailyCumulativeChange).toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={cumulativeTrendConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={cumulativeTrendData}
            margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={Math.floor(cumulativeTrendData.length / 5)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, yAxisMax]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line dataKey="score" type="monotone" stroke="var(--color-score)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
