import { allowNavigation } from './navigation-guard';
import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";

// returns the current hash location (minus the # symbol)
const normalizeLocation = (location: string) => {
  const queryAt = location.indexOf('?');
  const path = queryAt < 0 ? location : location.slice(0, queryAt);
  const search = queryAt < 0 ? '' : location.slice(queryAt);
  return `${path.replace(/\/+$/, '') || '/'}${search}`;
};
const currentLocation = () => normalizeLocation(window.location.hash.replace(/^#/, '') || '/');

const LOCATION_ACCEPTED = 'yuhaiin:hash-location-accepted';
let acceptedLocation = currentLocation();
const subscribeSearch = (listener: () => void) => {
  window.addEventListener(LOCATION_ACCEPTED, listener);
  return () => window.removeEventListener(LOCATION_ACCEPTED, listener);
};
export const useHashSearch = () => useSyncExternalStore(subscribeSearch,
  () => acceptedLocation.includes('?') ? acceptedLocation.slice(acceptedLocation.indexOf('?') + 1) : '', () => '');

/** Closing a resource editor clears only its query; other drafts on the page stay mounted. */
export function clearHashSearch() {
  acceptedLocation = currentLocation().split('?')[0];
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${acceptedLocation}`);
  window.dispatchEvent(new Event(LOCATION_ACCEPTED));
}

export const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(() => { acceptedLocation = currentLocation(); return acceptedLocation; });

  const accepted = useRef<string | null>(null);
  const current = useRef(loc);
  useEffect(() => {
    // handler for when the hash changes
    const handler = () => {
      const next = currentLocation();
      if (next === current.current) return;
      const approved = accepted.current === next;
      accepted.current = null;
      if (!approved && !allowNavigation()) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${current.current}`);
        return;
      }
      current.current = next;
      acceptedLocation = next;
      setLoc(next);
      window.dispatchEvent(new Event(LOCATION_ACCEPTED));
    };

    const syncAccepted = () => {
      current.current = acceptedLocation;
      accepted.current = null;
      setLoc(acceptedLocation);
    };
    window.addEventListener(LOCATION_ACCEPTED, syncAccepted);
    // subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => { window.removeEventListener("hashchange", handler); window.removeEventListener(LOCATION_ACCEPTED, syncAccepted); };
  }, []);

  const navigate = useCallback((to: string) => {
    const next = normalizeLocation(to);
    if (next === current.current || !allowNavigation()) return;
    accepted.current = next;
    window.location.hash = next;
  }, []);

  return [loc.split('?')[0].replace(/\/+$/, '') || '/', navigate];
};
