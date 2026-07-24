import { t } from 'i18next';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TriangleAlert,
} from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import {
  DashboardFailureWindow,
  DashboardQueryState,
  PfTrend,
} from '../lib/dashboard-data';

const GAUGE_MAX_PERCENT = 10;
const VIEW_W = 200;
const VIEW_H = 148;
const CENTER_X = 100;
const CENTER_Y = 118;
const BAND_RADIUS = 80;
const BAND_WIDTH = 14;

export function FailureRateGaugeCard({
  failureWindow,
  state,
}: FailureRateGaugeCardProps) {
  const rate = failureWindow.ratePercent;
  const hasData = state === 'ready' && rate !== null;
  const ratio = hasData
    ? Math.min(1, Math.max(0, rate / GAUGE_MAX_PERCENT))
    : 0;
  const needleAngle = ANGLE_START - ratio * ANGLE_SWEEP;
  const valueClass = failureWindow.level
    ? LEVEL_VALUE_CLASS[failureWindow.level]
    : 'text-foreground';

  return (
    <PfCard data-slot="dashboard-failure-gauge" className="h-full gap-3">
      <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
        <TriangleAlert
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
        {t('Failure rate')}
      </h3>

      {state === 'loading' ? (
        <GaugeSkeleton />
      ) : state === 'error' ? (
        <p className="flex min-h-[136px] items-center text-sm text-muted-foreground">
          {t('Couldn’t load failure rate.')}
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <div
            className="relative w-full max-w-[188px]"
            style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
            role="img"
            aria-label={
              hasData
                ? t('Failure rate {rate}% over this period', {
                    rate: rate.toFixed(1),
                  })
                : t('No runs in this period')
            }
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {ZONES.map((zone) => (
                <path
                  key={zone.key}
                  d={arcPath({ start: zone.start, end: zone.end })}
                  fill="none"
                  stroke={hasData ? zone.color : 'hsl(var(--muted))'}
                  strokeWidth={BAND_WIDTH}
                  strokeLinecap="round"
                />
              ))}

              <line
                x1={CENTER_X}
                y1={CENTER_Y - (BAND_RADIUS + BAND_WIDTH / 2 + 1)}
                x2={CENTER_X}
                y2={CENTER_Y - (BAND_RADIUS - BAND_WIDTH / 2 - 1)}
                className="stroke-foreground/70"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <text
                x={CENTER_X}
                y={CENTER_Y - (BAND_RADIUS + BAND_WIDTH / 2 + 8)}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-medium"
              >
                {t('Limit')}
              </text>

              <text
                x={CENTER_X - BAND_RADIUS}
                y={CENTER_Y + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                0%
              </text>
              <text
                x={CENTER_X + BAND_RADIUS}
                y={CENTER_Y + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {GAUGE_MAX_PERCENT}%
              </text>

              {hasData ? (
                <g>
                  <path
                    d={needlePath(needleAngle)}
                    className="fill-foreground"
                  />
                  <circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={7}
                    className="fill-background stroke-foreground"
                    strokeWidth={2.5}
                  />
                  <circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={2.5}
                    className="fill-foreground"
                  />
                </g>
              ) : null}
            </svg>

            <div className="pointer-events-none absolute inset-x-0 top-[54%] flex -translate-y-1/2 justify-center">
              <span
                className={cn(
                  'text-[32px] font-bold leading-none tracking-tight tabular-nums',
                  valueClass,
                )}
              >
                {hasData ? `${Math.round(rate)}%` : '—'}
              </span>
            </div>
          </div>

          {hasData && failureWindow.trend ? (
            <FailureTrendPill {...failureWindow.trend} />
          ) : (
            <span className="text-[12px] text-muted-foreground">
              {hasData ? t('of runs failed') : t('No runs yet')}
            </span>
          )}
        </div>
      )}
    </PfCard>
  );
}

function FailureTrendPill({ direction, value }: PfTrend) {
  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
      ? ArrowDownRight
      : Minus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium tabular-nums',
        direction === 'up' && 'bg-warning-100 text-warning-700',
        direction === 'down' && 'bg-success-100 text-success-700',
        direction === 'flat' && 'bg-gray-100 text-gray-700',
      )}
    >
      <Icon className="size-3" />
      {value}
    </span>
  );
}

function GaugeSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span
        aria-hidden="true"
        className="h-[110px] w-[188px] max-w-full animate-pulse rounded-t-full bg-gray-100"
      />
    </div>
  );
}

function polar(radius: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y - radius * Math.sin(rad),
  };
}

function arcPath({ start, end }: { start: number; end: number }): string {
  const s = polar(BAND_RADIUS, start);
  const e = polar(BAND_RADIUS, end);
  const largeArc = Math.abs(start - end) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(
    2,
  )} A ${BAND_RADIUS} ${BAND_RADIUS} 0 ${largeArc} 1 ${e.x.toFixed(
    2,
  )} ${e.y.toFixed(2)}`;
}

function needlePath(angleDeg: number): string {
  const tip = polar(BAND_RADIUS - 6, angleDeg);
  const left = polar(6, angleDeg + 90);
  const right = polar(6, angleDeg - 90);
  return `M ${left.x.toFixed(2)} ${left.y.toFixed(2)} L ${tip.x.toFixed(
    2,
  )} ${tip.y.toFixed(2)} L ${right.x.toFixed(2)} ${right.y.toFixed(2)} Z`;
}

const ANGLE_START = 180;
const ANGLE_END = 0;
const ANGLE_SWEEP = ANGLE_START - ANGLE_END;

const ZONES = [
  { key: 'healthy', color: 'hsl(var(--success-500))', start: 180, end: 123 },
  { key: 'elevated', color: 'hsl(var(--warning-500))', start: 117, end: 63 },
  { key: 'high', color: 'hsl(var(--destructive-500))', start: 57, end: 0 },
] as const;

const LEVEL_VALUE_CLASS = {
  healthy: 'text-success-700',
  elevated: 'text-warning-700',
  high: 'text-destructive-700',
} as const;

export type FailureRateGaugeCardProps = {
  failureWindow: DashboardFailureWindow;
  state: DashboardQueryState;
};
