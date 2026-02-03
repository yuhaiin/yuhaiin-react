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
    const latestValue = useRef(value);

    // Capture the latest value on every render without triggering effects
    useEffect(() => {
        latestValue.current = value;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setThrottledValue(latestValue.current);
        }, interval);

        return () => clearInterval(timer);
    }, [interval]);

    return throttledValue;
}
