import { FlowRunStatus } from '@activepieces/shared';
import { t } from 'i18next';

import { FormattedDate } from '@/components/custom/formatted-date';
import { PfStatusPill } from '@/components/custom/pf-status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flowRunUtils } from '@/features/flow-runs/utils/flow-run-utils';
import { formatUtils } from '@/lib/format-utils';
import { cn } from '@/lib/utils';

import { DashboardQueryState } from '../lib/dashboard-data';

export function RecentRuns({ runs, onRowClick, state }: RecentRunsProps) {
  if (state === 'loading') {
    return (
      <div data-slot="recent-runs-skeleton" className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <p className="px-1 py-6 text-sm text-muted-foreground">
        {t('Couldn’t load recent runs.')}
      </p>
    );
  }

  if (runs.length === 0) {
    return (
      <p
        data-slot="recent-runs-empty"
        className="px-1 py-6 text-sm text-muted-foreground"
      >
        {t('No runs yet. Runs appear here once your workflows execute.')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-10 bg-muted/50 text-[12px] font-medium text-muted-foreground">
              {t('Workflow')}
            </TableHead>
            <TableHead className="h-10 bg-muted/50 text-[12px] font-medium text-muted-foreground">
              {t('Status')}
            </TableHead>
            <TableHead className="h-10 bg-muted/50 text-[12px] font-medium text-muted-foreground">
              {t('Started At')}
            </TableHead>
            <TableHead className="h-10 bg-muted/50 text-right text-[12px] font-medium text-muted-foreground">
              {t('Duration')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const name = run.flowVersion?.displayName ?? t('Untitled');
            return (
              <TableRow
                key={run.id}
                tabIndex={0}
                role="button"
                onClick={() => onRowClick(run)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(run);
                  }
                }}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  'focus-visible:bg-muted/50 focus-visible:outline-none',
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      style={{ background: avatarColor(name) }}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-[10.5px] font-bold text-white"
                    >
                      {initials(name)}
                    </span>
                    <span className="max-w-[320px] truncate">{name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <PfStatusPill
                    status={flowRunUtils.getStatusPillStatus(run.status)}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <FormattedDate date={new Date(run.created)} includeTime />
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatRunDuration(run)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatRunDuration(run: RecentRunRow): string {
  if (!run.startTime || !run.finishTime) {
    return '—';
  }
  const durationMs =
    new Date(run.finishTime).getTime() - new Date(run.startTime).getTime();
  return formatUtils.formatDuration(durationMs, true);
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '—';
  const first = words[0]?.[0] ?? '';
  const second = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : '';
  return (first + second).toUpperCase();
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const AVATAR_COLORS = [
  '#2563eb',
  '#059669',
  '#d946ef',
  '#f59e0b',
  '#0ea5e9',
  '#8b5cf6',
  '#14b8a6',
  '#ec4899',
  '#6366f1',
  '#ef4444',
];

export type RecentRunRow = {
  id: string;
  projectId: string;
  flowId?: string;
  status: FlowRunStatus;
  created: string;
  startTime?: string | null;
  finishTime?: string | null;
  flowVersion?: { displayName?: string } | null;
  failedStep?: { name: string; displayName: string } | null;
};

type RecentRunsProps = {
  runs: RecentRunRow[];
  onRowClick: (run: RecentRunRow) => void;
  state: DashboardQueryState;
};
