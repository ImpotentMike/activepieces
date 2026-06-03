import { t } from 'i18next';
import { GitBranch } from 'lucide-react';

import { PfCard } from '@/components/custom/pf-card';
import { Button } from '@/components/ui/button';

import { AiProposal } from './types';

export function AiProposalCard({
  proposal,
  onApply,
  onDiscard,
}: AiProposalCardProps) {
  return (
    <PfCard density="compact" className="gap-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <GitBranch className="size-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {t('Proposed workflow')}
        </span>
      </div>
      <p className="m-0 text-[13px] leading-normal text-foreground">
        {proposal.summary}
      </p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {proposal.steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-2.5">
            <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-medium text-muted-foreground">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[13px] font-medium leading-snug text-foreground">
                {step.title}
              </span>
              {step.detail ? (
                <span className="text-[12px] text-muted-foreground">
                  {step.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
        <Button size="sm" variant="default" onClick={onApply}>
          {t('Apply to canvas')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          {t('Discard')}
        </Button>
      </div>
    </PfCard>
  );
}

type AiProposalCardProps = {
  proposal: AiProposal;
  onApply: () => void;
  onDiscard: () => void;
};
