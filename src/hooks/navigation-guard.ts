import { confirmAction } from '@/component/v2/confirmation';
export const NAVIGATION_ATTEMPT = 'yuhaiin:navigation-attempt';
export type NavigationAttempt = { message?: string };

/** Collect guards before asking, so pending saves block and drafts share one modal. */
export async function allowNavigation(): Promise<boolean> {
    const detail: NavigationAttempt = {};
    if (!window.dispatchEvent(new CustomEvent(NAVIGATION_ATTEMPT, { cancelable: true, detail }))) return false;
    return detail.message ? confirmAction(detail.message) : true;
}
