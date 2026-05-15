import {
  FlowRunStatus,
  FlowStatus,
  FlowTriggerType,
  PopulatedFlow,
  SeekPage,
} from '@activepieces/shared';

export const dashboardData = {
  aggregateState(
    queries: { isLoading: boolean; isError: boolean }[],
  ): 'loading' | 'error' | 'ready' {
    if (queries.length === 0) return 'ready';
    if (queries.some((q) => q.isLoading)) return 'loading';
    if (queries.every((q) => q.isError)) return 'error';
    return 'ready';
  },

  sumStatuses(
    data: { status: FlowRunStatus; count: number }[],
    statuses: readonly FlowRunStatus[],
  ): number {
    return data
      .filter(({ status }) => statuses.includes(status))
      .reduce((sum, { count }) => sum + count, 0);
  },

  sumAll(data: { status: FlowRunStatus; count: number }[]): number {
    return data.reduce((sum, { count }) => sum + count, 0);
  },

  formatBreakdown(items: { name: string; count: number }[], limit = 3): string {
    if (items.length === 0) return '';
    const top = items.slice(0, limit);
    const rest = items.length - top.length;
    const head = top.map((p) => `${p.name} ${p.count}`).join(' · ');
    return rest > 0 ? `${head} · +${rest} more` : head;
  },

  isScheduleTrigger(flow: PopulatedFlow): boolean {
    const trigger = flow.version?.trigger;
    if (!trigger || trigger.type !== FlowTriggerType.PIECE) return false;
    return trigger.settings.pieceName === SCHEDULE_PIECE_NAME;
  },

  isDisabledAndPublished(flow: PopulatedFlow): boolean {
    return (
      flow.status === FlowStatus.DISABLED && flow.publishedVersionId !== null
    );
  },

  flattenAndTakeTop<T>({
    pages,
    getSortKey,
    limit,
  }: {
    pages: (SeekPage<T> | undefined)[];
    getSortKey: (item: T) => number;
    limit: number;
  }): T[] {
    const merged: T[] = [];
    pages.forEach((page) => {
      if (page?.data) merged.push(...page.data);
    });
    merged.sort((a, b) => getSortKey(b) - getSortKey(a));
    return merged.slice(0, limit);
  },

  buildRunsHref({
    projectId,
    statuses,
    timeWindow,
  }: {
    projectId: string;
    statuses?: readonly FlowRunStatus[];
    timeWindow?: { createdAfter: string; createdBefore: string };
  }): string {
    const params = new URLSearchParams();
    statuses?.forEach((s) => params.append('status', s));
    if (timeWindow) {
      params.set('createdAfter', timeWindow.createdAfter);
      params.set('createdBefore', timeWindow.createdBefore);
    }
    const qs = params.toString();
    return `/projects/${projectId}/runs${qs ? `?${qs}` : ''}`;
  },
};

export const FAILED_STATUSES = [
  FlowRunStatus.FAILED,
  FlowRunStatus.INTERNAL_ERROR,
  FlowRunStatus.QUOTA_EXCEEDED,
  FlowRunStatus.MEMORY_LIMIT_EXCEEDED,
  FlowRunStatus.LOG_SIZE_EXCEEDED,
  FlowRunStatus.TIMEOUT,
] as const;

export const RUNNING_STATUSES = [
  FlowRunStatus.RUNNING,
  FlowRunStatus.QUEUED,
] as const;

export const WAITING_STATUSES = [FlowRunStatus.PAUSED] as const;

export const IN_PROGRESS_STATUSES = [
  ...RUNNING_STATUSES,
  ...WAITING_STATUSES,
] as const;

export const DASHBOARD_DAY_MS = 24 * 60 * 60 * 1000;

export const SCHEDULE_PIECE_NAME = '@activepieces/piece-schedule';
