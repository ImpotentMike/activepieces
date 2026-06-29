import { apId, FlowRunCountByDay, FlowRunStatus } from '@activepieces/shared';
import dayjs from 'dayjs';

import { RecentRunRow } from '../components/recent-runs';

const SYNTHETIC_DAYS = 30;
const ELEVATED_FAILURE_RATE = 0.05;

const WORKFLOW_COMPOSITION = {
  published: 6,
  draft: 5,
  paused: 3,
};

const RECENT_RUN_TEMPLATES: ReadonlyArray<{
  flowKey: string;
  name: string;
  status: FlowRunStatus;
  minutesAgo: number;
  durationMs: number | null;
}> = [
  {
    flowKey: 'ai-ticket-triage',
    name: 'AI ticket triage',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 1,
    durationMs: 1400,
  },
  {
    flowKey: 'lead-enrichment',
    name: 'Lead enrichment → HubSpot',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 6,
    durationMs: 820,
  },
  {
    flowKey: 'slack-form-alert',
    name: 'Slack alert on form submit',
    status: FlowRunStatus.RUNNING,
    minutesAgo: 8,
    durationMs: null,
  },
  {
    flowKey: 'postgres-backup',
    name: 'Daily Postgres backup',
    status: FlowRunStatus.FAILED,
    minutesAgo: 12,
    durationMs: 11200,
  },
  {
    flowKey: 'stripe-quickbooks',
    name: 'Stripe → QuickBooks sync',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 14,
    durationMs: 2100,
  },
  {
    flowKey: 'postgres-backup',
    name: 'Daily Postgres backup',
    status: FlowRunStatus.FAILED,
    minutesAgo: 23,
    durationMs: 12600,
  },
  {
    flowKey: 'shopify-webhook',
    name: 'Shopify order webhook',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 31,
    durationMs: 540,
  },
  {
    flowKey: 'salesforce-sync',
    name: 'Sync Salesforce contacts',
    status: FlowRunStatus.TIMEOUT,
    minutesAgo: 39,
    durationMs: 30000,
  },
  {
    flowKey: 'weekly-report',
    name: 'Weekly report email',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 47,
    durationMs: 3800,
  },
  {
    flowKey: 'image-resize',
    name: 'Image resize pipeline',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 58,
    durationMs: 4200,
  },
  {
    flowKey: 'github-pr-notifier',
    name: 'GitHub PR notifier',
    status: FlowRunStatus.FAILED,
    minutesAgo: 72,
    durationMs: 690,
  },
  {
    flowKey: 'rss-x-poster',
    name: 'RSS → X auto-poster',
    status: FlowRunStatus.SUCCEEDED,
    minutesAgo: 96,
    durationMs: 1100,
  },
];

function buildRunsByDay(): FlowRunCountByDay[] {
  const series: FlowRunCountByDay[] = [];
  for (let ago = SYNTHETIC_DAYS - 1; ago >= 0; ago--) {
    const date = dayjs().subtract(ago, 'day');
    const isWeekend = date.day() === 0 || date.day() === 6;
    const trend = 1 + (SYNTHETIC_DAYS - 1 - ago) * 0.013;
    const base = isWeekend ? 64 : 168;
    const wobble = Math.round(
      30 * Math.sin(ago * 1.35) + 20 * Math.cos(ago * 0.62),
    );
    const total = Math.max(22, Math.round((base + wobble) * trend));

    let failureRate = 0.011 + 0.006 * Math.abs(Math.sin(ago * 0.9));
    if (ago === 8 || ago === 9) failureRate = 0.082;
    if (ago === 3) failureRate = 0.058;
    const failed = Math.round(total * failureRate);

    series.push({
      day: date.format('YYYY-MM-DD'),
      total,
      succeeded: total - failed,
      failed,
    });
  }
  return series;
}

function buildRecentRuns(projectId: string): RecentRunRow[] {
  const flowIdByKey = new Map<string, string>();
  return RECENT_RUN_TEMPLATES.map((template) => {
    const startTime = dayjs().subtract(template.minutesAgo, 'minute');
    const isFinished = template.durationMs !== null;
    let flowId = flowIdByKey.get(template.flowKey);
    if (!flowId) {
      flowId = apId();
      flowIdByKey.set(template.flowKey, flowId);
    }
    return {
      id: apId(),
      projectId,
      flowId,
      status: template.status,
      created: startTime.toISOString(),
      startTime: startTime.toISOString(),
      finishTime: isFinished
        ? startTime.add(template.durationMs ?? 0, 'millisecond').toISOString()
        : null,
      flowVersion: { displayName: template.name },
    };
  });
}

export const dashboardSyntheticData = {
  elevatedFailureRate: ELEVATED_FAILURE_RATE,

  build({ projectId }: { projectId: string }): DashboardSyntheticData {
    const published = WORKFLOW_COMPOSITION.published;
    const draft = WORKFLOW_COMPOSITION.draft;
    const paused = WORKFLOW_COMPOSITION.paused;
    return {
      runsByDay: buildRunsByDay(),
      workflowCounts: {
        published,
        draft,
        paused,
        total: published + draft + paused,
      },
      recentRuns: buildRecentRuns(projectId),
    };
  },
};

export type DashboardWorkflowCounts = {
  published: number;
  draft: number;
  paused: number;
  total: number;
};

export type DashboardSyntheticData = {
  runsByDay: FlowRunCountByDay[];
  workflowCounts: DashboardWorkflowCounts;
  recentRuns: RecentRunRow[];
};
