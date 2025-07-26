
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockDistributionChart } from '@/components/reports/block-distribution-chart';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type BlockColor } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimeDistributionData {
  title: string;
  duration: number;
  color: BlockColor;
}

interface TimeDistributionCardProps {
  distributionRange: '1w' | '1m';
  onDistributionRangeChange: (range: '1w' | '1m') => void;
  timeDistributionData: TimeDistributionData[];
  distributionRangeText: string;
}

export function TimeDistributionCard({
  distributionRange,
  onDistributionRangeChange,
  timeDistributionData,
  distributionRangeText,
}: TimeDistributionCardProps) {
  const t = useTranslations();
  const { rows: distRows, cols: distCols } = distributionRange === '1w'
    ? { rows: 14, cols: 12 }
    : { rows: 29, cols: 25 };
    
  const [showAll, setShowAll] = React.useState(false);
  const displayedData = showAll ? timeDistributionData : timeDistributionData.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{t.reports.time_distribution_title}</CardTitle>
            <CardDescription>{t.reports.time_distribution_description(distributionRangeText)}</CardDescription>
          </div>
          <Tabs value={distributionRange} onValueChange={(v) => onDistributionRangeChange(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="1w">{t.reports.this_week}</TabsTrigger>
              <TabsTrigger value="1m">{t.reports.this_month}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          <BlockDistributionChart data={timeDistributionData} rows={distRows} cols={distCols} />
          {timeDistributionData.length > 0 && (
            <div className="pt-4">
                <ul className="space-y-2 text-sm">
                  {displayedData.map(item => {
                    const isCustomColor = item.color.startsWith('#');
                    const style = isCustomColor ? { backgroundColor: item.color } : {};
                    const className = !isCustomColor ? (BLOCK_COLORS[item.color as keyof typeof BLOCK_COLORS]?.solid || '') : '';
                    return (
                      <li key={item.title} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={style} className={cn("h-3 w-3 rounded-full", className)} />
                          <span>{item.title}</span>
                        </div>
                        <span className="font-medium">
                          {(item.duration * 10 / 60).toFixed(1)} {t.reports.hours}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {timeDistributionData.length > 5 && (
                    <Button
                        variant="ghost"
                        className="w-full mt-2 text-muted-foreground"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? (
                            <>
                                {t.reports.show_less} <ChevronUp className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                             <>
                                {t.reports.show_more} ({timeDistributionData.length - 5} {t.reports.more}) <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
