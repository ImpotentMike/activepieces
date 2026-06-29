import { t } from 'i18next';
import { ChevronRight, Workflow } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import {
  DashboardQueryState,
  DashboardWorkflowComposition,
} from '../lib/dashboard-data';

const DONUT_SIZE = 132;

export function WorkflowsDonutCard({
  composition,
  state,
  onManage,
}: WorkflowsDonutCardProps) {
  const total = composition
    ? composition.running + composition.published + composition.draft
    : 0;

  const segments: Segment[] = [
    {
      key: 'running',
      label: t('Running'),
      value: composition?.running ?? 0,
      color: 'hsl(var(--primary-600))',
    },
    {
      key: 'paused',
      label: t('Paused'),
      value: composition?.published ?? 0,
      color: 'hsl(var(--warning-500))',
    },
    {
      key: 'draft',
      label: t('Draft'),
      value: composition?.draft ?? 0,
      color: '#cbd5e1',
    },
  ];

  const arcData = segments.filter((segment) => segment.value > 0);
  const donutData =
    arcData.length > 0
      ? arcData
      : [{ key: 'empty', label: '', value: 1, color: 'hsl(var(--muted))' }];

  return (
    <PfCard data-slot="dashboard-workflows-donut" className="h-full gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
          <Workflow
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          {t('Total workflows')}
        </h3>
        <ManageLink onClick={onManage} />
      </div>

      {state === 'loading' ? (
        <DonutSkeleton />
      ) : state === 'error' ? (
        <p className="flex min-h-[136px] items-center text-sm text-muted-foreground">
          {t('Couldn’t load workflows.')}
        </p>
      ) : (
        <div className="flex items-center gap-5">
          <div
            className="relative shrink-0"
            style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
            role="img"
            aria-label={t('{total} workflows total', { total })}
          >
            <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
              <Pie
                data={donutData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={64}
                paddingAngle={arcData.length > 1 ? 3 : 0}
                cornerRadius={5}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {donutData.map((segment) => (
                  <Cell key={segment.key} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[30px] font-bold leading-none tracking-tight tabular-nums text-foreground">
                {total}
              </span>
              <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                {t('Workflows')}
              </span>
            </div>
          </div>

          <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
            {segments.map((segment) => (
              <li
                key={segment.key}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <span className="inline-flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: segment.color }}
                  />
                  <span className="truncate">{segment.label}</span>
                </span>
                <b className="font-semibold tabular-nums text-foreground">
                  {segment.value}
                </b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PfCard>
  );
}

function ManageLink({ onClick }: { onClick?: () => void }) {
  if (!onClick) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-muted-foreground',
        'transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/30',
      )}
    >
      {t('Manage')}
      <ChevronRight className="size-3.5" />
    </button>
  );
}

function DonutSkeleton() {
  return (
    <div className="flex items-center gap-5">
      <span
        aria-hidden="true"
        className="size-[132px] shrink-0 animate-pulse rounded-full bg-gray-100"
      />
      <div className="flex flex-1 flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-4 w-full animate-pulse rounded bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}

type Segment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type WorkflowsDonutCardProps = {
  composition: DashboardWorkflowComposition | undefined;
  state: DashboardQueryState;
  onManage?: () => void;
};
