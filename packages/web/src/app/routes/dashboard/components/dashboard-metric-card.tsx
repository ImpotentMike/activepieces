import { ArrowDownRight, ArrowUpRight, LucideIcon, Minus } from 'lucide-react';

import { PfCard, PfCardMeta, PfCardMetaRow } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import { DashboardQueryState, PfTrend } from '../lib/dashboard-data';

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  subtitle,
  trend,
  higherIsBetter = true,
  meta,
  state,
}: DashboardMetricCardProps) {
  const isLoading = state === 'loading';
  const isError = state === 'error';

  return (
    <PfCard data-slot="dashboard-metric-card" className="h-full gap-3">
      <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        {label}
      </h3>

      <div className="flex items-end justify-between gap-3">
        {isLoading ? (
          <span
            aria-hidden="true"
            className="my-0.5 inline-block h-9 w-24 animate-pulse rounded-md bg-muted"
          />
        ) : (
          <span className="text-[34px] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {isError ? '—' : value}
            {!isError && unit ? (
              <span className="ml-1 text-base font-medium text-muted-foreground">
                {unit}
              </span>
            ) : null}
          </span>
        )}
        {!isLoading && !isError && trend ? (
          <TrendPill trend={trend} higherIsBetter={higherIsBetter} />
        ) : null}
      </div>

      {!isLoading && subtitle ? (
        <p className="m-0 text-[12.5px] text-muted-foreground">{subtitle}</p>
      ) : null}

      {!isError && meta && meta.length > 0 ? (
        <PfCardMeta>
          {meta.map((row) => (
            <PfCardMetaRow key={row.label} label={row.label}>
              {isLoading ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-3.5 w-10 animate-pulse rounded bg-muted"
                />
              ) : (
                <span className="tabular-nums">{row.value}</span>
              )}
            </PfCardMetaRow>
          ))}
        </PfCardMeta>
      ) : null}
    </PfCard>
  );
}

function TrendPill({
  trend,
  higherIsBetter,
}: {
  trend: PfTrend;
  higherIsBetter: boolean;
}) {
  const Icon =
    trend.direction === 'up'
      ? ArrowUpRight
      : trend.direction === 'down'
      ? ArrowDownRight
      : Minus;
  const isGood =
    trend.direction === 'flat'
      ? null
      : (trend.direction === 'up') === higherIsBetter;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium tabular-nums',
        isGood === null && 'bg-muted text-muted-foreground',
        isGood === true &&
          'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
        isGood === false &&
          'bg-destructive-100 text-destructive-700 dark:bg-destructive-950 dark:text-destructive-300',
      )}
    >
      <Icon className="size-3" />
      {trend.value}
    </span>
  );
}

export type DashboardMetricCardMetaRow = {
  label: string;
  value: React.ReactNode;
};

export type DashboardMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  unit?: string;
  subtitle?: string;
  trend?: PfTrend;
  higherIsBetter?: boolean;
  meta?: DashboardMetricCardMetaRow[];
  state: DashboardQueryState;
};
