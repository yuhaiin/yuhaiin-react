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

function getInitialPreference(): ThemePreference {
    return readThemePreference();
}

function getInitialResolved(preference: ThemePreference): ResolvedTheme {
    return resolveTheme(preference, getSystemTheme());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
    const [resolved, setResolved] = useState<ResolvedTheme>(() => getInitialResolved(getInitialPreference()));

    useEffect(() => {
        applyTheme(resolved);
    }, [resolved]);

    useEffect(() => {
        if (preference !== "system" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (evt: MediaQueryListEvent) => {
            const next = evt.matches ? "dark" : "light";
            applyTheme(next);
            setResolved(next);
        };
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, [preference]);

    const setPreference = useCallback((next: ThemePreference) => {
        writeThemePreference(next);
        setPreferenceState(next);
        const nextResolved = resolveTheme(next, getSystemTheme());
        applyTheme(nextResolved);
        setResolved(nextResolved);
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({
        preference,
        resolved,
        setPreference,
        ready: true,
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
