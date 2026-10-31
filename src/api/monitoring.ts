import { requestJSON } from './client';
import type { Go } from './generated-contracts';
export const getMonitoring = (): Promise<Go.node.MonitoringStatus> => requestJSON('GET', '/api/v2/nodes/monitoring');
export const saveMonitoring = (config: Go.node.MonitoringConfig): Promise<Go.node.MonitoringStatus> => requestJSON('PUT', '/api/v2/nodes/monitoring', config);
