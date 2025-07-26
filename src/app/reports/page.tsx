
'use client';

import * as React from 'react';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useHabits } from '@/hooks/use-habits';
import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { subDays, format, eachDayOfInterval, startOfWeek, endOfToday, startOfToday, getDay, subMonths, subYears, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { type Pillar } from '@/lib/types';
import { DevelopmentRadarCard } from '@/components/reports/DevelopmentRadarCard';
import { TimeDistributionCard } from '@/components/reports/TimeDistributionCard';
import { useTranslations } from '@/hooks/use-translations';
import { MotivationalQuoteCard } from '@/components/reports/MotivationalQuoteCard';
import { CumulativeTrendCard } from '@/components/reports/CumulativeTrendCard';
import { RecapCard } from '@/components/reports/RecapCard';
import { cn } from '@/lib/utils';
import { usePageActions } from '@/hooks/page-actions-provider';

export default function ReportsPage() {
    const t = useTranslations();
    const { setPageActions } = usePageActions();
    const { blocksByDate } = useTimeBlocks();
    const { habits, habitData } = useHabits();
    const { recurringBlocks } = useRecurringBlocks();

    const [radarRange, setRadarRange] = React.useState<'1m' | '3m' | '6m' | '1y'>('1m');
    const [distributionRange, setDistributionRange] = React.useState<'1w' | '1m'>('1w');
    const [recapRange, setRecapRange] = React.useState<'1w' | '1m'>('1w');
    
    React.useEffect(() => {
        setPageActions({
            title: t.reports.title,
            description: t.reports.description,
        });

        return () => setPageActions(null);
    }, [setPageActions, t]);

    const { 
      timeDistributionData,
      radarChartData,
      distributionRangeText,
      cumulativeTrendData,
      dailyCumulativeChange,
      radarRangeText,
      yAxisMax,
      recapCheckIns,
      recapHours,
      recapScore,
      recapConsistency,
      recapChange,
      recapRangeText,
      recapActiveHabits,
      recapPillarsCovered,
      disciplineScore
    } = React.useMemo(() => {
        const today = startOfToday();
        const weekStartsOn = 1; // Monday

        // --- Time Distribution Calculation (based on distributionRange) ---
        let distributionStartDate: Date;
        if (distributionRange === '1w') {
            distributionStartDate = startOfWeek(today, { weekStartsOn });
        } else { // '1m'
            distributionStartDate = subMonths(today, 1);
        }
        const distributionInterval = eachDayOfInterval({ start: distributionStartDate, end: today });
        const distributionRangeText = distributionRange === '1w' ? t.reports.this_week : t.reports.this_month;
        
        const timeDistributionMap = new Map<string, { duration: number; color: any }>();
        distributionInterval.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const blocks = blocksByDate[dateKey] || [];
            blocks.forEach(block => {
                const existing = timeDistributionMap.get(block.title);
                const newDuration = (existing?.duration || 0) + block.duration;
                timeDistributionMap.set(block.title, { duration: newDuration, color: block.color });
            });
            const dayOfWeek = getDay(day);
            recurringBlocks.filter(rb => rb.daysOfWeek.includes(dayOfWeek)).forEach(block => {
                 const existing = timeDistributionMap.get(block.title);
                const newDuration = (existing?.duration || 0) + block.duration;
                timeDistributionMap.set(block.title, { duration: newDuration, color: block.color });
            });
        });

        const timeDistributionData = Array.from(timeDistributionMap.entries())
            .map(([title, data]) => ({ title, duration: data.duration, color: data.color }))
            .sort((a, b) => b.duration - a.duration);
        
        // --- Recap Stats Calculation (based on recapRange) ---
        let recapStartDate: Date;
        let lastPeriodStartDate: Date;
        let daysInRecapPeriod: Date[];
        const recapRangeText = recapRange === '1w' ? t.reports.this_week : t.reports.this_month;

        if (recapRange === '1w') {
            recapStartDate = startOfWeek(today, { weekStartsOn });
            lastPeriodStartDate = subDays(recapStartDate, 7);
            daysInRecapPeriod = eachDayOfInterval({ start: recapStartDate, end: today });
        } else { // '1m'
            recapStartDate = startOfMonth(today);
            lastPeriodStartDate = subMonths(recapStartDate, 1);
            daysInRecapPeriod = eachDayOfInterval({ start: recapStartDate, end: today });
        }
        const lastPeriodEndDate = subDays(recapStartDate, 1);

        let recapCheckIns = 0;
        let lastPeriodCheckins = 0;
        let recapScore = 0;
        const daysWithCheckinsThisPeriod = new Set<string>();
        const activeHabitIdsThisPeriod = new Set<string>();
        const pillarsCoveredThisPeriod = new Set<Pillar>();

        habitData.forEach((intensity, key) => {
            const [habitId, dateStr] = key.split('__');
            if (!dateStr || !habitId) return;

            const [year, month, day] = dateStr.split('-').map(Number);
            const checkinDate = new Date(Date.UTC(year, month - 1, day));
            
            if (checkinDate >= recapStartDate && checkinDate <= today) {
                recapCheckIns++;
                recapScore += (intensity * 5);
                daysWithCheckinsThisPeriod.add(dateStr);
                
                activeHabitIdsThisPeriod.add(habitId);
                const habit = habits.find(h => h.id === habitId);
                if (habit?.pillar) {
                    pillarsCoveredThisPeriod.add(habit.pillar);
                }
            }
            if (checkinDate >= lastPeriodStartDate && checkinDate <= lastPeriodEndDate) {
                lastPeriodCheckins++;
            }
        });
        
        const recapChange = lastPeriodCheckins > 0 
            ? ((recapCheckIns - lastPeriodCheckins) / lastPeriodCheckins) * 100 
            : recapCheckIns > 0 ? 100 : 0;

        const recapConsistency = daysInRecapPeriod.length > 0 ? (daysWithCheckinsThisPeriod.size / daysInRecapPeriod.length) * 100 : 0;
        const recapActiveHabits = activeHabitIdsThisPeriod.size;
        const recapPillarsCovered = pillarsCoveredThisPeriod.size;

        let recapDuration = 0;
        daysInRecapPeriod.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayOfWeek = getDay(day);
            (blocksByDate[dateKey] || []).forEach(b => recapDuration += b.duration);
            recurringBlocks.filter(rb => rb.daysOfWeek.includes(dayOfWeek)).forEach(rb => recapDuration += rb.duration);
        });
        const recapHours = recapDuration * 10 / 60;

        // --- Discipline Score Calculation ---
        let disciplineScore = 0;
        const periodDays = daysInRecapPeriod.length;
        if (periodDays > 0) {
            // Score based on scheduled time vs a target of 6 productive hours per day
            const targetHours = periodDays * 6;
            const timeScore = targetHours > 0 ? Math.min((recapHours / targetHours) * 100, 100) : 0;
            // Score based on habit consistency (already a percentage)
            const habitScore = recapConsistency;
            // Weighted average: 60% time, 40% habits
            disciplineScore = Math.round((timeScore * 0.6) + (habitScore * 0.4));
        }

        // --- Radar & Cumulative Trend Calculation (based on radarRange) ---
        let radarStartDate: Date;
        let radarRangeText: string;
        switch (radarRange) {
            case '3m':
                radarStartDate = subMonths(today, 3);
                radarRangeText = t.reports.last_3_months;
                break;
            case '6m':
                radarStartDate = subMonths(today, 6);
                radarRangeText = t.reports.last_6_months;
                break;
            case '1y':
                radarStartDate = subYears(today, 1);
                radarRangeText = t.reports.last_year;
                break;
            case '1m':
            default:
                radarStartDate = subMonths(today, 1);
                radarRangeText = t.reports.last_month;
                break;
        }
        const radarInterval = { start: radarStartDate, end: endOfToday() };
        const daysInRange = differenceInDays(radarInterval.end, radarInterval.start) + 1;
        
        const pillarScores: Record<Pillar, number> = { Mind: 0, Body: 0, Soul: 0, Social: 0, Wealth: 0 };
        const dailyScoresByPillar = new Map<string, Record<Pillar, number>>();

        habitData.forEach((intensity, key) => {
            const [habitId, dateStr] = key.split('__');
            if (!dateStr) return;
            const [year, month, day] = dateStr.split('-').map(Number);
            const checkinDate = new Date(Date.UTC(year, month - 1, day));

            if (checkinDate >= radarInterval.start && checkinDate <= radarInterval.end) {
                const habit = habits.find(h => h.id === habitId);
                if (habit && habit.pillar) {
                    const score = 5 * intensity;
                    pillarScores[habit.pillar] += score;
                    const dailyData = dailyScoresByPillar.get(dateStr) || { Mind: 0, Body: 0, Soul: 0, Social: 0, Wealth: 0 };
                    dailyData[habit.pillar] += score;
                    dailyScoresByPillar.set(dateStr, dailyData);
                }
            }
        });
        
        const TARGET_SCORE_PER_PILLAR_PER_MONTH = 20 * 15;
        const targetScore = (TARGET_SCORE_PER_PILLAR_PER_MONTH / 30) * daysInRange;

        const radarChartData = (Object.keys(pillarScores) as Pillar[]).map(pillar => {
            const score = pillarScores[pillar];
            const percentage = targetScore > 0 ? (score / targetScore) * 100 : 0;
            return { subject: pillar, value: Math.min(Math.round(percentage), 100), fullMark: 100 };
        });
        
        let cumulativeScore = 0;
        const DAILY_DECAY_RATE = 0.99;
        const cumulativeTrendData = eachDayOfInterval(radarInterval).map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const pillarScoresForDay = dailyScoresByPillar.get(dateStr);
            const dailyTotalScore = pillarScoresForDay ? Object.values(pillarScoresForDay).reduce((sum, score) => sum + score, 0) : 0;
            if (dailyTotalScore > 0) {
                cumulativeScore += dailyTotalScore;
            } else {
                cumulativeScore *= DAILY_DECAY_RATE;
            }
            return { date: format(day, 'd/M'), score: Math.round(cumulativeScore * 100) / 100 };
        });
        
        let dailyCumulativeChange = 0;
        if (cumulativeTrendData.length >= 2) {
            const todayScore = cumulativeTrendData[cumulativeTrendData.length - 1].score;
            const yesterdayScore = cumulativeTrendData[cumulativeTrendData.length - 2].score;
            if (yesterdayScore > 0) {
                dailyCumulativeChange = ((todayScore - yesterdayScore) / yesterdayScore) * 100;
            } else if (todayScore > 0) {
                dailyCumulativeChange = 100;
            }
        } else if (cumulativeTrendData.length === 1 && cumulativeTrendData[0].score > 0) {
            dailyCumulativeChange = 100;
        }

        const maxCumulativeScore = cumulativeTrendData.reduce((max, item) => Math.max(max, item.score), 0);
        const scoreTiers = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
        let yAxisMax = scoreTiers[0];
        for (const tier of scoreTiers) {
            if (maxCumulativeScore < tier) {
                yAxisMax = tier;
                break;
            }
        }
        if (maxCumulativeScore >= yAxisMax) {
            yAxisMax = Math.ceil(maxCumulativeScore / 1000) * 1000;
        }

        return { 
          timeDistributionData, 
          radarChartData, 
          distributionRangeText, 
          cumulativeTrendData, 
          dailyCumulativeChange, 
          radarRangeText, 
          yAxisMax,
          recapCheckIns,
          recapHours,
          recapScore,
          recapConsistency,
          recapChange,
          recapRangeText,
          recapActiveHabits,
          recapPillarsCovered,
          disciplineScore,
        };
    }, [blocksByDate, habitData, habits, recurringBlocks, radarRange, distributionRange, recapRange, t]);
    

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:row-span-2 order-1">
                    <TimeDistributionCard
                        distributionRange={distributionRange}
                        onDistributionRangeChange={setDistributionRange}
                        timeDistributionData={timeDistributionData}
                        distributionRangeText={distributionRangeText}
                    />
                </div>
                
                <div className="order-2">
                    <DevelopmentRadarCard 
                        radarRange={radarRange}
                        onRadarRangeChange={setRadarRange}
                        radarChartData={radarChartData}
                        radarRangeText={radarRangeText}
                    />
                </div>
                
                <div className="order-4 lg:order-3">
                    <RecapCard
                        recapRange={recapRange}
                        onRecapRangeChange={setRecapRange}
                        checkIns={recapCheckIns}
                        hours={recapHours}
                        score={recapScore}
                        consistency={recapConsistency}
                        change={recapChange}
                        rangeText={recapRangeText}
                        activeHabits={recapActiveHabits}
                        pillarsCovered={recapPillarsCovered}
                        disciplineScore={disciplineScore}
                    />
                </div>
                
                <div className="lg:col-span-2 order-3 lg:order-4">
                    <CumulativeTrendCard
                        cumulativeTrendData={cumulativeTrendData}
                        dailyCumulativeChange={dailyCumulativeChange}
                        yAxisMax={yAxisMax}
                    />
                </div>
                
                <div className="lg:col-span-2 order-5">
                    <MotivationalQuoteCard />
                </div>
            </div>
        </div>
    );
}
