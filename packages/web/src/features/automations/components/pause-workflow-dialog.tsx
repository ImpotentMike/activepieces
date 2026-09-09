import { PopulatedFlow, isNil, tryCatch } from '@activepieces/shared';
import cronstrue from 'cronstrue/i18n';
import { t } from 'i18next';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Confirmation for pausing one or more Active workflows. Carries the
 * consequences of pausing rather than a bare yes/no, and is shared by the
 * per-row toggle and the bulk action so a batch gets ONE dialog, not one per
 * row.
 *
 * Resuming is deliberately not confirmed — it is additive and needs no gate.
 */
export const PauseWorkflowDialog = ({
  open,
  onOpenChange,
  workflows,
  notActiveCount = 0,
  excludedByRoleCount = 0,
  canResume,
  onConfirm,
}: PauseWorkflowDialogProps) => {
  const [isPausing, setIsPausing] = useState(false);

  const count = workflows.length;
  const isSingle = count === 1;
  const schedule = isSingle ? humanReadableSchedule(workflows[0]) : null;

  const handleConfirm = async () => {
    setIsPausing(true);
    const { error } = await tryCatch(onConfirm);
    setIsPausing(false);
    if (isNil(error)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {isSingle
              ? t('Pause "{name}"?', { name: workflows[0].version.displayName })
              : t('Pause {count} workflows?', { count })}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              {!isNil(schedule) && (
                <p>{t('This workflow runs {schedule}.', { schedule })}</p>
              )}
              <p>
                {isSingle
                  ? t(
                      'Scheduled runs stop until you turn it back on. You can edit it and republish when you are ready.',
                    )
                  : t(
                      'Scheduled runs stop until they are turned back on. They can be edited and republished at any time.',
                    )}
              </p>
              <p>{t('Any run already in progress will finish normally.')}</p>
              {!isSingle && <WorkflowNameList workflows={workflows} />}
              {notActiveCount > 0 && (
                <p>
                  {t(
                    'Only the {count} active workflows will be paused. {unaffected} are not active and stay as they are.',
                    { count, unaffected: notActiveCount },
                  )}
                </p>
              )}
              {excludedByRoleCount > 0 && (
                <p>
                  {t(
                    '{count} workflows were excluded because your role cannot pause them.',
                    { count: excludedByRoleCount },
                  )}
                </p>
              )}
              {!canResume && (
                <p className="font-medium text-foreground">
                  {isSingle
                    ? t('Only an Admin can resume this workflow once paused.')
                    : t(
                        'Only an Admin can resume these workflows once paused.',
                      )}
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPausing}
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button loading={isPausing} onClick={() => handleConfirm()}>
            {t('Pause workflow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const WorkflowNameList = ({ workflows }: { workflows: PopulatedFlow[] }) => {
  const shown = workflows.slice(0, NAME_LIST_LIMIT);
  const remaining = workflows.length - shown.length;

  return (
    <ul className="list-disc pl-5">
      {shown.map((flow) => (
        <li key={flow.id} className="truncate">
          {flow.version.displayName}
        </li>
      ))}
      {remaining > 0 && <li>{t('and {count} more', { count: remaining })}</li>}
    </ul>
  );
};

/**
 * The schedule is only present while a flow is ENABLED (pausing soft-deletes
 * the trigger source), which is exactly when this dialog opens. It is still
 * absent for webhook and real-time triggers, so the sentence is omitted rather
 * than shown with a placeholder.
 */
const humanReadableSchedule = (flow: PopulatedFlow): string | null => {
  const cronExpression = flow.triggerSource?.schedule?.cronExpression;
  if (isNil(cronExpression)) {
    return null;
  }
  return cronstrue.toString(cronExpression, { locale: 'en' }).toLowerCase();
};

const NAME_LIST_LIMIT = 5;

export type PauseWorkflowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Active workflows that will actually be paused. */
  workflows: PopulatedFlow[];
  /** Selected rows that are not Active, so will be left alone. */
  notActiveCount?: number;
  /** Selected rows the current role may not pause, so were excluded. */
  excludedByRoleCount?: number;
  canResume: boolean;
  onConfirm: () => Promise<void>;
};
