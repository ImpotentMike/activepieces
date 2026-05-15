import {
  FlowRun,
  FlowRunStatus,
  FlowStatus,
  PopulatedFlow,
  SeekPage,
} from '@activepieces/shared';
import { useQueries } from '@tanstack/react-query';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/custom/page-header';
import { PfStatCard } from '@/components/custom/pf-card';
import { flowRunsApi } from '@/features/flow-runs/api/flow-runs-api';
import { flowsApi } from '@/features/flows/api/flows-api';
import { getProjectName, projectCollectionUtils } from '@/features/projects';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, DASHBOARD_CONTENT_PADDING_X } from '@/lib/utils';

import { RecentlyFailedRuns } from './components/recently-failed-runs';
import {
  DASHBOARD_DAY_MS,
  FAILED_STATUSES,
  IN_PROGRESS_STATUSES,
  RUNNING_STATUSES,
  WAITING_STATUSES,
  dashboardData,
} from './lib/dashboard-data';

export default function DashboardPage() {
  const navigate = useNavigate();
  const currentProjectId = authenticationSession.getProjectId()!;
  const { data: projects } = projectCollectionUtils.useAll();

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);
  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, getProjectName(p)));
    return map;
  }, [projects]);

  const timeWindow = useMemo(() => {
    const now = Date.now();
    return {
      createdAfter: new Date(now - DASHBOARD_DAY_MS).toISOString(),
      createdBefore: new Date(now).toISOString(),
    };
  }, []);

  const stats24hQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['dashboard', 'stats-24h', projectId, timeWindow.createdAfter],
      queryFn: () => flowRunsApi.countByStatus({ projectId, ...timeWindow }),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    })),
  });

  const inProgressQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['dashboard', 'in-progress', projectId],
      queryFn: () => flowRunsApi.countByStatus({ projectId }),
      staleTime: 15_000,
      refetchInterval: 15_000,
    })),
  });

  const disabledFlowsQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['dashboard', 'disabled-flows', projectId],
      queryFn: () =>
        flowsApi.list({
          projectId,
          status: [FlowStatus.DISABLED],
          limit: 1000,
          cursor: undefined,
        }),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    })),
  });

  const enabledFlowsQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['dashboard', 'enabled-flows', projectId],
      queryFn: () =>
        flowsApi.list({
          projectId,
          status: [FlowStatus.ENABLED],
          limit: 1000,
          cursor: undefined,
        }),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    })),
  });

  const recentFailedRunsQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['dashboard', 'recent-failed', projectId],
      queryFn: () =>
        flowRunsApi.list({
          projectId,
          status: [...FAILED_STATUSES],
          limit: 5,
          cursor: undefined,
        }),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    })),
  });

  const failed24h = useMemo(
    () =>
      computeFailed24h({
        queries: stats24hQueries,
        projectIds,
        projectNameById,
      }),
    [stats24hQueries, projectIds, projectNameById],
  );

  const needsAttention = useMemo(
    () =>
      computeNeedsAttention({
        queries: disabledFlowsQueries,
        projectIds,
        projectNameById,
      }),
    [disabledFlowsQueries, projectIds, projectNameById],
  );

  const inProgress = useMemo(
    () =>
      computeInProgress({
        queries: inProgressQueries,
      }),
    [inProgressQueries],
  );

  const activeSchedules = useMemo(
    () =>
      computeActiveSchedules({
        queries: enabledFlowsQueries,
        projectIds,
        projectNameById,
      }),
    [enabledFlowsQueries, projectIds, projectNameById],
  );

  const recentFailures = useMemo(() => {
    const state = dashboardData.aggregateState(recentFailedRunsQueries);
    const pages = recentFailedRunsQueries.map((q) => q.data) as (
      | SeekPage<FlowRun>
      | undefined
    )[];
    const runs = dashboardData.flattenAndTakeTop({
      pages,
      getSortKey: (r: FlowRun) => new Date(r.created).getTime(),
      limit: 5,
    });
    return { state, runs };
  }, [recentFailedRunsQueries]);

  const totalProjects = projects.length;

  return (
    <div className="flex w-full flex-col gap-4 bg-[var(--pf-page-bg)] pb-8">
      <PageHeader
        showSidebarToggle={true}
        breadcrumb={<span>{t('Dashboard')}</span>}
        title={t('Dashboard')}
      />

      <div
        className={cn('flex flex-col gap-6 pt-2', DASHBOARD_CONTENT_PADDING_X)}
      >
        <div
          data-slot="dashboard-stat-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <PfStatCard
            label={t('Failed runs · last 24h')}
            value={failed24h.failed}
            accent
            state={failed24h.state}
            footnote={renderFailedFootnote(failed24h)}
            breakdown={failed24h.breakdown}
            aria-label={t('Failed runs in the last 24 hours')}
            onClick={() =>
              navigate(
                dashboardData.buildRunsHref({
                  projectId: currentProjectId,
                  statuses: FAILED_STATUSES,
                  timeWindow,
                }),
              )
            }
          />

          <PfStatCard
            label={t('Needs attention')}
            value={needsAttention.count}
            state={needsAttention.state}
            footnote={renderNeedsAttentionFootnote(needsAttention)}
            breakdown={needsAttention.breakdown}
            aria-label={t('Workflows needing attention')}
            onClick={() =>
              navigate(
                `/projects/${currentProjectId}/automations?status=DISABLED`,
              )
            }
          />

          <PfStatCard
            label={t('In progress')}
            value={inProgress.total}
            state={inProgress.state}
            footnote={renderInProgressFootnote(inProgress)}
            aria-label={t('Runs currently in progress')}
            onClick={() =>
              navigate(
                dashboardData.buildRunsHref({
                  projectId: currentProjectId,
                  statuses: IN_PROGRESS_STATUSES,
                }),
              )
            }
          />

          <PfStatCard
            label={t('Active schedules')}
            value={activeSchedules.count}
            state={activeSchedules.state}
            footnote={renderActiveSchedulesFootnote(
              activeSchedules,
              totalProjects,
            )}
            breakdown={activeSchedules.breakdown}
            aria-label={t('Workflows on an active schedule')}
          />
        </div>

        <section
          data-slot="dashboard-recent-failures"
          className="flex flex-col gap-3"
        >
          <h2 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
            {t('Recently failed runs')}
          </h2>
          <RecentlyFailedRuns
            runs={recentFailures.runs}
            projectNameById={projectNameById}
            state={recentFailures.state}
            onRowClick={(run) =>
              navigate(`/projects/${run.projectId}/runs/${run.id}`)
            }
          />
        </section>
      </div>
    </div>
  );
}

