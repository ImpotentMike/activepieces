import {
  FlowOperationType,
  FlowStatus,
  PopulatedFlow,
} from '@activepieces/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';

import { flowsApi } from '@/features/flows/api/flows-api';

/**
 * Pauses several workflows at once.
 *
 * There is no batched flow endpoint on the server — only flow RUNS have one —
 * so this loops per row, matching the existing bulk pattern in this module.
 * It uses allSettled rather than all, because the existing bulk mutations fail
 * fast and report a partial success as a total failure.
 */
export const useBulkPause = ({
  onSettled,
}: { onSettled?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flows: PopulatedFlow[]) => {
      const results = await Promise.allSettled(
        flows.map((flow) =>
          flowsApi.update(flow.id, {
            type: FlowOperationType.CHANGE_STATUS,
            request: { status: FlowStatus.DISABLED },
          }),
        ),
      );
      const failed = results.filter(
        (result) => result.status === 'rejected',
      ).length;
      return { total: flows.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      if (failed === 0) {
        toast.success(
          t('Paused {count, plural, one {# workflow} other {# workflows}}', {
            count: total,
          }),
        );
      } else {
        toast.error(
          t('{failed} of {total} workflows could not be paused', {
            failed,
            total,
          }),
        );
      }
    },
    onError: () => {
      toast.error(t('Failed to pause workflows'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['root-flows'] });
      queryClient.invalidateQueries({ queryKey: ['all-folder-contents'] });
      onSettled?.();
    },
  });
};
