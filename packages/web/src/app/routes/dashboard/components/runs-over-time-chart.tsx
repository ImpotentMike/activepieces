import { FlowRunCountByDay } from '@activepieces/shared';
import { t } from 'i18next';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import { PfCard } from '@/components/custom/pf-card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { dashboardData, DashboardQueryState } from '../lib/dashboard-data';

const CHART_HEIGHT_CLASS = 'h-[280px]';
const ELEVATED_FAILURE_RATE = 0.05;
const CHART_MARGIN = { left: 0, right: 16, top: 16, bottom: 0 } as const;

export function RunsOverTimeChart({ series, state }: RunsOverTimeChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  const isEmpty = state === 'ready' && series.every((day) => day.total === 0);

  const totals = dashboardData.sumSeries(series);
  const dayCount = Math.max(1, series.length);
  const average = totals.total / dayCount;
  const peak = series.reduce((max, day) => Math.max(max, day.total), 0);
  const failureRate = dashboardData.failureRatePercent({
    total: totals.total,
    failed: totals.failed,
  });
  const healthLevel =
    failureRate === null ? null : dashboardData.failureRateLevel(failureRate);

  const incidents = series.filter(
    (day) => day.total > 0 && day.failed / day.total >= ELEVATED_FAILURE_RATE,
  );

  return (
    <PfCard data-slot="dashboard-runs-over-time" className="gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
            <BarChart3
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            {t('Runs over time')}
          </h3>
          <p className="m-0 mt-0.5 text-[12.5px] text-muted-foreground">
            {t('Daily run volume, with failure incidents flagged')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state === 'ready' && healthLevel ? (
            <span
              data-slot="chart-health-pill"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
                HEALTH_PILL_CLASS[healthLevel],
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  HEALTH_DOT_CLASS[healthLevel],
                )}
              />
              {t(HEALTH_LABEL[healthLevel])}
            </span>
          ) : null}
          <Tabs
            value={chartType}
            onValueChange={(value) =>
              setChartType(value === 'bar' ? 'bar' : 'line')
            }
          >
            <TabsList className="h-8" aria-label={t('Chart type')}>
              <TabsTrigger value="line" className="text-xs">
                {t('Line chart')}
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs">
                {t('Bar chart')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {state === 'ready' && !isEmpty ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <LegendItem>
            <span
              aria-hidden="true"
              className="h-2 w-4 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, hsl(var(--primary-500)), hsl(var(--primary-200)))',
              }}
            />
            {t('Runs')}
          </LegendItem>
          <LegendItem>
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full border-2 border-destructive-500 bg-background"
            />
            {t('Failure incident')}
          </LegendItem>
          <LegendItem>
            <span
              aria-hidden="true"
              className="h-0 w-4 border-t-2 border-dashed border-gray-400"
            />
            {t('Daily average')}
          </LegendItem>
          <span className="ml-auto text-[12px] text-muted-foreground">
            {t('{total} runs · avg {avgPerDay}/day · peak {peak}', {
              total: nf(totals.total),
              avgPerDay: nf(Math.round(average)),
              peak: nf(peak),
            })}
          </span>
        </div>
      ) : null}

      {state === 'loading' ? (
        <div
          aria-hidden="true"
          className={cn(
            CHART_HEIGHT_CLASS,
            'w-full animate-pulse rounded-md bg-gray-100',
          )}
        />
      ) : state === 'error' ? (
        <div
          className={cn(
            CHART_HEIGHT_CLASS,
            'flex w-full items-center justify-center',
          )}
        >
          <p className="text-sm text-muted-foreground">
            {t('Couldn’t load run activity.')}
          </p>
        </div>
      ) : isEmpty ? (
        <div
          className={cn(
            CHART_HEIGHT_CLASS,
            'flex w-full flex-col items-center justify-center gap-2',
          )}
        >
          <BarChart3
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            {t('No runs in this period yet.')}
          </p>
        </div>
      ) : chartType === 'bar' ? (
        <RunsBarChart series={series} average={average} incidents={incidents} />
      ) : (
        <RunsAreaChart
          series={series}
          average={average}
          incidents={incidents}
        />
      )}
    </PfCard>
  );
}

function RunsAreaChart({ series, average, incidents }: RunsChartProps) {
  const chartConfig = {
    total: { label: t('Runs'), color: 'hsl(var(--primary-600))' },
    failed: { label: t('Failed'), color: 'hsl(var(--destructive-500))' },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(CHART_HEIGHT_CLASS, 'aspect-auto w-full')}
    >
      <ComposedChart accessibilityLayer data={series} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id="pf-runs-area" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-total)"
              stopOpacity={0.28}
            />
            <stop
              offset="70%"
              stopColor="var(--color-total)"
              stopOpacity={0.06}
            />
            <stop
              offset="100%"
              stopColor="var(--color-total)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          interval="preserveStartEnd"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={formatShortDay}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          allowDecimals={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
          content={<RunsChartTooltip />}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          strokeWidth={2.5}
          fill="url(#pf-runs-area)"
          dot={false}
          activeDot={{
            r: 4,
            strokeWidth: 2,
            stroke: 'var(--color-total)',
            fill: 'hsl(var(--background))',
          }}
        />
        <ReferenceLine
          y={average}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          strokeWidth={1.5}
          label={{
            value: t('avg {value}/day', { value: nf(Math.round(average)) }),
            position: 'insideTopRight',
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="failed"
          stroke="var(--color-failed)"
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
        {incidents.map((day) => (
          <ReferenceDot
            key={`incident-halo-${day.day}`}
            x={day.day}
            y={day.failed}
            r={6.5}
            fill="hsl(var(--destructive-500) / 0.16)"
            stroke="none"
            ifOverflow="extendDomain"
          />
        ))}
        {incidents.map((day) => (
          <ReferenceDot
            key={`incident-ring-${day.day}`}
            x={day.day}
            y={day.failed}
            r={3.6}
            fill="hsl(var(--background))"
            stroke="hsl(var(--destructive-500))"
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        ))}
      </ComposedChart>
    </ChartContainer>
  );
}

