import {
  FAILED_STATES,
  FlowRunCountByDay,
  FlowRunStatus,
} from '@activepieces/shared';
import dayjs from 'dayjs';

import { RecentRunRow } from '../components/recent-runs';

const FAILURE_RATE_ELEVATED_PERCENT = 5;
const FAILURE_RATE_HIGH_PERCENT = 15;

export const dashboardData = {
  queryState({
    isLoading,
    isError,
  }: {
    isLoading: boolean;
    isError: boolean;
  }): DashboardQueryState {
    if (isLoading) return 'loading';
    if (isError) return 'error';
    return 'ready';
  },

  fillDailySeries({
    counts,
    days,
  }: {
    counts: FlowRunCountByDay[];
    days: number;
  }): FlowRunCountByDay[] {
    const byDay = new Map(counts.map((count) => [count.day, count]));
    return Array.from({ length: days }, (_, index) => {
      const day = dayjs()
        .subtract(days - 1 - index, 'day')
        .format('YYYY-MM-DD');
      return byDay.get(day) ?? { day, total: 0, succeeded: 0, failed: 0 };
    });
  },

  sumSeries(series: FlowRunCountByDay[]): {
    total: number;
    succeeded: number;
    failed: number;
  } {
    return series.reduce(
      (acc, day) => ({
        total: acc.total + day.total,
        succeeded: acc.succeeded + day.succeeded,
        failed: acc.failed + day.failed,
      }),
      { total: 0, succeeded: 0, failed: 0 },
    );
  },

  failureRatePercent({
    total,
    failed,
  }: {
    total: number;
    failed: number;
  }): number | null {
    if (total === 0) return null;
    return Math.round((failed / total) * 1000) / 10;
  },

  failureRateLevel(ratePercent: number): DashboardFailureRateLevel {
    if (ratePercent < FAILURE_RATE_ELEVATED_PERCENT) return 'healthy';
    if (ratePercent < FAILURE_RATE_HIGH_PERCENT) return 'elevated';
    return 'high';
  },

  trend({
    current,
    previous,
  }: {
    current: number;
    previous: number;
  }): PfTrend | undefined {
    if (previous === 0) return undefined;
    const deltaPercent = Math.round(((current - previous) / previous) * 100);
    if (deltaPercent === 0) return { direction: 'flat', value: '0%' };
    return {
      direction: deltaPercent > 0 ? 'up' : 'down',
      value: `${deltaPercent > 0 ? '+' : ''}${deltaPercent}%`,
    };
  },

  buildRunsHref({
    projectId,
    statuses,
    flowId,
    timeWindow,
  }: {
    projectId: string;
    statuses?: readonly FlowRunStatus[];
    flowId?: string | null;
    timeWindow?: { createdAfter: string; createdBefore: string };
  }): string {
    const params = new URLSearchParams();
    statuses?.forEach((s) => params.append('status', s));
    if (flowId) {
      params.append('flowId', flowId);
    }
    if (timeWindow) {
      params.set('createdAfter', timeWindow.createdAfter);
      params.set('createdBefore', timeWindow.createdBefore);
    }
    const qs = params.toString();
    return `/projects/${projectId}/runs${qs ? `?${qs}` : ''}`;
  },

  failureWindow({
    series,
    days,
  }: {
    series: FlowRunCountByDay[];
    days: number;
  }): DashboardFailureWindow {
    const current = dashboardData.sumSeries(series.slice(-days));
    const previous = dashboardData.sumSeries(series.slice(-days * 2, -days));
    const ratePercent = dashboardData.failureRatePercent(current);
    const previousRate = dashboardData.failureRatePercent(previous);
    const level =
      ratePercent === null ? null : dashboardData.failureRateLevel(ratePercent);

    let trend: PfTrend | undefined;
    if (ratePercent !== null && previousRate !== null) {
      const delta = Math.round((ratePercent - previousRate) * 10) / 10;
      trend =
        delta === 0
          ? { direction: 'flat', value: '0%' }
          : {
              direction: delta > 0 ? 'up' : 'down',
              value: `${delta > 0 ? '+' : ''}${delta}%`,
            };
    }

    return {
      total: current.total,
      succeeded: current.succeeded,
      failed: current.failed,
      ratePercent,
      level,
      trend,
    };
  },

  runsWindow({
    series,
    days,
  }: {
    series: FlowRunCountByDay[];
    days: number;
  }): DashboardRunsWindow {
    const current = dashboardData.sumSeries(series.slice(-days));
    const previous = dashboardData.sumSeries(series.slice(-days * 2, -days));
    return {
      total: current.total,
      trend: dashboardData.trend({
        current: current.total,
        previous: previous.total,
      }),
    };
  },

  avgRunDurationMs({ runs }: { runs: RecentRunRow[] }): number | null {
    const durations = runs
      .filter((run) => run.startTime && run.finishTime)
      .map(
        (run) =>
          new Date(run.finishTime!).getTime() -
          new Date(run.startTime!).getTime(),
      )
      .filter((ms) => ms >= 0);
    if (durations.length === 0) {
      return null;
    }
    const sum = durations.reduce((acc, ms) => acc + ms, 0);
    return Math.round(sum / durations.length);
  },

  flaggedRuns({
    runs,
    limit = 5,
  }: {
    runs: RecentRunRow[];
    limit?: number;
  }): DashboardFlaggedRun[] {
    return runs
      .filter((run) => FAILED_STATES.includes(run.status))
      .slice(0, limit)
      .map((run) => ({
        id: run.id,
        projectId: run.projectId,
        flowId: run.flowId ?? null,
        name: run.flowVersion?.displayName ?? null,
        status: run.status,
      }));
  },

  flaggedWorkflows({
    runs,
    limit = 3,
  }: {
    runs: RecentRunRow[];
    limit?: number;
  }): DashboardFlaggedWorkflow[] {
    const byFlow = new Map<string, DashboardFlaggedWorkflow>();
    for (const run of runs) {
      if (!FAILED_STATES.includes(run.status)) {
        continue;
      }
      const name = run.flowVersion?.displayName ?? null;
      const key = run.flowId ?? name ?? run.id;
      const existing = byFlow.get(key);
      if (existing) {
        existing.failures += 1;
      } else {
        byFlow.set(key, { flowId: run.flowId ?? null, name, failures: 1 });
      }
    }
    return Array.from(byFlow.values())
      .sort((a, b) => b.failures - a.failures)
      .slice(0, limit);
  },
};

export type DashboardQueryState = 'loading' | 'error' | 'ready';

export type DashboardFailureRateLevel = 'healthy' | 'elevated' | 'high';

export type PfTrend = {
  direction: 'up' | 'down' | 'flat';
  value: string;
};

export type DashboardFailureWindow = {
  total: number;
  succeeded: number;
  failed: number;
  ratePercent: number | null;
  level: DashboardFailureRateLevel | null;
  trend: PfTrend | undefined;
};

export type DashboardFlaggedWorkflow = {
  flowId: string | null;
  name: string | null;
  failures: number;
};

export type DashboardRunsWindow = {
  total: number;
  trend: PfTrend | undefined;
};

export type DashboardFlaggedRun = {
  id: string;
  projectId: string;
  flowId: string | null;
  name: string | null;
  status: FlowRunStatus;
};

export type DashboardWorkflowComposition = {
  running: number;
  published: number;
  draft: number;
};
