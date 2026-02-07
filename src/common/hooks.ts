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
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const nextValue = useRef<T | null>(null);
    const hasNextValue = useRef(false);

    useEffect(() => {
        if (!timeoutRef.current) {
            setThrottledValue(value);
            const timeoutCallback = () => {
                if (hasNextValue.current) {
                    hasNextValue.current = false;
                    setThrottledValue(nextValue.current as T);
                    timeoutRef.current = setTimeout(timeoutCallback, interval);
                } else {
                    timeoutRef.current = undefined;
                }
            };
            timeoutRef.current = setTimeout(timeoutCallback, interval);
        } else {
            nextValue.current = value;
            hasNextValue.current = true;
        }
    }, [value, interval]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledValue;
}
