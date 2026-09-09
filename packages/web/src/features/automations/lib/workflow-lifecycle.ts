import { FlowStatus, PopulatedFlow, isNil } from '@activepieces/shared';

import { PfStatusPillStatus } from '@/components/custom/pf-status-pill';

/**
 * The workflow list's three display states, derived from two fields — there is
 * no stored lifecycle enum. `FlowStatus` has only ENABLED and DISABLED, and
 * DISABLED covers both "never published" and "paused"; `publishedVersionId` is
 * the only disambiguator.
 *
 * Matches the server-side derivation used by the dashboard counts.
 */
export const flowLifecycleStatus = (
  flow: PopulatedFlow,
): WorkflowLifecycleStatus => {
  if (isNil(flow.publishedVersionId)) {
    return 'draft';
  }
  return flow.status === FlowStatus.ENABLED ? 'published' : 'paused';
};

export type WorkflowLifecycleStatus = Extract<
  PfStatusPillStatus,
  'draft' | 'published' | 'paused'
>;
