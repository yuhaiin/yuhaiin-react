import { useEffect, useRef, useState } from "react";

export function useDelay(ms: number) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), ms);
        return () => clearTimeout(timer);
    }, [ms]);

    return isReady;
}

export function useThrottle<T>(value: T, interval: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastUpdated = useRef<number>(Date.now());

    useEffect(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdated.current;

        if (timeSinceLastUpdate >= interval) {
            setThrottledValue(value);
            lastUpdated.current = now;
        } else {
            const id = setTimeout(() => {
                setThrottledValue(value);
                lastUpdated.current = Date.now();
            }, interval - timeSinceLastUpdate);
            return () => clearTimeout(id);
        }
    }, [value, interval]);

    return throttledValue;
}
