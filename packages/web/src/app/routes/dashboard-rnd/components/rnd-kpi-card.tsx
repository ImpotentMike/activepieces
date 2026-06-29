import { t } from 'i18next';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import {
  DashboardQueryState,
  PfTrend,
} from '../../dashboard/lib/dashboard-data';
import { rndStyles } from '../lib/rnd-styles';

import { RndTrendPill } from './rnd-trend-pill';

export function RndKpiCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'default',
  trend,
  invertTrend = false,
  footnote,
  state = 'ready',
  onClick,
  'aria-label': ariaLabel,
}: RndKpiCardProps) {
  const isLoading = state === 'loading';
  const isError = state === 'error';
  const isClickable = !!onClick && !isLoading && !isError;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            TONE_CHIP_CLASS[tone],
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        {!isLoading && !isError && trend ? (
          <RndTrendPill {...trend} invert={invertTrend} />
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex items-end gap-1">
          {isLoading ? (
            <span
              aria-hidden="true"
              className="my-0.5 inline-block h-8 w-20 animate-pulse rounded-md bg-gray-100"
            />
          ) : (
            <span className="text-[30px] font-bold leading-[1.05] tracking-tight tabular-nums text-foreground">
              {isError ? '—' : value}
            </span>
          )}
          {!isLoading && !isError && unit ? (
            <span className="pb-0.5 text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
        <p className="m-0 text-[12.5px] font-medium text-muted-foreground">
          {label}
        </p>
        {!isLoading && footnote ? (
          <p className="m-0 line-clamp-1 text-[11.5px] text-gray-500 dark:text-gray-400">
            {isError ? t('Couldn’t load') : footnote}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    rndStyles.panel,
    'min-h-[140px] gap-4',
    isClickable &&
      'cursor-pointer transition-[transform,border-color] duration-150 ease-out hover:-translate-y-px hover:border-gray-300 focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
  );

  if (isClickable) {
    return (
      <PfCard data-slot="rnd-kpi" className={className} asChild>
        <button type="button" aria-label={ariaLabel} onClick={onClick}>
          {body}
        </button>
      </PfCard>
    );
  }

  return (
    <PfCard data-slot="rnd-kpi" className={className} aria-label={ariaLabel}>
      {body}
    </PfCard>
  );
}

const TONE_CHIP_CLASS: Record<RndKpiTone, string> = {
  default:
    'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400',
  success:
    'bg-success-50 text-success-600 dark:bg-success-950/50 dark:text-success-400',
  warning:
    'bg-warning-50 text-warning-600 dark:bg-warning-950/50 dark:text-warning-400',
  destructive:
    'bg-destructive-50 text-destructive-600 dark:bg-destructive-950/50 dark:text-destructive-400',
};

export type RndKpiTone = 'default' | 'success' | 'warning' | 'destructive';

export type RndKpiCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: RndKpiTone;
  trend?: PfTrend;
  invertTrend?: boolean;
  footnote?: React.ReactNode;
  state?: DashboardQueryState;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
};
