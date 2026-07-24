import { FlowRunStatus } from '@activepieces/shared';
import { t } from 'i18next';
import { ArrowRight, CircleCheck, TriangleAlert } from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { TextWithTooltip } from '@/components/custom/text-with-tooltip';
import { formatUtils } from '@/lib/format-utils';
import { cn } from '@/lib/utils';

import {
  DashboardFlaggedRun,
  DashboardQueryState,
} from '../lib/dashboard-data';

export function FlaggedRunsCard({
  runs,
  flaggedCount,
  state,
  onRunClick,
  onSeeMore,
}: FlaggedRunsCardProps) {
  const remaining = Math.max(0, flaggedCount - runs.length);

  return (
    <PfCard data-slot="dashboard-flagged-runs" className="h-full gap-3">
      <div className="flex min-w-0 flex-col">
        <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
          <TriangleAlert
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          {t('Flagged runs')}
          {state === 'ready' && flaggedCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11.5px] font-semibold text-primary-foreground tabular-nums">
              {flaggedCount}
            </span>
          ) : null}
        </h3>
        <p className="m-0 mt-0.5 text-[12.5px] text-muted-foreground">
          {t('Failed runs that need attention')}
        </p>
      </div>

      {state === 'loading' ? (
        <FlaggedRunsSkeleton />
      ) : state === 'error' ? (
        <p className="flex min-h-[120px] items-center text-sm text-muted-foreground">
          {t('Couldn’t load flagged runs.')}
        </p>
      ) : runs.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-success-700">
            <CircleCheck aria-hidden="true" className="size-4" />
            {t('No flagged runs')}
          </span>
          <p className="m-0 text-[12px] text-muted-foreground">
            {t('All recent runs completed without errors.')}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <ul className="flex flex-col divide-y divide-gray-100">
            {runs.map((run) => {
              const name = run.name ?? t('Untitled');
              return (
                <li key={run.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onRunClick(run)}
                    className={cn(
                      'group flex w-full min-w-0 items-start justify-between gap-3 rounded-md px-2 py-2.5 text-left',
                      'transition-colors hover:bg-gray-50',
                      'focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <TextWithTooltip tooltipMessage={name}>
                        <span className="truncate text-[13px] font-medium text-primary-700 group-hover:underline">
                          {name}
                        </span>
                      </TextWithTooltip>
                      {run.failedStepName ? (
                        <TextWithTooltip tooltipMessage={run.failedStepName}>
                          <span className="truncate text-[12px] text-muted-foreground">
                            {t('Step: {step}', { step: run.failedStepName })}
                          </span>
                        </TextWithTooltip>
                      ) : (
                        <span className="truncate text-[12px] text-muted-foreground">
                          {formatUtils.formatDate(new Date(run.created))}
                        </span>
                      )}
                    </span>
                    <StatusBadge status={run.status} />
                  </button>
                </li>
              );
            })}
          </ul>

          {remaining > 0 ? (
            <button
              type="button"
              onClick={onSeeMore}
              className={cn(
                'mt-auto inline-flex items-center gap-1 self-start rounded-md px-2 pt-2.5 text-[12.5px] font-medium text-primary-700',
                'transition-colors hover:text-primary-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
              )}
            >
              {t('See {count} more', { count: remaining })}
              <ArrowRight className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </PfCard>
  );
}

function StatusBadge({ status }: { status: FlowRunStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive-100 bg-destructive-50 px-2 py-0.5',
        'text-[11px] font-medium text-destructive-700',
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-destructive-500"
      />
      {t(STATUS_BADGE_KEY[status] ?? 'Failed')}
    </span>
  );
}

function FlaggedRunsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-12 w-full animate-pulse rounded-md bg-gray-100"
        />
      ))}
    </div>
  );
}

const STATUS_BADGE_KEY: Partial<Record<FlowRunStatus, string>> = {
  [FlowRunStatus.FAILED]: 'Failed',
  [FlowRunStatus.INTERNAL_ERROR]: 'Internal error',
  [FlowRunStatus.QUOTA_EXCEEDED]: 'Quota exceeded',
  [FlowRunStatus.TIMEOUT]: 'Timed out',
  [FlowRunStatus.MEMORY_LIMIT_EXCEEDED]: 'Memory limit',
};

export type FlaggedRunsCardProps = {
  runs: DashboardFlaggedRun[];
  flaggedCount: number;
  state: DashboardQueryState;
  onRunClick: (run: DashboardFlaggedRun) => void;
  onSeeMore: () => void;
};
