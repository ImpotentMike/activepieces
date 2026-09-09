import { Permission } from '@activepieces/shared';

import { useDevProjectRole } from '@/features/projects/fixtures/promptflow-role-fixture';
import {
  useAuthorization,
  useIsPlatformAdmin,
} from '@/hooks/authorization-hooks';

/**
 * Single source of truth for what the current user may do to a workflow on the
 * Workflow List. Every gated control reads from here — components must never
 * compare role strings inline.
 *
 * Role is resolved PER PROJECT, not globally: PRD §8.6.1 allows a user to hold
 * different roles in different projects.
 */
export const useWorkflowCapabilities = (): ResolvedWorkflowCapabilities => {
  const { checkAccess, isFetchingProjectRole } = useAuthorization();
  const isPlatformAdmin = useIsPlatformAdmin();
  const devRole = useDevProjectRole();

  const role: PromptFlowRole | null =
    devRole ?? (isPlatformAdmin ? 'Superadmin' : null);

  if (role !== null) {
    return {
      role,
      capabilities: capabilitiesForRole(role),
      isResolving: isFetchingProjectRole,
    };
  }

  return {
    role: null,
    capabilities: capabilitiesFromPermissions({ checkAccess }),
    isResolving: isFetchingProjectRole,
  };
};

const capabilitiesForRole = (role: PromptFlowRole): WorkflowCapabilities => {
  if (role === 'Viewer') {
    return {
      canViewWorkflowList: true,
      canPublishWorkflow: false,
      canPauseWorkflow: false,
      canResumeWorkflow: false,
      canDeleteWorkflow: false,
    };
  }

  const isAdminOrAbove = role === 'Admin' || role === 'Superadmin';

  return {
    canViewWorkflowList: true,
    canPublishWorkflow: true,
    canPauseWorkflow: true,
    canResumeWorkflow: isAdminOrAbove || !RESTRICT_RESUME_TO_ADMIN,
    canDeleteWorkflow: true,
  };
};

/**
 * Fallback for real (non-fixture) sessions. The platform exposes only a boolean
 * `checkAccess`, never the resolved project-role name, so when we cannot name a
 * PromptFlow role we defer to the platform's own permission checks. This keeps
 * production behaviour byte-identical to upstream rather than inventing a role.
 */
const capabilitiesFromPermissions = ({
  checkAccess,
}: {
  checkAccess: (permission: Permission) => boolean;
}): WorkflowCapabilities => {
  const canWriteFlow = checkAccess(Permission.WRITE_FLOW);
  const canUpdateFlowStatus = checkAccess(Permission.UPDATE_FLOW_STATUS);

  return {
    canViewWorkflowList: checkAccess(Permission.READ_FLOW),
    canPublishWorkflow: canWriteFlow,
    canPauseWorkflow: canUpdateFlowStatus,
    canResumeWorkflow: canUpdateFlowStatus,
    canDeleteWorkflow: canWriteFlow,
  };
};

/**
 * DISPUTED RULE — pending a Product decision (owner: Wee Wei Wen).
 *
 * PRD §8.6.1 grants Builder / Admin / Superadmin full access to publish,
 * unpublish, pause and resume — pause and resume are one permission with a full
 * tick for Builder. A later request asked to restrict RESUME to Admin and
 * above, which contradicts §8.6.1 and leaves a Builder able to stop a live
 * production workflow with no way to restart it (a §6.3 Zero Dead-Ends
 * violation).
 *
 * While this is `true`, `canResumeWorkflow` is false for Builder. Set it to
 * `false` to restore §8.6.1 exactly as written — nothing else reads this flag.
 */
export const RESTRICT_RESUME_TO_ADMIN = true;

/**
 * PromptFlow's role vocabulary. The platform stores different names, so these
 * resolve as follows:
 *   Superadmin -> PlatformRole.ADMIN          (platform-wide admin)
 *   Admin      -> DefaultProjectRole.ADMIN    ('Admin')
 *   Builder    -> DefaultProjectRole.EDITOR   ('Editor')
 *   Viewer     -> DefaultProjectRole.VIEWER   ('Viewer')
 * There is no stored 'Builder' or 'Superadmin' role; do not add one without a
 * migration and a Product decision.
 */
export type PromptFlowRole = 'Superadmin' | 'Admin' | 'Builder' | 'Viewer';

export type WorkflowCapabilities = {
  canViewWorkflowList: boolean;
  canPublishWorkflow: boolean;
  canPauseWorkflow: boolean;
  canResumeWorkflow: boolean;
  canDeleteWorkflow: boolean;
};

export type ResolvedWorkflowCapabilities = {
  role: PromptFlowRole | null;
  capabilities: WorkflowCapabilities;
  isResolving: boolean;
};
