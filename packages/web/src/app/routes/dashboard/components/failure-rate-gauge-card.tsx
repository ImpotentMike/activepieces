import { t } from 'i18next';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
  Minus,
  TriangleAlert,
  Workflow,
} from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { TextWithTooltip } from '@/components/custom/text-with-tooltip';
import { cn } from '@/lib/utils';

import {
  DashboardFailureWindow,
  DashboardFlaggedWorkflow,
  DashboardQueryState,
  PfTrend,
} from '../lib/dashboard-data';

const GAUGE_MAX_PERCENT = 20;
const VIEW_W = 200;
const VIEW_H = 166;
const CENTER_X = 100;
const CENTER_Y = 98;
const BAND_RADIUS = 76;

export function FailureRateGaugeCard({
  failureWindow,
  flagged,
  state,
  onManage,
  onFlaggedClick,
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
    <PfCard data-slot="dashboard-failure-gauge" className="h-full gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
          <TriangleAlert
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          {t('Failure rate')}
        </h3>
        <ManageLink onClick={onManage} />
      </div>

      {state === 'loading' ? (
        <GaugeSkeleton />
      ) : state === 'error' ? (
        <p className="flex min-h-[136px] items-center text-sm text-muted-foreground">
          {t('Couldn’t load failure rate.')}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:gap-5">
          <div
            className="relative w-full max-w-[210px] shrink-0"
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
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {ZONES.map((zone) => (
                <path
                  key={zone.key}
                  d={arcPath({ start: zone.start, end: zone.end })}
                  fill="none"
                  stroke={hasData ? zone.color : 'hsl(var(--muted))'}
                  strokeWidth={13}
                  strokeLinecap="round"
                />
              ))}

              {hasData ? (
                <g>
                  <path
                    d={needlePath(needleAngle)}
                    className="fill-foreground"
                  />
                  <circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={8}
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

            <div className="absolute inset-x-0 bottom-[4%] flex flex-col items-center gap-1">
              <span
                className={cn(
                  'text-[26px] font-bold leading-none tracking-tight tabular-nums',
                  valueClass,
                )}
              >
                {hasData ? `${rate.toFixed(1)}%` : '—'}
              </span>
              {hasData && failureWindow.trend ? (
                <FailureTrendPill {...failureWindow.trend} />
              ) : (
                <span className="text-[12px] text-muted-foreground">
                  {hasData ? t('of runs failed') : t('No runs yet')}
                </span>
              )}
            </div>
          </div>

          <FlaggedList
            flagged={flagged}
            hasRuns={hasData}
            onFlaggedClick={onFlaggedClick}
          />
        </div>
      )}
    </PfCard>
  );
}

function FlaggedList({ flagged, hasRuns, onFlaggedClick }: FlaggedListProps) {
  if (!hasRuns) {
    return (
      <div className="flex min-w-0 flex-1 items-center sm:border-l sm:border-gray-100 sm:pl-5">
        <p className="m-0 text-[13px] text-muted-foreground">
          {t('No runs in this period yet.')}
        </p>
      </div>
    );
  }

  if (flagged.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 sm:border-l sm:border-gray-100 sm:pl-5">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-success-700">
          <CircleCheck aria-hidden="true" className="size-4" />
          {t('No workflows flagged')}
        </span>
        <p className="m-0 text-[12px] text-muted-foreground">
          {t('Every workflow is running within healthy limits.')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:border-l sm:border-gray-100 sm:pl-5">
      <p className="m-0 text-[12.5px] font-medium text-muted-foreground">
        {t('flaggedWorkflowsCount', { count: flagged.length })}
      </p>
      <ul className="flex flex-col gap-1">
        {flagged.map((workflow, index) => {
          const name = workflow.name ?? t('Untitled');
          return (
            <li key={workflow.flowId ?? `${name}-${index}`} className="min-w-0">
              <button
                type="button"
                disabled={!onFlaggedClick}
                onClick={() => onFlaggedClick?.(workflow)}
                className={cn(
                  'group flex w-full min-w-0 items-center gap-2 rounded-md py-0.5 text-left',
                  onFlaggedClick &&
                    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
                )}
              >
                <Workflow
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <TextWithTooltip tooltipMessage={name}>
                  <span
                    className={cn(
                      'block min-w-0 flex-1 truncate text-[13px] font-medium text-primary-700',
                      onFlaggedClick && 'group-hover:underline',
                    )}
                  >
                    {name}
                  </span>
                </TextWithTooltip>
                <span className="shrink-0 text-[11.5px] font-medium tabular-nums text-destructive-600">
                  {t('{count} failed', { count: workflow.failures })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
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

function ManageLink({ onClick }: { onClick?: () => void }) {
  if (!onClick) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-muted-foreground',
        'transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
      )}
    >
      {t('Manage')}
      <ChevronRight className="size-3.5" />
    </button>
  );
}

function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
      <span
        aria-hidden="true"
        className="h-[120px] w-[200px] shrink-0 animate-pulse rounded-t-full bg-gray-100"
      />
      <div className="flex flex-1 flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-4 w-full animate-pulse rounded bg-gray-100"
          />
        ))}
      </div>
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
  const tip = polar(BAND_RADIUS - 4, angleDeg);
  const left = polar(6, angleDeg + 90);
  const right = polar(6, angleDeg - 90);
  return `M ${left.x.toFixed(2)} ${left.y.toFixed(2)} L ${tip.x.toFixed(
    2,
  )} ${tip.y.toFixed(2)} L ${right.x.toFixed(2)} ${right.y.toFixed(2)} Z`;
}

const ANGLE_START = 210;
const ANGLE_END = -30;
const ANGLE_SWEEP = ANGLE_START - ANGLE_END;

const ZONES = [
  { key: 'healthy', color: 'hsl(var(--success-500))', start: 210, end: 152 },
  { key: 'elevated', color: 'hsl(var(--warning-500))', start: 148, end: 32 },
  { key: 'high', color: 'hsl(var(--destructive-500))', start: 28, end: -30 },
] as const;

const LEVEL_VALUE_CLASS = {
  healthy: 'text-success-700',
  elevated: 'text-warning-700',
  high: 'text-destructive-700',
} as const;

type FlaggedListProps = {
  flagged: DashboardFlaggedWorkflow[];
  hasRuns: boolean;
  onFlaggedClick?: (workflow: DashboardFlaggedWorkflow) => void;
};

export type FailureRateGaugeCardProps = {
  failureWindow: DashboardFailureWindow;
  flagged: DashboardFlaggedWorkflow[];
  state: DashboardQueryState;
  onManage?: () => void;
  onFlaggedClick?: (workflow: DashboardFlaggedWorkflow) => void;
};
