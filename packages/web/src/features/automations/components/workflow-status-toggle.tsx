import { FlowStatus, PopulatedFlow } from '@activepieces/shared';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { useState } from 'react';

import { LoadingSpinner } from '@/components/custom/spinner';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { flowHooks } from '@/features/flows/hooks/flow-hooks';
import { flowsUtils } from '@/features/flows/utils/flows-utils';

import { useWorkflowCapabilities } from '../lib/workflow-capabilities';
import { flowLifecycleStatus } from '../lib/workflow-lifecycle';

import { DraftToggle } from './draft-toggle';
import { PauseWorkflowDialog } from './pause-workflow-dialog';
import { ResumeRestrictedToggle } from './resume-restricted-toggle';

/**
 * The Workflow List's lifecycle toggle.
 *
 * PromptFlow-owned rather than a change to the upstream `FlowStatusToggle`,
 * which hardcodes its own disabled conditions and tooltip copy and is still
 * used by the builder. Keeping this separate leaves the upstream component at
 * zero added divergence.
 *
 * Behaviour: pausing an Active workflow goes through a confirmation dialog;
 * resuming is immediate, because resume is additive and needs no gate.
 */
export const WorkflowStatusToggle = ({
  flow,
  onPublish,
}: WorkflowStatusToggleProps) => {
  const queryClient = useQueryClient();
  const { capabilities } = useWorkflowCapabilities();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);

  const lifecycle = flowLifecycleStatus(flow);
  const isActive = flow.status === FlowStatus.ENABLED;
  const isResumeRestricted =
    lifecycle === 'paused' && !capabilities.canResumeWorkflow;

  const { mutateAsync: changeStatus, isPending } =
    flowHooks.useChangeFlowStatus({
      flowId: flow.id,
      change: isActive ? FlowStatus.DISABLED : FlowStatus.ENABLED,
      onSuccess: () => {
        // Upstream's toggle only updates its own local state, which leaves the
        // sibling lifecycle pill reading a stale flow.status until the next
        // refetch. Invalidating here keeps badge and toggle in step.
        queryClient.invalidateQueries({ queryKey: ['root-flows'] });
        queryClient.invalidateQueries({ queryKey: ['all-folder-contents'] });
      },
    });

  const isDisabled =
    isPending ||
    (isActive
      ? !capabilities.canPauseWorkflow
      : !capabilities.canResumeWorkflow);

  const handleCheckedChange = () => {
    if (isActive) {
      setIsPauseDialogOpen(true);
      return;
    }
    changeStatus();
  };

  if (lifecycle === 'draft') {
    return (
      <DraftToggle
        canPublish={capabilities.canPublishWorkflow}
        onPublish={onPublish}
      />
    );
  }

  if (isResumeRestricted) {
    return <ResumeRestrictedToggle />;
  }

  return (
    <div className="flex items-center justify-start gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center">
            <Switch
              checked={isActive}
              onCheckedChange={handleCheckedChange}
              disabled={isDisabled}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isActive
            ? capabilities.canPauseWorkflow
              ? t('Workflow is active')
              : t('Permission Needed')
            : t('Workflow is paused')}
        </TooltipContent>
      </Tooltip>
      {isPending ? (
        <LoadingSpinner />
      ) : (
        isActive && (
          <Tooltip>
            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center">
                {flowsUtils.flowStatusIconRenderer(flow)}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {flowsUtils.flowStatusToolTipRenderer(flow)}
            </TooltipContent>
          </Tooltip>
        )
      )}
      <PauseWorkflowDialog
        open={isPauseDialogOpen}
        onOpenChange={setIsPauseDialogOpen}
        workflows={[flow]}
        canResume={capabilities.canResumeWorkflow}
        onConfirm={async () => {
          await changeStatus();
        }}
      />
    </div>
  );
};

export type WorkflowStatusToggleProps = {
  flow: PopulatedFlow;
  /** Opens the workflow in the builder, where publishing happens. */
  onPublish: () => void;
};
