import { useEffect, useRef, useState } from "react";

export function useDelay(ms: number) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), ms);
        return () => clearTimeout(timer);
    }, [ms]);

    return isReady;
}

export function useThrottle<T>(value: T, interval = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastExecuted = useRef<number>(0);

    useEffect(() => {
        if (Date.now() >= lastExecuted.current + interval) {
            lastExecuted.current = Date.now();
            setThrottledValue(value);
        } else {
            const timerId = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval - (Date.now() - lastExecuted.current));

            return () => clearTimeout(timerId);
        }
    }, [value, interval]);

    return throttledValue;
}
