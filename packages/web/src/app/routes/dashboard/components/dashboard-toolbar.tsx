import dayjs from 'dayjs';
import { t } from 'i18next';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const RANGE_OPTIONS: ReadonlyArray<{ days: number; labelKey: string }> = [
  { days: 7, labelKey: 'Last 7 days' },
  { days: 14, labelKey: 'Last 14 days' },
  { days: 30, labelKey: 'Last 30 days' },
];

export function DashboardToolbar({
  rangeDays,
  onRangeChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: DashboardToolbarProps) {
  return (
    <div
      data-slot="dashboard-toolbar"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <Select
        value={String(rangeDays)}
        onValueChange={(value) => onRangeChange(Number(value))}
      >
        <SelectTrigger size="sm" className="w-[150px] font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.days} value={String(option.days)}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-muted-foreground"
      >
        <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
        {lastUpdated
          ? t('Updated {time}', { time: dayjs(lastUpdated).format('h:mm A') })
          : t('Refresh')}
      </Button>
    </div>
  );
}

export type DashboardToolbarProps = {
  rangeDays: number;
  onRangeChange: (days: number) => void;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
};
