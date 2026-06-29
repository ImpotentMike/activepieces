import { t } from 'i18next';

import { PfCard } from '@/components/custom/pf-card';
import { cn } from '@/lib/utils';

import { DashboardQueryState } from '../lib/dashboard-data';

const CARD_GRADIENT =
  'radial-gradient(115% 130% at 0% 100%, hsl(var(--primary-500) / 0.22), transparent 58%),' +
  'radial-gradient(120% 120% at 100% 0%, hsl(280 92% 70% / 0.18), transparent 52%),' +
  'linear-gradient(140deg, hsl(var(--primary-100) / 0.55), hsl(var(--background)) 70%)';

export function ProjectSummaryCard({
  name,
  total,
  running,
  state,
}: ProjectSummaryCardProps) {
  return (
    <PfCard
      data-slot="dashboard-project-summary"
      className="relative h-full justify-between overflow-hidden border-primary-100/80"
      style={{ background: CARD_GRADIENT }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary-400/15 blur-3xl"
      />

      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700/90">
        {t('Workspace')}
      </p>

      <h2 className="m-0 line-clamp-3 break-words text-[26px] font-bold leading-[1.1] tracking-tight text-foreground">
        {name}
      </h2>

      <div className="flex items-center gap-5 text-[12.5px] text-gray-600 dark:text-gray-300">
        <ProjectFact value={total} label={t('workflows')} state={state} />
        <span aria-hidden="true" className="h-7 w-px bg-primary-200/70" />
        <ProjectFact
          value={running}
          label={t('running')}
          state={state}
          dotClassName="bg-primary-600"
        />
      </div>
    </PfCard>
  );
}

function ProjectFact({ value, label, state, dotClassName }: ProjectFactProps) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      {dotClassName ? (
        <span
          aria-hidden="true"
          className={cn('size-1.5 self-center rounded-full', dotClassName)}
        />
      ) : null}
      {state === 'loading' ? (
        <span
          aria-hidden="true"
          className="inline-block h-5 w-7 animate-pulse rounded bg-primary-200/50"
        />
      ) : (
        <b className="text-[17px] font-semibold tabular-nums text-foreground">
          {value.toLocaleString()}
        </b>
      )}
      {label}
    </span>
  );
}

type ProjectFactProps = {
  value: number;
  label: string;
  state: DashboardQueryState;
  dotClassName?: string;
};

export type ProjectSummaryCardProps = {
  name: string;
  total: number;
  running: number;
  state: DashboardQueryState;
};
