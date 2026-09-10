import { isNil } from '@activepieces/shared';
import { t } from 'i18next';

import type { PromptFlowRole } from '@/features/automations/lib/workflow-capabilities';
import { projectCollectionUtils } from '@/features/projects/stores/project-collection';

/**
 * UI-TESTING FIXTURE — local development only.
 *
 * This is NOT an implementation of PRD §8.6 RBAC. It maps a local project name
 * to a PromptFlow role so the Workflow List's role-gated lifecycle controls can
 * be walked through by hand.
 *
 * It exists because local dev runs Community edition, where
 * `useAuthorization().checkAccess` returns true for every permission and the
 * project-role endpoint is not registered at all — so real per-project roles
 * cannot be exercised locally by any means.
 *
 * It touches no auth, no RBAC and no production code path. It is read in
 * exactly one place (`useWorkflowCapabilities`) and only when
 * `import.meta.env.DEV` is true, so it is tree-shaken out of production builds.
 *
 * Deliberate scope choice: this fixture does NOT fake workflow rows. The
 * workflows shown are the project's real workflows, because a fake flow has no
 * server row and therefore could not actually be paused — which would make
 * verifying the pause flow meaningless. Seed real workflows in the three
 * lifecycle states instead.
 */
export const useDevProjectRole = (): PromptFlowRole | null => {
  const { project } = projectCollectionUtils.useCurrentProject();

  if (!import.meta.env.DEV || isNil(project)) {
    return null;
  }

  // project.displayName, not getProjectName(): the latter overrides a PERSONAL
  // project's name to the literal 'Personal Project', which would never match.
  return promptFlowRoleFixture.roleForProjectName({
    projectName: project.displayName,
  });
};

/**
 * Unobtrusive badge showing which role is active, so it is obvious during a
 * walkthrough. Renders nothing outside dev or for an unmapped project.
 */
export const DevProjectRoleBadge = () => {
  const role = useDevProjectRole();

  if (isNil(role)) {
    return null;
  }

  return (
    <span
      className="shrink-0 rounded-sm border border-border px-1 py-px text-[10px] font-medium leading-none text-muted-foreground"
      title={t('Dev fixture: simulated role for this project')}
    >
      {role}
    </span>
  );
};

const roleForProjectName = ({
  projectName,
}: {
  projectName: string;
}): PromptFlowRole | null => {
  const match = DEV_PROJECT_ROLES.find(
    (entry) =>
      entry.projectName.toLowerCase() === projectName.trim().toLowerCase(),
  );
  return match?.role ?? null;
};

/**
 * The two projects the walkthrough uses. Keyed by project display name, so
 * naming a local project "Trudax" or "SISS" is all that is needed.
 *
 * Local caveat: this dev plan caps TEAM projects at one — creating a second
 * returns 402 FEATURE_DISABLED. So both names cannot exist at once here. To
 * walk through both roles, either rename the single team project between the
 * two, or add your personal project's displayName as an extra entry.
 */
export const DEV_PROJECT_ROLES: DevProjectRole[] = [
  { projectName: 'Trudax', role: 'Admin' },
  { projectName: 'SISS', role: 'Builder' },
  // The stock dev seed's personal project, so a fresh checkout has an
  // Admin-side project to switch against without renaming anything.
  { projectName: "dev's Platform's Project", role: 'Admin' },
];

export const promptFlowRoleFixture = { roleForProjectName };

export type DevProjectRole = {
  projectName: string;
  role: PromptFlowRole;
};
