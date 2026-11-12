import { confirmAction } from '@/component/v2/confirmation';
export const NAVIGATION_ATTEMPT = 'yuhaiin:navigation-attempt';
export type NavigationAttempt = { message?: string };

/**
 * Ask the mounted editors synchronously. `undefined`: nothing to protect.
 * `{}`: a save is pending, block without asking. `{ message }`: ask the user.
 */
export function navigationBlocker(): NavigationAttempt | undefined {
    const detail: NavigationAttempt = {};
    if (!window.dispatchEvent(new CustomEvent(NAVIGATION_ATTEMPT, { cancelable: true, detail }))) return {};
    return detail.message ? detail : undefined;
}

/** Collect guards before asking, so pending saves block and drafts share one modal. */
export async function allowNavigation(): Promise<boolean> {
    const block = navigationBlocker();
    if (!block) return true;
    return block.message ? confirmAction(block.message) : false;
}
