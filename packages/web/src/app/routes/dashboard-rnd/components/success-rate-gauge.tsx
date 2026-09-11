import { t } from 'i18next';
import { useEffect, useState } from 'react';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import {
  DashboardQueryState,
  PfTrend,
} from '../../dashboard/lib/dashboard-data';
import { rndStyles } from '../lib/rnd-styles';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';

import { RndTrendPill } from './rnd-trend-pill';

const TICK_COUNT = 34;
const VIEW_W = 240;
const VIEW_H = 138;
const CENTER_X = 120;
const BASELINE_Y = 124;
const RADIUS_OUTER = 104;
const RADIUS_INNER = 84;

export function SuccessRateGauge({
  successRate,
  trend,
  succeeded,
  failed,
  state,
}: SuccessRateGaugeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion]);

  const hasData = state === 'ready' && successRate !== null;
  const ratio = hasData ? Math.min(1, Math.max(0, successRate / 100)) : 0;
  const filledCount = Math.round(ratio * TICK_COUNT);
  const marker = pointOnArc({ ratio, radius: RADIUS_OUTER + 7 });

  return (
    <PfCard
      data-slot="rnd-success-rate"
      className={cn(rndStyles.panel, 'gap-4')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h3 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
            {t('Success rate')}
          </h3>
          <p className="m-0 mt-0.5 text-[12.5px] text-muted-foreground">
            {t('Across the last 30 days')}
          </p>
        </div>
      </div>

      {state === 'loading' ? (
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-[120px] w-[220px] animate-pulse rounded-full bg-muted"
        />
      ) : state === 'error' ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t('Couldn’t load success rate.')}
        </p>
      ) : (
        <div
          className="relative mx-auto w-full max-w-[260px]"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          role="img"
          aria-label={
            hasData
              ? t('Success rate {rate}% over the last 30 days', {
                  rate: successRate.toFixed(1),
                })
              : t('No runs in the last 30 days')
          }
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {Array.from({ length: TICK_COUNT }, (_, index) => {
              const tickRatio = index / (TICK_COUNT - 1);
              const inner = pointOnArc({
                ratio: tickRatio,
                radius: RADIUS_INNER,
              });
              const outer = pointOnArc({
                ratio: tickRatio,
                radius: RADIUS_OUTER,
              });
              const isFilled = revealed && hasData && index < filledCount;
              return (
                <line
                  key={index}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  strokeWidth={5}
                  strokeLinecap="round"
                  className={cn(
                    'transition-[stroke] duration-300 ease-out',
                    isFilled
                      ? 'stroke-primary-600'
                      : 'stroke-gray-200 dark:stroke-gray-700',
                  )}
                  style={{
                    transitionDelay: revealed ? `${index * 14}ms` : '0ms',
                  }}
                />
              );
            })}
          </svg>

          {hasData ? (
            <span
              data-slot="rnd-gauge-marker"
              className="absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm"
              style={{
                left: `${(marker.x / VIEW_W) * 100}%`,
                top: `${(marker.y / VIEW_H) * 100}%`,
              }}
            >
              <span className="size-1.5 rounded-full bg-primary-600" />
              {successRate.toFixed(1)}%
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-1.5">
            <span className="text-[40px] font-bold leading-none tracking-tight tabular-nums text-foreground">
              {hasData ? `${successRate.toFixed(1)}%` : '—'}
            </span>
            {hasData && trend ? (
              <RndTrendPill {...trend} />
            ) : (
              <span className="text-[12px] text-muted-foreground">
                {hasData ? t('of runs succeeded') : t('No runs yet')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-1 grid grid-cols-2 divide-x divide-border border-t border-border pt-4">
        <GaugeStat
          label={t('Succeeded')}
          value={succeeded}
          dotClassName="bg-success-500"
          state={state}
        />
        <GaugeStat
          label={t('Failed')}
          value={failed}
          dotClassName="bg-destructive-500"
          state={state}
        />
      </div>
    </PfCard>
  );
}

function GaugeStat({ label, value, dotClassName, state }: GaugeStatProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', dotClassName)} />
        {label}
      </span>
      {state === 'loading' ? (
        <span
          aria-hidden="true"
          className="my-1 inline-block h-6 w-14 animate-pulse rounded-md bg-muted"
        />
      ) : (
        <span className="text-[22px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {value.toLocaleString()}
        </span>
      )}
    </div>
  );
}

function pointOnArc({ ratio, radius }: { ratio: number; radius: number }): {
  x: number;
  y: number;
} {
  const angle = Math.PI * (1 - ratio);
  return {
    x: CENTER_X + radius * Math.cos(angle),
    y: BASELINE_Y - radius * Math.sin(angle),
  };
}

type SuccessRateGaugeProps = {
  successRate: number | null;
  trend?: PfTrend;
  succeeded: number;
  failed: number;
  state: DashboardQueryState;
};

type GaugeStatProps = {
  label: string;
  value: number;
  dotClassName: string;
  state: DashboardQueryState;
};
