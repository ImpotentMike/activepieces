import { PopulatedFlow } from '@activepieces/shared';
import { t } from 'i18next';
import { PauseCircle } from 'lucide-react';
import { useState } from 'react';

import { LoadingSpinner } from '@/components/custom/spinner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useBulkPause } from '../hooks/use-bulk-pause';
import { useWorkflowCapabilities } from '../lib/workflow-capabilities';
import { flowLifecycleStatus } from '../lib/workflow-lifecycle';

import { PauseWorkflowDialog } from './pause-workflow-dialog';

/**
 * Bulk pause for the selection bar. Reuses the same confirmation dialog as the
 * per-row toggle, once for the whole batch rather than once per row.
 */
export const BulkPauseAction = ({
  selectedFlows,
  onAfterPause,
}: BulkPauseActionProps) => {
  const { capabilities } = useWorkflowCapabilities();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const bulkPause = useBulkPause({ onSettled: onAfterPause });

  const activeFlows = selectedFlows.filter(
    (flow) => flowLifecycleStatus(flow) === 'published',
  );
  const notActiveCount = selectedFlows.length - activeFlows.length;
  const hasNothingToPause = activeFlows.length === 0;

  if (!capabilities.canPauseWorkflow) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" disabled>
              <PauseCircle className="h-4 w-4 mr-1" />
              {t('Pause')}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {t('Your role cannot pause workflows.')}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={bulkPause.isPending || hasNothingToPause}
      >
        {bulkPause.isPending ? (
          <LoadingSpinner className="size-4 mr-2" />
        ) : (
          <PauseCircle className="h-4 w-4 mr-1" />
        )}
        {t('Pause')}
      </Button>
      <PauseWorkflowDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        workflows={activeFlows}
        notActiveCount={notActiveCount}
        canResume={capabilities.canResumeWorkflow}
        onConfirm={async () => {
          await bulkPause.mutateAsync(activeFlows);
        }}
      />
    </>
  );
};

export type BulkPauseActionProps = {
  /** Every selected flow row, whatever its lifecycle state. */
  selectedFlows: PopulatedFlow[];
  onAfterPause: () => void;
};