function RunsBarChart({ series, average, incidents }: RunsChartProps) {
  const chartConfig = {
    succeeded: { label: t('Succeeded'), color: 'hsl(var(--primary-500))' },
    failed: { label: t('Failed'), color: 'hsl(var(--destructive-500))' },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(CHART_HEIGHT_CLASS, 'aspect-auto w-full')}
    >
      <ComposedChart
        accessibilityLayer
        data={series}
        margin={CHART_MARGIN}
        barCategoryGap="24%"
      >
        <defs>
          <linearGradient id="pf-runs-bar" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-succeeded)"
              stopOpacity={0.95}
            />
            <stop
              offset="100%"
              stopColor="var(--color-succeeded)"
              stopOpacity={0.5}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={20}
          interval="preserveStartEnd"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={formatShortDay}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          allowDecimals={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.5)', radius: 4 }}
          content={<RunsChartTooltip />}
        />
        <Bar
          dataKey="succeeded"
          stackId="runs"
          fill="url(#pf-runs-bar)"
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
          activeBar={{ fill: 'hsl(var(--primary-600))' }}
        />
        <Bar
          dataKey="failed"
          stackId="runs"
          fill="var(--color-failed)"
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
          activeBar={{ fill: 'hsl(var(--destructive-600))' }}
        />
        <ReferenceLine
          y={average}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          strokeWidth={1.5}
          label={{
            value: t('avg {value}/day', { value: nf(Math.round(average)) }),
            position: 'insideTopRight',
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 11,
          }}
        />
        {incidents.map((day) => (
          <ReferenceDot
            key={`bar-incident-${day.day}`}
            x={day.day}
            y={day.total}
            r={3.4}
            fill="hsl(var(--background))"
            stroke="hsl(var(--destructive-500))"
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        ))}
      </ComposedChart>
    </ChartContainer>
  );
}

function LegendItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-gray-600 dark:text-gray-300">
      {children}
    </span>
  );
}

function RunsChartTooltip({ active, payload }: RunsChartTooltipProps) {
  const day = payload?.[0]?.payload;
  if (!active || !day) {
    return null;
  }
  const rate = day.total > 0 ? (day.failed / day.total) * 100 : 0;
  return (
    <div className="min-w-[170px] rounded-lg border border-border/60 bg-background px-3 py-2.5 text-xs shadow-xl">
      <div className="mb-2 font-semibold text-foreground">
        {formatLongDay(day.day)}
      </div>
      <TooltipRow color="hsl(var(--primary-600))" label={t('Total')}>
        {nf(day.total)}
      </TooltipRow>
      <TooltipRow color="hsl(var(--success-500))" label={t('Succeeded')}>
        {nf(day.succeeded)}
      </TooltipRow>
      <TooltipRow color="hsl(var(--destructive-500))" label={t('Failed')}>
        {`${nf(day.failed)} (${rate.toFixed(1)}%)`}
      </TooltipRow>
    </div>
  );
}

function TooltipRow({
  color,
  label,
  children,
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-2 rounded-[2px]"
          style={{ background: color }}
        />
        {label}
      </span>
      <span className="font-mono font-medium tabular-nums text-foreground">
        {children}
      </span>
    </div>
  );
}

function nf(value: number): string {
  return value.toLocaleString();
}

function formatShortDay(day: string): string {
  return new Date(day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatLongDay(day: string): string {
  return new Date(day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const HEALTH_LABEL = {
  healthy: 'Healthy',
  elevated: 'Elevated',
  high: 'High',
} as const;

const HEALTH_PILL_CLASS = {
  healthy: 'bg-success-100 text-success-700',
  elevated: 'bg-warning-100 text-warning-700',
  high: 'bg-destructive-100 text-destructive-700',
} as const;

const HEALTH_DOT_CLASS = {
  healthy: 'bg-success-600',
  elevated: 'bg-warning-600',
  high: 'bg-destructive-600',
} as const;

type ChartType = 'line' | 'bar';

type RunsChartTooltipProps = {
  active?: boolean;
  payload?: { payload?: FlowRunCountByDay }[];
};

type RunsChartProps = {
  series: FlowRunCountByDay[];
  average: number;
  incidents: FlowRunCountByDay[];
};

type RunsOverTimeChartProps = {
  series: FlowRunCountByDay[];
  state: DashboardQueryState;
};
