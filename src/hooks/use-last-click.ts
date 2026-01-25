
import { useEffect } from "react";

// Singleton to hold the last click position
let lastClickPosition = { x: 0, y: 0 };
let isListening = false;

const updatePosition = (e: MouseEvent) => {
    lastClickPosition = { x: e.clientX, y: e.clientY };
};

export const useLastClickPosition = () => {
    useEffect(() => {
        if (!isListening) {
            window.addEventListener("click", updatePosition, true); // Capture phase to get it before modals
            isListening = true;
        }
        // We don't remove listener because we want a singleton listener for the app life
        // Or we could ref count. For simplicity, one listener is fine.
    }, []);

    return () => lastClickPosition;
};
