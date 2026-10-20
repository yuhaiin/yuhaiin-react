import { requestJSON } from './client';
import {
    normalizeTrafficControl,
    type TrafficControlConfig,
    type TrafficStatus,
} from '@/contract/traffic-control';

export async function getTrafficControl(): Promise<TrafficControlConfig> {
    return normalizeTrafficControl(
        await requestJSON<TrafficControlConfig>(
            'GET',
            '/api/v2/traffic-control',
        ),
    );
}
export async function putTrafficControl(
    config: TrafficControlConfig,
): Promise<TrafficControlConfig> {
    return normalizeTrafficControl(
        await requestJSON<TrafficControlConfig>(
            'PUT',
            '/api/v2/traffic-control',
            config,
        ),
    );
}
export function getTrafficStatus(): Promise<TrafficStatus> {
    return requestJSON<TrafficStatus>('GET', '/api/v2/traffic-control/status');
}
