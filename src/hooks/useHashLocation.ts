import { useCallback } from 'react';
import { allowNavigation } from './navigation-guard';
import { navigation, normalizeLocation, useNavigationSnapshot } from './navigation';

const pathOf = (location: string) => location.split('?')[0];
const searchOf = (location: string) => location.includes('?') ? location.slice(location.indexOf('?') + 1) : '';

/** Query string of the accepted location, without `?`. */
export const useHashSearch = () => searchOf(useNavigationSnapshot().location);

/** Remove the query from the current entry (URL cleanup, not a step). */
export function clearHashSearch() {
    navigation.replace(pathOf(navigation.current.location), { closed: true });
}

export interface NavigateOptions { replace?: boolean }

/**
 * Navigate inside the app: ask mounted editors first, then push (or replace)
 * an entry. A no-op for the current location.
 */
export async function navigateTo(to: string, options: NavigateOptions = {}) {
    const next = normalizeLocation(to);
    if (next === navigation.current.location) return false;
    if (!await allowNavigation()) return false;
    if (options.replace) navigation.replace(next);
    else navigation.push(next);
    return true;
}

/** Wouter location hook for `#/path?query` URLs. */
export const useHashLocation = (): [string, (to: string, options?: NavigateOptions) => void] => {
    const { location } = useNavigationSnapshot();
    const navigate = useCallback((to: string, options?: NavigateOptions) => { void navigateTo(to, options); }, []);
    return [pathOf(location), navigate];
};
