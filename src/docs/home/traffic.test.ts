import { describe, expect, it } from 'vitest';
import { Flow } from '../connections/components';
import { appendTrafficSample, type LiveTraffic } from './traffic';

describe('live traffic retention', () => {
    it('bounds both series when the expired upload is the peak', () => {
        let state: LiveTraffic = { labels: [], upload: [], download: [], rawMax: 0 };
        for (let index = 0; index < 10000; index++) {
            state = appendTrafficSample(state, new Flow(0, 1, 0, 100));
        }
        expect(state.labels).toHaveLength(120);
        expect(state.upload).toHaveLength(120);
        expect(state.download).toHaveLength(120);
    });

    it('expires old peaks without mutating previous samples', () => {
        const original = { labels: ['old'], upload: [200], download: [300], rawMax: 300 };
        const result = appendTrafficSample(original, new Flow(0, 2, 0, 3), 1);
        expect(result.upload).toEqual([3]);
        expect(result.download).toEqual([2]);
        expect(result.rawMax).toBe(3);
        expect(original.download).toEqual([300]);
    });
});
