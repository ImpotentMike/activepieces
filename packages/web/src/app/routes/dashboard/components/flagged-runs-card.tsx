import { FlowRunStatus } from '@activepieces/shared';
import { t } from 'i18next';
import { ChevronRight, CircleCheck, TriangleAlert } from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { TextWithTooltip } from '@/components/custom/text-with-tooltip';
import { cn } from '@/lib/utils';

import {
  DashboardFlaggedRun,
  DashboardQueryState,
} from '../lib/dashboard-data';

export function FlaggedRunsCard({
  runs,
  state,
  onRunClick,
}: FlaggedRunsCardProps) {
  return (
    <PfCard data-slot="dashboard-flagged-runs" className="h-full gap-3">
      <div className="flex min-w-0 flex-col">
        <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
          <TriangleAlert
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          {t('Flagged runs')}
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
        <ul className="flex flex-col gap-0.5">
          {runs.map((run) => {
            const name = run.name ?? t('Untitled');
            return (
              <li key={run.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onRunClick(run)}
                  className={cn(
                    'group flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left',
                    'transition-colors hover:bg-gray-50',
                    'focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full bg-destructive-500"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <TextWithTooltip tooltipMessage={name}>
                      <span className="truncate text-[13px] font-medium text-foreground group-hover:text-primary-700">
                        {name}
                      </span>
                    </TextWithTooltip>
                    <span className="truncate text-[12px] text-destructive-600">
                      {t(STATUS_REASON_KEY[run.status] ?? 'Run failed')}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PfCard>
  );
}

function FlaggedRunsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded-md bg-gray-100"
        />
      ))}
    </div>
  );
}

const STATUS_REASON_KEY: Partial<Record<FlowRunStatus, string>> = {
  [FlowRunStatus.FAILED]: 'Run failed',
  [FlowRunStatus.INTERNAL_ERROR]: 'Internal error',
  [FlowRunStatus.QUOTA_EXCEEDED]: 'Quota exceeded',
  [FlowRunStatus.TIMEOUT]: 'Run timed out',
  [FlowRunStatus.MEMORY_LIMIT_EXCEEDED]: 'Memory limit exceeded',
};

export type FlaggedRunsCardProps = {
  runs: DashboardFlaggedRun[];
  state: DashboardQueryState;
  onRunClick: (run: DashboardFlaggedRun) => void;
};
