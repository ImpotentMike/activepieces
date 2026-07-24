import { FAILED_STATES, FlowRunCountByDay } from '@activepieces/shared';
import { t } from 'i18next';
import { ArrowRight, History, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { authenticationSession } from '@/lib/authentication-session';
import { formatUtils } from '@/lib/format-utils';
import { cn, DASHBOARD_CONTENT_PADDING_X } from '@/lib/utils';

import {
  dashboardData,
  DashboardFlaggedRun,
  DashboardQueryState,
} from '../lib/dashboard-data';
import { DashboardWorkflowCounts } from '../lib/dashboard-synthetic-data';

import { DashboardMetricCard } from './dashboard-metric-card';
import { DashboardToolbar } from './dashboard-toolbar';
import { FailureRateGaugeCard } from './failure-rate-gauge-card';
import { FlaggedRunsCard } from './flagged-runs-card';
import { RecentRuns, RecentRunRow } from './recent-runs';
import { RunsOverTimeChart } from './runs-over-time-chart';
import { WorkflowsSummaryCard } from './workflows-summary-card';

export function PrimaryDashboardView({
  series,
  rangeDays,
  workflowCounts,
  recentRuns,
  flaggedRuns,
  flaggedCount,
  totalRunsAllTime,
  projectId,
  workflowCountsState,
  runsState,
  recentRunsState,
  flaggedState,
  lastUpdated,
  isRefreshing,
  onRangeChange,
  onRefresh,
  showToolbar = true,
}: PrimaryDashboardViewProps) {
  const navigate = useNavigate();

  const windowedSeries = useMemo(
    () => series.slice(-rangeDays),
    [series, rangeDays],
  );

  const failureWindow = useMemo(
    () => dashboardData.failureWindow({ series, days: rangeDays }),
    [series, rangeDays],
  );

  const runsWindow = useMemo(
    () => dashboardData.runsWindow({ series, days: rangeDays }),
    [series, rangeDays],
  );

  const thisMonthRuns = useMemo(
    () => dashboardData.thisMonthTotal({ series }),
    [series],
  );

  const durationStats = useMemo(
    () => dashboardData.durationStats({ runs: recentRuns }),
    [recentRuns],
  );

  const composition = workflowCounts
    ? {
        running: workflowCounts.published,
        draft: workflowCounts.draft,
        paused: workflowCounts.paused,
      }
    : undefined;

  const avgDuration =
    durationStats.avgMs === null
      ? null
      : formatCompactDuration(durationStats.avgMs);

  const workflowsHref =
    authenticationSession.appendProjectRoutePrefix('/automations');

  return (
    <div
      className={cn('flex flex-col gap-5 pt-1', DASHBOARD_CONTENT_PADDING_X)}
    >
      {showToolbar ? (
        <DashboardToolbar
          rangeDays={rangeDays}
          onRangeChange={onRangeChange}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      ) : null}

      <div
        data-slot="dashboard-summary-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="sm:col-span-2 lg:col-span-2">
          <WorkflowsSummaryCard
            composition={composition}
            state={workflowCountsState}
            onManage={() => navigate(workflowsHref)}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardMetricCard
            icon={History}
            label={t('Runs')}
            value={runsWindow.total.toLocaleString()}
            subtitle={t('in last {days} days', { days: rangeDays })}
            trend={runsWindow.trend}
            higherIsBetter
            meta={[
              {
                label: t('This month'),
                value: thisMonthRuns.toLocaleString(),
              },
              {
                label: t('Total'),
                value:
                  totalRunsAllTime === null
                    ? '—'
                    : totalRunsAllTime.toLocaleString(),
              },
            ]}
            state={runsState}
          />
        </div>
        <div className="lg:col-span-1">
          <FailureRateGaugeCard
            failureWindow={failureWindow}
            state={runsState}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardMetricCard
            icon={Timer}
            label={t('Avg time per run')}
            value={avgDuration ? avgDuration.value : '—'}
            unit={avgDuration ? avgDuration.unit : undefined}
            subtitle={t('across recent runs')}
            meta={[
              {
                label: t('Median'),
                value:
                  durationStats.medianMs === null
                    ? '—'
                    : formatUtils.formatDuration(durationStats.medianMs, true),
              },
              {
                label: t('Total'),
                value:
                  durationStats.totalMs === null
                    ? '—'
                    : formatUtils.formatDuration(durationStats.totalMs, true),
              },
            ]}
            state={recentRunsState}
          />
        </div>
      </div>

      <div
        data-slot="dashboard-activity-grid"
        className="grid grid-cols-1 gap-4 lg:grid-cols-6"
      >
        <div className="lg:col-span-4">
          <RunsOverTimeChart series={windowedSeries} state={runsState} />
        </div>
        <div className="lg:col-span-2">
          <FlaggedRunsCard
            runs={flaggedRuns}
            flaggedCount={flaggedCount}
            state={flaggedState}
            onRunClick={(run) =>
              navigate(`/projects/${run.projectId}/runs/${run.id}`)
            }
            onSeeMore={() =>
              navigate(
                dashboardData.buildRunsHref({
                  projectId,
                  statuses: FAILED_STATES,
                }),
              )
            }
          />
        </div>
      </div>

      <section
        data-slot="dashboard-recent-runs"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
            {t('Recent runs')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() =>
              navigate(authenticationSession.appendProjectRoutePrefix('/runs'))
            }
          >
            {t('View all runs')}
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <RecentRuns
          runs={recentRuns}
          state={recentRunsState}
          onRowClick={(run) =>
            navigate(`/projects/${run.projectId}/runs/${run.id}`)
          }
        />
      </section>
    </div>
  );
}

function formatCompactDuration(ms: number): { value: string; unit: string } {
  if (ms < 1000) {
    return { value: String(Math.round(ms)), unit: 'ms' };
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return {
      value: seconds < 10 ? seconds.toFixed(1) : String(Math.round(seconds)),
      unit: 's',
    };
  }
  const minutes = seconds / 60;
  return {
    value: minutes < 10 ? minutes.toFixed(1) : String(Math.round(minutes)),
    unit: 'min',
  };
}

export type PrimaryDashboardViewProps = {
  series: FlowRunCountByDay[];
  rangeDays: number;
  workflowCounts: DashboardWorkflowCounts | undefined;
  recentRuns: RecentRunRow[];
  flaggedRuns: DashboardFlaggedRun[];
  flaggedCount: number;
  totalRunsAllTime: number | null;
  workflowCountsState: DashboardQueryState;
  runsState: DashboardQueryState;
  recentRunsState: DashboardQueryState;
  flaggedState: DashboardQueryState;
  projectId: string;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRangeChange: (days: number) => void;
  onRefresh: () => void;
  showToolbar?: boolean;
};
