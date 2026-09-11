import { FlowRunCountByDay } from '@activepieces/shared';
import { t } from 'i18next';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';

import { PfCard } from '@/components/custom/pf-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { DashboardQueryState } from '../../dashboard/lib/dashboard-data';
import { rndDashboardData } from '../lib/rnd-dashboard-data';
import { rndStyles } from '../lib/rnd-styles';

import { RndTrendPill } from './rnd-trend-pill';

const PLOT_HEIGHT = 'h-[232px]';

export function RunVolumePanel({ series, state }: RunVolumePanelProps) {
  const [range, setRange] = useState<RunVolumeRange>('14');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const days = Number(range);
  const visible = series.slice(-days);
  const stats = rndDashboardData.windowStats({ series, days });
  const maxTotal = Math.max(1, ...visible.map((day) => day.total));
  const peakIndex = visible.reduce(
    (best, day, index) => (day.total > visible[best].total ? index : best),
    0,
  );
  const activeIndex = hoverIndex ?? peakIndex;
  const ticks = buildTicks(maxTotal);
  const labelStep = Math.max(1, Math.ceil(visible.length / 8));
  const isEmpty = state === 'ready' && stats.total === 0;

  return (
    <PfCard data-slot="rnd-run-volume" className={cn(rndStyles.panel, 'gap-5')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h3 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
            {t('Run volume')}
          </h3>
          <p className="m-0 mt-0.5 text-[12.5px] text-muted-foreground">
            {t('Daily executions across all workflows')}
          </p>
        </div>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(normalizeRange(value))}
        >
          <TabsList className="h-8 rounded-full bg-muted p-0.5">
            {RANGES.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="rounded-full px-3 text-[12px] data-[state=active]:shadow-sm"
              >
                {t(option.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
        <HeadlineStat
          label={t('Succeeded')}
          value={stats.succeeded}
          state={state}
          dotClassName="bg-success-500"
        />
        <HeadlineStat
          label={t('Failed')}
          value={stats.failed}
          state={state}
          dotClassName="bg-destructive-500"
          trend={stats.failedTrend}
          invertTrend
        />
        <span className="ms-auto self-start pt-1 text-[12px] text-muted-foreground tabular-nums">
          {t('{total} runs total', { total: nf(stats.total) })}
        </span>
      </div>

      {state === 'loading' ? (
        <div
          aria-hidden="true"
          className={cn(
            PLOT_HEIGHT,
            'w-full animate-pulse rounded-xl bg-muted',
          )}
        />
      ) : state === 'error' ? (
        <PlotMessage>{t('Couldn’t load run activity.')}</PlotMessage>
      ) : isEmpty ? (
        <PlotMessage icon>{t('No runs in this period yet.')}</PlotMessage>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <div
              aria-hidden="true"
              className={cn(
                PLOT_HEIGHT,
                'flex w-9 shrink-0 flex-col justify-between py-0 text-right text-[10.5px] text-muted-foreground tabular-nums',
              )}
            >
              {ticks.map((value) => (
                <span key={value} className="leading-none">
                  {nf(value)}
                </span>
              ))}
            </div>

            <div
              className="relative min-w-0 flex-1"
              role="img"
              aria-label={t(
                'Daily run volume over {days} days. {total} runs total, peak {peak} on {day}.',
                {
                  days,
                  total: nf(stats.total),
                  peak: nf(visible[peakIndex]?.total ?? 0),
                  day: formatDay(visible[peakIndex]?.day ?? ''),
                },
              )}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 flex flex-col justify-between"
              >
                {ticks.map((value, index) => (
                  <span
                    key={value}
                    className={cn(
                      'h-px w-full',
                      index === ticks.length - 1
                        ? 'bg-muted'
                        : 'border-t border-dashed border-border',
                    )}
                  />
                ))}
              </div>

              <div
                className={cn(
                  PLOT_HEIGHT,
                  'relative flex items-end gap-[3px] sm:gap-1.5',
                )}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {visible.map((day, index) => (
                  <Bar
                    key={day.day}
                    day={day}
                    heightPct={
                      day.total === 0 ? 1.5 : 5 + (day.total / maxTotal) * 81
                    }
                    active={index === activeIndex}
                    align={edgeAlign(index, visible.length)}
                    onActivate={() => setHoverIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <span aria-hidden="true" className="w-9 shrink-0" />
            <div className="flex min-w-0 flex-1 gap-[3px] sm:gap-1.5">
              {visible.map((day, index) => {
                const show = index % labelStep === 0 || index === activeIndex;
                return (
                  <span
                    key={day.day}
                    className={cn(
                      'min-w-0 flex-1 truncate text-center text-[10.5px] tabular-nums',
                      index === activeIndex
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {show ? formatShortDay(day.day) : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PfCard>
  );
}

function Bar({ day, heightPct, active, align, onActivate }: BarProps) {
  return (
    <div
      data-slot="rnd-bar"
      className="group/bar relative flex h-full min-w-0 flex-1 items-end"
      onMouseEnter={onActivate}
    >
      {active ? (
        <div
          className={cn(
            'absolute z-20 rounded-xl border border-border bg-popover px-3 py-2 shadow-lg',
            align === 'start' && 'left-0',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'end' && 'right-0',
          )}
          style={{ bottom: `calc(min(${heightPct}%, 58%) + 10px)` }}
        >
          <CalloutRow dotClassName="bg-primary-600" label={t('Runs')}>
            {nf(day.total)}
          </CalloutRow>
          <CalloutRow dotClassName="bg-destructive-500" label={t('Failed')}>
            {nf(day.failed)}
          </CalloutRow>
        </div>
      ) : null}

      <span
        className={cn(
          'w-full rounded-t-[5px] transition-[height] duration-300 ease-out',
          active ? 'bg-primary-600' : 'bg-muted',
        )}
        style={{
          height: `${heightPct}%`,
          backgroundImage: active
            ? `${rndStyles.stripesAccent}, linear-gradient(to top, hsl(var(--primary-600)), hsl(var(--primary-400)))`
            : rndStyles.stripesNeutral,
        }}
      />
    </div>
  );
}

function edgeAlign(index: number, count: number): CalloutAlign {
  if (index <= 1) return 'start';
  if (index >= count - 2) return 'end';
  return 'center';
}

function CalloutRow({ dotClassName, label, children }: CalloutRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap py-px text-[12px]">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', dotClassName)} />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">
        {children}
      </span>
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  state,
  dotClassName,
  trend,
  invertTrend = false,
}: HeadlineStatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground">
        <span className={cn('size-2 rounded-full', dotClassName)} />
        {label}
      </span>
      <div className="flex items-center gap-2">
        {state === 'loading' ? (
          <span
            aria-hidden="true"
            className="my-1 inline-block h-7 w-16 animate-pulse rounded-md bg-muted"
          />
        ) : (
          <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {nf(value)}
          </span>
        )}
        {state === 'ready' && trend ? (
          <RndTrendPill {...trend} invert={invertTrend} />
        ) : null}
      </div>
    </div>
  );
}

function PlotMessage({
  children,
  icon = false,
}: {
  children: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <div
      className={cn(
        PLOT_HEIGHT,
        'flex w-full flex-col items-center justify-center gap-2',
      )}
    >
      {icon ? (
        <BarChart3
          aria-hidden="true"
          className="size-6 text-muted-foreground"
        />
      ) : null}
      <p className="m-0 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function buildTicks(maxTotal: number): number[] {
  const step = niceStep(maxTotal / 3);
  const top = Math.max(step, Math.ceil(maxTotal / step) * step);
  return [top, Math.round((top / 3) * 2), Math.round(top / 3), 0];
}

function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return Math.max(1, nice * magnitude);
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

function formatDay(day: string): string {
  if (!day) return '—';
  return new Date(day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function normalizeRange(value: string): RunVolumeRange {
  return value === '7' || value === '30' ? value : '14';
}

const RANGES: ReadonlyArray<{ value: RunVolumeRange; labelKey: string }> = [
  { value: '7', labelKey: '7 days' },
  { value: '14', labelKey: '14 days' },
  { value: '30', labelKey: '30 days' },
];

type RunVolumeRange = '7' | '14' | '30';

type RunVolumePanelProps = {
  series: FlowRunCountByDay[];
  state: DashboardQueryState;
};

type CalloutAlign = 'start' | 'center' | 'end';

type BarProps = {
  day: FlowRunCountByDay;
  heightPct: number;
  active: boolean;
  align: CalloutAlign;
  onActivate: () => void;
};

type CalloutRowProps = {
  dotClassName: string;
  label: string;
  children: React.ReactNode;
};

type HeadlineStatProps = {
  label: string;
  value: number;
  state: DashboardQueryState;
  dotClassName: string;
  trend?: ReturnType<typeof rndDashboardData.windowStats>['failedTrend'];
  invertTrend?: boolean;
};