function computeFailed24h({
  queries,
  projectIds,
  projectNameById,
}: {
  queries: {
    isLoading: boolean;
    isError: boolean;
    data?: { data: { status: FlowRunStatus; count: number }[] };
  }[];
  projectIds: string[];
  projectNameById: Map<string, string>;
}) {
  const state = dashboardData.aggregateState(queries);
  if (state !== 'ready') {
    return { state, failed: 0, total: 0, breakdown: '' };
  }
  let failed = 0;
  let total = 0;
  const perProject: { name: string; count: number }[] = [];
  queries.forEach((q, i) => {
    const items = q.data?.data ?? [];
    const projectFailed = dashboardData.sumStatuses(items, FAILED_STATUSES);
    const projectTotal = dashboardData.sumAll(items);
    failed += projectFailed;
    total += projectTotal;
    if (projectFailed > 0) {
      perProject.push({
        name: projectNameById.get(projectIds[i]) ?? '—',
        count: projectFailed,
      });
    }
  });
  perProject.sort((a, b) => b.count - a.count);
  return {
    state,
    failed,
    total,
    breakdown:
      perProject.length > 1 ? dashboardData.formatBreakdown(perProject) : '',
  };
}

function computeNeedsAttention({
  queries,
  projectIds,
  projectNameById,
}: {
  queries: {
    isLoading: boolean;
    isError: boolean;
    data?: SeekPage<PopulatedFlow>;
  }[];
  projectIds: string[];
  projectNameById: Map<string, string>;
}) {
  const state = dashboardData.aggregateState(queries);
  if (state !== 'ready') {
    return { state, count: 0, breakdown: '' };
  }
  let count = 0;
  const perProject: { name: string; count: number }[] = [];
  queries.forEach((q, i) => {
    const flows = q.data?.data ?? [];
    const projectCount = flows.filter(
      dashboardData.isDisabledAndPublished,
    ).length;
    count += projectCount;
    if (projectCount > 0) {
      perProject.push({
        name: projectNameById.get(projectIds[i]) ?? '—',
        count: projectCount,
      });
    }
  });
  perProject.sort((a, b) => b.count - a.count);
  return {
    state,
    count,
    breakdown:
      perProject.length > 1 ? dashboardData.formatBreakdown(perProject) : '',
  };
}

