import { Permission } from '@activepieces/shared';

import { authenticationSession } from './authentication-session';

export const routesThatRequireProjectId = {
  dashboard: '/dashboard',
  dashboardRnd: '/dashboard-rnd',
  runs: '/runs',
  singleRun: '/runs/:runId',
  flows: '/flows',
  singleFlow: '/flows/:flowId',
  automations: '/automations',
  connections: '/connections',
  singleConnection: '/connections/:connectionId',
  tables: '/tables',
  singleTable: '/tables/:tableId',
  settings: '/settings',
  releases: '/releases',
  singleRelease: '/releases/:releaseId',
};

export const determineDefaultRoute = (
  _checkAccess: (permission: Permission) => boolean,
) => {
  return authenticationSession.appendProjectRoutePrefix('/dashboard');
};

export const NEW_FLOW_QUERY_PARAM = 'newFlow';
export const NEW_TABLE_QUERY_PARAM = 'newTable';
