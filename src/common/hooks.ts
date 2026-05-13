import { useEffect, useState } from "react";

export function useDelay(ms: number) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), ms);
        return () => clearTimeout(timer);
    }, [ms]);

    return isReady;
}

export function usePageVisible() {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof document === "undefined") return true;
        return document.visibilityState === "visible";
    });

    useEffect(() => {
        const update = () => setIsVisible(document.visibilityState === "visible");

        document.addEventListener("visibilitychange", update);
        return () => document.removeEventListener("visibilitychange", update);
    }, []);

    return isVisible;
}
