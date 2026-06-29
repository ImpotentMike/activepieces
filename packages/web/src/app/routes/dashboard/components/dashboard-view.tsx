import { FAILED_STATES, FlowRunCountByDay } from '@activepieces/shared';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, DASHBOARD_CONTENT_PADDING_X } from '@/lib/utils';

import { dashboardData, DashboardQueryState } from '../lib/dashboard-data';
import { DashboardWorkflowCounts } from '../lib/dashboard-synthetic-data';

import { DashboardToolbar } from './dashboard-toolbar';
import { FailureRateGaugeCard } from './failure-rate-gauge-card';
import { ProjectSummaryCard } from './project-summary-card';
import { RecentRuns, RecentRunRow } from './recent-runs';
import { RunsOverTimeChart } from './runs-over-time-chart';
import { WorkflowsDonutCard } from './workflows-donut-card';

export function PrimaryDashboardView({
  series,
  rangeDays,
  workflowCounts,
  recentRuns,
  projectName,
  workflowCountsState,
  runsState,
  recentRunsState,
  projectId,
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

  const flagged = useMemo(
    () => dashboardData.flaggedWorkflows({ runs: recentRuns, limit: 3 }),
    [recentRuns],
  );

  const timeWindow = useMemo(
    () => ({
      createdAfter: dayjs()
        .subtract(rangeDays - 1, 'day')
        .startOf('day')
        .toISOString(),
      createdBefore: dayjs().toISOString(),
    }),
    [rangeDays],
  );

  const composition = workflowCounts
    ? {
        running: workflowCounts.published,
        published: workflowCounts.paused,
        draft: workflowCounts.draft,
      }
    : undefined;

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
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
      >
        <div className="lg:col-span-3">
          <ProjectSummaryCard
            name={projectName}
            total={workflowCounts?.total ?? 0}
            running={workflowCounts?.published ?? 0}
            state={workflowCountsState}
          />
        </div>
        <div className="lg:col-span-4">
          <WorkflowsDonutCard
            composition={composition}
            state={workflowCountsState}
            onManage={() => navigate(workflowsHref)}
          />
        </div>
        <div className="lg:col-span-5">
          <FailureRateGaugeCard
            failureWindow={failureWindow}
            flagged={flagged}
            state={runsState}
            onManage={() => navigate(workflowsHref)}
            onFlaggedClick={(workflow) =>
              navigate(
                dashboardData.buildRunsHref({
                  projectId,
                  statuses: FAILED_STATES,
                  flowId: workflow.flowId,
                  timeWindow,
                }),
              )
            }
          />
        </div>
      </div>

      <RunsOverTimeChart series={windowedSeries} state={runsState} />

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

export type PrimaryDashboardViewProps = {
  series: FlowRunCountByDay[];
  rangeDays: number;
  workflowCounts: DashboardWorkflowCounts | undefined;
  recentRuns: RecentRunRow[];
  projectName: string;
  workflowCountsState: DashboardQueryState;
  runsState: DashboardQueryState;
  recentRunsState: DashboardQueryState;
  projectId: string;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRangeChange: (days: number) => void;
  onRefresh: () => void;
  showToolbar?: boolean;
};
