import { t } from 'i18next';
import { ChevronRight, Workflow } from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import {
  DashboardQueryState,
  DashboardWorkflowComposition,
} from '../lib/dashboard-data';

const CARD_BG =
  'radial-gradient(120% 140% at 100% 0%, hsl(224 76% 32% / 0.55), transparent 55%),' +
  'linear-gradient(155deg, hsl(var(--primary-950)) 0%, hsl(226 62% 11%) 100%)';

export function WorkflowsSummaryCard({
  composition,
  state,
  onManage,
}: WorkflowsSummaryCardProps) {
  const total = composition
    ? composition.running + composition.draft + composition.paused
    : 0;

  const segments: Segment[] = [
    {
      key: 'running',
      label: t('Running'),
      value: composition?.running ?? 0,
      color: 'hsl(var(--primary-400))',
    },
    {
      key: 'draft',
      label: t('Draft'),
      value: composition?.draft ?? 0,
      color: 'hsl(var(--warning-400))',
    },
    {
      key: 'paused',
      label: t('Paused'),
      value: composition?.paused ?? 0,
      color: 'hsl(215 20% 55%)',
    },
  ];

  return (
    <PfCard
      data-slot="dashboard-workflows-summary"
      className="h-full justify-between gap-5 border-transparent text-white shadow-md"
      style={{ background: CARD_BG }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
          <Workflow aria-hidden="true" className="size-4 text-white/70" />
          {t('Total workflows')}
        </h3>
        {onManage ? (
          <button
            type="button"
            onClick={onManage}
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-white/70',
              'transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/30',
            )}
          >
            {t('Manage')}
            <ChevronRight className="size-3.5" />
          </button>
        ) : null}
      </div>

      {state === 'loading' ? (
        <SummarySkeleton />
      ) : state === 'error' ? (
        <p className="flex min-h-[120px] items-center text-sm text-white/60">
          {t('Couldn’t load workflows.')}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <span className="text-[52px] font-bold leading-none tracking-tight tabular-nums text-white">
              {total}
            </span>
            <span className="mb-1.5 text-[13px] leading-snug text-white/60">
              {t('Workflows in this project')}
            </span>
          </div>

          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={t('{total} workflows total', { total })}
          >
            {total > 0 ? (
              segments
                .filter((segment) => segment.value > 0)
                .map((segment) => (
                  <span
                    key={segment.key}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${(segment.value / total) * 100}%`,
                      background: segment.color,
                    }}
                  />
                ))
            ) : (
              <span className="h-full w-full" />
            )}
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {segments.map((segment) => (
              <li
                key={segment.key}
                className="inline-flex items-center gap-2 text-[13px]"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ background: segment.color }}
                />
                <span className="text-white/70">{segment.label}</span>
                <b className="font-semibold tabular-nums text-white">
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

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <span
        aria-hidden="true"
        className="h-12 w-24 animate-pulse rounded-md bg-white/10"
      />
      <span
        aria-hidden="true"
        className="h-2.5 w-full animate-pulse rounded-full bg-white/10"
      />
      <span
        aria-hidden="true"
        className="h-4 w-3/4 animate-pulse rounded bg-white/10"
      />
    </div>
  );
}

type Segment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type WorkflowsSummaryCardProps = {
  composition: DashboardWorkflowComposition | undefined;
  state: DashboardQueryState;
  onManage?: () => void;
};
