
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Clock, Star, Percent, ArrowDown, ArrowUp, Minus, ListChecks, Layers, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DisciplineMeter } from './DisciplineMeter';


interface RecapCardProps {
    recapRange: '1w' | '1m';
    onRecapRangeChange: (range: '1w' | '1m') => void;
    checkIns: number;
    hours: number;
    score: number;
    consistency: number;
    change: number;
    rangeText: string;
    activeHabits: number;
    pillarsCovered: number;
    disciplineScore: number;
}

const StatCard = ({ icon: Icon, title, value, unit, change, changeText }: { icon: React.ElementType, title: string, value: string | number, unit?: string, change?: number, changeText?: string }) => {
    const ComparisonIcon = change === undefined ? null : change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
    const comparisonColor = change === undefined ? '' : change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground';

    return (
        <div className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className="h-4 w-4" />
                <h4 className="text-sm font-medium">{title}</h4>
            </div>
            <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold">{value}</p>
                {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
            </div>
             {ComparisonIcon && changeText && (
                <div className={cn('flex items-center text-xs mt-1', comparisonColor)}>
                    <ComparisonIcon className="h-3 w-3 mr-0.5" />
                    <span>{change.toFixed(0)}% {changeText}</span>
                </div>
            )}
        </div>
    );
};

export function RecapCard({ checkIns, hours, score, consistency, change, recapRange, onRecapRangeChange, rangeText, activeHabits, pillarsCovered, disciplineScore }: RecapCardProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
                <CardTitle className="text-lg">{t.reports.recap_title}</CardTitle>
                <CardDescription>{t.reports.recap_description(rangeText)}</CardDescription>
            </div>
             <Tabs value={recapRange} onValueChange={(v) => onRecapRangeChange(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                    <TabsTrigger value="1w">{t.reports.this_week}</TabsTrigger>
                    <TabsTrigger value="1m">{t.reports.this_month}</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            <StatCard 
                icon={CheckCircle}
                title={t.reports.total_check_ins}
                value={checkIns}
                change={change}
                changeText={t.reports.vs_last_period}
            />
            <StatCard
                icon={Clock}
                title={t.reports.scheduled_hours}
                value={hours.toFixed(1)}
                unit={t.reports.hours}
            />
            <StatCard
                icon={Star}
                title={t.reports.habit_score}
                value={score}
                unit={t.reports.points}
            />
            <StatCard
                icon={Percent}
                title={t.reports.consistency}
                value={consistency.toFixed(0)}
                unit="%"
            />
            <StatCard
                icon={ListChecks}
                title={t.reports.active_habits}
                value={activeHabits}
                unit={t.reports.habits_unit}
            />
             <StatCard
                icon={Layers}
                title={t.reports.pillars_covered}
                value={`${pillarsCovered} / 5`}
                unit={t.reports.pillars_unit}
            />
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-muted-foreground text-sm">
                <Gauge className="h-4 w-4" />
                {t.reports.discipline_meter_title}
            </h4>
            <DisciplineMeter score={disciplineScore} size="sm" />
        </div>

      </CardContent>
    </Card>
  );
}
