import { FAILED_STATES, FlowStatus } from '@activepieces/shared';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { flowRunsApi } from '@/features/flow-runs/api/flow-runs-api';
import { flowsApi } from '@/features/flows/api/flows-api';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, DASHBOARD_CONTENT_PADDING_X } from '@/lib/utils';

import { DashboardToolbar } from './components/dashboard-toolbar';
import { PrimaryDashboardView } from './components/dashboard-view';
import { dashboardData } from './lib/dashboard-data';
import { dashboardSyntheticData } from './lib/dashboard-synthetic-data';

const CHART_WINDOW_DAYS = 30;
const DEFAULT_RANGE_DAYS = 7;

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const projectId = authenticationSession.getProjectId()!;

  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE_DAYS);

  const isDemo =
    searchParams.get('demo') === '1' || searchParams.get('showcase') === '1';

  const demoData = useMemo(
    () => (isDemo ? dashboardSyntheticData.build({ projectId }) : null),
    [isDemo, projectId],
  );
  const demoUpdatedAt = useMemo(() => (isDemo ? Date.now() : null), [isDemo]);

  const chartWindow = useMemo(
    () => ({
      createdAfter: dayjs()
        .subtract(CHART_WINDOW_DAYS - 1, 'day')
        .startOf('day')
        .toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    [],
  );

  const workflowCountsQuery = useQuery({
    queryKey: ['dashboard', 'workflow-counts', projectId],
    queryFn: async () => {
      const [published, paused, draft] = await Promise.all([
        flowsApi.count({ projectId, status: FlowStatus.ENABLED }),
        flowsApi.count({
          projectId,
          status: FlowStatus.DISABLED,
          hasPublishedVersion: true,
        }),
        flowsApi.count({ projectId, hasPublishedVersion: false }),
      ]);
      return { published, paused, draft, total: published + paused + draft };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !isDemo,
  });

  const runsByDayQuery = useQuery({
    queryKey: ['dashboard', 'runs-by-day', projectId, chartWindow.createdAfter],
    queryFn: () =>
      flowRunsApi.countByDay({
        projectId,
        createdAfter: chartWindow.createdAfter,
        timezone: chartWindow.timezone,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !isDemo,
  });

  const recentRunsQuery = useQuery({
    queryKey: ['dashboard', 'recent-runs', projectId],
    queryFn: () =>
      flowRunsApi.list({ projectId, limit: 10, cursor: undefined }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !isDemo,
  });

  const runsCountQuery = useQuery({
    queryKey: ['dashboard', 'runs-count', projectId],
    queryFn: async () => {
      const { data } = await flowRunsApi.countByStatus({ projectId });
      const total = data.reduce((acc, entry) => acc + entry.count, 0);
      const flaggedTotal = data
        .filter((entry) => FAILED_STATES.includes(entry.status))
        .reduce((acc, entry) => acc + entry.count, 0);
      return { total, flaggedTotal };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !isDemo,
  });

  const flaggedRunsQuery = useQuery({
    queryKey: ['dashboard', 'flagged-runs', projectId],
    queryFn: () =>
      flowRunsApi.list({
        projectId,
        status: FAILED_STATES,
        limit: 5,
        cursor: undefined,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !isDemo,
  });

  const series = useMemo(() => {
    const counts = demoData?.runsByDay ?? runsByDayQuery.data?.data ?? [];
    return dashboardData.fillDailySeries({ counts, days: CHART_WINDOW_DAYS });
  }, [demoData, runsByDayQuery.data]);

  const workflowCounts = demoData?.workflowCounts ?? workflowCountsQuery.data;
  const recentRuns = demoData?.recentRuns ?? recentRunsQuery.data?.data ?? [];
  const totalRunsAllTime =
    demoData?.totalRunsAllTime ?? runsCountQuery.data?.total ?? null;

  const flaggedRuns = useMemo(
    () =>
      dashboardData.flaggedRuns({
        runs: demoData?.recentRuns ?? flaggedRunsQuery.data?.data ?? [],
        limit: 5,
      }),
    [demoData, flaggedRunsQuery.data],
  );
  const flaggedCount = isDemo
    ? demoData!.flaggedTotal
    : runsCountQuery.data?.flaggedTotal ?? flaggedRuns.length;

  const workflowCountsState = isDemo
    ? 'ready'
    : dashboardData.queryState(workflowCountsQuery);
  const runsState = isDemo ? 'ready' : dashboardData.queryState(runsByDayQuery);
  const recentRunsState = isDemo
    ? 'ready'
    : dashboardData.queryState(recentRunsQuery);
  const flaggedState = isDemo
    ? 'ready'
    : dashboardData.queryState(flaggedRunsQuery);

  const isRefreshing =
    !isDemo &&
    (workflowCountsQuery.isFetching ||
      runsByDayQuery.isFetching ||
      recentRunsQuery.isFetching);

  const lastUpdated = isDemo
    ? demoUpdatedAt
    : Math.max(
        workflowCountsQuery.dataUpdatedAt,
        runsByDayQuery.dataUpdatedAt,
        recentRunsQuery.dataUpdatedAt,
      ) || null;

  const handleRefresh = () => {
    if (isDemo) {
      return;
    }
    void Promise.all([
      workflowCountsQuery.refetch(),
      runsByDayQuery.refetch(),
      recentRunsQuery.refetch(),
    ]);
  };

  return (
    <div className="flex w-full flex-col gap-4 bg-[var(--pf-page-bg)] pb-8 pt-4">
      <div
        data-slot="dashboard-toolbar-row"
        className={cn(
          'flex items-center justify-between gap-3',
          DASHBOARD_CONTENT_PADDING_X,
        )}
      >
        {isDemo ? (
          <span
            data-slot="dashboard-demo-badge"
            className="inline-flex items-center gap-1.5 rounded-full border border-warning-100 bg-warning-50 px-2.5 py-1 text-[11.5px] font-medium text-warning-700 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-300"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-warning-500"
            />
            {t('Showcase data')}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <DashboardToolbar
          rangeDays={rangeDays}
          onRangeChange={setRangeDays}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </div>

      <PrimaryDashboardView
        series={series}
        rangeDays={rangeDays}
        workflowCounts={workflowCounts}
        recentRuns={recentRuns}
        flaggedRuns={flaggedRuns}
        flaggedCount={flaggedCount}
        totalRunsAllTime={totalRunsAllTime}
        workflowCountsState={workflowCountsState}
        runsState={runsState}
        recentRunsState={recentRunsState}
        flaggedState={flaggedState}
        projectId={projectId}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRangeChange={setRangeDays}
        onRefresh={handleRefresh}
        showToolbar={false}
      />
    </div>
  );
}
