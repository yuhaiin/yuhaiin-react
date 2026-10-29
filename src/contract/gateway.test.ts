import { expect, it } from 'vitest';
import { flattenWorkspace, groupWorkspace, newGateway } from './gateway';

it('retains the imported Gateway safety guard through the workspace editor', () => {
  const gateway = { ...newGateway(), id: 'g', enabled: false, rejectWhenDisabled: true };
  const workspace = groupWorkspace({ revision: 1, gateways: [gateway], rules: [], upstreams: [], interceptions: [], filterLists: [] });
  expect(workspace.gateways[0].rejectWhenDisabled).toBe(true);
  expect(flattenWorkspace(workspace).gateways[0]).toMatchObject({ id: 'g', enabled: false, rejectWhenDisabled: true });
});
