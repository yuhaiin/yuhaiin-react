
import { useCallback, useEffect } from "react";

// Singleton to hold the last click position
let lastClickPosition = { x: 0, y: 0 };
let listenerCount = 0;

const updatePosition = (e: MouseEvent) => {
    lastClickPosition = { x: e.clientX, y: e.clientY };
};

export const useLastClickPosition = () => {
    useEffect(() => {
        if (listenerCount === 0) {
            window.addEventListener("click", updatePosition, true); // Capture phase to get it before modals
        }
        listenerCount += 1;

        return () => {
            listenerCount -= 1;
            if (listenerCount === 0) {
                window.removeEventListener("click", updatePosition, true);
            }
        };
    }, []);

    return useCallback(() => lastClickPosition, []);
};