function computeInProgress({
  queries,
}: {
  queries: {
    isLoading: boolean;
    isError: boolean;
    data?: { data: { status: FlowRunStatus; count: number }[] };
  }[];
}) {
  const state = dashboardData.aggregateState(queries);
  if (state !== 'ready') {
    return { state, total: 0, running: 0, waiting: 0 };
  }
  let running = 0;
  let waiting = 0;
  queries.forEach((q) => {
    const items = q.data?.data ?? [];
    running += dashboardData.sumStatuses(items, RUNNING_STATUSES);
    waiting += dashboardData.sumStatuses(items, WAITING_STATUSES);
  });
  return { state, total: running + waiting, running, waiting };
}

function computeActiveSchedules({
  queries,
  projectIds,
  projectNameById,
}: {
  queries: {
    isLoading: boolean;
    isError: boolean;
    data?: SeekPage<PopulatedFlow>;
  }[];
  projectIds: string[];
  projectNameById: Map<string, string>;
}) {
  const state = dashboardData.aggregateState(queries);
  if (state !== 'ready') {
    return { state, count: 0, breakdown: '' };
  }
  let count = 0;
  const perProject: { name: string; count: number }[] = [];
  queries.forEach((q, i) => {
    const flows = q.data?.data ?? [];
    const projectCount = flows.filter(dashboardData.isScheduleTrigger).length;
    count += projectCount;
    if (projectCount > 0) {
      perProject.push({
        name: projectNameById.get(projectIds[i]) ?? '—',
        count: projectCount,
      });
    }
  });
  perProject.sort((a, b) => b.count - a.count);
  return {
    state,
    count,
    breakdown:
      perProject.length > 1 ? dashboardData.formatBreakdown(perProject) : '',
  };
}

function renderFailedFootnote(card: {
  state: 'loading' | 'error' | 'ready';
  failed: number;
  total: number;
}): string {
  if (card.state !== 'ready') return '';
  if (card.total === 0) {
    return t('No runs in the last 24h.');
  }
  if (card.failed === 0) {
    return t('All clear · {total} runs', { total: card.total });
  }
  const successRate = Math.round(
    ((card.total - card.failed) / card.total) * 100,
  );
  return t('{successRate}% success rate · {failed} of {total} runs', {
    successRate,
    failed: card.failed,
    total: card.total,
  });
}

function renderNeedsAttentionFootnote(card: {
  state: 'loading' | 'error' | 'ready';
  count: number;
}): string {
  if (card.state !== 'ready') return '';
  if (card.count === 0) return t('All workflows healthy.');
  return t('Paused after being published');
}

function renderInProgressFootnote(card: {
  state: 'loading' | 'error' | 'ready';
  running: number;
  waiting: number;
}): string {
  if (card.state !== 'ready') return '';
  if (card.running + card.waiting === 0) return t('Nothing running right now.');
  const parts: string[] = [];
  if (card.running > 0) {
    parts.push(t('{count} running', { count: card.running }));
  }
  if (card.waiting > 0) {
    parts.push(t('{count} waiting on approval', { count: card.waiting }));
  }
  return parts.join(' · ');
}

function renderActiveSchedulesFootnote(
  card: { state: 'loading' | 'error' | 'ready'; count: number },
  totalProjects: number,
): string {
  if (card.state !== 'ready') return '';
  if (card.count === 0) return t('No scheduled workflows.');
  if (totalProjects <= 1) {
    return t('Across this project');
  }
  return t('Across {count} projects', { count: totalProjects });
}
