export const NAVIGATION_ATTEMPT = 'yuhaiin:navigation-attempt';

/** Editors share one confirmation per navigation, even on pages with several forms. */
export function allowNavigation(): boolean {
    return window.dispatchEvent(new CustomEvent(NAVIGATION_ATTEMPT, {
        cancelable: true, detail: { confirmed: false },
    }));
}
