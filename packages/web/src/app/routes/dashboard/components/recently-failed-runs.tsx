import { FlowRun } from '@activepieces/shared';
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
import { cn } from '@/lib/utils';

export function RecentlyFailedRuns({
  runs,
  projectNameById,
  onRowClick,
  state,
}: RecentlyFailedRunsProps) {
  if (state === 'loading') {
    return (
      <div
        data-slot="recently-failed-runs-skeleton"
        className="flex flex-col gap-2"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse rounded-md bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <p className="px-1 py-6 text-sm text-muted-foreground">
        {t('Couldn’t load recent failures.')}
      </p>
    );
  }

  if (runs.length === 0) {
    return (
      <p
        data-slot="recently-failed-runs-empty"
        className="px-1 py-6 text-sm text-muted-foreground"
      >
        {t('No failures to investigate. Good.')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 text-[12px] font-medium text-muted-foreground">
              {t('Flow')}
            </TableHead>
            <TableHead className="h-9 text-[12px] font-medium text-muted-foreground">
              {t('Project')}
            </TableHead>
            <TableHead className="h-9 text-[12px] font-medium text-muted-foreground">
              {t('Status')}
            </TableHead>
            <TableHead className="h-9 text-[12px] font-medium text-muted-foreground">
              {t('Started At')}
            </TableHead>
            <TableHead className="h-9 text-[12px] font-medium text-muted-foreground">
              {t('Failed Step')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const displayName = run.flowVersion?.displayName ?? '—';
            const projectName = projectNameById.get(run.projectId) ?? '—';
            const failedStep = run.failedStep?.displayName ?? '—';
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
                  'cursor-pointer transition-colors hover:bg-gray-50',
                  'focus-visible:bg-gray-50 focus-visible:outline-none',
                )}
              >
                <TableCell className="font-medium">{displayName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {projectName}
                </TableCell>
                <TableCell>
                  <PfStatusPill
                    status={flowRunUtils.getStatusPillStatus(run.status)}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <FormattedDate
                    date={new Date(run.created)}
                    includeTime={true}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {failedStep}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

type RecentlyFailedRunsProps = {
  runs: FlowRun[];
  projectNameById: Map<string, string>;
  onRowClick: (run: FlowRun) => void;
  state: 'loading' | 'error' | 'ready';
};
