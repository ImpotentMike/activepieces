import {
  FlowRunCountByDay,
  PlatformWithoutSensitiveData,
} from '@activepieces/shared';
import dayjs from 'dayjs';

import { dashboardData, PfTrend } from '../../dashboard/lib/dashboard-data';

function pickGreetingKey(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function rate(succeeded: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((succeeded / total) * 1000) / 10;
}

export const rndDashboardData = {
  greetingKey(hour: number): string {
    return pickGreetingKey(hour);
  },

  windowStats({
    series,
    days,
  }: {
    series: FlowRunCountByDay[];
    days: number;
  }): RndWindowStats {
    const current = dashboardData.sumSeries(series.slice(-days));
    const previous = dashboardData.sumSeries(series.slice(-days * 2, -days));
    return {
      total: current.total,
      succeeded: current.succeeded,
      failed: current.failed,
      successRate: rate(current.succeeded, current.total),
      totalTrend: dashboardData.trend({
        current: current.total,
        previous: previous.total,
      }),
      failedTrend: dashboardData.trend({
        current: current.failed,
        previous: previous.failed,
      }),
    };
  },

  successRateTrend({
    series,
  }: {
    series: FlowRunCountByDay[];
  }): PfTrend | undefined {
    const last7 = dashboardData.sumSeries(series.slice(-7));
    const prev7 = dashboardData.sumSeries(series.slice(-14, -7));
    const current = rate(last7.succeeded, last7.total);
    const previous = rate(prev7.succeeded, prev7.total);
    if (current === null || previous === null) return undefined;
    const delta = Math.round((current - previous) * 10) / 10;
    if (delta === 0) return { direction: 'flat', value: '0%' };
    return {
      direction: delta > 0 ? 'up' : 'down',
      value: `${delta > 0 ? '+' : ''}${delta}%`,
    };
  },

  planUsage({
    platform,
  }: {
    platform: PlatformWithoutSensitiveData;
  }): RndPlanUsage {
    const usage = platform.usage;
    const resetInDays = Math.max(
      0,
      dayjs().endOf('month').diff(dayjs(), 'day'),
    );
    const aiLimit = usage?.aiCreditsLimit ?? 0;
    if (usage && aiLimit > 0) {
      const used = Math.round(usage.totalAiCreditsUsedThisMonth);
      return {
        kind: 'metered',
        unitKey: 'AI credits',
        used,
        limit: aiLimit,
        percent: Math.min(100, Math.round((used / aiLimit) * 100)),
        resetInDays,
      };
    }

    const activeFlows = usage?.activeFlows ?? 0;
    const flowLimit = platform.plan.activeFlowsLimit ?? null;
    if (flowLimit && flowLimit > 0) {
      return {
        kind: 'metered',
        unitKey: 'active workflows',
        used: activeFlows,
        limit: flowLimit,
        percent: Math.min(100, Math.round((activeFlows / flowLimit) * 100)),
        resetInDays,
      };
    }

    return {
      kind: 'unlimited',
      unitKey: 'active workflows',
      used: activeFlows,
      limit: null,
      percent: 0,
      resetInDays,
    };
  },
};

export type RndWindowStats = {
  total: number;
  succeeded: number;
  failed: number;
  successRate: number | null;
  totalTrend: PfTrend | undefined;
  failedTrend: PfTrend | undefined;
};

export type RndPlanUsage = {
  kind: 'metered' | 'unlimited';
  unitKey: string;
  used: number;
  limit: number | null;
  percent: number;
  resetInDays: number;
};
