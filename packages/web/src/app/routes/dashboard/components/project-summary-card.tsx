import { PfCard } from '@/components/custom/pf-card';

const CARD_GRADIENT =
  'radial-gradient(115% 130% at 0% 100%, hsl(var(--primary-500) / 0.22), transparent 58%),' +
  'radial-gradient(120% 120% at 100% 0%, hsl(280 92% 70% / 0.18), transparent 52%),' +
  'linear-gradient(140deg, hsl(var(--primary-100) / 0.55), hsl(var(--background)) 70%)';

export function ProjectSummaryCard({ name }: ProjectSummaryCardProps) {
  return (
    <PfCard
      data-slot="dashboard-project-summary"
      className="relative h-full justify-center overflow-hidden border-primary-100/80"
      style={{ background: CARD_GRADIENT }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary-400/15 blur-3xl"
      />

      <h2 className="m-0 line-clamp-3 break-words text-[26px] font-bold leading-[1.1] tracking-tight text-foreground">
        {name}
      </h2>
    </PfCard>
  );
}

export type ProjectSummaryCardProps = {
  name: string;
};
