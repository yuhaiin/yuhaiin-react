"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    applyTheme,
    getSystemTheme,
    readThemePreference,
    resolveTheme,
    writeThemePreference,
    type ResolvedTheme,
    type ThemePreference,
} from "./theme";

type ThemeContextValue = {
    preference: ThemePreference;
    resolved: ResolvedTheme;
    setPreference: (preference: ThemePreference) => void;
    ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>("system");
    const [resolved, setResolved] = useState<ResolvedTheme | undefined>(undefined);

    useEffect(() => {
        const initialPreference = readThemePreference();
        const initialResolved = resolveTheme(initialPreference, getSystemTheme());
        setPreferenceState(initialPreference);
        setResolved(initialResolved);
        applyTheme(initialResolved);
    }, []);

    useEffect(() => {
        if (!resolved || preference !== "system" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (evt: MediaQueryListEvent) => {
            const next = evt.matches ? "dark" : "light";
            applyTheme(next);
            setResolved(next);
        };
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, [preference, resolved]);

    const setPreference = useCallback((next: ThemePreference) => {
        writeThemePreference(next);
        setPreferenceState(next);
        const nextResolved = resolveTheme(next, getSystemTheme());
        applyTheme(nextResolved);
        setResolved(nextResolved);
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({
        preference,
        resolved: resolved ?? "light",
        setPreference,
        ready: resolved !== undefined,
    }), [preference, resolved, setPreference]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}
