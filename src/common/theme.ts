export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "yuhaiin.theme";

export function readThemePreference(): ThemePreference {
    if (typeof window === "undefined") return "system";
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored;
        }
    } catch {
        // ignore storage errors
    }
    return "system";
}

export function writeThemePreference(preference: ThemePreference) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
        // ignore storage errors
    }
}

export function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(preference: ThemePreference, systemTheme: ResolvedTheme = getSystemTheme()): ResolvedTheme {
    return preference === "system" ? systemTheme : preference;
}

export function applyTheme(theme: ResolvedTheme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
}
